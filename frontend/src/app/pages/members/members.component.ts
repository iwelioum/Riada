import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { RoleService } from '../../core/services/role.service';
import {
  ClubSummary,
  CreateMemberPayload,
  MemberDetail,
  MemberSummary,
  SubscriptionPlan
} from '../../core/models/api-models';

// MemberDetail used by editMember (populateFormFromMemberDetail)

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent implements OnInit {
  members: MemberSummary[] = [];
  plans: SubscriptionPlan[] = [];
  clubs: ClubSummary[] = [];
  loading = false;
  metaLoading = false;
  formLoading = false;
  error: string | null = null;
  metaError: string | null = null;
  actionError: string | null = null;
  successMessage: string | null = null;
  formError: string | null = null;
  savingMember = false;
  anonymizeConfirmId: number | null = null;
  anonymizingMemberId: number | null = null;
  showForm = false;
  editingId: number | null = null;
  filters = { status: '', search: '' };
  hasLoadedMembers = false;

  formData: CreateMemberPayload = {
    firstName: '',
    lastName: '',
    email: '',
    gender: 'Unspecified',
    dateOfBirth: '',
    mobilePhone: '',
    nationality: '',
    addressCity: '',
    addressStreet: '',
    addressPostalCode: '',
    primaryGoal: '',
    marketingConsent: true,
    medicalCertificateProvided: false
  };

  constructor(private apiService: ApiService, private roleService: RoleService, private router: Router) {}

  get isPortique(): boolean {
    return this.roleService.hasRole('portique') && !this.roleService.isAdmin();
  }

  get canManageMembers(): boolean {
    return this.roleService.hasAnyRole(['admin', 'billing', 'portique']);
  }

  get canManageContracts(): boolean {
    return this.roleService.hasAnyRole(['admin', 'billing', 'portique']);
  }

  canMemberEnter(status: string): boolean {
    return status === 'Active';
  }

  ngOnInit() {
    this.loadMeta();
    this.loadMembers();
  }

  loadMeta() {
    this.metaLoading = true;
    this.metaError = null;
    const issues: string[] = [];

    forkJoin({
      plans: this.apiService.listSubscriptionPlans().pipe(
        catchError((error) => {
          issues.push(`Plans: ${this.getErrorMessage(error, 'Unable to load plans.')}`);
          return of([] as SubscriptionPlan[]);
        })
      ),
      clubs: this.apiService.listClubs().pipe(
        catchError((error) => {
          issues.push(`Clubs: ${this.getErrorMessage(error, 'Unable to load clubs.')}`);
          return of([] as ClubSummary[]);
        })
      )
    }).subscribe({
      next: ({ plans, clubs }) => {
        this.plans = plans;
        this.clubs = clubs;
        this.metaError = issues.length ? issues.join(' ') : null;
      },
      error: () => {
        this.metaError = 'Unexpected metadata loading error.';
      },
      complete: () => {
        this.metaLoading = false;
      }
    });
  }

  applyFilters() {
    if (this.filters.search.trim().length === 1) {
      this.error = 'Please enter at least 2 characters for search.';
      return;
    }

    this.loadMembers();
  }

  loadMembers() {
    this.hasLoadedMembers = false;
    this.loading = true;
    this.error = null;
    this.apiService.getMembers({
      page: 1,
      pageSize: 50,
      status: this.filters.status || undefined,
      search: this.filters.search.trim() || undefined
    }).subscribe({
      next: (data) => {
        this.members = data.items;
        this.loading = false;
        this.hasLoadedMembers = true;
      },
      error: (err) => {
        this.members = [];
        this.error = this.getErrorMessage(err, 'Failed to load members. Please check if the API is running.');
        this.loading = false;
        this.hasLoadedMembers = true;
      }
    });
  }

  viewMember(member: MemberSummary): void {
    this.router.navigate(['/members', member.id]);
  }

  openAddForm() {
    this.clearActionMessages();
    this.showForm = true;
    this.editingId = null;
    this.resetForm();
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.formLoading = false;
    this.formError = null;
    this.resetForm();
  }

  editMember(member: MemberSummary) {
    this.clearActionMessages();
    this.editingId = member.id;
    this.showForm = true;
    this.formLoading = true;
    this.formError = null;

    this.apiService.getMemberDetail(member.id).subscribe({
      next: (detail) => {
        this.populateFormFromMemberDetail(detail);
        this.formLoading = false;
      },
      error: (error) => {
        this.formData = {
          ...this.formData,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          mobilePhone: member.mobilePhone ?? '',
          primaryGoal: member.primaryGoal ?? ''
        };
        this.formError = this.getErrorMessage(error, 'Could not load full profile. You can still update basic fields.');
        this.formLoading = false;
      }
    });
  }

  saveMember() {
    if (this.savingMember) {
      return;
    }

    this.clearActionMessages();
    this.formError = this.validateMemberForm();
    if (this.formError) {
      return;
    }

    this.savingMember = true;

    if (this.editingId) {
      const payload = {
        firstName: this.formData.firstName.trim(),
        lastName: this.formData.lastName.trim(),
        gender: this.formData.gender,
        nationality: this.formData.nationality?.trim(),
        mobilePhone: this.formData.mobilePhone?.trim(),
        addressStreet: this.formData.addressStreet?.trim(),
        addressCity: this.formData.addressCity?.trim(),
        addressPostalCode: this.formData.addressPostalCode?.trim(),
        primaryGoal: this.formData.primaryGoal?.trim(),
        acquisitionSource: this.formData.acquisitionSource?.trim()
      };

      this.apiService.updateMember(this.editingId, payload).subscribe({
        next: () => {
          this.loadMembers();
          this.closeForm();
          this.successMessage = 'Member updated successfully.';
          this.savingMember = false;
        },
        error: (err) => {
          this.formError = this.getErrorMessage(err, 'Failed to update member.');
          this.savingMember = false;
        }
      });
    } else {
      this.apiService.createMember({
        ...this.formData,
        firstName: this.formData.firstName.trim(),
        lastName: this.formData.lastName.trim(),
        email: this.formData.email.trim(),
        nationality: this.formData.nationality?.trim(),
        mobilePhone: this.formData.mobilePhone?.trim(),
        addressStreet: this.formData.addressStreet?.trim(),
        addressCity: this.formData.addressCity?.trim(),
        addressPostalCode: this.formData.addressPostalCode?.trim(),
        primaryGoal: this.formData.primaryGoal?.trim(),
        acquisitionSource: this.formData.acquisitionSource?.trim()
      }).subscribe({
        next: () => {
          this.loadMembers();
          this.closeForm();
          this.successMessage = 'Member created successfully.';
          this.savingMember = false;
        },
        error: (err) => {
          this.formError = this.getErrorMessage(err, 'Failed to create member.');
          this.savingMember = false;
        }
      });
    }
  }

  requestDeleteMember(id: number) {
    this.clearActionMessages();
    this.anonymizeConfirmId = id;
  }

  cancelDeleteMember() {
    this.anonymizeConfirmId = null;
  }

  deleteMember(id: number) {
    this.clearActionMessages();
    this.anonymizingMemberId = id;
    this.apiService.anonymizeMember(id, 'admin').subscribe({
      next: () => {
        this.loadMembers();
        this.successMessage = 'Member anonymized successfully.';
      },
      error: (err) => {
        this.actionError = this.getErrorMessage(err, 'Failed to anonymize member.');
      },
      complete: () => {
        this.anonymizingMemberId = null;
        this.anonymizeConfirmId = null;
      }
    });
  }

  private validateMemberForm(): string | null {
    if (!this.formData.firstName.trim()) return 'First name is required.';
    if (!this.formData.lastName.trim()) return 'Last name is required.';
    if (!this.formData.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) return 'Email format is invalid.';
    if (!this.formData.gender) return 'Gender is required.';
    if (!this.formData.dateOfBirth) return 'Date of birth is required.';
    return null;
  }

  private populateFormFromMemberDetail(detail: MemberDetail): void {
    this.formData = {
      ...this.formData,
      firstName: detail.firstName,
      lastName: detail.lastName,
      email: detail.email,
      gender: detail.gender || 'Unspecified',
      dateOfBirth: detail.dateOfBirth ? String(detail.dateOfBirth).slice(0, 10) : '',
      mobilePhone: detail.mobilePhone ?? '',
      nationality: detail.nationality ?? '',
      primaryGoal: detail.primaryGoal ?? '',
      marketingConsent: detail.marketingConsent
    };
  }

  private clearActionMessages(): void {
    this.actionError = null;
    this.successMessage = null;
  }

  resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      gender: 'Unspecified',
      dateOfBirth: '',
      mobilePhone: '',
      nationality: '',
      addressCity: '',
      addressStreet: '',
      addressPostalCode: '',
      primaryGoal: '',
      marketingConsent: true,
      medicalCertificateProvided: false
    };
  }

  get membersEmptyMessage(): string {
    if (this.filters.search.trim() || this.filters.status) {
      return 'No members match the current filters.';
    }

    return 'No members found. Add your first member to get started.';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'badge-success';
      case 'Suspended':
      case 'Inactive':
      case 'Pending':
        return 'badge-warning';
      case 'Anonymized':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again before retrying this action.';
      }

      if (error.status === 403) {
        return 'Your role is not allowed to perform this action.';
      }

      const backendMessage = error.error?.message ?? error.error?.Message;
      if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
        return backendMessage;
      }
    }

    return fallback;
  }
}
