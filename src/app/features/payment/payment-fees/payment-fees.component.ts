import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-fees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-fees.component.html',
  styleUrls: ['./payment-fees.component.css']
})
export class PaymentFeesComponent implements OnInit {
  studentName: string = '';
  studentEmail: string = '';
  isLoading: boolean = false;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    this.studentName = `${firstName} ${lastName}`.trim() || 'Student';
    this.studentEmail = localStorage.getItem('userEmail') || 'No email found';
  }

  proceedToPayment(): void {
    this.isLoading = true;
    this.paymentService.startPayment().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.paymentUrl) {
          window.open(response.paymentUrl, '_blank');
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Invalid response from payment server.',
            icon: 'error',
            background: '#1a1d21',
            color: '#fff',
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        const apiErrorMessage = err.error || err.message || 'Unable to initiate payment.';
        
        Swal.fire({
          title: 'Payment Issue',
          text: typeof apiErrorMessage === 'string' ? apiErrorMessage : 'An error occurred while initiating payment.',
          icon: 'warning',
          background: '#1a1d21',
          color: '#fff',
        });
      }
    });
  }
}
