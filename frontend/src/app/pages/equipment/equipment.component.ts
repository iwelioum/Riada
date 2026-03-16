import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ClubSummary, Equipment } from '../../core/models/api-models';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent implements OnInit {
  equipment: Equipment[] = [];
  clubs: ClubSummary[] = [];
  clubsLoading = false;
  loading = false;
  hasLoadedEquipment = false;
  filters: { clubId?: number; status?: string } = {};
  ticketPriority = 'Medium';
  ticketDescriptions: Record<number, string | undefined> = {};
  creatingTicketId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadClubs();
    this.loadEquipment();
  }

  loadClubs() {
    this.clubsLoading = true;
    this.apiService.listClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs || [];
        this.clubsLoading = false;
      },
      error: (error) => {
        this.clubs = [];
        this.errorMessage = this.getErrorMessage(error, 'Unable to load clubs filter.');
        this.clubsLoading = false;
      }
    });
  }

  loadEquipment() {
    this.hasLoadedEquipment = false;
    this.loading = true;
    this.errorMessage = null;
    this.apiService.listEquipment(this.filters).subscribe({
      next: (data) => {
        this.equipment = data || [];
        this.hasLoadedEquipment = true;
        this.loading = false;
      },
      error: (err) => {
        this.equipment = [];
        this.errorMessage = this.getErrorMessage(err, 'Error loading equipment.');
        this.hasLoadedEquipment = true;
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Operational':
        return 'badge-success';
      case 'Maintenance':
        return 'badge-warning';
      case 'Retired':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  setTicketDescription(equipmentId: number, value: string) {
    this.ticketDescriptions[equipmentId] = value;
  }

  createTicket(equipmentId: number) {
    if (this.creatingTicketId !== null) {
      return;
    }

    this.successMessage = null;
    this.errorMessage = null;

    const equipmentItem = this.equipment.find((item) => item.id === equipmentId);
    if (!equipmentItem) {
      this.errorMessage = 'Selected equipment item is no longer available.';
      return;
    }
    if (equipmentItem.status === 'Retired') {
      this.errorMessage = 'Cannot create maintenance tickets for retired equipment.';
      return;
    }

    const allowedPriorities = ['Low', 'Medium', 'High'];
    if (!allowedPriorities.includes(this.ticketPriority)) {
      this.errorMessage = 'Ticket priority must be Low, Medium, or High.';
      return;
    }

    const description = this.ticketDescriptions[equipmentId]?.trim() ?? '';
    if (description.length < 5) {
      this.errorMessage = 'Maintenance description must be at least 5 characters.';
      return;
    }

    this.creatingTicketId = equipmentId;
    const ticket = { equipmentId, priority: this.ticketPriority, description };
    this.apiService.createMaintenanceTicket(ticket).subscribe({
      next: () => {
        this.successMessage = `Maintenance ticket created for ${equipmentItem.name}.`;
        this.ticketDescriptions[equipmentId] = '';
        this.creatingTicketId = null;
        this.loadEquipment();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'Failed to create maintenance ticket.');
        this.creatingTicketId = null;
      }
    });
  }

  isCreatingTicket(equipmentId: number): boolean {
    return this.creatingTicketId === equipmentId;
  }

  canReportIssue(item: Equipment): boolean {
    if (item.status === 'Retired' || this.isCreatingTicket(item.id)) {
      return false;
    }

    const description = this.ticketDescriptions[item.id]?.trim() ?? '';
    return description.length >= 5;
  }

  get emptyStateMessage(): string {
    if (this.filters.clubId || this.filters.status) {
      return 'No equipment matches the selected filters.';
    }

    return 'No equipment registered yet.';
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again to access equipment endpoints.';
      }
      if (error.status === 403) {
        return 'Your role is not authorized to manage equipment.';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return fallback;
  }
}
