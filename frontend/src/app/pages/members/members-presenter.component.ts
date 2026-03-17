import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateMemberPayload, MemberSummary } from '../../core/models/api-models';

interface MemberFilters {
  status: string;
  search: string;
}

@Component({
  selector: 'app-members-presenter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members-presenter.component.html',
  styleUrl: './members-presenter.component.scss'
})
export class MembersPresenterComponent {
  @Input() members: MemberSummary[] = [];
  @Input() loading = false;
  @Input() metaLoading = false;
  @Input() formLoading = false;
  @Input() error: string | null = null;
  @Input() metaError: string | null = null;
  @Input() actionError: string | null = null;
  @Input() successMessage: string | null = null;
  @Input() formError: string | null = null;
  @Input() savingMember = false;
  @Input() anonymizeConfirmId: number | null = null;
  @Input() anonymizingMemberId: number | null = null;
  @Input() showForm = false;
  @Input() editingId: number | null = null;
  @Input() hasLoadedMembers = false;
  @Input() canManageMembers = false;
  @Input() page = 1;
  @Input() pageSize = 25;
  @Input() totalCount = 0;
  @Input() totalPages = 0;
  @Input() hasNext = false;
  @Input() hasPrevious = false;
  @Input() filters: MemberFilters = { status: '', search: '' };
  @Input() formData: CreateMemberPayload = {
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
    acquisitionSource: '',
    marketingConsent: true,
    medicalCertificateProvided: false
  };

  @Output() applyFiltersRequested = new EventEmitter<void>();
  @Output() pageChanged = new EventEmitter<'previous' | 'next'>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() viewMemberRequested = new EventEmitter<MemberSummary>();
  @Output() openAddFormRequested = new EventEmitter<void>();
  @Output() closeFormRequested = new EventEmitter<void>();
  @Output() editMemberRequested = new EventEmitter<MemberSummary>();
  @Output() saveMemberRequested = new EventEmitter<void>();
  @Output() requestDeleteMemberRequested = new EventEmitter<number>();
  @Output() cancelDeleteMemberRequested = new EventEmitter<void>();
  @Output() deleteMemberRequested = new EventEmitter<number>();

  applyFilters(): void {
    this.applyFiltersRequested.emit();
  }

  changePage(direction: 'previous' | 'next'): void {
    this.pageChanged.emit(direction);
  }

  changePageSize(pageSize: number | string): void {
    const normalized = Number(pageSize);
    if (Number.isFinite(normalized) && normalized > 0) {
      this.pageSizeChanged.emit(normalized);
    }
  }

  viewMember(member: MemberSummary): void {
    this.viewMemberRequested.emit(member);
  }

  openAddForm(): void {
    this.openAddFormRequested.emit();
  }

  closeForm(): void {
    this.closeFormRequested.emit();
  }

  editMember(member: MemberSummary): void {
    this.editMemberRequested.emit(member);
  }

  saveMember(): void {
    this.saveMemberRequested.emit();
  }

  requestDeleteMember(id: number): void {
    this.requestDeleteMemberRequested.emit(id);
  }

  cancelDeleteMember(): void {
    this.cancelDeleteMemberRequested.emit();
  }

  deleteMember(id: number): void {
    this.deleteMemberRequested.emit(id);
  }

  canMemberEnter(status: string): boolean {
    return status === 'Active';
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

  get pageStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }
    return (this.page - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    if (this.totalCount === 0) {
      return 0;
    }
    return Math.min(this.totalCount, this.page * this.pageSize);
  }
}
