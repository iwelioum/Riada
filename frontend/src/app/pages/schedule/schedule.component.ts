import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CalendarDays, RefreshCw, X, Users, Check } from 'lucide-angular';
import { finalize } from 'rxjs';
import { ClubListDto, ClubsApiService } from '../../shared/services/clubs-api.service';
import { BookSessionRequest, CoursesApiService, SessionResponse } from '../../shared/services/courses-api.service';

interface FeedbackMessage {
  type: 'success' | 'error';
  text: string;
}

const DAY_WINDOW_OPTIONS = [7, 14, 30, 60];

function safeTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function normalizePercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <lucide-icon [img]="CalendarIcon" [size]="24" class="text-[#4880FF]"></lucide-icon> Course Schedule
        </h1>
        <p class="text-sm text-[#6B7280] mt-1">
          @if (loading()) {
            Loading sessions…
          } @else {
            {{ sessions().length }} session{{ sessions().length !== 1 ? 's' : '' }} in selected window
          }
        </p>
      </div>
      <button
        (click)="reloadSessions()"
        [disabled]="loading()"
        class="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
        <lucide-icon [img]="RefreshIcon" [size]="16"></lucide-icon>
        Refresh
      </button>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-6 space-y-4">
    @if (feedback()) {
      @if (feedback()!.type === 'success') {
        <div class="p-3 rounded-xl border border-[#00B69B]/30 bg-[#E0F8EA] text-[#008A74] text-sm">
          {{ feedback()!.text }}
        </div>
      }
      @if (feedback()!.type === 'error') {
        <div class="p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
          {{ feedback()!.text }}
        </div>
      }
    }

    @if (clubsError()) {
      <div class="p-3 rounded-xl border border-[#FF9066]/30 bg-[#FFF3D6] text-[#B56300] text-sm">
        {{ clubsError() }}
      </div>
    }

    @if (error()) {
      <div class="p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
        {{ error() }}
      </div>
    }

    <div class="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-[#6B7280] mb-1">Club</label>
        @if (clubsLoading()) {
          <div class="input-field text-[#6B7280]">Loading clubs…</div>
        } @else if (clubs().length > 0) {
          <select class="input-field" [(ngModel)]="selectedClubId">
            @for (club of clubs(); track club.id) {
              <option [ngValue]="club.id">{{ club.name }}</option>
            }
          </select>
        } @else {
          <input class="input-field" type="number" min="1" [(ngModel)]="clubIdInput" placeholder="Club ID" />
        }
      </div>

      <div>
        <label class="block text-sm font-medium text-[#6B7280] mb-1">Window</label>
        <select class="input-field" [(ngModel)]="days">
          @for (dayOption of dayWindowOptions; track dayOption) {
            <option [ngValue]="dayOption">{{ dayOption }} days</option>
          }
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-[#6B7280] mb-1">Member ID</label>
        <input class="input-field" type="number" min="1" [(ngModel)]="memberId" placeholder="Required for booking/cancel" />
      </div>

      <div class="flex items-end">
        <button
          (click)="reloadSessions()"
          [disabled]="loading()"
          class="w-full py-2.5 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1f2937] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          Load sessions
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
            @for (header of headers; track header) {
              <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ header }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td colspan="6" class="px-5 py-12 text-center text-sm text-[#6B7280]">Loading sessions…</td>
            </tr>
          }
          @if (!loading() && sessions().length === 0) {
            <tr>
              <td colspan="6" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No sessions found for current filters.</td>
            </tr>
          }
          @for (session of sessions(); track session.id) {
            <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
              <td class="px-5 py-4">
                <p class="font-bold text-[#111827]">{{ session.courseName }}</p>
                <p class="text-xs text-[#6B7280] mt-1">{{ session.activityType }}</p>
              </td>
              <td class="px-5 py-4 text-sm text-[#111827]">{{ formatStartsAt(session.startsAt) }}</td>
              <td class="px-5 py-4 text-sm text-[#111827]">{{ session.instructorName }}</td>
              <td class="px-5 py-4 text-sm text-[#111827]">{{ session.clubName }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-between text-xs text-[#6B7280]">
                  <span>{{ session.enrolledCount }} / {{ session.maxCapacity }}</span>
                  <span>{{ occupancy(session) }}%</span>
                </div>
                <div class="h-2 bg-[#F0F0F0] rounded-full overflow-hidden mt-1">
                  <div
                    class="h-full rounded-full transition-all"
                    [style.width.%]="occupancy(session)"
                    [style.background-color]="occupancyColor(session)">
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <div class="flex flex-wrap gap-2">
                  <button
                    (click)="openSession(session.id)"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EBEBFF] text-[#4880FF] hover:bg-[#DDE3FF] transition-colors">
                    Details
                  </button>
                  <button
                    (click)="bookSession(session.id)"
                    [disabled]="isSessionBusy(session.id)"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E0F8EA] text-[#008A74] hover:bg-[#c9f0dd] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    Book
                  </button>
                  <button
                    (click)="cancelSessionBooking(session.id)"
                    [disabled]="isSessionBusy(session.id)"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FFF0F0] text-[#FF4747] hover:bg-[#FFE0E0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>

  @if (selectedSessionId() !== null) {
    <div class="fixed inset-0 bg-black/30 z-40" (click)="closeSession()"></div>

    <div class="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
      <div class="p-6 border-b border-[#E0E0E0] flex items-center justify-between">
        <h2 class="text-lg font-bold text-[#111827]">
          {{ selectedSession()?.courseName ?? 'Session details' }}
        </h2>
        <button (click)="closeSession()" class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
          <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        @if (detailLoading()) {
          <div class="text-sm text-[#6B7280]">Loading session details…</div>
        }

        @if (detailError()) {
          <div class="p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
            {{ detailError() }}
          </div>
        }

        @if (selectedSession()) {
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-[#6B7280] font-medium flex items-center gap-1">
                <lucide-icon [img]="UsersIcon" [size]="16"></lucide-icon>
                Occupancy
              </span>
              <span class="text-sm font-bold text-[#111827]">
                {{ selectedSession()!.enrolledCount }} / {{ selectedSession()!.maxCapacity }}
              </span>
            </div>
            <div class="h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                [style.width.%]="occupancy(selectedSession()!)"
                [style.background-color]="occupancyColor(selectedSession()!)">
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-[#E0E0E0] divide-y divide-[#F0F0F0]">
            @for (detail of sessionDetails(); track detail.label) {
              <div class="flex justify-between items-center px-4 py-3 gap-4">
                <span class="text-sm text-[#6B7280]">{{ detail.label }}</span>
                <span class="text-sm font-bold text-[#111827] text-right">{{ detail.value }}</span>
              </div>
            }
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              (click)="bookSession(selectedSession()!.id)"
              [disabled]="isSessionBusy(selectedSession()!.id)"
              class="py-2.5 bg-[#E0F8EA] text-[#008A74] font-semibold rounded-xl hover:bg-[#c9f0dd] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
              <lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon>
              Book
            </button>
            <button
              (click)="cancelSessionBooking(selectedSession()!.id)"
              [disabled]="isSessionBusy(selectedSession()!.id)"
              class="py-2.5 bg-[#FFF0F0] text-[#FF4747] font-semibold rounded-xl hover:bg-[#FFE0E0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm">
              Cancel
            </button>
          </div>
        }
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .input-field { @apply w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827]; }
    .input-field:focus { @apply outline-none border-[#4880FF] ring-1 ring-[#4880FF]; }
  `],
})
export class ScheduleComponent implements OnInit {
  readonly CalendarIcon = CalendarDays;
  readonly RefreshIcon = RefreshCw;
  readonly XIcon = X;
  readonly UsersIcon = Users;
  readonly CheckIcon = Check;
  readonly headers = ['Course', 'Starts at', 'Instructor', 'Club', 'Occupancy', 'Actions'];
  readonly dayWindowOptions = DAY_WINDOW_OPTIONS;

  private readonly coursesApi = inject(CoursesApiService);
  private readonly clubsApi = inject(ClubsApiService);

  sessions = signal<SessionResponse[]>([]);
  clubs = signal<ClubListDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  clubsLoading = signal(true);
  clubsError = signal<string | null>(null);
  feedback = signal<FeedbackMessage | null>(null);
  selectedSessionId = signal<number | null>(null);
  selectedSession = signal<SessionResponse | null>(null);
  detailLoading = signal(false);
  detailError = signal<string | null>(null);
  sessionBusy = signal<Record<number, boolean>>({});

  selectedClubId: number | null = null;
  clubIdInput = 1;
  days = 7;
  memberId: number | null = null;

  ngOnInit(): void {
    this.loadClubsAndSessions();
  }

  reloadSessions(): void {
    this.loadSessions(true);
  }

  openSession(sessionId: number): void {
    this.selectedSessionId.set(sessionId);
    this.loadSessionDetail(sessionId);
  }

  closeSession(): void {
    this.selectedSessionId.set(null);
    this.selectedSession.set(null);
    this.detailError.set(null);
    this.detailLoading.set(false);
  }

  bookSession(sessionId: number): void {
    const memberId = this.resolveMemberId();
    if (memberId === null) {
      this.pushFeedback('error', 'Please provide a valid member ID before booking.');
      return;
    }

    const payload: BookSessionRequest = { memberId, sessionId };
    this.setSessionBusy(sessionId, true);
    this.coursesApi.bookSession(payload).subscribe({
      next: () => {
        this.pushFeedback('success', `Booking created for member #${memberId}.`);
        this.refreshSessionData(sessionId);
      },
      error: () => this.pushFeedback('error', 'Unable to create booking for this session.'),
      complete: () => this.setSessionBusy(sessionId, false),
    });
  }

  cancelSessionBooking(sessionId: number): void {
    const memberId = this.resolveMemberId();
    if (memberId === null) {
      this.pushFeedback('error', 'Please provide a valid member ID before cancelling.');
      return;
    }

    this.setSessionBusy(sessionId, true);
    this.coursesApi.cancelBooking(memberId, sessionId).subscribe({
      next: () => {
        this.pushFeedback('success', `Booking cancelled for member #${memberId}.`);
        this.refreshSessionData(sessionId);
      },
      error: () => this.pushFeedback('error', 'Unable to cancel booking for this session.'),
      complete: () => this.setSessionBusy(sessionId, false),
    });
  }

  isSessionBusy(sessionId: number): boolean {
    return this.sessionBusy()[sessionId] ?? false;
  }

  occupancy(session: SessionResponse): number {
    return normalizePercentage(session.occupancyPercent);
  }

  occupancyColor(session: SessionResponse): string {
    const percent = this.occupancy(session);
    if (percent >= 100) {
      return '#FF4747';
    }
    if (percent >= 80) {
      return '#FF9066';
    }
    return '#4880FF';
  }

  formatStartsAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  sessionDetails(): Array<{ label: string; value: string }> {
    const session = this.selectedSession();
    if (!session) {
      return [];
    }

    return [
      { label: 'Course', value: session.courseName },
      { label: 'Activity', value: session.activityType },
      { label: 'Instructor', value: session.instructorName },
      { label: 'Club', value: session.clubName },
      { label: 'Starts at', value: this.formatStartsAt(session.startsAt) },
      { label: 'Duration', value: `${session.durationMinutes} min` },
      { label: 'Occupancy', value: `${this.occupancy(session)}%` },
    ];
  }

  private loadClubsAndSessions(): void {
    this.clubsLoading.set(true);
    this.clubsError.set(null);

    this.clubsApi.listClubs()
      .pipe(finalize(() => {
        this.clubsLoading.set(false);
        this.loadSessions(true);
      }))
      .subscribe({
        next: (clubs) => {
          this.clubs.set(clubs);
          if (clubs.length === 0) {
            return;
          }

          const currentClubId = this.selectedClubId;
          if (currentClubId !== null && clubs.some((club) => club.id === currentClubId)) {
            this.selectedClubId = currentClubId;
          } else {
            this.selectedClubId = clubs[0].id;
          }
          this.clubIdInput = this.selectedClubId ?? clubs[0].id;
        },
        error: () => {
          this.clubs.set([]);
          this.clubsError.set('Unable to load clubs list. You can still use the Club ID field.');
        },
      });
  }

  private loadSessions(showLoader: boolean): void {
    const clubId = this.resolveClubId();
    if (clubId === null) {
      this.sessions.set([]);
      this.error.set('Please provide a valid club ID to load sessions.');
      this.loading.set(false);
      return;
    }

    const normalizedDays = this.normalizeDays(this.days);
    this.days = normalizedDays;

    if (showLoader) {
      this.loading.set(true);
    }
    this.error.set(null);

    this.coursesApi.listSessions(clubId, normalizedDays).subscribe({
      next: (sessions) => {
        const ordered = [...sessions].sort((left, right) => safeTimestamp(left.startsAt) - safeTimestamp(right.startsAt));
        this.sessions.set(ordered);
      },
      error: () => {
        this.error.set('Unable to load course sessions.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadSessionDetail(sessionId: number): void {
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.selectedSession.set(null);

    this.coursesApi.getSession(sessionId).subscribe({
      next: (session) => this.selectedSession.set(session),
      error: () => {
        this.detailError.set('Unable to load session details.');
        this.detailLoading.set(false);
      },
      complete: () => this.detailLoading.set(false),
    });
  }

  private refreshSessionData(sessionId: number): void {
    this.loadSessions(false);
    if (this.selectedSessionId() === sessionId) {
      this.loadSessionDetail(sessionId);
    }
  }

  private pushFeedback(type: FeedbackMessage['type'], text: string): void {
    this.feedback.set({ type, text });
  }

  private setSessionBusy(sessionId: number, busy: boolean): void {
    this.sessionBusy.update((state) => ({ ...state, [sessionId]: busy }));
  }

  private resolveClubId(): number | null {
    const selected = Number(this.selectedClubId);
    if (Number.isInteger(selected) && selected > 0) {
      return selected;
    }

    const explicit = Number(this.clubIdInput);
    if (Number.isInteger(explicit) && explicit > 0) {
      return explicit;
    }

    return null;
  }

  private resolveMemberId(): number | null {
    const parsed = Number(this.memberId);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
    return null;
  }

  private normalizeDays(value: number): number {
    if (!Number.isFinite(value)) {
      return 7;
    }
    return Math.max(1, Math.min(60, Math.round(value)));
  }
}
