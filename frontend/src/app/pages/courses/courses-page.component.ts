import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { InputComponent } from '../../shared/components/ui/input.component';
import { TableComponent, TableColumn } from '../../shared/components/ui/table.component';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, InputComponent, TableComponent],
  template: `
    <div class="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-black text-neutral-900">📚 Courses & Classes</h1>
          <p class="text-sm text-neutral-500 mt-2">Manage fitness classes and schedules</p>
        </div>
        <app-button variant="primary" size="lg">➕ New Course</app-button>
      </div>

      <app-card class="mb-6">
        <div class="flex gap-4 items-end">
          <div class="flex-1">
            <app-input placeholder="Search courses..."></app-input>
          </div>
          <select class="px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Archived</option>
          </select>
        </div>
      </app-card>

      <app-card class="flex-1">
        <app-table
          [columns]="columns"
          [rows]="courses"
        ></app-table>
      </app-card>
    </div>
  `,
})
export class CoursesPageComponent {
  columns: TableColumn[] = [
    { key: 'name', label: 'Course Name', width: '20%' },
    { key: 'instructor', label: 'Instructor', width: '20%' },
    { key: 'schedule', label: 'Schedule', width: '15%' },
    { key: 'capacity', label: 'Capacity', width: '12%' },
    { key: 'enrolled', label: 'Enrolled', width: '12%' },
    { key: 'status', label: 'Status', width: '12%', type: 'status' },
  ];

  courses = [
    { name: 'Power Yoga', instructor: 'M. Laurent', schedule: 'Mon, Wed, Fri 14:00', capacity: 20, enrolled: 18, status: 'Active' },
    { name: 'HIIT Cardio', instructor: 'R. Moreau', schedule: 'Tue, Thu 15:30', capacity: 15, enrolled: 15, status: 'Active' },
    { name: 'Pilates', instructor: 'S. Dupuis', schedule: 'Mon, Wed 17:00', capacity: 12, enrolled: 7, status: 'Active' },
    { name: 'Boxing', instructor: 'K. Osei', schedule: 'Sat 18:30', capacity: 10, enrolled: 10, status: 'Active' },
    { name: 'Zumba (Inactive)', instructor: 'P. Silva', schedule: 'Tue 19:00', capacity: 25, enrolled: 0, status: 'Inactive' },
  ];
}
