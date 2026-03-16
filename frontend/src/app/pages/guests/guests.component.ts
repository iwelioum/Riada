import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Guest } from '../../core/models/api-models';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestsComponent implements OnInit {
  guests: Guest[] = [];
  loading = false;
  hasLoadedGuests = false;
  submitting = false;
  banningGuestId: number | null = null;
  pendingBanId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  formError: string | null = null;
  form = { sponsorMemberId: null as number | null, firstName: '', lastName: '', email: '', dateOfBirth: '' };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests() {
    this.hasLoadedGuests = false;
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();
    this.api.listGuests().subscribe({
      next: (guests) => {
        this.guests = [...(guests || [])].sort((left, right) => {
          const leftName = `${left.lastName} ${left.firstName}`.trim().toLowerCase();
          const rightName = `${right.lastName} ${right.firstName}`.trim().toLowerCase();
          return leftName.localeCompare(rightName);
        });
        this.hasLoadedGuests = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.guests = [];
        this.errorMessage = this.getErrorMessage(error, 'Failed to load guests.');
        this.hasLoadedGuests = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  registerGuest() {
    this.clearMessages();
    this.formError = this.validateGuestForm();
    if (this.formError) {
      return;
    }

    this.submitting = true;
    this.cdr.markForCheck();
    this.api
      .registerGuest({
        sponsorMemberId: Number(this.form.sponsorMemberId),
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        email: this.form.email.trim() || undefined,
        dateOfBirth: this.form.dateOfBirth
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Guest registered.';
          this.resetForm();
          this.submitting = false;
          this.cdr.markForCheck();
          this.loadGuests();
        },
        error: (error) => {
          this.formError = this.getErrorMessage(error, 'Failed to register guest.');
          this.submitting = false;
          this.cdr.markForCheck();
        }
      });
  }

  requestBanGuest(id: number) {
    this.clearMessages();
    this.pendingBanId = id;
  }

  cancelBanGuest() {
    this.pendingBanId = null;
  }

  banGuest(id: number) {
    this.clearMessages();
    const guest = this.guests.find((item) => item.id === id);
    if (!guest) {
      this.errorMessage = 'Guest was not found in the current list.';
      return;
    }
    if (!this.canBanGuest(guest)) {
      this.errorMessage = 'This guest is already banned.';
      this.pendingBanId = null;
      this.cdr.markForCheck();
      return;
    }

    this.banningGuestId = id;
    this.cdr.markForCheck();
    this.api.banGuest(id).subscribe({
      next: () => {
        this.successMessage = 'Guest banned.';
        this.pendingBanId = null;
        this.banningGuestId = null;
        this.cdr.markForCheck();
        this.loadGuests();
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Failed to ban guest.');
        this.banningGuestId = null;
        this.cdr.markForCheck();
      }
    });
  }

  trackByGuest(index: number, guest: Guest): number {
    return guest.id;
  }

  private validateGuestForm(): string | null {
    if (!this.form.sponsorMemberId || this.form.sponsorMemberId < 1) {
      return 'Sponsor member ID is required.';
    }
    if (!this.form.firstName.trim()) {
      return 'First name is required.';
    }
    if (!this.form.lastName.trim()) {
      return 'Last name is required.';
    }
    if (!this.form.dateOfBirth) {
      return 'Birth date is required.';
    }
    if (this.form.dateOfBirth > new Date().toISOString().slice(0, 10)) {
      return 'Birth date cannot be in the future.';
    }
    if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      return 'Email format is invalid.';
    }

    return null;
  }

  private clearMessages() {
    this.errorMessage = null;
    this.successMessage = null;
    this.formError = null;
  }

  private resetForm() {
    this.form = { sponsorMemberId: null, firstName: '', lastName: '', email: '', dateOfBirth: '' };
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again to manage guests.';
      }
      if (error.status === 403) {
        return 'Your role does not allow guest management actions.';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return fallback;
  }

  canBanGuest(guest: Guest): boolean {
    return !guest.status.toLowerCase().includes('ban');
  }
}
