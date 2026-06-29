import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserProfileService } from '../../core/services/user-profile.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { PermissionService } from '../../core/services/permission.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  @Input() isDrawer: boolean = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  userProfile: any;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  activeTab: 'info' | 'password' | null = null;
  selectedFile: File | null = null;
  localProfileImageUrl: string | null = null;

  isUpdatingProfile = false;
  isUpdatingPassword = false;

  constructor(
    private userProfileService: UserProfileService,
    private fb: FormBuilder,
    private router: Router,
    private permissionService: PermissionService, // حقن السيرفس هنا
  ) {
    this.initForms();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  ngOnInit() {
    // Ensure the profile is fetched (no-op if already cached by DashboardComponent).
    this.userProfileService.loadProfile();
    // Reactively subscribe — skip null (initial BehaviorSubject value before data arrives).
    this.userProfileService.userProfile$.pipe(filter(data => data !== null)).subscribe(data => {
      this.userProfile = data;
      // Only set the local preview if it hasn't been locally overridden by a new selection
      if (!this.selectedFile) {
         this.localProfileImageUrl = data.profilePictureUrl;
      }
      this.profileForm.patchValue(data);
    });
  }

  initForms() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      academicYear: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?#&]).*',
          ),
        ],
      ],
    });
  }


  async updateInfo() {
    if (this.profileForm.valid) {
      const formData = new FormData();

      let academicYearValue = this.profileForm.get('academicYear')?.value;

      // لو معندوش صلاحية، بنجبر القيمة تبقى Default
      if (!this.hasPermission('Profile:levelUp')) {
        academicYearValue = 'Default';
      }

      formData.append('firstName', this.profileForm.get('firstName')?.value);
      formData.append('lastName', this.profileForm.get('lastName')?.value);
      formData.append(
        'dateOfBirth',
        this.profileForm.get('dateOfBirth')?.value,
      );
      formData.append('academicYear', academicYearValue);

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      } else if (this.userProfile?.profilePictureUrl) {
        try {
          // Fetch the exact image the browser is currently displaying from the browser cache
          // This guarantees we get the NEW picture that is visibly on the screen, 
          // avoiding server-side query parameter bugs or stale CDN fetches.
          const response = await fetch(this.userProfile.profilePictureUrl, { cache: 'force-cache' });
          const blob = await response.blob();
          
          // Extract the actual filename from the URL instead of a hardcoded name
          let filename = this.userProfile.profilePictureUrl.substring(this.userProfile.profilePictureUrl.lastIndexOf('/') + 1) || 'profile.jpg';
          if (filename.includes('?')) filename = filename.split('?')[0];

          const file = new File([blob], filename, {
            type: blob.type || 'image/jpeg',
          });
          formData.append('file', file);
        } catch (e) {
          Swal.fire(
            'Error',
            'Could not process current profile image',
            'error',
          );
          return;
        }
      } else {
        Swal.fire(
          'Notice',
          'A profile picture is required by the server.',
          'warning',
        );
        return;
      }
      
      this.isUpdatingProfile = true;

      this.userProfileService.updateProfile(formData).subscribe({
        next: () => {
          this.isUpdatingProfile = false;
          // We intentionally DO NOT reset this.selectedFile = null here.
          // By keeping it in memory, if the user hits "Save" again for text edits,
          // it re-uploads the known good local file instead of fetching the potentially
          // cached old image from the browser's cache.
          
          Swal.fire('Success', 'Profile Updated Successfully', 'success');
          // Re-fetch the full profile from the server so the profilePictureUrl
          // is always the correct server URL and is broadcast to all subscribers
          // (dashboard header + profile card) without needing a page reload.
          this.userProfileService.getProfile().subscribe();
        },
        error: (err) => {
          this.isUpdatingProfile = false;
          Swal.fire('Error', 'Update Failed', 'error');
        },
      });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Optional: Update the local image preview instantly for a better UX
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.localProfileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // Immediately call the endpoint to save it with current form info
      this.updateInfo();
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      this.isUpdatingPassword = true;
      this.userProfileService
        .changePassword(this.passwordForm.value)
        .subscribe({
          next: () => {
            this.isUpdatingPassword = false;
            Swal.fire('Success', 'Password changed successfully', 'success');
            this.passwordForm.reset();
          },
          error: (err) => {
            this.isUpdatingPassword = false;
            Swal.fire(
              'Error',
              err.error?.errorMessage || 'Failed to change password',
              'error',
            );
          },
        });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  handleLevelUp() {
    this.userProfileService.levelUp().subscribe({
      next: () => {
        Swal.fire('Congrats!', 'You leveled up!', 'success');
        // Re-fetch the full profile so the new academic year AND profile picture
        // are reflected immediately in the card and dashboard header.
        this.userProfileService.getProfile().subscribe();
      },
      error: (err) =>
        Swal.fire(
          'Notice',
          err.error?.errorMessage || 'Failed to level up',
          'info',
        ),
    });
  }

  handleAction(action: 'info' | 'password') {
    if (this.isDrawer) {
      this.closeDrawer.emit();
      this.router.navigate(['/dashboard/settings'], { queryParams: { tab: action } });
    } else {
      this.activeTab = this.activeTab === action ? null : action;
    }
  }

  triggerLogout() {
    this.logout.emit();
  }
}
