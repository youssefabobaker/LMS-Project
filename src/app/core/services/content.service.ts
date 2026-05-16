import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Content, ContentAttachment } from '../../models/content';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private baseUrl = 'https://localhost:7289/api/Content';

  constructor(private http: HttpClient) {}

  // ── Normalisation helpers ─────────────────────────────────────────────────

  private normalizeAttachment(a: any): ContentAttachment {
    return {
      id:          a.id          ?? a.Id          ?? '',
      fileName:    a.fileName    ?? a.FileName    ?? '',
      fileUrl:     a.fileUrl     ?? a.FileUrl     ?? '',
      contentType: a.contentType ?? a.ContentType ?? '',
    };
  }

  private normalizeContent(u: any): Content {
    return {
      id:    u.id    ?? u.Id    ?? 0,
      title: u.title ?? u.Title ?? '',
      body:  u.body  ?? u.Body  ?? '',
      contentAttachments: (u.contentAttachments ?? u.ContentAttachments ?? [])
        .map((a: any) => this.normalizeAttachment(a)),
    };
  }

  // ── This Cycle ────────────────────────────────────────────────────────────

  private cachedCourseId?: number;
  private cachedContentList?: Content[];

  clearCache(): void {
    this.cachedCourseId = undefined;
    this.cachedContentList = undefined;
  }

  /** GET /api/Content/course/{courseId} — list all content for a course */
  getContentByCourse(courseId: number): Observable<Content[]> {
    if (this.cachedCourseId === courseId && this.cachedContentList) {
      return of(this.cachedContentList);
    }
    return this.http
      .get<any[]>(`${this.baseUrl}/course/${courseId}`)
      .pipe(
        map(list => list.map(u => this.normalizeContent(u))),
        tap(list => {
          this.cachedCourseId = courseId;
          this.cachedContentList = list;
        })
      );
  }

  /** GET /api/Content/{contentId} — single content item */
  getContentById(contentId: number): Observable<Content> {
    return this.http
      .get<any>(`${this.baseUrl}/${contentId}`)
      .pipe(map(u => this.normalizeContent(u)));
  }

  /** PUT /api/Content/{contentId} — update title and body */
  updateContent(contentId: number, title: string, body: string): Observable<any> {
    this.clearCache();
    return this.http.put(
      `${this.baseUrl}/${contentId}`,
      { title, body },
      { responseType: 'text' }
    );
  }

  /** DELETE /api/Content/{contentId} — delete content item */
  deleteContent(contentId: number): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.baseUrl}/${contentId}`, { responseType: 'text' });
  }

  /** DELETE /api/Content/attachments/{attachmentId} — remove a single attachment */
  deleteAttachment(attachmentId: string): Observable<any> {
    this.clearCache();
    return this.http.delete(
      `${this.baseUrl}/attachments/${attachmentId}`,
      { responseType: 'text' }
    );
  }

  // ── Next Cycle Stubs ──────────────────────────────────────────────────────

  /** POST /api/Content/course/{courseId} — create a new content item (content-add cycle) */
  createContent(courseId: number, title: string, body: string): Observable<Content> {
    this.clearCache();
    return this.http
      .post<any>(`${this.baseUrl}/course/${courseId}`, { title, body })
      .pipe(map(u => this.normalizeContent(u)));
  }

  /** POST /api/Content/{contentId}/attachments — upload files (content-add cycle) */
  addAttachments(contentId: number, files: File[]): Observable<Content> {
    this.clearCache();
    const form = new FormData();
    files.forEach(f => form.append('attachmentFiles', f, f.name));
    return this.http
      .post<any>(`${this.baseUrl}/${contentId}/attachments`, form)
      .pipe(map(u => this.normalizeContent(u)));
  }
}
