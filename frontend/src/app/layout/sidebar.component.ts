import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { RoleService } from '../core/services/role.service';

interface NavSection {
  label: string;
  links: NavLink[];
}

interface NavLink {
  name: string;
  path: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      <!-- Logo -->
      <div class="px-6 py-6 border-b border-border">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
            ℝ
          </div>
          <span class="text-xl font-black text-primary">Riada</span>
          <span class="text-xs font-bold px-2 py-1 bg-primary-50 text-primary rounded uppercase tracking-wide">
            Admin
          </span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 py-6">
        <div *ngFor="let section of navSections">
          <p class="px-3 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
            {{ section.label }}
          </p>
          <ul class="space-y-1 mb-6">
            <li *ngFor="let link of section.links">
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-primary text-white shadow-lg"
                [routerLinkActiveOptions]="{ exact: false }"
                class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-primary transition-all duration-200"
              >
                <span class="text-lg">{{ link.icon }}</span>
                <span>{{ link.name }}</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Bottom Actions -->
      <div class="border-t border-border p-3 space-y-1">
        <a
          routerLink="/settings"
          routerLinkActive="bg-primary text-white"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-primary transition-all duration-200"
        >
          <span class="text-lg">⚙</span>
          <span>Settings</span>
        </a>
        <button
          (click)="logout()"
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-50 transition-all duration-200"
        >
          <span class="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent implements OnInit {
  currentRole = '';

  navSections: NavSection[] = [
    {
      label: 'Main',
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
      ],
    },
    {
      label: 'Membership',
      links: [
        { name: 'Members', path: '/members', icon: '👥' },
        { name: 'Contracts', path: '/contracts', icon: '📄' },
        { name: 'Subscription Plans', path: '/subscriptions', icon: '💳' },
      ],
    },
    {
      label: 'Operations',
      links: [
        { name: 'Clubs', path: '/clubs', icon: '🏢' },
        { name: 'Courses', path: '/courses', icon: '📚' },
        { name: 'Course Schedule', path: '/schedule', icon: '📅' },
        { name: 'Access Control', path: '/access-control', icon: '🔐' },
        { name: 'Guests', path: '/guests', icon: '🎫' },
      ],
    },
    {
      label: 'Staff',
      links: [
        { name: 'Employees', path: '/employees', icon: '👔' },
        { name: 'Shifts', path: '/shifts', icon: '⏰' },
        { name: 'Equipment', path: '/equipment', icon: '🔧' },
      ],
    },
    {
      label: 'Analytics',
      links: [
        { name: 'Risk Analysis', path: '/analytics/risk', icon: '⚠️' },
        { name: 'Frequency', path: '/analytics/frequency', icon: '📈' },
        { name: 'Options', path: '/analytics/options', icon: '🎯' },
        { name: 'Health', path: '/analytics/health', icon: '❤️' },
      ],
    },
    {
      label: 'Billing',
      links: [
        { name: 'Invoices', path: '/billing/invoices', icon: '🧾' },
      ],
    },
  ];

  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentRole = this.roleService.getCurrentRole();
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
