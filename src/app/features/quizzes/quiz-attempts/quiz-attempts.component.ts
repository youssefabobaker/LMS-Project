import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { QuizAttemptsService } from '../../../core/services/quiz-attempts.service';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizAttemptDto } from '../../../models/quiz-attempts.model';
import { QuizDetailDto } from '../../../models/quiz.model';
import { CorrectCountPipe } from './correct-count.pipe';
import { CheatingReportService } from '../../../core/services/cheating-report.service';
import { CheatingReport, RiskAssessment } from '../../../models/cheating-report.model';
import { PermissionService } from '../../../core/services/permission.service';

declare var bootstrap: any;

export interface QuizAttemptViewModel extends QuizAttemptDto {
  proctoringStatus?: 'loading' | 'safe' | 'review';
  cheatingReportId?: number;
  violationsCount?: number;
  isScoreLocked?: boolean;
  isEditingScore?: boolean;
  draftScore?: number;
}

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [CommonModule, FormsModule, CorrectCountPipe],
  templateUrl: './quiz-attempts.component.html',
  styleUrls: ['./quiz-attempts.component.css']
})
export class QuizAttemptsComponent implements OnInit {
  courseId!: number;
  quizId!: number;

  quiz?: QuizDetailDto;
  attempts: QuizAttemptViewModel[] = [];

  isLoading = false;
  loadError = '';

  selectedAttempt: QuizAttemptDto | null = null;
  private reviewModalInstance: any = null;

  // Proctoring Modal State
  selectedProctoringAttempt: QuizAttemptViewModel | null = null;
  activeProctoringTab: 'logs' | 'ai' = 'logs';
  cheatingReport: CheatingReport | null = null;
  riskAssessment: RiskAssessment | null = null;
  isRiskAssessmentLoading = false;
  riskAssessmentNotFound = false;
  private proctoringModalInstance: any = null;
  canViewProctoring = false;
  canDeleteProctoring = false;
  canFinalizeScore = false;
  canUpdateScoreAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptsService: QuizAttemptsService,
    private quizService: QuizService,
    private cheatingReportService: CheatingReportService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.canViewProctoring = this.permissionService.hasPermission('CheatingReport:read');
    this.canDeleteProctoring = this.permissionService.hasPermission('CheatingReport:delete');
    this.canFinalizeScore = this.permissionService.hasPermission('AttemptScore:finalize');
    this.canUpdateScoreAdmin = this.permissionService.hasPermission('AttemptScore:update');
    
    this.route.paramMap.subscribe(params => {
      const cId = params.get('courseId');
      const qId = params.get('quizId');
      if (cId && qId) {
        this.courseId = +cId;
        this.quizId = +qId;
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.loadError = '';

    // Load quiz info and attempts in parallel
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (quiz) => { this.quiz = quiz; },
      error: () => { /* non-critical: quiz title is cosmetic */ }
    });

    this.attemptsService.getQuizAttempts(this.quizId).subscribe({
      next: (attempts) => {
        this.attempts = attempts.map(a => ({ ...a, proctoringStatus: 'loading' }));
        this.isLoading = false;
        this.loadProctoringStatuses();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.attempts = [];
        } else {
          this.loadError = 'Failed to load quiz attempts. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'Load Failed',
            text: this.loadError,
            confirmButtonColor: '#41B3E3'
          });
        }
      }
    });
  }

  loadProctoringStatuses(): void {
    if (!this.canViewProctoring) return;

    this.attempts.forEach(attempt => {
      this.cheatingReportService.getCheatingReport(attempt.attemptId).subscribe({
        next: (report) => {
          attempt.cheatingReportId = report.id;
          attempt.violationsCount = report.violations?.length || 0;
          attempt.proctoringStatus = attempt.violationsCount > 0 ? 'review' : 'safe';
        },
        error: (err) => {
          // If 404 or any other error, assume safe
          attempt.proctoringStatus = 'safe';
        }
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/courses', this.courseId, 'quizzes']);
  }

  // --- Review Answers Modal ---
  private getReviewModal(): any {
    if (!this.reviewModalInstance) {
      const el = document.getElementById('answersReviewModal');
      if (el) {
        this.reviewModalInstance = new bootstrap.Modal(el);
      }
    }
    return this.reviewModalInstance;
  }

  openReviewModal(attempt: QuizAttemptDto): void {
    this.selectedAttempt = attempt;
    this.getReviewModal()?.show();
  }

  closeReviewModal(): void {
    this.getReviewModal()?.hide();
    this.selectedAttempt = null;
  }

  // --- Proctoring & AI Risk Modal ---
  private getProctoringModal(): any {
    if (!this.proctoringModalInstance) {
      const el = document.getElementById('proctoringRiskModal');
      if (el) {
        this.proctoringModalInstance = new bootstrap.Modal(el);
      }
    }
    return this.proctoringModalInstance;
  }

  openProctoringModal(attempt: QuizAttemptViewModel): void {
    if (attempt.proctoringStatus !== 'review' || !attempt.cheatingReportId) return;

    this.selectedProctoringAttempt = attempt;
    if (this.selectedProctoringAttempt.draftScore === undefined) {
      this.selectedProctoringAttempt.draftScore = attempt.score;
    }
    this.activeProctoringTab = 'logs';
    this.cheatingReport = null;
    this.riskAssessment = null;
    this.isRiskAssessmentLoading = false;
    this.riskAssessmentNotFound = false;
    
    this.getProctoringModal()?.show();

    this.cheatingReportService.getCheatingReport(attempt.attemptId).subscribe({
      next: (report) => {
        this.cheatingReport = report;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load cheating report details.', 'error');
      }
    });
  }

  closeProctoringModal(): void {
    this.getProctoringModal()?.hide();
    this.selectedProctoringAttempt = null;
    this.cheatingReport = null;
    this.riskAssessment = null;
  }

  switchProctoringTab(tab: 'logs' | 'ai'): void {
    this.activeProctoringTab = tab;
    if (tab === 'ai' && !this.riskAssessment && !this.riskAssessmentNotFound && this.selectedProctoringAttempt?.cheatingReportId) {
      this.loadRiskAssessment(this.selectedProctoringAttempt.cheatingReportId);
    }
  }

  loadRiskAssessment(reportId: number): void {
    this.isRiskAssessmentLoading = true;
    this.riskAssessmentNotFound = false;
    this.cheatingReportService.getRiskAssessment(reportId).subscribe({
      next: (assessment) => {
        this.riskAssessment = assessment;
        this.computeDynamicMax();
        this.isRiskAssessmentLoading = false;
      },
      error: (err) => {
        this.isRiskAssessmentLoading = false;
        if (err.status === 404) {
          this.riskAssessmentNotFound = true;
        } else {
          Swal.fire('Error', 'Failed to load risk assessment.', 'error');
        }
      }
    });
  }

  dynamicRiskMax = 1;
  yAxisTicks: number[] = [];

  private computeDynamicMax(): void {
    if (!this.riskAssessment || !this.riskAssessment.questions || this.riskAssessment.questions.length === 0) {
      this.dynamicRiskMax = 1;
      this.yAxisTicks = [1, 0.75, 0.5, 0.25, 0];
      return;
    }

    let maxVal = 0;
    this.riskAssessment.questions.forEach(q => {
      if (q.studentRiskScore > maxVal) maxVal = q.studentRiskScore;
      if (q.cohortAvgRiskScore > maxVal) maxVal = q.cohortAvgRiskScore;
    });

    if (maxVal === 0) maxVal = 1;

    this.dynamicRiskMax = maxVal * 1.15;

    this.yAxisTicks = [
      this.dynamicRiskMax,
      this.dynamicRiskMax * 0.75,
      this.dynamicRiskMax * 0.5,
      this.dynamicRiskMax * 0.25,
      0
    ];
  }

  deleteViolation(violationId: number): void {
    Swal.fire({
      title: 'Delete Violation?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cheatingReportService.deleteViolation(violationId).subscribe({
          next: () => {
            if (this.cheatingReport) {
              this.cheatingReport.violations = this.cheatingReport.violations.filter(v => v.id !== violationId);
            }
            if (this.selectedProctoringAttempt) {
              this.selectedProctoringAttempt.violationsCount = Math.max(0, (this.selectedProctoringAttempt.violationsCount || 1) - 1);
              if (this.selectedProctoringAttempt.violationsCount === 0) {
                this.selectedProctoringAttempt.proctoringStatus = 'safe';
                // Close modal if no violations left? Or leave it open. Let's just update status.
              }
            }
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete violation', 'error');
          }
        });
      }
    });
  }

  deleteCheatingReport(reportId: number): void {
    Swal.fire({
      title: 'Delete Entire Report?',
      text: "This will permanently delete the cheating report and all associated violations. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete report!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cheatingReportService.deleteReport(reportId).subscribe({
          next: () => {
            if (this.selectedProctoringAttempt) {
              this.selectedProctoringAttempt.proctoringStatus = 'safe';
              this.selectedProctoringAttempt.cheatingReportId = undefined;
              this.selectedProctoringAttempt.violationsCount = 0;
            }
            this.closeProctoringModal();
            Swal.fire('Deleted!', 'The cheating report has been deleted.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete cheating report.', 'error');
          }
        });
      }
    });
  }

  openEvidence(url: string): void {
    window.open(url, '_blank');
  }

  // --- Score Update (Instructor / Admin) ---

  finalizeGrade(attempt: QuizAttemptViewModel): void {
    if (attempt.draftScore === undefined || attempt.draftScore < 0) {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'warning',
        title: 'Please enter a valid non-negative score',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    this.attemptsService.finalizeScore(attempt.attemptId, attempt.draftScore).subscribe({
      next: (res) => {
        attempt.score = res.score;
        attempt.isScoreLocked = true;
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Score Finalized & Locked',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: (err) => {
        if (err.status === 409) {
          attempt.isScoreLocked = true;
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'error',
            title: err.error?.message || 'Score is already finalized and locked.',
            showConfirmButton: false,
            timer: 4000
          });
        } else {
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'error',
            title: err.error?.message || 'Failed to finalize score.',
            showConfirmButton: false,
            timer: 4000
          });
        }
      }
    });
  }

  startEditScore(attempt: QuizAttemptViewModel): void {
    attempt.isEditingScore = true;
    attempt.draftScore = attempt.score;
  }

  cancelEditScore(attempt: QuizAttemptViewModel): void {
    attempt.isEditingScore = false;
    attempt.draftScore = undefined;
  }

  saveAdminScore(attempt: QuizAttemptViewModel): void {
    if (attempt.draftScore === undefined || attempt.draftScore < 0) {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'warning',
        title: 'Please enter a valid non-negative score',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    this.attemptsService.updateScoreAdmin(attempt.attemptId, attempt.draftScore).subscribe({
      next: (res) => {
        attempt.score = res.score;
        attempt.isEditingScore = false;
        attempt.draftScore = undefined;
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Score Overridden Successfully',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: (err) => {
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'error',
          title: err.error?.message || 'Failed to update score.',
          showConfirmButton: false,
          timer: 4000
        });
      }
    });
  }

  // --- Helpers ---
  scorePercent(attempt: QuizAttemptDto): number {
    if (!attempt || !attempt.quizTotalMarks) return 0;
    return Math.round((attempt.score / attempt.quizTotalMarks) * 100);
  }

  scoreClass(attempt: QuizAttemptDto): string {
    const pct = this.scorePercent(attempt);
    if (pct >= 75) return 'text-success';
    if (pct >= 50) return 'text-warning';
    return 'text-danger';
  }

  scoreBadgeClass(attempt: QuizAttemptDto): string {
    const pct = this.scorePercent(attempt);
    if (pct >= 75) return 'score-badge-high';
    if (pct >= 50) return 'score-badge-mid';
    return 'score-badge-low';
  }

  getRiskScoreClass(score: number): string {
    if (score < 0.4) return 'risk-low';
    if (score < 0.7) return 'risk-med';
    return 'risk-high';
  }
}
