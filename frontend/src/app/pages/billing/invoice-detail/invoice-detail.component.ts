import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, FileText, CreditCard, ArrowLeft, ChevronRight, AlertTriangle, X, Check } from 'lucide-angular';
import { BillingApiService, BillingInvoiceDetailDto } from '../../../shared/services/billing-api.service';
import { invoiceStatusLabel, paymentMethodLabel } from '../../../shared/utils/enum-labels';

type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'PartiallyPaid' | 'Overdue' | 'Cancelled';
type PaymentMethod = 'CreditCard' | 'BankTransfer' | 'Cash' | 'SepaDirectDebit';

interface InvoiceLine {
  description: string;
  lineType: string;
  quantity: number;
  unitPriceExclTax: number;
  lineAmountInclTax: number;
}

interface InvoicePayment {
  id: number;
  paidAt: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionReference: string | null;
}

interface Invoice {
  id: number;
  contractId: number | null;
  memberId: number | null;
  memberName: string;
  invoiceNumber: string;
  issuedOn: string;
  dueDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  amountExclTax: number;
  vatRate: number;
  vatAmount: number;
  amountInclTax: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  payments: InvoicePayment[];
}

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Draft: 'bg-[#F5F6FA] text-[#A6A6A6]',
  Issued: 'bg-[#EBEBFF] text-[#4880FF]',
  Paid: 'bg-[#E0F8EA] text-[#00B69B]',
  PartiallyPaid: 'bg-[#FFF3D6] text-[#FF9066]',
  Overdue: 'bg-[#FFF0F0] text-[#FF4747]',
  Cancelled: 'bg-[#F5F6FA] text-[#A6A6A6]',
};

const LINE_TYPE_CLASSES: Record<string, string> = {
  Subscription: 'bg-[#EBEBFF] text-[#4880FF]',
  Option: 'bg-[#E0F8EA] text-[#00B69B]',
  Penalty: 'bg-[#FFF0F0] text-[#FF4747]',
  Other: 'bg-[#F5F6FA] text-[#6B7280]',
};

function asInvoiceStatus(status: string): InvoiceStatus {
  if (status === 'Draft') return 'Draft';
  if (status === 'Issued') return 'Issued';
  if (status === 'Paid') return 'Paid';
  if (status === 'PartiallyPaid') return 'PartiallyPaid';
  if (status === 'Overdue') return 'Overdue';
  return 'Cancelled';
}

function emptyInvoice(): Invoice {
  return {
    id: 0,
    contractId: null,
    memberId: null,
    memberName: '—',
    invoiceNumber: '—',
    issuedOn: '—',
    dueDate: '—',
    billingPeriodStart: '—',
    billingPeriodEnd: '—',
    amountExclTax: 0,
    vatRate: 0.21,
    vatAmount: 0,
    amountInclTax: 0,
    amountPaid: 0,
    balanceDue: 0,
    status: 'Draft',
    lines: [],
    payments: [],
  };
}

function mapInvoice(dto: BillingInvoiceDetailDto): Invoice {
  return {
    id: dto.id,
    contractId: dto.contractId,
    memberId: dto.memberId,
    memberName: dto.memberName ?? '—',
    invoiceNumber: dto.invoiceNumber,
    issuedOn: dto.issuedOn,
    dueDate: dto.dueDate,
    billingPeriodStart: dto.billingPeriodStart,
    billingPeriodEnd: dto.billingPeriodEnd,
    amountExclTax: dto.amountExclTax,
    vatRate: dto.vatRate,
    vatAmount: dto.vatAmount,
    amountInclTax: dto.amountInclTax,
    amountPaid: dto.amountPaid,
    balanceDue: dto.balanceDue,
    status: asInvoiceStatus(dto.status),
    lines: dto.lines,
    payments: dto.payments,
  };
}

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] shadow-sm px-8 py-4 flex-shrink-0 flex flex-col gap-3">
    <div class="flex items-center text-sm text-[#6B7280] font-medium">
      <button (click)="goBack()" class="hover:text-[#4880FF] transition-colors flex items-center gap-1">
        <lucide-icon [img]="ArrowLeftIcon" [size]="16"></lucide-icon> Back to invoices
      </button>
      <span class="mx-2">/</span>
      <a routerLink="/billing/invoices" class="hover:text-[#4880FF] transition-colors">Invoices</a>
      <lucide-icon [img]="ChevRightIcon" [size]="16" class="mx-1"></lucide-icon>
      <span class="text-[#111827]">{{ invoice().invoiceNumber }}</span>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#EBEBFF] flex items-center justify-center">
          <lucide-icon [img]="FileTextIcon" [size]="24" class="text-[#4880FF]"></lucide-icon>
        </div>
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-[#111827] leading-none">{{ invoice().invoiceNumber }}</h1>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full" [class]="statusClass(invoice().status)">{{ statusLabel(invoice().status) }}</span>
          </div>
          <div class="text-sm text-[#6B7280] flex items-center gap-4">
            <span>Issued: {{ invoice().issuedOn }}</span>
            <span>Due: {{ invoice().dueDate }}</span>
            <span>Period: {{ invoice().billingPeriodStart }} → {{ invoice().billingPeriodEnd }}</span>
          </div>
        </div>
      </div>

      @if (balanceDue() > 0 && invoice().id > 0) {
        <button (click)="showPaymentModal.set(true)"
                class="flex items-center gap-2 px-5 py-2 bg-[#4880FF] rounded-lg text-sm font-bold text-white shadow-[0_4px_15px_rgba(72,128,255,0.25)] hover:bg-[#3b6ee0] transition-all">
          <lucide-icon [img]="CreditCardIcon" [size]="16"></lucide-icon> Record payment
        </button>
      }
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    @if (error()) {
      <div class="mb-4 p-3 rounded-xl border border-[#FF4747]/30 bg-[#FFF0F0] text-[#FF4747] text-sm">
        {{ error() }}
      </div>
    }

    <div class="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      <div class="w-full lg:w-[70%] flex flex-col gap-6">
        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
          <div class="px-6 py-4 border-b border-[#F0F0F0]">
            <h2 class="text-lg font-bold text-[#111827] flex items-center gap-2">
              <lucide-icon [img]="FileTextIcon" [size]="20" class="text-[#4880FF]"></lucide-icon> Invoice lines
            </h2>
          </div>
          <table class="w-full">
            <thead>
              <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                @for (h of lineHeaders; track h) {
                  <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="5" class="px-5 py-10 text-center text-sm text-[#6B7280]">Loading invoice details…</td>
                </tr>
              }
              @if (!loading() && invoice().lines.length === 0) {
                <tr>
                  <td colspan="5" class="px-5 py-10 text-center text-sm text-[#A6A6A6]">No lines found.</td>
                </tr>
              }
              @for (line of invoice().lines; track line.description + line.quantity + line.unitPriceExclTax) {
                <tr class="border-b border-[#F0F0F0] last:border-0">
                  <td class="px-5 py-3 text-sm font-semibold text-[#111827]">{{ line.description }}</td>
                  <td class="px-5 py-3">
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full" [class]="lineTypeClass(line.lineType)">{{ line.lineType }}</span>
                  </td>
                  <td class="px-5 py-3 text-sm text-[#111827]">{{ line.quantity }}</td>
                  <td class="px-5 py-3 text-sm text-[#111827]">{{ line.unitPriceExclTax.toFixed(2) }} €</td>
                  <td class="px-5 py-3 text-sm font-bold text-[#111827]">{{ line.lineAmountInclTax.toFixed(2) }} €</td>
                </tr>
              }
            </tbody>
          </table>

          <div class="px-6 py-4 border-t border-[#E0E0E0] bg-[#F8FAFF]">
            <div class="flex justify-end">
              <div class="w-72 space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-[#6B7280]">Subtotal (excl. VAT)</span>
                  <span class="text-sm font-bold text-[#111827]">{{ totalExclTax().toFixed(2) }} €</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6B7280]">VAT ({{ vatRateLabel() }})</span>
                  <span class="text-sm font-bold text-[#111827]">{{ totalVat().toFixed(2) }} €</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm font-bold text-[#111827]">Total incl. VAT</span>
                  <span class="text-sm font-bold text-[#111827]">{{ totalInclTax().toFixed(2) }} €</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6B7280]">Paid</span>
                  <span class="text-sm font-bold text-[#00B69B]">{{ totalPaid().toFixed(2) }} €</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-[#6B7280]">Balance due</span>
                  <span class="text-sm font-bold" [class]="balanceDue() > 0 ? 'text-[#FF4747]' : 'text-[#111827]'">{{ balanceDue().toFixed(2) }} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
          <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
            <h2 class="text-lg font-bold text-[#111827] flex items-center gap-2">
              <lucide-icon [img]="CreditCardIcon" [size]="20" class="text-[#4880FF]"></lucide-icon> Payments recorded
            </h2>
            <span class="text-sm text-[#6B7280] font-medium">{{ payments().length }} payment{{ payments().length !== 1 ? 's' : '' }}</span>
          </div>
          @if (payments().length === 0) {
            <div class="px-6 py-8 text-center text-sm text-[#A6A6A6]">No payments recorded yet</div>
          } @else {
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#E0E0E0] bg-[#F8FAFF]">
                  @for (h of paymentHeaders; track h) {
                    <th class="text-left text-xs font-bold text-[#6B7280] uppercase px-5 py-3">{{ h }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (p of payments(); track p.id) {
                  <tr class="border-b border-[#F0F0F0] last:border-0">
                    <td class="px-5 py-3 text-sm text-[#6B7280]">{{ p.paidAt }}</td>
                    <td class="px-5 py-3 text-sm font-bold text-[#00B69B]">{{ p.amount.toFixed(2) }} €</td>
                    <td class="px-5 py-3">
                      <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBEBFF] text-[#4880FF]">{{ paymentMethodText(p.paymentMethod) }}</span>
                    </td>
                    <td class="px-5 py-3 text-sm font-mono text-[#6B7280]">{{ p.transactionReference ?? '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      <div class="w-full lg:w-[30%]">
        <div class="sticky top-[100px] flex flex-col gap-6">
          @if (balanceDue() > 0) {
            <div class="bg-[#FFF0F0] border border-[#FF4747]/30 rounded-2xl p-5">
              <h3 class="text-[#FF4747] font-bold flex items-center gap-2 mb-2">
                <lucide-icon [img]="AlertTriangleIcon" [size]="20"></lucide-icon> Balance due
              </h3>
              <p class="text-2xl font-black text-[#FF4747]">{{ balanceDue().toFixed(2) }} €</p>
            </div>
          }

          <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-5">
            <h3 class="font-bold text-[#111827] mb-4">Invoice summary</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#6B7280]">Member</span>
                <span class="text-sm font-bold text-[#111827]">{{ invoice().memberName }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#6B7280]">Contract</span>
                @if (invoice().contractId) {
                  <a [routerLink]="['/contracts', invoice().contractId]" class="text-sm font-bold text-[#4880FF] hover:underline">#{{ invoice().contractId }}</a>
                } @else {
                  <span class="text-sm font-bold text-[#111827]">—</span>
                }
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#6B7280]">Status</span>
                <span class="text-sm font-bold text-[#111827]">{{ statusLabel(invoice().status) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-[#6B7280]">Total</span>
                <span class="text-sm font-bold text-[#111827]">{{ totalInclTax().toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  @if (showPaymentModal()) {
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="!savingPayment() && showPaymentModal.set(false)">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-[#111827]">Record a payment</h3>
          <button (click)="showPaymentModal.set(false)" [disabled]="savingPayment()" class="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6FA] disabled:opacity-50">
            <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Amount (€)</label>
            <input type="number" step="0.01" [(ngModel)]="paymentAmount"
                   [placeholder]="'Max: ' + balanceDue().toFixed(2) + ' €'"
                   class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">Method</label>
            <select [(ngModel)]="paymentMethod"
                    class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF]">
              @for (m of paymentMethods; track m) { <option [value]="m">{{ paymentMethodText(m) }}</option> }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#6B7280] mb-1">
              Transaction reference <span class="text-[#A6A6A6]">(optional)</span>
            </label>
            <input type="text" [(ngModel)]="paymentRef" placeholder="ex: TXN-2026-001"
                   class="w-full bg-[#F5F6FA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[#111827] focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF]" />
          </div>
        </div>
        <div class="flex gap-3 mt-8">
          <button (click)="showPaymentModal.set(false)" [disabled]="savingPayment()"
                  class="flex-1 py-2.5 bg-[#F5F6FA] text-[#6B7280] font-semibold rounded-xl hover:bg-[#E0E0E0] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button (click)="addPayment()" [disabled]="savingPayment()"
                  class="flex-1 py-2.5 bg-[#4880FF] text-white font-semibold rounded-xl hover:bg-[#3b6ee0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon> {{ savingPayment() ? 'Saving…' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class InvoiceDetailComponent {
  readonly FileTextIcon = FileText;
  readonly CreditCardIcon = CreditCard;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ChevRightIcon = ChevronRight;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly XIcon = X;
  readonly CheckIcon = Check;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly billingApi = inject(BillingApiService);

  readonly lineHeaders = ['Description', 'Type', 'Qty', 'Unit price (excl.)', 'Total (incl. VAT)'];
  readonly paymentHeaders = ['Date', 'Amount', 'Method', 'Reference'];
  readonly paymentMethods: PaymentMethod[] = ['CreditCard', 'BankTransfer', 'Cash', 'SepaDirectDebit'];

  invoice = signal<Invoice>(emptyInvoice());
  payments = signal<InvoicePayment[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showPaymentModal = signal(false);
  savingPayment = signal(false);
  paymentAmount = '';
  paymentMethod: PaymentMethod = 'CreditCard';
  paymentRef = '';

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.loadInvoice(id);
    });
  }

  totalExclTax = computed(() => this.invoice().amountExclTax);
  totalVat = computed(() => this.invoice().vatAmount);
  totalInclTax = computed(() => this.invoice().amountInclTax);
  totalPaid = computed(() => this.payments().reduce((sum, payment) => sum + payment.amount, 0));
  balanceDue = computed(() => Math.max(0, this.totalInclTax() - this.totalPaid()));

  vatRateLabel(): string {
    return `${(this.invoice().vatRate * 100).toFixed(0)}%`;
  }

  statusClass(status: InvoiceStatus): string {
    return STATUS_CLASSES[status] ?? 'bg-[#F5F6FA] text-[#A6A6A6]';
  }

  lineTypeClass(lineType: string): string {
    return LINE_TYPE_CLASSES[lineType] ?? 'bg-[#F5F6FA] text-[#6B7280]';
  }

  statusLabel(status: InvoiceStatus): string {
    return invoiceStatusLabel[status] ?? status;
  }

  paymentMethodText(method: string): string {
    return paymentMethodLabel[method] ?? method;
  }

  goBack() {
    this.router.navigate(['/billing/invoices']);
  }

  addPayment() {
    const amount = Number(this.paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > this.balanceDue()) return;

    this.savingPayment.set(true);
    this.error.set(null);
    this.billingApi.recordPayment({
      invoiceId: this.invoice().id,
      amount,
      paymentMethod: this.paymentMethod,
      transactionReference: this.paymentRef.trim() || null,
      errorCode: null,
    }).subscribe({
      next: () => {
        this.showPaymentModal.set(false);
        this.paymentAmount = '';
        this.paymentMethod = 'CreditCard';
        this.paymentRef = '';
        this.loadInvoice(this.invoice().id);
      },
      error: () => {
        this.error.set('Unable to record payment.');
      },
      complete: () => {
        this.savingPayment.set(false);
      },
    });
  }

  private loadInvoice(invoiceId: number) {
    if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
      this.error.set('Invalid invoice id.');
      this.invoice.set(emptyInvoice());
      this.payments.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.billingApi.getInvoiceDetail(invoiceId).subscribe({
      next: (response) => {
        const mapped = mapInvoice(response);
        this.invoice.set(mapped);
        this.payments.set(mapped.payments);
      },
      error: () => {
        this.error.set('Unable to load invoice details.');
        this.invoice.set(emptyInvoice());
        this.payments.set([]);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
}
