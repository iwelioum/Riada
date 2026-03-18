import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ShieldCheck, Search, CheckCircle2, XCircle, Clock } from 'lucide-angular';
import { AccessApiService, AccessCheckResponse, AccessLogEntryResponse } from '../../shared/services/access-api.service';

type AccessResult = 'Granted' | 'Denied';
type ResultFilter = 'All' | AccessResult;

interface AccessLog {
  id: number;
  isGuest: boolean;
  personId: number | null;
  personName: string | null;
  clubId: number;
  clubName: string;
  accessedAt: string;
  result: AccessResult;
  denialReason: string | null;
}

interface MemberCheckForm {
  memberId: string;
  clubId: string;
}

interface GuestCheckForm {
  guestId: string;
  companionMemberId: string;
  clubId: string;
}

interface AccessDecisionView {
  decision: AccessResult;
  denialReason: string | null;
}

const DENIAL_LABELS: Record<string, string> = {
  InvalidBadge: 'Invalid badge',
  SuspendedContract: 'Suspended contract',
  PendingPayment: 'Pending payment',
  WrongClub: 'Wrong club',
  GuestBanned: 'Guest banned',
};

const DENIAL_CLASSES: Record<string, string> = {
  InvalidBadge: 'bg-[#F5F6FA] text-[#6B7280]',
  SuspendedContract: 'bg-[#FFF0F0] text-[#FF4747]',
  PendingPayment: 'bg-[#FFF3D6] text-[#FF9066]',
  WrongClub: 'bg-[#FFF3D6] text-[#FF9066]',
  GuestBanned: 'bg-[#FFF0F0] text-[#FF4747]',
};

const emptyMemberForm = (): MemberCheckForm => ({
  memberId: '',
  clubId: '',
});

const emptyGuestForm = (): GuestCheckForm => ({
  guestId: '',
  companionMemberId: '',
  clubId: '',
});

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <lucide-icon [img]="ShieldCheckIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
          Access Control
        </h1>
        <p class="text-sm text-[#6B7280] mt-1">
          {{ loading() ? 'Loading access attempts…' : (logs().length + ' access attempts (latest 50)') }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-64">
          <lucide-icon [img]="SearchIcon" [size]="16" class="text-[#A6A6A6] shrink-0"></lucide-icon>
          <input
            type="text"
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Search person, id or club…"
            class="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]" />
        </div>
        <div class="flex rounded-xl overflow-hidden border border-[#E0E0E0]">
          @for (opt of resultFilterOptions; track opt) {
            <button
              (click)="resultFilter.set(opt)"
              [class]="resultFilter() === opt
                ? 'px-4 py-2 text-sm font-semibold bg-[#4880FF] text-white transition-colors'
                : 'px-4 py-2 text-sm font-semibold bg-white text-[#6B7280] hover:bg-[#F8FAFF] transition-colors'">
              {{ opt }}
            </button>
          }
        </div>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
    @if (error()) {
      <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 text-sm text-[#C53030]">
        {{ error() }}
      </div>
    }

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-sm border border-[#00B69B]/20 p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#E0F8EA] flex items-center justify-center">
          <lucide-icon [img]="CheckCircle2Icon" [size]="24" class="text-[#00B69B]"></lucide-icon>
        </div>
        <div>
          <p class="text-2xl font-black text-[#111827]">{{ grantedCount() }}</p>
          <p class="text-sm text-[#6B7280] font-medium">Granted</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-[#FF4747]/20 p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#FFF0F0] flex items-center justify-center">
          <lucide-icon [img]="XCircleIcon" [size]="24" class="text-[#FF4747]"></lucide-icon>
        </div>
        <div>
          <p class="text-2xl font-black text-[#111827]">{{ deniedCount() }}</p>
          <p class="text-sm text-[#6B7280] font-medium">Denied</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-[#4880FF]/20 p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#EBEBFF] flex items-center justify-center">
          <lucide-icon [img]="ShieldCheckIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
        </div>
        <div>
          <p class="text-2xl font-black text-[#111827]">{{ grantRate() }}%</p>
          <p class="text-sm text-[#6B7280] font-medium">Grant rate</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 space-y-4">
        <div>
          <h2 class="text-lg font-bold text-[#111827]">Member check-in</h2>
          <p class="text-sm text-[#6B7280]">Quick action via <span class="font-mono">POST /api/access/member</span></p>
        </div>

        @if (memberActionError()) {
          <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 text-sm text-[#C53030]">
            {{ memberActionError() }}
          </div>
        }

        @if (memberResult(); as result) {
          <div [class]="result.decision === 'Granted'
            ? 'rounded-xl border border-[#00B69B]/30 bg-[#E0F8EA] px-4 py-3'
            : 'rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] px-4 py-3'">
            <p [class]="result.decision === 'Granted' ? 'text-sm font-semibold text-[#00846F]' : 'text-sm font-semibold text-[#C53030]'">
              Decision: {{ result.decision }}
            </p>
            @if (result.denialReason) {
              <p class="text-xs text-[#6B7280] mt-1">Reason: {{ denialLabel(result.denialReason) }}</p>
            }
          </div>
        }

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Member ID</label>
            <input
              type="number"
              class="input-field"
              [ngModel]="memberForm().memberId"
              (ngModelChange)="patchMemberForm('memberId', $event?.toString() ?? '')"
              placeholder="123" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Club ID</label>
            <input
              type="number"
              class="input-field"
              [ngModel]="memberForm().clubId"
              (ngModelChange)="patchMemberForm('clubId', $event?.toString() ?? '')"
              placeholder="1" />
          </div>
        </div>

        <button
          (click)="checkMemberAccess()"
          class="w-full py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors disabled:opacity-60"
          [disabled]="memberSubmitting()">
          {{ memberSubmitting() ? 'Checking...' : 'Check member access' }}
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 space-y-4">
        <div>
          <h2 class="text-lg font-bold text-[#111827]">Guest check-in</h2>
          <p class="text-sm text-[#6B7280]">Quick action via <span class="font-mono">POST /api/access/guest</span></p>
        </div>

        @if (guestActionError()) {
          <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 text-sm text-[#C53030]">
            {{ guestActionError() }}
          </div>
        }

        @if (guestResult(); as result) {
          <div [class]="result.decision === 'Granted'
            ? 'rounded-xl border border-[#00B69B]/30 bg-[#E0F8EA] px-4 py-3'
            : 'rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] px-4 py-3'">
            <p [class]="result.decision === 'Granted' ? 'text-sm font-semibold text-[#00846F]' : 'text-sm font-semibold text-[#C53030]'">
              Decision: {{ result.decision }}
            </p>
            @if (result.denialReason) {
              <p class="text-xs text-[#6B7280] mt-1">Reason: {{ denialLabel(result.denialReason) }}</p>
            }
          </div>
        }

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Guest ID</label>
            <input
              type="number"
              class="input-field"
              [ngModel]="guestForm().guestId"
              (ngModelChange)="patchGuestForm('guestId', $event?.toString() ?? '')"
              placeholder="501" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Companion member ID</label>
            <input
              type="number"
              class="input-field"
              [ngModel]="guestForm().companionMemberId"
              (ngModelChange)="patchGuestForm('companionMemberId', $event?.toString() ?? '')"
              placeholder="123" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Club ID</label>
            <input
              type="number"
              class="input-field"
              [ngModel]="guestForm().clubId"
              (ngModelChange)="patchGuestForm('clubId', $event?.toString() ?? '')"
              placeholder="1" />
          </div>
        </div>

        <button
          (click)="checkGuestAccess()"
          class="w-full py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors disabled:opacity-60"
          [disabled]="guestSubmitting()">
          {{ guestSubmitting() ? 'Checking...' : 'Check guest access' }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
      @if (loading()) {
        <div class="px-5 py-12 text-center text-sm text-[#A6A6A6]">Loading access logs...</div>
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
            @if (filtered().length === 0) {
              <tr>
                <td colspan="6" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No access logs match your filters</td>
              </tr>
            }
            @for (log of filtered(); track log.id) {
              <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                <td class="px-5 py-3">
                  <span class="flex items-center gap-1.5 text-sm text-[#6B7280]">
                    <lucide-icon [img]="ClockIcon" [size]="14"></lucide-icon>
                    {{ splitTime(log.accessedAt) }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  @if (log.personName) {
                    <span class="text-sm font-bold text-[#111827]">{{ log.personName }}</span>
                  } @else {
                    <span class="text-sm text-[#A6A6A6] italic">Unknown</span>
                  }
                  <div class="text-xs text-[#A6A6A6] mt-0.5">{{ log.isGuest ? 'Guest' : 'Member' }}</div>
                </td>
                <td class="px-5 py-3 text-sm font-mono text-[#6B7280]">{{ log.personId ?? '—' }}</td>
                <td class="px-5 py-3 text-sm text-[#111827] font-medium">{{ log.clubName }}</td>
                <td class="px-5 py-3">
                  @if (log.result === 'Granted') {
                    <span class="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#E0F8EA] text-[#00B69B] w-fit">
                      <lucide-icon [img]="CheckCircle2Icon" [size]="14"></lucide-icon>
                      Granted
                    </span>
                  } @else {
                    <span class="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF0F0] text-[#FF4747] w-fit">
                      <lucide-icon [img]="XCircleIcon" [size]="14"></lucide-icon>
                      Denied
                    </span>
                  }
                </td>
                <td class="px-5 py-3">
                  @if (log.denialReason) {
                    <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + denialClass(log.denialReason)">
                      {{ denialLabel(log.denialReason) }}
                    </span>
                  } @else {
                    <span class="text-[#A6A6A6] text-sm">—</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  </div>
</div>
  `,
  styles: [`
    .input-field {
      @apply w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] text-sm focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF];
    }
  `],
})
export class AccessControlComponent implements OnInit {
  readonly ShieldCheckIcon = ShieldCheck;
  readonly SearchIcon = Search;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon = XCircle;
  readonly ClockIcon = Clock;

  readonly headers = ['Time', 'Person', 'Person ID', 'Club', 'Result', 'Reason'];
  readonly resultFilterOptions: ResultFilter[] = ['All', 'Granted', 'Denied'];

  private readonly accessApi = inject(AccessApiService);

  readonly logs = signal<AccessLog[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly resultFilter = signal<ResultFilter>('All');

  readonly memberForm = signal<MemberCheckForm>(emptyMemberForm());
  readonly guestForm = signal<GuestCheckForm>(emptyGuestForm());
  readonly memberSubmitting = signal(false);
  readonly guestSubmitting = signal(false);
  readonly memberActionError = signal<string | null>(null);
  readonly guestActionError = signal<string | null>(null);
  readonly memberResult = signal<AccessDecisionView | null>(null);
  readonly guestResult = signal<AccessDecisionView | null>(null);

  readonly grantedCount = computed(() => this.logs().filter((l) => l.result === 'Granted').length);
  readonly deniedCount = computed(() => this.logs().filter((l) => l.result === 'Denied').length);
  readonly grantRate = computed(() => {
    const total = this.logs().length;
    if (!total) return 0;
    return Math.round((this.grantedCount() / total) * 100);
  });

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const filter = this.resultFilter();

    return this.logs().filter((log) => {
      const matchesSearch = !query
        || (log.personName?.toLowerCase().includes(query) ?? false)
        || String(log.personId ?? '').includes(query)
        || log.clubName.toLowerCase().includes(query)
        || (log.isGuest ? 'guest' : 'member').includes(query);
      const matchesResult = filter === 'All' || log.result === filter;
      return matchesSearch && matchesResult;
    });
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  splitTime(timestamp: string): string {
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    const normalized = timestamp.includes('T')
      ? timestamp.split('T')[1]
      : timestamp.split(' ')[1];

    return normalized?.slice(0, 8) ?? timestamp;
  }

  denialLabel(reason: string | null): string {
    if (!reason) return '';
    return DENIAL_LABELS[reason] ?? this.humanizeReason(reason);
  }

  denialClass(reason: string | null): string {
    if (!reason) return '';
    return DENIAL_CLASSES[reason] ?? 'bg-[#F5F6FA] text-[#6B7280]';
  }

  patchMemberForm<K extends keyof MemberCheckForm>(key: K, value: string): void {
    this.memberForm.update((current) => ({ ...current, [key]: value }));
  }

  patchGuestForm<K extends keyof GuestCheckForm>(key: K, value: string): void {
    this.guestForm.update((current) => ({ ...current, [key]: value }));
  }

  checkMemberAccess(): void {
    if (this.memberSubmitting()) return;

    const form = this.memberForm();
    const memberId = this.parsePositiveInteger(form.memberId);
    const clubId = this.parsePositiveInteger(form.clubId);

    if (memberId === null || clubId === null) {
      this.memberActionError.set('Member ID and Club ID must be valid positive numbers.');
      return;
    }

    this.memberSubmitting.set(true);
    this.memberActionError.set(null);
    this.memberResult.set(null);

    this.accessApi.checkMemberAccess({ memberId, clubId }).subscribe({
      next: (response) => {
        this.memberResult.set(this.mapDecision(response));
        this.memberSubmitting.set(false);
        this.loadLogs();
      },
      error: (error: unknown) => {
        this.memberSubmitting.set(false);
        this.memberActionError.set(this.resolveErrorMessage(error, 'Unable to check member access.'));
      },
    });
  }

  checkGuestAccess(): void {
    if (this.guestSubmitting()) return;

    const form = this.guestForm();
    const guestId = this.parsePositiveInteger(form.guestId);
    const companionMemberId = this.parsePositiveInteger(form.companionMemberId);
    const clubId = this.parsePositiveInteger(form.clubId);

    if (guestId === null || companionMemberId === null || clubId === null) {
      this.guestActionError.set('Guest ID, Companion member ID and Club ID must be valid positive numbers.');
      return;
    }

    this.guestSubmitting.set(true);
    this.guestActionError.set(null);
    this.guestResult.set(null);

    this.accessApi.checkGuestAccess({ guestId, companionMemberId, clubId }).subscribe({
      next: (response) => {
        this.guestResult.set(this.mapDecision(response));
        this.guestSubmitting.set(false);
        this.loadLogs();
      },
      error: (error: unknown) => {
        this.guestSubmitting.set(false);
        this.guestActionError.set(this.resolveErrorMessage(error, 'Unable to check guest access.'));
      },
    });
  }

  private loadLogs(): void {
    this.loading.set(true);
    this.error.set(null);

    this.accessApi.listAccessLogs(50).subscribe({
      next: (entries) => {
        this.logs.set((entries ?? []).map((entry) => this.mapLogEntry(entry)));
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(this.resolveErrorMessage(error, 'Unable to load access logs.'));
      },
    });
  }

  private mapLogEntry(entry: AccessLogEntryResponse): AccessLog {
    return {
      id: entry.id,
      isGuest: entry.isGuest,
      personId: entry.personId,
      personName: entry.personName,
      clubId: entry.clubId,
      clubName: entry.clubName,
      accessedAt: entry.accessedAt,
      result: this.normalizeDecision(entry.accessStatus),
      denialReason: entry.denialReason ?? null,
    };
  }

  private mapDecision(response: AccessCheckResponse): AccessDecisionView {
    return {
      decision: this.normalizeDecision(response.decision),
      denialReason: response.denialReason ?? null,
    };
  }

  private normalizeDecision(value: string | null | undefined): AccessResult {
    const normalized = (value ?? '').trim().toLowerCase();
    if (
      normalized === 'granted'
      || normalized === 'allow'
      || normalized === 'allowed'
      || normalized === 'approved'
      || normalized === 'ok'
    ) {
      return 'Granted';
    }
    return 'Denied';
  }

  private parsePositiveInteger(value: string): number | null {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private humanizeReason(reason: string): string {
    const withSpaces = reason
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim();

    if (!withSpaces) return reason;
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
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
