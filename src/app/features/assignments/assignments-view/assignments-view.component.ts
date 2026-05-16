import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { AssignmentService } from '../../../core/services/assignment.service';
import { PermissionService } from '../../../core/services/permission.service';
import { AssignmentSubmissionService } from '../../../core/services/assignment-submission.service';
import {
  AssignmentResponseDto,
  AssignmentSubmissionResponseDto,
} from '../../../models/assignment.model';
import { AssignmentAddComponent } from '../assignment-add/assignment-add.component';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assignments-view',
  standalone: true,
  imports: [CommonModule, FormsModule, AssignmentAddComponent, RouterModule],
  templateUrl: './assignments-view.component.html',
  styleUrl: './assignments-view.component.css',
})
export class AssignmentsViewComponent implements OnInit {
  @Input() courseId!: number;

  assignmentsList: AssignmentResponseDto[] = [];
  isLoading = false;
  loadError = '';

  canAddOrUpdate = false;
  canDelete = false;
  canSubmit = false;
  canReadAll = false;

  selectedAssignment?: AssignmentResponseDto;

  constructor(
    private assignmentService: AssignmentService,
    private permissionService: PermissionService,
    private submissionService: AssignmentSubmissionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.canAddOrUpdate =
      this.permissionService.hasPermission('Ass:addOrUpdate');
    this.canDelete = this.permissionService.hasPermission('Ass:delete');
    this.canSubmit = this.permissionService.hasPermission('Ass:solve');
    this.canReadAll = this.permissionService.hasPermission(
      'AssSubmission:readAll',
    );

    if (this.courseId) {
      this.loadData();
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.loadError = '';

    this.assignmentService.getAssignmentsByCourseId(this.courseId).subscribe({
      next: (assignments) => {
        this.assignmentsList = assignments.map(a => this.fixDate(a));
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.assignmentsList = [];
        } else {
          this.loadError = 'Failed to load data. Please try again.';
        }
        this.isLoading = false;
      },
    });
  }



  // ── Navigation ───────────────────────────────────────────────

  navigateToDetail(id: number): void {
    this.router.navigate(['/dashboard/courses', this.courseId, 'assignments', id]);
  }

  // ── Inline Edit ───────────────────────────────────────────────

  editingIds = new Set<number>();
  editFormData = new Map<
    number,
    { title: string; description: string; dueDate: string; totalMarks: number }
  >();

  startEdit(item: AssignmentResponseDto): void {
    this.editingIds.add(item.id);

    // Format dueDate to 'YYYY-MM-DDThh:mm' for datetime-local input
    let formattedDueDate = '';
    if (item.dueDate) {
      const d = new Date(item.dueDate);
      formattedDueDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }

    this.editFormData.set(item.id, {
      title: item.title,
      description: item.description,
      dueDate: formattedDueDate,
      totalMarks: item.totalMarks,
    });
  }

  cancelEdit(id: number): void {
    this.editingIds.delete(id);
    this.editFormData.delete(id);
  }

  saveEdit(id: number): void {
    const data = this.editFormData.get(id);
    if (
      !data ||
      !data.title.trim() ||
      !data.description.trim() ||
      !data.dueDate ||
      data.totalMarks < 0
    ) {
      Swal.fire(
        'Validation Error',
        'Please fill in all required fields properly.',
        'warning',
      );
      return;
    }

    const payload = {
      id: id,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate).toISOString(),
      totalMarks: data.totalMarks,
    };

    this.assignmentService
      .createOrUpdateAssignment(this.courseId, payload)
      .subscribe({
        next: (updatedItem) => {
          const fixedItem = this.fixDate(updatedItem);
          const index = this.assignmentsList.findIndex((a) => a.id === id);
          if (index !== -1) {
            this.assignmentsList[index] = fixedItem;
          }
          this.editingIds.delete(id);
          this.editFormData.delete(id);
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: 'Assignment updated.',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Could not update assignment. Please try again.',
            confirmButtonColor: '#41B3E3',
          });
        },
      });
  }

  async deleteAssignment(id: number): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Assignment?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      cancelButtonColor: '#41B3E3',
      confirmButtonText: 'Yes, delete it',
    });

    if (!result.isConfirmed) return;

    this.assignmentService.deleteAssignment(id).subscribe({
      next: () => {
        this.assignmentsList = this.assignmentsList.filter((a) => a.id !== id);
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Assignment deleted.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Could not delete this assignment. Please try again.',
          confirmButtonColor: '#41B3E3',
        });
      },
    });
  }

  // ── Add Assignment Modal ──────────────────────────────────────────────────

  openAddModal(): void {
    const el = document.getElementById('assignmentAddModal');
    if (el) {
      (window as any).bootstrap.Modal.getOrCreateInstance(el).show();
    }
  }

  closeAddModal(): void {
    const el = document.getElementById('assignmentAddModal');
    if (el) {
      (window as any).bootstrap.Modal.getOrCreateInstance(el).hide();
    }
  }

  onAssignmentCreated(newItem: AssignmentResponseDto): void {
    const fixedItem = this.fixDate(newItem);
    this.assignmentsList = [...this.assignmentsList, fixedItem];
    this.closeAddModal();
  }

  private fixDate(item: AssignmentResponseDto): AssignmentResponseDto {
    if (item.dueDate && !item.dueDate.endsWith('Z') && !item.dueDate.includes('+')) {
      return { ...item, dueDate: item.dueDate + 'Z' };
    }
    return item;
  }
}
