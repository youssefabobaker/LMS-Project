import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuizListItemDto, QuizCreateUpdateDto, QuizDetailDto, QuestionResponseDto, QuestionFormPayload, QuizToggleActiveResponse } from '../../models/quiz.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/api/Quiz`;
  private questionBaseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getQuizzesByCourseId(courseId: number): Observable<QuizListItemDto[]> {
    return this.http.get<any[]>(`${this.apiUrl}/course/${courseId}`)
      .pipe(map(list => list.map(q => this.normalize(q))));
  }

  createOrUpdateQuiz(courseId: number, dto: QuizCreateUpdateDto): Observable<QuizListItemDto> {
    return this.http.post<any>(`${this.apiUrl}/course/${courseId}`, dto)
      .pipe(map(q => this.normalize(q)));
  }

  deleteQuiz(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  private normalize(q: any): QuizListItemDto {
    let sDate = q.scheduledDate ?? q.ScheduledDate ?? '';
    if (sDate && !sDate.endsWith('Z')) {
      sDate += 'Z';
    }
    return {
      id: q.id ?? q.Id ?? 0,
      title: q.title ?? q.Title ?? '',
      description: q.description ?? q.Description ?? '',
      scheduledDate: sDate,
      duration: q.duration ?? q.Duration ?? '00:00:00',
      quizCode: q.quizCode ?? q.QuizCode ?? '',
      isActive: q.isActive ?? q.IsActive ?? false,
      totalMarks: q.totalMarks ?? q.TotalMarks ?? 0,
    };
  }

  getQuizById(id: number): Observable<QuizDetailDto> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(q => this.normalizeDetail(q))
    );
  }

  toggleQuizActive(id: number): Observable<QuizToggleActiveResponse> {
    return this.http.patch<QuizToggleActiveResponse>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  addQuestion(quizId: number, payload: QuestionFormPayload): Observable<QuestionResponseDto> {
    return this.http.post<QuestionResponseDto>(`${this.questionBaseUrl}/Quiz/${quizId}`, payload);
  }

  updateQuestion(quizId: number, payload: QuestionFormPayload): Observable<QuestionResponseDto> {
    return this.http.post<QuestionResponseDto>(`${this.questionBaseUrl}/Update/QuizId/${quizId}`, payload);
  }

  toggleQuestionStatus(quizId: number, questionId: number): Observable<QuestionResponseDto> {
    return this.http.post<QuestionResponseDto>(
      `${this.questionBaseUrl}/ToggleStatus/QuizId/${quizId}/QuestionId${questionId}`,
      {}
    );
  }

  private normalizeDetail(q: any): QuizDetailDto {
    let sDate = q.scheduledDate ?? q.ScheduledDate ?? '';
    if (sDate && !sDate.endsWith('Z')) sDate += 'Z';
    return {
      id: q.id ?? 0,
      title: q.title ?? '',
      description: q.description ?? '',
      scheduledDate: sDate,
      duration: q.duration ?? '00:00:00',
      totalMarks: q.totalMarks ?? 0,
      isActive: q.isActive ?? false,
      quizCode: q.quizCode ?? '',
      courseId: q.courseId ?? 0,
      quizQuestions: (q.quizQuestions ?? []).map((qn: any) => this.normalizeQuestion(qn)),
    };
  }

  private normalizeQuestion(qn: any): QuestionResponseDto {
    return {
      id: qn.id ?? 0,
      isActive: qn.isActive ?? true,
      questionText: qn.questionText ?? '',
      questionType: qn.questionType ?? 'MultipleChoice',
      marks: qn.marks ?? 0,
      isAllowableToLookDown: qn.isAllowableToLookDown ?? false,
      questionChoices: (qn.questionChoices ?? []).map((c: any) => ({
        id: c.id ?? 0,
        choiceText: c.choiceText ?? '',
        isCorrect: c.isCorrect ?? false,
      })),
    };
  }
}
