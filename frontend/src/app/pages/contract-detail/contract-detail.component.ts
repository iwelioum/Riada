import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeft,
  ChevronRight,
  FileText,
  MapPin,
  AlertTriangle,
  RefreshCcw,
  Snowflake,
  X,
} from 'lucide-angular';
import { getMockContractById } from '../../shared/mocks/riada-data';
import { contractStatusLabel, contractTypeLabel } from '../../shared/utils/enum-labels';

type ContractType = 'FixedTerm' | 'OpenEnded';
type ContractStatus = 'Active' | 'Suspended' | 'Expired' | 'Cancelled';

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  type: string;
}

interface ContractDetailData {
  id: number;
  memberId: string;
  memberName: string;
  planName: string;
  homeClub: string;
  contractType: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string | null;
  freezeStartDate: string | null;
  freezeEndDate: string | null;
  activeOptions: string[];
  alerts: string[];
  billing: {
    totalPaid: number;
    nextDueDate: string;
  };
  timeline: TimelineItem[];
}

const BASE_CONTRACT: ContractDetailData = {
  id: 1,
  memberId: 'm-1234',
  memberName: 'Jean Dupont',
  planName: 'Premium',
  homeClub: 'Brussels',
  contractType: 'OpenEnded',
  status: 'Active',
  startDate: '2025-01-01',
  endDate: null,
  freezeStartDate: null,
  freezeEndDate: null,
  activeOptions: ['Group Classes', 'Sauna Access'],
  alerts: ['Last invoice unpaid', 'No visit in 18 days'],
  billing: {
    totalPaid: 1249.97,
    nextDueDate: '2026-04-01',
  },
  timeline: [
    { id: 1, title: 'Contract created', date: '2025-01-01', type: 'contract' },
    { id: 2, title: 'Payment received — €49.99', date: '2026-03-14', type: 'payment' },
  ],
};

function buildContract(contractId: number): ContractDetailData {
  const source = getMockContractById(contractId);
  if (!source) {
    return { ...BASE_CONTRACT, id: contractId };
  }

  const alerts: string[] = [];
  if (source.status === 'Suspended') alerts.push('Access temporarily blocked');
  if (source.status === 'Cancelled') alerts.push('Contract cancelled');
  if (source.status === 'Expired') alerts.push('Contract expired');

  const activeOptions = source.planName === 'VIP'
    ? ['Group Classes', 'Sauna Access', 'Personal Coaching']
    : source.planName === 'Premium'
      ? ['Group Classes', 'Sauna Access']
      : ['Group Classes'];

  const totalPaid = source.planName === 'VIP' ? 1699.97 : source.planName === 'Premium' ? 1249.97 : 649.97;
  const nextDueDate = source.status === 'Active' || source.status === 'Suspended' ? '2026-04-01' : '—';

  return {
    ...BASE_CONTRACT,
    id: source.id,
    memberId: source.memberId,
    memberName: source.memberName,
    planName: source.planName,
    homeClub: source.homeClub,
    contractType: source.type,
    status: source.status,
    startDate: source.startDate,
    endDate: source.endDate,
    activeOptions,
    alerts,
    billing: {
      totalPaid,
      nextDueDate,
    },
  };
}

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] shadow-sm px-8 py-4">
    <div class="flex items-center text-sm text-[#6B7280] font-medium">
      <button (click)="goBack()" class="hover:text-[#4880FF] flex items-center gap-1">
        <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon>
        Back
      </button>
      <span class="mx-2">/</span>
      <a routerLink="/contracts" class="hover:text-[#4880FF]">Contracts</a>
      <lucide-icon [img]="ChevronRightIcon" [size]="16" class="mx-1"></lucide-icon>
      <span class="text-[#111827]">Contract #{{ contract().id }}</span>
    </div>

    <div class="flex items-center justify-between mt-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-2xl font-bold text-[#111827]">
            {{ contract().planName }}
            <a [routerLink]="['/members', contract().memberId]" class="ml-3 text-sm font-normal text-[#6B7280] hover:text-[#4880FF] hover:underline transition-colors">
              — {{ contract().memberName }}
            </a>
          </h1>
          <span [class]="'px-2.5 py-1 rounded-full text-xs font-bold border ' + statusClasses()">
            {{ statusLabel(contract().status) }}
          </span>
        </div>
        <div class="text-sm text-[#6B7280] flex items-center gap-4">
          <span class="flex items-center gap-1">
            <lucide-icon [img]="MapPinIcon" [size]="14"></lucide-icon>
            {{ contract().homeClub }}
          </span>
          <span class="flex items-center gap-1">
            <lucide-icon [img]="FileTextIcon" [size]="14"></lucide-icon>
            {{ typeLabel(contract().contractType) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 rounded-lg bg-white border border-[#E0E0E0] text-[#6B7280] hover:text-[#4880FF] hover:border-[#4880FF]"
          (click)="renewContract()">
          <lucide-icon [img]="RefreshCcwIcon" [size]="14" class="inline mr-2"></lucide-icon>
          Renew
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-[#4880FF] text-white hover:bg-[#3b6ee0]"
          (click)="showFreezeModal.set(true)">
          <lucide-icon [img]="SnowflakeIcon" [size]="14" class="inline mr-2"></lucide-icon>
          Freeze
        </button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      <div class="w-full lg:w-[70%] flex flex-col gap-6">
        @if (hasFreeze()) {
          <div class="bg-[#FFF3D6] border border-[#FF9066]/20 rounded-2xl p-4 text-[#111827]">
            Contract frozen from {{ contract().freezeStartDate }} to {{ contract().freezeEndDate }}
          </div>
        }

        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
          <h2 class="text-lg font-bold text-[#111827] mb-5">Contract information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            @for (row of infoRows(); track row.label) {
              <div class="flex items-center justify-between gap-4 py-3 border-b border-[#F0F0F0] last:border-0">
                <span class="text-sm text-[#6B7280]">{{ row.label }}</span>
                <span class="text-sm font-semibold text-[#111827] text-right">{{ row.value }}</span>
              </div>
            }
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
          <h2 class="text-lg font-bold text-[#111827] mb-4">Active options</h2>
          <div class="flex flex-wrap gap-2">
            @for (option of contract().activeOptions; track option) {
              <span class="px-3 py-1 bg-[#F5F6FA] text-[#6B7280] rounded-full text-xs font-semibold border border-[#E0E0E0]">{{ option }}</span>
            }
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
          <h2 class="text-lg font-bold text-[#111827] mb-4">Timeline</h2>
          <div class="space-y-4">
            @for (item of contract().timeline; track item.id) {
              <div class="border border-[#E0E0E0] rounded-xl p-4 bg-[#F5F6FA]">
                <p class="text-sm font-semibold text-[#111827]">{{ item.title }}</p>
                <p class="text-xs text-[#6B7280] mt-1">{{ item.date }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="w-full lg:w-[30%]">
        <div class="sticky top-[96px] flex flex-col gap-6">
          <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5">
            <h3 class="font-bold text-[#111827] mb-4">Billing overview</h3>
            <div class="flex items-center justify-between gap-4 py-3 border-b border-[#F0F0F0]">
              <span class="text-sm text-[#6B7280]">Total paid</span>
              <span class="text-sm font-semibold text-[#111827]">€{{ contract().billing.totalPaid.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <span class="text-sm text-[#6B7280]">Next due date</span>
              <span class="text-sm font-semibold text-[#111827]">{{ contract().billing.nextDueDate }}</span>
            </div>
          </div>

          <div class="bg-[#FFF0F0] border border-[#FF4747]/20 rounded-2xl p-5">
            <h3 class="font-bold text-[#FF4747] mb-3">Alerts</h3>
            @if (contract().alerts.length === 0) {
              <p class="text-sm text-[#6B7280]">No active alerts.</p>
            }
            <ul class="space-y-2">
              @for (alert of contract().alerts; track alert) {
                <li class="text-sm text-[#111827] flex items-start gap-2">
                  <lucide-icon [img]="AlertTriangleIcon" [size]="14" class="text-[#FF4747] mt-0.5"></lucide-icon>
                  {{ alert }}
                </li>
              }
            </ul>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5">
            <h3 class="font-bold text-[#111827] mb-3">Actions</h3>
            <button (click)="showFreezeModal.set(true)" class="w-full mb-2 py-3 rounded-xl bg-[#F5F6FA] hover:bg-[#FFF3D6] text-[#6B7280] hover:text-[#FF9066] font-semibold transition-colors">
              Freeze contract
            </button>
            <button (click)="renewContract()" class="w-full py-3 rounded-xl bg-[#4880FF] text-white hover:bg-[#3b6ee0] font-semibold transition-colors">
              Renew contract
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  @if (showFreezeModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showFreezeModal.set(false)">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Freeze contract</h3>
          <button (click)="showFreezeModal.set(false)" class="p-2 rounded-lg hover:bg-[#F5F6FA]">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex gap-2">
            @for (days of [7, 14, 30, 60]; track days) {
              <button
                (click)="freezeDays.set(days)"
                [class]="freezeDays() === days
                  ? 'px-3 py-2 rounded-lg text-sm font-semibold border bg-[#4880FF] text-white border-[#4880FF]'
                  : 'px-3 py-2 rounded-lg text-sm font-semibold border bg-white text-[#6B7280] border-[#E0E0E0]'">
                {{ days }}d
              </button>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Duration (days)</label>
            <input
              type="number"
              min="1"
              [ngModel]="freezeDays()"
              (ngModelChange)="freezeDays.set(max(1, $event))"
              class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#4880FF]"
            />
          </div>

          <div class="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-sm text-[#111827]">
            Estimated freeze: {{ freezeDays() }} day(s)
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button (click)="showFreezeModal.set(false)" class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
          <button (click)="confirmFreeze()" class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class ContractDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly FileTextIcon = FileText;
  readonly MapPinIcon = MapPin;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly RefreshCcwIcon = RefreshCcw;
  readonly SnowflakeIcon = Snowflake;
  readonly XIcon = X;

  contract = signal<ContractDetailData>(buildContract(1));
  showFreezeModal = signal(false);
  freezeDays = signal(14);

  hasFreeze = computed(() => Boolean(this.contract().freezeStartDate && this.contract().freezeEndDate));
  statusClasses = computed(() => {
    const status = this.contract().status;
    if (status === 'Active') return 'bg-[#E0F8EA] text-[#00B69B] border-[#00B69B]/20';
    if (status === 'Suspended') return 'bg-[#FFF3D6] text-[#FF9066] border-[#FF9066]/20';
    if (status === 'Expired') return 'bg-[#FFF0F0] text-[#FF4747] border-[#FF4747]/20';
    return 'bg-[#F5F6FA] text-[#6B7280] border-[#E0E0E0]';
  });

  infoRows = computed(() => {
    const current = this.contract();
    return [
      { label: 'Member', value: current.memberName },
      { label: 'Plan', value: current.planName },
      { label: 'Club', value: current.homeClub },
      { label: 'Type', value: this.typeLabel(current.contractType) },
      { label: 'Status', value: this.statusLabel(current.status) },
      { label: 'Start date', value: current.startDate },
      { label: 'End date', value: current.endDate ?? '—' },
      {
        label: 'Freeze',
        value: current.freezeStartDate && current.freezeEndDate
          ? `${current.freezeStartDate} → ${current.freezeEndDate}`
          : 'No active freeze',
      },
    ];
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id') ?? 1);
      this.contract.set(buildContract(id));
      this.showFreezeModal.set(false);
      this.freezeDays.set(14);
    });
  }

  max(a: number, b: number): number {
    return Math.max(a, Number(b) || 1);
  }

  goBack() {
    this.router.navigate(['/contracts']);
  }

  renewContract() {
    // Placeholder until API integration
  }

  statusLabel(status: ContractStatus): string {
    return contractStatusLabel[status] ?? status;
  }

  typeLabel(type: ContractType): string {
    return contractTypeLabel[type] ?? type;
  }

  confirmFreeze() {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + this.freezeDays());

    this.contract.update((c) => ({
      ...c,
      freezeStartDate: this.formatDate(start),
      freezeEndDate: this.formatDate(end),
      timeline: [
        { id: Date.now(), title: `Contract frozen — ${this.freezeDays()} days`, date: this.formatDate(start), type: 'freeze' },
        ...c.timeline,
      ],
    }));
    this.showFreezeModal.set(false);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }
}

