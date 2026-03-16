import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

type TrainerAvailability = 'Available Today' | 'Limited Slots' | 'Fully Booked';
type TrainerPageState = 'loading' | 'ready' | 'empty' | 'error';
type TrainerEmptyReason = 'filters' | 'no-data';

interface TrainerProfile {
  id: number;
  name: string;
  specialty: string;
  focusAreas: string[];
  rating: number;
  yearsExperience: number;
  activeClients: number;
  availability: TrainerAvailability;
  nextSlot: string;
}

interface TrainerCardViewModel {
  id: number;
  name: string;
  initials: string;
  specialty: string;
  focusAreas: string[];
  rating: number;
  yearsExperience: number;
  activeClients: number;
  availability: TrainerAvailability;
  availabilityClass: string;
  nextSlotLabel: string;
  bookingLabel: string;
  bookingTone: 'solid' | 'ghost';
}

const LOCAL_TRAINER_ROSTER: ReadonlyArray<TrainerProfile> = [
  {
    id: 1,
    name: 'Alex Carey',
    specialty: 'Strength & Conditioning',
    focusAreas: ['Hypertrophy', 'Performance Testing'],
    rating: 4.8,
    yearsExperience: 9,
    activeClients: 26,
    availability: 'Available Today',
    nextSlot: '17:30'
  },
  {
    id: 2,
    name: 'Darlene Robertson',
    specialty: 'Pilates & Mobility',
    focusAreas: ['Posture', 'Injury Prevention'],
    rating: 4.6,
    yearsExperience: 7,
    activeClients: 19,
    availability: 'Limited Slots',
    nextSlot: 'Tomorrow 09:00'
  },
  {
    id: 3,
    name: 'Cameron Williamson',
    specialty: 'HIIT & Cardio',
    focusAreas: ['Conditioning', 'VO2 Progression'],
    rating: 4.7,
    yearsExperience: 8,
    activeClients: 21,
    availability: 'Available Today',
    nextSlot: '18:10'
  },
  {
    id: 4,
    name: 'Wade Warren',
    specialty: 'Weight loss & Nutrition',
    focusAreas: ['Habit Coaching', 'Calorie Strategy'],
    rating: 4.9,
    yearsExperience: 11,
    activeClients: 32,
    availability: 'Fully Booked',
    nextSlot: 'Friday 11:30'
  },
  {
    id: 5,
    name: 'Jenny Wilson',
    specialty: 'Functional Rehab',
    focusAreas: ['Knee Rehab', 'Mobility Return'],
    rating: 4.7,
    yearsExperience: 6,
    activeClients: 14,
    availability: 'Limited Slots',
    nextSlot: 'Tomorrow 15:15'
  }
];

@Component({
  selector: 'app-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainers.component.html',
  styleUrl: './trainers.component.scss'
})
export class TrainersComponent implements OnInit, OnDestroy {
  readonly skeletonCards = Array.from({ length: 4 });

  searchTerm = '';
  selectedSpecialty = 'All';
  onlyAvailable = false;

  state: TrainerPageState = 'loading';
  emptyReason: TrainerEmptyReason = 'no-data';
  errorMessage = '';
  source = 'Local staff roster';
  lastUpdated: Date | null = null;

  visibleTrainerCards: TrainerCardViewModel[] = [];

  private allTrainers: TrainerProfile[] = [];
  private filteredTrainers: TrainerProfile[] = [];
  private bookedTrainerIds = new Set<number>();
  private loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly backendEndpoint = environment.optionalApiEndpoints.trainers;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLocalRoster();
  }

  ngOnDestroy(): void {
    this.clearScheduledLoad();
  }

  get specialtyOptions(): string[] {
    return ['All', ...new Set(this.allTrainers.map((trainer) => trainer.specialty))];
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedSpecialty !== 'All' ||
      this.onlyAvailable
    );
  }

  get canSyncBackend(): boolean {
    return !!this.backendEndpoint;
  }

  get bookedCount(): number {
    return this.bookedTrainerIds.size;
  }

  loadLocalRoster(): void {
    this.startLoading();
    this.scheduleLoad(() => {
      this.applyDataset(LOCAL_TRAINER_ROSTER, 'Local staff roster');
    });
  }

  syncWithBackend(): void {
    if (!this.backendEndpoint) {
      this.state = 'error';
      this.errorMessage = 'Backend sync is not configured for Trainers yet. Continue with the local roster.';
      return;
    }

    this.clearScheduledLoad();
    this.state = 'loading';
    this.errorMessage = '';

    this.http.get<unknown>(this.backendEndpoint).subscribe({
      next: (payload) => {
        const trainers = this.extractTrainers(payload);
        this.applyDataset(trainers, 'Backend sync');
      },
      error: () => {
        this.state = 'error';
        this.errorMessage =
          'Trainer endpoint is currently unavailable. Keep operations running with local roster data.';
      }
    });
  }

  useLocalFallback(): void {
    this.loadLocalRoster();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredTrainers = this.allTrainers.filter((trainer) => {
      const matchesSearch =
        !term ||
        trainer.name.toLowerCase().includes(term) ||
        trainer.specialty.toLowerCase().includes(term) ||
        trainer.focusAreas.some((focus) => focus.toLowerCase().includes(term));
      const matchesSpecialty =
        this.selectedSpecialty === 'All' || trainer.specialty === this.selectedSpecialty;
      const matchesAvailability = !this.onlyAvailable || trainer.availability !== 'Fully Booked';
      return matchesSearch && matchesSpecialty && matchesAvailability;
    });

    this.refreshTrainerCards();

    if (this.filteredTrainers.length) {
      this.state = 'ready';
      return;
    }

    this.state = 'empty';
    this.emptyReason = this.allTrainers.length ? 'filters' : 'no-data';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSpecialty = 'All';
    this.onlyAvailable = false;
    this.applyFilters();
  }

  bookTrainer(trainerId: number): void {
    if (this.bookedTrainerIds.has(trainerId)) {
      this.bookedTrainerIds.delete(trainerId);
      this.refreshTrainerCards();
      return;
    }

    this.bookedTrainerIds.add(trainerId);
    this.refreshTrainerCards();
  }

  private refreshTrainerCards(): void {
    this.visibleTrainerCards = this.filteredTrainers.map((trainer) => this.toCardViewModel(trainer));
  }

  private toCardViewModel(trainer: TrainerProfile): TrainerCardViewModel {
    const booked = this.bookedTrainerIds.has(trainer.id);

    return {
      id: trainer.id,
      name: trainer.name,
      initials: this.toInitials(trainer.name),
      specialty: trainer.specialty,
      focusAreas: [...trainer.focusAreas],
      rating: trainer.rating,
      yearsExperience: trainer.yearsExperience,
      activeClients: trainer.activeClients,
      availability: trainer.availability,
      availabilityClass: this.toAvailabilityClass(trainer.availability),
      nextSlotLabel: `Next slot: ${trainer.nextSlot}`,
      bookingLabel: booked ? 'Intro booked' : 'Book intro',
      bookingTone: booked ? 'solid' : 'ghost'
    };
  }

  private toInitials(name: string): string {
    return name
      .split(' ')
      .filter((part) => part.length)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  private toAvailabilityClass(availability: TrainerAvailability): string {
    switch (availability) {
      case 'Available Today':
        return 'availability-open';
      case 'Limited Slots':
        return 'availability-limited';
      case 'Fully Booked':
        return 'availability-booked';
      default:
        return 'availability-limited';
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
        this.errorMessage = 'Trainer roster could not be loaded. Please retry.';
      }
    }, 350);
  }

  private clearScheduledLoad(): void {
    if (this.loadTimeoutId !== null) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  private applyDataset(trainers: ReadonlyArray<TrainerProfile>, source: string): void {
    this.allTrainers = trainers.map((trainer) => ({ ...trainer, focusAreas: [...trainer.focusAreas] }));
    this.pruneBookings();
    this.source = source;
    this.lastUpdated = new Date();

    if (!this.allTrainers.length) {
      this.filteredTrainers = [];
      this.visibleTrainerCards = [];
      this.emptyReason = 'no-data';
      this.state = 'empty';
      return;
    }

    this.applyFilters();
  }

  private pruneBookings(): void {
    const validIds = new Set(this.allTrainers.map((trainer) => trainer.id));
    this.bookedTrainerIds = new Set(
      Array.from(this.bookedTrainerIds).filter((trainerId) => validIds.has(trainerId))
    );
  }

  private extractTrainers(payload: unknown): TrainerProfile[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload.flatMap((item, index) => {
      if (!item || typeof item !== 'object') {
        return [];
      }

      const candidate = item as Record<string, unknown>;
      const name = this.readString(candidate['name']);
      const specialty = this.readString(candidate['specialty']);

      if (!name || !specialty) {
        return [];
      }

      const focusAreas = this.readStringArray(candidate['focusAreas']);
      const availability = this.readAvailability(candidate['availability']);

      return [
        {
          id: this.readNumber(candidate['id']) ?? index + 1,
          name,
          specialty,
          focusAreas: focusAreas.length ? focusAreas : ['General Coaching'],
          rating: this.readNumber(candidate['rating']) ?? 4.5,
          yearsExperience: this.readNumber(candidate['yearsExperience']) ?? 5,
          activeClients: this.readNumber(candidate['activeClients']) ?? 12,
          availability: availability ?? 'Limited Slots',
          nextSlot: this.readString(candidate['nextSlot']) ?? 'Contact desk'
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

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  private readAvailability(value: unknown): TrainerAvailability | null {
    if (value === 'Available Today' || value === 'Limited Slots' || value === 'Fully Booked') {
      return value;
    }
    return null;
  }
}
