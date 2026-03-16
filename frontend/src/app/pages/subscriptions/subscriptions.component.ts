import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SubscriptionPlan, SubscriptionPlanOption } from '../../core/models/api-models';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  planOptions: Record<number, SubscriptionPlanOption[]> = {};
  selectedPlanId: number | null = null;
  loadingPlans = false;
  loadingOptions = false;
  hasLoadedPlans = false;
  plansError: string | null = null;
  optionsError: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    this.loadingPlans = true;
    this.hasLoadedPlans = false;
    this.plansError = null;
    this.api.listSubscriptionPlans().subscribe({
      next: (plans) => {
        this.plans = plans || [];
        if (!this.plans.length) {
          this.selectedPlanId = null;
        } else if (this.selectedPlanId === null) {
          this.selectPlan(this.plans[0].id);
        } else if (!this.plans.find((plan) => plan.id === this.selectedPlanId)) {
          this.selectPlan(this.plans[0].id);
        }
        this.hasLoadedPlans = true;
        this.loadingPlans = false;
      },
      error: (error) => {
        this.plans = [];
        this.selectedPlanId = null;
        this.plansError = this.getErrorMessage(error, 'Unable to load subscription plans.');
        this.hasLoadedPlans = true;
        this.loadingPlans = false;
      }
    });
  }

  selectPlan(planId: number) {
    this.optionsError = null;
    this.selectedPlanId = planId;
    if (this.planOptions[planId]) {
      return;
    }

    this.loadOptions(planId);
  }

  refreshSelectedPlanOptions() {
    if (!this.selectedPlanId) {
      return;
    }

    delete this.planOptions[this.selectedPlanId];
    this.loadOptions(this.selectedPlanId);
  }

  private loadOptions(planId: number) {
    this.loadingOptions = true;
    this.api.getPlanOptions(planId).subscribe({
      next: (options) => {
        this.planOptions[planId] = options || [];
        this.loadingOptions = false;
      },
      error: (error) => {
        this.planOptions[planId] = [];
        this.optionsError = this.getErrorMessage(error, 'Unable to load plan options.');
        this.loadingOptions = false;
      }
    });
  }

  get selectedPlanName(): string {
    const plan = this.plans.find((p) => p.id === this.selectedPlanId);
    return plan?.planName ?? '';
  }

  get currentOptions(): SubscriptionPlanOption[] {
    return this.selectedPlanId ? this.planOptions[this.selectedPlanId] || [] : [];
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again to access subscription plans.';
      }
      if (error.status === 403) {
        return 'Your role does not allow subscription-plan endpoints.';
      }

      const apiMessage = error.error?.message ?? error.error?.Message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    return fallback;
  }
}
