import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

type MealPrepStatus = 'Prepared' | 'Pending';
type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type MealMacroLabel = 'Calories' | 'Protein' | 'Carbs' | 'Fats';
type MealDetailsState = 'loading' | 'ready' | 'empty' | 'error';
type MealDetailsEmptyReason = 'unknown-day' | 'no-data';

interface MealMacro {
  label: MealMacroLabel;
  value: number;
  target: number;
  unit: 'kcal' | 'g';
}

interface MealBreakdown {
  slot: MealSlot;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTip: string;
}

interface MealDayDetail {
  id: string;
  dayLabel: string;
  goal: string;
  prepStatus: MealPrepStatus;
  hydrationLiters: number;
  coachNote: string;
  meals: MealBreakdown[];
  macros: MealMacro[];
}

interface MealDaySummaryViewModel {
  dayLabel: string;
  goal: string;
  prepStatus: MealPrepStatus;
  prepClass: string;
  hydrationLabel: string;
  coachNote: string;
}

interface MacroCardViewModel {
  label: MealMacroLabel;
  valueLabel: string;
  targetLabel: string;
  progressPercent: number;
  progressClass: string;
}

interface MealRowViewModel {
  slot: MealSlot;
  name: string;
  macroSummary: string;
  prepTip: string;
}

interface MealDayLinkViewModel {
  id: string;
  dayLabel: string;
  isActive: boolean;
}

const LOCAL_MEAL_DAY_DETAILS: ReadonlyArray<MealDayDetail> = [
  {
    id: 'monday',
    dayLabel: 'Monday',
    goal: 'Maintenance',
    prepStatus: 'Prepared',
    hydrationLiters: 2.8,
    coachNote: 'High-protein start to support the evening strength block.',
    meals: [
      {
        slot: 'Breakfast',
        name: 'Overnight oats + peanut butter',
        calories: 520,
        protein: 32,
        carbs: 58,
        fats: 18,
        prepTip: 'Batch jars for two mornings to reduce prep time.'
      },
      {
        slot: 'Lunch',
        name: 'Chicken rice bowl + roasted vegetables',
        calories: 650,
        protein: 48,
        carbs: 72,
        fats: 16,
        prepTip: 'Keep dressing separate until serving for fresher texture.'
      },
      {
        slot: 'Dinner',
        name: 'Seared trout + herbed potatoes',
        calories: 710,
        protein: 52,
        carbs: 74,
        fats: 24,
        prepTip: 'Cook fish à la minute while reheating potatoes.'
      },
      {
        slot: 'Snack',
        name: 'Yogurt parfait + granola',
        calories: 300,
        protein: 24,
        carbs: 32,
        fats: 8,
        prepTip: 'Portion granola in advance to control intake precisely.'
      }
    ],
    macros: [
      { label: 'Calories', value: 2180, target: 2300, unit: 'kcal' },
      { label: 'Protein', value: 156, target: 165, unit: 'g' },
      { label: 'Carbs', value: 240, target: 255, unit: 'g' },
      { label: 'Fats', value: 70, target: 78, unit: 'g' }
    ]
  },
  {
    id: 'tuesday',
    dayLabel: 'Tuesday',
    goal: 'Maintenance',
    prepStatus: 'Pending',
    hydrationLiters: 2.7,
    coachNote: 'Prep lunch early to avoid skipping fuel before afternoon cardio.',
    meals: [
      {
        slot: 'Breakfast',
        name: 'Whole grain toast + scrambled eggs',
        calories: 480,
        protein: 30,
        carbs: 45,
        fats: 19,
        prepTip: 'Pre-chop vegetables for eggs during weekly prep.'
      },
      {
        slot: 'Lunch',
        name: 'Pasta pesto chicken salad',
        calories: 690,
        protein: 44,
        carbs: 78,
        fats: 21,
        prepTip: 'Store in insulated container if consumed post-training.'
      },
      {
        slot: 'Dinner',
        name: 'Beef chili + mixed beans',
        calories: 760,
        protein: 55,
        carbs: 82,
        fats: 22,
        prepTip: 'Cook double batch to cover one additional dinner.'
      },
      {
        slot: 'Snack',
        name: 'Fruit + mixed nuts',
        calories: 330,
        protein: 18,
        carbs: 45,
        fats: 10,
        prepTip: 'Build ready-to-grab snack packs for desk and gym bag.'
      }
    ],
    macros: [
      { label: 'Calories', value: 2260, target: 2350, unit: 'kcal' },
      { label: 'Protein', value: 160, target: 165, unit: 'g' },
      { label: 'Carbs', value: 250, target: 260, unit: 'g' },
      { label: 'Fats', value: 72, target: 80, unit: 'g' }
    ]
  },
  {
    id: 'wednesday',
    dayLabel: 'Wednesday',
    goal: 'Maintenance',
    prepStatus: 'Pending',
    hydrationLiters: 2.8,
    coachNote: 'Keep evening dinner lighter to support sleep and recovery quality.',
    meals: [
      {
        slot: 'Breakfast',
        name: 'Protein pancakes + fruit',
        calories: 510,
        protein: 33,
        carbs: 55,
        fats: 16,
        prepTip: 'Prepare dry mix in jars for fast morning cooking.'
      },
      {
        slot: 'Lunch',
        name: 'Turkey sandwich + side salad',
        calories: 610,
        protein: 42,
        carbs: 66,
        fats: 18,
        prepTip: 'Use pre-grilled turkey slices for consistent portions.'
      },
      {
        slot: 'Dinner',
        name: 'Tofu curry + jasmine rice',
        calories: 740,
        protein: 46,
        carbs: 88,
        fats: 22,
        prepTip: 'Cook rice in bulk and cool quickly for meal safety.'
      },
      {
        slot: 'Snack',
        name: 'Hummus + pita + cucumber',
        calories: 350,
        protein: 20,
        carbs: 33,
        fats: 15,
        prepTip: 'Pair with extra cucumber to boost satiety at low calories.'
      }
    ],
    macros: [
      { label: 'Calories', value: 2210, target: 2350, unit: 'kcal' },
      { label: 'Protein', value: 158, target: 168, unit: 'g' },
      { label: 'Carbs', value: 242, target: 260, unit: 'g' },
      { label: 'Fats', value: 71, target: 79, unit: 'g' }
    ]
  },
  {
    id: 'thursday',
    dayLabel: 'Thursday',
    goal: 'Maintenance',
    prepStatus: 'Prepared',
    hydrationLiters: 2.9,
    coachNote: 'Use this day as a stable template before weekend schedule changes.',
    meals: [
      {
        slot: 'Breakfast',
        name: 'Bagel + smoked salmon + cream cheese',
        calories: 560,
        protein: 34,
        carbs: 60,
        fats: 20,
        prepTip: 'Pre-slice vegetables and portion protein the night before.'
      },
      {
        slot: 'Lunch',
        name: 'Burrito bowl + black beans',
        calories: 670,
        protein: 45,
        carbs: 80,
        fats: 18,
        prepTip: 'Keep salsa and guacamole separate for texture quality.'
      },
      {
        slot: 'Dinner',
        name: 'Prawn noodles + stir-fried greens',
        calories: 720,
        protein: 54,
        carbs: 76,
        fats: 21,
        prepTip: 'Cook prawns quickly to avoid overcooking in reheats.'
      },
      {
        slot: 'Snack',
        name: 'Cottage cheese + pineapple',
        calories: 290,
        protein: 29,
        carbs: 31,
        fats: 11,
        prepTip: 'Use low-fat cottage cheese on lower-activity days.'
      }
    ],
    macros: [
      { label: 'Calories', value: 2240, target: 2350, unit: 'kcal' },
      { label: 'Protein', value: 162, target: 170, unit: 'g' },
      { label: 'Carbs', value: 247, target: 260, unit: 'g' },
      { label: 'Fats', value: 70, target: 78, unit: 'g' }
    ]
  }
];

@Component({
  selector: 'app-meal-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meal-details.component.html',
  styleUrl: './meal-details.component.scss'
})
export class MealDetailsComponent implements OnInit, OnDestroy {
  readonly skeletonCards = Array.from({ length: 4 });

  state: MealDetailsState = 'loading';
  emptyReason: MealDetailsEmptyReason = 'unknown-day';
  errorMessage = '';
  source = 'Local nutrition detail';
  lastUpdated: Date | null = null;

  daySummary: MealDaySummaryViewModel | null = null;
  macroCards: MacroCardViewModel[] = [];
  mealRows: MealRowViewModel[] = [];
  dayLinks: MealDayLinkViewModel[] = [];

  private selectedDayId = '';
  private loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private routeSubscription: Subscription | null = null;
  private readonly backendEndpoint = environment.optionalApiEndpoints.mealPlan;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.selectedDayId = (params.get('id') ?? '').trim().toLowerCase();
      this.dayLinks = this.buildDayLinks(this.selectedDayId);
      this.loadLocalDetails();
    });
  }

  ngOnDestroy(): void {
    this.clearScheduledLoad();
    this.routeSubscription?.unsubscribe();
  }

  get canSyncBackend(): boolean {
    return !!this.backendEndpoint;
  }

  loadLocalDetails(): void {
    this.startLoading();

    this.scheduleLoad(() => {
      const dayDetail = this.findLocalDay(this.selectedDayId);
      if (!dayDetail) {
        this.setEmpty('unknown-day');
        return;
      }

      this.applyDetail(dayDetail, 'Local nutrition detail');
    });
  }

  syncWithBackend(): void {
    if (!this.backendEndpoint) {
      this.state = 'error';
      this.errorMessage = 'Backend sync is not configured for Meal Details yet. Continue with local details.';
      return;
    }

    this.clearScheduledLoad();
    this.state = 'loading';
    this.errorMessage = '';

    if (!this.selectedDayId) {
      this.setEmpty('unknown-day');
      return;
    }

    const endpoint = `${this.backendEndpoint}/${encodeURIComponent(this.selectedDayId)}`;
    this.http.get<unknown>(endpoint).subscribe({
      next: (payload) => {
        const dayDetail = this.extractDay(payload, this.selectedDayId);
        if (!dayDetail) {
          this.setEmpty('no-data');
          return;
        }

        this.applyDetail(dayDetail, 'Backend sync');
      },
      error: () => {
        this.state = 'error';
        this.errorMessage =
          'Meal detail endpoint is unavailable. Continue with local nutrition planning data.';
      }
    });
  }

  useLocalFallback(): void {
    this.loadLocalDetails();
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
        this.errorMessage = 'Meal details could not be loaded. Please retry.';
      }
    }, 320);
  }

  private clearScheduledLoad(): void {
    if (this.loadTimeoutId !== null) {
      clearTimeout(this.loadTimeoutId);
      this.loadTimeoutId = null;
    }
  }

  private applyDetail(day: MealDayDetail, source: string): void {
    this.daySummary = {
      dayLabel: day.dayLabel,
      goal: day.goal,
      prepStatus: day.prepStatus,
      prepClass: day.prepStatus === 'Prepared' ? 'prep-ready' : 'prep-pending',
      hydrationLabel: `Hydration target ${day.hydrationLiters}L`,
      coachNote: day.coachNote
    };
    this.macroCards = day.macros.map((macro) => this.toMacroCard(macro));
    this.mealRows = day.meals.map((meal) => this.toMealRow(meal));
    this.source = source;
    this.lastUpdated = new Date();
    this.emptyReason = 'no-data';
    this.state = 'ready';
    this.dayLinks = this.buildDayLinks(day.id);
  }

  private setEmpty(reason: MealDetailsEmptyReason): void {
    this.daySummary = null;
    this.macroCards = [];
    this.mealRows = [];
    this.emptyReason = reason;
    this.lastUpdated = new Date();
    this.state = 'empty';
  }

  private toMacroCard(macro: MealMacro): MacroCardViewModel {
    const rawProgress = macro.target > 0 ? Math.round((macro.value / macro.target) * 100) : 0;
    const boundedProgress = Math.max(0, Math.min(rawProgress, 100));
    const progressClass = rawProgress < 90 ? 'progress-low' : rawProgress <= 110 ? 'progress-balanced' : 'progress-high';

    return {
      label: macro.label,
      valueLabel: `${macro.value} ${macro.unit}`,
      targetLabel: `Target ${macro.target} ${macro.unit}`,
      progressPercent: boundedProgress,
      progressClass
    };
  }

  private toMealRow(meal: MealBreakdown): MealRowViewModel {
    return {
      slot: meal.slot,
      name: meal.name,
      macroSummary: `${meal.calories} kcal · P ${meal.protein}g · C ${meal.carbs}g · F ${meal.fats}g`,
      prepTip: meal.prepTip
    };
  }

  private buildDayLinks(activeId: string): MealDayLinkViewModel[] {
    return LOCAL_MEAL_DAY_DETAILS.map((day) => ({
      id: day.id,
      dayLabel: day.dayLabel,
      isActive: day.id === activeId
    }));
  }

  private findLocalDay(dayId: string): MealDayDetail | null {
    if (!dayId || dayId === 'summary') {
      return null;
    }

    const match = LOCAL_MEAL_DAY_DETAILS.find((day) => day.id === dayId);
    return match ? this.cloneDay(match) : null;
  }

  private cloneDay(day: MealDayDetail): MealDayDetail {
    return {
      ...day,
      meals: day.meals.map((meal) => ({ ...meal })),
      macros: day.macros.map((macro) => ({ ...macro }))
    };
  }

  private extractDay(payload: unknown, fallbackId: string): MealDayDetail | null {
    if (Array.isArray(payload)) {
      for (const item of payload) {
        const parsed = this.extractSingleDay(item, fallbackId);
        if (parsed) {
          return parsed;
        }
      }
      return null;
    }

    return this.extractSingleDay(payload, fallbackId);
  }

  private extractSingleDay(payload: unknown, fallbackId: string): MealDayDetail | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const candidate = payload as Record<string, unknown>;
    const meals = this.readMeals(candidate['meals']);
    if (!meals.length) {
      return null;
    }

    const dayLabel = this.readString(candidate['dayLabel']) ?? this.readString(candidate['day']) ?? this.formatDayLabel(fallbackId);
    const id = this.readString(candidate['id'])?.toLowerCase() ?? fallbackId;
    const prepStatus = this.readPrepStatus(candidate['prepStatus']) ?? 'Pending';
    const hydrationLiters = this.readNumber(candidate['hydrationLiters']) ?? 2.5;
    const goal = this.readString(candidate['goal']) ?? 'Member nutrition plan';
    const coachNote =
      this.readString(candidate['coachNote']) ??
      'Review completion with the assigned coach to keep adherence high across the week.';

    const parsedMacros = this.readMacros(candidate['macros']);
    const macros = parsedMacros.length ? parsedMacros : this.buildFallbackMacros(meals, candidate);

    return {
      id,
      dayLabel,
      goal,
      prepStatus,
      hydrationLiters,
      coachNote,
      meals,
      macros
    };
  }

  private buildFallbackMacros(meals: MealBreakdown[], source: Record<string, unknown>): MealMacro[] {
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const calories = this.readNumber(source['calories']) ?? totals.calories;
    const protein = this.readNumber(source['protein']) ?? totals.protein;
    const carbs = this.readNumber(source['carbs']) ?? totals.carbs;
    const fats = this.readNumber(source['fats']) ?? totals.fats;

    return [
      {
        label: 'Calories',
        value: calories,
        target: this.readNumber(source['targetCalories']) ?? Math.max(calories + 150, 1800),
        unit: 'kcal'
      },
      {
        label: 'Protein',
        value: protein,
        target: this.readNumber(source['targetProtein']) ?? Math.max(protein + 8, 140),
        unit: 'g'
      },
      {
        label: 'Carbs',
        value: carbs,
        target: this.readNumber(source['targetCarbs']) ?? Math.max(carbs + 12, 200),
        unit: 'g'
      },
      {
        label: 'Fats',
        value: fats,
        target: this.readNumber(source['targetFats']) ?? Math.max(fats + 6, 65),
        unit: 'g'
      }
    ];
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

  private readSlot(value: unknown): MealSlot | null {
    if (value === 'Breakfast' || value === 'Lunch' || value === 'Dinner' || value === 'Snack') {
      return value;
    }
    return null;
  }

  private readMeals(value: unknown): MealBreakdown[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((meal, index) => {
      if (!meal || typeof meal !== 'object') {
        return [];
      }

      const candidate = meal as Record<string, unknown>;
      const slot = this.readSlot(candidate['slot']);
      const name = this.readString(candidate['name']);
      if (!slot || !name) {
        return [];
      }

      return [
        {
          slot,
          name,
          calories: this.readNumber(candidate['calories']) ?? 400,
          protein: this.readNumber(candidate['protein']) ?? 25,
          carbs: this.readNumber(candidate['carbs']) ?? 35,
          fats: this.readNumber(candidate['fats']) ?? 12,
          prepTip:
            this.readString(candidate['prepTip']) ??
            `Prep ${slot.toLowerCase()} in advance to keep nutrition consistent on busy gym shifts.`
        }
      ].map((item) => ({ ...item, name: item.name || `Meal ${index + 1}` }));
    });
  }

  private readMacros(value: unknown): MealMacro[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((macro) => {
      if (!macro || typeof macro !== 'object') {
        return [];
      }

      const candidate = macro as Record<string, unknown>;
      const label = this.readMacroLabel(candidate['label']);
      const macroValue = this.readNumber(candidate['value']);
      const target = this.readNumber(candidate['target']);
      const unit = candidate['unit'] === 'kcal' ? 'kcal' : 'g';

      if (!label || macroValue === null || target === null) {
        return [];
      }

      return [
        {
          label,
          value: macroValue,
          target,
          unit: label === 'Calories' ? 'kcal' : unit
        }
      ];
    });
  }

  private readMacroLabel(value: unknown): MealMacroLabel | null {
    if (value === 'Calories' || value === 'Protein' || value === 'Carbs' || value === 'Fats') {
      return value;
    }
    return null;
  }

  private formatDayLabel(dayId: string): string {
    if (!dayId.length) {
      return 'Meal day';
    }

    return dayId.charAt(0).toUpperCase() + dayId.slice(1);
  }
}
