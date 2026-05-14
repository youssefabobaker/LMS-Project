export interface AssignmentAttachmentDto {
  id: string; // Guid
  fileName: string;
  fileUrl: string;
  type: string; // MIME type e.g., 'application/pdf', 'video/mp4'
}

export interface AssignmentResponseDto {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO 8601 datetime string
  totalMarks: number;
  assignmentAttachments: AssignmentAttachmentDto[];
}
