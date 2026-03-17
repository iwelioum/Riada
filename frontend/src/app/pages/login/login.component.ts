import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, DEV_USERS, DevUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly devUsers: DevUser[] = DEV_USERS;

  mode: 'profiles' | 'manual' = 'profiles';
  manualUserId = '';
  manualRolesInput = 'billing';
  isLoading = false;
  loadingUserId: string | null = null;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  login(user: DevUser): void {
    this.startLogin(user.userId, user.roles, user.userId);
  }

  loginManual(): void {
    const userId = this.manualUserId.trim();
    const roles = this.parseRoles(this.manualRolesInput);
    if (!userId || roles.length === 0 || this.isLoading) {
      return;
    }

    this.startLogin(userId, roles, 'manual');
  }

  setMode(mode: 'profiles' | 'manual'): void {
    this.mode = mode;
    this.error = null;
  }

  get canSubmitManual(): boolean {
    return this.manualUserId.trim().length > 0 && this.parseRoles(this.manualRolesInput).length > 0 && !this.isLoading;
  }

  private startLogin(userId: string, roles: string[], loadingId: string): void {
    this.isLoading = true;
    this.loadingUserId = loadingId;
    this.error = null;

    this.auth.login(userId, roles).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.loadingUserId = null;
        this.error = this.getErrorMessage(error);
      }
    });
  }

  private parseRoles(value: string): string[] {
    return value
      .split(',')
      .map((role) => role.trim().toLowerCase())
      .filter((role) => role.length > 0);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Authentication rejected. Verify your user identifier and roles.';
      }
      if (error.status === 429) {
        const retryAfter = error.headers.get('Retry-After');
        return retryAfter
          ? `Too many attempts. Retry in about ${retryAfter} seconds.`
          : 'Too many attempts. Please retry shortly.';
      }
      if (error.status === 0) {
        return 'API unreachable. Ensure backend is running.';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return 'Authentication failed. Is the API running?';
  }
}
