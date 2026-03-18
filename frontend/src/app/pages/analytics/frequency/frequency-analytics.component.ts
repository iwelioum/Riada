import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, BarChart2, Calendar } from 'lucide-angular';
import { AnalyticsApiService, ClubFrequencyResponse } from '../../../shared/services/analytics-api.service';

interface FrequencyRow {
  clubId: number;
  clubName: string;
  visitorCount: number;
  avgVisitsPerMember: number;
}

function mapFrequencyRow(dto: ClubFrequencyResponse): FrequencyRow {
  return {
    clubId: dto.clubId,
    clubName: dto.clubName,
    visitorCount: dto.visitorCount,
    avgVisitsPerMember: dto.averageVisitsPerMember,
  };
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

@Component({
  selector: 'app-frequency-analytics',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <lucide-icon [img]="BarChart2Icon" [size]="24" class="text-[#4880FF]"></lucide-icon> Visit Frequency
        </h1>
        <p class="text-sm text-[#6B7280] mt-1">Per club breakdown</p>
      </div>

      <form class="flex items-center gap-3" (ngSubmit)="submitDateFilters()">
        <div class="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2">
          <lucide-icon [img]="CalendarIcon" [size]="16" class="text-[#6B7280]"></lucide-icon>
          <input
            type="date"
            name="dateFrom"
            [(ngModel)]="dateFrom"
            (change)="onDateFilterChange()"
            class="text-sm text-[#111827] bg-transparent focus:outline-none" />
        </div>
        <span class="text-[#6B7280] text-sm font-medium">→</span>
        <div class="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2">
          <lucide-icon [img]="CalendarIcon" [size]="16" class="text-[#6B7280]"></lucide-icon>
          <input
            type="date"
            name="dateTo"
            [(ngModel)]="dateTo"
            (change)="onDateFilterChange()"
            class="text-sm text-[#111827] bg-transparent focus:outline-none" />
        </div>
        <button type="submit" class="sr-only">Apply</button>
      </form>
    </div>
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
              <td colspan="3" class="px-5 py-12 text-center text-sm text-[#6B7280]">Loading frequency analytics…</td>
            </tr>
          }
          @if (!loading() && rows().length === 0) {
            <tr>
              <td colspan="3" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No frequency data found</td>
            </tr>
          }
          @for (row of rows(); track row.clubId) {
            <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
              <td class="px-5 py-4 font-bold text-[#111827]">{{ row.clubName }}</td>
              <td class="px-5 py-4 font-semibold text-[#4880FF]">{{ row.visitorCount.toLocaleString() }}</td>
              <td class="px-5 py-4 text-sm font-semibold text-[#111827]">{{ row.avgVisitsPerMember.toFixed(1) }} visits</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
})
export class FrequencyAnalyticsComponent implements OnInit {
  private readonly analyticsApi = inject(AnalyticsApiService);
  private activeRequestId = 0;

  readonly BarChart2Icon = BarChart2;
  readonly CalendarIcon = Calendar;

  readonly headers = ['Club', 'Total visits', 'Avg. visits / member'];
  readonly rows = signal<FrequencyRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  dateFrom = toDateStr(new Date(Date.now() - 30 * 86_400_000));
  dateTo = toDateStr(new Date());

  ngOnInit(): void {
    this.loadFrequency();
  }

  onDateFilterChange(): void {
    this.loadFrequency();
  }

  submitDateFilters(): void {
    this.loadFrequency();
  }

  private loadFrequency(): void {
    const dateFrom = this.dateFrom.trim();
    const dateTo = this.dateTo.trim();

    if (!dateFrom || !dateTo) {
      this.activeRequestId += 1;
      this.rows.set([]);
      this.loading.set(false);
      this.error.set('Please select both dates.');
      return;
    }

    if (dateFrom > dateTo) {
      this.activeRequestId += 1;
      this.rows.set([]);
      this.loading.set(false);
      this.error.set('Start date must be earlier than end date.');
      return;
    }

    const requestId = ++this.activeRequestId;
    this.loading.set(true);
    this.error.set(null);
    this.analyticsApi.getFrequency(dateFrom, dateTo).subscribe({
      next: (rows) => {
        if (requestId !== this.activeRequestId) return;
        this.rows.set(rows.map(mapFrequencyRow));
      },
      error: () => {
        if (requestId !== this.activeRequestId) return;
        this.error.set('Unable to load frequency analytics.');
      },
      complete: () => {
        if (requestId !== this.activeRequestId) return;
        this.loading.set(false);
      },
    });
  }
}

