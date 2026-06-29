import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private baseUrl = `${environment.apiUrl}/me`; // الـ Base URL من الـ PDF [cite: 4]

  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  constructor(private http: HttpClient) { }

  /** Fetch profile from API and broadcast to all subscribers. Always hits the network. */
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}`).pipe(
      map(u => ({
        email: u.email ?? u.Email,
        firstName: u.firstName ?? u.FirstName,
        lastName: u.lastName ?? u.LastName,
        academicYear: u.academicYear ?? u.AcademicYear,
        profilePictureUrl: u.profilePictureUrl ?? u.ProfilePictureUrl,
        dateOfBirth: u.dateOfBirth ?? u.DateOfBirth,
      })),
      tap(profile => this.userProfileSubject.next(profile))
    );
  }

  /**
   * Call once on app start (e.g. from DashboardComponent).
   * Fetches the profile from the API only if the cache is empty AND no request
   * is already in flight, preventing duplicate calls during component init.
   */
  private isLoadingProfile = false;

  /**
   * Clears the cached profile. Must be called on logout so that
   * the next login always fetches fresh data for the new account.
   */
  clearProfile(): void {
    this.userProfileSubject.next(null);
    this.isLoadingProfile = false;
  }

  loadProfile(): void {
    if (this.userProfileSubject.value !== null || this.isLoadingProfile) return;
    this.isLoadingProfile = true;
    this.getProfile().subscribe({
      next: () => this.isLoadingProfile = false,
      error: (err) => {
        this.isLoadingProfile = false;
        console.error('Failed to load profile', err);
      }
    });
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
