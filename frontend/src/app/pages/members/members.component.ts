import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selectedMember?: MemberDetail;
  plans: SubscriptionPlan[] = [];
  clubs: ClubSummary[] = [];
  loading = false;
  detailLoading = false;
  error: string | null = null;
  showForm = false;
  editingId: number | null = null;
  filters = { status: '', search: '' };

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
    this.apiService.listSubscriptionPlans().subscribe({ next: (plans) => (this.plans = plans || []) });
    this.apiService.listClubs().subscribe({ next: (clubs) => (this.clubs = clubs || []) });
  }

  loadMembers() {
    this.loading = true;
    this.error = null;
    this.apiService.getMembers({ page: 1, pageSize: 50, status: this.filters.status, search: this.filters.search }).subscribe({
      next: (data) => {
        this.members = data.items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading members:', err);
        this.error = 'Failed to load members. Please check if the API is running.';
        this.loading = false;
      }
    });
  }

  selectMember(member: MemberSummary) {
    this.detailLoading = true;
    this.apiService.getMemberDetail(member.id).subscribe({
      next: (detail) => {
        this.selectedMember = detail;
        this.detailLoading = false;
      },
      error: (err) => {
        console.error('Error loading member detail:', err);
        this.detailLoading = false;
      }
    });
  }

  openAddForm() {
    this.showForm = true;
    this.editingId = null;
    this.resetForm();
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.resetForm();
  }

  editMember(member: MemberSummary) {
    this.editingId = member.id;
    this.formData = {
      ...this.formData,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      gender: this.formData.gender,
      dateOfBirth: '',
      mobilePhone: member.mobilePhone ?? '',
      primaryGoal: member.primaryGoal ?? '',
      marketingConsent: true
    };
    this.showForm = true;
  }

  saveMember() {
    if (!this.formData.firstName || !this.formData.lastName || !this.formData.email || !this.formData.gender || !this.formData.dateOfBirth) {
      alert('Please fill in all required fields (first name, last name, email, gender, birth date)');
      return;
    }

    if (this.editingId) {
      const payload = {
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        gender: this.formData.gender,
        nationality: this.formData.nationality,
        mobilePhone: this.formData.mobilePhone,
        addressStreet: this.formData.addressStreet,
        addressCity: this.formData.addressCity,
        addressPostalCode: this.formData.addressPostalCode,
        primaryGoal: this.formData.primaryGoal,
        acquisitionSource: this.formData.acquisitionSource
      };

      this.apiService.updateMember(this.editingId, payload).subscribe({
        next: () => {
          this.loadMembers();
          this.closeForm();
          alert('Member updated successfully');
        },
        error: (err) => {
          console.error('Error updating member:', err);
          alert('Failed to update member');
        }
      });
    } else {
      this.apiService.createMember(this.formData).subscribe({
        next: () => {
          this.loadMembers();
          this.closeForm();
          alert('Member created successfully');
        },
        error: (err) => {
          console.error('Error creating member:', err);
          alert('Failed to create member');
        }
      });
    }
  }

  deleteMember(id: number) {
    if (confirm('Are you sure you want to delete this member?')) {
      this.apiService.anonymizeMember(id, 'admin').subscribe({
        next: () => {
          this.loadMembers();
          alert('Member anonymized successfully');
        },
        error: (err) => {
          console.error('Error deleting member:', err);
          alert('Failed to delete member');
        }
      });
    }
  }

  createContract() {
    if (!this.selectedMember || !this.contractForm.planId || !this.contractForm.homeClubId || !this.contractForm.contractType || !this.contractForm.startDate) {
      alert('Fill contract fields (plan, club, type, start date).');
      return;
    }
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
        alert(res.message);
        this.reloadSelected();
      },
      error: (err) => {
        console.error('Error creating contract:', err);
        alert('Failed to create contract');
      }
    });
  }

  freezeContract(contract: ContractSummary) {
    const duration = prompt('Freeze duration in days', '30');
    if (!duration) return;
    this.apiService.freezeContract(contract.id, Number(duration)).subscribe({
      next: (res) => {
        alert(res.message);
        this.reloadSelected();
      },
      error: (err) => {
        console.error('Error freezing contract:', err);
        alert('Failed to freeze contract');
      }
    });
  }

  renewContract(contract: ContractSummary) {
    this.apiService.renewContract(contract.id).subscribe({
      next: (res) => {
        alert(res.message);
        this.reloadSelected();
      },
      error: (err) => {
        console.error('Error renewing contract:', err);
        alert('Failed to renew contract');
      }
    });
  }

  private reloadSelected() {
    if (this.selectedMember) {
      this.selectMember(this.selectedMember);
      this.loadMembers();
    }
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'badge-success';
      case 'Suspended':
      case 'Inactive':
        return 'badge-warning';
      case 'Anonymized':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }
}
