import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { TableComponent, TableColumn } from '../../shared/components/ui/table.component';

@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, InputComponent, TableComponent],
  template: `
    <div class="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-black text-neutral-900">👔 Employees & Staff</h1>
          <p class="text-sm text-neutral-500 mt-2">Manage staff members and their roles</p>
        </div>
        <app-button variant="primary" size="lg">➕ Add Employee</app-button>
      </div>

      <app-card class="mb-6">
        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <app-input placeholder="Search employees..."></app-input>
          </div>
          <select class="px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700">
            <option>All Roles</option>
            <option>Manager</option>
            <option>Coach</option>
            <option>Receptionist</option>
            <option>Maintenance</option>
          </select>
        </div>
      </app-card>

      <app-card class="flex-1">
        <app-table
          [columns]="columns"
          [rows]="employees"
        ></app-table>
      </app-card>
    </div>
  `,
})
export class EmployeesPageComponent {
  columns: TableColumn[] = [
    { key: 'name', label: 'Employee Name', width: '20%' },
    { key: 'email', label: 'Email', width: '20%' },
    { key: 'role', label: 'Role', width: '15%' },
    { key: 'department', label: 'Department', width: '15%' },
    { key: 'hireDate', label: 'Hire Date', width: '15%', type: 'date' },
    { key: 'status', label: 'Status', width: '12%', type: 'status' },
  ];

  employees = [
    { name: 'Moni Roy', email: 'moni&#64;example.com', role: 'Manager', department: 'Brussels', hireDate: new Date('2022-01-15'), status: 'Active' },
    { name: 'Sarah Johnson', email: 'sarah&#64;example.com', role: 'Coach', department: 'Brussels', hireDate: new Date('2023-06-01'), status: 'Active' },
    { name: 'Mike Chen', email: 'mike&#64;example.com', role: 'Receptionist', department: 'Namur', hireDate: new Date('2023-09-01'), status: 'Active' },
    { name: 'Emma Wilson', email: 'emma&#64;example.com', role: 'Coach', department: 'Liege', hireDate: new Date('2024-02-15'), status: 'Active' },
    { name: 'David Brown', email: 'david&#64;example.com', role: 'Maintenance', department: 'Brussels', hireDate: new Date('2022-11-01'), status: 'Inactive' },
  ];
}
