import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { RoleService } from '../services/role.service';
import { NotificationService } from '../services/notification.service';

/**
 * Role-based route guard.
 * Usage in routes:
 * {
 *   path: 'admin-panel',
 *   canActivate: [roleGuard],
 *   data: { roles: ['admin'] },
 *   loadComponent: () => ...
 * }
 *
 * Supports:
 * - Single role: data: { roles: ['admin'] }
 * - Multiple roles (OR): data: { roles: ['admin', 'manager'] }
 * - No roles requirement: just use authGuard
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const roleService = inject(RoleService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  const requiredRoles: string[] = route.data['roles'] || [];

  // If no roles specified, allow access (let authGuard handle basic auth)
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userRoles = roleService.getRoles();

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role =>
    userRoles.some(userRole => userRole.toLowerCase() === role.toLowerCase())
  );

  if (!hasRequiredRole) {
    notification.error('You do not have permission to access this page.');
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
