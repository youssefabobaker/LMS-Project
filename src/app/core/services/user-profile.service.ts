import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private baseUrl = 'https://localhost:7289/me'; // الـ Base URL من الـ PDF [cite: 4]

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get(`${this.baseUrl}`);
  }

  updateProfile(formData: FormData) {
    return this.http.put(`${this.baseUrl}/info`, formData);
  }

  changePassword(data: any) {
    return this.http.put(`${this.baseUrl}/change-password`, data);
  }

  levelUp() {
    return this.http.put(`${this.baseUrl}/LevelUp`, {});
  }
}
