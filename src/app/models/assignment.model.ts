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

export interface AssignmentSubmissionAttachmentDto {
  id: string;           // Guid
  fileName: string;
  fileUrl: string;
  type: string;         // 'application/pdf' | 'video/mp4'
}

export interface AssignmentSubmissionResponseDto {
  id: number;
  assignmentId: number;
  studentId: string;
  textSubmission: string | null;
  submittedAt: string;  // ISO 8601
  grade: number | null;
  feedback: string | null;
  assignmentSubmissionAttachments: AssignmentSubmissionAttachmentDto[];
}

export interface CreateSubmissionDto {
  assignmentId: number;
  textSubmission?: string;
  attachmentFiles?: File[];
}

export interface GradeSubmissionDto {
  grade: number;
  feedback?: string;
}

