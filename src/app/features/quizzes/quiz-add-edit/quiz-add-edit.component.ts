import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import Swal from 'sweetalert2';
import { QuizCreateUpdateDto, QuizListItemDto } from '../../../models/quiz.model';
import { QuizService } from '../../../core/services/quiz.service';

function durationValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;
  if (isNaN(value) || value <= 0) {
    return { invalidDuration: true };
  }
  return null;
}

@Component({
  selector: 'app-quiz-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-add-edit.component.html',
  styleUrls: ['./quiz-add-edit.component.css']
})
export class QuizAddEditComponent implements OnChanges {
  @Input() courseId!: number;
  @Input() quizData: QuizListItemDto | null = null;

  @Output() quizCreated = new EventEmitter<QuizListItemDto>();
  @Output() quizUpdated = new EventEmitter<QuizListItemDto>();
  @Output() modalDismissed = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private quizService: QuizService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      scheduledDate: ['', Validators.required],
      duration: ['', [Validators.required, durationValidator]],
      totalMarks: [null, [Validators.required, Validators.min(0.01)]],
      isActive: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quizData']) {
      if (this.quizData) {
        let formattedDate = '';
        if (this.quizData.scheduledDate) {
          const d = new Date(this.quizData.scheduledDate);
          if (!isNaN(d.getTime())) {
            formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          }
        }
        
        this.form.patchValue({
          title: this.quizData.title,
          description: this.quizData.description,
          scheduledDate: formattedDate,
          duration: this.parseDurationToMinutes(this.quizData.duration),
          totalMarks: this.quizData.totalMarks || '',
          isActive: this.quizData.isActive
        });
      } else {
        this.form.reset({
          isActive: true
        });
      }
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.quizData) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Quiz Code Will Change',
        text: 'Saving will invalidate the current Quiz Code and generate a new one.',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, save changes'
      });
      if (!result.isConfirmed) {
        return;
      }
    }

    this.isSubmitting = true;
    
    const scheduledDateVal = this.form.value.scheduledDate;
    const isoDate = new Date(scheduledDateVal).toISOString();

    const dto: QuizCreateUpdateDto = {
      id: this.quizData ? this.quizData.id : null,
      title: this.form.value.title,
      description: this.form.value.description,
      scheduledDate: isoDate,
      duration: this.formatMinutesToDuration(this.form.value.duration),
      totalMarks: this.form.value.totalMarks,
      isActive: this.form.value.isActive
    };

    this.quizService.createOrUpdateQuiz(this.courseId, dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (this.quizData) {
          this.quizUpdated.emit(res);
        } else {
          this.quizCreated.emit(res);
        }
      },
      error: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Operation Failed',
          text: 'Could not save the quiz. Please try again.',
          confirmButtonColor: '#41B3E3'
        });
      }
    });
  }

  dismiss(): void {
    this.modalDismissed.emit();
  }

  private parseDurationToMinutes(duration: string): number {
    if (!duration) return 0;
    const parts = duration.split(':');
    if (parts.length !== 3) return 0;
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;
    return hours * 60 + minutes + Math.round(seconds / 60);
  }

  private formatMinutesToDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${pad(hours)}:${pad(minutes)}:00`;
  }
}
