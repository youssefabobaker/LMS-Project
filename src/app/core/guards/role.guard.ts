import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;
  const userRoles = permissionService.getRole();

  if (userRoles.includes(requiredRole)) {
    return true;
  }

  if (router.url !== '/' && router.url !== state.url) {
    return router.parseUrl(router.url);
  }

  return router.parseUrl('/dashboard');
};
