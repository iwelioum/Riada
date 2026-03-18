import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Dumbbell, Plus, X, Check, AlertTriangle, Search } from 'lucide-angular';
import { ClubsApiService } from '../../shared/services/clubs-api.service';
import {
  CreateMaintenanceTicketRequest,
  EquipmentApiService,
  EquipmentResponse,
  EquipmentStatusFilter,
  MaintenanceTicketResponse,
  UpdateMaintenanceTicketRequest,
} from '../../shared/services/equipment-api.service';

type EquipmentStatus = EquipmentStatusFilter | 'Unknown';
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
type TicketStatus = 'Reported' | 'Assigned' | 'InProgress' | 'Resolved';

interface ClubOption {
  id: number;
  name: string;
}

interface MaintenanceTicket {
  id: number;
  priority: TicketPriority;
  description: string;
  status: TicketStatus;
  resolvedAt: string | null;
}

interface Equipment {
  id: number;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  acquisitionYear: number;
  status: EquipmentStatus;
  clubId: number;
  clubName: string;
  ticket: MaintenanceTicket | null;
}

const STATUS_CLASSES: Record<EquipmentStatus, string> = {
  InService: 'bg-[#E0F8EA] text-[#00B69B]',
  UnderMaintenance: 'bg-[#FFF3D6] text-[#FF9066]',
  Broken: 'bg-[#FFF0F0] text-[#FF4747]',
  Retired: 'bg-[#F5F6FA] text-[#A6A6A6]',
  Unknown: 'bg-[#F5F6FA] text-[#6B7280]',
};

const PRIORITY_CLASSES: Record<TicketPriority, string> = {
  Low: 'bg-[#E0F8EA] text-[#00B69B]',
  Medium: 'bg-[#FFF3D6] text-[#FF9066]',
  High: 'bg-[#FFF0F0] text-[#FF4747]',
  Critical: 'bg-[#FF4747] text-white',
};

const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const TICKET_STATUSES: TicketStatus[] = ['Reported', 'Assigned', 'InProgress', 'Resolved'];
const STATUS_FILTERS: EquipmentStatusFilter[] = ['InService', 'UnderMaintenance', 'Broken', 'Retired'];

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <lucide-icon [img]="DumbbellIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
          Equipment
        </h1>
        <p class="text-sm text-[#6B7280] mt-1">{{ filtered().length }} item{{ filtered().length !== 1 ? 's' : '' }}</p>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <select
          class="bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]"
          [ngModel]="selectedClubFilter()"
          (ngModelChange)="onClubFilterChange($event)"
          [disabled]="loading() || saving()">
          <option [ngValue]="'all'">All clubs</option>
          @for (club of clubs(); track club.id) {
            <option [ngValue]="club.id">{{ club.name }}</option>
          }
        </select>

        <select
          class="bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]"
          [ngModel]="selectedStatusFilter()"
          (ngModelChange)="onStatusFilterChange($event)"
          [disabled]="loading() || saving()">
          <option [ngValue]="'all'">All statuses</option>
          @for (status of statusFilters; track status) {
            <option [ngValue]="status">{{ statusLabel(status) }}</option>
          }
        </select>

        <div class="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-56">
          <lucide-icon [img]="SearchIcon" [size]="16" class="text-[#A6A6A6] shrink-0"></lucide-icon>
          <input
            type="text"
            placeholder="Search…"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            class="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]" />
        </div>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-8 space-y-4">
    @if (error()) {
      <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 text-sm text-[#C53030]">
        {{ error() }}
      </div>
    }

    <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
      @if (loading()) {
        <div class="px-5 py-12 text-center text-sm text-[#A6A6A6]">Loading equipment...</div>
      } @else {
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
              @for (h of ['Name', 'Type', 'Brand / Model', 'Year', 'Club', 'Status', 'Ticket', '']; track h) {
                <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @if (filtered().length === 0) {
              <tr>
                <td colspan="8" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No equipment found</td>
              </tr>
            }

            @for (eq of filtered(); track eq.id) {
              <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                <td class="px-5 py-4 font-bold text-[#111827]">{{ eq.name }}</td>
                <td class="px-5 py-4 text-sm text-[#6B7280]">{{ eq.type }}</td>
                <td class="px-5 py-4 text-sm text-[#111827]">
                  {{ eq.brand ?? '—' }}
                  <span class="text-[#A6A6A6]">/ {{ eq.model ?? '—' }}</span>
                </td>
                <td class="px-5 py-4 text-sm text-[#6B7280]">{{ eq.acquisitionYear }}</td>
                <td class="px-5 py-4 text-sm text-[#111827] font-medium">{{ eq.clubName }}</td>
                <td class="px-5 py-4">
                  <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + statusClass(eq.status)">
                    {{ statusLabel(eq.status) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  @if (eq.ticket) {
                    <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + priorityClass(eq.ticket.priority)">
                      {{ eq.ticket.priority }}
                    </span>
                  } @else {
                    <span class="text-[#A6A6A6] text-sm">—</span>
                  }
                </td>
                <td class="px-5 py-4">
                  @if (eq.ticket) {
                    <button
                      (click)="openUpdateTicket(eq)"
                      class="text-sm text-[#FF9066] font-semibold hover:underline disabled:opacity-60"
                      [disabled]="saving()">
                      Update ticket
                    </button>
                  } @else {
                    <button
                      (click)="openCreateTicket(eq)"
                      class="flex items-center gap-1 text-sm text-[#4880FF] font-semibold hover:underline disabled:opacity-60"
                      [disabled]="saving()">
                      <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                      Ticket
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  </div>

  @if (showCreateTicket()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeCreateModal()">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">New maintenance ticket</h3>
          <button
            (click)="closeCreateModal()"
            class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
            [disabled]="saving()">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        @if (modalError()) {
          <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 mb-4 text-sm text-[#C53030]">
            {{ modalError() }}
          </div>
        }

        <div class="p-3 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] mb-4 text-sm font-semibold text-[#111827]">
          {{ showCreateTicket()!.name }} — {{ showCreateTicket()!.type }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-2">Priority</label>
            <div class="flex gap-2">
              @for (p of priorities; track p) {
                <button
                  (click)="ticketPriority.set(p)"
                  [class]="'flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ' + (ticketPriority() === p ? priorityClass(p) + ' border-transparent' : 'bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]')"
                  [disabled]="saving()">
                  {{ p }}
                </button>
              }
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Description</label>
            <textarea
              [ngModel]="ticketDescription()"
              (ngModelChange)="ticketDescription.set($event)"
              placeholder="Describe the issue…"
              class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF] resize-none h-24"
              [disabled]="saving()"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button
            (click)="closeCreateModal()"
            class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors disabled:opacity-60"
            [disabled]="saving()">
            Cancel
          </button>
          <button
            (click)="handleCreateTicket()"
            class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            [disabled]="saving()">
            <lucide-icon [img]="AlertIcon" [size]="16"></lucide-icon>
            {{ saving() ? 'Creating...' : 'Create ticket' }}
          </button>
        </div>
      </div>
    </div>
  }

  @if (showUpdateTicket()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeUpdateModal()">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Update ticket</h3>
          <button
            (click)="closeUpdateModal()"
            class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
            [disabled]="saving()">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        @if (modalError()) {
          <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 mb-4 text-sm text-[#C53030]">
            {{ modalError() }}
          </div>
        }

        <div class="p-3 bg-[#FFF3D6] rounded-xl border border-[#FF9066]/30 mb-4 text-sm">
          <div class="flex items-center gap-2 mb-1">
            <span [class]="'text-xs font-bold px-2 py-0.5 rounded-full ' + priorityClass(showUpdateTicket()!.ticket!.priority)">
              {{ showUpdateTicket()!.ticket!.priority }}
            </span>
            <span class="font-bold text-[#111827]">{{ showUpdateTicket()!.name }}</span>
          </div>
          <p class="text-[#6B7280]">{{ showUpdateTicket()!.ticket!.description }}</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-2">Status</label>
            <div class="flex gap-2 flex-wrap">
              @for (s of ticketStatuses; track s) {
                <button
                  (click)="ticketStatus.set(s)"
                  [class]="'flex-1 py-2 rounded-lg text-xs font-bold border transition-colors min-w-[70px] ' + (ticketStatus() === s ? 'bg-[#4880FF] text-white border-[#4880FF]' : 'bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]')"
                  [disabled]="saving()">
                  {{ s }}
                </button>
              }
            </div>
          </div>

          @if (ticketStatus() === 'Resolved') {
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">Resolution date</label>
              <input
                type="date"
                [ngModel]="ticketResolvedAt()"
                (ngModelChange)="ticketResolvedAt.set($event)"
                class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4880FF]"
                [disabled]="saving()" />
            </div>
          }
        </div>

        <div class="flex gap-3 mt-8">
          <button
            (click)="closeUpdateModal()"
            class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors disabled:opacity-60"
            [disabled]="saving()">
            Cancel
          </button>
          <button
            (click)="handleUpdateTicket()"
            class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            [disabled]="saving()">
            <lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon>
            {{ saving() ? 'Saving...' : 'Save update' }}
          </button>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class EquipmentComponent implements OnInit {
  readonly DumbbellIcon = Dumbbell;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly CheckIcon = Check;
  readonly AlertIcon = AlertTriangle;
  readonly SearchIcon = Search;

  readonly priorities = PRIORITIES;
  readonly ticketStatuses = TICKET_STATUSES;
  readonly statusFilters = STATUS_FILTERS;

  private readonly equipmentApi = inject(EquipmentApiService);
  private readonly clubsApi = inject(ClubsApiService);

  readonly clubs = signal<ClubOption[]>([]);
  readonly equipment = signal<Equipment[]>([]);
  readonly ticketsByEquipment = signal<Record<number, MaintenanceTicket>>({});

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly searchTerm = signal('');
  readonly selectedClubFilter = signal<number | 'all'>('all');
  readonly selectedStatusFilter = signal<EquipmentStatusFilter | 'all'>('all');

  readonly showCreateTicket = signal<Equipment | null>(null);
  readonly showUpdateTicket = signal<Equipment | null>(null);
  readonly ticketPriority = signal<TicketPriority>('Medium');
  readonly ticketDescription = signal('');
  readonly ticketStatus = signal<TicketStatus>('Reported');
  readonly ticketResolvedAt = signal('');
  readonly modalError = signal<string | null>(null);

  readonly filtered = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.equipment();

    return this.equipment().filter((eq) => {
      const brand = eq.brand ?? '';
      const model = eq.model ?? '';

      return (
        eq.name.toLowerCase().includes(query)
        || eq.type.toLowerCase().includes(query)
        || brand.toLowerCase().includes(query)
        || model.toLowerCase().includes(query)
        || eq.clubName.toLowerCase().includes(query)
        || this.statusLabel(eq.status).toLowerCase().includes(query)
      );
    });
  });

  ngOnInit(): void {
    this.loadClubs();
    this.loadEquipment();
  }

  onClubFilterChange(value: number | 'all'): void {
    this.selectedClubFilter.set(value);
    this.loadEquipment();
  }

  onStatusFilterChange(value: EquipmentStatusFilter | 'all'): void {
    this.selectedStatusFilter.set(value);
    this.loadEquipment();
  }

  statusClass(status: EquipmentStatus): string {
    return STATUS_CLASSES[status] ?? STATUS_CLASSES.Unknown;
  }

  priorityClass(priority: TicketPriority): string {
    return PRIORITY_CLASSES[priority];
  }

  statusLabel(status: EquipmentStatus | EquipmentStatusFilter): string {
    if (status === 'UnderMaintenance') return 'Maintenance';
    if (status === 'InService') return 'In Service';
    if (status === 'Unknown') return 'Unknown';
    return status;
  }

  openCreateTicket(equipment: Equipment): void {
    this.ticketPriority.set('Medium');
    this.ticketDescription.set('');
    this.modalError.set(null);
    this.showCreateTicket.set(equipment);
  }

  openUpdateTicket(equipment: Equipment): void {
    if (!equipment.ticket) return;

    this.ticketStatus.set(equipment.ticket.status);
    this.ticketResolvedAt.set(equipment.ticket.resolvedAt ?? '');
    this.modalError.set(null);
    this.showUpdateTicket.set(equipment);
  }

  closeCreateModal(): void {
    if (this.saving()) return;
    this.showCreateTicket.set(null);
    this.modalError.set(null);
  }

  closeUpdateModal(): void {
    if (this.saving()) return;
    this.showUpdateTicket.set(null);
    this.modalError.set(null);
  }

  handleCreateTicket(): void {
    const target = this.showCreateTicket();
    const description = this.ticketDescription().trim();

    if (!target) return;
    if (!description) {
      this.modalError.set('Description is required.');
      return;
    }

    const request: CreateMaintenanceTicketRequest = {
      equipmentId: target.id,
      priority: this.ticketPriority(),
      description,
    };

    this.saving.set(true);
    this.modalError.set(null);

    this.equipmentApi.createMaintenanceTicket(request).subscribe({
      next: (response) => {
        const ticket = this.mapTicket(response);
        this.upsertTicket(target.id, ticket);

        this.equipment.update((rows) =>
          rows.map((row) =>
            row.id === target.id
              ? { ...row, ticket, status: this.statusFromTicket(row.status, ticket.status) }
              : row,
          ),
        );

        this.showCreateTicket.set(null);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.modalError.set('Unable to create maintenance ticket.');
      },
    });
  }

  handleUpdateTicket(): void {
    const target = this.showUpdateTicket();
    if (!target?.ticket) return;

    const resolvedAt = this.ticketStatus() === 'Resolved'
      ? (this.ticketResolvedAt() ? `${this.ticketResolvedAt()}T00:00:00` : new Date().toISOString())
      : null;

    const request: UpdateMaintenanceTicketRequest = {
      status: this.ticketStatus(),
      resolvedAt,
    };

    this.saving.set(true);
    this.modalError.set(null);

    this.equipmentApi.updateMaintenanceTicket(target.ticket.id, request).subscribe({
      next: (response) => {
        const ticket = this.mapTicket(response);
        this.upsertTicket(target.id, ticket);

        this.equipment.update((rows) =>
          rows.map((row) =>
            row.id === target.id
              ? { ...row, ticket, status: this.statusFromTicket(row.status, ticket.status) }
              : row,
          ),
        );

        this.showUpdateTicket.set(null);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.modalError.set('Unable to update maintenance ticket.');
      },
    });
  }

  private loadClubs(): void {
    this.clubsApi.listClubs().subscribe({
      next: (response) => {
        const clubs = response.map((club) => ({ id: club.id, name: club.name }));
        this.clubs.set(clubs);

        if (this.equipment().length > 0) {
          this.equipment.update((rows) => rows.map((row) => ({ ...row, clubName: this.clubNameFor(row.clubId) })));
        }
      },
      error: () => {
        this.error.set('Unable to load clubs list.');
      },
    });
  }

  private loadEquipment(): void {
    this.loading.set(true);
    this.error.set(null);

    const selectedClub = this.selectedClubFilter();
    const selectedStatus = this.selectedStatusFilter();
    const clubId = selectedClub === 'all' ? null : selectedClub;
    const status = selectedStatus === 'all' ? null : selectedStatus;

    this.equipmentApi.listEquipment(clubId, status).subscribe({
      next: (response) => {
        this.equipment.set(this.mapEquipmentRows(response));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load equipment.');
      },
    });
  }

  private mapEquipmentRows(rows: EquipmentResponse[]): Equipment[] {
    const tickets = this.ticketsByEquipment();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.equipmentType,
      brand: row.brand ?? null,
      model: row.model ?? null,
      acquisitionYear: row.acquisitionYear,
      status: this.normalizeEquipmentStatus(row.status),
      clubId: row.clubId,
      clubName: this.clubNameFor(row.clubId),
      ticket: tickets[row.id] ?? null,
    }));
  }

  private mapTicket(response: MaintenanceTicketResponse): MaintenanceTicket {
    return {
      id: response.id,
      priority: this.normalizePriority(response.priority),
      description: response.description,
      status: this.normalizeTicketStatus(response.status),
      resolvedAt: response.resolvedAt ? response.resolvedAt.slice(0, 10) : null,
    };
  }

  private upsertTicket(equipmentId: number, ticket: MaintenanceTicket): void {
    this.ticketsByEquipment.update((current) => ({ ...current, [equipmentId]: ticket }));
  }

  private normalizeEquipmentStatus(status: string): EquipmentStatus {
    if (status === 'InService' || status === 'UnderMaintenance' || status === 'Broken' || status === 'Retired') {
      return status;
    }

    return 'Unknown';
  }

  private normalizePriority(priority: string): TicketPriority {
    if (priority === 'Low' || priority === 'Medium' || priority === 'High' || priority === 'Critical') {
      return priority;
    }

    return 'Medium';
  }

  private normalizeTicketStatus(status: string): TicketStatus {
    if (status === 'Reported' || status === 'Assigned' || status === 'InProgress' || status === 'Resolved') {
      return status;
    }

    return 'Reported';
  }

  private statusFromTicket(currentStatus: EquipmentStatus, ticketStatus: TicketStatus): EquipmentStatus {
    if (ticketStatus === 'Resolved') {
      if (currentStatus === 'Retired' || currentStatus === 'Broken') {
        return currentStatus;
      }
      return 'InService';
    }

    if (currentStatus === 'Retired' || currentStatus === 'Broken') {
      return currentStatus;
    }

    return 'UnderMaintenance';
  }

  private clubNameFor(clubId: number): string {
    return this.clubs().find((club) => club.id === clubId)?.name ?? '—';
  }
}
