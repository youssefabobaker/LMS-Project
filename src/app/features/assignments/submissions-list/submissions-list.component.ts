import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AssignmentSubmissionService } from '../../../core/services/assignment-submission.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { PermissionService } from '../../../core/services/permission.service';
import { AssignmentResponseDto, AssignmentSubmissionResponseDto } from '../../../models/assignment.model';

import { GradeSubmissionModalComponent } from '../grade-submission-modal/grade-submission-modal.component';

@Component({
  selector: 'app-submissions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, GradeSubmissionModalComponent],
  templateUrl: './submissions-list.component.html',
  styleUrl: './submissions-list.component.css'
})
export class SubmissionsListComponent implements OnInit {
  assignmentId!: number;
  courseId!: number;
  assignment?: AssignmentResponseDto;
  submissions: AssignmentSubmissionResponseDto[] = [];
  isLoading = false;
  loadError = '';
  canGrade = false;

  constructor(
    private route: ActivatedRoute,
    private submissionService: AssignmentSubmissionService,
    private assignmentService: AssignmentService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.canGrade = this.permissionService.hasPermission('Ass:Grade');
    this.route.params.subscribe(params => {
      this.assignmentId = +params['id'];
      this.courseId = +params['courseId'];
      if (this.assignmentId) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin([
      this.assignmentService.getAssignmentById(this.assignmentId),
      this.submissionService.getSubmissionsForAssignment(this.assignmentId)
    ]).subscribe({
      next: ([assignment, submissions]) => {
        // Fix Assignment Due Date
        if (assignment.dueDate && !assignment.dueDate.endsWith('Z') && !assignment.dueDate.includes('+')) {
          assignment.dueDate += 'Z';
        }
        
        // Fix Submissions dates
        submissions = submissions.map(sub => {
          if (sub.submittedAt && !sub.submittedAt.endsWith('Z') && !sub.submittedAt.includes('+')) {
            sub.submittedAt += 'Z';
          }
          return sub;
        });

        this.assignment = assignment;
        this.submissions = submissions;
        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = 'Failed to load submissions. Please try again.';
        this.isLoading = false;
      }
    });
  }

  selectedSubmission?: AssignmentSubmissionResponseDto;

  openGradeModal(submission: AssignmentSubmissionResponseDto): void {
    this.selectedSubmission = submission;
    const el = document.getElementById('gradeSubmissionModal');
    if (el) {
      (window as any).bootstrap.Modal.getOrCreateInstance(el).show();
    }
  }

  closeGradeModal(): void {
    const el = document.getElementById('gradeSubmissionModal');
    if (el) {
      (window as any).bootstrap.Modal.getOrCreateInstance(el).hide();
    }
    this.selectedSubmission = undefined;
  }

  onGradeSaved(updated: AssignmentSubmissionResponseDto): void {
    const index = this.submissions.findIndex(s => s.id === updated.id);
    if (index !== -1) {
      this.submissions[index] = updated;
    }
    this.closeGradeModal();
  }

  openAttachment(url: string): void {
    window.open(url, '_blank');
  }

  isLate(submission: AssignmentSubmissionResponseDto): boolean {
    if (!this.assignment) return false;
    return new Date(submission.submittedAt) > new Date(this.assignment.dueDate);
  }

  goBack(): void {
  window.history.back();
}
}
