import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

type WorkoutStatus = 'Completed' | 'Planned' | 'Missed';
type WorkoutCategory = 'Cardio' | 'Strength' | 'Mobility' | 'Recovery' | 'HIIT';
type WorkoutIntensity = 'Low' | 'Moderate' | 'High';
type WorkoutLoadState = 'loading' | 'ready' | 'empty' | 'error';
type WorkoutEmptyReason = 'filters' | 'no-data';

interface WorkoutEntry {
  id: number;
  name: string;
  category: WorkoutCategory;
  scheduledAt: string;
  durationMinutes: number;
  calories: number;
  intensity: WorkoutIntensity;
  status: WorkoutStatus;
  notes: string;
}

interface WorkoutCardViewModel {
  id: number;
  name: string;
  category: WorkoutCategory;
  scheduledAt: string;
  durationMinutes: number;
  calories: number;
  intensity: WorkoutIntensity;
  status: WorkoutStatus;
  statusClass: string;
  notes: string;
  canMarkComplete: boolean;
}

function isoAt(dayOffset: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function buildLocalWorkoutLog(): WorkoutEntry[] {
  return [
    {
      id: 1,
      name: 'Morning Run Intervals',
      category: 'Cardio',
      scheduledAt: isoAt(-1, 7, 0),
      durationMinutes: 32,
      calories: 295,
      intensity: 'High',
      status: 'Completed',
      notes: 'Stayed under 4:45 pace for every fast interval.'
    },
    {
      id: 2,
      name: 'Upper Body Strength Block',
      category: 'Strength',
      scheduledAt: isoAt(-2, 18, 0),
      durationMinutes: 45,
      calories: 340,
      intensity: 'Moderate',
      status: 'Completed',
      notes: 'Added 2.5kg on incline dumbbell press.'
    },
    {
      id: 3,
      name: 'Mobility Reset',
      category: 'Mobility',
      scheduledAt: isoAt(-3, 20, 0),
      durationMinutes: 20,
      calories: 90,
      intensity: 'Low',
      status: 'Completed',
      notes: 'Focused on thoracic mobility and hip opening.'
    },
    {
      id: 4,
      name: 'Friday HIIT Circuit',
      category: 'HIIT',
      scheduledAt: isoAt(1, 17, 30),
      durationMinutes: 28,
      calories: 0,
      intensity: 'High',
      status: 'Planned',
      notes: '8 rounds: bike sprint + kettlebell swings.'
    },
    {
      id: 5,
      name: 'Sunday Long Walk',
      category: 'Recovery',
      scheduledAt: isoAt(3, 9, 0),
      durationMinutes: 50,
      calories: 0,
      intensity: 'Low',
      status: 'Planned',
      notes: 'Keep heart rate low and nasal breathing steady.'
    },
    {
      id: 6,
      name: 'Leg Strength Session',
      category: 'Strength',
      scheduledAt: isoAt(-6, 18, 30),
      durationMinutes: 50,
      calories: 330,
      intensity: 'High',
      status: 'Missed',
      notes: 'Reschedule due to travel day.'
    }
  ];
}

@Component({
  selector: 'app-workout-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-tracker.component.html',
  styleUrl: './workout-tracker.component.scss'
})
export class WorkoutTrackerComponent implements OnInit, OnDestroy {
  readonly skeletonCards = Array.from({ length: 4 });
  readonly rangeOptions: Array<{ value: 7 | 14 | 30; label: string }> = [
    { value: 7, label: 'Last 7 days' },
    { value: 14, label: 'Last 14 days' },
    { value: 30, label: 'Last 30 days' }
  ];
  readonly statusOptions: Array<'All' | WorkoutStatus> = ['All', 'Completed', 'Planned', 'Missed'];

  searchTerm = '';
  selectedRangeDays: 7 | 14 | 30 = 14;
  selectedStatus: 'All' | WorkoutStatus = 'All';
  selectedCategory: 'All' | WorkoutCategory = 'All';

  state: WorkoutLoadState = 'loading';
  emptyReason: WorkoutEmptyReason = 'no-data';
  errorMessage = '';
  source = 'Local tracker history';
  lastUpdated: Date | null = null;

  visibleWorkoutCards: WorkoutCardViewModel[] = [];

  private allWorkouts: WorkoutEntry[] = [];
  private filteredWorkouts: WorkoutEntry[] = [];
  private loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private nextLocalId = 500;
  private readonly backendEndpoint = environment.optionalApiEndpoints.workouts;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLocalLog();
  }

  ngOnDestroy(): void {
    this.clearScheduledLoad();
  }

  get categoryOptions(): Array<'All' | WorkoutCategory> {
    return ['All', ...new Set(this.allWorkouts.map((workout) => workout.category))];
  }

  get completedSessions(): number {
    return this.filteredWorkouts.filter((workout) => workout.status === 'Completed').length;
  }

  get plannedSessions(): number {
    return this.filteredWorkouts.filter((workout) => workout.status === 'Planned').length;
  }

  get burnedCalories(): number {
    return this.filteredWorkouts
      .filter((workout) => workout.status === 'Completed')
      .reduce((total, workout) => total + workout.calories, 0);
  }

  get completionRate(): number {
    const trackable = this.filteredWorkouts.filter((workout) => workout.status !== 'Missed').length;
    return trackable ? Math.round((this.completedSessions / trackable) * 100) : 0;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedStatus !== 'All' ||
      this.selectedCategory !== 'All' ||
      this.selectedRangeDays !== 14
    );
  }

  get canSyncBackend(): boolean {
    return !!this.backendEndpoint;
  }

  loadLocalLog(): void {
    this.startLoading();
    this.scheduleLoad(() => {
      this.applyDataset(buildLocalWorkoutLog(), 'Local tracker history');
    });
  }

  syncWithBackend(): void {
    if (!this.backendEndpoint) {
      this.state = 'error';
      this.errorMessage = 'Backend sync is not configured for Workout Tracker yet. Continue with local history.';
      return;
    }

    this.clearScheduledLoad();
    this.state = 'loading';
    this.errorMessage = '';

    this.http.get<unknown>(this.backendEndpoint).subscribe({
      next: (payload) => {
        const entries = this.extractWorkouts(payload);
        this.applyDataset(entries, 'Backend sync');
      },
      error: () => {
        this.state = 'error';
        this.errorMessage =
          'Workout tracker endpoint is unavailable. Continue with local progression data.';
      }
    });
  }

  useLocalFallback(): void {
    this.loadLocalLog();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.selectedRangeDays);

    this.filteredWorkouts = this.allWorkouts
      .filter((workout) => {
        const workoutDate = new Date(workout.scheduledAt);
        const matchesRange = workoutDate >= cutoffDate;
        const matchesStatus = this.selectedStatus === 'All' || workout.status === this.selectedStatus;
        const matchesCategory = this.selectedCategory === 'All' || workout.category === this.selectedCategory;
        const matchesSearch =
          !term ||
          workout.name.toLowerCase().includes(term) ||
          workout.category.toLowerCase().includes(term) ||
          workout.notes.toLowerCase().includes(term);

        return matchesRange && matchesStatus && matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

    this.refreshWorkoutCards();

    if (this.filteredWorkouts.length) {
      this.state = 'ready';
      return;
    }

    this.state = 'empty';
    this.emptyReason = this.allWorkouts.length ? 'filters' : 'no-data';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRangeDays = 14;
    this.selectedStatus = 'All';
    this.selectedCategory = 'All';
    this.applyFilters();
  }

  addRecoverySession(): void {
    const plannedAt = new Date();
    plannedAt.setDate(plannedAt.getDate() + 1);
    plannedAt.setHours(20, 0, 0, 0);

    const newSession: WorkoutEntry = {
      id: this.nextLocalId++,
      name: 'Guided Recovery Session',
      category: 'Recovery',
      scheduledAt: plannedAt.toISOString(),
      durationMinutes: 25,
      calories: 0,
      intensity: 'Low',
      status: 'Planned',
      notes: 'Breathing drills and mobility to support tomorrow strength block.'
    };

    this.allWorkouts = [newSession, ...this.allWorkouts];
    this.applyFilters();
  }

  markCompleted(workoutId: number): void {
    this.allWorkouts = this.allWorkouts.map((workout) => {
      if (workout.id !== workoutId) {
        return workout;
      }

      const completedNote = 'Marked complete in tracker.';
      const notes = workout.notes.includes(completedNote)
        ? workout.notes
        : `${workout.notes} ${completedNote}`;

      return {
        ...workout,
        status: 'Completed',
        calories: workout.calories || 180,
        scheduledAt: new Date().toISOString(),
        notes
      };
    });

    this.applyFilters();
  }

  private refreshWorkoutCards(): void {
    this.visibleWorkoutCards = this.filteredWorkouts.map((workout) => this.toCardViewModel(workout));
  }

  private toCardViewModel(workout: WorkoutEntry): WorkoutCardViewModel {
    return {
      id: workout.id,
      name: workout.name,
      category: workout.category,
      scheduledAt: workout.scheduledAt,
      durationMinutes: workout.durationMinutes,
      calories: workout.calories,
      intensity: workout.intensity,
      status: workout.status,
      statusClass: this.toStatusClass(workout.status),
      notes: workout.notes,
      canMarkComplete: workout.status === 'Planned'
    };
  }

  private toStatusClass(status: WorkoutStatus): string {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Planned':
        return 'status-planned';
      case 'Missed':
        return 'status-missed';
      default:
        return 'status-planned';
    }
  }

  private startLoading(): void {
    this.clearScheduledLoad();
    this.state = 'loading';
    this.errorMessage = '';
  }

  private scheduleLoad(action: () => void): void {
    this.loadTimeoutId = setTimeout(() => {
      try {
        action();
      } catch {
        this.state = 'error';
        this.errorMessage = 'Workout tracker could not be loaded. Please retry.';
      }
    }, 350);
  }

  private clearScheduledLoad(): void {
    if (this.loadTimeoutId !== null) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  private applyDataset(workouts: ReadonlyArray<WorkoutEntry>, source: string): void {
    this.allWorkouts = workouts.map((workout) => ({ ...workout }));
    this.source = source;
    this.lastUpdated = new Date();

    if (!this.allWorkouts.length) {
      this.filteredWorkouts = [];
      this.visibleWorkoutCards = [];
      this.emptyReason = 'no-data';
      this.state = 'empty';
      return;
    }

    this.applyFilters();
  }

  private extractWorkouts(payload: unknown): WorkoutEntry[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload.flatMap((item, index) => {
      if (!item || typeof item !== 'object') {
        return [];
      }

      const candidate = item as Record<string, unknown>;
      const name = this.readString(candidate['name']);
      const category = this.readCategory(candidate['category']);
      const status = this.readStatus(candidate['status']);
      const intensity = this.readIntensity(candidate['intensity']);
      const scheduledAt = this.readString(candidate['scheduledAt']);

      if (!name || !category || !status || !intensity || !scheduledAt) {
        return [];
      }

      return [
        {
          id: this.readNumber(candidate['id']) ?? index + 1,
          name,
          category,
          scheduledAt,
          durationMinutes: this.readNumber(candidate['durationMinutes']) ?? 30,
          calories: this.readNumber(candidate['calories']) ?? 0,
          intensity,
          status,
          notes: this.readString(candidate['notes']) ?? 'Imported from backend.'
        }
      ];
    });
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length ? value.trim() : null;
  }

  private readNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private readStatus(value: unknown): WorkoutStatus | null {
    if (value === 'Completed' || value === 'Planned' || value === 'Missed') {
      return value;
    }
    return null;
  }

  private readCategory(value: unknown): WorkoutCategory | null {
    if (value === 'Cardio' || value === 'Strength' || value === 'Mobility' || value === 'Recovery' || value === 'HIIT') {
      return value;
    }
    return null;
  }

  private readIntensity(value: unknown): WorkoutIntensity | null {
    if (value === 'Low' || value === 'Moderate' || value === 'High') {
      return value;
    }
    return null;
  }
}
