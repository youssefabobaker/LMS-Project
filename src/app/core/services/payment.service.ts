import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentStartResponse {
  paymentUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/api/Payment`;

  constructor(private http: HttpClient) { }

  startPayment(): Observable<PaymentStartResponse> {
    return this.http.post<PaymentStartResponse>(`${this.baseUrl}/Start`, {});
  }
}
