/** Returned by GET /api/Quiz/course/{courseId} */
export interface QuizListItemDto {
  id: number;
  title: string;
  description: string;
  scheduledDate: string;   // ISO 8601
  duration: string;        // "HH:mm:ss"
  quizCode: string;        // 8-character code
  isActive: boolean;
  totalMarks: number;
  isSubmitted?: boolean;
  score?: number | null;
  submittedAt?: string | null;
}

/** Sent to POST /api/Quiz/course/{courseId} */
export interface QuizCreateUpdateDto {
  id: number | null;
  title: string;
  description: string;
  scheduledDate: string;
  duration: string;        // "HH:mm:ss"
  totalMarks: number;
  isActive: boolean;
}

/** Returned by GET /api/Quiz/{id} */
export interface QuizDetailDto {
  id: number;
  title: string;
  description: string;
  scheduledDate: string;
  duration: string;
  totalMarks: number;
  isActive: boolean;
  quizCode: string;
  courseId: number;
  quizQuestions: QuestionResponseDto[];
}

export interface QuestionResponseDto {
  id: number;
  isActive: boolean;
  questionText: string;
  questionType: string;           // "MultipleChoice" | "TrueFalse"
  marks: number;
  isAllowableToLookDown: boolean;
  questionChoices: QuestionChoiceDto[];
}

export interface QuestionChoiceDto {
  id: number;
  choiceText: string;
  isCorrect: boolean;
}

/** Sent to POST /Quiz/{quizId} and POST /Update/QuizId/{quizId} */
export interface QuestionFormPayload {
  id: number;
  questionText: string;
  questionType: number;           // 0 = MultipleChoice, 1 = TrueFalse
  marks: number;
  correctAnswerIndex: number;
  isAllowableToLookDown: boolean;
  questionChoices: string[];
}

/** Returned by PATCH /api/Quiz/{id}/toggle-active */
export interface QuizToggleActiveResponse {
  isActive: boolean;
}
