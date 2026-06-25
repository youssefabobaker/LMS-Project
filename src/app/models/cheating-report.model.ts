export interface Violation {
  id: number;
  description: string;
  evidenceUrl: string;
  timestamp: string;
}

export interface CheatingReport {
  id: number;
  quizAttemptId: number;
  studentId: string;
  studentName: string;
  violations: Violation[];
}

export interface RiskAssessmentQuestion {
  questionId: number;
  studentRiskScore: number;
  cohortAvgRiskScore: number;
}

export interface RiskAssessment {
  id: number;
  studentId: string;
  attemptId: number;
  cheatingReportId: number;
  sessionViolationRate: number;
  overallSessionRiskScore: number;
  questions: RiskAssessmentQuestion[];
}
