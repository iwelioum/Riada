import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'members',
    loadComponent: () => import('./pages/members/members.component').then((m) => m.MembersComponent)
  },
  {
    path: 'statistics',
    loadComponent: () => import('./pages/statistics/statistics.component').then((m) => m.StatisticsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.component').then((m) => m.ReportsComponent)
  },
  {
    path: 'exercises',
    loadComponent: () => import('./pages/exercises/exercises.component').then((m) => m.ExercisesComponent)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./pages/schedule/schedule.component').then((m) => m.ScheduleComponent)
  },
  {
    path: 'classes',
    loadComponent: () => import('./pages/classes/classes.component').then((m) => m.ClassesComponent)
  },
  {
    path: 'classes/:id',
    loadComponent: () => import('./pages/class-details/class-details.component').then((m) => m.ClassDetailsComponent)
  },
  {
    path: 'trainers',
    loadComponent: () => import('./pages/trainers/trainers.component').then((m) => m.TrainersComponent)
  },
  {
    path: 'messages',
    loadComponent: () => import('./pages/messages/messages.component').then((m) => m.MessagesComponent)
  },
  {
    path: 'billing',
    loadComponent: () => import('./pages/billing/billing.component').then((m) => m.BillingComponent)
  },
  {
    path: 'equipment',
    loadComponent: () => import('./pages/equipment/equipment.component').then((m) => m.EquipmentComponent)
  },
  {
    path: 'access',
    loadComponent: () => import('./pages/access-control/access-control.component').then((m) => m.AccessControlComponent)
  },
  {
    path: 'subscriptions',
    loadComponent: () => import('./pages/subscriptions/subscriptions.component').then((m) => m.SubscriptionsComponent)
  },
  {
    path: 'guests',
    loadComponent: () => import('./pages/guests/guests.component').then((m) => m.GuestsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent)
  },
  {
    path: 'admin',
    children: [
      { path: 'reports', redirectTo: '/reports', pathMatch: 'full' },
      { path: 'settings', redirectTo: '/settings', pathMatch: 'full' }
    ]
  },
  {
    path: 'communication',
    children: [{ path: 'messages', redirectTo: '/messages', pathMatch: 'full' }]
  },
  {
    path: 'workout-tracker',
    loadComponent: () => import('./pages/workout-tracker/workout-tracker.component').then((m) => m.WorkoutTrackerComponent)
  },
  {
    path: 'meal-plan',
    loadComponent: () => import('./pages/meal-plan/meal-plan.component').then((m) => m.MealPlanComponent)
  },
  {
    path: 'meal-plan/:id',
    loadComponent: () => import('./pages/meal-details/meal-details.component').then((m) => m.MealDetailsComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
