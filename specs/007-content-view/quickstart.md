# Quick Start: Course Content View (007)

**Branch**: `007-content-view`
**Component**: `src/app/features/content/content-view/content-view.component.ts`
**Service**: `src/app/core/services/content.service.ts`
**Models**: `src/app/models/content.ts`
**Route**: `dashboard/courses/:courseId/content`

---

## New Files to Create

```text
src/app/models/content.ts
src/app/core/services/content.service.ts
src/app/features/content/
└── content-view/
    ├── content-view.component.ts
    ├── content-view.component.html
    └── content-view.component.css
```

## Existing Files to Modify

| File | Change |
|------|--------|
| `src/app/app.routes.ts` | Replace `courses/:id/content` stub with real `ContentViewComponent` + `permissionGuard` |

---

## Service Skeleton

```typescript
// src/app/core/services/content.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Content, ContentAttachment } from '../../models/content';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private baseUrl = 'https://localhost:7289/api/Content';
  constructor(private http: HttpClient) {}

  // ── Normalisation ────────────────────────────────────────────────────────
  private normalizeAttachment(a: any): ContentAttachment {
    return {
      id:          a.id          ?? a.Id,
      fileName:    a.fileName    ?? a.FileName    ?? '',
      fileUrl:     a.fileUrl     ?? a.FileUrl     ?? '',
      contentType: a.contentType ?? a.ContentType ?? '',
    };
  }

  private normalizeContent(u: any): Content {
    return {
      id:    u.id    ?? u.Id,
      title: u.title ?? u.Title ?? '',
      body:  u.body  ?? u.Body  ?? '',
      contentAttachments: (u.contentAttachments ?? u.ContentAttachments ?? [])
        .map((a: any) => this.normalizeAttachment(a)),
    };
  }

  // ── This Cycle ───────────────────────────────────────────────────────────
  // GET /api/Content/course/{courseId}
  getContentByCourse(courseId: number): Observable<Content[]> {
    return this.http.get<any[]>(`${this.baseUrl}/course/${courseId}`)
      .pipe(map(list => list.map(u => this.normalizeContent(u))));
  }

  // GET /api/Content/{contentId}
  getContentById(contentId: number): Observable<Content> {
    return this.http.get<any>(`${this.baseUrl}/${contentId}`)
      .pipe(map(u => this.normalizeContent(u)));
  }

  // PUT /api/Content/{contentId}
  updateContent(contentId: number, title: string, body: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${contentId}`, { title, body }, { responseType: 'text' });
  }

  // DELETE /api/Content/{contentId}
  deleteContent(contentId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${contentId}`, { responseType: 'text' });
  }

  // DELETE /api/Content/attachments/{attachmentId}
  deleteAttachment(attachmentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/attachments/${attachmentId}`, { responseType: 'text' });
  }

  // ── Next Cycle Stubs ─────────────────────────────────────────────────────
  // POST /api/Content/course/{courseId}
  createContent(courseId: number, title: string, body: string): Observable<Content> {
    return this.http.post<any>(`${this.baseUrl}/course/${courseId}`, { title, body })
      .pipe(map(u => this.normalizeContent(u)));
  }

  // POST /api/Content/{contentId}/attachments
  addAttachments(contentId: number, files: File[]): Observable<Content> {
    const form = new FormData();
    files.forEach(f => form.append('attachmentFiles', f, f.name));
    return this.http.post<any>(`${this.baseUrl}/${contentId}/attachments`, form)
      .pipe(map(u => this.normalizeContent(u)));
  }
}
```

---

## Component Skeleton

```typescript
// src/app/features/content/content-view/content-view.component.ts
@Component({
  selector: 'app-content-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css'],
})
export class ContentViewComponent implements OnInit {
  courseId!: number;
  contentList: Content[] = [];
  isLoading = false;
  loadError = '';

  expandedIds = new Set<number>();
  editingIds  = new Set<number>();
  editFormData = new Map<number, { title: string; body: string }>();

  canRead   = false;
  canUpdate = false;
  canDelete = false;

  constructor(
    private route:           ActivatedRoute,
    private router:          Router,
    private contentService:  ContentService,
    private permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.courseId  = Number(this.route.snapshot.paramMap.get('courseId'));
    this.canRead   = this.permissionService.hasPermission('Content:read');
    this.canUpdate = this.permissionService.hasPermission('Content:update');
    this.canDelete = this.permissionService.hasPermission('Content:delete');
    if (this.canRead) this.loadContent();
  }

  loadContent(): void { /* GET + normalise */ }
  goBack():       void { this.router.navigate(['/dashboard/courses']); }
  toggleExpand(id: number): void { /* add/remove from expandedIds */ }
  isExpanded(id:  number): boolean { return this.expandedIds.has(id); }

  // Edit
  startEdit(item: Content): void { /* populate editFormData, add to editingIds */ }
  cancelEdit(id:  number):  void { /* remove from editingIds + editFormData */ }
  saveEdit(id:    number):  void { /* PUT → update item in contentList in-place */ }

  // Delete
  deleteContent(id: number):          void { /* Swal confirm → DELETE → splice from contentList */ }
  deleteAttachment(contentId: number, attachmentId: string): void { /* Swal → DELETE → splice from card's attachments */ }

  // Helpers
  openAttachment(fileUrl: string):          void { window.open(fileUrl, '_blank'); }
  getAttachmentIcon(contentType: string): string {
    if (contentType?.startsWith('video/'))    return 'bi bi-play-circle-fill';
    if (contentType === 'application/pdf')    return 'bi bi-file-earmark-pdf-fill';
    return 'bi bi-file-earmark-fill';
  }
}
```

---

## Route Registration (app.routes.ts)

Replace the existing stub:
```typescript
// Before:
{ path: 'courses/:id/content', redirectTo: 'courses', pathMatch: 'full' },

// After:
{
  path: 'courses/:courseId/content',
  component: ContentViewComponent,
  canActivate: [permissionGuard],
  data: { permission: 'Content:read' },
},
```

> **Note**: The route param name changes from `:id` to `:courseId` to match `snapshot.paramMap.get('courseId')` in the component.

---

## Key Binding Points in Template

| UI Element | Binding |
|---|---|
| Loading spinner | `*ngIf="isLoading"` |
| Empty state | `*ngIf="!isLoading && !loadError && contentList.length === 0"` |
| Error banner | `*ngIf="loadError"` |
| Content list | `*ngFor="let item of contentList; let i = index"` |
| Card number | `{{ i + 1 \| number: '2.0' }}` (zero-padded) |
| Expand toggle icon | `bi-chevron-up` / `bi-chevron-down` toggled by `isExpanded(item.id)` |
| Attachment list | `*ngIf="isExpanded(item.id)"` + `*ngFor` over `item.contentAttachments` |
| Attachment icon | `[class]="getAttachmentIcon(att.contentType)"` |
| Attachment click | `(click)="openAttachment(att.fileUrl)"` |
| Edit button | `*ngIf="canUpdate && !editingIds.has(item.id)"` |
| Delete button (card) | `*ngIf="canDelete && !editingIds.has(item.id)"` |
| Delete button (attachment) | `*ngIf="canDelete"` |
| Inline edit form | `*ngIf="editingIds.has(item.id)"` |
| Edit title field | `[(ngModel)]="editFormData.get(item.id).title"` |
| Edit body field | `[(ngModel)]="editFormData.get(item.id).body"` |
| Save button | `(click)="saveEdit(item.id)"` |
| Cancel button | `(click)="cancelEdit(item.id)"` |
| Back button | `(click)="goBack()"` |
