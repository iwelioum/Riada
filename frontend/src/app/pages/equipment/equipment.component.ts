import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ClubSummary, Equipment } from '../../core/models/api-models';

interface TicketJournalEntry {
  localId: string;
  equipmentId: number;
  equipmentName: string;
  priority: string;
  description: string;
  createdAt: string;
  backendTicketId?: number | null;
}

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
  ticketJournal: TicketJournalEntry[] = [];
  private readonly ticketJournalLimit = 20;
  private readonly ticketJournalStorageKey = 'riada.equipment.ticket-journal.v1';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.restoreTicketJournal();
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
      next: (response) => {
        this.successMessage = `Maintenance ticket created for ${equipmentItem.name}.`;
        this.pushTicketJournalEntry(equipmentItem, description, response);
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

  get recentTicketJournal(): TicketJournalEntry[] {
    return this.ticketJournal.slice(0, 8);
  }

  trackByTicketLocalId(_index: number, entry: TicketJournalEntry): string {
    return entry.localId;
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

  private pushTicketJournalEntry(equipment: Equipment, description: string, response: unknown): void {
    const backendTicketId = this.extractTicketId(response);
    const entry: TicketJournalEntry = {
      localId: `${equipment.id}-${Date.now()}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      priority: this.ticketPriority,
      description,
      createdAt: new Date().toISOString(),
      backendTicketId
    };

    this.ticketJournal = [entry, ...this.ticketJournal].slice(0, this.ticketJournalLimit);
    localStorage.setItem(this.ticketJournalStorageKey, JSON.stringify(this.ticketJournal));
  }

  private restoreTicketJournal(): void {
    const raw = localStorage.getItem(this.ticketJournalStorageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid ticket journal format.');
      }

      this.ticketJournal = parsed.filter((entry: unknown): entry is TicketJournalEntry => this.isTicketJournalEntry(entry)).slice(0, this.ticketJournalLimit);
    } catch (error) {
      console.warn('Failed to restore equipment ticket journal.', error);
      localStorage.removeItem(this.ticketJournalStorageKey);
      this.ticketJournal = [];
    }
  }

  private extractTicketId(response: unknown): number | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const payload = response as Record<string, unknown>;
    const candidates = [payload['ticketId'], payload['ticketID'], payload['TicketId'], payload['id']];
    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate;
      }
      if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
        return Number(candidate);
      }
    }

    return null;
  }

  private isTicketJournalEntry(entry: unknown): entry is TicketJournalEntry {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const candidate = entry as Partial<TicketJournalEntry>;
    return (
      typeof candidate.localId === 'string' &&
      typeof candidate.equipmentId === 'number' &&
      typeof candidate.equipmentName === 'string' &&
      typeof candidate.priority === 'string' &&
      typeof candidate.description === 'string' &&
      typeof candidate.createdAt === 'string'
    );
  }
}
