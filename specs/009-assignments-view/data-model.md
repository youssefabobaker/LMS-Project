# Data Models: Assignments View

Based on the `Assignment.md` backend API document, these models will be implemented in `src/app/core/models/assignment.model.ts`.

## `AssignmentAttachmentDto`
```typescript
export interface AssignmentAttachmentDto {
  id: string; // Guid
  fileName: string;
  fileUrl: string;
  type: string; // MIME type e.g., 'application/pdf', 'video/mp4'
}
```

## `AssignmentResponseDto`
```typescript
export interface AssignmentResponseDto {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO 8601 datetime string
  totalMarks: number;
  assignmentAttachments: AssignmentAttachmentDto[];
}
```

## Component State Model (Internal)
The `AssignmentsViewComponent` will track:
- `isLoading`: boolean
- `loadError`: string | null
- `assignmentsList`: AssignmentResponseDto[]
- `expandedIds`: Set<number> (for tracking which cards are expanded to show descriptions and attachments)
- `canAddOrUpdate`: boolean (derived from permission check)
- `canDelete`: boolean (derived from permission check)
