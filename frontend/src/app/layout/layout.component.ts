import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  sidebarOpen = true;

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/members', label: 'Members', icon: '🙋' },
    { path: '/statistics', label: 'Statistics', icon: '📈' },
    { path: '/exercises', label: 'Exercises', icon: '🏋️' },
    { path: '/schedule', label: 'Schedule', icon: '🗓️' },
    { path: '/classes', label: 'Classes', icon: '🎓' },
    { path: '/trainers', label: 'Trainers', icon: '🧑‍🏫' },
    { path: '/subscriptions', label: 'Plans', icon: '🧾' },
    { path: '/billing', label: 'Billing', icon: '💳' },
    { path: '/equipment', label: 'Equipment', icon: '🛠️' },
    { path: '/access', label: 'Access', icon: '🛂' },
    { path: '/guests', label: 'Guests', icon: '🎫' },
    { path: '/messages', label: 'Messages', icon: '💬', badge: '!' },
    { path: '/workout-tracker', label: 'Workout', icon: '📍' },
    { path: '/meal-plan', label: 'Meal Plan', icon: '🍽️' }
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
