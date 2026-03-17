import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { RoleService } from '../../core/services/role.service';
import {
  AccessCheckResponse,
  ClubSummary,
  ContractSummary,
  CreateContractPayload,
  MemberDetail,
  SubscriptionPlan
} from '../../core/models/api-models';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss'
})
export class MemberDetailComponent implements OnInit {
  member: MemberDetail | null = null;
  loading = true;
  error: string | null = null;

  plans: SubscriptionPlan[] = [];
  clubs: ClubSummary[] = [];
  metaLoading = false;

  // Contract actions
  contractActionLoadingId: number | null = null;
  contractError: string | null = null;
  contractSuccess: string | null = null;
  creatingContract = false;
  freezeDurations: Partial<Record<number, number>> = {};

  contractForm: { planId: number | null; homeClubId: number | null; contractType: string; startDate: string; endDate?: string | null } = {
    planId: null,
    homeClubId: null,
    contractType: 'FixedTerm',
    startDate: new Date().toISOString().split('T')[0]
  };

  // Check-in
  checkInClubId: number | null = null;
  checkInLoading = false;
  checkInResult: AccessCheckResponse | null = null;
  checkInError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private role: RoleService
  ) {}

  get canManageContracts(): boolean {
    return this.role.hasAnyRole(['admin', 'billing', 'portique']);
  }

  get canMemberEnter(): boolean {
    return this.member?.status === 'Active';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/members']); return; }

    this.loading = true;
    this.api.getMemberDetail(id).subscribe({
      next: (detail) => {
        this.member = detail;
        this.freezeDurations = Object.fromEntries(detail.contracts.map(c => [c.id, 30]));
        this.loading = false;
        this.loadMeta();
      },
      error: (err) => {
        this.error = this.getErrorMessage(err, 'Unable to load member profile.');
        this.loading = false;
      }
    });
  }

  private loadMeta(): void {
    this.metaLoading = true;
    forkJoin({
      clubs: this.api.listClubs().pipe(catchError(() => of([] as ClubSummary[]))),
      plans: this.canManageContracts
        ? this.api.listSubscriptionPlans().pipe(catchError(() => of([] as SubscriptionPlan[])))
        : of([] as SubscriptionPlan[])
    }).subscribe({
      next: ({ clubs, plans }) => {
        this.clubs = clubs;
        this.plans = plans;
        const homeClub = clubs.find(c => c.name === this.member?.homeClub);
        this.checkInClubId = homeClub?.id ?? clubs[0]?.id ?? null;
        this.metaLoading = false;
      },
      error: () => { this.metaLoading = false; }
    });
  }

  checkIn(): void {
    if (!this.member || !this.checkInClubId || this.checkInLoading) return;
    this.checkInLoading = true;
    this.checkInResult = null;
    this.checkInError = null;
    this.api.checkMemberAccess({ memberId: this.member.id, clubId: this.checkInClubId }).subscribe({
      next: (result) => { this.checkInResult = result; this.checkInLoading = false; },
      error: (err) => { this.checkInError = this.getErrorMessage(err, 'Check-in failed.'); this.checkInLoading = false; }
    });
  }

  freezeContract(contract: ContractSummary): void {
    if (this.contractActionLoadingId !== null) return;
    const duration = this.freezeDurations[contract.id] ?? 30;
    this.contractActionLoadingId = contract.id;
    this.clearContractMessages();
    this.api.freezeContract(contract.id, duration).subscribe({
      next: (res) => { this.contractSuccess = res.message; this.reloadMember(); this.contractActionLoadingId = null; },
      error: (err) => { this.contractError = this.getErrorMessage(err, 'Freeze failed.'); this.contractActionLoadingId = null; }
    });
  }

  renewContract(contract: ContractSummary): void {
    if (this.contractActionLoadingId !== null) return;
    this.contractActionLoadingId = contract.id;
    this.clearContractMessages();
    this.api.renewContract(contract.id).subscribe({
      next: (res) => { this.contractSuccess = res.message; this.reloadMember(); this.contractActionLoadingId = null; },
      error: (err) => { this.contractError = this.getErrorMessage(err, 'Renew failed.'); this.contractActionLoadingId = null; }
    });
  }

  createContract(): void {
    if (this.creatingContract || !this.member) return;
    if (!this.contractForm.planId || !this.contractForm.homeClubId) {
      this.contractError = 'Select a plan and a club.';
      return;
    }
    this.creatingContract = true;
    this.clearContractMessages();
    const payload: CreateContractPayload = {
      memberId: this.member.id,
      planId: Number(this.contractForm.planId),
      homeClubId: Number(this.contractForm.homeClubId),
      contractType: this.contractForm.contractType,
      startDate: this.contractForm.startDate,
      endDate: this.contractForm.endDate || null
    };
    this.api.createContract(payload).subscribe({
      next: (res) => { this.contractSuccess = res.message; this.reloadMember(); this.creatingContract = false; },
      error: (err) => { this.contractError = this.getErrorMessage(err, 'Failed to create contract.'); this.creatingContract = false; }
    });
  }

  setFreezeDuration(contractId: number, value: number | string): void {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      this.freezeDurations[contractId] = Math.floor(parsed);
    }
  }

  isContractActionLoading(id: number): boolean {
    return this.contractActionLoadingId === id;
  }

  goBack(): void {
    this.router.navigate(['/members']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active': return 'badge-success';
      case 'Suspended': case 'Inactive': case 'Pending': return 'badge-warning';
      case 'Anonymized': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  private reloadMember(): void {
    if (!this.member) return;
    this.api.getMemberDetail(this.member.id).subscribe({
      next: (detail) => {
        this.member = detail;
        this.freezeDurations = Object.fromEntries(detail.contracts.map(c => [c.id, 30]));
      }
    });
  }

  private clearContractMessages(): void {
    this.contractError = null;
    this.contractSuccess = null;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) return 'Session expired. Sign in again.';
      if (error.status === 403) return 'Your role is not allowed to perform this action.';
      const msg = error.error?.message ?? error.error?.Message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    return fallback;
  }
}
