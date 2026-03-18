import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Edit2, Mail, Plus, Search, Users, X } from 'lucide-angular';
import { ClubsApiService } from '../../shared/services/clubs-api.service';
import { EmployeeDetailDto, EmployeeSummaryDto, EmployeesApiService } from '../../shared/services/employees-api.service';

type EmployeeRole = 'Instructor' | 'Manager' | 'Receptionist' | 'Technician' | 'Intern' | 'Management';

interface ClubOption {
  id: number;
  name: string;
}

interface EmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  clubId: number;
  salary: string;
  qualifications: string;
  hiredOn: string;
}

const ROLES: EmployeeRole[] = ['Instructor', 'Manager', 'Receptionist', 'Technician', 'Intern', 'Management'];
const PAGE_SIZE = 10;
const ROLE_CLASSES: Record<EmployeeRole, string> = {
  Instructor: 'bg-[#E0F8EA] text-[#00B69B]',
  Manager: 'bg-[#FFF0F0] text-[#FF4747]',
  Receptionist: 'bg-[#EBEBFF] text-[#4880FF]',
  Technician: 'bg-[#FFF3D6] text-[#FF9066]',
  Intern: 'bg-[#F5F6FA] text-[#A6A6A6]',
  Management: 'bg-[#F3F0FF] text-[#8B5CF6]',
};

const emptyForm = (clubId = 1): EmployeeForm => ({
  firstName: '',
  lastName: '',
  email: '',
  role: 'Instructor',
  clubId,
  salary: '',
  qualifications: '',
  hiredOn: new Date().toISOString().slice(0, 10),
});

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  template: `
    <div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
      <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
              <lucide-icon [img]="UsersIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
              Employees
            </h1>
            <p class="text-sm text-[#6B7280] mt-1">{{ totalCount() }} employee{{ totalCount() !== 1 ? 's' : '' }}</p>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-64">
              <lucide-icon [img]="SearchIcon" [size]="16" class="text-[#A6A6A6] shrink-0"></lucide-icon>
              <input
                type="text"
                placeholder="Search by name/email..."
                [ngModel]="searchTerm()"
                (ngModelChange)="onSearchChange($event)"
                class="text-sm bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]" />
            </div>

            <select
              [ngModel]="selectedClubFilter()"
              (ngModelChange)="onClubFilterChange($event)"
              class="input-field w-48">
              <option [ngValue]="'all'">All clubs</option>
              @for (club of clubs(); track club.id) {
                <option [ngValue]="club.id">{{ club.name }}</option>
              }
            </select>

            <button
              (click)="openCreate()"
              class="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all disabled:opacity-60"
              [disabled]="saving() || loadingModal()">
              <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
              Add employee
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-8 space-y-4">
        @if (error()) {
          <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 text-sm text-[#C53030]">
            {{ error() }}
          </div>
        }

        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
          @if (loading()) {
            <div class="px-5 py-12 text-center text-sm text-[#A6A6A6]">Loading employees...</div>
          } @else {
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                  @for (h of ['Name', 'Email', 'Role', 'Club', 'Hired on', '']; track h) {
                    <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @if (employees().length === 0) {
                  <tr>
                    <td colspan="6" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No employees found</td>
                  </tr>
                }
                @for (emp of employees(); track emp.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors">
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#EBEBFF] text-[#4880FF] flex items-center justify-center text-sm font-bold shrink-0">
                          {{ emp.firstName[0] }}{{ emp.lastName[0] }}
                        </div>
                        <span class="font-bold text-[#111827]">{{ emp.firstName }} {{ emp.lastName }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-sm text-[#6B7280]">{{ emp.email }}</td>
                    <td class="px-5 py-4">
                      <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + roleClass(emp.role)">
                        {{ emp.role }}
                      </span>
                    </td>
                    <td class="px-5 py-4 text-sm text-[#111827] font-medium">{{ emp.clubName }}</td>
                    <td class="px-5 py-4 text-sm text-[#6B7280]">{{ emp.hiredOn | date:'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-4">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          (click)="openEdit(emp)"
                          class="p-1.5 rounded-lg text-[#A6A6A6] hover:text-[#4880FF] hover:bg-[#EBEBFF] transition-colors"
                          title="Edit">
                          <lucide-icon [img]="Edit2Icon" [size]="16"></lucide-icon>
                        </button>
                        <a
                          class="p-1.5 rounded-lg text-[#A6A6A6] hover:text-[#4880FF] hover:bg-[#EBEBFF] transition-colors"
                          [href]="'mailto:' + emp.email"
                          title="Send email">
                          <lucide-icon [img]="MailIcon" [size]="16"></lucide-icon>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        @if (!loading() && totalCount() > 0) {
          <div class="flex items-center justify-between">
            <p class="text-sm text-[#6B7280]">
              {{ startItem() }}-{{ endItem() }} of {{ totalCount() }} employees
            </p>
            <div class="flex items-center gap-2">
              <button
                (click)="goToPreviousPage()"
                class="px-3 py-1.5 text-sm border border-[#E0E0E0] rounded-lg bg-white hover:bg-[#F8FAFF] disabled:opacity-50"
                [disabled]="page() <= 1 || loading()">
                Previous
              </button>
              <span class="text-sm text-[#6B7280]">Page {{ page() }} / {{ totalPages() }}</span>
              <button
                (click)="goToNextPage()"
                class="px-3 py-1.5 text-sm border border-[#E0E0E0] rounded-lg bg-white hover:bg-[#F8FAFF] disabled:opacity-50"
                [disabled]="page() >= totalPages() || loading()">
                Next
              </button>
            </div>
          </div>
        }
      </div>

      @if (showModal()) {
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeModal()">
          <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-[#111827]">{{ isEditMode() ? 'Edit employee' : 'New employee' }}</h3>
              <button (click)="closeModal()" class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA]">
                <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
              </button>
            </div>

            @if (loadingModal()) {
              <div class="py-10 text-center text-sm text-[#A6A6A6]">Loading employee details...</div>
            } @else {
              @if (modalError()) {
                <div class="rounded-xl border border-[#FFD2D2] bg-[#FFF5F5] px-4 py-3 mb-4 text-sm text-[#C53030]">
                  {{ modalError() }}
                </div>
              }

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[#6B7280] mb-1">First name</label>
                    <input
                      class="input-field"
                      [ngModel]="form().firstName"
                      (ngModelChange)="patchForm('firstName', $event)"
                      placeholder="Sophie" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-[#6B7280] mb-1">Last name</label>
                    <input
                      class="input-field"
                      [ngModel]="form().lastName"
                      (ngModelChange)="patchForm('lastName', $event)"
                      placeholder="Lambert" />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
                  <input
                    class="input-field"
                    type="email"
                    [ngModel]="form().email"
                    (ngModelChange)="patchForm('email', $event)"
                    placeholder="sophie@riada.be" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[#6B7280] mb-1">Role</label>
                    <select class="input-field" [ngModel]="form().role" (ngModelChange)="patchForm('role', $event)">
                      @for (r of roles; track r) {
                        <option [value]="r">{{ r }}</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[#6B7280] mb-1">Club</label>
                    <select class="input-field" [ngModel]="form().clubId" (ngModelChange)="patchForm('clubId', +$event)">
                      @for (c of clubs(); track c.id) {
                        <option [ngValue]="c.id">{{ c.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[#6B7280] mb-1">Salary (EUR/month)</label>
                    <input
                      class="input-field"
                      type="number"
                      [ngModel]="form().salary"
                      (ngModelChange)="patchForm('salary', $event)"
                      placeholder="2400" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[#6B7280] mb-1">Hired on</label>
                    <input
                      class="input-field"
                      type="date"
                      [ngModel]="form().hiredOn"
                      (ngModelChange)="patchForm('hiredOn', $event)"
                      [disabled]="isEditMode()" />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#6B7280] mb-1">Qualifications</label>
                  <input
                    class="input-field"
                    [ngModel]="form().qualifications"
                    (ngModelChange)="patchForm('qualifications', $event)"
                    placeholder="Personal trainer, First aid..." />
                </div>
              </div>

              <div class="flex gap-3 mt-8">
                <button
                  (click)="closeModal()"
                  class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors disabled:opacity-60"
                  [disabled]="saving()">
                  Cancel
                </button>
                <button
                  (click)="handleSubmit()"
                  class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors disabled:opacity-60"
                  [disabled]="saving()">
                  {{ saving() ? 'Saving...' : (isEditMode() ? 'Save changes' : 'Create employee') }}
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .input-field {
      @apply w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF];
    }
  `],
})
export class EmployeesComponent implements OnInit {
  readonly UsersIcon = Users;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly SearchIcon = Search;
  readonly Edit2Icon = Edit2;
  readonly MailIcon = Mail;

  readonly roles = ROLES;

  private readonly employeesApi = inject(EmployeesApiService);
  private readonly clubsApi = inject(ClubsApiService);

  readonly clubs = signal<ClubOption[]>([]);
  readonly employees = signal<EmployeeSummaryDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly selectedClubFilter = signal<number | 'all'>('all');
  readonly page = signal(1);
  readonly totalCount = signal(0);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)));
  readonly startItem = computed(() => (this.totalCount() === 0 ? 0 : (this.page() - 1) * PAGE_SIZE + 1));
  readonly endItem = computed(() => Math.min(this.page() * PAGE_SIZE, this.totalCount()));

  readonly showModal = signal(false);
  readonly editTargetId = signal<number | null>(null);
  readonly form = signal<EmployeeForm>(emptyForm());
  readonly saving = signal(false);
  readonly loadingModal = signal(false);
  readonly modalError = signal<string | null>(null);
  readonly isEditMode = computed(() => this.editTargetId() !== null);

  ngOnInit(): void {
    this.loadClubs();
    this.loadEmployees();
  }

  roleClass(role: string): string {
    return ROLE_CLASSES[(role as EmployeeRole)] ?? 'bg-[#F5F6FA] text-[#A6A6A6]';
  }

  patchForm<K extends keyof EmployeeForm>(key: K, value: EmployeeForm[K]) {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.page.set(1);
    this.loadEmployees();
  }

  onClubFilterChange(value: number | 'all'): void {
    this.selectedClubFilter.set(value);
    this.page.set(1);
    this.loadEmployees();
  }

  goToPreviousPage(): void {
    if (this.page() <= 1 || this.loading()) return;
    this.page.update((current) => current - 1);
    this.loadEmployees();
  }

  goToNextPage(): void {
    if (this.page() >= this.totalPages() || this.loading()) return;
    this.page.update((current) => current + 1);
    this.loadEmployees();
  }

  openCreate() {
    const firstClubId = this.clubs()[0]?.id ?? 1;
    this.editTargetId.set(null);
    this.form.set(emptyForm(firstClubId));
    this.modalError.set(null);
    this.showModal.set(true);
  }

  openEdit(emp: EmployeeSummaryDto) {
    this.editTargetId.set(emp.id);
    this.modalError.set(null);
    this.showModal.set(true);
    this.loadingModal.set(true);

    this.employeesApi.getEmployeeDetail(emp.id).subscribe({
      next: (detail) => {
        this.form.set(this.mapDetailToForm(detail));
        this.loadingModal.set(false);
      },
      error: () => {
        this.loadingModal.set(false);
        this.modalError.set('Unable to load employee details.');
      },
    });
  }

  closeModal() {
    if (this.saving()) return;
    this.showModal.set(false);
    this.loadingModal.set(false);
    this.modalError.set(null);
  }

  handleSubmit() {
    const f = this.form();
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim() || !f.clubId) {
      this.modalError.set('Please fill all required fields.');
      return;
    }

    if (!this.isEditMode() && !f.hiredOn) {
      this.modalError.set('Hired date is required for a new employee.');
      return;
    }

    const salaryValue = f.salary.trim() ? Number(f.salary) : null;
    if (salaryValue !== null && Number.isNaN(salaryValue)) {
      this.modalError.set('Salary must be a valid number.');
      return;
    }

    this.saving.set(true);
    this.modalError.set(null);

    const editId = this.editTargetId();
    if (editId) {
      this.employeesApi.updateEmployee(editId, {
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email.trim(),
        role: f.role,
        clubId: Number(f.clubId),
        monthlySalary: salaryValue,
        qualifications: f.qualifications.trim() || null,
      }).subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal.set(false);
          this.loadEmployees();
        },
        error: () => {
          this.saving.set(false);
          this.modalError.set('Unable to update employee.');
        },
      });
      return;
    }

    this.employeesApi.createEmployee({
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim(),
      role: f.role,
      clubId: Number(f.clubId),
      monthlySalary: salaryValue,
      qualifications: f.qualifications.trim() || null,
      hiredOn: f.hiredOn,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.page.set(1);
        this.loadEmployees();
      },
      error: () => {
        this.saving.set(false);
        this.modalError.set('Unable to create employee.');
      },
    });
  }

  private loadEmployees(): void {
    this.loading.set(true);
    this.error.set(null);

    const selectedClub = this.selectedClubFilter();
    const clubId = selectedClub === 'all' ? null : selectedClub;
    this.employeesApi.listEmployees(this.page(), PAGE_SIZE, clubId, this.searchTerm()).subscribe({
      next: (response) => {
        this.employees.set(response.items ?? []);
        this.totalCount.set(response.totalCount ?? 0);
        this.loading.set(false);

        if (response.totalPages > 0 && this.page() > response.totalPages) {
          this.page.set(response.totalPages);
          this.loadEmployees();
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load employees.');
      },
    });
  }

  private loadClubs(): void {
    this.clubsApi.listClubs().subscribe({
      next: (response) => {
        const clubs = response.map((club) => ({ id: club.id, name: club.name }));
        this.clubs.set(clubs);

        if (clubs.length > 0 && !clubs.some((club) => club.id === this.form().clubId)) {
          this.form.update((current) => ({ ...current, clubId: clubs[0].id }));
        }
      },
      error: () => {
        this.error.set('Unable to load clubs.');
      },
    });
  }

  private mapDetailToForm(detail: EmployeeDetailDto): EmployeeForm {
    return {
      firstName: detail.firstName,
      lastName: detail.lastName,
      email: detail.email,
      role: (ROLES.includes(detail.role as EmployeeRole) ? detail.role : 'Instructor') as EmployeeRole,
      clubId: detail.clubId,
      salary: detail.monthlySalary !== null ? String(detail.monthlySalary) : '',
      qualifications: detail.qualifications ?? '',
      hiredOn: detail.hiredOn,
    };
  }
}
