import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type ExerciseLoadState = 'loading' | 'ready' | 'empty' | 'error';
type ExerciseEmptyReason = 'filters' | 'no-data';

interface ExerciseCatalogItem {
  id: number;
  name: string;
  muscleGroup: string;
  difficulty: ExerciseDifficulty;
  durationMinutes: number;
  equipment: string;
  caloriesPerSet: number;
  coachingCue: string;
}

interface ExerciseCardViewModel {
  id: number;
  name: string;
  subtitle: string;
  coachingCue: string;
  difficulty: ExerciseDifficulty;
  difficultyClass: string;
  durationLabel: string;
  caloriesLabel: string;
  actionLabel: string;
  actionTone: 'solid' | 'ghost';
}

const LOCAL_EXERCISE_LIBRARY: ReadonlyArray<ExerciseCatalogItem> = [
  {
    id: 1,
    name: 'Barbell Back Squat',
    muscleGroup: 'Lower Body',
    difficulty: 'Advanced',
    durationMinutes: 20,
    equipment: 'Squat Rack',
    caloriesPerSet: 140,
    coachingCue: 'Drive through your heels and keep your torso braced throughout each rep.'
  },
  {
    id: 2,
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Upper Body',
    difficulty: 'Intermediate',
    durationMinutes: 16,
    equipment: 'Dumbbells',
    caloriesPerSet: 95,
    coachingCue: 'Lower with control and keep your shoulder blades pulled back on the bench.'
  },
  {
    id: 3,
    name: 'Assault Bike Sprint',
    muscleGroup: 'Cardio',
    difficulty: 'Intermediate',
    durationMinutes: 12,
    equipment: 'Air Bike',
    caloriesPerSet: 120,
    coachingCue: 'Push hard for 20 seconds, then recover for 40 seconds to build repeat power.'
  },
  {
    id: 4,
    name: 'Dead Bug Core Drill',
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    durationMinutes: 10,
    equipment: 'Bodyweight',
    caloriesPerSet: 55,
    coachingCue: 'Keep your lower back pressed to the floor while extending opposite limbs.'
  },
  {
    id: 5,
    name: 'Romanian Deadlift',
    muscleGroup: 'Posterior Chain',
    difficulty: 'Intermediate',
    durationMinutes: 18,
    equipment: 'Barbell',
    caloriesPerSet: 125,
    coachingCue: 'Hinge at the hips and keep the bar close to your legs to load hamstrings safely.'
  },
  {
    id: 6,
    name: 'Yoga Mobility Flow',
    muscleGroup: 'Mobility',
    difficulty: 'Beginner',
    durationMinutes: 22,
    equipment: 'Mat',
    caloriesPerSet: 60,
    coachingCue: 'Move through each posture slowly to improve range and post-training recovery.'
  }
];

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss'
})
export class ExercisesComponent implements OnInit, OnDestroy {
  readonly skeletonCards = Array.from({ length: 6 });
  readonly difficultyOptions: Array<'All' | ExerciseDifficulty> = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  searchTerm = '';
  selectedFocus = 'All';
  selectedDifficulty: 'All' | ExerciseDifficulty = 'All';

  state: ExerciseLoadState = 'loading';
  emptyReason: ExerciseEmptyReason = 'no-data';
  errorMessage = '';
  source = 'Local coaching library';
  lastUpdated: Date | null = null;

  visibleExerciseCards: ExerciseCardViewModel[] = [];

  private allExercises: ExerciseCatalogItem[] = [];
  private filteredExercises: ExerciseCatalogItem[] = [];
  private circuitExerciseIds = new Set<number>();
  private loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly backendEndpoint = environment.optionalApiEndpoints.exercises;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLocalLibrary();
  }

  ngOnDestroy(): void {
    this.clearScheduledLoad();
  }

  get focusOptions(): string[] {
    return ['All', ...new Set(this.allExercises.map((exercise) => exercise.muscleGroup))];
  }

  get circuitCount(): number {
    return this.circuitExerciseIds.size;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedFocus !== 'All' ||
      this.selectedDifficulty !== 'All'
    );
  }

  get canSyncBackend(): boolean {
    return !!this.backendEndpoint;
  }

  loadLocalLibrary(): void {
    this.startLoading();
    this.scheduleLoad(() => {
      this.applyDataset(LOCAL_EXERCISE_LIBRARY, 'Local coaching library');
    });
  }

  syncWithBackend(): void {
    if (!this.backendEndpoint) {
      this.state = 'error';
      this.errorMessage = 'Backend sync is not configured for Exercises yet. Continue with the local library.';
      return;
    }

    this.clearScheduledLoad();
    this.state = 'loading';
    this.errorMessage = '';

    this.http.get<unknown>(this.backendEndpoint).subscribe({
      next: (payload) => {
        const backendExercises = this.extractExercises(payload);
        this.applyDataset(backendExercises, 'Backend sync');
      },
      error: () => {
        this.state = 'error';
        this.errorMessage =
          'Backend exercise endpoint is unavailable. Continue using the local exercise library.';
      }
    });
  }

  useLocalFallback(): void {
    this.loadLocalLibrary();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredExercises = this.allExercises.filter((exercise) => {
      const matchesSearch =
        !term ||
        exercise.name.toLowerCase().includes(term) ||
        exercise.muscleGroup.toLowerCase().includes(term) ||
        exercise.equipment.toLowerCase().includes(term);
      const matchesFocus = this.selectedFocus === 'All' || exercise.muscleGroup === this.selectedFocus;
      const matchesDifficulty =
        this.selectedDifficulty === 'All' || exercise.difficulty === this.selectedDifficulty;

      return matchesSearch && matchesFocus && matchesDifficulty;
    });

    this.refreshExerciseCards();

    if (this.filteredExercises.length) {
      this.state = 'ready';
      return;
    }

    this.state = 'empty';
    this.emptyReason = this.allExercises.length ? 'filters' : 'no-data';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedFocus = 'All';
    this.selectedDifficulty = 'All';
    this.applyFilters();
  }

  toggleInCircuit(exerciseId: number): void {
    if (this.circuitExerciseIds.has(exerciseId)) {
      this.circuitExerciseIds.delete(exerciseId);
      this.refreshExerciseCards();
      return;
    }

    this.circuitExerciseIds.add(exerciseId);
    this.refreshExerciseCards();
  }

  private refreshExerciseCards(): void {
    this.visibleExerciseCards = this.filteredExercises.map((exercise) => this.toCardViewModel(exercise));
  }

  private toCardViewModel(exercise: ExerciseCatalogItem): ExerciseCardViewModel {
    const inCircuit = this.circuitExerciseIds.has(exercise.id);

    return {
      id: exercise.id,
      name: exercise.name,
      subtitle: `${exercise.muscleGroup} · ${exercise.equipment}`,
      coachingCue: exercise.coachingCue,
      difficulty: exercise.difficulty,
      difficultyClass: this.toDifficultyClass(exercise.difficulty),
      durationLabel: `${exercise.durationMinutes} min`,
      caloriesLabel: `${exercise.caloriesPerSet} cal/set`,
      actionLabel: inCircuit ? "In today's circuit" : "Add to today's circuit",
      actionTone: inCircuit ? 'solid' : 'ghost'
    };
  }

  private toDifficultyClass(level: ExerciseDifficulty): string {
    switch (level) {
      case 'Beginner':
        return 'difficulty-beginner';
      case 'Intermediate':
        return 'difficulty-intermediate';
      case 'Advanced':
        return 'difficulty-advanced';
      default:
        return 'difficulty-intermediate';
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
        this.errorMessage = 'Exercise library could not be loaded. Please retry.';
      }
    }, 350);
  }

  private clearScheduledLoad(): void {
    if (this.loadTimeoutId !== null) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  private applyDataset(exercises: ReadonlyArray<ExerciseCatalogItem>, source: string): void {
    this.allExercises = exercises.map((exercise) => ({ ...exercise }));
    this.pruneCircuitSelection();
    this.source = source;
    this.lastUpdated = new Date();

    if (!this.allExercises.length) {
      this.filteredExercises = [];
      this.visibleExerciseCards = [];
      this.emptyReason = 'no-data';
      this.state = 'empty';
      return;
    }

    this.applyFilters();
  }

  private pruneCircuitSelection(): void {
    const availableIds = new Set(this.allExercises.map((exercise) => exercise.id));
    this.circuitExerciseIds = new Set(
      Array.from(this.circuitExerciseIds).filter((exerciseId) => availableIds.has(exerciseId))
    );
  }

  private extractExercises(payload: unknown): ExerciseCatalogItem[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload.flatMap((item, index) => {
      if (!item || typeof item !== 'object') {
        return [];
      }

      const candidate = item as Record<string, unknown>;
      const name = this.readString(candidate['name']);
      const muscleGroup = this.readString(candidate['muscleGroup']) ?? this.readString(candidate['muscle']);
      const difficulty = this.readDifficulty(candidate['difficulty']);

      if (!name || !muscleGroup || !difficulty) {
        return [];
      }

      return [
        {
          id: this.readNumber(candidate['id']) ?? index + 1,
          name,
          muscleGroup,
          difficulty,
          durationMinutes:
            this.readNumber(candidate['durationMinutes']) ??
            this.readNumber(candidate['duration']) ??
            15,
          equipment: this.readString(candidate['equipment']) ?? 'Mixed Equipment',
          caloriesPerSet: this.readNumber(candidate['caloriesPerSet']) ?? 100,
          coachingCue:
            this.readString(candidate['coachingCue']) ??
            'Keep a controlled pace and maintain clean movement quality.'
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

  private readDifficulty(value: unknown): ExerciseDifficulty | null {
    if (value === 'Beginner' || value === 'Intermediate' || value === 'Advanced') {
      return value;
    }
    return null;
  }
}
