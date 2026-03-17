import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AccessCheckResponse, AccessLogEntry, ClubSummary, Guest, MemberSummary } from '../../core/models/api-models';

type ActiveTab = 'check' | 'history';

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-control.component.html',
  styleUrl: './access-control.component.scss'
})
export class AccessControlComponent implements OnInit {
  activeTab: ActiveTab = 'check';

  // Check tab
  clubs: ClubSummary[] = [];
  clubId: number | null = null;
  memberId: number | null = null;
  guestId: number | null = null;
  companionMemberId: number | null = null;
  memberLookupTerm = '';
  memberLookupLoading = false;
  memberLookupError: string | null = null;
  memberLookupResults: MemberSummary[] = [];
  companionLookupTerm = '';
  companionLookupLoading = false;
  companionLookupError: string | null = null;
  companionLookupResults: MemberSummary[] = [];
  guestLookupTerm = '';
  guestLookupLoading = false;
  guestLookupError: string | null = null;
  guestLookupResults: Guest[] = [];
  private allGuests: Guest[] = [];
  private memberLookupRequestId = 0;
  private companionLookupRequestId = 0;
  memberResult?: AccessCheckResponse;
  guestResult?: AccessCheckResponse;
  loadingClubs = false;
  loadingMember = false;
  loadingGuest = false;
  hasLoadedClubs = false;
  pageError: string | null = null;
  memberFormError: string | null = null;
  guestFormError: string | null = null;
  memberInfo: string | null = null;
  guestInfo: string | null = null;

  // History tab
  logEntries: AccessLogEntry[] = [];
  loadingLog = false;
  logError: string | null = null;
  logLoaded = false;
  logLimit = 50;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  switchTab(tab: ActiveTab): void {
    this.activeTab = tab;
    if (tab === 'history' && !this.logLoaded) {
      this.loadLog();
    }
  }

  loadClubs(): void {
    this.hasLoadedClubs = false;
    this.loadingClubs = true;
    this.pageError = null;
    this.api.listClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs || [];
        this.clubId = this.clubs.length ? this.clubs[0].id : null;
        this.hasLoadedClubs = true;
        this.loadingClubs = false;
      },
      error: (error) => {
        this.pageError = this.getErrorMessage(error, 'Unable to load clubs for access checks.');
        this.clubs = [];
        this.clubId = null;
        this.hasLoadedClubs = true;
        this.loadingClubs = false;
      }
    });
  }

  onClubChange() {
    this.memberResult = undefined;
    this.guestResult = undefined;
    this.memberInfo = null;
    this.guestInfo = null;
  }

  checkMember() {
    this.memberFormError = null;
    this.memberInfo = null;
    this.memberResult = undefined;

    if (!this.memberId || this.memberId < 1) {
      this.memberFormError = 'Member ID must be a positive number.';
      return;
    }
    if (!this.clubId) {
      this.memberFormError = 'Select a club before checking access.';
      return;
    }

    this.loadingMember = true;
    this.api.checkMemberAccess({ memberId: this.memberId, clubId: this.clubId }).subscribe({
      next: (res) => {
        this.memberResult = res;
        this.memberInfo = `Member access checked at ${new Date().toLocaleTimeString()}.`;
        this.logLoaded = false; // invalidate log cache so next tab switch refreshes
      },
      error: (error) => {
        this.memberFormError = this.getErrorMessage(error, 'Member access check failed.');
        this.memberResult = { decision: 'Denied', denialReason: this.memberFormError };
      },
      complete: () => (this.loadingMember = false)
    });
  }

  checkGuest() {
    this.guestFormError = null;
    this.guestInfo = null;
    this.guestResult = undefined;

    if (!this.guestId || this.guestId < 1) {
      this.guestFormError = 'Guest ID must be a positive number.';
      return;
    }
    if (!this.companionMemberId || this.companionMemberId < 1) {
      this.guestFormError = 'Companion member ID must be a positive number.';
      return;
    }
    if (!this.clubId) {
      this.guestFormError = 'Select a club before checking guest access.';
      return;
    }

    this.loadingGuest = true;
    this.api.checkGuestAccess({ guestId: this.guestId, companionMemberId: this.companionMemberId, clubId: this.clubId }).subscribe({
      next: (res) => {
        this.guestResult = res;
        this.guestInfo = `Guest access checked at ${new Date().toLocaleTimeString()}.`;
        this.logLoaded = false;
      },
      error: (error) => {
        this.guestFormError = this.getErrorMessage(error, 'Guest access check failed.');
        this.guestResult = { decision: 'Denied', denialReason: this.guestFormError };
      },
      complete: () => (this.loadingGuest = false)
    });
  }

  loadLog(): void {
    this.loadingLog = true;
    this.logError = null;
    this.api.getAccessLog(this.logLimit).subscribe({
      next: (entries) => {
        this.logEntries = entries;
        this.logLoaded = true;
        this.loadingLog = false;
      },
      error: (error) => {
        this.logError = this.getErrorMessage(error, 'Unable to load access log.');
        this.loadingLog = false;
      }
    });
  }

  refreshLog(): void {
    this.logLoaded = false;
    this.loadLog();
  }

  onMemberLookupChange(value: string): void {
    this.memberLookupTerm = value;
    this.memberLookupError = null;
    const term = value.trim();

    if (term.length < 2) {
      this.memberLookupResults = [];
      this.memberLookupLoading = false;
      return;
    }

    const requestId = ++this.memberLookupRequestId;
    this.memberLookupLoading = true;

    this.api.getMembers({ page: 1, pageSize: 8, search: term }).subscribe({
      next: (response) => {
        if (requestId !== this.memberLookupRequestId) {
          return;
        }
        this.memberLookupResults = response.items ?? [];
      },
      error: (error) => {
        if (requestId !== this.memberLookupRequestId) {
          return;
        }
        this.memberLookupResults = [];
        this.memberLookupError = this.getErrorMessage(error, 'Unable to search members.');
      },
      complete: () => {
        if (requestId !== this.memberLookupRequestId) {
          return;
        }
        this.memberLookupLoading = false;
      }
    });
  }

  selectMember(member: MemberSummary): void {
    this.memberId = member.id;
    this.memberLookupTerm = `${member.firstName} ${member.lastName} (#${member.id})`;
    this.memberLookupResults = [];
    this.memberLookupError = null;
  }

  onCompanionLookupChange(value: string): void {
    this.companionLookupTerm = value;
    this.companionLookupError = null;
    const term = value.trim();

    if (term.length < 2) {
      this.companionLookupResults = [];
      this.companionLookupLoading = false;
      return;
    }

    const requestId = ++this.companionLookupRequestId;
    this.companionLookupLoading = true;

    this.api.getMembers({ page: 1, pageSize: 8, search: term }).subscribe({
      next: (response) => {
        if (requestId !== this.companionLookupRequestId) {
          return;
        }
        this.companionLookupResults = response.items ?? [];
      },
      error: (error) => {
        if (requestId !== this.companionLookupRequestId) {
          return;
        }
        this.companionLookupResults = [];
        this.companionLookupError = this.getErrorMessage(error, 'Unable to search companion member.');
      },
      complete: () => {
        if (requestId !== this.companionLookupRequestId) {
          return;
        }
        this.companionLookupLoading = false;
      }
    });
  }

  selectCompanionMember(member: MemberSummary): void {
    this.companionMemberId = member.id;
    this.companionLookupTerm = `${member.firstName} ${member.lastName} (#${member.id})`;
    this.companionLookupResults = [];
    this.companionLookupError = null;
  }

  onGuestLookupChange(value: string): void {
    this.guestLookupTerm = value;
    this.guestLookupError = null;
    const term = value.trim().toLowerCase();

    if (term.length < 2) {
      this.guestLookupResults = [];
      return;
    }

    if (!this.allGuests.length) {
      this.guestLookupLoading = true;
      this.api.listGuests().subscribe({
        next: (guests) => {
          this.allGuests = guests ?? [];
          this.guestLookupResults = this.filterGuests(term);
        },
        error: (error) => {
          this.guestLookupResults = [];
          this.guestLookupError = this.getErrorMessage(error, 'Unable to load guest list for lookup.');
        },
        complete: () => {
          this.guestLookupLoading = false;
        }
      });
      return;
    }

    this.guestLookupResults = this.filterGuests(term);
  }

  selectGuest(guest: Guest): void {
    this.guestId = guest.id;
    this.guestLookupTerm = `${guest.firstName} ${guest.lastName} (#${guest.id})`;
    this.guestLookupResults = [];
    this.guestLookupError = null;
  }

  private filterGuests(term: string): Guest[] {
    return this.allGuests
      .filter((guest) =>
        guest.id.toString().includes(term) ||
        `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(term) ||
        (guest.email ?? '').toLowerCase().includes(term)
      )
      .slice(0, 8);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) return 'Session expired. Sign in again for access-control checks.';
      if (error.status === 403) return 'Your role is not authorized for gate-access endpoints.';
      const backendMessage = error.error?.message ?? error.error?.Message;
      if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) return backendMessage;
    }
    return fallback;
  }
}
