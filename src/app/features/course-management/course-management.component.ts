import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CourseService } from '../../core/services/course.service';
import { PermissionService } from '../../core/services/permission.service';
import {
  Course,
  Semester,
  AcademicLevel,
  EnrolledUser,
} from '../../models/course';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.css',
})
export class CourseManagementComponent implements OnInit {
  // ─── State ─────────────────────────────────────────────────────────────────
  courses: Course[] = [];
  isLoading = false;
  loadFailed = false;
  showForm = false;
  editingCourseId: number | null = null;
  selectedFile: File | null = null;
  existingImageUrl: string = '';

  // ─── Instructor Assignment State ───────────────────────────────────────────
  assigningCourseId: number | null = null;
  newInstructorId: string = '';
  instructorLoading = false;

  // ─── Form ──────────────────────────────────────────────────────────────────
  courseForm!: FormGroup;

  // ─── Enum Labels (for selects) ─────────────────────────────────────────────
  readonly semesterOptions = [
    { value: Semester.Fall, label: 'Fall' },
    { value: Semester.Spring, label: 'Spring' },
    { value: Semester.Summer, label: 'Summer' },
  ];

  readonly levelOptions = [
    { value: AcademicLevel.FirstYear, label: 'First Year' },
    { value: AcademicLevel.SecondYear, label: 'Second Year' },
    { value: AcademicLevel.ThirdYear, label: 'Third Year' },
    { value: AcademicLevel.FourthYear, label: 'Fourth Year' },
    { value: AcademicLevel.FifthYear, label: 'Fifth Year' },
  ];

  constructor(
    private courseService: CourseService,
    private fb: FormBuilder,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
  }

  // ─── Form Initialization ───────────────────────────────────────────────────

  initForm(): void {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      semster: [null, [Validators.required]],
      credit_Hour: [null, [Validators.required, Validators.min(1)]],
      academicLevel: [null, [Validators.required]],
      learningOutcomes: [''],
    });
  }

  // ─── Load Courses (US1) ────────────────────────────────────────────────────

  loadCourses(): void {
    this.isLoading = true;
    this.loadFailed = false;
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadFailed = true;
        Swal.fire({
          icon: 'error',
          title: 'Load Failed',
          text: 'Could not load courses. Please retry.',
          confirmButtonColor: '#41B3E3',
        });
      },
    });
  }

  // ─── Open Create Form (US2) ────────────────────────────────────────────────

  openCreateForm(): void {
    this.editingCourseId = null;
    this.selectedFile = null;
    this.existingImageUrl = '';
    this.courseForm.reset();
    this.showForm = true;
  }

  // ─── Edit Course (US3) ────────────────────────────────────────────────────

  editCourse(course: Course): void {
    this.editingCourseId = course.id;
    this.selectedFile = null;
    this.existingImageUrl = course.imageUrl || '';
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      semster: course.semster,
      credit_Hour: course.credit_Hour,
      academicLevel: course.academicLevel,
      learningOutcomes: course.learningOutcomes || '',
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── File Input Handler (US2 + US3) ───────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // ─── Build FormData Payload ────────────────────────────────────────────────

  buildFormData(): FormData {
    const fd = new FormData();
    const v = this.courseForm.value;
    fd.append('title', v.title.trim());
    fd.append('description', v.description.trim());
    fd.append('semster', String(v.semster));
    fd.append('credit_Hour', String(v.credit_Hour));
    fd.append('academicLevel', String(v.academicLevel));
    if (v.learningOutcomes?.trim()) {
      fd.append('learningOutcomes', v.learningOutcomes.trim());
    }
    if (this.selectedFile) {
      // New image chosen — send the file
      fd.append('ImageFile', this.selectedFile, this.selectedFile.name);
    } else if (this.editingCourseId !== null && this.existingImageUrl) {
      // No new file chosen during edit — send the existing URL (Option C)
      fd.append('imageUrl', this.existingImageUrl);
    }
    return fd;
  }

  // ─── Save Course (Create or Edit) ─────────────────────────────────────────

  saveCourse(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const fd = this.buildFormData();

    if (this.editingCourseId === null) {
      // ── Create ──
      this.courseService.addCourse(fd).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'Course created successfully.',
            timer: 2000,
            showConfirmButton: false,
          });
          this.loadCourses();
          this.closeForm();
        },
        error: (err) => {
          const msg =
            err.error?.message || err.error?.errorMessage || 'Operation failed';
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: typeof msg === 'string' ? msg : JSON.stringify(msg),
            confirmButtonColor: '#d33',
          });
        },
      });
    } else {
      // ── Update ──
      this.courseService.updateCourse(this.editingCourseId, fd).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Course updated successfully.',
            timer: 2000,
            showConfirmButton: false,
          });
          this.loadCourses();
          this.closeForm();
        },
        error: (err) => {
          const msg =
            err.error?.message || err.error?.errorMessage || 'Update failed';
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: typeof msg === 'string' ? msg : JSON.stringify(msg),
            confirmButtonColor: '#d33',
          });
        },
      });
    }
  }

  // ─── Toggle Status (US4) ──────────────────────────────────────────────────

  toggleStatus(course: Course): void {
    this.courseService.toggleStatus(course.id).subscribe({
      next: () => {
        // Optimistic local update — no full reload
        course.isPublished = !course.isPublished;
        Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: `Course is now ${course.isPublished ? 'Published' : 'Unpublished'}.`,
          timer: 1800,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        const msg = err.error?.message || 'Toggle failed';
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: typeof msg === 'string' ? msg : 'Toggle failed',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  // ─── Remove Course (US5) ──────────────────────────────────────────────────

  removeCourse(id: number): void {
    Swal.fire({
      title: 'Remove Course?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e63946',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.courseService.deleteCourse(id).subscribe({
          next: () => {
            this.courses = this.courses.filter((c) => c.id !== id);
            Swal.fire({
              icon: 'success',
              title: 'Removed!',
              text: 'Course removed successfully.',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            const msg =
              err.error?.message || err.error?.errorMessage || 'Remove failed';
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: typeof msg === 'string' ? msg : JSON.stringify(msg),
              confirmButtonColor: '#d33',
            });
          },
        });
      }
    });
  }

  // ─── Instructor Assignment Panel (US6) ────────────────────────────────────

  toggleInstructorPanel(course: Course): void {
    if (course.showInstructors) {
      course.showInstructors = false;
      return;
    }
    // Load enrolled users first
    this.instructorLoading = true;
    this.courseService.getEnrolledUsers(course.id).subscribe({
      next: (users) => {
        course.enrolledInstructors = users;
        course.showInstructors = true;
        this.instructorLoading = false;
      },
      error: () => {
        this.instructorLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not load instructors.',
          confirmButtonColor: '#41B3E3',
        });
      },
    });
  }

  enrollInstructor(course: Course): void {
    if (!this.newInstructorId.trim()) return;
    this.courseService.enrollInstructor(course.id, this.newInstructorId.trim()).subscribe({
      next: (enrolled) => {
        if (!course.enrolledInstructors) course.enrolledInstructors = [];
        course.enrolledInstructors.push(enrolled);
        this.newInstructorId = '';
        Swal.fire({
          icon: 'success',
          title: 'Enrolled!',
          text: `${enrolled.userName} enrolled successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        const msg = err.error?.message || 'Enrollment failed';
        Swal.fire({ icon: 'error', title: 'Error!', text: msg, confirmButtonColor: '#d33' });
      },
    });
  }

  unenrollInstructor(course: Course, userId: string): void {
    Swal.fire({
      title: 'Remove Instructor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e63946',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Remove',
    }).then((result) => {
      if (result.isConfirmed) {
        this.courseService.unenrollInstructor(course.id, userId).subscribe({
          next: () => {
            course.enrolledInstructors = course.enrolledInstructors?.filter(
              (u) => u.userId !== userId
            );
            Swal.fire({ icon: 'success', title: 'Removed!', timer: 1500, showConfirmButton: false });
          },
          error: (err) => {
            const msg = err.error?.message || 'Unenroll failed';
            Swal.fire({ icon: 'error', title: 'Error!', text: msg, confirmButtonColor: '#d33' });
          },
        });
      }
    });
  }

  // ─── Form Helpers ─────────────────────────────────────────────────────────

  closeForm(): void {
    this.showForm = false;
    this.editingCourseId = null;
    this.selectedFile = null;
    this.existingImageUrl = '';
    this.courseForm.reset();
  }

  // ─── Permission Helper ────────────────────────────────────────────────────

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  // ─── Image Fallback ───────────────────────────────────────────────────────

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/course-placeholder.png';
  }

  // ─── Semester / Level Label Helpers ───────────────────────────────────────

  getSemesterLabel(value: number): string {
    const map: Record<number, string> = { 1: 'Fall', 2: 'Spring', 3: 'Summer' };
    return map[value] ?? '—';
  }

  getLevelLabel(value: number): string {
    const map: Record<number, string> = {
      1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year', 5: '5th Year',
    };
    return map[value] ?? '—';
  }
}
