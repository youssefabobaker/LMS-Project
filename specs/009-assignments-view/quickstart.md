# Quickstart: Assignments View

To begin implementation, follow these steps:

1. **Scaffold Component & Service**
   Run Angular CLI commands to generate the required standalone elements:
   ```bash
   ng generate component features/assignments/assignments-view --standalone
   ng generate service core/services/assignment
   ```

2. **Implement Data Models**
   Create `src/app/core/models/assignment.model.ts` using the definitions in `data-model.md`.

3. **Wire up the Service**
   Implement `getAssignmentsByCourseId(courseId: number)` and `deleteAssignment(id: number)` in `AssignmentService`.

4. **Integrate into Content View**
   - In `content-view.component.ts`, add a tab state variable: `activeTab: 'content' | 'assignments' = 'content';`
   - In `content-view.component.html`, bind the tab buttons to change the `activeTab`.
   - Wrap the existing Content List and Add Button in `*ngIf="activeTab === 'content'"`.
   - Add `<app-assignments-view *ngIf="activeTab === 'assignments'" [courseId]="courseId"></app-assignments-view>`.

5. **Build Assignments View UI**
   - Accept `@Input() courseId!: number;`
   - Fetch assignments on initialization.
   - Replicate the card styles from `content-add.component.css`/`content-view.component.html` for the assignment cards.
   - Implement the `< 48 hours` red highlight logic for Due Dates.
   - Implement the card expansion logic to reveal the description and attachments.
