import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CalendarRange, ChevronLeft, ChevronRight, Clock, Plus, Trash2, X } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { ClubsApiService } from '../../shared/services/clubs-api.service';
import { EmployeeSummaryDto, EmployeesApiService } from '../../shared/services/employees-api.service';
import { CreateShiftRequest, ShiftResponse, ShiftsApiService } from '../../shared/services/shifts-api.service';

type ShiftType = 'Opening' | 'Morning' | 'Afternoon' | 'Evening' | 'Closing' | 'Custom';

interface Shift {
  id: number;
  employeeId: number;
  employeeName: string;
  role: string;
  clubId: number;
  clubName: string;
  date: string;
  dayOfWeek: number;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
}

interface ClubOption {
  id: number;
  name: string;
}

interface ClubFilterOption {
  id: number | 'all';
  label: string;
}

interface EmployeeOption {
  id: number;
  name: string;
  role: string;
  clubId: number;
}

interface ShiftForm {
  employeeId: number;
  clubId: number;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHIFT_COLORS: Record<ShiftType, { bg: string; text: string; border: string }> = {
  Opening: { bg: 'bg-[#E0F8EA]', text: 'text-[#00B69B]', border: 'border-[#00B69B]/30' },
  Morning: { bg: 'bg-[#EBEBFF]', text: 'text-[#4880FF]', border: 'border-[#4880FF]/30' },
  Afternoon: { bg: 'bg-[#FFF3D6]', text: 'text-[#FF9066]', border: 'border-[#FF9066]/30' },
  Evening: { bg: 'bg-[#F3F0FF]', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/30' },
  Closing: { bg: 'bg-[#FFF0F0]', text: 'text-[#FF4747]', border: 'border-[#FF4747]/30' },
  Custom: { bg: 'bg-[#F5F6FA]', text: 'text-[#6B7280]', border: 'border-[#E0E0E0]' },
};
const SHIFT_TYPES = Object.keys(SHIFT_COLORS) as ShiftType[];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getWeekStartDate(offset: number): Date {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - mondayOffset + offset * 7);
  return monday;
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateOnly(value: string): Date {
  const [yearPart, monthPart, dayPart] = value.split('-').map((part) => Number(part));
  if ([yearPart, monthPart, dayPart].some((part) => Number.isNaN(part))) {
    const parsed = new Date(value);
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  return new Date(yearPart, monthPart - 1, dayPart);
}

function formatWeekRange(offset: number): string {
  const start = getWeekStartDate(offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const formatter = (value: Date) => value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${formatter(start)} – ${formatter(end)}`;
}

function getDayDate(offset: number, dayIdx: number): string {
  const start = getWeekStartDate(offset);
  const target = new Date(start);
  target.setDate(start.getDate() + dayIdx);
  return String(target.getDate());
}

function resolveDayIndex(dateValue: string, weekStartDate: Date): number {
  const shiftDate = parseDateOnly(dateValue);
  const deltaDays = Math.round((shiftDate.getTime() - weekStartDate.getTime()) / MS_PER_DAY);

  if (deltaDays >= 0 && deltaDays <= 6) {
    return deltaDays;
  }

  return (shiftDate.getDay() + 6) % 7;
}

function createEmptyShiftForm(clubId: number, date: string): ShiftForm {
  return {
    employeeId: 0,
    clubId,
    date,
    startTime: '08:00',
    endTime: '16:00',
    shiftType: 'Morning',
  };
}

@Component({
  selector: 'app-shifts-schedule',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <lucide-icon [img]="CalendarRangeIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
          Shift Schedule
        </h1>
        <p class="text-sm text-[#6B7280] mt-1">
          {{ visibleShifts().length }} shift{{ visibleShifts().length !== 1 ? 's' : '' }} · {{ weekRange() }}
        </p>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <button
          (click)="openCreateModal()"
          class="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all disabled:opacity-60"
          [disabled]="loading() || saving() || clubs().length === 0">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Add shift
        </button>

        <div class="flex rounded-xl overflow-hidden border border-[#E0E0E0]">
          @for (c of clubFilters(); track c.id) {
            <button
              (click)="selectClub(c.id)"
              class="px-3 py-2 text-sm font-semibold transition-colors"
              [class]="clubFilter() === c.id ? 'bg-[#4880FF] text-white' : 'bg-white text-[#6B7280] hover:bg-[#F8FAFF]'"
              [disabled]="loading() || saving()">
              {{ c.label }}
            </button>
          }
        </div>

        <div class="flex items-center gap-1 border border-[#E0E0E0] rounded-xl overflow-hidden">
          <button
            (click)="goToPreviousWeek()"
            class="px-3 py-2 text-[#6B7280] hover:bg-[#F8FAFF] transition-colors disabled:opacity-50"
            [disabled]="loading() || saving()">
            <lucide-icon [img]="ChevLeftIcon" [size]="16"></lucide-icon>
          </button>
          <button
            (click)="goToCurrentWeek()"
            class="px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            [class]="weekOffset() === 0 ? 'bg-[#4880FF] text-white' : 'text-[#6B7280] hover:bg-[#F8FAFF]'"
            [disabled]="loading() || saving()">
            This week
          </button>
          <button
            (click)="goToNextWeek()"
            class="px-3 py-2 text-[#6B7280] hover:bg-[#F8FAFF] transition-colors disabled:opacity-50"
            [disabled]="loading() || saving()">
            <lucide-icon [img]="ChevRightIcon" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-white border-b border-[#E0E0E0] px-8 py-2 flex-shrink-0 flex items-center gap-4 flex-wrap">
    @for (st of shiftTypes; track st) {
      <span class="flex items-center gap-1.5 text-xs font-semibold" [class]="shiftColors[st].text">
        <span class="w-2.5 h-2.5 rounded-sm inline-block" [class]="shiftColors[st].bg"></span>
        {{ st }}
      </span>
    }
  </div>

  <div class="flex-1 overflow-auto p-6 space-y-4">
    @if (error()) {
      <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 text-sm text-[#C53030]">
        {{ error() }}
      </div>
    }

    @if (saving()) {
      <div class="rounded-xl border border-[#DCE7FF] bg-[#F8FAFF] px-4 py-3 text-sm text-[#3b6ee0]">
        Saving schedule changes...
      </div>
    }

    <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden" style="min-width:800px">
      @if (loading()) {
        <div class="px-5 py-16 text-center text-sm text-[#A6A6A6]">Loading shifts...</div>
      } @else {
        <div class="grid border-b border-[#E0E0E0]" style="grid-template-columns:200px repeat(7,1fr)">
          <div class="px-4 py-3 bg-[#F8FAFF] border-r border-[#E0E0E0]">
            <span class="text-xs font-bold text-[#6B7280] uppercase">Employee</span>
          </div>
          @for (day of days; track day; let i = $index) {
            <div
              class="px-3 py-3 text-center border-r border-[#E0E0E0] last:border-r-0"
              [class]="isToday(i) ? 'bg-[#EBEBFF]' : 'bg-[#F8FAFF]'">
              <p class="text-xs font-bold uppercase" [class]="isToday(i) ? 'text-[#4880FF]' : 'text-[#6B7280]'">{{ day }}</p>
              <p class="text-lg font-black" [class]="isToday(i) ? 'text-[#4880FF]' : 'text-[#111827]'">{{ dayDate(i) }}</p>
            </div>
          }
        </div>

        @if (filteredEmployees().length === 0) {
          <div class="px-5 py-16 text-center text-sm text-[#A6A6A6]">No shifts for this period</div>
        } @else {
          @for (emp of filteredEmployees(); track emp.id; let ei = $index) {
            <div
              class="grid border-b border-[#F0F0F0] last:border-b-0"
              [class]="ei % 2 === 0 ? '' : 'bg-[#FAFAFA]'"
              style="grid-template-columns:200px repeat(7,1fr)">
              <div class="px-4 py-3 border-r border-[#E0E0E0] flex flex-col justify-center">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center justify-center text-xs font-bold shrink-0">
                    {{ initials(emp.name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-[#111827] truncate">{{ emp.name }}</p>
                    <p class="text-[11px] text-[#A6A6A6]">{{ emp.role }} · {{ emp.club }}</p>
                  </div>
                </div>
              </div>

              @for (day of days; track day; let di = $index) {
                <div
                  class="px-2 py-2 border-r border-[#F0F0F0] last:border-r-0 min-h-16 flex flex-col gap-1"
                  [class]="isToday(di) ? 'bg-[#F8FAFF]' : ''">
                  @for (shift of getShifts(emp.id, di); track shift.id) {
                    <div
                      class="rounded-lg px-2 py-1 border"
                      [class]="shiftColors[shift.shiftType].bg + ' ' + shiftColors[shift.shiftType].border">
                      <div class="flex items-start justify-between gap-1">
                        <p class="text-[11px] font-bold" [class]="shiftColors[shift.shiftType].text">{{ shift.shiftType }}</p>
                        <button
                          (click)="removeShift(shift)"
                          class="p-0.5 rounded text-[#A6A6A6] hover:text-[#FF4747] hover:bg-white/70 transition-colors disabled:opacity-50"
                          [disabled]="saving()"
                          title="Delete shift">
                          <lucide-icon [img]="TrashIcon" [size]="11"></lucide-icon>
                        </button>
                      </div>
                      <p class="text-[10px] text-[#6B7280] flex items-center gap-0.5">
                        <lucide-icon [img]="ClockIcon" [size]="10"></lucide-icon>
                        {{ shift.startTime }}–{{ shift.endTime }}
                      </p>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }
      }
    </div>

    <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
      @for (st of shiftTypes; track st) {
        <div class="bg-white rounded-xl border p-4 text-center" [class]="shiftColors[st].border">
          <p class="text-2xl font-black" [class]="shiftColors[st].text">{{ shiftCount(st) }}</p>
          <p class="text-xs text-[#6B7280] font-medium mt-0.5">{{ st }}</p>
        </div>
      }
    </div>
  </div>

  @if (showCreateModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeCreateModal()">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Create shift</h3>
          <button
            (click)="closeCreateModal()"
            class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]"
            [disabled]="saving()">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        @if (createError()) {
          <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 mb-4 text-sm text-[#C53030]">
            {{ createError() }}
          </div>
        }

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Club</label>
            <select
              class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]"
              [ngModel]="form().clubId"
              (ngModelChange)="onFormClubChange(+$event)"
              [disabled]="saving()">
              @for (club of clubs(); track club.id) {
                <option [ngValue]="club.id">{{ club.name }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Employee</label>
            <select
              class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]"
              [ngModel]="form().employeeId"
              (ngModelChange)="patchForm('employeeId', +$event)"
              [disabled]="saving() || loadingFormEmployees()">
              @for (employee of formEmployees(); track employee.id) {
                <option [ngValue]="employee.id">{{ employee.name }} · {{ employee.role }}</option>
              }
            </select>
            @if (loadingFormEmployees()) {
              <p class="text-xs text-[#6B7280] mt-1">Loading employees...</p>
            } @else if (formEmployees().length === 0) {
              <p class="text-xs text-[#C53030] mt-1">No employees available for this club.</p>
            }
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">Date</label>
              <input
                type="date"
                class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]"
                [ngModel]="form().date"
                (ngModelChange)="patchForm('date', $event)"
                [disabled]="saving()" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">Start</label>
              <input
                type="time"
                class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]"
                [ngModel]="form().startTime"
                (ngModelChange)="patchForm('startTime', $event)"
                [disabled]="saving()" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">End</label>
              <input
                type="time"
                class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF]"
                [ngModel]="form().endTime"
                (ngModelChange)="patchForm('endTime', $event)"
                [disabled]="saving()" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-2">Shift type</label>
            <div class="grid grid-cols-3 gap-2">
              @for (type of shiftTypes; track type) {
                <button
                  (click)="onShiftTypeChange(type)"
                  class="py-2 rounded-lg text-xs font-bold border transition-colors"
                  [class]="form().shiftType === type ? shiftColors[type].bg + ' ' + shiftColors[type].text + ' border-transparent' : 'bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#4880FF]'"
                  [disabled]="saving()">
                  {{ type }}
                </button>
              }
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
            (click)="handleCreateShift()"
            class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors disabled:opacity-60"
            [disabled]="saving() || loadingFormEmployees() || formEmployees().length === 0">
            {{ saving() ? 'Creating...' : 'Create shift' }}
          </button>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class ShiftsScheduleComponent implements OnInit {
  readonly CalendarRangeIcon = CalendarRange;
  readonly ChevLeftIcon = ChevronLeft;
  readonly ChevRightIcon = ChevronRight;
  readonly ClockIcon = Clock;
  readonly PlusIcon = Plus;
  readonly TrashIcon = Trash2;
  readonly XIcon = X;

  readonly days = DAYS;
  readonly shiftTypes = SHIFT_TYPES;
  readonly shiftColors = SHIFT_COLORS;

  private readonly shiftsApi = inject(ShiftsApiService);
  private readonly clubsApi = inject(ClubsApiService);
  private readonly employeesApi = inject(EmployeesApiService);

  readonly clubs = signal<ClubOption[]>([]);
  readonly shifts = signal<Shift[]>([]);

  readonly weekOffset = signal(0);
  readonly clubFilter = signal<number | 'all'>('all');

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly showCreateModal = signal(false);
  readonly loadingFormEmployees = signal(false);
  readonly formEmployees = signal<EmployeeOption[]>([]);
  readonly createError = signal<string | null>(null);
  readonly form = signal<ShiftForm>(createEmptyShiftForm(1, formatDateOnly(getWeekStartDate(0))));

  readonly weekRange = computed(() => formatWeekRange(this.weekOffset()));
  readonly clubFilters = computed<ClubFilterOption[]>(() => [
    { id: 'all', label: 'All clubs' },
    ...this.clubs().map((club) => ({ id: club.id, label: club.name })),
  ]);
  readonly visibleShifts = computed(() => this.shifts());
  readonly filteredEmployees = computed(() => {
    const employees = new Map<number, { id: number; name: string; role: string; club: string }>();

    for (const shift of this.visibleShifts()) {
      if (!employees.has(shift.employeeId)) {
        employees.set(shift.employeeId, {
          id: shift.employeeId,
          name: shift.employeeName,
          role: shift.role,
          club: shift.clubName,
        });
      }
    }

    return Array.from(employees.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  private readonly todayIndex = (new Date().getDay() + 6) % 7;

  ngOnInit(): void {
    this.loadClubs();
  }

  selectClub(clubId: number | 'all'): void {
    if (this.clubFilter() === clubId) return;
    this.clubFilter.set(clubId);
    this.loadWeekShifts();
  }

  goToPreviousWeek(): void {
    this.weekOffset.update((value) => value - 1);
    this.loadWeekShifts();
  }

  goToCurrentWeek(): void {
    if (this.weekOffset() === 0) return;
    this.weekOffset.set(0);
    this.loadWeekShifts();
  }

  goToNextWeek(): void {
    this.weekOffset.update((value) => value + 1);
    this.loadWeekShifts();
  }

  isToday(dayIdx: number): boolean {
    return this.weekOffset() === 0 && dayIdx === this.todayIndex;
  }

  dayDate(dayIdx: number): string {
    return getDayDate(this.weekOffset(), dayIdx);
  }

  getShifts(empId: number, dayIdx: number): Shift[] {
    return this.visibleShifts().filter((shift) => shift.employeeId === empId && shift.dayOfWeek === dayIdx);
  }

  shiftCount(type: ShiftType): number {
    return this.visibleShifts().filter((shift) => shift.shiftType === type).length;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  openCreateModal(): void {
    const clubs = this.clubs();
    if (clubs.length === 0) return;

    const activeClubFilter = this.clubFilter();
    const selectedClubId = activeClubFilter === 'all' ? clubs[0].id : activeClubFilter;
    const weekStart = formatDateOnly(getWeekStartDate(this.weekOffset()));

    this.form.set(createEmptyShiftForm(selectedClubId, weekStart));
    this.createError.set(null);
    this.showCreateModal.set(true);
    this.loadEmployeesForClub(selectedClubId);
  }

  closeCreateModal(): void {
    if (this.saving()) return;
    this.showCreateModal.set(false);
    this.loadingFormEmployees.set(false);
    this.createError.set(null);
  }

  onFormClubChange(clubId: number): void {
    this.form.update((current) => ({ ...current, clubId, employeeId: 0 }));
    this.loadEmployeesForClub(clubId);
  }

  onShiftTypeChange(type: string): void {
    this.patchForm('shiftType', this.normalizeShiftType(type));
  }

  patchForm<K extends keyof ShiftForm>(key: K, value: ShiftForm[K]): void {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  handleCreateShift(): void {
    const form = this.form();
    if (!form.clubId || !form.employeeId || !form.date || !form.startTime || !form.endTime) {
      this.createError.set('Please fill all required fields.');
      return;
    }

    if (form.startTime >= form.endTime) {
      this.createError.set('End time must be later than start time.');
      return;
    }

    const request: CreateShiftRequest = {
      employeeId: Number(form.employeeId),
      clubId: Number(form.clubId),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      shiftType: form.shiftType,
    };

    this.saving.set(true);
    this.createError.set(null);

    this.shiftsApi.createShift(request).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.saving.set(false);
        this.loadWeekShifts();
      },
      error: () => {
        this.saving.set(false);
        this.createError.set('Unable to create shift.');
      },
    });
  }

  removeShift(shift: Shift): void {
    if (this.saving()) return;

    const confirmed = window.confirm(`Delete ${shift.employeeName}'s ${shift.shiftType} shift on ${shift.date}?`);
    if (!confirmed) return;

    this.saving.set(true);
    this.error.set(null);

    this.shiftsApi.deleteShift(shift.id).subscribe({
      next: () => this.loadWeekShifts(),
      error: () => {
        this.error.set('Unable to delete shift.');
        this.saving.set(false);
      },
      complete: () => this.saving.set(false),
    });
  }

  private loadClubs(): void {
    this.loading.set(true);
    this.error.set(null);

    this.clubsApi.listClubs().subscribe({
      next: (response) => {
        this.clubs.set(response.map((club) => ({ id: club.id, name: club.name })));
        this.loadWeekShifts();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load clubs.');
      },
    });
  }

  private loadWeekShifts(): void {
    if (this.clubs().length === 0) {
      this.shifts.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const weekStartDate = getWeekStartDate(this.weekOffset());
    const weekStart = formatDateOnly(weekStartDate);
    const selectedClub = this.clubFilter();
    const clubId = selectedClub === 'all' ? null : selectedClub;

    this.shiftsApi.listWeekShifts(clubId, weekStart).subscribe({
      next: (response) => {
        this.shifts.set(this.mapShifts(response, weekStartDate));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load shifts.');
      },
    });
  }

  private loadEmployeesForClub(clubId: number): void {
    this.loadingFormEmployees.set(true);
    this.createError.set(null);

    this.employeesApi.listEmployees(1, 200, clubId, null).subscribe({
      next: (response) => {
        const employees = this.mapEmployeeOptions(response.items ?? []);
        this.formEmployees.set(employees);
        this.form.update((current) => ({
          ...current,
          employeeId: employees.some((employee) => employee.id === current.employeeId) ? current.employeeId : (employees[0]?.id ?? 0),
        }));
        this.loadingFormEmployees.set(false);
      },
      error: () => {
        this.formEmployees.set([]);
        this.form.update((current) => ({ ...current, employeeId: 0 }));
        this.loadingFormEmployees.set(false);
        this.createError.set('Unable to load employees for this club.');
      },
    });
  }

  private mapEmployeeOptions(rows: EmployeeSummaryDto[]): EmployeeOption[] {
    return rows
      .map((employee) => ({
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        role: employee.role,
        clubId: employee.clubId,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private mapShifts(rows: ShiftResponse[], weekStartDate: Date): Shift[] {
    return rows
      .map((row) => this.mapShift(row, weekStartDate))
      .sort((a, b) =>
        a.employeeName.localeCompare(b.employeeName)
        || a.dayOfWeek - b.dayOfWeek
        || a.startTime.localeCompare(b.startTime),
      );
  }

  private mapShift(response: ShiftResponse, weekStartDate: Date): Shift {
    return {
      id: response.id,
      employeeId: response.employeeId,
      employeeName: response.employeeName,
      role: response.employeeRole,
      clubId: response.clubId,
      clubName: this.clubNameById(response.clubId),
      date: response.date,
      dayOfWeek: resolveDayIndex(response.date, weekStartDate),
      shiftType: this.normalizeShiftType(response.shiftType),
      startTime: this.normalizeTime(response.startTime),
      endTime: this.normalizeTime(response.endTime),
    };
  }

  private normalizeShiftType(rawType: string): ShiftType {
    return SHIFT_TYPES.includes(rawType as ShiftType) ? (rawType as ShiftType) : 'Custom';
  }

  private normalizeTime(value: string): string {
    const normalized = value.trim();
    return normalized.length >= 5 ? normalized.slice(0, 5) : normalized;
  }

  private clubNameById(clubId: number): string {
    return this.clubs().find((club) => club.id === clubId)?.name ?? '—';
  }
}


