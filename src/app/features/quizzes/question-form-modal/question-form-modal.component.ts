import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { QuizService } from '../../../core/services/quiz.service';
import { QuestionResponseDto, QuestionFormPayload } from '../../../models/quiz.model';

@Component({
  selector: 'app-question-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './question-form-modal.component.html',
  styleUrls: ['./question-form-modal.component.css']
})
export class QuestionFormModalComponent implements OnInit, OnChanges {
  @Input() quizId!: number;
  @Input() questionData: QuestionResponseDto | null = null;
  @Input() refreshTrigger = 0;

  @Output() questionSaved = new EventEmitter<QuestionResponseDto>();
  @Output() modalDismissed = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;
  choicesValidationError = false;

  constructor(private fb: FormBuilder, private quizService: QuizService) {
    this.form = this.fb.group({
      questionText: ['', Validators.required],
      questionType: [0, Validators.required], // 0: MultipleChoice, 1: TrueFalse
      marks: [null, [Validators.required, Validators.min(0.01)]],
      isAllowableToLookDown: [false],
      correctAnswerIndex: [null, Validators.required],
      choices: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.form.get('questionType')?.valueChanges.subscribe((type: number) => {
      this.handleQuestionTypeChange(type);
    });
    // Initialize for add mode if no data
    if (!this.questionData) {
      this.handleQuestionTypeChange(0);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionData'] || changes['refreshTrigger']) {
      if (this.questionData) {
        // Edit mode
        const typeInt = this.questionData.questionType === 'TrueFalse' ? 1 : 0;
        const correctIdx = this.questionData.questionChoices.findIndex(c => c.isCorrect);
        
        const choicesArray = this.form.get('choices') as FormArray;
        choicesArray.clear();
        
        this.questionData.questionChoices.forEach(c => {
          const ctrl = this.fb.control({ value: c.choiceText, disabled: typeInt === 1 }, Validators.required);
          choicesArray.push(ctrl);
        });

        this.form.patchValue({
          questionText: this.questionData.questionText,
          questionType: typeInt,
          marks: this.questionData.marks,
          isAllowableToLookDown: this.questionData.isAllowableToLookDown,
          correctAnswerIndex: correctIdx >= 0 ? correctIdx : 0
        }, { emitEvent: false }); // Prevent triggering valueChanges
      } else {
        // Add mode
        this.form.reset({
          questionType: 0,
          isAllowableToLookDown: false,
          correctAnswerIndex: null
        });
        this.handleQuestionTypeChange(0);
      }
    }
  }

  get choicesArray(): FormArray {
    return this.form.get('choices') as FormArray;
  }

  handleQuestionTypeChange(type: number): void {
    const choicesArray = this.choicesArray;
    choicesArray.clear();
    this.form.get('correctAnswerIndex')?.setValue(null);
    this.choicesValidationError = false;

    if (type === 1) { // TrueFalse
      choicesArray.push(this.fb.control({ value: 'True', disabled: true }));
      choicesArray.push(this.fb.control({ value: 'False', disabled: true }));
    } else { // MultipleChoice
      choicesArray.push(this.fb.control('', Validators.required));
      choicesArray.push(this.fb.control('', Validators.required));
    }
  }

  addChoice(): void {
    if (this.form.value.questionType !== 1) {
      this.choicesArray.push(this.fb.control('', Validators.required));
    }
  }

  removeChoice(index: number): void {
    if (this.form.value.questionType !== 1 && this.choicesArray.length > 2) {
      this.choicesArray.removeAt(index);
      
      const currentCorrectIdx = this.form.get('correctAnswerIndex')?.value;
      if (currentCorrectIdx === index) {
        this.form.get('correctAnswerIndex')?.setValue(null);
      } else if (currentCorrectIdx !== null && currentCorrectIdx > index) {
        this.form.get('correctAnswerIndex')?.setValue(currentCorrectIdx - 1);
      }
    }
  }

  submit(): void {
    this.choicesValidationError = false;
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawChoices = this.choicesArray.getRawValue();
    const typeInt = this.form.get('questionType')?.value;
    
    if (typeInt === 0) {
      const validChoices = rawChoices.filter((c: string) => c && c.trim().length > 0);
      if (validChoices.length < 2) {
        this.choicesValidationError = true;
        return;
      }
    }

    this.isSubmitting = true;

    const payload: QuestionFormPayload = {
      id: this.questionData ? this.questionData.id : 0,
      questionText: this.form.value.questionText,
      questionType: typeInt,
      marks: this.form.value.marks,
      correctAnswerIndex: this.form.value.correctAnswerIndex,
      isAllowableToLookDown: this.form.value.isAllowableToLookDown,
      questionChoices: rawChoices
    };

    const request$ = this.questionData 
      ? this.quizService.updateQuestion(this.quizId, payload)
      : this.quizService.addQuestion(this.quizId, payload);

    request$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.questionSaved.emit(res);
      },
      error: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Operation Failed',
          text: 'Could not save the question. Please try again.',
          confirmButtonColor: '#41B3E3'
        });
      }
    });
  }

  dismiss(): void {
    this.modalDismissed.emit();
  }
}
