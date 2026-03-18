import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      // Membership
      { path: 'members', loadComponent: () => import('./pages/members/members.component').then(m => m.MembersComponent) },
      { path: 'members/:id', loadComponent: () => import('./pages/member-detail/member-detail.component').then(m => m.MemberDetailComponent) },
      { path: 'contracts', loadComponent: () => import('./pages/contracts/contracts.component').then(m => m.ContractsComponent) },
      { path: 'contracts/:id', loadComponent: () => import('./pages/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent) },
      { path: 'subscriptions/plans', loadComponent: () => import('./pages/plans/plans.component').then(m => m.PlansComponent) },
      // Operations
      { path: 'clubs', loadComponent: () => import('./pages/clubs/clubs.component').then(m => m.ClubsComponent) },
      { path: 'courses/schedule', loadComponent: () => import('./pages/schedule/schedule.component').then(m => m.ScheduleComponent) },
      { path: 'courses', loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent) },
      { path: 'access-control', loadComponent: () => import('./pages/access-control/access-control.component').then(m => m.AccessControlComponent) },
      { path: 'guests', loadComponent: () => import('./pages/guests/guests.component').then(m => m.GuestsComponent) },
      // Staff
      { path: 'employees/schedule', loadComponent: () => import('./pages/shifts-schedule/shifts-schedule.component').then(m => m.ShiftsScheduleComponent) },
      { path: 'employees', loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent) },
      { path: 'equipment', loadComponent: () => import('./pages/equipment/equipment.component').then(m => m.EquipmentComponent) },
      // Analytics
      { path: 'analytics/risk', loadComponent: () => import('./pages/analytics/risk/risk-analytics.component').then(m => m.RiskAnalyticsComponent) },
      { path: 'analytics/frequency', loadComponent: () => import('./pages/analytics/frequency/frequency-analytics.component').then(m => m.FrequencyAnalyticsComponent) },
      { path: 'analytics/options', loadComponent: () => import('./pages/analytics/options/options-analytics.component').then(m => m.OptionsAnalyticsComponent) },
      { path: 'analytics/health', loadComponent: () => import('./pages/analytics/health/health-analytics.component').then(m => m.HealthAnalyticsComponent) },
      // Billing
      { path: 'billing/invoices/:id', loadComponent: () => import('./pages/billing/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent) },
      { path: 'billing/invoices', loadComponent: () => import('./pages/billing/invoices/invoices.component').then(m => m.InvoicesComponent) },
      // Settings
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
      // Fallback
      { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
    ],
  },
];
