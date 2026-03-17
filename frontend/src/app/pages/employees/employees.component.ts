import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EmployeeSummary } from '../../core/models/api-models';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  loading = true;
  errorMessage: string | null = null;
  employees: EmployeeSummary[] = [];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = null;
    this.api.getEmployees({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.employees = response.items ?? [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load employees. Verify the backend is running.';
        this.loading = false;
      }
    });
  }

  trackByEmployeeId(_index: number, employee: EmployeeSummary): number {
    return employee.id;
  }
}
