import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import Swal from 'sweetalert2';

import { AssignmentService } from '../../../core/services/assignment.service';
import { AssignmentResponseDto } from '../../../models/assignment.model';
import { StagedFile } from '../../../models/content';

@Component({
  selector: 'app-assignment-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-add.component.html',
  styleUrls: ['./assignment-add.component.css'],
})
export class AssignmentAddComponent {
  @Input() courseId!: number;
  @Output() assignmentCreated = new EventEmitter<AssignmentResponseDto>();
  @Output() modalDismissed = new EventEmitter<void>();

  // ── Form State ─────────────────────────────────────────────────────────────
  @ViewChild('titleInput')   titleInput?:   NgModel;
  @ViewChild('descInput')    descInput?:    NgModel;
  @ViewChild('dueDateInput') dueDateInput?: NgModel;
  @ViewChild('marksInput')   marksInput?:   NgModel;

  title       = '';
  description = '';
  dueDate     = '';
  totalMarks: number | null = null;
  stagedFiles: StagedFile[] = [];

  // ── Submission State ───────────────────────────────────────────────────────
  isSubmitting      = false;
  submitError       = '';
  retryMode         = false;
  createdAssignmentId: number | null = null;
  private step1Result: AssignmentResponseDto | null = null;

  constructor(private assignmentService: AssignmentService) {}

  // ── File Selection ─────────────────────────────────────────────────────────

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      const allowed = file.type === 'application/pdf' || file.type === 'video/mp4';
      const withinSize = file.size <= 524_288_000; // 500 MB

      if (!allowed) {
        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'warning',
          title: `"${file.name}" is not a supported file type (PDF or MP4 only).`,
          showConfirmButton: false, timer: 4000,
        });
        return;
      }
      if (!withinSize) {
        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'warning',
          title: `"${file.name}" exceeds 500 MB and was not added.`,
          showConfirmButton: false, timer: 4000,
        });
        return;
      }
      this.stagedFiles.push({ file, name: file.name, size: file.size, mimeType: file.type });
    });

    input.value = '';
  }

  removeFile(index: number): void {
    this.stagedFiles.splice(index, 1);
  }

  formatSize(bytes: number): string {
    if (bytes < 1_024)     return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  }

  getFileIcon(mimeType: string): string {
    if (mimeType === 'application/pdf') return 'bi bi-file-earmark-pdf-fill file-icon-pdf';
    if (mimeType === 'video/mp4')       return 'bi bi-play-circle-fill file-icon-video';
    return 'bi bi-file-earmark-fill';
  }

  // ── Submission Flow ────────────────────────────────────────────────────────

  submit(titleInput?: NgModel, descInput?: NgModel, dueDateInput?: NgModel, marksInput?: NgModel): void {
    // Mark all fields touched so validation errors appear
    titleInput?.control.markAsTouched();
    descInput?.control.markAsTouched();
    dueDateInput?.control.markAsTouched();
    marksInput?.control.markAsTouched();

    if (!this.title.trim() || !this.description.trim() || !this.dueDate || !this.totalMarks || this.totalMarks <= 0) return;

    // Non-blocking past-date warning
    if (new Date(this.dueDate) < new Date()) {
      Swal.fire({
        toast: true, position: 'bottom-end', icon: 'warning',
        title: 'Note: Due date is in the past.',
        showConfirmButton: false, timer: 4000,
      });
    }

    this.isSubmitting = true;
    this.submitError  = '';

    const dueDateIso = new Date(this.dueDate).toISOString();

    this.assignmentService.createOrUpdateAssignment(this.courseId, {
      id: 0,
      title: this.title.trim(),
      description: this.description.trim(),
      dueDate: dueDateIso,
      totalMarks: this.totalMarks,
    }).subscribe({
      next: (created) => {
        this.createdAssignmentId = created.id;
        this.step1Result = created;

        if (this.stagedFiles.length === 0) {
          this.emitSuccess(created);
        } else {
          this.addAttachmentsStep(created.id);
        }
      },
      error: (err) => {
        this.submitError = err?.error?.message || 'Failed to create assignment. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  addAttachmentsStep(assignmentId: number): void {
    const files = this.stagedFiles.map(sf => sf.file);

    this.assignmentService.addAttachments(assignmentId, files).subscribe({
      next: (updated) => {
        this.emitSuccess(updated);
      },
      error: (err) => {
        this.retryMode   = true;
        this.submitError = err?.error?.message || 'Files could not be uploaded. The assignment was created, but attachments were not saved.';
        this.isSubmitting = false;
        // Step 1 result is still emitted so the card appears in the list
        if (this.step1Result) {
          this.assignmentCreated.emit(this.step1Result);
        }
      },
    });
  }

  retryUpload(): void {
    if (!this.createdAssignmentId || !this.retryMode) return;
    this.isSubmitting = true;
    this.submitError  = '';
    this.retryMode    = false;
    this.addAttachmentsStep(this.createdAssignmentId);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private emitSuccess(item: AssignmentResponseDto): void {
    Swal.fire({
      toast: true, position: 'bottom-end', icon: 'success',
      title: 'Assignment created successfully.',
      showConfirmButton: false, timer: 3000, timerProgressBar: true,
    });
    this.assignmentCreated.emit(item);
    this.resetForm();
  }

  resetForm(): void {
    this.title              = '';
    this.description        = '';
    this.dueDate            = '';
    this.totalMarks         = null;
    this.stagedFiles        = [];
    this.isSubmitting       = false;
    this.submitError        = '';
    this.retryMode          = false;
    this.createdAssignmentId = null;
    this.step1Result        = null;

    this.titleInput?.control?.markAsUntouched();
    this.descInput?.control?.markAsUntouched();
    this.dueDateInput?.control?.markAsUntouched();
    this.marksInput?.control?.markAsUntouched();
  }

  cancel(): void {
    this.resetForm();
    this.modalDismissed.emit();
  }
}
