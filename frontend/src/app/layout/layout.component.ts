import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { RoleService } from '../core/services/role.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  badge?: string;
  roles?: string[];
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
export class LayoutComponent implements OnInit {
  sidebarOpen = true;
  profileOpen = false;
  visibleNavGroups: NavGroup[] = [];

  private readonly allNavGroups: NavGroup[] = [
    {
      title: 'Core',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
        { path: '/members', label: 'Members', icon: '🙋', roles: ['admin', 'billing', 'portique', 'dpo'] },
        { path: '/statistics', label: 'Statistics', icon: '📈', roles: ['admin', 'billing'] },
        { path: '/messages', label: 'Messages', icon: '💬', badge: '!' }
      ]
    },
    {
      title: 'Operations',
      items: [
        { path: '/exercises', label: 'Exercises', icon: '🏋️', roles: ['admin'] },
        { path: '/schedule', label: 'Schedule', icon: '🗓️', roles: ['admin', 'billing', 'portique'] },
        { path: '/subscriptions', label: 'Plans', icon: '🧾', roles: ['admin', 'billing'] },
        { path: '/billing', label: 'Billing', icon: '💳', roles: ['admin', 'billing', 'portique'] },
        { path: '/employees', label: 'Employees', icon: '🧑‍💼', roles: ['admin', 'billing', 'portique'] },
        { path: '/equipment', label: 'Equipment', icon: '🛠️', roles: ['admin'] },
        { path: '/access', label: 'Access', icon: '🛂', roles: ['admin', 'portique'] },
        { path: '/guests', label: 'Guests', icon: '🎫', roles: ['admin', 'portique'] },
        { path: '/workout-tracker', label: 'Workout', icon: '📍' },
        { path: '/meal-plan', label: 'Meal Plan', icon: '🍽️' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { path: '/reports', label: 'Reports', icon: '📑', roles: ['admin', 'billing', 'dpo'] },
        { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] }
      ]
    }
  ];

  constructor(private auth: AuthService, private router: Router, private role: RoleService) {}

  ngOnInit(): void {
    this.buildVisibleNav();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-wrapper')) {
      this.profileOpen = false;
    }
  }

  private buildVisibleNav(): void {
    const userRoles = this.role.getRoles();
    if (userRoles.length === 0) {
      this.visibleNavGroups = this.allNavGroups;
      return;
    }
    this.visibleNavGroups = this.allNavGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => !item.roles || this.role.hasAnyRole(item.roles))
      }))
      .filter(group => group.items.length > 0);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }

  navigateTo(path: string): void {
    this.profileOpen = false;
    this.router.navigate([path]);
  }

  logout(): void {
    this.profileOpen = false;
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  get currentRoles(): string[] {
    return this.role.getRoles();
  }

  get currentRoleLabel(): string {
    const roles = this.role.getRoles();
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('billing')) return 'Billing';
    if (roles.includes('portique')) return 'Receptionist';
    if (roles.includes('dpo')) return 'DPO';
    return 'Staff';
  }
}
