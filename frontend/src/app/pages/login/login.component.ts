import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, DEV_USERS, DevUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly devUsers: DevUser[] = DEV_USERS;

  isLoading = false;
  loadingUserId: string | null = null;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  login(user: DevUser): void {
    this.isLoading = true;
    this.loadingUserId = user.userId;
    this.error = null;

    this.auth.login(user.userId, user.roles).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.loadingUserId = null;
        this.error = err?.error?.message ?? 'Authentication failed. Is the API running?';
      }
    });
  }
}
