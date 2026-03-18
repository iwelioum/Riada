import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';

interface KPICard {
  label: string;
  value: string;
  trend: number;
  icon: string;
  color: string;
  subtext: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  template: `
    <div class="flex flex-col h-full overflow-y-auto bg-background">
      <div class="p-8 flex flex-col gap-8">
        <!-- Header -->
        <div>
          <h1 class="text-3xl font-black text-neutral-900">Dashboard</h1>
          <p class="text-sm text-neutral-500 mt-1">{{ currentDate | date: 'EEEE, d MMMM y' }}</p>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let kpi of kpiCards" class="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                [ngClass]="'bg-' + kpi.color + '-50'">
                {{ kpi.icon }}
              </div>
              <span class="text-xs font-bold"
                [ngClass]="kpi.trend >= 0 ? 'text-success' : 'text-danger'">
                {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}%
              </span>
            </div>
            <p class="text-2xl font-black text-neutral-900">{{ kpi.value }}</p>
            <p class="text-sm font-semibold text-neutral-600 mt-1">{{ kpi.label }}</p>
            <p class="text-xs text-neutral-500 mt-2">{{ kpi.subtext }}</p>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Revenue Chart -->
          <div class="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div class="mb-6">
              <h2 class="text-lg font-bold text-neutral-900">Monthly Revenue</h2>
              <p class="text-sm text-neutral-500">Last 12 months performance</p>
            </div>
            <div class="h-64 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
              📊 Chart placeholder (use Recharts)
            </div>
          </div>

          <!-- Member Status -->
          <div class="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div class="mb-6">
              <h2 class="text-lg font-bold text-neutral-900">Member Status</h2>
              <p class="text-sm text-neutral-500">859 total members</p>
            </div>
            <div class="h-64 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
              📈 Status chart
            </div>
          </div>
        </div>

        <!-- Data Tables -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Recent Access -->
          <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div class="p-6 border-b border-border flex items-center justify-between">
              <h2 class="text-lg font-bold text-neutral-900">Recent Access</h2>
              <a href="#" class="text-xs text-primary font-semibold hover:underline">View all</a>
            </div>
            <div class="divide-y divide-border">
              <div *ngFor="let access of recentAccess" class="p-4 hover:bg-neutral-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-neutral-900 truncate">{{ access.memberName }}</p>
                    <p class="text-xs text-neutral-500">{{ access.club }}</p>
                  </div>
                  <app-badge [variant]="access.result === 'Granted' ? 'success' : 'danger'" size="sm">
                    {{ access.result }}
                  </app-badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Today's Sessions -->
          <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div class="p-6 border-b border-border flex items-center justify-between">
              <h2 class="text-lg font-bold text-neutral-900">Today's Sessions</h2>
              <a href="#" class="text-xs text-primary font-semibold hover:underline">Schedule</a>
            </div>
            <div class="divide-y divide-border">
              <div *ngFor="let session of todaySessions" class="p-4 hover:bg-neutral-50 transition-colors">
                <p class="text-sm font-semibold text-neutral-900">{{ session.course }}</p>
                <p class="text-xs text-neutral-500 mt-1">{{ session.instructor }} • {{ session.time }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <div class="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div class="h-full bg-primary" [style.width.%]="(session.enrolled / session.capacity) * 100"></div>
                  </div>
                  <span class="text-xs font-bold text-neutral-600">{{ session.enrolled }}/{{ session.capacity }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Equipment Status -->
          <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div class="p-6 border-b border-border flex items-center justify-between">
              <h2 class="text-lg font-bold text-neutral-900">Equipment</h2>
              <a href="#" class="text-xs text-primary font-semibold hover:underline">View all</a>
            </div>
            <div class="p-6 space-y-4">
              <div *ngFor="let equipment of equipmentStatus" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ equipment.icon }}</span>
                  <span class="text-sm font-medium text-neutral-700">{{ equipment.label }}</span>
                </div>
                <span class="text-lg font-black" [ngClass]="'text-' + equipment.color">
                  {{ equipment.count }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardPageComponent implements OnInit {
  currentDate = new Date();

  kpiCards: KPICard[] = [
    {
      label: 'Active Members',
      value: '782',
      trend: 5.2,
      icon: '👥',
      color: 'primary',
      subtext: 'out of 859 total',
    },
    {
      label: 'Active Contracts',
      value: '651',
      trend: 2.1,
      icon: '📄',
      color: 'success',
      subtext: '23 expiring soon',
    },
    {
      label: 'Revenue',
      value: '€38.4K',
      trend: 6.2,
      icon: '💶',
      color: 'purple',
      subtext: 'from 651 invoices',
    },
    {
      label: 'Overdue',
      value: '18',
      trend: -3,
      icon: '⚠️',
      color: 'danger',
      subtext: '€2,847 outstanding',
    },
  ];

  recentAccess = [
    { memberName: 'Jean Dupont', club: 'Brussels', result: 'Granted' },
    { memberName: 'Clara Morin', club: 'Brussels', result: 'Denied' },
    { memberName: 'Pierre Dumont', club: 'Brussels', result: 'Denied' },
    { memberName: 'Sophie Leroy', club: 'Brussels', result: 'Granted' },
  ];

  todaySessions = [
    { course: 'Power Yoga', instructor: 'M. Laurent', time: '14:00', capacity: 20, enrolled: 18 },
    { course: 'HIIT Cardio', instructor: 'R. Moreau', time: '15:30', capacity: 15, enrolled: 15 },
    { course: 'Pilates', instructor: 'S. Dupuis', time: '17:00', capacity: 12, enrolled: 7 },
  ];

  equipmentStatus = [
    { label: 'In Service', count: 142, icon: '⚙️', color: 'success' },
    { label: 'Maintenance', count: 8, icon: '🔧', color: 'warning' },
    { label: 'Broken', count: 3, icon: '❌', color: 'danger' },
  ];

  ngOnInit(): void {
    // Load dashboard data from API
  }
}
