import { Component, signal, inject, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideAngularModule,
  Search, Bell, ChevronDown, User, Key, RotateCcw, LogOut,
  Settings, Calendar, AlertCircle, Check, X,
  LayoutDashboard, Users, FileText, CreditCard, Building2,
  BookOpen, CalendarDays, ShieldCheck, UserPlus, UserCog,
  CalendarRange, Wrench, ShieldAlert, BarChart2, PieChart,
  HeartPulse, Receipt,
} from 'lucide-angular';

interface NavLink { name: string; path: string; icon: any; exact?: boolean; }
interface NavSection { label: string; links: NavLink[]; }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LucideAngularModule],
  template: `
<div class="flex min-h-screen bg-[#F5F6FA] text-[#202224]">

  <!-- Sidebar -->
  <aside class="w-[240px] flex-shrink-0 bg-white border-r border-[#E0E0E0] flex flex-col pt-7 pb-4">
    <div class="px-6 mb-8">
      <a routerLink="/" class="flex items-center gap-2">
        <span class="text-2xl font-black tracking-tight text-[#4880FF]">Riada</span>
        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EBEBFF] text-[#4880FF] uppercase tracking-wide">Admin</span>
      </a>
    </div>

    <div class="flex-1 overflow-y-auto flex flex-col gap-5 pr-0">
      @for (section of navSections; track section.label) {
        <div>
          <p class="px-6 mb-1.5 text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest">{{ section.label }}</p>
          <nav class="flex flex-col gap-0.5">
            @for (link of section.links; track link.path) {
              <a [routerLink]="link.path"
                [class]="isActive(link.path, link.exact)
                  ? 'flex items-center gap-3 pl-6 pr-4 py-2.5 rounded-r-lg text-[14px] font-medium mr-5 bg-[#4880FF] text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] translate-x-1 transition-all duration-200'
                  : 'flex items-center gap-3 pr-4 py-2.5 rounded-lg text-[14px] font-medium mr-5 ml-3 pl-3 text-[#505050] hover:bg-[#F0F4FF] hover:text-[#4880FF] hover:translate-x-0.5 transition-all duration-200'">
                <lucide-icon [img]="link.icon" [size]="16" class="shrink-0"></lucide-icon>
                {{ link.name }}
              </a>
            }
          </nav>
        </div>
      }
    </div>

    <!-- Bottom actions -->
    <div class="mt-4 pt-4 border-t border-[#F0F0F0] flex flex-col gap-0.5">
      <a routerLink="/settings"
        [class]="isActive('/settings', true)
          ? 'flex items-center gap-3 pl-6 pr-4 py-2.5 rounded-r-lg text-[14px] font-medium mr-5 bg-[#4880FF] text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] transition-all duration-200'
          : 'flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-lg text-[14px] font-medium mr-5 ml-3 text-[#505050] hover:bg-[#F0F4FF] hover:text-[#4880FF] transition-all duration-200'">
        <lucide-icon [img]="SettingsIcon" [size]="16" class="shrink-0"></lucide-icon>
        Settings
      </a>
      <a routerLink="/login" class="flex items-center gap-3 ml-3 pl-3 pr-4 py-2.5 mr-5 rounded-lg text-[14px] font-medium text-[#505050] hover:bg-[#FFF0F0] hover:text-[#EF3826] transition-all duration-200">
        <lucide-icon [img]="LogOutIcon" [size]="16" class="shrink-0"></lucide-icon>
        Logout
      </a>
    </div>
  </aside>

  <!-- Main -->
  <main class="flex-1 flex flex-col min-w-0">

    <!-- Header -->
    <header class="h-[70px] bg-white border-b border-[#E0E0E0] flex items-center justify-between px-8 flex-shrink-0">
      <div class="flex-1 max-w-[400px]">
        <div class="relative">
          <lucide-icon [img]="SearchIcon" [size]="18" class="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#A6A6A6]"></lucide-icon>
          <input type="text" placeholder="Search"
            class="w-full pl-[46px] pr-4 py-2.5 bg-[#F5F6FA] border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#4880FF] text-[#202224] placeholder-[#A6A6A6]" />
        </div>
      </div>

      <div class="flex items-center space-x-6">

        <!-- Notifications -->
        <div class="relative" (click)="$event.stopPropagation()">
          <button (click)="toggleDropdown('notifications')" class="relative p-2 text-[#4880FF] hover:bg-gray-50 rounded-full transition-colors">
            <lucide-icon [img]="BellIcon" [size]="24" class="fill-current"></lucide-icon>
            <span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4747] text-[10px] font-bold text-white border-2 border-white">6</span>
          </button>
          @if (notificationsOpen()) {
            <div class="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E0E0E0] overflow-hidden z-50">
              <div class="px-6 py-4 border-b border-[#F0F0F0]">
                <h3 class="text-[15px] font-semibold text-[#202224]">Notifications</h3>
              </div>
              <div class="flex flex-col py-2">
                @for (n of notifications; track n.title) {
                  <div class="flex items-center px-6 py-3 hover:bg-[#F8FAFF] cursor-pointer transition-colors">
                    <div [class]="'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 ' + n.bg">
                      <lucide-icon [img]="n.icon" [size]="18" [class]="n.color"></lucide-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[13px] font-semibold text-[#202224]">{{ n.title }}</p>
                      <p class="text-[12px] text-[#A6A6A6] truncate">{{ n.sub }}</p>
                    </div>
                  </div>
                }
              </div>
              <div class="py-3 border-t border-[#F0F0F0] text-center bg-white cursor-pointer hover:bg-[#F8FAFF] transition-colors">
                <span class="text-[13px] font-semibold text-[#4880FF]">View all notifications</span>
              </div>
            </div>
          }
        </div>

        <!-- Language -->
        <div class="relative" (click)="$event.stopPropagation()">
          <div class="flex items-center space-x-2 cursor-pointer hover:opacity-80 py-2 group" (click)="toggleDropdown('language')">
            <img src="https://flagcdn.com/w40/gb.png" alt="UK" class="w-[30px] h-[20px] rounded-sm shadow-sm object-cover" />
            <span class="text-sm font-semibold text-[#646464] group-hover:text-[#4880FF] transition-colors">English</span>
            <lucide-icon [img]="ChevronDownIcon" [size]="14" class="text-[#646464]"></lucide-icon>
          </div>
          @if (languageOpen()) {
            <div class="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E0E0E0] py-3 z-50">
              <p class="px-5 pb-2 text-[11px] font-bold text-[#A6A6A6] uppercase tracking-wider">Language</p>
              @for (lang of languages; track lang.code) {
                <div class="flex items-center justify-between px-5 py-2.5 hover:bg-[#F8FAFF] cursor-pointer transition-colors">
                  <div class="flex items-center gap-3">
                    <img [src]="'https://flagcdn.com/w40/' + lang.code + '.png'" [alt]="lang.label" class="w-[28px] h-[18px] rounded-sm shadow-sm object-cover" />
                    <span class="text-[13px] font-medium text-[#202224]">{{ lang.label }}</span>
                  </div>
                  @if (lang.active) {
                    <lucide-icon [img]="CheckIcon" [size]="16" class="text-[#4880FF]"></lucide-icon>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Profile -->
        <div class="relative" (click)="$event.stopPropagation()">
          <div class="flex items-center space-x-3 cursor-pointer hover:opacity-80 py-2 group" (click)="toggleDropdown('profile')">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar"
              class="w-[44px] h-[44px] rounded-full object-cover border-2 border-transparent group-hover:border-[#4880FF] transition-all shadow-sm" />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-[#404040]">Moni Roy</span>
              <span class="text-[12px] font-medium text-[#828282]">Manager</span>
            </div>
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-[#E0E0E0]">
              <lucide-icon [img]="ChevronDownIcon" [size]="12" class="text-[#A6A6A6]"></lucide-icon>
            </div>
          </div>
          @if (profileOpen()) {
            <div class="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E0E0E0] py-3 z-50">
              <a routerLink="/settings" class="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFF] transition-all">
                <lucide-icon [img]="UserIcon" [size]="16" class="text-[#4880FF]"></lucide-icon>
                <span class="text-[13px] font-medium text-[#202224]">My Profile</span>
              </a>
              <a routerLink="/settings" class="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFF] transition-all">
                <lucide-icon [img]="KeyIcon" [size]="16" class="text-[#FF479A]"></lucide-icon>
                <span class="text-[13px] font-medium text-[#202224]">Change Password</span>
              </a>
              <a routerLink="/settings" class="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFF] transition-all">
                <lucide-icon [img]="RotateCcwIcon" [size]="16" class="text-[#B548C6]"></lucide-icon>
                <span class="text-[13px] font-medium text-[#202224]">Activity Log</span>
              </a>
              <div class="w-full h-px bg-[#F0F0F0] my-1"></div>
              <a routerLink="/login" class="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FFF0F0] transition-all">
                <lucide-icon [img]="LogOutIcon" [size]="16" class="text-[#EF3826]"></lucide-icon>
                <span class="text-[13px] font-medium text-[#202224]">Log out</span>
              </a>
            </div>
          }
        </div>

      </div>
    </header>

    <!-- Page Content -->
    <div class="flex-1 overflow-hidden">
      <router-outlet />
    </div>

  </main>
</div>
  `,
})
export class LayoutComponent {
  private router = inject(Router);

  profileOpen = signal(false);
  languageOpen = signal(false);
  notificationsOpen = signal(false);

  // Icon refs
  readonly SearchIcon = Search;
  readonly BellIcon = Bell;
  readonly ChevronDownIcon = ChevronDown;
  readonly UserIcon = User;
  readonly KeyIcon = Key;
  readonly RotateCcwIcon = RotateCcw;
  readonly LogOutIcon = LogOut;
  readonly SettingsIcon = Settings;
  readonly CheckIcon = Check;

  navSections: NavSection[] = [
    {
      label: 'Main',
      links: [{ name: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true }],
    },
    {
      label: 'Membership',
      links: [
        { name: 'Members', path: '/members', icon: Users },
        { name: 'Contracts', path: '/contracts', icon: FileText },
        { name: 'Plans', path: '/subscriptions/plans', icon: CreditCard },
      ],
    },
    {
      label: 'Operations',
      links: [
        { name: 'Clubs', path: '/clubs', icon: Building2 },
        { name: 'Courses', path: '/courses', icon: BookOpen, exact: true },
        { name: 'Schedule', path: '/courses/schedule', icon: CalendarDays },
        { name: 'Access Control', path: '/access-control', icon: ShieldCheck },
        { name: 'Guests', path: '/guests', icon: UserPlus },
      ],
    },
    {
      label: 'Staff',
      links: [
        { name: 'Employees', path: '/employees', icon: UserCog, exact: true },
        { name: 'Shift Schedule', path: '/employees/schedule', icon: CalendarRange },
        { name: 'Equipment', path: '/equipment', icon: Wrench },
      ],
    },
    {
      label: 'Analytics',
      links: [
        { name: 'Risk Scores', path: '/analytics/risk', icon: ShieldAlert },
        { name: 'Frequency', path: '/analytics/frequency', icon: BarChart2 },
        { name: 'Options', path: '/analytics/options', icon: PieChart },
        { name: 'Health', path: '/analytics/health', icon: HeartPulse },
      ],
    },
    {
      label: 'Billing',
      links: [{ name: 'Invoices', path: '/billing/invoices', icon: Receipt }],
    },
  ];

  notifications = [
    { icon: ShieldAlert, bg: 'bg-[#FFF0F0]', color: 'text-[#FF4747]', title: 'Overdue invoices', sub: '3 members have unpaid balances' },
    { icon: UserPlus,   bg: 'bg-[#E0F8EA]', color: 'text-[#00B69B]', title: 'New member registered', sub: 'Jean Dupont joined Brussels' },
    { icon: Wrench,     bg: 'bg-[#FFF3D6]', color: 'text-[#FF9066]', title: 'Equipment alert', sub: 'Treadmill #4 needs maintenance' },
    { icon: Settings,   bg: 'bg-[#EBEBFF]', color: 'text-[#4880FF]', title: 'System update', sub: 'Dashboard updated successfully' },
  ];

  languages = [
    { code: 'gb', label: 'English', active: true },
    { code: 'fr', label: 'French', active: false },
    { code: 'nl', label: 'Dutch', active: false },
  ];

  isActive(path: string, exact = false): boolean {
    const url = this.router.url.split('?')[0];
    if (exact) return url === path;
    if (path === '/') return url === '/';
    return url === path || url.startsWith(path + '/');
  }

  toggleDropdown(which: 'profile' | 'language' | 'notifications') {
    const wasOpen = which === 'profile' ? this.profileOpen() : which === 'language' ? this.languageOpen() : this.notificationsOpen();
    this.profileOpen.set(false);
    this.languageOpen.set(false);
    this.notificationsOpen.set(false);
    if (!wasOpen) {
      if (which === 'profile') this.profileOpen.set(true);
      else if (which === 'language') this.languageOpen.set(true);
      else this.notificationsOpen.set(true);
    }
  }

  @HostListener('document:click')
  closeAll() {
    this.profileOpen.set(false);
    this.languageOpen.set(false);
    this.notificationsOpen.set(false);
  }
}

