import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';

@Component({
  selector: 'app-risk-analytics',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div class="mb-8">
        <h1 class="text-3xl font-black text-neutral-900">⚠️ Risk Analysis</h1>
        <p class="text-sm text-neutral-500 mt-2">Identify members at risk of churn</p>
      </div>

      <!-- Risk Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <app-card>
          <div class="text-center">
            <p class="text-3xl mb-2">🔴</p>
            <p class="text-sm text-neutral-500 mb-2">High Risk</p>
            <p class="text-2xl font-black text-danger">23</p>
            <p class="text-xs text-neutral-500 mt-2">No visits in 30 days</p>
          </div>
        </app-card>
        <app-card>
          <div class="text-center">
            <p class="text-3xl mb-2">🟡</p>
            <p class="text-sm text-neutral-500 mb-2">Medium Risk</p>
            <p class="text-2xl font-black text-warning">47</p>
            <p class="text-xs text-neutral-500 mt-2">30-60 days inactive</p>
          </div>
        </app-card>
        <app-card>
          <div class="text-center">
            <p class="text-3xl mb-2">🟢</p>
            <p class="text-sm text-neutral-500 mb-2">Low Risk</p>
            <p class="text-2xl font-black text-success">712</p>
            <p class="text-xs text-neutral-500 mt-2">Active members</p>
          </div>
        </app-card>
      </div>

      <app-card>
        <div class="text-center text-neutral-500 py-12">
          📊 Risk analytics dashboard coming soon...
        </div>
      </app-card>
    </div>
  `,
})
export class RiskAnalyticsComponent {}
