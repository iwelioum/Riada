import { Component, OnInit, inject, signal } from '@angular/core';
import { LucideAngularModule, PieChart } from 'lucide-angular';
import { AnalyticsApiService, OptionPopularityResponse } from '../../../shared/services/analytics-api.service';

interface OptionRow {
  optionId: number;
  optionName: string;
  subscriptionCount: number;
  popularityPercentage: number;
}

function mapOptionRow(dto: OptionPopularityResponse): OptionRow {
  return {
    optionId: dto.optionId,
    optionName: dto.optionName,
    subscriptionCount: dto.subscriptionCount,
    popularityPercentage: dto.popularityPercentage,
  };
}

@Component({
  selector: 'app-options-analytics',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
      <lucide-icon [img]="PieChartIcon" [size]="24" class="text-[#4880FF]"></lucide-icon> Options Popularity
    </h1>
    <p class="text-sm text-[#6B7280] mt-1">Subscription rate per option</p>
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
              <td colspan="3" class="px-5 py-12 text-center text-sm text-[#6B7280]">Loading options analytics…</td>
            </tr>
          }
          @if (!loading() && options().length === 0) {
            <tr>
              <td colspan="3" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No options data found</td>
            </tr>
          }
          @for (opt of options(); track opt.optionId) {
            <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
              <td class="px-5 py-4 font-bold text-[#111827]">{{ opt.optionName }}</td>
              <td class="px-5 py-4 font-semibold text-[#4880FF]">{{ opt.subscriptionCount }}</td>
              <td class="px-5 py-4 w-64">
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div class="h-full bg-[#4880FF] rounded-full transition-all" [style.width]="opt.popularityPercentage + '%'"></div>
                  </div>
                  <span class="text-sm font-bold text-[#111827] w-12 text-right">{{ opt.popularityPercentage }}%</span>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
})
export class OptionsAnalyticsComponent implements OnInit {
  private readonly analyticsApi = inject(AnalyticsApiService);

  readonly PieChartIcon = PieChart;
  readonly headers = ['Option', 'Subscribers', 'Popularity'];

  readonly options = signal<OptionRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOptions();
  }

  private loadOptions(): void {
    this.loading.set(true);
    this.error.set(null);
    this.analyticsApi.getOptions().subscribe({
      next: (options) => this.options.set(options.map(mapOptionRow).sort((a, b) => b.subscriptionCount - a.subscriptionCount)),
      error: () => this.error.set('Unable to load options analytics.'),
      complete: () => this.loading.set(false),
    });
  }
}

