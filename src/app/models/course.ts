// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Semester {
  Fall = 1,
  Spring = 2,
  Summer = 3,
}

export enum AcademicLevel {
  FirstYear = 1,
  SecondYear = 2,
  ThirdYear = 3,
  FourthYear = 4,
  FifthYear = 5,
}

export enum AssessmentType {
  Default = 0,
  Final = 1,
  Lab = 2,
  Project = 3,
  Quiz = 4,
  Midterm = 5,
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Assessment {
  assType: AssessmentType;
  percentageWeight: number;
  isMandatory: boolean;
  hours: number;
}

export interface EnrolledUser {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: number;
  courseTitle: string;
  enrolledAt: string;
  enrolledBy: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  /** Note: API uses the typo "semster" intentionally */
  semster: Semester;
  credit_Hour: number;
  isPublished: boolean;
  academicLevel: AcademicLevel;
  learningOutcomes?: string;
  assessments?: Assessment[];
  enrolledInstructors?: EnrolledUser[];
  /** UI-only: tracks expanded instructor panel on card */
  showInstructors?: boolean;
}
