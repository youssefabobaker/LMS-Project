/** One student's answer to a single question */
export interface StudentAnswerDto {
  questionText: string;
  studentChoice: string;
  correctChoice: string;
  isCorrect: boolean;
}

/**
 * One attempt entry returned by:
 * GET /api/quiz-attempts/quizzes/{quizId}/attempts
 * Auth: Quiz:addOrUpdate permission
 */
export interface QuizAttemptDto {
  attemptId: number;
  studentId: string;
  studentFullName: string;
  score: number;
  quizTotalMarks: number;
  submittedAt: string; // ISO 8601
  studentAnswers: StudentAnswerDto[];
}
