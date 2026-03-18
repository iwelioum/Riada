import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { TableComponent, TableColumn } from '../../shared/components/ui/table.component';
import { BadgeComponent } from '../../shared/components/ui/badge.component';

@Component({
  selector: 'app-equipment-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, InputComponent, TableComponent, BadgeComponent],
  template: `
    <div class="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-black text-neutral-900">🔧 Equipment</h1>
          <p class="text-sm text-neutral-500 mt-2">Track fitness equipment and maintenance</p>
        </div>
        <app-button variant="primary" size="lg">➕ Add Equipment</app-button>
      </div>

      <!-- Status Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <app-card>
          <div class="text-center">
            <p class="text-3xl mb-2">✅</p>
            <p class="text-sm text-neutral-500 mb-2">In Service</p>
            <p class="text-2xl font-black text-success">142</p>
          </div>
        </app-card>
        <app-card>
          <div class="text-center">
            <p class="text-3xl mb-2">🔧</p>
            <p class="text-sm text-neutral-500 mb-2">Maintenance</p>
            <p class="text-2xl font-black text-warning">8</p>
          </div>
        </app-card>
        <app-card>
          <div class="text-center">
            <p class="text-3xl mb-2">❌</p>
            <p class="text-sm text-neutral-500 mb-2">Broken</p>
            <p class="text-2xl font-black text-danger">3</p>
          </div>
        </app-card>
      </div>

      <app-card class="mb-6">
        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <app-input placeholder="Search equipment..."></app-input>
          </div>
          <select class="px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700">
            <option>All Status</option>
            <option>In Service</option>
            <option>Maintenance</option>
            <option>Broken</option>
          </select>
        </div>
      </app-card>

      <app-card class="flex-1">
        <app-table
          [columns]="columns"
          [rows]="equipment"
        ></app-table>
      </app-card>
    </div>
  `,
})
export class EquipmentPageComponent {
  columns: TableColumn[] = [
    { key: 'name', label: 'Equipment Name', width: '20%' },
    { key: 'category', label: 'Category', width: '18%' },
    { key: 'location', label: 'Location', width: '18%' },
    { key: 'acquiredDate', label: 'Acquired', width: '15%', type: 'date' },
    { key: 'lastMaintenance', label: 'Last Maintenance', width: '15%', type: 'date' },
    { key: 'status', label: 'Status', width: '12%', type: 'status' },
  ];

  equipment = [
    { name: 'Treadmill #1', category: 'Cardio', location: 'Brussels', acquiredDate: new Date('2023-01-15'), lastMaintenance: new Date('2026-03-10'), status: 'Active' },
    { name: 'Treadmill #2', category: 'Cardio', location: 'Brussels', acquiredDate: new Date('2023-01-15'), lastMaintenance: new Date('2026-02-20'), status: 'Active' },
    { name: 'Weight Rack #1', category: 'Strength', location: 'Namur', acquiredDate: new Date('2022-06-01'), lastMaintenance: new Date('2026-01-15'), status: 'Active' },
    { name: 'Stationary Bike', category: 'Cardio', location: 'Liege', acquiredDate: new Date('2024-03-01'), lastMaintenance: new Date('2026-03-15'), status: 'Maintenance' },
    { name: 'Cable Machine', category: 'Strength', location: 'Brussels', acquiredDate: new Date('2021-12-01'), lastMaintenance: new Date('2025-12-01'), status: 'Broken' },
  ];
}
