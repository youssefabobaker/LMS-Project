import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentSubmissionService } from '../../../core/services/assignment-submission.service';
import { AssignmentResponseDto, AssignmentSubmissionResponseDto } from '../../../models/assignment.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-submission-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submission-add-edit.component.html',
  styleUrl: './submission-add-edit.component.css'
})
export class SubmissionAddEditComponent implements OnChanges {
  @Input() assignment!: AssignmentResponseDto;
  @Input() existingSubmission?: AssignmentSubmissionResponseDto;
  @Output() submissionSaved = new EventEmitter<AssignmentSubmissionResponseDto>();
  @Output() modalDismissed = new EventEmitter<void>();

  textSubmission = '';
  selectedFiles: File[] = [];
  isSubmitting = false;
  submitError = '';
  retryMode = false;
  submittedOnce = false;

  constructor(private submissionService: AssignmentSubmissionService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingSubmission'] && this.existingSubmission) {
      this.textSubmission = this.existingSubmission.textSubmission || '';
    } else if (!this.existingSubmission) {
      this.textSubmission = '';
      this.selectedFiles = [];
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.selectedFiles = Array.from(files);
  }

  submit(): void {
    this.submittedOnce = true;
    if (!this.textSubmission || !this.textSubmission.trim()) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    if (this.existingSubmission && !this.retryMode) {
      // Delete old submission then create new one
      this.submissionService.deleteSubmission(this.existingSubmission.id).subscribe({
        next: () => {
          this.retryMode = true; // Set to true so if creation fails, retry goes here
          this.createNewSubmission();
        },
        error: (err) => {
          this.submitError = 'Failed to delete the existing submission. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.createNewSubmission();
    }
  }

  private createNewSubmission(): void {
    this.submissionService.submitAssignment(
      this.assignment.id,
      this.textSubmission,
      this.selectedFiles
    ).subscribe({
      next: (res) => {
        this.submissionSaved.emit(res);
        this.isSubmitting = false;
        
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Assignment submitted successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        this.reset();
      },
      error: (err) => {
        if (this.retryMode) {
          this.submitError = 'The previous submission was deleted, but the new submission could not be added. Please try again or close the modal.';
        } else {
          this.submitError = 'Failed to submit. Please try again.';
        }
        this.isSubmitting = false;
      }
    });
  }

  retrySubmit(): void {
    this.isSubmitting = true;
    this.submitError = '';
    this.createNewSubmission();
  }

  getFileIcon(type: string): string {
    const ct = type.toLowerCase();
    if (ct.includes('pdf'))   return 'bi-file-earmark-pdf-fill text-danger';
    if (ct.includes('video')) return 'bi-play-circle-fill text-primary';
    if (ct.includes('image')) return 'bi-file-earmark-image-fill text-success';
    if (ct.includes('audio')) return 'bi-file-earmark-music-fill text-info';
    if (ct.includes('zip') || ct.includes('rar')) return 'bi-file-earmark-zip-fill text-warning';
    return 'bi-file-earmark-fill';
  }

  formatSize(size: number): string {
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  cancel(): void {
    this.modalDismissed.emit();
    this.reset();
  }

  reset(): void {
    this.textSubmission = '';
    this.selectedFiles = [];
    this.submitError = '';
    this.submittedOnce = false;
  }
}
