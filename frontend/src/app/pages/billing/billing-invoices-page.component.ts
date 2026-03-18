import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { TableComponent, TableColumn } from '../../shared/components/ui/table.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';

@Component({
  selector: 'app-billing-invoices-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, InputComponent, TableComponent, BadgeComponent],
  template: `
    <div class="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-black text-neutral-900">🧾 Invoices & Billing</h1>
          <p class="text-sm text-neutral-500 mt-2">Manage invoices and track payments</p>
        </div>
        <app-button variant="primary" size="lg">➕ New Invoice</app-button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <app-card>
          <div class="text-center">
            <p class="text-sm text-neutral-500 mb-2">Total Revenue (March)</p>
            <p class="text-3xl font-black text-primary">€38.4K</p>
            <p class="text-xs text-neutral-500 mt-2">+6.2% vs February</p>
          </div>
        </app-card>
        <app-card>
          <div class="text-center">
            <p class="text-sm text-neutral-500 mb-2">Pending Payments</p>
            <p class="text-3xl font-black text-warning">18</p>
            <p class="text-xs text-neutral-500 mt-2">€2,847 outstanding</p>
          </div>
        </app-card>
        <app-card>
          <div class="text-center">
            <p class="text-sm text-neutral-500 mb-2">Payment Rate</p>
            <p class="text-3xl font-black text-success">94.6%</p>
            <p class="text-xs text-neutral-500 mt-2">of invoices paid</p>
          </div>
        </app-card>
      </div>

      <app-card class="mb-6">
        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <app-input placeholder="Search invoices..."></app-input>
          </div>
          <select class="px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700">
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
            <option>Cancelled</option>
          </select>
        </div>
      </app-card>

      <app-card class="flex-1">
        <app-table
          [columns]="columns"
          [rows]="invoices"
        ></app-table>
      </app-card>
    </div>
  `,
})
export class BillingInvoicesPageComponent {
  columns: TableColumn[] = [
    { key: 'invoiceId', label: 'Invoice ID', width: '15%' },
    { key: 'member', label: 'Member', width: '20%' },
    { key: 'amount', label: 'Amount', width: '12%', type: 'number' },
    { key: 'dueDate', label: 'Due Date', width: '15%', type: 'date' },
    { key: 'status', label: 'Status', width: '12%', type: 'status' },
    { key: 'paid', label: 'Paid Date', width: '15%', type: 'date' },
  ];

  invoices = [
    { invoiceId: 'INV-001234', member: 'Jean Dupont', amount: 360, dueDate: new Date('2026-04-15'), status: 'Paid', paid: new Date('2026-03-20') },
    { invoiceId: 'INV-001235', member: 'Marie Martin', amount: 180, dueDate: new Date('2026-04-01'), status: 'Paid', paid: new Date('2026-03-28') },
    { invoiceId: 'INV-001236', member: 'Luc Petit', amount: 300, dueDate: new Date('2026-04-10'), status: 'Pending', paid: null },
    { invoiceId: 'INV-001237', member: 'Sophie Dubois', amount: 500, dueDate: new Date('2026-03-25'), status: 'Overdue', paid: null },
  ];
}
