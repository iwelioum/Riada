import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ClassSession, ClubSummary } from '../../core/models/api-models';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss'
})
export class ClassesComponent implements OnInit {
  sessions: ClassSession[] = [];
  clubs: ClubSummary[] = [];
  loading = false;
  clubId = 1;
  days = 14;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadClubs();
  }

  loadClubs() {
    this.apiService.listClubs().subscribe({
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

  loadSessions() {
    this.loading = true;
    this.apiService.getUpcomingSessions(this.clubId, this.days).subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Scheduled':
        return 'badge-info';
      case 'Ongoing':
        return 'badge-warning';
      case 'Completed':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  bookSession(sessionId: number) {
    const memberId = prompt('Enter member ID:');
    const parsedMemberId = memberId ? parseInt(memberId, 10) : null;
    if (parsedMemberId) {
      this.apiService.bookSession(sessionId, parsedMemberId).subscribe({
        next: () => {
          alert('Session booked successfully');
          this.loadSessions();
        },
        error: (err) => {
          console.error('Error booking session:', err);
          alert('Failed to book session');
        }
      });
    }
  }
}
