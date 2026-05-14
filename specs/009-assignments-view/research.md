# Research & Architecture Decisions: Assignments View

## Component Integration Strategy
- **Decision**: Use `*ngIf` in `content-view.component.html` to toggle between the Content List UI and the `<app-assignments-view>` component.
- **Rationale**: The user requested that the "Assignments View logic [live] inside src/app/features/assignments/" but also that it "integrate into the existing course dashboard... keeping the top course banner static." `content-view` currently holds the course banner. Turning it into a host component with `*ngIf` tab states (`activeTab: 'content' | 'assignments'`) satisfies all constraints without complex routing changes.
- **Alternatives considered**: Setting up a nested `<router-outlet>` (rejected because it requires modifying `app.routes.ts` extensively and might break the current working flow for content).

## API Integration
- **Decision**: Create a dedicated `AssignmentService` in `src/app/core/services/assignment.service.ts`.
- **Rationale**: Adheres to the Constitution's Separation of Concerns rule. The service will inject `HttpClient` and expose methods mapping directly to `GET /api/Assignment/course/{courseId}` and `DELETE /api/Assignment/{id}`.

## File Attachments
- **Decision**: Bind attachments to `window.open(fileUrl, '_blank')`. Use the `type` field to display a PDF icon (`bi-file-earmark-pdf`) or an MP4/Video icon (`bi-file-earmark-play`) based on standard MIME types (`application/pdf`, `video/mp4`).
- **Rationale**: Simple, browser-native file handling as requested in the spec.
