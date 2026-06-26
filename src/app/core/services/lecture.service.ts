import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LectureResponse, LectureRequest, LectureJoinResponse } from '../../models/lecture.model';

@Injectable({
  providedIn: 'root'
})
export class LectureService {
  private apiUrl = `${environment.apiUrl}/api/lecture`;

  constructor(private http: HttpClient) { }

  private normalizeLecture(data: any): LectureResponse {
    if (!data) return data;
    return {
      id: data.Id ?? data.id,
      title: data.Title ?? data.title,
      description: data.Description ?? data.description,
      scheduledAt: data.ScheduledAt ?? data.scheduledAt,
      isActive: data.IsActive ?? data.isActive,
      createdByName: data.CreatedByName ?? data.createdByName,
      courseId: data.CourseId ?? data.courseId
    };
  }

  private normalizeJoin(data: any): LectureJoinResponse {
    if (!data) return data;
    return {
      lectureId: data.LectureId ?? data.lectureId,
      roomName: data.RoomName ?? data.roomName,
      jitsiDomain: data.JitsiDomain ?? data.jitsiDomain,
      displayName: data.DisplayName ?? data.displayName,
      jitsiUrl: data.JitsiUrl ?? data.jitsiUrl,
      moderatorEmail: data.ModeratorEmail ?? data.moderatorEmail
    };
  }

  getLectures(courseId: number): Observable<LectureResponse[]> {
    return this.http.get<any[]>(`${this.apiUrl}/course/${courseId}`)
      .pipe(map(list => (list || []).map(l => this.normalizeLecture(l))));
  }

  getLectureById(lectureId: number, courseId: number): Observable<LectureResponse> {
    return this.http.get<any>(`${this.apiUrl}/${lectureId}/course/${courseId}`)
      .pipe(map(l => this.normalizeLecture(l)));
  }

  createLecture(courseId: number, data: LectureRequest): Observable<LectureResponse> {
    return this.http.post<any>(`${this.apiUrl}/course/${courseId}`, data)
      .pipe(map(l => this.normalizeLecture(l)));
  }

  updateLecture(lectureId: number, courseId: number, data: LectureRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${lectureId}/course/${courseId}`, data);
  }

  deleteLecture(lectureId: number, courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${lectureId}/course/${courseId}`);
  }

  toggleLectureActive(lectureId: number, courseId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${lectureId}/course/${courseId}/toggle-active`, {});
  }

  joinLiveLecture(lectureId: number): Observable<LectureJoinResponse> {
    return this.http.get<any>(`${this.apiUrl}/${lectureId}/join`)
      .pipe(map(j => this.normalizeJoin(j)));
  }
}
