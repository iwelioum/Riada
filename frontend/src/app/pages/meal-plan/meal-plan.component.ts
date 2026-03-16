import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

type NutritionGoal = 'Fat Loss' | 'Maintenance' | 'Muscle Gain';
type MealPlanState = 'loading' | 'ready' | 'empty' | 'error';
type MealPrepStatus = 'Prepared' | 'Pending';
type MealPlanEmptyReason = 'filters' | 'no-data';

interface PlannedMeal {
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
}

interface MealPlanDay {
  id: string;
  dayLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  hydrationLiters: number;
  prepStatus: MealPrepStatus;
  meals: PlannedMeal[];
}

interface MealPlanDayCardViewModel {
  id: string;
  dayLabel: string;
  prepStatus: MealPrepStatus;
  prepClass: string;
  prepActionLabel: string;
  prepActionTone: 'solid' | 'ghost';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  hydrationLiters: number;
  meals: PlannedMeal[];
}

const LOCAL_MEAL_PLAN_TEMPLATES: Record<NutritionGoal, ReadonlyArray<MealPlanDay>> = {
  'Fat Loss': [
    {
      id: 'monday',
      dayLabel: 'Monday',
      calories: 1780,
      protein: 148,
      carbs: 165,
      fats: 58,
      hydrationLiters: 2.5,
      prepStatus: 'Prepared',
      meals: [
        { slot: 'Breakfast', name: 'Greek yogurt + berries + chia' },
        { slot: 'Lunch', name: 'Chicken quinoa bowl with greens' },
        { slot: 'Dinner', name: 'Baked salmon, broccoli, roasted sweet potato' },
        { slot: 'Snack', name: 'Cottage cheese + almonds' }
      ]
    },
    {
      id: 'tuesday',
      dayLabel: 'Tuesday',
      calories: 1730,
      protein: 142,
      carbs: 158,
      fats: 56,
      hydrationLiters: 2.4,
      prepStatus: 'Pending',
      meals: [
        { slot: 'Breakfast', name: 'Protein oats + banana' },
        { slot: 'Lunch', name: 'Turkey wrap + mixed salad' },
        { slot: 'Dinner', name: 'Lean beef stir-fry + cauliflower rice' },
        { slot: 'Snack', name: 'Boiled eggs + carrot sticks' }
      ]
    },
    {
      id: 'wednesday',
      dayLabel: 'Wednesday',
      calories: 1810,
      protein: 150,
      carbs: 170,
      fats: 57,
      hydrationLiters: 2.6,
      prepStatus: 'Pending',
      meals: [
        { slot: 'Breakfast', name: 'Egg white scramble + avocado toast' },
        { slot: 'Lunch', name: 'Tuna lentil salad' },
        { slot: 'Dinner', name: 'Turkey meatballs + zucchini noodles' },
        { slot: 'Snack', name: 'Skyr + walnuts' }
      ]
    },
    {
      id: 'thursday',
      dayLabel: 'Thursday',
      calories: 1760,
      protein: 146,
      carbs: 162,
      fats: 55,
      hydrationLiters: 2.4,
      prepStatus: 'Prepared',
      meals: [
        { slot: 'Breakfast', name: 'Smoothie bowl + flax seeds' },
        { slot: 'Lunch', name: 'Grilled cod + couscous salad' },
        { slot: 'Dinner', name: 'Chicken fajita plate' },
        { slot: 'Snack', name: 'Protein pudding' }
      ]
    }
  ],
  Maintenance: [
    {
      id: 'monday',
      dayLabel: 'Monday',
      calories: 2180,
      protein: 156,
      carbs: 240,
      fats: 70,
      hydrationLiters: 2.8,
      prepStatus: 'Prepared',
      meals: [
        { slot: 'Breakfast', name: 'Overnight oats + peanut butter' },
        { slot: 'Lunch', name: 'Chicken rice bowl + roasted vegetables' },
        { slot: 'Dinner', name: 'Seared trout + herbed potatoes' },
        { slot: 'Snack', name: 'Yogurt parfait + granola' }
      ]
    },
    {
      id: 'tuesday',
      dayLabel: 'Tuesday',
      calories: 2260,
      protein: 160,
      carbs: 250,
      fats: 72,
      hydrationLiters: 2.7,
      prepStatus: 'Pending',
      meals: [
        { slot: 'Breakfast', name: 'Whole grain toast + scrambled eggs' },
        { slot: 'Lunch', name: 'Pasta pesto chicken salad' },
        { slot: 'Dinner', name: 'Beef chili + mixed beans' },
        { slot: 'Snack', name: 'Fruit + mixed nuts' }
      ]
    },
    {
      id: 'wednesday',
      dayLabel: 'Wednesday',
      calories: 2210,
      protein: 158,
      carbs: 242,
      fats: 71,
      hydrationLiters: 2.8,
      prepStatus: 'Pending',
      meals: [
        { slot: 'Breakfast', name: 'Protein pancakes + fruit' },
        { slot: 'Lunch', name: 'Turkey sandwich + side salad' },
        { slot: 'Dinner', name: 'Tofu curry + jasmine rice' },
        { slot: 'Snack', name: 'Hummus + pita + cucumber' }
      ]
    },
    {
      id: 'thursday',
      dayLabel: 'Thursday',
      calories: 2240,
      protein: 162,
      carbs: 247,
      fats: 70,
      hydrationLiters: 2.9,
      prepStatus: 'Prepared',
      meals: [
        { slot: 'Breakfast', name: 'Bagel + smoked salmon + cream cheese' },
        { slot: 'Lunch', name: 'Burrito bowl + black beans' },
        { slot: 'Dinner', name: 'Prawn noodles + stir-fried greens' },
        { slot: 'Snack', name: 'Cottage cheese + pineapple' }
      ]
    }
  ],
  'Muscle Gain': [
    {
      id: 'monday',
      dayLabel: 'Monday',
      calories: 2640,
      protein: 182,
      carbs: 315,
      fats: 80,
      hydrationLiters: 3,
      prepStatus: 'Pending',
      meals: [
        { slot: 'Breakfast', name: 'Mass gainer smoothie + oats' },
        { slot: 'Lunch', name: 'Chicken burrito bowl + avocado' },
        { slot: 'Dinner', name: 'Steak, rice and roasted peppers' },
        { slot: 'Snack', name: 'Trail mix + protein shake' }
      ]
    },
    {
      id: 'tuesday',
      dayLabel: 'Tuesday',
      calories: 2710,
      protein: 186,
      carbs: 325,
      fats: 82,
      hydrationLiters: 3.1,
      prepStatus: 'Prepared',
      meals: [
        { slot: 'Breakfast', name: 'Egg wrap + potato hash' },
        { slot: 'Lunch', name: 'Salmon poke bowl + edamame' },
        { slot: 'Dinner', name: 'Turkey pasta bake' },
        { slot: 'Snack', name: 'Greek yogurt + cereal' }
      ]
    },
    {
      id: 'wednesday',
      dayLabel: 'Wednesday',
      calories: 2680,
      protein: 184,
      carbs: 320,
      fats: 81,
      hydrationLiters: 3,
      prepStatus: 'Pending',
      meals: [
        { slot: 'Breakfast', name: 'French toast + nut butter' },
        { slot: 'Lunch', name: 'Beef burger + baked potato wedges' },
        { slot: 'Dinner', name: 'Chicken tikka + basmati rice' },
        { slot: 'Snack', name: 'Shake + banana + oats' }
      ]
    },
    {
      id: 'thursday',
      dayLabel: 'Thursday',
      calories: 2660,
      protein: 183,
      carbs: 318,
      fats: 80,
      hydrationLiters: 3,
      prepStatus: 'Prepared',
      meals: [
        { slot: 'Breakfast', name: 'Bagel sandwich + fruit smoothie' },
        { slot: 'Lunch', name: 'Chicken pesto pasta' },
        { slot: 'Dinner', name: 'Cod, couscous and roasted vegetables' },
        { slot: 'Snack', name: 'Rice cakes + peanut butter + whey' }
      ]
    }
  ]
};

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './meal-plan.component.html',
  styleUrl: './meal-plan.component.scss'
})
export class MealPlanComponent implements OnInit, OnDestroy {
  readonly goals: NutritionGoal[] = ['Fat Loss', 'Maintenance', 'Muscle Gain'];
  readonly skeletonCards = Array.from({ length: 4 });

  selectedGoal: NutritionGoal = 'Maintenance';
  searchTerm = '';
  preparedOnly = false;

  state: MealPlanState = 'loading';
  emptyReason: MealPlanEmptyReason = 'no-data';
  errorMessage = '';
  source = 'Local nutrition planner';
  lastUpdated: Date | null = null;

  visibleDays: MealPlanDay[] = [];
  visibleDayCards: MealPlanDayCardViewModel[] = [];

  private allDays: MealPlanDay[] = [];
  private loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly backendEndpoint = environment.optionalApiEndpoints.mealPlan;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLocalPlan();
  }

  ngOnDestroy(): void {
    this.clearScheduledLoad();
  }

  get preparedCount(): number {
    return this.visibleDays.filter((day) => day.prepStatus === 'Prepared').length;
  }

  get weeklyCalories(): number {
    return this.visibleDays.reduce((total, day) => total + day.calories, 0);
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0 || this.preparedOnly;
  }

  get firstVisibleDayId(): string {
    return this.visibleDayCards[0]?.id ?? this.allDays[0]?.id ?? 'monday';
  }

  get canSyncBackend(): boolean {
    return !!this.backendEndpoint;
  }

  onGoalChange(): void {
    this.loadLocalPlan();
  }

  loadLocalPlan(): void {
    this.startLoading();
    this.scheduleLoad(() => {
      const template = LOCAL_MEAL_PLAN_TEMPLATES[this.selectedGoal];
      this.applyDataset(template, 'Local nutrition planner');
    });
  }

  syncWithBackend(): void {
    if (!this.backendEndpoint) {
      this.state = 'error';
      this.errorMessage = 'Backend sync is not configured for Meal Plan yet. Continue with local templates.';
      return;
    }

    this.clearScheduledLoad();
    this.state = 'loading';
    this.errorMessage = '';

    const endpoint = `${this.backendEndpoint}?goal=${encodeURIComponent(this.selectedGoal)}`;
    this.http.get<unknown>(endpoint).subscribe({
      next: (payload) => {
        const days = this.extractDays(payload);
        this.applyDataset(days, 'Backend sync');
      },
      error: () => {
        this.state = 'error';
        this.errorMessage =
          'Nutrition planning endpoint is unavailable. Continue with local meal templates.';
      }
    });
  }

  useLocalFallback(): void {
    this.loadLocalPlan();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.visibleDays = this.allDays.filter((day) => {
      const matchesPrepared = !this.preparedOnly || day.prepStatus === 'Prepared';
      const matchesSearch =
        !term ||
        day.dayLabel.toLowerCase().includes(term) ||
        day.meals.some((meal) => meal.name.toLowerCase().includes(term) || meal.slot.toLowerCase().includes(term));

      return matchesPrepared && matchesSearch;
    });

    this.refreshDayCards();

    if (this.visibleDays.length) {
      this.state = 'ready';
      return;
    }

    this.state = 'empty';
    this.emptyReason = this.allDays.length ? 'filters' : 'no-data';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.preparedOnly = false;
    this.applyFilters();
  }

  togglePrepared(dayId: string): void {
    this.allDays = this.allDays.map((day) =>
      day.id === dayId
        ? { ...day, prepStatus: day.prepStatus === 'Prepared' ? 'Pending' : 'Prepared' }
        : day
    );
    this.applyFilters();
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
        this.errorMessage = 'Meal plan could not be loaded. Please retry.';
      }
    }, 350);
  }

  private clearScheduledLoad(): void {
    if (this.loadTimeoutId !== null) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  private applyDataset(days: ReadonlyArray<MealPlanDay>, source: string): void {
    this.allDays = days.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => ({ ...meal }))
    }));
    this.source = source;
    this.lastUpdated = new Date();

    if (!this.allDays.length) {
      this.visibleDays = [];
      this.visibleDayCards = [];
      this.emptyReason = 'no-data';
      this.state = 'empty';
      return;
    }

    this.applyFilters();
  }

  private refreshDayCards(): void {
    this.visibleDayCards = this.visibleDays.map((day) => this.toCardViewModel(day));
  }

  private toCardViewModel(day: MealPlanDay): MealPlanDayCardViewModel {
    const isPrepared = day.prepStatus === 'Prepared';

    return {
      id: day.id,
      dayLabel: day.dayLabel,
      prepStatus: day.prepStatus,
      prepClass: isPrepared ? 'prep-ready' : 'prep-pending',
      prepActionLabel: isPrepared ? 'Mark pending' : 'Mark prepared',
      prepActionTone: isPrepared ? 'solid' : 'ghost',
      calories: day.calories,
      protein: day.protein,
      carbs: day.carbs,
      fats: day.fats,
      hydrationLiters: day.hydrationLiters,
      meals: day.meals.map((meal) => ({ ...meal }))
    };
  }

  private extractDays(payload: unknown): MealPlanDay[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload.flatMap((item, index) => {
      if (!item || typeof item !== 'object') {
        return [];
      }

      const candidate = item as Record<string, unknown>;
      const dayLabel = this.readString(candidate['dayLabel']) ?? this.readString(candidate['day']);
      const meals = this.readMeals(candidate['meals']);

      if (!dayLabel || !meals.length) {
        return [];
      }

      const prepStatus = this.readPrepStatus(candidate['prepStatus']) ?? 'Pending';
      const safeId = this.readString(candidate['id']) ?? dayLabel.toLowerCase();

      return [
        {
          id: safeId,
          dayLabel,
          calories: this.readNumber(candidate['calories']) ?? 2000,
          protein: this.readNumber(candidate['protein']) ?? 140,
          carbs: this.readNumber(candidate['carbs']) ?? 220,
          fats: this.readNumber(candidate['fats']) ?? 65,
          hydrationLiters: this.readNumber(candidate['hydrationLiters']) ?? 2.5,
          prepStatus,
          meals: meals.map((meal) => ({ ...meal })),
        }
      ].map((day, dayOffset) => ({ ...day, id: day.id || `day-${index + dayOffset + 1}` }));
    });
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length ? value.trim() : null;
  }

  private readNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private readPrepStatus(value: unknown): MealPrepStatus | null {
    if (value === 'Prepared' || value === 'Pending') {
      return value;
    }
    return null;
  }

  private readMealSlot(value: unknown): PlannedMeal['slot'] | null {
    if (value === 'Breakfast' || value === 'Lunch' || value === 'Dinner' || value === 'Snack') {
      return value;
    }
    return null;
  }

  private readMeals(value: unknown): PlannedMeal[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((meal) => {
      if (!meal || typeof meal !== 'object') {
        return [];
      }

      const candidate = meal as Record<string, unknown>;
      const name = this.readString(candidate['name']);
      const slot = this.readMealSlot(candidate['slot']);

      if (!name || !slot) {
        return [];
      }

      return [{ name, slot }];
    });
  }
}
