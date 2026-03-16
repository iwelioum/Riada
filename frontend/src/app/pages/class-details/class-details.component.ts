import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  warningMessage: string | null = null;
  successMessage: string | null = null;
  actionError: string | null = null;
  actionInProgress: 'book' | 'cancel' | null = null;
  memberIdInput = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = rawId ? Number(rawId) : Number.NaN;
    if (!Number.isInteger(parsedId) || parsedId < 1) {
      this.loading = false;
      this.errorMessage = 'Invalid class identifier. Open this page from the Classes list.';
      return;
    }

    this.sessionId = parsedId;
    this.loadSession();
  }

  loadSession(preserveFeedback = false): void {
    if (!this.sessionId) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.warningMessage = null;
    if (!preserveFeedback) {
      this.successMessage = null;
      this.actionError = null;
    }

    this.api.listClubs().subscribe({
      next: (clubs) => {
        if (!clubs.length) {
          this.session = null;
          this.errorMessage = 'No clubs available to resolve class details.';
          this.loading = false;
          return;
        }

        const issues: string[] = [];
        const requests = clubs.map((club) =>
          this.api.getUpcomingSessions(club.id, 60).pipe(
            catchError((error) => {
              issues.push(this.getErrorMessage(error, `Unable to load sessions for ${club.name}.`));
              return of([] as Session[]);
            })
          )
        );

        forkJoin(requests).subscribe({
          next: (sessionGroups) => {
            const sessions = sessionGroups.flat();
            this.session = sessions.find((session) => session.id === this.sessionId) ?? null;

            if (!this.session) {
              this.errorMessage = issues.length
                ? issues[0]
                : 'Class not found in the upcoming schedule window.';
            } else if (issues.length) {
              this.warningMessage = issues[0];
            }
          },
          error: (error) => {
            this.session = null;
            this.errorMessage = this.getErrorMessage(error, 'Failed to load class details.');
          },
          complete: () => {
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.session = null;
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error, 'Failed to load clubs for class lookup.');
      }
    });
  }

  bookSession(): void {
    this.runAction('book');
  }

  cancelBooking(): void {
    this.runAction('cancel');
  }

  private runAction(action: 'book' | 'cancel'): void {
    this.successMessage = null;
    this.actionError = null;

    if (!this.session) {
      this.actionError = 'Class details are not loaded yet.';
      return;
    }

    const memberId = Number(this.memberIdInput);
    if (!Number.isInteger(memberId) || memberId < 1) {
      this.actionError = 'Member ID must be a positive integer.';
      return;
    }
    if (action === 'book' && !this.canBookCurrentSession) {
      this.actionError = 'This session is already at full capacity.';
      return;
    }

    this.actionInProgress = action;
    const request = action === 'book'
      ? this.api.bookSession(this.session.id, memberId)
      : this.api.cancelBooking(memberId, this.session.id);

    request.subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.memberIdInput = '';
        this.actionInProgress = null;
        this.loadSession(true);
      },
      error: (error) => {
        this.actionError = this.getErrorMessage(error, `Failed to ${action === 'book' ? 'book' : 'cancel'} this session.`);
        this.actionInProgress = null;
      }
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again to access class details.';
      }
      if (error.status === 403) {
        return 'Your role does not allow this class operation.';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return fallback;
  }

  get canBookCurrentSession(): boolean {
    if (!this.session) {
      return false;
    }

    return this.session.maxCapacity > 0 && this.session.enrolledCount < this.session.maxCapacity;
  }
}
