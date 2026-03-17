import { Injectable } from '@angular/core';
import { AuthSessionService } from './auth-session.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private session: AuthSessionService) {}

  getRoles(): string[] {
    return this.session.getRoles();
  }

  hasRole(role: string): boolean {
    return this.session.getRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.session.getRoles();
    return roles.some(r => userRoles.includes(r));
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}
