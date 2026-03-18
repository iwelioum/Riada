import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Plus, FileText, X } from 'lucide-angular';
import { contractStatusLabel, contractTypeLabel } from '../../shared/utils/enum-labels';
import { mockContracts } from '../../shared/mocks/riada-data';

type ContractStatus = 'Active' | 'Suspended' | 'Expired' | 'Cancelled';
type ContractType = 'OpenEnded' | 'FixedTerm';

interface ContractItem {
  id: number;
  memberName: string;
  memberId: string;
  planName: string;
  status: ContractStatus;
  startDate: string;
  endDate: string | null;
  homeClub: string;
  type: ContractType;
}

interface ContractForm {
  memberId: string;
  memberName: string;
  planName: string;
  startDate: string;
  endDate: string;
  homeClub: string;
  type: ContractType;
}

const MOCK_CONTRACTS: ContractItem[] = [...mockContracts];

const emptyForm = (): ContractForm => ({
  memberId: '',
  memberName: '',
  planName: 'Premium',
  startDate: new Date().toISOString().split('T')[0] ?? '',
  endDate: '',
  homeClub: 'Brussels',
  type: 'OpenEnded',
});

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="p-8 h-full flex flex-col max-w-[1440px] mx-auto w-full bg-[#F5F6FA]">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
        <lucide-icon [img]="FileTextIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
        Contracts <span class="text-[#6B7280] font-medium text-lg ml-1">({{ filteredContracts().length }})</span>
      </h1>
      <p class="text-[#6B7280] text-sm mt-1">Manage all member subscriptions and agreements</p>
    </div>
    <button
      (click)="openCreateModal()"
      class="flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] text-white rounded-lg font-semibold shadow-sm hover:shadow-md hover:bg-[#3b6ee0] transition-all">
      <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
      Create Contract
    </button>
  </div>

  <div class="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] flex-1 flex flex-col overflow-hidden">
    <div class="p-6 border-b border-black/5 flex gap-4 items-center bg-white z-10">
      <div class="relative flex-1 max-w-md">
        <lucide-icon [img]="SearchIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"></lucide-icon>
        <input
          type="text"
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
          placeholder="Search by member name or contract ID..."
          class="w-full pl-10 pr-10 py-2.5 bg-[#F5F6FA] border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
        />
        @if (search()) {
          <button (click)="search.set('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]">
            <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
          </button>
        }
      </div>

      <div class="flex gap-2">
        @for (status of statusOptions; track status) {
          <button
            (click)="statusFilter.set(status)"
            [class]="statusFilter() === status
              ? 'px-4 py-2 rounded-xl text-sm font-semibold bg-[#4880FF] text-white shadow-sm transition-all'
              : 'px-4 py-2 rounded-xl text-sm font-semibold bg-[#F5F6FA] text-[#6B7280] hover:bg-[#EAEBF0] hover:text-[#111827] transition-all'">
            {{ status === 'All' ? status : statusLabel(status) }}
          </button>
        }
      </div>
    </div>

    <div class="flex-1 overflow-auto bg-white">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-black/5">
            @for (h of headers; track h) {
              <th class="py-4 px-6 text-xs font-bold text-[#6B7280] uppercase tracking-wider" [class.text-right]="h === 'Actions'">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (filteredContracts().length === 0) {
            <tr>
              <td colspan="7" class="py-12 text-center text-[#6B7280]">
                <lucide-icon [img]="FileTextIcon" [size]="48" class="mx-auto text-[#E0E0E0] mb-3"></lucide-icon>
                <p class="font-semibold text-[#111827]">No contracts found</p>
                <p class="text-sm">Try adjusting your filters</p>
              </td>
            </tr>
          }
          @for (contract of filteredContracts(); track contract.id) {
            <tr
              (click)="openContract(contract.id)"
              class="border-b border-black/5 hover:bg-[#F8FAFF] transition-colors cursor-pointer group">
              <td class="py-4 px-6 font-semibold text-[#111827]">#{{ contract.id }}</td>
              <td class="py-4 px-6">
                <button
                  (click)="openMember(contract.memberId); $event.stopPropagation()"
                  class="font-bold text-[#111827] hover:text-[#4880FF] transition-colors">
                  {{ contract.memberName }}
                </button>
              </td>
              <td class="py-4 px-6 font-medium text-[#6B7280]">{{ contract.planName }}</td>
               <td class="py-4 px-6">
                 <span [class]="'px-2.5 py-1 rounded-full text-xs font-bold ' + statusClass(contract.status)">
                   {{ statusLabel(contract.status) }}
                 </span>
               </td>
               <td class="py-4 px-6 text-sm text-[#6B7280]">{{ typeLabel(contract.type) }}</td>
               <td class="py-4 px-6 text-sm text-[#6B7280]">
                 {{ contract.startDate }} {{ contract.endDate ? '→ ' + contract.endDate : '→ Ongoing' }}
               </td>
              <td class="py-4 px-6 text-right">
                <span class="text-sm font-semibold text-[#4880FF] opacity-0 group-hover:opacity-100 transition-opacity">View details</span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>

  @if (showCreateModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showCreateModal.set(false)">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Create New Contract</h3>
          <button (click)="showCreateModal.set(false)" class="p-2 rounded-lg hover:bg-[#F5F6FA]">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Member Name</label>
            <input class="input-field" [ngModel]="form().memberName" (ngModelChange)="patchForm('memberName', $event)" placeholder="Jean Dupont" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Member ID</label>
            <input class="input-field" [ngModel]="form().memberId" (ngModelChange)="patchForm('memberId', $event)" placeholder="m-1234" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Plan Type</label>
            <select class="input-field" [ngModel]="form().planName" (ngModelChange)="patchForm('planName', $event)">
              @for (plan of ['Basic', 'Premium', 'VIP']; track plan) { <option [value]="plan">{{ plan }}</option> }
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">Start Date</label>
              <input class="input-field" type="date" [ngModel]="form().startDate" (ngModelChange)="patchForm('startDate', $event)" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#6B7280] mb-1">End Date</label>
              <input class="input-field" type="date" [ngModel]="form().endDate" (ngModelChange)="patchForm('endDate', $event)" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Type</label>
            <select class="input-field" [ngModel]="form().type" (ngModelChange)="patchForm('type', $event)">
              <option value="OpenEnded">Open-ended</option>
              <option value="FixedTerm">Fixed-term</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Home club</label>
            <select class="input-field" [ngModel]="form().homeClub" (ngModelChange)="patchForm('homeClub', $event)">
              @for (club of ['Brussels', 'Namur', 'Liege']; track club) { <option [value]="club">{{ club }}</option> }
            </select>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button (click)="showCreateModal.set(false)" class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors">Cancel</button>
          <button (click)="createContract()" class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors">Create</button>
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .input-field {
      @apply w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF];
    }
  `],
})
export class ContractsComponent {
  private router = inject(Router);

  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly FileTextIcon = FileText;
  readonly XIcon = X;

  readonly headers = ['ID', 'Member', 'Plan', 'Status', 'Type', 'Dates', 'Actions'];
  readonly statusOptions: Array<'All' | ContractStatus> = ['All', 'Active', 'Suspended', 'Expired', 'Cancelled'];

  contracts = signal<ContractItem[]>(MOCK_CONTRACTS);
  search = signal('');
  statusFilter = signal<'All' | ContractStatus>('All');
  showCreateModal = signal(false);
  form = signal<ContractForm>(emptyForm());

  filteredContracts = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.contracts().filter((contract) => {
      const matchesSearch = contract.memberName.toLowerCase().includes(query)
        || contract.id.toString().includes(query);
      const matchesStatus = status === 'All' || contract.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  statusClass(status: ContractStatus): string {
    if (status === 'Active') return 'bg-[#E0F8EA] text-[#00B69B]';
    if (status === 'Suspended') return 'bg-[#FFF3D6] text-[#FF9066]';
    if (status === 'Expired' || status === 'Cancelled') return 'bg-[#FFF0F0] text-[#FF4747]';
    return 'bg-[#F5F6FA] text-[#6B7280]';
  }

  statusLabel(status: ContractStatus | 'All'): string {
    if (status === 'All') return status;
    return contractStatusLabel[status] ?? status;
  }

  typeLabel(type: ContractType): string {
    return contractTypeLabel[type] ?? type;
  }

  openContract(contractId: number) {
    this.router.navigate(['/contracts', contractId]);
  }

  openMember(memberId: string) {
    this.router.navigate(['/members', memberId]);
  }

  openCreateModal() {
    this.form.set(emptyForm());
    this.showCreateModal.set(true);
  }

  patchForm(key: keyof ContractForm, value: string) {
    this.form.set({ ...this.form(), [key]: value } as ContractForm);
  }

  createContract() {
    const payload = this.form();
    if (!payload.memberName.trim() || !payload.memberId.trim() || !payload.planName.trim()) {
      return;
    }
    const next: ContractItem = {
      id: Math.max(0, ...this.contracts().map((c) => c.id)) + 1,
      memberName: payload.memberName.trim(),
      memberId: payload.memberId.trim(),
      planName: payload.planName,
      status: 'Active',
      startDate: payload.startDate,
      endDate: payload.endDate || null,
      homeClub: payload.homeClub,
      type: payload.type,
    };
    this.contracts.set([next, ...this.contracts()]);
    this.showCreateModal.set(false);
  }
}

