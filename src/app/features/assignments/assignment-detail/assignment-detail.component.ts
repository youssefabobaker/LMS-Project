import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  AssignmentResponseDto,
  AssignmentSubmissionResponseDto,
} from '../../../models/assignment.model';
import { AssignmentService } from '../../../core/services/assignment.service';
import { AssignmentSubmissionService } from '../../../core/services/assignment-submission.service';
import { PermissionService } from '../../../core/services/permission.service';
import { SubmissionAddEditComponent } from '../submission-add-edit/submission-add-edit.component';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SubmissionAddEditComponent],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.css',
})
export class AssignmentDetailComponent implements OnInit {
  assignmentId!: number;
  courseId!: number;
  assignment?: AssignmentResponseDto;
  submission?: AssignmentSubmissionResponseDto;

  isLoading: boolean = false;
  loadError: string = '';

  canSubmit: boolean = false;
  canReadAll: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private assignmentService: AssignmentService,
    private submissionService: AssignmentSubmissionService,
    private permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.canSubmit = this.permissionService.hasPermission('Ass:solve');
    this.canReadAll = this.permissionService.hasPermission(
      'AssSubmission:readAll',
    );

    this.route.paramMap.subscribe((params) => {
      const idStr = params.get('id');
      const courseIdStr = params.get('courseId');
      if (idStr) {
        this.assignmentId = +idStr;
        this.courseId = +(courseIdStr ?? 0);
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.loadError = '';

    this.assignmentService.getAssignmentById(this.assignmentId).subscribe({
      next: (res) => {
        if (res.dueDate && !res.dueDate.endsWith('Z') && !res.dueDate.includes('+')) {
          res.dueDate += 'Z';
        }
        this.assignment = res;
        if (this.canSubmit) {
          this.loadSubmission();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.loadError = 'Failed to load assignment details.';
        this.isLoading = false;
      },
    });
  }

  loadSubmission(): void {
    this.submissionService.getStudentSubmissions().subscribe({
      next: (subs) => {
        this.submission = subs.find(
          (s) => s.assignmentId === this.assignmentId,
        );
        this.isLoading = false;
      },
      error: () => {
        // Failing to fetch student submission just means not displaying it
        this.isLoading = false;
      },
    });
  }

  unsubmit(): void {
    if (!this.submission) return;
    const submissionId = this.submission.id;

    Swal.fire({
      title: 'Unsubmit?',
      text: "Unsubmit to add or change attachments. Don't forget to resubmit once you're done.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      cancelButtonColor: '#41B3E3',
      confirmButtonText: 'Yes, unsubmit',
    }).then((result) => {
      if (result.isConfirmed) {
        this.submissionService.deleteSubmission(submissionId).subscribe({
          next: () => {
            this.submission = undefined;
            Swal.fire({
              toast: true,
              position: 'bottom-end',
              icon: 'success',
              title: 'Submission removed.',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Could not unsubmit. Please try again.',
              confirmButtonColor: '#41B3E3',
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  getSubmissionState(): 'none' | 'submitted' | 'graded' {
    if (!this.submission) return 'none';
    return this.submission.grade !== null ? 'graded' : 'submitted';
  }

  isMissed(dueDateString: string): boolean {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const now = new Date();
    return dueDate.getTime() < now.getTime();
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'file';
  }

  getAttachmentIcon(contentType: string): string {
    if (!contentType) return 'bi-file-earmark';
    const ct = contentType.toLowerCase();
    if (ct.includes('image')) return 'bi-file-earmark-image';
    if (ct.includes('pdf')) return 'bi-file-earmark-pdf';
    if (ct.includes('video')) return 'bi-file-earmark-play';
    if (ct.includes('audio')) return 'bi-file-earmark-music';
    if (ct.includes('zip') || ct.includes('rar')) return 'bi-file-earmark-zip';
    if (ct.includes('word') || ct.includes('officedocument.wordprocessingml')) return 'bi-file-earmark-word';
    if (ct.includes('excel') || ct.includes('officedocument.spreadsheetml')) return 'bi-file-earmark-excel';
    return 'bi-file-earmark';
  }

  openAttachment(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  openSubmissionModal(): void {
    const el = document.getElementById('detailSubmissionModal');
    if (el) {
      (window as any).bootstrap.Modal.getOrCreateInstance(el).show();
    }
  }

  closeSubmissionModal(): void {
    const el = document.getElementById('detailSubmissionModal');
    if (el) {
      (window as any).bootstrap.Modal.getOrCreateInstance(el).hide();
    }
  }

  onSubmissionSaved(updatedSub: AssignmentSubmissionResponseDto): void {
    this.submission = updatedSub;
    this.closeSubmissionModal();
  }
}
