import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../core/services/assignment.service';
import { PermissionService } from '../../../core/services/permission.service';
import { AssignmentResponseDto } from '../../../models/assignment.model';
import { AssignmentAddComponent } from '../assignment-add/assignment-add.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assignments-view',
  standalone: true,
  imports: [CommonModule, FormsModule, AssignmentAddComponent],
  templateUrl: './assignments-view.component.html',
  styleUrl: './assignments-view.component.css'
})
export class AssignmentsViewComponent implements OnInit {
  @Input() courseId!: number;

  assignmentsList: AssignmentResponseDto[] = [];
  isLoading = false;
  loadError = '';

  canAddOrUpdate = false;
  canDelete = false;

  constructor(
    private assignmentService: AssignmentService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.canAddOrUpdate = this.permissionService.hasPermission('Ass:addOrUpdate');
    this.canDelete = this.permissionService.hasPermission('Ass:delete');

    if (this.courseId) {
      this.loadAssignments();
    }
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.loadError = '';
    this.assignmentService.getAssignmentsByCourseId(this.courseId).subscribe({
      next: (list) => {
        this.assignmentsList = list;
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.assignmentsList = [];
        } else {
          this.loadError = 'Failed to load assignments. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  isApproachingDeadline(dueDateString: string): boolean {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    // Return true if due date is in the future but within 48 hours
    return diffHours > 0 && diffHours <= 48;
  }

  isMissed(dueDateString: string): boolean {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const now = new Date();
    return dueDate.getTime() < now.getTime();
  }

  // ── Expansion & Attachments ───────────────────────────────────────────────

  expandedIds = new Set<number>();

  toggleExpand(id: number): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  // ── Inline Edit ───────────────────────────────────────────────

  editingIds = new Set<number>();
  editFormData = new Map<number, { title: string; description: string; dueDate: string; totalMarks: number }>();

  startEdit(item: AssignmentResponseDto): void {
    this.editingIds.add(item.id);
    
    // Format dueDate to 'YYYY-MM-DDThh:mm' for datetime-local input
    let formattedDueDate = '';
    if (item.dueDate) {
      const d = new Date(item.dueDate);
      formattedDueDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    }
    
    this.editFormData.set(item.id, {
      title: item.title,
      description: item.description,
      dueDate: formattedDueDate,
      totalMarks: item.totalMarks
    });
    
    // Close expansion when editing
    this.expandedIds.delete(item.id);
  }

  cancelEdit(id: number): void {
    this.editingIds.delete(id);
    this.editFormData.delete(id);
  }

  saveEdit(id: number): void {
    const data = this.editFormData.get(id);
    if (!data || !data.title.trim() || !data.description.trim() || !data.dueDate || data.totalMarks < 0) {
      Swal.fire('Validation Error', 'Please fill in all required fields properly.', 'warning');
      return;
    }

    const payload = {
      id: id,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate).toISOString(),
      totalMarks: data.totalMarks
    };

    this.assignmentService.createOrUpdateAssignment(this.courseId, payload).subscribe({
      next: (updatedItem) => {
        const index = this.assignmentsList.findIndex(a => a.id === id);
        if (index !== -1) {
          this.assignmentsList[index] = updatedItem;
        }
        this.editingIds.delete(id);
        this.editFormData.delete(id);
        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'success', title: 'Assignment updated.', showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error', title: 'Update Failed', text: 'Could not update assignment. Please try again.', confirmButtonColor: '#41B3E3'
        });
      }
    });
  }

  openAttachment(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  getAttachmentIcon(contentType: string): string {
    if (contentType?.startsWith('video/')) {
      return 'bi bi-file-earmark-play-fill';
    }
    if (contentType === 'application/pdf') {
      return 'bi bi-file-earmark-pdf-fill';
    }
    return 'bi bi-file-earmark-fill';
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
        this.assignmentsList = this.assignmentsList.filter(a => a.id !== id);
        this.expandedIds.delete(id);
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
      }
    });
  }

  async deleteAttachment(assignmentId: number, attachmentId: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Remove Attachment?',
      text: 'This file will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      cancelButtonColor: '#41B3E3',
      confirmButtonText: 'Yes, remove it',
    });

    if (!result.isConfirmed) return;

    this.assignmentService.deleteAttachment(attachmentId).subscribe({
      next: () => {
        const assignment = this.assignmentsList.find(a => a.id === assignmentId);
        if (assignment && assignment.assignmentAttachments) {
          assignment.assignmentAttachments = assignment.assignmentAttachments.filter(att => att.id !== attachmentId);
        }
        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'success', title: 'Attachment removed.', showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
      },
      error: () => {
        Swal.fire('Delete Failed', 'Could not remove attachment.', 'error');
      }
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
    this.assignmentsList = [...this.assignmentsList, newItem];
    this.closeAddModal();
  }
}
