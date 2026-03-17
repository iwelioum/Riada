import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Course, Session, ClubSummary, MemberSummary } from '../../core/models/api-models';

export interface WeekDay {
  date: Date;
  dateKey: string;
  label: string;
  sessions: Session[];
  isToday: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent implements OnInit {
  activeTab: 'timetable' | 'catalog' = 'timetable';

  // Club / week
  clubs: ClubSummary[] = [];
  clubId: number | null = null;
  weekStart: Date = this.getMondayOfWeek(new Date());
  weekDays: WeekDay[] = [];
  loading = false;
  clubsLoading = false;
  error: string | null = null;

  // Booking panel
  selectedSession: Session | null = null;
  memberSearch = '';
  memberResults: MemberSummary[] = [];
  memberSearchLoading = false;
  selectedMemberId: number | null = null;
  selectedMemberName = '';
  bookingLoading = false;
  bookingResult: string | null = null;
  bookingError: string | null = null;
  private searchSubject = new Subject<string>();

  // Catalog tab
  courses: Course[] = [];
  catalogLoading = false;
  catalogError: string | null = null;
  catalogSearch = '';
  catalogActivity = '';
  catalogDifficulty = '';
  private catalogUsingSessionsFallback = false;
  private catalogFallbackPendingClub = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buildWeekDays();
    this.loadClubs();
    this.loadCatalog();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => {
        if (q.trim().length < 2) {
          this.memberResults = [];
          this.cdr.markForCheck();
          return of(null);
        }
        this.memberSearchLoading = true;
        this.cdr.markForCheck();
        return this.api.getMembers({ search: q.trim(), pageSize: 8 }).pipe(catchError(() => of(null)));
      })
    ).subscribe((res) => {
      this.memberResults = res?.items ?? [];
      this.memberSearchLoading = false;
      this.cdr.markForCheck();
    });
  }

  // ── Week navigation ──────────────────────────────────────
  prevWeek(): void {
    this.weekStart = new Date(this.weekStart.getTime() - 7 * 86400000);
    this.buildWeekDays();
    this.loadSessions();
  }

  nextWeek(): void {
    this.weekStart = new Date(this.weekStart.getTime() + 7 * 86400000);
    this.buildWeekDays();
    this.loadSessions();
  }

  goToToday(): void {
    this.weekStart = this.getMondayOfWeek(new Date());
    this.buildWeekDays();
    this.loadSessions();
  }

  get weekLabel(): string {
    const end = new Date(this.weekStart.getTime() + 6 * 86400000);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${fmt(this.weekStart)} – ${fmt(end)}`;
  }

  get isCurrentWeek(): boolean {
    const monday = this.getMondayOfWeek(new Date());
    return this.weekStart.getTime() === monday.getTime();
  }

  get isPastWeek(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(this.weekStart.getTime() + 7 * 86400000);
    return weekEnd <= today;
  }

  private getMondayOfWeek(d: Date): Date {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private buildWeekDays(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().slice(0, 10);

    const days: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.weekStart.getTime() + i * 86400000);
      const dateKey = date.toISOString().slice(0, 10);
      days.push({
        date,
        dateKey,
        label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        sessions: [],
        isToday: dateKey === todayKey,
        isPast: date < today
      });
    }
    this.weekDays = days;
  }

  // ── Data loading ─────────────────────────────────────────
  private loadClubs(): void {
    this.clubsLoading = true;
    this.api.listClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs ?? [];
        if (this.clubs.length) this.clubId = this.clubs[0].id;
        this.clubsLoading = false;
        this.loadSessions();
        if (this.catalogFallbackPendingClub && this.clubId) {
          this.loadCatalogFromSessions();
        }
        this.cdr.markForCheck();
      },
      error: () => { this.clubsLoading = false; this.cdr.markForCheck(); }
    });
  }

  loadSessions(): void {
    if (!this.clubId) return;

    // Past weeks have no bookable sessions — clear and show banner
    if (this.isPastWeek) {
      for (const day of this.weekDays) day.sessions = [];
      this.loading = false;
      this.error = null;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = null;

    // Calculate days from today to the END of the selected week.
    // This correctly handles viewing the current week (partial) or a future week.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(this.weekStart.getTime() + 7 * 86400000);
    const daysToLoad = Math.ceil((weekEnd.getTime() - today.getTime()) / 86400000);
    const clampedDays = Math.min(Math.max(daysToLoad, 1), 60);

    this.api.getUpcomingSessions(this.clubId, clampedDays).subscribe({
      next: (sessions) => {
        for (const day of this.weekDays) day.sessions = [];
        for (const s of sessions) {
          const key = s.startsAt.slice(0, 10);
          const day = this.weekDays.find((d) => d.dateKey === key);
          if (day) day.sessions.push(s);
        }
        for (const day of this.weekDays) {
          day.sessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = this.getErrorMessage(err, 'Unable to load sessions.');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadCatalog(): void {
    this.catalogLoading = true;
    this.catalogError = null;
    this.catalogUsingSessionsFallback = false;
    this.catalogFallbackPendingClub = false;
    this.api.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses ?? [];
        this.catalogError = null;
        this.catalogLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (this.shouldFallbackCatalogToSessions(err)) {
          this.catalogUsingSessionsFallback = true;
          this.loadCatalogFromSessions();
          return;
        }

        this.catalogError = this.getErrorMessage(err, 'Unable to load catalog.');
        this.catalogLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onClubChange(): void {
    this.loadSessions();
    if (this.catalogUsingSessionsFallback) {
      this.loadCatalogFromSessions();
    }
  }

  private shouldFallbackCatalogToSessions(err: unknown): boolean {
    if (!(err instanceof HttpErrorResponse)) {
      return true;
    }

    return err.status !== 401;
  }

  private loadCatalogFromSessions(): void {
    if (!this.clubId) {
      this.catalogFallbackPendingClub = true;
      this.catalogLoading = false;
      this.catalogError = null;
      this.cdr.markForCheck();
      return;
    }

    this.catalogFallbackPendingClub = false;
    this.catalogLoading = true;
    this.catalogError = null;

    this.api.getUpcomingSessions(this.clubId, 60).subscribe({
      next: (sessions) => {
        this.courses = this.mapCatalogFromSessions(sessions);
        this.catalogError = null;
        this.catalogLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.courses = [];
        this.catalogError = this.getCatalogFallbackErrorMessage(err);
        this.catalogLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private mapCatalogFromSessions(sessions: Session[]): Course[] {
    const catalogByCourseId = new Map<number, Course>();

    for (const session of sessions ?? []) {
      if (catalogByCourseId.has(session.courseId)) continue;

      catalogByCourseId.set(session.courseId, {
        id: session.courseId,
        courseName: session.courseName || 'Unnamed course',
        description: null,
        difficultyLevel: 'Unknown',
        durationMinutes: session.durationMinutes ?? 0,
        maxCapacity: session.maxCapacity ?? 0,
        estimatedCalories: null,
        activityType: session.activityType ?? null
      });
    }

    return [...catalogByCourseId.values()].sort((a, b) => a.courseName.localeCompare(b.courseName));
  }

  private getCatalogFallbackErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && err.status === 403) {
      return 'Catalog is unavailable for your role.';
    }

    return this.getErrorMessage(err, 'Unable to load catalog.');
  }

  // ── Activity color ────────────────────────────────────────
  getActivityClass(activityType?: string | null): string {
    switch (activityType) {
      case 'Cardio':     return 'act-cardio';
      case 'Strength':   return 'act-strength';
      case 'Flexibility':return 'act-flex';
      case 'Relaxation': return 'act-relax';
      case 'Dance':      return 'act-dance';
      case 'Combat':     return 'act-combat';
      case 'Mixed':      return 'act-mixed';
      default:           return 'act-default';
    }
  }

  // ── Capacity status ───────────────────────────────────────
  getCapacityStatus(s: Session): 'full' | 'almost' | 'available' {
    if (s.occupancyPercent >= 100) return 'full';
    if (s.occupancyPercent >= 80)  return 'almost';
    return 'available';
  }

  getCapacityLabel(s: Session): string {
    if (s.occupancyPercent >= 100) return 'Full';
    if (s.occupancyPercent >= 80)  return 'Almost full';
    return 'Available';
  }

  // ── Booking panel ─────────────────────────────────────────
  openBooking(session: Session, event: Event): void {
    event.stopPropagation();
    this.selectedSession = session;
    this.memberSearch = '';
    this.memberResults = [];
    this.selectedMemberId = null;
    this.selectedMemberName = '';
    this.bookingResult = null;
    this.bookingError = null;
    this.cdr.markForCheck();
  }

  closeBooking(): void {
    this.selectedSession = null;
    this.cdr.markForCheck();
  }

  onMemberSearch(q: string): void { this.searchSubject.next(q); }

  selectMember(m: MemberSummary): void {
    this.selectedMemberId = m.id;
    this.selectedMemberName = `${m.firstName} ${m.lastName}`;
    this.memberSearch = this.selectedMemberName;
    this.memberResults = [];
    this.bookingResult = null;
    this.bookingError = null;
    this.cdr.markForCheck();
  }

  confirmBooking(): void {
    if (!this.selectedSession || !this.selectedMemberId || this.bookingLoading) return;
    this.bookingLoading = true;
    this.bookingResult = null;
    this.bookingError = null;
    this.api.bookSession(this.selectedSession.id, this.selectedMemberId).subscribe({
      next: (r) => {
        this.bookingResult = r.message;
        this.bookingLoading = false;
        this.loadSessions();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.bookingError = this.getErrorMessage(err, 'Booking failed.');
        this.bookingLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancelBooking(): void {
    if (!this.selectedSession || !this.selectedMemberId || this.bookingLoading) return;
    this.bookingLoading = true;
    this.bookingResult = null;
    this.bookingError = null;
    this.api.cancelBooking(this.selectedMemberId, this.selectedSession.id).subscribe({
      next: (r) => {
        this.bookingResult = r.message;
        this.bookingLoading = false;
        this.loadSessions();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.bookingError = this.getErrorMessage(err, 'Cancellation failed.');
        this.bookingLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Catalog filters ───────────────────────────────────────
  get filteredCourses(): Course[] {
    return this.courses.filter((c) => {
      const courseName = c.courseName ?? '';
      const difficultyLevel = c.difficultyLevel ?? '';
      const matchSearch = !this.catalogSearch || courseName.toLowerCase().includes(this.catalogSearch.toLowerCase());
      const matchActivity = !this.catalogActivity || c.activityType === this.catalogActivity;
      const matchDifficulty = !this.catalogDifficulty || difficultyLevel === this.catalogDifficulty;
      return matchSearch && matchActivity && matchDifficulty;
    });
  }

  get uniqueActivities(): string[] {
    return [...new Set(this.courses.map((c) => c.activityType).filter(Boolean) as string[])].sort();
  }

  get uniqueDifficulties(): string[] {
    return [...new Set(this.courses.map((c) => c.difficultyLevel).filter(Boolean) as string[])].sort();
  }

  private getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) return 'Session expired.';
      if (err.status === 403) return 'Access denied.';
      const msg = err.error?.message ?? err.error?.Message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    return fallback;
  }
}
