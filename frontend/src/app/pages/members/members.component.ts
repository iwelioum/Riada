import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import {
  ClubSummary,
  ContractSummary,
  CreateContractPayload,
  CreateMemberPayload,
  MemberDetail,
  MemberSummary,
  SubscriptionPlan
} from '../../core/models/api-models';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent implements OnInit {
  members: MemberSummary[] = [];
  selectedMember: MemberDetail | null = null;
  plans: SubscriptionPlan[] = [];
  clubs: ClubSummary[] = [];
  loading = false;
  metaLoading = false;
  formLoading = false;
  detailLoading = false;
  error: string | null = null;
  metaError: string | null = null;
  detailError: string | null = null;
  actionError: string | null = null;
  successMessage: string | null = null;
  formError: string | null = null;
  contractError: string | null = null;
  contractSuccess: string | null = null;
  savingMember = false;
  creatingContract = false;
  contractActionLoadingId: number | null = null;
  anonymizeConfirmId: number | null = null;
  anonymizingMemberId: number | null = null;
  showForm = false;
  editingId: number | null = null;
  filters = { status: '', search: '' };
  freezeDurations: Record<number, number | undefined> = {};
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

  contractForm: { planId: number | null; homeClubId: number | null; contractType: string; startDate: string; endDate?: string | null } = {
    planId: null,
    homeClubId: null,
    contractType: 'FixedTerm',
    startDate: new Date().toISOString().split('T')[0]
  };

  constructor(private apiService: ApiService) {}

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
        if (this.selectedMember && !this.members.find((member) => member.id === this.selectedMember?.id)) {
          this.selectedMember = null;
        }
      },
      error: (err) => {
        this.members = [];
        this.error = this.getErrorMessage(err, 'Failed to load members. Please check if the API is running.');
        this.loading = false;
        this.hasLoadedMembers = true;
      }
    });
  }

  selectMember(member: MemberSummary) {
    this.selectedMember = null;
    this.detailLoading = true;
    this.detailError = null;
    this.clearContractMessages();
    this.apiService.getMemberDetail(member.id).subscribe({
      next: (detail) => {
        this.selectedMember = detail;
        this.freezeDurations = Object.fromEntries(detail.contracts.map((contract) => [contract.id, 30]));
        this.detailLoading = false;
      },
      error: (err) => {
        this.selectedMember = null;
        this.detailError = this.getErrorMessage(err, 'Failed to load member detail.');
        this.detailLoading = false;
      }
    });
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
        if (this.selectedMember?.id === id) {
          this.selectedMember = null;
        }
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

  createContract() {
    if (this.creatingContract) {
      return;
    }

    this.clearContractMessages();
    if (!this.selectedMember || !this.contractForm.planId || !this.contractForm.homeClubId || !this.contractForm.contractType || !this.contractForm.startDate) {
      this.contractError = 'Fill contract fields (plan, club, type, start date).';
      return;
    }

    if (this.contractForm.endDate && this.contractForm.endDate < this.contractForm.startDate) {
      this.contractError = 'Contract end date must be after the start date.';
      return;
    }

    this.creatingContract = true;
    const payload: CreateContractPayload = {
      memberId: this.selectedMember.id,
      planId: Number(this.contractForm.planId),
      homeClubId: Number(this.contractForm.homeClubId),
      contractType: this.contractForm.contractType,
      startDate: this.contractForm.startDate,
      endDate: this.contractForm.endDate || null
    };

    this.apiService.createContract(payload).subscribe({
      next: (res) => {
        this.contractSuccess = res.message;
        this.reloadSelected();
        this.creatingContract = false;
      },
      error: (err) => {
        this.contractError = this.getErrorMessage(err, 'Failed to create contract.');
        this.creatingContract = false;
      }
    });
  }

  setFreezeDuration(contractId: number, value: number | string): void {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      this.freezeDurations[contractId] = Math.floor(parsed);
      return;
    }

    delete this.freezeDurations[contractId];
  }

  freezeContract(contract: ContractSummary) {
    if (this.contractActionLoadingId !== null) {
      return;
    }

    this.clearContractMessages();
    const duration = this.freezeDurations[contract.id] ?? 30;
    if (!Number.isFinite(duration) || duration < 1) {
      this.contractError = 'Freeze duration must be at least 1 day.';
      return;
    }

    this.contractActionLoadingId = contract.id;
    this.apiService.freezeContract(contract.id, duration).subscribe({
      next: (res) => {
        this.contractSuccess = res.message;
        this.reloadSelected();
        this.contractActionLoadingId = null;
      },
      error: (err) => {
        this.contractError = this.getErrorMessage(err, 'Failed to freeze contract.');
        this.contractActionLoadingId = null;
      }
    });
  }

  renewContract(contract: ContractSummary) {
    if (this.contractActionLoadingId !== null) {
      return;
    }

    this.clearContractMessages();
    this.contractActionLoadingId = contract.id;
    this.apiService.renewContract(contract.id).subscribe({
      next: (res) => {
        this.contractSuccess = res.message;
        this.reloadSelected();
        this.contractActionLoadingId = null;
      },
      error: (err) => {
        this.contractError = this.getErrorMessage(err, 'Failed to renew contract.');
        this.contractActionLoadingId = null;
      }
    });
  }

  private reloadSelected() {
    if (this.selectedMember) {
      this.selectMember(this.selectedMember);
      this.loadMembers();
    }
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

  private clearContractMessages(): void {
    this.contractError = null;
    this.contractSuccess = null;
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
    this.contractForm = {
      planId: null,
      homeClubId: null,
      contractType: 'FixedTerm',
      startDate: new Date().toISOString().split('T')[0]
    };
  }

  isContractActionLoading(contractId: number): boolean {
    return this.contractActionLoadingId === contractId;
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
