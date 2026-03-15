import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Session, ClubSummary } from '../../core/models/api-models';

interface SessionDay {
  date: string;
  sessions: Session[];
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent implements OnInit {
  grouped: SessionDay[] = [];
  clubs: ClubSummary[] = [];
  clubId = 1;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.listClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs || [];
        if (this.clubs.length && !this.clubs.find(c => c.id === this.clubId)) {
          this.clubId = this.clubs[0].id;
        }
        this.loadSessions();
      },
      error: () => this.loadSessions()
    });
  }

  loadSessions(): void {
    this.loading = true;
    this.api.getUpcomingSessions(this.clubId, 14).subscribe({
      next: (sessions) => {
        const bucket = sessions.reduce<Record<string, Session[]>>((acc, s) => {
          const key = new Date(s.startsAt).toDateString();
          acc[key] = acc[key] || [];
          acc[key].push(s);
          return acc;
        }, {});

        this.grouped = Object.entries(bucket).map(([date, sess]) => ({
          date,
          sessions: sess.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        }));
      },
      error: () => (this.grouped = []),
      complete: () => (this.loading = false)
    });
  }
}
