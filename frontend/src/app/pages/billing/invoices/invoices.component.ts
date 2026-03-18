import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, FileText, Plus, X, Search } from 'lucide-angular';
import { BillingApiService, BillingInvoiceSummaryDto } from '../../../shared/services/billing-api.service';
import { invoiceStatusLabel } from '../../../shared/utils/enum-labels';

type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'PartiallyPaid' | 'Overdue' | 'Cancelled';

interface Invoice {
  id: number;
  invoiceNumber: string;
  issuedOn: string;
  dueDate: string;
  amountInclTax: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  contractId: number | null;
  memberId: number | null;
  memberName: string;
}

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Draft: 'bg-[#F5F6FA] text-[#A6A6A6]',
  Issued: 'bg-[#EBEBFF] text-[#4880FF]',
  Paid: 'bg-[#E0F8EA] text-[#00B69B]',
  PartiallyPaid: 'bg-[#FFF3D6] text-[#FF9066]',
  Overdue: 'bg-[#FFF0F0] text-[#FF4747]',
  Cancelled: 'bg-[#F5F6FA] text-[#A6A6A6]',
};

function asInvoiceStatus(status: string): InvoiceStatus {
  if (status === 'Draft') return 'Draft';
  if (status === 'Issued') return 'Issued';
  if (status === 'Paid') return 'Paid';
  if (status === 'PartiallyPaid') return 'PartiallyPaid';
  if (status === 'Overdue') return 'Overdue';
  return 'Cancelled';
}

function mapInvoice(dto: BillingInvoiceSummaryDto): Invoice {
  return {
    id: dto.id,
    invoiceNumber: dto.invoiceNumber,
    issuedOn: dto.issuedOn,
    dueDate: dto.dueDate,
    amountInclTax: dto.amountInclTax,
    amountPaid: dto.amountPaid,
    balanceDue: dto.balanceDue,
    status: asInvoiceStatus(dto.status),
    contractId: dto.contractId,
    memberId: dto.memberId,
    memberName: dto.memberName ?? '—',
  };
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
          <lucide-icon [img]="FileTextIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
          Invoices
        </h1>
        <p class="text-sm text-[#6B7280] mt-1">{{ filteredInvoices().length }} invoice{{ filteredInvoices().length !== 1 ? 's' : '' }}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-3 py-2 w-64">
          <lucide-icon [img]="SearchIcon" [size]="16" class="text-[#A6A6A6] shrink-0"></lucide-icon>
          <input
            type="text"
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Search invoice or member…"
            class="text-sm text-[#111827] bg-transparent focus:outline-none w-full placeholder:text-[#A6A6A6]"
          />
        </div>
        <button
          (click)="showGenerateModal.set(true)"
          class="flex items-center gap-2 px-4 py-2 bg-[#4880FF] rounded-xl text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all">
          <lucide-icon [img]="PlusIcon" [size]="16"></lucide-icon>
          Generate invoice
        </button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    @if (error()) {
      <div class="mb-4 p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
        {{ error() }}
      </div>
    }

    <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
            @for (h of headers; track h) {
              <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td colspan="9" class="px-5 py-12 text-center text-sm text-[#6B7280]">Loading invoices…</td>
            </tr>
          }
          @if (!loading() && filteredInvoices().length === 0) {
            <tr>
              <td colspan="9" class="px-5 py-12 text-center text-sm text-[#A6A6A6]">No invoices found</td>
            </tr>
          }
          @for (inv of filteredInvoices(); track inv.id) {
            <tr
              class="border-b border-[#F0F0F0] hover:bg-[#F8FAFF] transition-colors cursor-pointer"
              (click)="openInvoice(inv.id)">
              <td class="px-5 py-4 font-bold text-[#4880FF]">{{ inv.invoiceNumber }}</td>
              <td class="px-5 py-4 text-sm font-semibold text-[#111827]">{{ inv.memberName }}</td>
              <td class="px-5 py-4 text-sm text-[#6B7280]">{{ inv.issuedOn }}</td>
              <td class="px-5 py-4 text-sm text-[#6B7280]">{{ inv.dueDate }}</td>
              <td class="px-5 py-4 text-sm font-semibold text-[#111827]">{{ inv.amountInclTax.toFixed(2) }} €</td>
              <td class="px-5 py-4 text-sm font-semibold text-[#00B69B]">{{ inv.amountPaid.toFixed(2) }} €</td>
              <td class="px-5 py-4 text-sm font-semibold">
                @if (inv.balanceDue > 0) { <span class="text-[#FF4747]">{{ inv.balanceDue.toFixed(2) }} €</span> } @else { <span class="text-[#A6A6A6]">—</span> }
              </td>
              <td class="px-5 py-4">
                <span [class]="'text-xs font-bold px-2.5 py-1 rounded-full ' + statusClass(inv.status)">{{ statusLabel(inv.status) }}</span>
              </td>
              <td class="px-5 py-4">
                <span class="text-sm text-[#4880FF] font-semibold hover:underline">View →</span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>

  @if (showGenerateModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showGenerateModal.set(false)">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Generate invoice</h3>
          <button (click)="showGenerateModal.set(false)" [disabled]="generating()" class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA] disabled:opacity-50">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Contract ID</label>
            <input
              type="number"
              [ngModel]="contractId()"
              (ngModelChange)="contractId.set($event)"
              placeholder="ex: 1"
              class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]"
            />
          </div>
          <div class="p-4 bg-[#F8FAFF] rounded-xl border border-[#EBEBFF] text-sm text-[#6B7280]">
            Calls <code class="bg-[#F0F0F0] px-1.5 py-0.5 rounded text-xs font-mono text-[#111827]">POST /api/billing/generate</code>
            with the given ContractId.
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button (click)="showGenerateModal.set(false)" [disabled]="generating()" class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors disabled:opacity-50">Cancel</button>
          <button (click)="handleGenerate()" [disabled]="generating()" class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors disabled:opacity-50">{{ generating() ? 'Generating…' : 'Generate' }}</button>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class InvoicesComponent implements OnInit {
  private router = inject(Router);
  private billingApi = inject(BillingApiService);

  readonly FileTextIcon = FileText;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly SearchIcon = Search;
  readonly headers = ['Invoice #', 'Member', 'Issued', 'Due date', 'Amount', 'Paid', 'Balance', 'Status', ''];

  invoices = signal<Invoice[]>([]);
  search = signal('');
  showGenerateModal = signal(false);
  contractId = signal('');
  loading = signal(true);
  generating = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadInvoices();
  }

  filteredInvoices = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.invoices().filter((inv) =>
      inv.invoiceNumber.toLowerCase().includes(query)
      || inv.memberName.toLowerCase().includes(query)
    );
  });

  statusClass(status: InvoiceStatus): string {
    return STATUS_CLASSES[status];
  }

  statusLabel(status: InvoiceStatus): string {
    return invoiceStatusLabel[status] ?? status;
  }

  openInvoice(id: number) {
    this.router.navigate(['/billing/invoices', id]);
  }

  handleGenerate() {
    if (!this.contractId().trim()) return;
    const contractId = Number(this.contractId());
    if (!Number.isFinite(contractId) || contractId <= 0) return;
    this.generating.set(true);
    this.error.set(null);
    this.billingApi.generateInvoice({ contractId }).subscribe({
      next: () => {
        this.showGenerateModal.set(false);
        this.contractId.set('');
        this.loadInvoices();
      },
      error: () => {
        this.error.set('Unable to generate invoice.');
      },
      complete: () => {
        this.generating.set(false);
      },
    });
  }

  private loadInvoices(): void {
    this.loading.set(true);
    this.error.set(null);
    this.billingApi.listInvoices().subscribe({
      next: (invoices) => this.invoices.set(invoices.map(mapInvoice)),
      error: () => this.error.set('Unable to load invoices.'),
      complete: () => this.loading.set(false),
    });
  }
}

