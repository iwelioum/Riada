import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Session, ClubSummary } from '../../core/models/api-models';

interface SessionDay {
  dateKey: string;
  dateLabel: string;
  sessions: Session[];
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent implements OnInit {
  grouped: SessionDay[] = [];
  clubs: ClubSummary[] = [];
  clubId: number | null = null;
  days = 14;
  loading = true;
  clubsLoading = false;
  errorMessage: string | null = null;
  hasLoadedSessions = false;
  lastUpdated: Date | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.clubsLoading = true;
    this.api.listClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs || [];
        if (this.clubs.length && (this.clubId === null || !this.clubs.find((c) => c.id === this.clubId))) {
          this.clubId = this.clubs[0].id;
        }
        if (!this.clubs.length) {
          this.clubId = null;
        }
        this.clubsLoading = false;
        this.loadSessions();
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Unable to load clubs.');
        this.clubsLoading = false;
        this.loadSessions();
      }
    });
  }

  loadSessions(): void {
    this.hasLoadedSessions = false;
    this.errorMessage = null;
    if (!Number.isInteger(this.days) || this.days < 1 || this.days > 60) {
      this.grouped = [];
      this.errorMessage = 'Days filter must be between 1 and 60.';
      this.hasLoadedSessions = true;
      this.loading = false;
      return;
    }
    if (!this.clubId) {
      this.grouped = [];
      this.hasLoadedSessions = true;
      this.loading = false;
      return;
    }

    this.loading = true;
    this.api.getUpcomingSessions(this.clubId, this.days).subscribe({
      next: (sessions) => {
        const bucket = (sessions ?? []).reduce<Record<string, Session[]>>((acc, session) => {
          const date = new Date(session.startsAt);
          if (Number.isNaN(date.getTime())) {
            return acc;
          }

          const key = date.toISOString().slice(0, 10);
          acc[key] = acc[key] || [];
          acc[key].push(session);
          return acc;
        }, {});

        this.grouped = Object.entries(bucket)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([dateKey, daySessions]) => ({
            dateKey,
            dateLabel: new Date(dateKey).toDateString(),
            sessions: daySessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
          }));
        this.lastUpdated = new Date();
        this.hasLoadedSessions = true;
      },
      error: (error) => {
        this.grouped = [];
        this.errorMessage = this.getErrorMessage(error, 'Unable to load schedule.');
        this.hasLoadedSessions = true;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again to access the schedule.';
      }
      if (error.status === 403) {
        return 'Your role does not allow schedule access.';
      }

      const backendMessage = error.error?.message ?? error.error?.Message;
      if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
        return backendMessage;
      }
    }

    return fallback;
  }
}
