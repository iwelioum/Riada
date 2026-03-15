import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Guest } from '../../core/models/api-models';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss'
})
export class GuestsComponent implements OnInit {
  guests: Guest[] = [];
  loading = false;
  form = { sponsorMemberId: 0, firstName: '', lastName: '', email: '', dateOfBirth: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests() {
    this.loading = true;
    this.api.listGuests().subscribe({
      next: (guests) => {
        this.guests = guests || [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  registerGuest() {
    if (!this.form.sponsorMemberId || !this.form.firstName || !this.form.lastName || !this.form.dateOfBirth) {
      alert('Sponsor, name and birth date are required.');
      return;
    }
    this.api
      .registerGuest({
        sponsorMemberId: Number(this.form.sponsorMemberId),
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        dateOfBirth: this.form.dateOfBirth
      })
      .subscribe({
        next: () => {
          alert('Guest registered');
          this.resetForm();
          this.loadGuests();
        },
        error: () => alert('Failed to register guest')
      });
  }

  banGuest(id: number) {
    this.api.banGuest(id).subscribe({
      next: () => {
        alert('Guest banned');
        this.loadGuests();
      },
      error: () => alert('Failed to ban guest')
    });
  }

  private resetForm() {
    this.form = { sponsorMemberId: 0, firstName: '', lastName: '', email: '', dateOfBirth: '' };
  }
}
