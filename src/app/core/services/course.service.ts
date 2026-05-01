import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, EnrolledUser } from '../../models/course';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private baseUrl = 'https://localhost:7289/api/Course';

  constructor(private http: HttpClient) {}

  // ─── 1. Get All Courses ───────────────────────────────────────────────────
  /** GET /api/Course — requires Course:readAll */
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.baseUrl);
  }

  // ─── 2. Add Course ────────────────────────────────────────────────────────
  /** POST /api/Course  multipart/form-data — requires Course:add */
  addCourse(formData: FormData): Observable<Course> {
    return this.http.post<Course>(this.baseUrl, formData);
  }

  // ─── 3. Update Course ─────────────────────────────────────────────────────
  /** PUT /api/Course/{id}  multipart/form-data — requires Course:update */
  updateCourse(id: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, formData);
  }

  // ─── 4. Toggle Status ─────────────────────────────────────────────────────
  /** PUT /api/Course/{id}/Toggle_Status — requires Course:update */
  toggleStatus(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/Toggle_Status`, {});
  }

  // ─── 5. Delete Course ─────────────────────────────────────────────────────
  /** DELETE /api/Course/{id} — requires Course:delete  (soft delete) */
  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ─── 6. Instructor Enrollment ─────────────────────────────────────────────
  /** GET /api/Course/{courseId}/users — requires Course:read */
  getEnrolledUsers(courseId: number): Observable<EnrolledUser[]> {
    return this.http.get<EnrolledUser[]>(`${this.baseUrl}/${courseId}/users`);
  }

  /** POST /api/Course/{courseId}/users — requires Course:enrollInstructor */
  enrollInstructor(courseId: number, userId: string): Observable<EnrolledUser> {
    return this.http.post<EnrolledUser>(`${this.baseUrl}/${courseId}/users`, {
      userId,
    });
  }

  /** DELETE /api/Course/{courseId}/users/{userId} — requires Course:unenrollInstructor */
  unenrollInstructor(courseId: number, userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${courseId}/users/${userId}`
    );
  }
}
