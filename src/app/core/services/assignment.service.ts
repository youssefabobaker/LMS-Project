import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AssignmentResponseDto,
  AssignmentAttachmentDto,
} from '../../models/assignment.model';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private apiUrl = `${environment.apiUrl}/api/Assignment`;

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

  getAssignmentById(id: number): Observable<AssignmentResponseDto> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(map((u) => this.normalizeAssignment(u)));
  }

  getAssignmentsByCourseId(
    courseId: number,
  ): Observable<AssignmentResponseDto[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/course/${courseId}`)
      .pipe(
        map((list) => list.map((u) => this.normalizeAssignment(u)))
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
    return this.http
      .post<any>(`${this.apiUrl}/course/${courseId}`, data)
      .pipe(map((u) => this.normalizeAssignment(u)));
  }

  addAttachments(
    assignmentId: number,
    files: File[],
  ): Observable<AssignmentResponseDto> {
    const formData = new FormData();
    files.forEach((f) => formData.append('attachmentFiles', f, f.name));
    return this.http
      .post<any>(`${this.apiUrl}/${assignmentId}/attachments`, formData)
      .pipe(map((u) => this.normalizeAssignment(u)));
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteAttachment(attachmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/attachments/${attachmentId}`);
  }
}
