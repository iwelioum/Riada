import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
      },

      // Membership
      {
        path: 'members',
        loadComponent: () => import('./pages/members/members-page.component').then((m) => m.MembersPageComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Manager', 'Reception'] },
      },
      {
        path: 'members/:id',
        loadComponent: () => import('./pages/member-detail/member-detail.component').then((m) => m.MemberDetailComponent),
      },
      {
        path: 'contracts',
        loadComponent: () => import('./pages/contracts/contracts-page.component').then((m) => m.ContractsPageComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Manager'] },
      },
      {
        path: 'contracts/:id',
        loadComponent: () => import('./pages/contracts/contract-detail.component').then((m) => m.ContractDetailComponent),
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./pages/subscriptions/subscriptions.component').then((m) => m.SubscriptionsComponent),
      },

      // Operations
      {
        path: 'clubs',
        loadComponent: () => import('./pages/clubs/clubs-page.component').then((m) => m.ClubsPageComponent),
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/courses/courses-page.component').then((m) => m.CoursesPageComponent),
      },
      {
        path: 'schedule',
        loadComponent: () => import('./pages/schedule/schedule.component').then((m) => m.ScheduleComponent),
      },
      {
        path: 'access-control',
        loadComponent: () => import('./pages/access-control/access-control.component').then((m) => m.AccessControlComponent),
      },
      {
        path: 'guests',
        loadComponent: () => import('./pages/guests/guests.component').then((m) => m.GuestsComponent),
      },

      // Staff
      {
        path: 'employees',
        loadComponent: () => import('./pages/employees/employees-page.component').then((m) => m.EmployeesPageComponent),
      },
      {
        path: 'shifts',
        loadComponent: () => import('./pages/shifts-schedule/shifts-schedule.component').then((m) => m.ShiftsScheduleComponent),
      },
      {
        path: 'equipment',
        loadComponent: () => import('./pages/equipment/equipment-page.component').then((m) => m.EquipmentPageComponent),
      },

      // Analytics
      {
        path: 'analytics/risk',
        loadComponent: () => import('./pages/analytics/risk-analytics.component').then((m) => m.RiskAnalyticsComponent),
      },
      {
        path: 'analytics/frequency',
        loadComponent: () => import('./pages/analytics/frequency-analytics.component').then((m) => m.FrequencyAnalyticsComponent),
      },
      {
        path: 'analytics/options',
        loadComponent: () => import('./pages/analytics/options-analytics.component').then((m) => m.OptionsAnalyticsComponent),
      },
      {
        path: 'analytics/health',
        loadComponent: () => import('./pages/analytics/health-analytics.component').then((m) => m.HealthAnalyticsComponent),
      },

      // Billing
      {
        path: 'billing/invoices',
        loadComponent: () => import('./pages/billing/billing-invoices-page.component').then((m) => m.BillingInvoicesPageComponent),
      },
      {
        path: 'billing/invoices/:id',
        loadComponent: () => import('./pages/billing/invoice-detail.component').then((m) => m.InvoiceDetailComponent),
      },

      // Settings
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },

      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
