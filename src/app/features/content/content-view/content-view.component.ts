import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ContentService } from '../../../core/services/content.service';
import { CourseService } from '../../../core/services/course.service';
import { PermissionService } from '../../../core/services/permission.service';
import { Content } from '../../../models/content';
import { Course } from '../../../models/course';
import { ContentAddComponent } from '../content-add/content-add.component';

import { AssignmentsViewComponent } from '../../assignments/assignments-view/assignments-view.component';
import { QuizViewComponent } from '../../quizzes/quiz-view/quiz-view.component';
import { LecturesComponent } from '../../lectures/lectures.component';

import { Location } from '@angular/common';

@Component({
  selector: 'app-content-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ContentAddComponent, AssignmentsViewComponent, QuizViewComponent, LecturesComponent],
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css'],
})
export class ContentViewComponent implements OnInit {
  courseId!: number;
  activeTab: 'content' | 'assignments' | 'quizzes' | 'lectures' = 'content';
  courseDetails?: Course;
  contentList: Content[] = [];
  isLoading = false;
  loadError = '';

  // Card state
  expandedIds = new Set<number>();
  editingIds  = new Set<number>();
  editFormData = new Map<number, { title: string; body: string }>();
  isUploadingAttachment = new Map<number, boolean>();

  // Permission flags
  canRead   = false;
  canUpdate = false;
  canDelete = false;
  canAdd    = false;
  canAddAssignment = false;
  canReadAssignment = false;

  contentInitialized = false;
  assignmentsInitialized = false;
  quizzesInitialized = false;
  lecturesInitialized = false;
  canReadQuiz = false;
  canAddOrUpdateQuiz = false;
  canCreateLecture = false;
  canReadCourse = false;

  constructor(
    private route:             ActivatedRoute,
    private router:            Router,
    private location:          Location,
    private contentService:    ContentService,
    private courseService:     CourseService,
    private permissionService: PermissionService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['courseDetails']) {
      this.courseDetails = navigation.extras.state['courseDetails'];
    } else {
      const historyState = this.location.getState() as any;
      if (historyState && historyState['courseDetails']) {
        this.courseDetails = historyState['courseDetails'];
      }
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.canRead   = this.permissionService.hasPermission('Content:read');
    this.canUpdate = this.permissionService.hasPermission('Content:update');
    this.canDelete = this.permissionService.hasPermission('Content:delete');
    this.canAdd    = this.permissionService.hasPermission('Content:add');
    this.canAddAssignment = this.permissionService.hasPermission('Ass:addOrUpdate');
    this.canReadAssignment = this.permissionService.hasPermission('Ass:read');
    this.canReadQuiz = this.permissionService.hasPermission('Quiz:read');
    this.canAddOrUpdateQuiz = this.permissionService.hasPermission('Quiz:addOrUpdate');
    this.canCreateLecture = this.permissionService.hasPermission('Lecture:create');
    this.canReadCourse = this.permissionService.hasPermission('Course:read');

    this.route.paramMap.subscribe(params => {
      const newCourseId = Number(params.get('courseId'));
      if (this.courseId !== newCourseId) {
        if (this.courseId !== undefined && this.courseId !== null) {
          this.courseDetails = undefined;
        }
        this.courseId = newCourseId;
        this.contentInitialized = false;
        this.assignmentsInitialized = false;

        const url = this.router.url;
        if (url.includes('/assignments')) {
          this.activeTab = 'assignments';
          this.assignmentsInitialized = true;
        } else if (url.includes('/quizzes')) {
          this.activeTab = 'quizzes';
          this.quizzesInitialized = true;
        } else if (url.includes('/lectures')) {
          this.activeTab = 'lectures';
          this.lecturesInitialized = true;
        } else {
          this.activeTab = 'content';
          this.contentInitialized = true;
        }

        if (this.canRead && this.contentInitialized) {
          this.loadContent();
        }
        if (this.canRead && !this.courseDetails) {
          this.loadCourseDetails();
        }
      }
    });
  }

  switchTab(tab: 'content' | 'assignments' | 'quizzes' | 'lectures'): void {
    if (this.activeTab === tab) return;
    
    this.activeTab = tab;
    
    if (tab === 'content' && !this.contentInitialized) {
      this.contentInitialized = true;
      if (this.canRead) {
        this.loadContent();
      }
    } else if (tab === 'assignments' && !this.assignmentsInitialized) {
      this.assignmentsInitialized = true;
    } else if (tab === 'quizzes' && !this.quizzesInitialized) {
      this.quizzesInitialized = true;
    } else if (tab === 'lectures' && !this.lecturesInitialized) {
      this.lecturesInitialized = true;
    }

    const path = tab === 'content' ? 'content' : tab;
    this.location.replaceState(`/dashboard/courses/${this.courseId}/${path}`, '', { courseDetails: this.courseDetails });
  }

  // ── Data Loading ──────────────────────────────────────────────────────────

  loadContent(): void {
    this.isLoading = true;
    this.loadError = '';
    this.contentService.getContentByCourse(this.courseId).subscribe({
      next: (list) => {
        this.contentList = list;
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.contentList = [];
        } else {
          this.loadError = 'Failed to load content. Please try again.';
        }
        this.isLoading = false;
      },
    });
  }

  loadCourseDetails(): void {
    const courses$ = this.permissionService.hasPermission('Course:readAll') 
      ? this.courseService.getAllCourses() 
      : this.courseService.getCourses();

    courses$.subscribe({
      next: (courses) => {
        this.courseDetails = courses.find(c => Number(c.Id) === this.courseId) || courses.find(c => c.Id === this.courseId);
      },
      error: (err) => {
        console.error('Failed to load course details', err);
      }
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/dashboard/courses']);
  }

  // ── Expansion ─────────────────────────────────────────────────────────────

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

  // ── Attachment Handling ───────────────────────────────────────────────────

  openAttachment(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  getAttachmentIcon(contentType: string): string {
    if (contentType?.startsWith('video/')) {
      return 'bi bi-play-circle-fill';
    }
    if (contentType === 'application/pdf') {
      return 'bi bi-file-earmark-pdf-fill';
    }
    return 'bi bi-file-earmark-fill';
  }

  // ── Inline Edit ───────────────────────────────────────────────────────────

  startEdit(item: Content): void {
    this.expandedIds.delete(item.id); // collapse attachments while editing
    this.editFormData.set(item.id, { title: item.title, body: item.body });
    this.editingIds.add(item.id);
  }

  cancelEdit(id: number): void {
    // Silently discard — no confirmation dialog (clarified Q2)
    this.editingIds.delete(id);
    this.editFormData.delete(id);
  }

  saveEdit(id: number): void {
    const formData = this.editFormData.get(id);
    if (!formData) return;
    const { title, body } = formData;

    this.contentService.updateContent(id, title, body).subscribe({
      next: () => {
        const item = this.contentList.find(c => c.id === id);
        if (item) {
          item.title = title;
          item.body  = body;
        }
        this.cancelEdit(id);
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Content updated successfully.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Could not save changes. Please try again.',
          confirmButtonColor: '#41B3E3',
        });
      },
    });
  }

  // ── Delete Content ────────────────────────────────────────────────────────

  async deleteContent(id: number): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Content?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      cancelButtonColor: '#41B3E3',
      confirmButtonText: 'Yes, delete it',
    });

    if (!result.isConfirmed) return;

    this.contentService.deleteContent(id).subscribe({
      next: () => {
        this.contentList = this.contentList.filter(c => c.id !== id);
        this.expandedIds.delete(id);
        this.editingIds.delete(id);
        this.editFormData.delete(id);
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Content deleted.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Could not delete this content item. Please try again.',
          confirmButtonColor: '#41B3E3',
        });
      },
    });
  }

  onAddAttachment(event: any, contentId: number): void {
    const files: FileList = event.target.files;
    if (files.length === 0) return;

    this.isUploadingAttachment.set(contentId, true);
    const filesArray = Array.from(files);

    this.contentService.addAttachments(contentId, filesArray).subscribe({
      next: (res) => {
        // Update local state
        const idx = this.contentList.findIndex(c => c.id === contentId);
        if (idx !== -1) {
          this.contentList[idx] = res;
        }
        this.isUploadingAttachment.set(contentId, false);
        event.target.value = ''; // Reset input

        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Attachment(s) added successfully.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      },
      error: () => {
        this.isUploadingAttachment.set(contentId, false);
        event.target.value = ''; // Reset input
        Swal.fire('Error', 'Failed to upload attachment(s). Please try again.', 'error');
      }
    });
  }

  // ── Delete Attachment ─────────────────────────────────────────────────────

  async deleteAttachment(contentId: number, attachmentId: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Remove Attachment?',
      text: 'The file will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      cancelButtonColor: '#41B3E3',
      confirmButtonText: 'Yes, remove it',
    });

    if (!result.isConfirmed) return;

    this.contentService.deleteAttachment(attachmentId).subscribe({
      next: () => {
        const item = this.contentList.find(c => c.id === contentId);
        if (item) {
          item.contentAttachments = item.contentAttachments.filter(a => a.id !== attachmentId);
        }
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Attachment removed.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Remove Failed',
          text: 'Could not remove this attachment. Please try again.',
          confirmButtonColor: '#41B3E3',
        });
      },
    });
  }

  // ── Add Content Modal ─────────────────────────────────────────────────────

  private contentAddModalInstance: any = null;
  @ViewChild(AssignmentsViewComponent) assignmentsView?: AssignmentsViewComponent;
  @ViewChild(QuizViewComponent) quizzesView?: QuizViewComponent;
  @ViewChild(LecturesComponent) lectureView?: LecturesComponent;

  onAddContent(): void {
    if (this.activeTab === 'assignments') {
      this.assignmentsView?.openAddModal();
      return;
    } else if (this.activeTab === 'quizzes') {
      this.quizzesView?.openAddModal();
      return;
    } else if (this.activeTab === 'lectures') {
      this.lectureView?.openModal();
      return;
    }
    const el = document.getElementById('contentAddModal');
    if (el) {
      this.contentAddModalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(el);
      this.contentAddModalInstance.show();
    }
  }

  onContentCreated(newItem: Content): void {
    this.contentList = [...this.contentList, newItem];
    this.closeContentModal();
  }

  closeContentModal(): void {
    this.contentAddModalInstance?.hide();
  }
}
