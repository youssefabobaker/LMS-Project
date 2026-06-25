import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssignmentSubmissionResponseDto, AssignmentSubmissionAttachmentDto, GradeSubmissionDto } from '../../models/assignment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentSubmissionService {
  private apiUrl = `${environment.apiUrl}/api/AssignmentSubmission`;

  constructor(private http: HttpClient) { }

  private normalizeAttachment(a: any): AssignmentSubmissionAttachmentDto {
    return {
      id:       a.id       ?? a.Id       ?? '',
      fileName: a.fileName ?? a.FileName ?? '',
      fileUrl:  a.fileUrl  ?? a.FileUrl  ?? '',
      type:     a.type     ?? a.Type     ?? '',
    };
  }

  private normalizeSubmission(u: any): AssignmentSubmissionResponseDto {
    return {
      id:             u.id             ?? u.Id             ?? 0,
      assignmentId:   u.assignmentId   ?? u.AssignmentId   ?? 0,
      studentId:      u.studentId      ?? u.StudentId      ?? '',
      textSubmission: u.textSubmission ?? u.TextSubmission ?? null,
      submittedAt:    u.submittedAt    ?? u.SubmittedAt    ?? '',
      grade:          u.grade !== undefined ? u.grade : (u.Grade !== undefined ? u.Grade : null),
      feedback:       u.feedback       ?? u.Feedback       ?? null,
      assignmentSubmissionAttachments: (u.assignmentSubmissionAttachments ?? u.AssignmentSubmissionAttachments ?? [])
        .map((a: any) => this.normalizeAttachment(a)),
    };
  }

  submitAssignment(assignmentId: number, textSubmission: string, files: File[]): Observable<AssignmentSubmissionResponseDto> {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId.toString());
    formData.append('textSubmission', textSubmission);
    files.forEach(f => formData.append('attachmentFiles', f, f.name));
    return this.http.post<any>(`${this.apiUrl}/Assignment/Submit`, formData)
      .pipe(map(u => this.normalizeSubmission(u)));
  }

  getStudentSubmissions(): Observable<AssignmentSubmissionResponseDto[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Student/Assignment/Submissions`)
      .pipe(map(list => list.map(u => this.normalizeSubmission(u))));
  }

  getSubmissionsForAssignment(assignmentId: number): Observable<AssignmentSubmissionResponseDto[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Assignment/${assignmentId}/Students`)
      .pipe(map(list => list.map(u => this.normalizeSubmission(u))));
  }

  deleteSubmission(submissionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Assignment/Submission/${submissionId}`);
  }

  gradeSubmission(submissionId: number, dto: GradeSubmissionDto): Observable<AssignmentSubmissionResponseDto> {
    return this.http.put<any>(`${this.apiUrl}/Assignment/Submission/${submissionId}/Grade`, dto)
      .pipe(map(u => this.normalizeSubmission(u)));
  }
}

