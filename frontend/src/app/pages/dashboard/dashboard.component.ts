import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Session, RiskScore, ClubSummary } from '../../core/models/api-models';

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
    revenue: 5400,
    risks: 0
  };

  upcomingSessions: Session[] = [];
  riskAlerts: RiskScore[] = [];
  clubs: ClubSummary[] = [];
  clubId = 1;
  loading = true;

  quickActions = [
    { label: 'Add member', icon: '➕' },
    { label: 'Book class', icon: '🎫' },
    { label: 'Record payment', icon: '💳' },
    { label: 'Open ticket', icon: '🛠️' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.listClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs || [];
        if (this.clubs.length && !this.clubs.find(c => c.id === this.clubId)) {
          this.clubId = this.clubs[0].id;
        }
        this.loadMetrics();
      },
      error: () => this.loadMetrics()
    });
  }

  loadMetrics(): void {
    this.loading = true;

    this.api.getMembers({ page: 1, pageSize: 1 }).subscribe({
      next: (response) => (this.stats.members = response.totalCount || 0),
      error: () => (this.stats.members = 0)
    });

    this.api.getUpcomingSessions(this.clubId, 14).subscribe({
      next: (sessions) => {
        this.upcomingSessions = sessions;
        this.stats.sessions = sessions.length;
      },
      error: () => {
        this.upcomingSessions = [];
        this.stats.sessions = 0;
      }
    });

    this.api.getRiskScores(5).subscribe({
      next: (risks) => {
        this.riskAlerts = risks || [];
        this.stats.risks = risks?.length || 0;
      },
      error: () => {
        this.riskAlerts = [];
        this.stats.risks = 0;
      },
      complete: () => (this.loading = false)
    });
  }

  firstSessions(limit = 3): Session[] {
    return this.upcomingSessions.slice(0, limit);
  }
}
