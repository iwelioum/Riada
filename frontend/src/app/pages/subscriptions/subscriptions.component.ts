import { Component, OnInit } from '@angular/core';
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
  selectedPlanId?: number;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.listSubscriptionPlans().subscribe((plans) => (this.plans = plans || []));
  }

  loadOptions(planId: number) {
    this.selectedPlanId = planId;
    if (this.planOptions[planId]) return;
    this.api.getPlanOptions(planId).subscribe((options) => (this.planOptions[planId] = options || []));
  }

  get selectedPlanName(): string {
    const plan = this.plans.find((p) => p.id === this.selectedPlanId);
    return plan?.planName ?? '';
  }

  get currentOptions(): SubscriptionPlanOption[] {
    return this.selectedPlanId ? this.planOptions[this.selectedPlanId] || [] : [];
  }
}
