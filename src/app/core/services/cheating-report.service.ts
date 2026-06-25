import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheatingReport, RiskAssessment } from '../../models/cheating-report.model';

@Injectable({
  providedIn: 'root'
})
export class CheatingReportService {
  private apiUrl = `${environment.apiUrl}/api/CheatingReport`;

  constructor(private http: HttpClient) { }

  getCheatingReport(attemptId: number): Observable<CheatingReport> {
    return this.http.get<CheatingReport>(`${this.apiUrl}/attempt/${attemptId}`);
  }

  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}`);
  }

  deleteViolation(violationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/violations/${violationId}`);
  }

  getRiskAssessment(reportId: number): Observable<RiskAssessment> {
    return this.http.get<RiskAssessment>(`${this.apiUrl}/${reportId}/risk-assessment`);
  }
}
