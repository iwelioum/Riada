import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Session } from '../../core/models/api-models';

@Component({
  selector: 'app-class-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './class-details.component.html',
  styleUrl: './class-details.component.scss'
})
export class ClassDetailsComponent implements OnInit {
  sessionId: number | null = null;
  session: Session | null = null;
  loading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  actionError: string | null = null;
  actionInProgress: 'book' | 'cancel' | null = null;
  memberIdInput = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = rawId ? Number(rawId) : Number.NaN;
    if (!Number.isInteger(parsedId) || parsedId < 1) {
      this.loading = false;
      this.errorMessage = 'Invalid class identifier.';
      return;
    }

    this.sessionId = parsedId;
    this.loadSession();
  }

  loadSession(preserveFeedback = false): void {
    if (!this.sessionId) return;

    this.loading = true;
    this.errorMessage = null;
    if (!preserveFeedback) {
      this.successMessage = null;
      this.actionError = null;
    }

    this.api.getSessionById(this.sessionId).subscribe({
      next: (s) => {
        this.session = s;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'Class not found.');
        this.loading = false;
      }
    });
  }

  bookSession(): void { this.runAction('book'); }
  cancelBooking(): void { this.runAction('cancel'); }

  private runAction(action: 'book' | 'cancel'): void {
    this.successMessage = null;
    this.actionError = null;

    if (!this.session) { this.actionError = 'Class not loaded.'; return; }

    const memberId = Number(this.memberIdInput);
    if (!Number.isInteger(memberId) || memberId < 1) {
      this.actionError = 'Enter a valid member ID.';
      return;
    }

    this.actionInProgress = action;
    const req = action === 'book'
      ? this.api.bookSession(this.session.id, memberId)
      : this.api.cancelBooking(memberId, this.session.id);

    req.subscribe({
      next: (r) => {
        this.successMessage = r.message;
        this.memberIdInput = '';
        this.actionInProgress = null;
        this.loadSession(true);
      },
      error: (err) => {
        this.actionError = this.getErrorMessage(err, `Failed to ${action} session.`);
        this.actionInProgress = null;
      }
    });
  }

  goToSchedule(): void { this.router.navigate(['/schedule']); }

  get canBook(): boolean {
    return !!this.session && this.session.maxCapacity > 0 && this.session.enrolledCount < this.session.maxCapacity;
  }

  get canBookCurrentSession(): boolean {
    return this.canBook;
  }

  get warningMessage(): string | null {
    if (!this.session || this.canBookCurrentSession) {
      return null;
    }
    return 'This class is currently full. New bookings may be waitlisted.';
  }

  private getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) return 'Session expired.';
      if (err.status === 403) return 'Access denied.';
      if (err.status === 404) return 'Class session not found.';
      const msg = err.error?.message ?? err.error?.Message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    return fallback;
  }
}
