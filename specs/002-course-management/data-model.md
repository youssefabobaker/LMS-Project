# Data Model: Course Management

## Entities

### 1. `Course`
Represents an educational course within the LMS.

**TypeScript Interface**: `src/app/models/course.ts`

```typescript
export interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  semster: Semester; // Note: using API spelling "semster"
  credit_Hour: number;
  isPublished: boolean;
  academicLevel: AcademicLevel;
  learningOutcomes?: string;
  
  // Optional frontend-only UI states
  enrolledInstructors?: EnrolledUser[]; 
  assessments?: Assessment[];
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

export interface Assessment {
  assType: AssessmentType;
  percentageWeight: number;
  isMandatory: boolean;
  hours: number;
}
```

## Enums

```typescript
export enum Semester {
  Fall = 1,
  Spring = 2,
  Summer = 3
}

export enum AcademicLevel {
  FirstYear = 1,
  SecondYear = 2,
  ThirdYear = 3,
  FourthYear = 4,
  FifthYear = 5
}

export enum AssessmentType {
  Default = 0,
  Final = 1,
  Lab = 2,
  Project = 3,
  Quiz = 4,
  Midterm = 5
}
```

## Validation Rules

1. **title**: Required string.
2. **description**: Required string.
3. **semster**: Required Enum (1-3).
4. **credit_Hour**: Required number (> 0).
5. **academicLevel**: Required Enum (1-5).
6. **ImageFile**: Optional File object. Required on creation visually, but the `FormData` will append it as a binary file. On update, if no file is selected, the existing `imageUrl` is preserved.
