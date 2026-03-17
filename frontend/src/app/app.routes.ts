import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./pages/members/members.component').then((m) => m.MembersComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'billing', 'portique'] }
      },
      {
        path: 'members/:id',
        loadComponent: () => import('./pages/member-detail/member-detail.component').then((m) => m.MemberDetailComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'billing', 'portique'] }
      },
      {
        path: 'statistics',
        loadComponent: () => import('./pages/statistics/statistics.component').then((m) => m.StatisticsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'billing'] }
      },
      {
        path: 'exercises',
        loadComponent: () => import('./pages/exercises/exercises.component').then((m) => m.ExercisesComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'coach'] }
      },
      {
        path: 'schedule',
        loadComponent: () => import('./pages/schedule/schedule.component').then((m) => m.ScheduleComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'coach', 'portique'] }
      },
      { path: 'classes', redirectTo: 'schedule', pathMatch: 'full' },
      {
        path: 'classes/:id',
        loadComponent: () => import('./pages/class-details/class-details.component').then((m) => m.ClassDetailsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'coach', 'portique'] }
      },
      {
        path: 'trainers',
        loadComponent: () => import('./pages/trainers/trainers.component').then((m) => m.TrainersComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'manager'] }
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/employees/employees.component').then((m) => m.EmployeesComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'manager', 'portique'] }
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/messages/messages.component').then((m) => m.MessagesComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'billing',
        loadComponent: () => import('./pages/billing/billing.component').then((m) => m.BillingComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'billing', 'portique'] }
      },
      {
        path: 'equipment',
        loadComponent: () => import('./pages/equipment/equipment.component').then((m) => m.EquipmentComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'manager'] }
      },
      {
        path: 'access',
        loadComponent: () => import('./pages/access-control/access-control.component').then((m) => m.AccessControlComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'portique'] }
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./pages/subscriptions/subscriptions.component').then((m) => m.SubscriptionsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'billing'] }
      },
      {
        path: 'guests',
        loadComponent: () => import('./pages/guests/guests.component').then((m) => m.GuestsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'portique'] }
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'workout-tracker',
        loadComponent: () => import('./pages/workout-tracker/workout-tracker.component').then((m) => m.WorkoutTrackerComponent),
        canActivate: [roleGuard],
        data: { roles: ['coach', 'admin'] }
      },
      {
        path: 'meal-plan',
        loadComponent: () => import('./pages/meal-plan/meal-plan.component').then((m) => m.MealPlanComponent),
        canActivate: [roleGuard],
        data: { roles: ['coach', 'admin'] }
      },
      {
        path: 'meal-plan/:id',
        loadComponent: () => import('./pages/meal-details/meal-details.component').then((m) => m.MealDetailsComponent),
        canActivate: [roleGuard],
        data: { roles: ['coach', 'admin'] }
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
