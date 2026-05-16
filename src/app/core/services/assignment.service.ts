import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  AssignmentResponseDto,
  AssignmentAttachmentDto,
} from '../../models/assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private apiUrl = `https://localhost:7289/api/Assignment`;

  constructor(private http: HttpClient) {}

  private normalizeAttachment(a: any): AssignmentAttachmentDto {
    return {
      id: a.id ?? a.Id ?? '',
      fileName: a.fileName ?? a.FileName ?? '',
      fileUrl: a.fileUrl ?? a.FileUrl ?? '',
      type: a.type ?? a.Type ?? '',
    };
  }

  private normalizeAssignment(u: any): AssignmentResponseDto {
    return {
      id: u.id ?? u.Id ?? 0,
      title: u.title ?? u.Title ?? '',
      description: u.description ?? u.Description ?? '',
      dueDate: u.dueDate ?? u.DueDate ?? '',
      totalMarks: u.totalMarks ?? u.TotalMarks ?? 0,
      assignmentAttachments: (
        u.assignmentAttachments ??
        u.AssignmentAttachments ??
        []
      ).map((a: any) => this.normalizeAttachment(a)),
    };
  }

  private cachedCourseId?: number;
  private cachedAssignments?: AssignmentResponseDto[];

  clearCache(): void {
    this.cachedCourseId = undefined;
    this.cachedAssignments = undefined;
  }

  getAssignmentById(id: number): Observable<AssignmentResponseDto> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(map((u) => this.normalizeAssignment(u)));
  }

  getAssignmentsByCourseId(
    courseId: number,
  ): Observable<AssignmentResponseDto[]> {
    if (this.cachedCourseId === courseId && this.cachedAssignments) {
      return of([...this.cachedAssignments]);
    }
    return this.http
      .get<any[]>(`${this.apiUrl}/course/${courseId}`)
      .pipe(
        map((list) => list.map((u) => this.normalizeAssignment(u))),
        tap((list) => {
          this.cachedCourseId = courseId;
          this.cachedAssignments = list;
        })
      );
  }
  createOrUpdateAssignment(
    courseId: number,
    data: {
      id: number;
      title: string;
      description: string;
      dueDate: string;
      totalMarks: number;
    },
  ): Observable<AssignmentResponseDto> {
    this.clearCache();
    return this.http
      .post<any>(`${this.apiUrl}/course/${courseId}`, data)
      .pipe(map((u) => this.normalizeAssignment(u)));
  }

  addAttachments(
    assignmentId: number,
    files: File[],
  ): Observable<AssignmentResponseDto> {
    this.clearCache();
    const formData = new FormData();
    files.forEach((f) => formData.append('attachmentFiles', f, f.name));
    return this.http
      .post<any>(`${this.apiUrl}/${assignmentId}/attachments`, formData)
      .pipe(map((u) => this.normalizeAssignment(u)));
  }

  deleteAssignment(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteAttachment(attachmentId: string): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.apiUrl}/attachments/${attachmentId}`);
  }
}
