import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="h-20 bg-card border-b border-border flex items-center justify-between px-8 ml-64 sticky top-0 z-40">
      <!-- Search Bar -->
      <div class="flex-1 max-w-md">
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search members, contracts..."
            [(ngModel)]="searchQuery"
            class="w-full pl-10 pr-4 py-2.5 bg-neutral-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-neutral-400"
          />
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-6 ml-8">
        <!-- Notifications -->
        <div class="relative">
          <button
            (click)="toggleNotifications()"
            class="relative p-2 text-primary hover:bg-neutral-50 rounded-full transition-colors"
          >
            <span class="text-2xl">🔔</span>
            <span
              *ngIf="notificationCount > 0"
              class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-danger rounded-full"
            >
              {{ notificationCount }}
            </span>
          </button>

          <div *ngIf="notificationsOpen" class="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl shadow-lg border border-border p-0 z-50">
            <div class="p-4 border-b border-border">
              <h3 class="font-semibold text-neutral-900">Notifications</h3>
            </div>
            <div class="max-h-96 overflow-y-auto divide-y divide-border">
              <div
                *ngFor="let notif of notifications"
                class="p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <p class="text-sm font-medium text-neutral-900">{{ notif.title }}</p>
                <p class="text-xs text-neutral-500 mt-1">{{ notif.message }}</p>
              </div>
            </div>
            <div class="p-4 border-t border-border text-center text-sm text-primary font-medium cursor-pointer hover:bg-neutral-50">
              View all
            </div>
          </div>
        </div>

        <!-- Profile -->
        <div class="relative">
          <button
            (click)="toggleProfile()"
            class="flex items-center gap-3 hover:opacity-80 py-2 group"
          >
            <img
              [src]="userAvatar"
              alt="User"
              class="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all"
            />
            <div class="text-left">
              <p class="text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors">
                {{ userName }}
              </p>
              <p class="text-xs text-neutral-500">{{ userRole }}</p>
            </div>
          </button>

          <div *ngIf="profileOpen" class="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl shadow-lg border border-border py-2 z-50">
            <a href="#" class="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              👤 My Profile
            </a>
            <a href="#" class="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              🔑 Change Password
            </a>
            <a href="#" class="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              📋 Activity Log
            </a>
            <div class="border-t border-border my-2"></div>
            <button
              (click)="logout()"
              class="w-full text-left px-4 py-2 text-sm font-medium text-danger hover:bg-danger-50 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  searchQuery = '';
  notificationsOpen = false;
  profileOpen = false;
  notificationCount = 6;
  userName = 'Moni Roy';
  userRole = 'Manager';
  userAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

  notifications = [
    { title: 'Overdue invoices', message: '3 members have unpaid balances' },
    { title: 'New member registered', message: 'Jean Dupont joined Brussels' },
    { title: 'Equipment alert', message: 'Treadmill #4 needs maintenance' },
    { title: 'System update', message: 'Dashboard updated successfully' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load user data from auth service
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    this.profileOpen = false;
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    this.notificationsOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
