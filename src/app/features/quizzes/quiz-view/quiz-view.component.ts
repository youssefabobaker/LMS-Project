import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { QuizService } from '../../../core/services/quiz.service';
import { PermissionService } from '../../../core/services/permission.service';
import { QuizListItemDto } from '../../../models/quiz.model';
import { QuizAddEditComponent } from '../quiz-add-edit/quiz-add-edit.component';

@Component({
  selector: 'app-quiz-view',
  standalone: true,
  imports: [CommonModule, QuizAddEditComponent],
  templateUrl: './quiz-view.component.html',
  styleUrls: ['./quiz-view.component.css']
})
export class QuizViewComponent implements OnInit {
  @Input() courseId!: number;

  quizzesList: QuizListItemDto[] = [];
  isLoading = false;
  loadError = '';

  canReadQuiz = false;
  canAddOrUpdateQuiz = false;
  canDeleteQuiz = false;
  canReadQuestions = false;

  selectedQuiz: QuizListItemDto | null = null;
  @ViewChild(QuizAddEditComponent) quizAddEditModal?: QuizAddEditComponent;
  private modalInstance: any;

  constructor(
    private quizService: QuizService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canReadQuiz = this.permissionService.hasPermission('Quiz:read');
    this.canAddOrUpdateQuiz = this.permissionService.hasPermission('Quiz:addOrUpdate');
    this.canDeleteQuiz = this.permissionService.hasPermission('Quiz:delete');
    this.canReadQuestions = this.permissionService.hasPermission('questions:read');

    if (this.canReadQuiz && this.courseId) {
      this.loadQuizzes();
    }
  }

  loadQuizzes(): void {
    this.isLoading = true;
    this.loadError = '';

    this.quizService.getQuizzesByCourseId(this.courseId).subscribe({
      next: (quizzes) => {
        this.quizzesList = quizzes;
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.quizzesList = [];
        } else {
          this.loadError = 'Failed to load quizzes. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'Load Failed',
            text: this.loadError,
            confirmButtonColor: '#41B3E3'
          });
        }
        this.isLoading = false;
      }
    });
  }

  parseDurationToMinutes(duration: string): string {
    if (!duration) return '0 min';
    const parts = duration.split(':');
    if (parts.length !== 3) return duration;
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;
    const total = hours * 60 + minutes + Math.round(seconds / 60);
    return `${total} min`;
  }

  openAddModal(): void {
    this.selectedQuiz = null;
    const el = document.getElementById('quizAddEditModal');
    if (el) {
      this.modalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(el);
      this.modalInstance.show();
    }
  }

  openEditModal(quiz: QuizListItemDto): void {
    this.selectedQuiz = quiz;
    const el = document.getElementById('quizAddEditModal');
    if (el) {
      this.modalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(el);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  onQuizCreated(quiz: QuizListItemDto): void {
    this.quizzesList.push(quiz);
    this.closeModal();
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      title: 'Quiz created successfully',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  onQuizUpdated(quiz: QuizListItemDto): void {
    const index = this.quizzesList.findIndex(q => q.id === quiz.id);
    if (index !== -1) {
      this.quizzesList[index] = quiz;
    }
    this.closeModal();
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      title: 'Quiz updated successfully',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  async deleteQuiz(id: number): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Quiz?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      cancelButtonColor: '#41B3E3',
      confirmButtonText: 'Yes, delete it'
    });

    if (!result.isConfirmed) return;

    this.quizService.deleteQuiz(id).subscribe({
      next: () => {
        this.quizzesList = this.quizzesList.filter(q => q.id !== id);
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Quiz deleted.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Could not delete this quiz. Please try again.',
          confirmButtonColor: '#41B3E3'
        });
      }
    });
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/dashboard/courses', this.courseId, 'quizzes', id]);
  }

  navigateToAttempts(id: number): void {
    this.router.navigate(['/dashboard/courses', this.courseId, 'quizzes', id, 'attempts']);
  }

  copyToClipboard(event: Event, code: string): void {
    event.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Quiz code copied!',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }).catch(err => {
        console.error('Failed to copy code: ', err);
      });
    }
  }
}
