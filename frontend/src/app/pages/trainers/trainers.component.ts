import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { EmployeeSummary } from '../../core/models/api-models';

type TrainerPageState = 'loading' | 'ready' | 'empty' | 'error';
type TrainerEmptyReason = 'filters' | 'no-data';

interface TrainerProfile {
  id: number;
  name: string;
  specialty: string;
  focusAreas: string[];
  yearsExperience: number;
  hiredOn: string;
}

interface TrainerCardViewModel {
  id: number;
  name: string;
  initials: string;
  specialty: string;
  focusAreas: string[];
  yearsExperience: number;
  hiredOnLabel: string;
  assignmentLabel: string;
  bookingLabel: string;
  bookingTone: 'solid' | 'ghost';
}

@Component({
  selector: 'app-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainers.component.html',
  styleUrl: './trainers.component.scss'
})
export class TrainersComponent implements OnInit {
  readonly skeletonCards = Array.from({ length: 4 });

  searchTerm = '';
  selectedSpecialty = 'All';

  state: TrainerPageState = 'loading';
  emptyReason: TrainerEmptyReason = 'no-data';
  errorMessage = '';
  source = 'Riada API';
  lastUpdated: Date | null = null;

  visibleTrainerCards: TrainerCardViewModel[] = [];

  private allTrainers: TrainerProfile[] = [];
  private filteredTrainers: TrainerProfile[] = [];
  private bookedTrainerIds = new Set<number>();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadFromApi();
  }

  get specialtyOptions(): string[] {
    return ['All', ...new Set(this.allTrainers.map((t) => t.specialty))];
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0 || this.selectedSpecialty !== 'All';
  }

  get canSyncBackend(): boolean {
    return true;
  }

  get bookedCount(): number {
    return this.bookedTrainerIds.size;
  }

  loadLocalRoster(): void {
    this.loadFromApi();
  }

  syncWithBackend(): void {
    this.loadFromApi();
  }

  useLocalFallback(): void {
    this.loadFromApi();
  }

  loadFromApi(): void {
    this.state = 'loading';
    this.errorMessage = '';

    this.api.getEmployees({ pageSize: 100 }).subscribe({
      next: (response) => {
        const trainers = response.items
          .map((e) => this.employeeToTrainer(e));

        this.allTrainers = trainers;
        this.source = 'Riada API';
        this.lastUpdated = new Date();

        if (!this.allTrainers.length) {
          this.filteredTrainers = [];
          this.visibleTrainerCards = [];
          this.emptyReason = 'no-data';
          this.state = 'empty';
          return;
        }

        this.applyFilters();
      },
      error: () => {
        this.state = 'error';
        this.errorMessage = 'Unable to load staff roster from Riada API. Verify the backend is running.';
      }
    });
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
      return matchesSearch && matchesSpecialty;
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
    this.applyFilters();
  }

  bookTrainer(trainerId: number): void {
    if (this.bookedTrainerIds.has(trainerId)) {
      this.bookedTrainerIds.delete(trainerId);
    } else {
      this.bookedTrainerIds.add(trainerId);
    }
    this.refreshTrainerCards();
  }

  private refreshTrainerCards(): void {
    this.visibleTrainerCards = this.filteredTrainers.map((trainer) => this.toCardViewModel(trainer));
  }

  private employeeToTrainer(e: EmployeeSummary): TrainerProfile {
    const hiredYear = e.hiredOn ? new Date(e.hiredOn).getFullYear() : new Date().getFullYear();
    const yearsExperience = Math.max(0, new Date().getFullYear() - hiredYear);

    return {
      id: e.id,
      name: `${e.firstName} ${e.lastName}`,
      specialty: e.role,
      focusAreas: [e.clubName],
      yearsExperience,
      hiredOn: e.hiredOn
    };
  }

  private toCardViewModel(trainer: TrainerProfile): TrainerCardViewModel {
    const booked = this.bookedTrainerIds.has(trainer.id);
    return {
      id: trainer.id,
      name: trainer.name,
      initials: trainer.name.split(' ').filter(p => p.length).map(p => p[0].toUpperCase()).slice(0, 2).join(''),
      specialty: trainer.specialty,
      focusAreas: [...trainer.focusAreas],
      yearsExperience: trainer.yearsExperience,
      hiredOnLabel: this.toHiredOnLabel(trainer.hiredOn),
      assignmentLabel: 'Assignments managed in schedule module',
      bookingLabel: booked ? 'Intro booked' : 'Book intro',
      bookingTone: booked ? 'solid' : 'ghost'
    };
  }

  private toHiredOnLabel(hiredOn: string): string {
    const parsed = new Date(hiredOn);
    if (Number.isNaN(parsed.getTime())) {
      return 'Hire date unavailable';
    }

    return `Joined ${parsed.toLocaleDateString()}`;
  }
}
