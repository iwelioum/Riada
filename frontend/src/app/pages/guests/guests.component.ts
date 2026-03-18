import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, UserPlus, Plus, X, Check, Search, ShieldAlert } from 'lucide-angular';
import { GuestResponse, GuestsApiService } from '../../shared/services/guests-api.service';

type GuestStatus = 'Active' | 'Banned' | string;

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string | null;
  status: GuestStatus;
  sponsorName: string;
  sponsorMemberId: number;
}

interface GuestForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  sponsorMemberId: string;
}

const PAGE_SIZE = 50;
const STATUS_CLASSES: Record<'active' | 'banned', string> = {
  active: 'bg-[#E0F8EA] text-[#00B69B]',
  banned: 'bg-[#FFF0F0] text-[#FF4747]',
};

const emptyForm = (): GuestForm => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  sponsorMemberId: '',
});

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <lucide-icon [img]="UserPlusIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
          Guests
        </h1>
        <p class="text-sm text-[#6B7280] mt-1">
          {{ loading() ? 'Loading guests…' : (totalCount() + ' guest' + (totalCount() !== 1 ? 's' : '')) }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-56">
          <lucide-icon [img]="SearchIcon" [size]="16" class="text-[#A6A6A6] shrink-0"></lucide-icon>
          <input
            type="text"
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Search…"
            class="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]" />
        </div>
        <button
          (click)="openCreateModal()"
          class="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all disabled:opacity-60"
          [disabled]="saving()">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Register guest
        </button>
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
        <div class="px-5 py-12 text-center text-sm text-[#A6A6A6]">Loading guests...</div>
      } @else {
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
              @for (h of headers; track h) {
                <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @if (filteredGuests().length === 0) {
              <tr>
                <td colspan="6" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No guests found</td>
              </tr>
            }
            @for (guest of filteredGuests(); track guest.id) {
              <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center justify-center text-sm font-bold shrink-0">
                      {{ guest.firstName[0] }}{{ guest.lastName[0] }}
                    </div>
                    <span class="font-bold text-[#111827]">{{ guest.firstName }} {{ guest.lastName }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-[#6B7280]">{{ guest.dateOfBirth || '—' }}</td>
                <td class="px-5 py-4 text-sm text-[#6B7280]">{{ displayEmail(guest) }}</td>
                <td class="px-5 py-4 text-sm font-semibold text-[#4880FF]">{{ guest.sponsorName }}</td>
                <td class="px-5 py-4">
                  <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + statusClass(guest.status)">
                    {{ guest.status }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  @if (!isBanned(guest.status)) {
                    <button
                      (click)="openBanConfirm(guest)"
                      class="flex items-center gap-1 text-sm text-[#FF4747] font-semibold hover:underline disabled:opacity-60"
                      [disabled]="banning()">
                      <lucide-icon [img]="ShieldAlertIcon" [size]="14"></lucide-icon>
                      Ban
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    @if (!loading() && totalCount() > 0) {
      <div class="flex items-center justify-between">
        <p class="text-sm text-[#6B7280]">
          {{ startItem() }}-{{ endItem() }} of {{ totalCount() }} guests
        </p>
        <div class="flex items-center gap-2">
          <button
            (click)="goToPreviousPage()"
            class="px-3 py-1.5 text-sm border border-[#E0E0E0] rounded-lg bg-white hover:bg-[#F8FAFF] disabled:opacity-50"
            [disabled]="page() <= 1 || loading()">
            Previous
          </button>
          <span class="text-sm text-[#6B7280]">Page {{ page() }} / {{ totalPages() }}</span>
          <button
            (click)="goToNextPage()"
            class="px-3 py-1.5 text-sm border border-[#E0E0E0] rounded-lg bg-white hover:bg-[#F8FAFF] disabled:opacity-50"
            [disabled]="page() >= totalPages() || loading()">
            Next
          </button>
        </div>
      </div>
    }
  </div>

  @if (showModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeCreateModal()">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Register a guest</h3>
          <button (click)="closeCreateModal()" class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        @if (modalError()) {
          <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 mb-4 text-sm text-[#C53030]">
            {{ modalError() }}
          </div>
        }

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Sponsor member ID</label>
            <input
              class="input-field"
              type="number"
              [ngModel]="form().sponsorMemberId"
              (ngModelChange)="patchForm('sponsorMemberId', $event?.toString() ?? '')"
              placeholder="123" />
            <p class="text-xs text-[#A6A6A6] mt-1">Enter an existing member id.</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">First name</label>
              <input
                class="input-field"
                [ngModel]="form().firstName"
                (ngModelChange)="patchForm('firstName', $event?.toString() ?? '')"
                placeholder="Alice" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">Last name</label>
              <input
                class="input-field"
                [ngModel]="form().lastName"
                (ngModelChange)="patchForm('lastName', $event?.toString() ?? '')"
                placeholder="Fontaine" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">Date of birth</label>
              <input
                class="input-field"
                type="date"
                [ngModel]="form().dateOfBirth"
                (ngModelChange)="patchForm('dateOfBirth', $event?.toString() ?? '')" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
              <input
                class="input-field"
                type="email"
                [ngModel]="form().email"
                (ngModelChange)="patchForm('email', $event?.toString() ?? '')"
                placeholder="alice@email.com" />
            </div>
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
            (click)="handleCreate()"
            class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            [disabled]="saving()">
            <lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon>
            {{ saving() ? 'Registering...' : 'Register guest' }}
          </button>
        </div>
      </div>
    </div>
  }

  @if (showBanConfirm()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeBanConfirm()">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-[#FFF0F0] flex items-center justify-center">
            <lucide-icon [img]="ShieldAlertIcon" [size]="20" class="text-[#FF4747]"></lucide-icon>
          </div>
          <h3 class="text-lg font-bold text-[#111827]">Ban this guest?</h3>
        </div>
        <p class="text-sm text-[#6B7280] mb-6">
          <span class="font-bold text-[#111827]">{{ showBanConfirm()!.firstName }} {{ showBanConfirm()!.lastName }}</span>
          will be denied access to all clubs.
        </p>

        @if (banError()) {
          <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 mb-4 text-sm text-[#C53030]">
            {{ banError() }}
          </div>
        }

        <div class="flex gap-3">
          <button
            (click)="closeBanConfirm()"
            class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors disabled:opacity-60"
            [disabled]="banning()">
            Cancel
          </button>
          <button
            (click)="handleBanConfirmed()"
            class="flex-1 py-2.5 bg-[#FF4747] text-white font-semibold rounded-xl hover:bg-[#e03d3d] transition-colors disabled:opacity-60"
            [disabled]="banning()">
            {{ banning() ? 'Banning...' : 'Confirm ban' }}
          </button>
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .input-field {
      @apply w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] text-sm focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF];
    }
  `],
})
export class GuestsComponent implements OnInit {
  readonly UserPlusIcon = UserPlus;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly CheckIcon = Check;
  readonly SearchIcon = Search;
  readonly ShieldAlertIcon = ShieldAlert;

  readonly headers = ['Name', 'Date of birth', 'Email', 'Sponsor', 'Status', ''];

  private readonly guestsApi = inject(GuestsApiService);

  readonly guests = signal<Guest[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly page = signal(1);
  readonly totalCount = signal(0);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)));
  readonly startItem = computed(() => (this.totalCount() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1));
  readonly endItem = computed(() => {
    if (this.totalCount() === 0) return 0;
    return Math.min((this.page() - 1) * PAGE_SIZE + this.guests().length, this.totalCount());
  });

  readonly showModal = signal(false);
  readonly showBanConfirm = signal<Guest | null>(null);
  readonly form = signal<GuestForm>(emptyForm());
  readonly saving = signal(false);
  readonly banning = signal(false);
  readonly modalError = signal<string | null>(null);
  readonly banError = signal<string | null>(null);

  readonly filteredGuests = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) return this.guests();

    return this.guests().filter((guest) => {
      const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
      const email = guest.email?.toLowerCase() ?? '';
      return fullName.includes(query)
        || email.includes(query)
        || guest.sponsorName.toLowerCase().includes(query)
        || String(guest.sponsorMemberId).includes(query);
    });
  });

  ngOnInit(): void {
    this.loadGuests();
  }

  statusClass(status: GuestStatus): string {
    if (this.isBanned(status)) return STATUS_CLASSES.banned;
    if (status.toLowerCase() === 'active') return STATUS_CLASSES.active;
    return 'bg-[#F5F6FA] text-[#6B7280]';
  }

  isBanned(status: GuestStatus): boolean {
    return status.toLowerCase() === 'banned';
  }

  displayEmail(guest: Guest): string {
    return guest.email?.trim() || '—';
  }

  patchForm<K extends keyof GuestForm>(key: K, value: string): void {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  openCreateModal(): void {
    this.form.set(emptyForm());
    this.modalError.set(null);
    this.showModal.set(true);
  }

  closeCreateModal(): void {
    if (this.saving()) return;
    this.showModal.set(false);
    this.modalError.set(null);
  }

  openBanConfirm(guest: Guest): void {
    this.showBanConfirm.set(guest);
    this.banError.set(null);
  }

  closeBanConfirm(): void {
    if (this.banning()) return;
    this.showBanConfirm.set(null);
    this.banError.set(null);
  }

  goToPreviousPage(): void {
    if (this.page() <= 1 || this.loading()) return;
    this.page.update((current) => current - 1);
    this.loadGuests();
  }

  goToNextPage(): void {
    if (this.page() >= this.totalPages() || this.loading()) return;
    this.page.update((current) => current + 1);
    this.loadGuests();
  }

  handleCreate(): void {
    const payload = this.form();
    const sponsorMemberId = this.parsePositiveInteger(payload.sponsorMemberId);

    if (!payload.firstName.trim() || !payload.lastName.trim() || !payload.dateOfBirth || !payload.email.trim()) {
      this.modalError.set('Please fill all required fields.');
      return;
    }

    if (sponsorMemberId === null) {
      this.modalError.set('Sponsor member ID must be a valid positive number.');
      return;
    }

    this.saving.set(true);
    this.modalError.set(null);

    this.guestsApi.createGuest({
      sponsorMemberId,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      dateOfBirth: payload.dateOfBirth,
      email: payload.email.trim(),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.form.set(emptyForm());
        this.page.set(1);
        this.loadGuests();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.modalError.set(this.resolveErrorMessage(error, 'Unable to register guest.'));
      },
    });
  }

  handleBanConfirmed(): void {
    const guest = this.showBanConfirm();
    if (!guest || this.banning()) return;

    this.banning.set(true);
    this.banError.set(null);

    this.guestsApi.banGuest(guest.id).subscribe({
      next: () => {
        this.banning.set(false);
        this.showBanConfirm.set(null);
        this.loadGuests();
      },
      error: (error: unknown) => {
        this.banning.set(false);
        this.banError.set(this.resolveErrorMessage(error, 'Unable to ban guest.'));
      },
    });
  }

  private loadGuests(): void {
    this.loading.set(true);
    this.error.set(null);

    this.guestsApi.listGuests(this.page(), PAGE_SIZE).subscribe({
      next: (response) => {
        const totalCount = typeof response.totalCount === 'number' ? response.totalCount : response.items.length;
        this.guests.set((response.items ?? []).map((guest) => this.mapGuest(guest)));
        this.totalCount.set(totalCount);

        if (response.totalPages > 0 && this.page() > response.totalPages) {
          this.page.set(response.totalPages);
          this.loadGuests();
          return;
        }

        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(this.resolveErrorMessage(error, 'Unable to load guests.'));
      },
    });
  }

  private mapGuest(guest: GuestResponse): Guest {
    return {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      dateOfBirth: guest.dateOfBirth,
      email: guest.email ?? null,
      status: this.normalizeStatus(guest.status),
      sponsorMemberId: guest.sponsorMemberId,
      sponsorName: guest.sponsorName || '—',
    };
  }

  private normalizeStatus(status: string | null | undefined): GuestStatus {
    const normalized = (status ?? '').trim().toLowerCase();
    if (normalized === 'active') return 'Active';
    if (normalized === 'banned') return 'Banned';
    return status?.trim() || 'Unknown';
  }

  private parsePositiveInteger(value: string): number | null {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) return fallback;
    return this.extractApiMessage(error.error) ?? fallback;
  }

  private extractApiMessage(payload: unknown): string | null {
    if (typeof payload === 'string' && payload.trim()) {
      return payload.trim();
    }

    if (typeof payload !== 'object' || payload === null) {
      return null;
    }

    const record = payload as Record<string, unknown>;
    const directMessage = record['message'];
    if (typeof directMessage === 'string' && directMessage.trim()) {
      return directMessage.trim();
    }

    const title = record['title'];
    if (typeof title === 'string' && title.trim()) {
      return title.trim();
    }

    const errors = record['errors'];
    if (Array.isArray(errors)) {
      const firstError = errors.find((item): item is string => typeof item === 'string' && item.trim().length > 0);
      return firstError?.trim() ?? null;
    }

    if (typeof errors === 'object' && errors !== null) {
      for (const value of Object.values(errors)) {
        if (!Array.isArray(value)) continue;
        const firstEntry = value.find((item): item is string => typeof item === 'string' && item.trim().length > 0);
        if (firstEntry) return firstEntry.trim();
      }
    }

    return null;
  }
}
