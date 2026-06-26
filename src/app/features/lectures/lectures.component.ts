import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { LectureService } from '../../core/services/lecture.service';
import { PermissionService } from '../../core/services/permission.service';
import { LectureResponse, LectureRequest } from '../../models/lecture.model';

declare var bootstrap: any;

@Component({
  selector: 'app-lectures',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lectures.component.html',
  styleUrls: ['./lectures.component.css']
})
export class LecturesComponent implements OnInit {
  @Input() courseId!: number;

  lectures: LectureResponse[] = [];
  isLoading = false;

  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canJoin = false;

  lectureForm!: FormGroup;
  isSubmitting = false;
  editingLectureId: number | null = null;
  private modalInstance: any = null;

  constructor(
    private lectureService: LectureService,
    private permissionService: PermissionService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.canCreate = this.permissionService.hasPermission('Lecture:create');
    this.canUpdate = this.permissionService.hasPermission('Lecture:update');
    this.canDelete = this.permissionService.hasPermission('Lecture:delete');
    this.canJoin = this.permissionService.hasPermission('Lecture:join');

    this.initForm();
    if (this.courseId) {
      this.loadLectures();
    }
  }

  initForm(): void {
    this.lectureForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      scheduledAt: ['', [Validators.required]]
    });
  }

  loadLectures(): void {
    this.isLoading = true;
    this.lectureService.getLectures(this.courseId).subscribe({
      next: (data) => {
        this.lectures = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status !== 404) {
          Swal.fire('Error', 'Failed to load lectures.', 'error');
        }
      }
    });
  }

  openModal(lecture?: LectureResponse): void {
    if (lecture) {
      this.editingLectureId = lecture.id;
      // Convert to local datetime-local format for the input
      const dt = new Date(lecture.scheduledAt);
      const isoLocal = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

      this.lectureForm.patchValue({
        title: lecture.title,
        description: lecture.description,
        scheduledAt: isoLocal
      });
    } else {
      this.editingLectureId = null;
      this.lectureForm.reset();
    }
    this.getModal()?.show();
  }

  closeModal(): void {
    this.getModal()?.hide();
    this.lectureForm.reset();
    this.editingLectureId = null;
  }

  private getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('lectureModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  onSubmit(): void {
    if (this.lectureForm.invalid) return;

    this.isSubmitting = true;

    // Ensure ISO 8601 format
    const formVal = this.lectureForm.value;
    const req: LectureRequest = {
      title: formVal.title,
      description: formVal.description,
      scheduledAt: formVal.scheduledAt  // datetime-local value is already local time — no UTC conversion
    };

    if (this.editingLectureId) {
      const targetId = this.editingLectureId;
      this.lectureService.updateLecture(targetId, this.courseId, req).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();

          // Instant local update — no flicker
          const idx = this.lectures.findIndex(l => l.id === targetId);
          if (idx !== -1) {
            this.lectures[idx] = { ...this.lectures[idx], title: req.title, description: req.description, scheduledAt: req.scheduledAt };
          }

          Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Live class updated successfully', showConfirmButton: false, timer: 3000 });
        },
        error: () => {
          this.isSubmitting = false;
          Swal.fire({ toast: true, position: 'bottom-end', icon: 'error', title: 'Failed to update live class', showConfirmButton: false, timer: 3000 });
        }
      });
    } else {
      this.lectureService.createLecture(this.courseId, req).subscribe({
        next: (newLecture) => {
          this.isSubmitting = false;
          this.closeModal();
          // Push the returned lecture directly — no GET request needed
          this.lectures = [newLecture, ...this.lectures];
          Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Live class created successfully', showConfirmButton: false, timer: 3000 });
        },
        error: () => {
          this.isSubmitting = false;
          Swal.fire({ toast: true, position: 'bottom-end', icon: 'error', title: 'Failed to create live class', showConfirmButton: false, timer: 3000 });
        }
      });
    }
  }

  deleteLecture(lectureId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this live class!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.lectureService.deleteLecture(lectureId, this.courseId).subscribe({
          next: () => {
            // Remove the card instantly — no GET request needed
            this.lectures = this.lectures.filter(l => l.id !== lectureId);
            Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Live class deleted!', showConfirmButton: false, timer: 3000 });
          },
          error: () => Swal.fire('Error', 'Failed to delete live class.', 'error')
        });
      }
    });
  }

  toggleActive(lectureId: number): void {
    const lecture = this.lectures.find(l => l.id === lectureId);
    if (!lecture) return;

    // Optimistically update
    lecture.isActive = !lecture.isActive;

    this.lectureService.toggleLectureActive(lectureId, this.courseId).subscribe({
      next: () => {
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Status updated!', showConfirmButton: false, timer: 3000 });
      },
      error: () => {
        // Revert on error
        lecture.isActive = !lecture.isActive;
        Swal.fire('Error', 'Failed to update status.', 'error');
      }
    });
  }

  joinLive(lectureId: number): void {
    this.lectureService.joinLiveLecture(lectureId).subscribe({
      next: (res) => {
        window.open(res.jitsiUrl, '_blank');
      },
      error: (err) => {
        Swal.fire('Connection Error', err.error?.message || 'Could not join live lecture.', 'error');
      }
    });
  }
}
