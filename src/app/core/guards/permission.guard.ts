import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // بنجيب اسم الصلاحية المطلوبة من بيانات المسار (Route Data)
  const requiredPermission = route.data['permission'] as string;

  if (permissionService.hasPermission(requiredPermission)) {
    return true; // مسموح له يدخل
  } else {
    // مش مسموح له، بنوديه لصفحة الـ Dashboard الأساسية أو يطلع Error
    router.navigate(['/dashboard']); 
    return false;
  }
};