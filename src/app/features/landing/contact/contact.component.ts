import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm: FormGroup;
  isSending = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.maxLength(250)]],
      messageContent: ['', [Validators.required, Validators.maxLength(5000)]]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSending = true;

    this.http.post<{ message: string }>(`${environment.apiUrl}/api/Contact`, this.contactForm.value)
      .subscribe({
        next: (response) => {
          this.isSending = false;
          Swal.fire('Success', response.message || 'Your message has been sent successfully.', 'success');
          this.contactForm.reset();
        },
        error: (err) => {
          this.isSending = false;
          let errorMessage = 'An unexpected error occurred. Please try again later.';
          if (err.error?.errors) {
            errorMessage = Object.values(err.error.errors).flat().join('<br>');
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          Swal.fire('Error', errorMessage, 'error');
        }
      });
  }
}
