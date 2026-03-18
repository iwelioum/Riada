import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { TableComponent, TableColumn, TableRow } from '../../shared/components/ui/table.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';
import { ModalComponent } from '../../shared/components/ui/modal.component';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    TableComponent,
    BadgeComponent,
    ModalComponent,
  ],
  template: `
    <div class="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-black text-neutral-900 flex items-center gap-2">
            👥 Members
            <span class="text-lg text-neutral-500 font-medium">({{ totalMembers }} members)</span>
          </h1>
          <p class="text-sm text-neutral-500 mt-2">Manage your members and their subscriptions</p>
        </div>
        <app-button variant="primary" size="lg" (clicked)="openAddModal()">
          ➕ Add Member
        </app-button>
      </div>

      <!-- Filters -->
      <app-card class="mb-6">
        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <app-input
              label="Search"
              placeholder="Search by name, email, phone..."
              [(ngModel)]="searchQuery"
            ></app-input>
          </div>
          <select
            [(ngModel)]="statusFilter"
            class="px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
            <option value="Anonymized">Anonymized</option>
          </select>
          <app-button variant="ghost" (clicked)="resetFilters()">🔄 Reset</app-button>
        </div>
      </app-card>

      <!-- Table -->
      <app-card class="flex-1">
        <app-table
          [columns]="tableColumns"
          [rows]="members"
          [currentPage]="currentPage"
          [totalPages]="totalPages"
          [totalRows]="totalMembers"
          (pageChange)="currentPage = $event"
        ></app-table>
      </app-card>
    </div>

    <!-- Add Member Modal -->
    <app-modal
      [isOpen]="showAddModal"
      title="Add New Member"
      confirmLabel="Create Member"
      (confirmed)="createMember()"
      (closed)="showAddModal = false"
    >
      <div class="space-y-4">
        <app-input label="First Name" placeholder="Jean" [(ngModel)]="newMember.firstName"></app-input>
        <app-input label="Last Name" placeholder="Dupont" [(ngModel)]="newMember.lastName"></app-input>
        <app-input label="Email" type="email" placeholder="jean&#64;example.com" [(ngModel)]="newMember.email"></app-input>
        <app-input label="Phone" type="tel" placeholder="+32 471 12 34 56" [(ngModel)]="newMember.phone"></app-input>
        <select class="w-full px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary">
          <option>Select Subscription Plan</option>
          <option value="basic">Basic - €15/month</option>
          <option value="premium">Premium - €30/month</option>
          <option value="vip">VIP - €50/month</option>
        </select>
      </div>
    </app-modal>
  `,
})
export class MembersPageComponent implements OnInit {
  searchQuery = '';
  statusFilter = '';
  showAddModal = false;
  currentPage = 1;
  totalPages = 2;
  totalMembers = 14;

  newMember = { firstName: '', lastName: '', email: '', phone: '' };

  tableColumns: TableColumn[] = [
    { key: 'firstName', label: 'Name', width: '25%' },
    { key: 'plan', label: 'Plan', width: '15%' },
    { key: 'status', label: 'Status', width: '12%', type: 'status' },
    { key: 'club', label: 'Home Club', width: '18%' },
    { key: 'lastVisit', label: 'Last Visit', width: '18%' },
    { key: 'actions', label: '', width: '12%', type: 'action' },
  ];

  members: TableRow[] = [
    {
      firstName: 'Jean Dupont',
      plan: 'Premium',
      status: 'Active',
      club: 'Brussels',
      lastVisit: 'Yesterday, 18:30',
      actions: 'View',
    },
    {
      firstName: 'Marie Martin',
      plan: 'Basic',
      status: 'Active',
      club: 'Namur',
      lastVisit: 'Today, 09:15',
      actions: 'View',
    },
    {
      firstName: 'Luc Petit',
      plan: 'Premium',
      status: 'Suspended',
      club: 'Brussels',
      lastVisit: '3 months ago',
      actions: 'View',
    },
    {
      firstName: 'Sophie Dubois',
      plan: 'VIP',
      status: 'Active',
      club: 'Liege',
      lastVisit: 'Yesterday, 12:00',
      actions: 'View',
    },
  ];

  ngOnInit(): void {
    // Load members from API
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  createMember(): void {
    console.log('Creating member:', this.newMember);
    this.showAddModal = false;
    this.newMember = { firstName: '', lastName: '', email: '', phone: '' };
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
  }
}
