import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeSummary } from '../../core/models/api-models';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  loading = true;
  errorMessage: string | null = null;
  employees: EmployeeSummary[] = [];
  searchTerm = '';
  selectedRole = '';
  selectedClubId: number | null = null;
  roleOptions: string[] = [];
  clubOptions: Array<{ id: number; name: string }> = [];

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
        this.roleOptions = Array.from(new Set(this.employees.map((employee) => employee.role))).sort((a, b) => a.localeCompare(b));
        this.clubOptions = Array.from(
          new Map(this.employees.map((employee) => [employee.clubId, { id: employee.clubId, name: employee.clubName }])).values()
        ).sort((a, b) => a.name.localeCompare(b.name));
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

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedClubId = null;
  }

  get filteredEmployees(): EmployeeSummary[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.employees.filter((employee) => {
      const roleMatch = !this.selectedRole || employee.role === this.selectedRole;
      const clubMatch = this.selectedClubId === null || employee.clubId === this.selectedClubId;
      const textMatch =
        !search ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.role.toLowerCase().includes(search) ||
        employee.clubName.toLowerCase().includes(search);

      return roleMatch && clubMatch && textMatch;
    });
  }
}
