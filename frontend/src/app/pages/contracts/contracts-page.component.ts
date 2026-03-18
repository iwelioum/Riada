import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { TableComponent, TableColumn } from '../../shared/components/ui/table.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';

@Component({
  selector: 'app-contracts-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, InputComponent, TableComponent, BadgeComponent],
  template: `
    <div class="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-black text-neutral-900">📄 Contracts</h1>
          <p class="text-sm text-neutral-500 mt-2">Manage member contracts and subscriptions</p>
        </div>
        <app-button variant="primary" size="lg">➕ New Contract</app-button>
      </div>

      <app-card class="mb-6">
        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <app-input placeholder="Search by member name, contract ID..."></app-input>
          </div>
          <select class="px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Expired</option>
            <option>Cancelled</option>
          </select>
        </div>
      </app-card>

      <app-card class="flex-1">
        <app-table
          [columns]="columns"
          [rows]="contracts"
        ></app-table>
      </app-card>
    </div>
  `,
})
export class ContractsPageComponent {
  columns: TableColumn[] = [
    { key: 'memberId', label: 'Member', width: '25%' },
    { key: 'plan', label: 'Plan', width: '15%' },
    { key: 'status', label: 'Status', width: '12%', type: 'status' },
    { key: 'startDate', label: 'Start Date', width: '15%', type: 'date' },
    { key: 'endDate', label: 'End Date', width: '15%', type: 'date' },
    { key: 'amount', label: 'Amount', width: '12%', type: 'number' },
  ];

  contracts = [
    { memberId: 'Jean Dupont', plan: 'Premium', status: 'Active', startDate: new Date('2025-01-15'), endDate: new Date('2026-01-15'), amount: 360 },
    { memberId: 'Marie Martin', plan: 'Basic', status: 'Active', startDate: new Date('2024-11-01'), endDate: new Date('2025-10-31'), amount: 180 },
    { memberId: 'Sophie Dubois', plan: 'VIP', status: 'Expired', startDate: new Date('2024-01-01'), endDate: new Date('2025-01-01'), amount: 600 },
  ];
}
