import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  sidebarOpen = true;

  readonly navGroups: NavGroup[] = [
    {
      title: 'Core',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
        { path: '/members', label: 'Members', icon: '🙋' },
        { path: '/statistics', label: 'Statistics', icon: '📈' },
        { path: '/messages', label: 'Messages', icon: '💬', badge: '!' }
      ]
    },
    {
      title: 'Operations',
      items: [
        { path: '/exercises', label: 'Exercises', icon: '🏋️' },
        { path: '/schedule', label: 'Schedule', icon: '🗓️' },
        { path: '/classes', label: 'Classes', icon: '🎓' },
        { path: '/trainers', label: 'Trainers', icon: '🧑‍🏫' },
        { path: '/subscriptions', label: 'Plans', icon: '🧾' },
        { path: '/billing', label: 'Billing', icon: '💳' },
        { path: '/equipment', label: 'Equipment', icon: '🛠️' },
        { path: '/access', label: 'Access', icon: '🛂' },
        { path: '/guests', label: 'Guests', icon: '🎫' },
        { path: '/workout-tracker', label: 'Workout', icon: '📍' },
        { path: '/meal-plan', label: 'Meal Plan', icon: '🍽️' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { path: '/reports', label: 'Reports', icon: '📑' },
        { path: '/settings', label: 'Settings', icon: '⚙️' }
      ]
    }
  ];

  constructor(private auth: AuthService, private router: Router) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
