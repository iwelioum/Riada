import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LucideAngularModule, Users, FileText, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Dumbbell, Wrench } from 'lucide-angular';

const MONTHLY_REVENUE = [
  { month: 'Apr', revenue: 28400, contracts: 580 }, { month: 'May', revenue: 31200, contracts: 601 },
  { month: 'Jun', revenue: 29800, contracts: 595 }, { month: 'Jul', revenue: 33100, contracts: 618 },
  { month: 'Aug', revenue: 35600, contracts: 629 }, { month: 'Sep', revenue: 34200, contracts: 623 },
  { month: 'Oct', revenue: 36800, contracts: 638 }, { month: 'Nov', revenue: 35100, contracts: 630 },
  { month: 'Dec', revenue: 37400, contracts: 644 }, { month: 'Jan', revenue: 36900, contracts: 641 },
  { month: 'Feb', revenue: 37800, contracts: 648 }, { month: 'Mar', revenue: 38420, contracts: 651 },
];

const MEMBER_STATUS_DATA = [
  { label: 'Active',     value: 782, color: '#00B69B' },
  { label: 'Suspended',  value: 65,  color: '#FF9066' },
  { label: 'Anonymized', value: 12,  color: '#A6A6A6' },
];

const RECENT_ACCESS = [
  { memberName: 'Jean Dupont',    club: 'Brussels', time: '11:45', result: 'Granted' },
  { memberName: 'Clara Morin',    club: 'Brussels', time: '11:07', result: 'Denied'  },
  { memberName: 'Pierre Dumont',  club: 'Brussels', time: '10:22', result: 'Denied'  },
  { memberName: 'Sophie Leroy',   club: 'Brussels', time: '10:05', result: 'Granted' },
  { memberName: 'Unknown',        club: 'Namur',    time: '09:01', result: 'Denied'  },
];

const UPCOMING_SESSIONS = [
  { course: 'Power Yoga', instructor: 'M. Laurent', club: 'Brussels', time: '14:00', capacity: 20, enrolled: 18 },
  { course: 'HIIT Cardio', instructor: 'R. Moreau', club: 'Liège',    time: '15:30', capacity: 15, enrolled: 15 },
  { course: 'Pilates',     instructor: 'S. Dupuis', club: 'Brussels', time: '17:00', capacity: 12, enrolled: 7  },
  { course: 'Boxing',      instructor: 'K. Osei',   club: 'Namur',    time: '18:30', capacity: 10, enrolled: 10 },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgApexchartsModule, LucideAngularModule, DecimalPipe],
  template: `
<div class="flex flex-col h-full overflow-y-auto bg-[#F5F6FA]">
  <div class="p-8 flex flex-col gap-7">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-[#111827]">Dashboard</h1>
      <p class="text-sm text-[#6B7280] mt-0.5">Wednesday, 18 March 2026</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-5">
      @for (kpi of kpiCards; track kpi.label) {
        <a [routerLink]="kpi.link" class="bg-white rounded-2xl p-5 shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow block">
          <div class="flex items-start justify-between mb-4">
            <div [class]="'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ' + kpi.bg">
              <lucide-icon [img]="kpi.icon" [size]="20" [style.color]="kpi.accent"></lucide-icon>
            </div>
            <span [class]="'flex items-center gap-1 text-xs font-semibold ' + (kpi.trend >= 0 ? 'text-[#00B69B]' : 'text-[#FF4747]')">
              @if (kpi.trend >= 0) {
                <lucide-icon [img]="TrendUpIcon" [size]="14"></lucide-icon>
              } @else {
                <lucide-icon [img]="TrendDownIcon" [size]="14"></lucide-icon>
              }
              {{ absTrend(kpi.trend) | number:'1.1-1' }}%
            </span>
          </div>
          <p class="text-2xl font-black text-[#111827] leading-tight">{{ kpi.value }}</p>
          <p class="text-[13px] font-semibold text-[#6B7280] mt-0.5">{{ kpi.label }}</p>
          <p class="text-[11px] text-[#A6A6A6] mt-1">{{ kpi.sub }}</p>
        </a>
      }
    </div>

    <!-- Revenue Chart + Member Status -->
    <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-[17px] font-bold text-[#111827]">Monthly Revenue</h2>
            <p class="text-sm text-[#6B7280]">Last 12 months</p>
          </div>
        </div>
        <apx-chart
          [series]="revenueSeries"
          [chart]="revenueChart"
          [xaxis]="revenueXaxis"
          [yaxis]="revenueYaxis"
          [stroke]="revenueStroke"
          [fill]="revenueFill"
          [colors]="['#4880FF']"
          [dataLabels]="noDataLabels"
          [grid]="chartGrid"
          [tooltip]="revenueTooltip"
        ></apx-chart>
      </div>

      <!-- Member Status -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0] flex flex-col">
        <h2 class="text-[17px] font-bold text-[#111827] mb-1">Member Status</h2>
        <p class="text-sm text-[#6B7280] mb-5">{{ totalMembers }} total members</p>

        <div class="flex items-center justify-center my-2">
          <div class="relative w-32 h-32">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F0F0F0" stroke-width="14"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#00B69B" stroke-width="14"
                [attr.stroke-dasharray]="activePct * 314 / 100 + ' 314'" stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-xl font-black text-[#111827]">{{ activePct }}%</span>
              <span class="text-[10px] text-[#6B7280] font-medium">Active</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 mt-4">
          @for (s of memberStatus; track s.label) {
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 rounded-full" [style.background-color]="s.color"></div>
                <span class="text-sm font-medium text-[#505050]">{{ s.label }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-24 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div class="h-full rounded-full" [style.width.%]="s.value / totalMembers * 100" [style.background-color]="s.color"></div>
                </div>
                <span class="text-sm font-bold text-[#111827] w-8 text-right">{{ s.value }}</span>
              </div>
            </div>
          }
        </div>
        <a routerLink="/members" class="mt-5 text-center text-sm text-[#4880FF] font-semibold hover:underline">View all members →</a>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">

      <!-- Recent Access -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[15px] font-bold text-[#111827]">Recent Access</h2>
          <a routerLink="/access-control" class="text-xs text-[#4880FF] font-semibold hover:underline">View all</a>
        </div>
        <div class="divide-y divide-[#F5F5F5]">
          @for (a of recentAccess; track $index) {
            <div class="flex items-center justify-between px-5 py-3">
              <div class="flex items-center gap-3 min-w-0">
                @if (a.result === 'Granted') {
                  <lucide-icon [img]="CheckCircleIcon" [size]="16" class="text-[#00B69B] shrink-0"></lucide-icon>
                } @else {
                  <lucide-icon [img]="XCircleIcon" [size]="16" class="text-[#FF4747] shrink-0"></lucide-icon>
                }
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-[#111827] truncate">{{ a.memberName }}</p>
                  <p class="text-xs text-[#A6A6A6]">{{ a.club }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-[#A6A6A6] shrink-0">
                <lucide-icon [img]="ClockIcon" [size]="12"></lucide-icon> {{ a.time }}
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Today's Sessions -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[15px] font-bold text-[#111827]">Today's Sessions</h2>
          <a routerLink="/courses/schedule" class="text-xs text-[#4880FF] font-semibold hover:underline">Schedule</a>
        </div>
        <div class="divide-y divide-[#F5F5F5]">
          @for (s of upcomingSessions; track $index) {
            <div class="px-5 py-3">
              <div class="flex items-start justify-between mb-1">
                <div>
                  <p class="text-sm font-semibold text-[#111827]">{{ s.course }}</p>
                  <p class="text-xs text-[#A6A6A6]">{{ s.instructor }} · {{ s.club }}</p>
                </div>
                <div class="flex items-center gap-1 text-xs text-[#6B7280] shrink-0 ml-3">
                  <lucide-icon [img]="ClockIcon" [size]="12"></lucide-icon> {{ s.time }}
                </div>
              </div>
              <div class="flex items-center gap-2 mt-1.5">
                <div class="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div class="h-full rounded-full" [class]="s.enrolled >= s.capacity ? 'bg-[#FF4747]' : 'bg-[#4880FF]'"
                    [style.width.%]="s.enrolled / s.capacity * 100"></div>
                </div>
                <span class="text-[11px] font-bold" [class]="s.enrolled >= s.capacity ? 'text-[#FF4747]' : 'text-[#6B7280]'">
                  {{ s.enrolled }}/{{ s.capacity }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Equipment + Contracts Bar -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col">
        <div class="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[15px] font-bold text-[#111827]">Equipment</h2>
          <a routerLink="/equipment" class="text-xs text-[#4880FF] font-semibold hover:underline">View all</a>
        </div>
        <div class="flex flex-col gap-3 p-5">
          @for (eq of equipmentSummary; track eq.label) {
            <div class="flex items-center gap-3">
              <div [class]="'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ' + eq.bg">
                <lucide-icon [img]="eq.icon" [size]="16" [class]="eq.color"></lucide-icon>
              </div>
              <div class="flex-1"><p class="text-sm font-medium text-[#505050]">{{ eq.label }}</p></div>
              <span [class]="'text-lg font-black ' + eq.color">{{ eq.count }}</span>
            </div>
          }
        </div>
        <div class="px-5 pb-5 pt-2 border-t border-[#F5F5F5]">
          <p class="text-[13px] font-bold text-[#111827] mb-3">Contracts / Month</p>
          <apx-chart
            [series]="contractSeries"
            [chart]="contractChart"
            [xaxis]="contractXaxis"
            [yaxis]="contractYaxis"
            [colors]="['#4880FF']"
            [dataLabels]="noDataLabels"
            [plotOptions]="contractPlotOptions"
            [grid]="chartGrid"
          ></apx-chart>
        </div>
      </div>

    </div>
  </div>
</div>
  `,
})
export class DashboardComponent {
  readonly TrendUpIcon = TrendingUp;
  readonly TrendDownIcon = TrendingDown;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly ClockIcon = Clock;

  totalMembers = MEMBER_STATUS_DATA.reduce((s, d) => s + d.value, 0);
  activePct = Math.round((782 / this.totalMembers) * 100);
  memberStatus = MEMBER_STATUS_DATA;
  recentAccess = RECENT_ACCESS;
  upcomingSessions = UPCOMING_SESSIONS;

  kpiCards = [
    { label: 'Active Members',   value: '782',      sub: 'out of 859 total',        trend: 5.2,  icon: Users,         accent: '#4880FF', bg: 'bg-[#EBEBFF]', link: '/members' },
    { label: 'Active Contracts', value: '651',      sub: '23 expiring soon',         trend: 2.1,  icon: FileText,      accent: '#00B69B', bg: 'bg-[#E0F8EA]', link: '/contracts' },
    { label: 'Revenue (March)',  value: '38 420 €', sub: 'from 651 invoices',        trend: 6.2,  icon: AlertTriangle, accent: '#8B5CF6', bg: 'bg-[#F3F0FF]', link: '/billing/invoices' },
    { label: 'Overdue Invoices', value: '18',       sub: '2 847 € outstanding',      trend: -3,   icon: AlertTriangle, accent: '#FF4747', bg: 'bg-[#FFF0F0]', link: '/billing/invoices' },
  ];

  equipmentSummary = [
    { label: 'In Service',  count: 142, color: 'text-[#00B69B]', bg: 'bg-[#E0F8EA]', icon: Dumbbell },
    { label: 'Maintenance', count: 8,   color: 'text-[#FF9066]', bg: 'bg-[#FFF3D6]', icon: Wrench   },
    { label: 'Broken',      count: 3,   color: 'text-[#FF4747]', bg: 'bg-[#FFF0F0]', icon: AlertTriangle },
  ];

  // Charts
  revenueSeries = [{ name: 'Revenue (€)', data: MONTHLY_REVENUE.map(m => m.revenue) }];
  revenueChart  = { type: 'area' as const, height: 240, toolbar: { show: false }, zoom: { enabled: false } };
  revenueXaxis  = { categories: MONTHLY_REVENUE.map(m => m.month), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#A6A6A6', fontSize: '11px' } } };
  revenueYaxis  = { labels: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k`, style: { colors: '#A6A6A6', fontSize: '11px' } } };
  revenueStroke = { curve: 'smooth' as const, width: 3 };
  revenueFill   = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0, stops: [0, 95] } };
  revenueTooltip = { y: { formatter: (v: number) => `${v.toLocaleString('fr-BE')} €` } };

  last6 = MONTHLY_REVENUE.slice(-6);
  contractSeries     = [{ name: 'Contracts', data: this.last6.map(m => m.contracts) }];
  contractChart      = { type: 'bar' as const, height: 100, toolbar: { show: false }, zoom: { enabled: false } };
  contractXaxis      = { categories: this.last6.map(m => m.month), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#A6A6A6', fontSize: '10px' } } };
  contractYaxis      = { labels: { style: { colors: '#A6A6A6', fontSize: '10px' } } };
  contractPlotOptions = { bar: { borderRadius: 4, columnWidth: '60%' } };

  noDataLabels = { enabled: false };
  chartGrid    = { borderColor: '#F0F0F0', strokeDashArray: 3, xaxis: { lines: { show: false } } };

  absTrend(value: number): number {
    return Math.abs(value);
  }
}

