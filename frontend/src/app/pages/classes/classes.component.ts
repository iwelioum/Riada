import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ClassSession, ClubSummary } from '../../core/models/api-models';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassesComponent implements OnInit {
  sessions: ClassSession[] = [];
  clubs: ClubSummary[] = [];
  clubsLoading = false;
  loading = false;
  hasLoadedSessions = false;
  clubId: number | null = null;
  days = 14;
  pageError: string | null = null;
  clubsError: string | null = null;
  bookingError: string | null = null;
  bookingSuccess: string | null = null;
  bookingSessionId: number | null = null;
  bookingMemberId: number | null = null;
  bookingInProgress = false;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.clubsLoading = true;
    this.clubsError = null;
    this.cdr.markForCheck();
    this.apiService.listClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs || [];
        if (this.clubs.length && (this.clubId === null || !this.clubs.find((club) => club.id === this.clubId))) {
          this.clubId = this.clubs[0].id;
        }
        if (!this.clubs.length) {
          this.clubId = null;
        }
        this.clubsLoading = false;
        this.cdr.markForCheck();
        this.loadSessions();
      },
      error: (error) => {
        this.clubs = [];
        this.clubId = null;
        this.clubsLoading = false;
        this.clubsError = this.getErrorMessage(error, 'Unable to load clubs.');
        this.cdr.markForCheck();
        this.loadSessions();
      }
    });
  }

  loadSessions(): void {
    this.pageError = null;
    this.hasLoadedSessions = false;

    if (!Number.isInteger(this.days) || this.days < 1 || this.days > 60) {
      this.sessions = [];
      this.pageError = 'Days filter must be between 1 and 60.';
      this.hasLoadedSessions = true;
      this.cdr.markForCheck();
      return;
    }

    if (!this.clubId) {
      this.sessions = [];
      this.loading = false;
      this.hasLoadedSessions = true;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();
    this.apiService.getUpcomingSessions(this.clubId, this.days).subscribe({
      next: (data) => {
        this.sessions = [...(data || [])].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        this.hasLoadedSessions = true;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.sessions = [];
        this.pageError = this.getErrorMessage(error, 'Unable to load sessions.');
        this.hasLoadedSessions = true;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openBookingForm(sessionId: number): void {
    if (this.bookingInProgress || !this.canBookSession(sessionId)) {
      return;
    }
    this.bookingError = null;
    this.bookingSuccess = null;
    this.bookingMemberId = null;
    this.bookingSessionId = sessionId;
  }

  cancelBookingForm(clearMessages = true): void {
    this.bookingSessionId = null;
    this.bookingMemberId = null;
    if (clearMessages) {
      this.bookingError = null;
    }
  }

  submitBooking(): void {
    this.bookingError = null;
    this.bookingSuccess = null;

    const selectedSession = this.selectedBookingSession;
    if (!selectedSession) {
      this.bookingError = 'Select a session before creating a booking.';
      return;
    }
    if (!this.canBook(selectedSession)) {
      this.bookingError = 'This session is full.';
      return;
    }

    const memberId = Number(this.bookingMemberId);
    if (!Number.isInteger(memberId) || memberId < 1) {
      this.bookingError = 'Member ID must be a positive whole number.';
      return;
    }

    this.bookingInProgress = true;
    this.apiService.bookSession(selectedSession.id, memberId).subscribe({
      next: (response) => {
        this.bookingSuccess = response.message || 'Session booked successfully.';
        this.sessions = this.sessions.map((session) => {
          if (session.id !== selectedSession.id) {
            return session;
          }

          const enrolledCount = Math.min(session.enrolledCount + 1, session.maxCapacity);
          const occupancyPercent = session.maxCapacity > 0
            ? Math.round((enrolledCount / session.maxCapacity) * 100)
            : session.occupancyPercent;

          return {
            ...session,
            enrolledCount,
            occupancyPercent
          };
        });
        this.cancelBookingForm(false);
      },
      error: (error) => {
        this.bookingError = this.getErrorMessage(error, 'Failed to book session.');
      },
      complete: () => {
        this.bookingInProgress = false;
      }
    });
  }

  canBook(session: ClassSession): boolean {
    return session.maxCapacity > 0 && session.enrolledCount < session.maxCapacity;
  }

  isBooking(sessionId: number): boolean {
    return this.bookingSessionId === sessionId;
  }

  canBookSession(sessionId: number): boolean {
    const session = this.sessions.find((item) => item.id === sessionId);
    return !!session && this.canBook(session);
  }

  get selectedBookingSession(): ClassSession | undefined {
    return this.sessions.find((session) => session.id === this.bookingSessionId);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again to access class booking.';
      }
      if (error.status === 403) {
        return 'Your role does not allow class booking operations.';
      }

      const backendMessage = error.error?.message ?? error.error?.Message;
      if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
        return backendMessage;
      }
    }

    return fallback;
  }
}
