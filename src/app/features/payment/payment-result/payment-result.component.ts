import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css']
})
export class PaymentResultComponent implements OnInit {
  state: 'pending' | 'success' | 'failure' | 'loading' = 'loading';
  amountEGP: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Relying 100% on the URL query parameters
    this.route.queryParams.subscribe(params => {
      // If someone accesses /payment/result manually without any params
      if (!params['id'] || !params['order']) {
        this.router.navigate(['/dashboard']);
        return;
      }

      const success = params['success'] === 'true';
      const pending = params['pending'] === 'true';
      const errorOccured = params['error_occured'] === 'true';
      const amountCents = parseInt(params['amount_cents'] || '0', 10);
      
      this.amountEGP = amountCents / 100;

      if (success && !pending && !errorOccured) {
        this.state = 'success';
      } else if (pending) {
        this.state = 'pending';
      } else {
        this.state = 'failure';
      }
    });
  }

  tryAgain(): void {
    this.router.navigate(['/dashboard/Payment-fees']);
  }
}
