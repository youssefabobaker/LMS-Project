import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/landing-page/landing-page.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { EmailConfirmationComponent } from './features/auth/email-confirmation/email-confirmation.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { authGuard } from './core/guards/auth.guard';
import { RoleManagementComponent } from './features/role-management/role-management.component';
import { UserManagementComponent } from './features/user-management/user-management.component';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forget-password', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'Auth/emailConfrimation', component: EmailConfirmationComponent },
  { path: 'auth/forgetPassword', component: ResetPasswordComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard], // القفل الرئيسي
    children: [
      // هنا بقى "الأبناء" اللي هيظهروا جوه الـ router-outlet بتاع الداشبورد
      {
        path: 'roles',
        component: RoleManagementComponent,
        canActivate: [permissionGuard], // القفل الجديد
        data: { permission: 'roles:read' }, // المفتاح المطلوب
      },
      {
        path: 'users',
        component: UserManagementComponent,
        canActivate: [permissionGuard], // القفل الجديد
        data: { permission: 'users:read' }, // المفتاح المطلوب
      },
      // مسار افتراضي عشان لما يفتح Dashboard متبقاش فاضية
      // { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
  { path: '', component: LandingPageComponent },
  { path: '**', redirectTo: '' },
];
