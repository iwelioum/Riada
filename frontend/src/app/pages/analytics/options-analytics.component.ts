import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';

@Component({
  selector: 'app-options-analytics',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div class="mb-8">
        <h1 class="text-3xl font-black text-neutral-900">🎯 Options Analytics</h1>
        <p class="text-sm text-neutral-500 mt-2">Service options and add-ons performance</p>
      </div>

      <app-card>
        <div class="text-center text-neutral-500 py-12">
          📊 Options analytics dashboard coming soon...
        </div>
      </app-card>
    </div>
  `,
})
export class OptionsAnalyticsComponent {}
