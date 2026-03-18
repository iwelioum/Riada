import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, Activity, Users, FileText, CheckCircle2, XCircle } from 'lucide-angular';
import { AnalyticsApiService, SystemHealthCheckResponse } from '../../../shared/services/analytics-api.service';

const EMPTY_HEALTH: SystemHealthCheckResponse = {
  isHealthy: false,
  status: 'Health data unavailable',
  totalMembers: 0,
  activeContracts: 0,
  pendingInvoices: 0,
};

@Component({
  selector: 'app-health-analytics',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
      <lucide-icon [img]="ActivityIcon" [size]="24" class="text-[#4880FF]"></lucide-icon> System Health
    </h1>
    <p class="text-sm text-[#6B7280] mt-1">Platform-wide KPIs</p>
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    @if (error()) {
      <div class="mb-4 max-w-4xl mx-auto p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
        {{ error() }}
      </div>
    }

    @if (loading()) {
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-8 text-sm text-[#6B7280] text-center">
          Loading system health…
        </div>
      </div>
    } @else {
      <div class="max-w-4xl mx-auto space-y-6">

        <div class="rounded-2xl p-6 border flex items-center gap-4"
             [class]="health().isHealthy ? 'bg-[#E0F8EA] border-[#00B69B]/30' : 'bg-[#FFF0F0] border-[#FF4747]/30'">
          @if (health().isHealthy) {
            <lucide-icon [img]="CheckCircle2Icon" [size]="32" class="text-[#00B69B] shrink-0"></lucide-icon>
          } @else {
            <lucide-icon [img]="XCircleIcon" [size]="32" class="text-[#FF4747] shrink-0"></lucide-icon>
          }
          <div>
            <p class="text-lg font-black" [class]="health().isHealthy ? 'text-[#00B69B]' : 'text-[#FF4747]'">
              {{ health().isHealthy ? 'Healthy' : 'Unhealthy' }}
            </p>
            <p class="text-sm text-[#6B7280] mt-0.5">{{ health().status }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (kpi of kpis(); track kpi.label) {
            <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" [class]="kpi.bg">
                <lucide-icon [img]="kpi.icon" [size]="24" [class]="kpi.color"></lucide-icon>
              </div>
              <p class="text-3xl font-black text-[#111827]">{{ kpi.value.toLocaleString() }}</p>
              <p class="text-sm text-[#6B7280] font-medium mt-1">{{ kpi.label }}</p>
            </div>
          }
        </div>

      </div>
    }
  </div>
</div>
  `,
})
export class HealthAnalyticsComponent implements OnInit {
  private readonly analyticsApi = inject(AnalyticsApiService);

  readonly ActivityIcon = Activity;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon = XCircle;

  readonly health = signal<SystemHealthCheckResponse>(EMPTY_HEALTH);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly kpis = computed(() => {
    const health = this.health();
    return [
      { label: 'Total Members', value: health.totalMembers, icon: Users, color: 'text-[#4880FF]', bg: 'bg-[#EBEBFF]' },
      { label: 'Active Contracts', value: health.activeContracts, icon: FileText, color: 'text-[#00B69B]', bg: 'bg-[#E0F8EA]' },
      {
        label: 'Pending Invoices',
        value: health.pendingInvoices,
        icon: Activity,
        color: health.pendingInvoices > 0 ? 'text-[#FF9066]' : 'text-[#00B69B]',
        bg: health.pendingInvoices > 0 ? 'bg-[#FFF3D6]' : 'bg-[#E0F8EA]',
      },
    ];
  });

  ngOnInit(): void {
    this.loadSystemHealth();
  }

  private loadSystemHealth(): void {
    this.loading.set(true);
    this.error.set(null);
    this.analyticsApi.getHealth().subscribe({
      next: (health) => this.health.set(health),
      error: () => {
        this.health.set(EMPTY_HEALTH);
        this.error.set('Unable to load system health.');
      },
      complete: () => this.loading.set(false),
    });
  }
}

