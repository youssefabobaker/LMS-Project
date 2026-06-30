import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentSubmissionService } from '../../../core/services/assignment-submission.service';
import { AssignmentSubmissionResponseDto } from '../../../models/assignment.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-grade-submission-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grade-submission-modal.component.html',
  styleUrl: './grade-submission-modal.component.css'
})
export class GradeSubmissionModalComponent implements OnChanges {
  @Input() submission!: AssignmentSubmissionResponseDto;
  @Input() assignmentTotalMarks: number = 100; // Default or passed from parent
  @Output() gradeSaved = new EventEmitter<AssignmentSubmissionResponseDto>();
  @Output() modalDismissed = new EventEmitter<void>();

  grade: number | null = null;
  feedback = '';
  isSubmitting = false;
  submitError = '';

  constructor(private submissionService: AssignmentSubmissionService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['submission'] && this.submission) {
      this.grade = this.submission.grade !== undefined ? this.submission.grade : null;
      this.feedback = this.submission.feedback || '';
    }
  }

  submit(): void {
    if (this.grade === null || this.grade < 0) {
      this.submitError = 'Grade must be a positive number.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    this.submissionService.gradeSubmission(this.submission.id, { grade: this.grade, feedback: this.feedback }).subscribe({
      next: (res) => {
        this.gradeSaved.emit(res);
        this.isSubmitting = false;
        
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Grade published successfully.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: false,
        });

        this.reset();
      },
      error: (err) => {
        this.submitError = 'Failed to save grade. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.modalDismissed.emit();
    this.reset();
  }

  reset(): void {
    this.grade = null;
    this.feedback = '';
    this.submitError = '';
  }
}
