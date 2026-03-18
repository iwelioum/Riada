import { Component, OnInit, inject, signal } from '@angular/core';
import { LucideAngularModule, CreditCard, ChevronDown, ChevronUp } from 'lucide-angular';
import { PlanOptionDto, PlanSummaryDto, PlansApiService } from '../../shared/services/plans-api.service';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
      <lucide-icon [img]="CreditCardIcon" [size]="24" class="text-[#4880FF]"></lucide-icon> Subscription Plans
    </h1>
    <p class="text-sm text-[#6B7280] mt-1">{{ plans().length }} plans available</p>
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    @if (error()) {
      <div class="mb-4 p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
        {{ error() }}
      </div>
    }

    <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
            @for (h of headers; track h) {
              <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td colspan="7" class="px-5 py-10 text-center text-sm text-[#6B7280]">Loading plans…</td>
            </tr>
          }
          @if (!loading() && plans().length === 0) {
            <tr>
              <td colspan="7" class="px-5 py-10 text-center text-sm text-[#6B7280]">No plans found.</td>
            </tr>
          }
          @for (plan of plans(); track plan.id) {
            <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
              <td class="px-5 py-4 font-bold text-[#111827]">{{ plan.planName }}</td>
              <td class="px-5 py-4">
                <span class="font-bold text-[#4880FF]">€{{ plan.basePrice.toFixed(2) }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-[#6B7280]">{{ plan.commitmentMonths ?? '—' }}</td>
              <td class="px-5 py-4 text-sm text-[#6B7280]">€{{ plan.enrollmentFee.toFixed(2) }}</td>
              <td class="px-5 py-4 text-sm">
                <span [class]="plan.limitedClubAccess ? 'text-[#111827] font-semibold' : 'text-[#A6A6A6]'">{{ boolLabel(plan.limitedClubAccess) }}</span>
              </td>
              <td class="px-5 py-4 text-sm">
                <span [class]="plan.duoPassAllowed ? 'text-[#111827] font-semibold' : 'text-[#A6A6A6]'">{{ boolLabel(plan.duoPassAllowed) }}</span>
              </td>
              <td class="px-5 py-4">
                <button (click)="toggle(plan.id)" class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#4880FF] transition-colors">
                  @if (expandedId() === plan.id) {
                    <lucide-icon [img]="ChevronUpIcon" [size]="16"></lucide-icon>
                  } @else {
                    <lucide-icon [img]="ChevronDownIcon" [size]="16"></lucide-icon>
                  }
                </button>
              </td>
            </tr>
            @if (expandedId() === plan.id) {
              <tr class="bg-[#F8FAFF]">
                <td colspan="7" class="px-5 py-4">
                  <p class="text-xs font-bold text-[#6B7280] uppercase mb-3">Plan options</p>
                  @if (isLoadingOptions(plan.id)) {
                    <p class="text-sm text-[#6B7280]">Loading options…</p>
                  } @else if (optionsFor(plan.id).length === 0) {
                    <p class="text-sm text-[#A6A6A6]">No options available for this plan.</p>
                  } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      @for (option of optionsFor(plan.id); track option.id) {
                        <div class="flex items-center justify-between rounded-xl bg-white border border-[#E0E0E0] px-3 py-2">
                          <span class="text-sm text-[#111827] font-medium">{{ option.optionName }}</span>
                          <span class="text-sm text-[#4880FF] font-semibold">€{{ option.monthlyPrice.toFixed(2) }}/month</span>
                        </div>
                      }
                    </div>
                  }
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
})
export class PlansComponent implements OnInit {
  readonly CreditCardIcon = CreditCard;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly headers = ['Plan name', 'Base price', 'Commitment (months)', 'Enrollment fee', 'Limited club access', 'Duo pass', ''];

  private readonly plansApi = inject(PlansApiService);

  plans = signal<PlanSummaryDto[]>([]);
  expandedId = signal<number | null>(null);
  optionsByPlan = signal<Record<number, PlanOptionDto[]>>({});
  loading = signal(true);
  error = signal<string | null>(null);
  loadingOptions = signal<Record<number, boolean>>({});

  ngOnInit(): void {
    this.loadPlans();
  }

  toggle(id: number) {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
      return;
    }

    this.expandedId.set(id);
    if (!this.optionsByPlan()[id]) {
      this.loadPlanOptions(id);
    }
  }

  boolLabel(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  optionsFor(planId: number): PlanOptionDto[] {
    return this.optionsByPlan()[planId] ?? [];
  }

  isLoadingOptions(planId: number): boolean {
    return this.loadingOptions()[planId] ?? false;
  }

  private loadPlans(): void {
    this.loading.set(true);
    this.error.set(null);
    this.plansApi.listPlans().subscribe({
      next: (plans) => this.plans.set(plans),
      error: () => this.error.set('Unable to load subscription plans.'),
      complete: () => this.loading.set(false),
    });
  }

  private loadPlanOptions(planId: number): void {
    this.loadingOptions.update((state) => ({ ...state, [planId]: true }));
    this.plansApi.listPlanOptions(planId).subscribe({
      next: (options) => {
        this.optionsByPlan.update((state) => ({ ...state, [planId]: options }));
      },
      error: () => this.error.set('Unable to load plan options.'),
      complete: () => {
        this.loadingOptions.update((state) => ({ ...state, [planId]: false }));
      },
    });
  }
}

