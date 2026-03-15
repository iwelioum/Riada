import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AccessCheckResponse, ClubSummary } from '../../core/models/api-models';

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-control.component.html',
  styleUrl: './access-control.component.scss'
})
export class AccessControlComponent implements OnInit {
  clubs: ClubSummary[] = [];
  clubId: number | null = null;
  memberId?: number;
  guestId?: number;
  companionMemberId?: number;
  memberResult?: AccessCheckResponse;
  guestResult?: AccessCheckResponse;
  loadingMember = false;
  loadingGuest = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.listClubs().subscribe((clubs) => {
      this.clubs = clubs || [];
      if (this.clubs.length) this.clubId = this.clubs[0].id;
    });
  }

  checkMember() {
    if (!this.memberId || !this.clubId) return;
    this.loadingMember = true;
    this.api.checkMemberAccess({ memberId: this.memberId, clubId: this.clubId }).subscribe({
      next: (res) => (this.memberResult = res),
      error: () => (this.memberResult = { decision: 'Denied', denialReason: 'API error' }),
      complete: () => (this.loadingMember = false)
    });
  }

  checkGuest() {
    if (!this.guestId || !this.clubId || !this.companionMemberId) return;
    this.loadingGuest = true;
    this.api.checkGuestAccess({ guestId: this.guestId, companionMemberId: this.companionMemberId, clubId: this.clubId }).subscribe({
      next: (res) => (this.guestResult = res),
      error: () => (this.guestResult = { decision: 'Denied', denialReason: 'API error' }),
      complete: () => (this.loadingGuest = false)
    });
  }
}
