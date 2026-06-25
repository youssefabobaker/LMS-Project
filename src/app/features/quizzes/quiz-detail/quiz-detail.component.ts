import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { QuizService } from '../../../core/services/quiz.service';
import { PermissionService } from '../../../core/services/permission.service';
import { QuizDetailDto, QuestionResponseDto } from '../../../models/quiz.model';
import { QuestionFormModalComponent } from '../question-form-modal/question-form-modal.component';

declare var bootstrap: any;

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, QuestionFormModalComponent],
  templateUrl: './quiz-detail.component.html',
  styleUrls: ['./quiz-detail.component.css']
})
export class QuizDetailComponent implements OnInit {
  courseId!: number;
  quizId!: number;
  quiz?: QuizDetailDto;

  get currentTotalMarks(): number {
    if (!this.quiz || !this.quiz.quizQuestions) return 0;
    return this.quiz.quizQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }

  selectedQuestion: QuestionResponseDto | null = null;
  private modalInstance: any = null;
  modalRefreshTrigger = 0;
  isTogglingQuiz = false;

  isLoading = false;
  loadError = '';
  notFoundError = false;

  canAddOrUpdateQuiz = false;
  canAddQuestion = false;
  canUpdateQuestion = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.canAddOrUpdateQuiz = this.permissionService.hasPermission('Quiz:addOrUpdate');
    this.canAddQuestion = this.permissionService.hasPermission('questions:add');
    this.canUpdateQuestion = this.permissionService.hasPermission('questions:update');

    this.route.paramMap.subscribe(params => {
      const cId = params.get('courseId');
      const qId = params.get('quizId');
      if (cId && qId) {
        this.courseId = +cId;
        this.quizId = +qId;
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.loadError = '';
    this.notFoundError = false;
    
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (res) => {
        this.quiz = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.notFoundError = true;
        } else {
          this.loadError = 'Failed to load quiz details. Please try again.';
        }
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

  goBack(): void {
    this.router.navigate(['/dashboard/courses', this.courseId, 'quizzes']);
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

  private getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('questionFormModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  openAddQuestionModal(): void {
    this.selectedQuestion = null;
    this.modalRefreshTrigger++;
    this.getModal()?.show();
  }

  openEditQuestionModal(question: QuestionResponseDto): void {
    this.selectedQuestion = question;
    this.modalRefreshTrigger++;
    this.getModal()?.show();
  }

  closeQuestionModal(): void {
    this.getModal()?.hide();
  }

  onQuestionSaved(q: QuestionResponseDto): void {
    if (this.quiz) {
      if (this.selectedQuestion) {
        // Edit mode: replace existing
        const idx = this.quiz.quizQuestions.findIndex(x => x.id === q.id);
        if (idx !== -1) {
          this.quiz.quizQuestions[idx] = q;
        }
      } else {
        // Add mode: push to end
        this.quiz.quizQuestions.push(q);
      }
    }
    
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      title: this.selectedQuestion ? 'Question updated successfully' : 'Question added successfully',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
    
    this.closeQuestionModal();
  }

  toggleQuizActive(): void {
    if (!this.quiz) return;
    this.isTogglingQuiz = true;
    this.quizService.toggleQuizActive(this.quiz.id).subscribe({
      next: (res) => {
        this.quiz!.isActive = res.isActive;
        this.isTogglingQuiz = false;
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: `Quiz is now ${res.isActive ? 'Active' : 'Inactive'}`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      },
      error: () => {
        this.isTogglingQuiz = false;
        Swal.fire({
          icon: 'error',
          title: 'Operation Failed',
          text: 'Could not toggle quiz status.',
          confirmButtonColor: '#41B3E3'
        });
      }
    });
  }

  toggleQuestionStatus(question: QuestionResponseDto): void {
    if (!this.quiz) return;
    this.quizService.toggleQuestionStatus(this.quiz.id, question.id).subscribe({
      next: (res) => {
        const idx = this.quiz!.quizQuestions.findIndex(x => x.id === question.id);
        if (idx !== -1) {
          this.quiz!.quizQuestions[idx] = res;
        }
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: `Question is now ${res.isActive ? 'Active' : 'Inactive'}`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Operation Failed',
          text: 'Could not toggle question status.',
          confirmButtonColor: '#41B3E3'
        });
      }
    });
  }
}
