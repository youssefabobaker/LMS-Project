import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuizAttemptDto } from '../../models/quiz-attempts.model';

@Injectable({
  providedIn: 'root'
})
export class QuizAttemptsService {
  private readonly baseUrl = `${environment.apiUrl}/api/QuizAttempts`;

  constructor(private http: HttpClient) { }

  /**
   * GET /api/quiz-attempts/quizzes/{quizId}/attempts
   * Returns all submitted attempts for a quiz with per-question answer breakdown.
   * Requires: Quiz:addOrUpdate permission
   */
  getQuizAttempts(quizId: number): Observable<QuizAttemptDto[]> {
    return this.http.get<QuizAttemptDto[]>(
      `${this.baseUrl}/quizzes/${quizId}/attempts`
    );
  }

  /**
   * PATCH /api/QuizAttempts/attempts/{attemptId}/score/finalize
   * Allows an Instructor to finalize the score exactly once.
   * Requires: AttemptScore:finalize permission
   */
  finalizeScore(attemptId: number, score: number): Observable<QuizAttemptDto> {
    return this.http.patch<QuizAttemptDto>(
      `${this.baseUrl}/attempts/${attemptId}/score/finalize`,
      { score }
    );
  }

  /**
   * PATCH /api/QuizAttempts/attempts/{attemptId}/score
   * Allows an Admin to update the score unlimited times.
   * Requires: AttemptScore:update permission
   */
  updateScoreAdmin(attemptId: number, score: number): Observable<QuizAttemptDto> {
    return this.http.patch<QuizAttemptDto>(
      `${this.baseUrl}/attempts/${attemptId}/score`,
      { score }
    );
  }
}
