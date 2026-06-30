import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserProfileService } from '../../core/services/user-profile.service';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { PermissionService } from '../../core/services/permission.service';
import { NotificationComponent } from '../notification/notification.component';
import { CourseService } from '../../core/services/course.service';
import { ThemeService } from '../../core/services/theme.service';
import { Course } from '../../models/course';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, UserProfileComponent, RouterModule, NotificationComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  userProfile: any;
  isProfileOpen = false;   // controls profile drawer
  isSidebarOpen = false;   // controls mobile sidebar drawer
  role: string = '';       // stores user role
  isCoursesExpanded = false; // controls courses sub-menu
  sidebarCourses: Course[] = []; // courses shown in the sidebar sub-menu
  activeCourseId: number | null = null; // tracks currently open course
  private routerSub!: Subscription;
  private profileSub!: Subscription;
  private courseListSub!: Subscription;

  constructor(
    private userProfileService: UserProfileService,
    private permissionService: PermissionService,
    private courseService: CourseService,
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.themeService.initTheme();
    this.role = this.permissionService.getRole();
    this.userProfileService.loadProfile();
    this.profileSub = this.userProfileService.userProfile$.subscribe(data => {
      this.userProfile = data;
    });
    this.loadSidebarCourses();

    this.courseListSub = this.courseService.courseListUpdated$.subscribe(() => {
      this.loadSidebarCourses();
    });

    this.syncActiveCourseFromUrl(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => this.syncActiveCourseFromUrl(e.urlAfterRedirects));
  }

  private syncActiveCourseFromUrl(url: string): void {
    // Matches: /dashboard/courses/42/content
    const match = url.match(/\/courses\/(\d+)/);
    this.activeCourseId = match ? Number(match[1]) : null;
    // Auto-expand sub-menu if a course is active
    if (this.activeCourseId) this.isCoursesExpanded = true;
  }

  goHome(event: Event) {
    event.preventDefault();
    window.location.href = '/';
  }



  loadSidebarCourses() {
    if (this.hasPermission('Course:readAll')) {
      this.courseService.getAllCourses().subscribe({
        next: (courses) => this.sidebarCourses = courses.slice(0, 8),
        error: () => { }
      });
    } else if (this.hasPermission('Course:read')) {
      this.courseService.getCourses().subscribe({
        next: (courses) => this.sidebarCourses = courses.slice(0, 8),
        error: () => { }
      });
    }
  }

  toggleCourses(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isCoursesExpanded = !this.isCoursesExpanded;
  }

  navigateToCourseContent(course: Course): void {
    this.router.navigate(['/dashboard/courses', course.Id, 'content'], {
      state: { courseDetails: course }
    });
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  onLogout() {
    Swal.fire({
      title: 'sign out?',
      text: 'Are you sure you want to sign out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, sign out',
    }).then((result) => {
      if (result.isConfirmed) {
        const logoutData = {
          token: localStorage.getItem('token'),
          refreshToken: localStorage.getItem('refreshToken'),
        };

        this.authService.revokeToken(logoutData).subscribe({
          next: () => {
            localStorage.clear();
            this.userProfileService.clearProfile();
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error(
              'Server logout failed, but clearing local data anyway',
              err,
            );
            localStorage.clear();
            this.userProfileService.clearProfile();
            this.router.navigate(['/login']);
          },
        });
      }
    });
  }

  handleHamburgerClick() {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = !this.isSidebarOpen;
    } else {
      this.toggleProfile();
    }
  }

  // فنكشن التأكد من الصلاحية
  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  hasRole(roleToCheck: string): boolean {
    return this.role.includes(roleToCheck);
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.profileSub) this.profileSub.unsubscribe();
    if (this.courseListSub) this.courseListSub.unsubscribe();
  }
}
