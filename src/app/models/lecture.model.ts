export interface LectureResponse {
  id: number;
  title: string;
  description: string;
  scheduledAt: string; // ISO 8601 format
  isActive: boolean;
  createdByName: string;
  courseId: number;
}

export interface LectureJoinResponse {
  lectureId: number;
  roomName: string;
  jitsiDomain: string;
  displayName: string;
  jitsiUrl: string;
  moderatorEmail: string;
}

export interface LectureRequest {
  title: string;
  description: string;
  scheduledAt: string;
}
