import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Session, RiskScore, ClubSummary } from '../../core/models/api-models';

interface QuickAction {
  label: string;
  icon: string;
  helperText: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats = {
    members: 0,
    sessions: 0,
    risks: 0,
    clubs: 0
  };

  upcomingSessions: Session[] = [];
  riskAlerts: RiskScore[] = [];
  clubs: ClubSummary[] = [];
  clubId: number | null = null;
  clubsLoading = false;
  loading = false;
  errorMessage: string | null = null;
  clubsErrorMessage: string | null = null;
  partialErrors: string[] = [];
  infoMessage: string | null = null;
  lastUpdated: Date | null = null;
  hasLoadedOnce = false;

  quickActions: QuickAction[] = [
    { label: 'Add member', icon: '➕', helperText: 'Open Members to create a new profile safely.' },
    { label: 'Book class', icon: '🎫', helperText: 'Use Classes to assign a member to a session.' },
    { label: 'Record payment', icon: '💳', helperText: 'Open Billing to register an invoice payment.' },
    { label: 'Open ticket', icon: '🛠️', helperText: 'Use Equipment to report a maintenance issue.' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadClubsAndMetrics();
  }

  loadClubsAndMetrics(): void {
    this.clubsLoading = true;
    this.clubsErrorMessage = null;
    this.api.listClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs || [];
        this.stats.clubs = this.clubs.length;
        if (this.clubs.length && (this.clubId === null || !this.clubs.find((club) => club.id === this.clubId))) {
          this.clubId = this.clubs[0].id;
        }
        if (!this.clubs.length) {
          this.clubId = null;
        }
        this.clubsLoading = false;
        this.loadMetrics(null);
      },
      error: (error) => {
        this.clubs = [];
        this.clubId = null;
        this.stats.clubs = 0;
        this.clubsLoading = false;
        this.clubsErrorMessage = this.getErrorMessage(error, 'Unable to load clubs list.');
        this.loadMetrics(`Clubs: ${this.getErrorMessage(error, 'Unable to load clubs list.')}`);
      }
    });
  }

  loadMetrics(clubError: string | null = null): void {
    this.loading = true;
    this.hasLoadedOnce = false;
    this.errorMessage = null;
    this.infoMessage = null;
    this.partialErrors = [];
    const issues: string[] = [];
    const selectedClubId = this.clubId;

    if (clubError) {
      issues.push(clubError);
    }
    if (!selectedClubId) {
      issues.push('Sessions: select a club to load upcoming classes.');
    }

    forkJoin({
      memberCount: this.api.getMembers({ page: 1, pageSize: 1 }).pipe(
        map((response) => response.totalCount || 0),
        catchError((error) => {
          issues.push(`Members: ${this.getErrorMessage(error, 'Unable to load members count.')}`);
          return of(0);
        })
      ),
      sessions: selectedClubId ? this.api.getUpcomingSessions(selectedClubId, 14).pipe(
        catchError((error) => {
          issues.push(`Sessions: ${this.getErrorMessage(error, 'Unable to load upcoming sessions.')}`);
          return of([] as Session[]);
        })
      ) : of([] as Session[]),
      risks: this.api.getRiskScores(5).pipe(
        catchError((error) => {
          issues.push(`Risks: ${this.getErrorMessage(error, 'Unable to load churn risk signals.')}`);
          return of([] as RiskScore[]);
        })
      )
    }).subscribe({
      next: ({ memberCount, sessions, risks }) => {
        this.stats.members = memberCount;
        this.upcomingSessions = sessions;
        this.stats.sessions = sessions.length;
        this.riskAlerts = risks;
        this.stats.risks = risks.length;
        this.partialErrors = issues;
        this.lastUpdated = new Date();
        this.hasLoadedOnce = true;
        if (issues.length >= 3) {
          this.errorMessage = 'Dashboard data is currently unavailable. Please try again.';
        }
      },
      error: () => {
        this.errorMessage = 'Unexpected dashboard failure. Please retry.';
        this.hasLoadedOnce = true;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  firstSessions(limit = 3): Session[] {
    return this.upcomingSessions.slice(0, limit);
  }

  refresh(): void {
    this.loadClubsAndMetrics();
  }

  runQuickAction(action: QuickAction): void {
    this.infoMessage = `${action.label}: ${action.helperText}`;
  }

  get showEmptyState(): boolean {
    return this.hasLoadedOnce
      && !this.errorMessage
      && !this.partialErrors.length
      && this.stats.members === 0
      && this.upcomingSessions.length === 0
      && this.riskAlerts.length === 0;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Your session has expired. Sign in again to view dashboard data.';
      }
      if (error.status === 403) {
        return 'Your role does not allow access to this dashboard data.';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return fallback;
  }
}
