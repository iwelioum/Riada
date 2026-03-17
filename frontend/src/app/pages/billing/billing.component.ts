import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { InvoiceDetail } from '../../core/models/api-models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent {
  invoice: InvoiceDetail | null = null;
  invoiceLookupAttempted = false;

  invoiceIdInput: number | null = null;
  generateForm = {
    contractId: null as number | null
  };
  paymentForm = {
    amount: '',
    paymentMethod: 'SepaDirectDebit',
    transactionReference: ''
  };

  loadingInvoice = false;
  generatingInvoice = false;
  recordingPayment = false;
  showPaymentForm = false;

  invoiceError: string | null = null;
  generateError: string | null = null;
  paymentError: string | null = null;
  successMessage: string | null = null;

  readonly paymentMethodOptions = [
    { value: 'SepaDirectDebit', label: 'SEPA Direct Debit' },
    { value: 'CreditCard', label: 'Credit Card' },
    { value: 'Cash', label: 'Cash' },
    { value: 'BankTransfer', label: 'Bank Transfer' }
  ];

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  get isBusy(): boolean {
    return this.loadingInvoice || this.generatingInvoice || this.recordingPayment;
  }

  get canGenerateInvoice(): boolean {
    return !this.isBusy && this.toPositiveInteger(this.generateForm.contractId) !== null;
  }

  get canLoadInvoice(): boolean {
    return !this.isBusy && this.toPositiveInteger(this.invoiceIdInput) !== null;
  }

  get isContractIdInvalid(): boolean {
    return this.generateForm.contractId !== null && this.toPositiveInteger(this.generateForm.contractId) === null;
  }

  get isInvoiceIdInvalid(): boolean {
    return this.invoiceIdInput !== null && this.toPositiveInteger(this.invoiceIdInput) === null;
  }

  get contractIdHelperText(): string {
    if (this.generateForm.contractId === null) {
      return 'Enter contract ID to start the billing flow.';
    }

    return this.isContractIdInvalid ? 'Contract ID must be a positive integer.' : 'Ready to generate invoice.';
  }

  get invoiceIdHelperText(): string {
    if (this.invoiceIdInput === null) {
      return 'Use invoice ID from step 1, then load invoice details.';
    }

    return this.isInvoiceIdInvalid ? 'Invoice ID must be a positive integer.' : 'Ready to load invoice details.';
  }

  get workflowHint(): string {
    if (this.generatingInvoice) {
      return 'Step 1/3 in progress: generating invoice.';
    }

    if (this.loadingInvoice) {
      return 'Step 2/3 in progress: loading invoice details.';
    }

    if (this.recordingPayment) {
      return 'Step 3/3 in progress: recording payment.';
    }

    if (this.invoice && this.canRecordPayment) {
      return 'Step 3/3 ready: review invoice and record payment.';
    }

    if (this.invoice && !this.canRecordPayment) {
      return 'Workflow complete for this invoice. No additional payment can be recorded.';
    }

    if (this.canLoadInvoice) {
      return 'Step 2/3 ready: load invoice details.';
    }

    return 'Step 1/3 ready: generate a monthly invoice.';
  }

  get paymentUnavailableReason(): string {
    if (!this.invoice) {
      return 'Load an invoice before recording a payment.';
    }

    if (this.invoice.balanceDue <= 0) {
      return 'No remaining balance on this invoice.';
    }

    if (this.normalizeStatus(this.invoice.status) === 'cancelled') {
      return 'Cancelled invoices cannot receive payments.';
    }

    return 'This invoice cannot receive additional successful payments.';
  }

  get paymentAmountFieldError(): string | null {
    if (!this.showPaymentForm) {
      return null;
    }

    return this.getPaymentAmountError(this.invoice);
  }

  get paymentMethodFieldError(): string | null {
    if (!this.showPaymentForm) {
      return null;
    }

    return this.getPaymentMethodError();
  }

  get paymentReferenceFieldError(): string | null {
    if (!this.showPaymentForm) {
      return null;
    }

    return this.getTransactionReferenceError();
  }

  get canSubmitPayment(): boolean {
    if (!this.invoice || !this.canRecordPayment || this.recordingPayment) {
      return false;
    }

    return this.getFirstPaymentValidationError(this.invoice) === null;
  }

  get canRecordPayment(): boolean {
    if (!this.invoice || this.invoice.balanceDue <= 0) {
      return false;
    }

    return this.normalizeStatus(this.invoice.status) !== 'cancelled';
  }

  loadInvoice(clearMessages = true): void {
    if (clearMessages) {
      this.clearFeedback();
    } else {
      this.invoiceError = null;
      this.paymentError = null;
    }

    this.invoiceLookupAttempted = true;
    this.showPaymentForm = false;

    const invoiceId = this.toPositiveInteger(this.invoiceIdInput);
    if (invoiceId === null) {
      this.invoice = null;
      this.invoiceError = 'Invoice ID must be a positive integer.';
      this.cdr.markForCheck();
      return;
    }

    this.loadingInvoice = true;
    this.apiService
      .getInvoiceDetail(invoiceId)
      .pipe(
        finalize(() => {
          this.loadingInvoice = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (invoice) => {
          this.invoice = invoice;
          this.resetPaymentForm(invoice);
        },
        error: (error) => {
          this.invoice = null;
          this.invoiceError = this.toApiErrorMessage(error, 'load-invoice');
        }
      });
  }

  generateInvoice(): void {
    this.clearFeedback();

    const contractId = this.toPositiveInteger(this.generateForm.contractId);
    if (contractId === null) {
      this.generateError = 'Contract ID must be a positive integer.';
      this.cdr.markForCheck();
      return;
    }

    this.generatingInvoice = true;
    this.apiService
      .generateMonthlyInvoice({ contractId })
      .pipe(
        finalize(() => {
          this.generatingInvoice = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          const generatedInvoiceId = this.extractGeneratedInvoiceId(response.message);
          if (generatedInvoiceId) {
            this.invoiceIdInput = generatedInvoiceId;
            this.successMessage = `Invoice generated successfully. Loading invoice #${generatedInvoiceId}.`;
            this.loadInvoice(false);
            return;
          }

          this.successMessage = 'Invoice generated successfully. Load invoice details using the invoice ID.';
        },
        error: (error) => {
          this.generateError = this.toApiErrorMessage(error, 'generate-invoice');
        }
      });
  }

  openPaymentForm(): void {
    this.successMessage = null;
    this.paymentError = null;

    if (!this.invoice) {
      this.paymentError = 'Load an invoice before recording a payment.';
      return;
    }

    if (!this.canRecordPayment) {
      this.paymentError = this.paymentUnavailableReason;
      return;
    }

    this.showPaymentForm = true;
    this.resetPaymentForm(this.invoice);
  }

  cancelPaymentForm(): void {
    this.showPaymentForm = false;
    this.paymentError = null;
  }

  submitPayment(): void {
    this.successMessage = null;
    this.paymentError = null;

    const invoice = this.invoice;
    if (!invoice) {
      this.paymentError = 'Load an invoice before recording a payment.';
      return;
    }

    const validationError = this.getFirstPaymentValidationError(invoice);
    if (validationError) {
      this.paymentError = validationError;
      return;
    }

    const amount = Number(this.paymentForm.amount);
    const paymentMethod = this.paymentForm.paymentMethod.trim();
    const transactionReference = this.paymentForm.transactionReference.trim();

    this.recordingPayment = true;
    this.apiService
      .recordPayment({
        invoiceId: invoice.id,
        amount: Number(amount.toFixed(2)),
        paymentMethod,
        transactionReference
      })
      .pipe(
        finalize(() => {
          this.recordingPayment = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (payment) => {
          this.successMessage = `Payment #${payment.id} recorded successfully.`;
          this.showPaymentForm = false;
          this.loadInvoice(false);
        },
        error: (error) => {
          this.paymentError = this.toApiErrorMessage(error, 'record-payment');
        }
      });
  }

  getInvoiceStatusBadgeClass(status: string): string {
    switch (this.normalizeStatus(status)) {
      case 'issued':
        return 'badge-issued';
      case 'partiallypaid':
        return 'badge-partially-paid';
      case 'paid':
        return 'badge-paid';
      case 'overdue':
        return 'badge-overdue';
      case 'cancelled':
        return 'badge-cancelled';
      case 'draft':
        return 'badge-draft';
      case 'pending':
        return 'badge-pending';
      default:
        return 'badge-unknown';
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (this.normalizeStatus(status)) {
      case 'succeeded':
        return 'badge-success';
      case 'failed':
        return 'badge-danger';
      case 'pending':
        return 'badge-warning';
      case 'refunded':
        return 'badge-neutral';
      default:
        return 'badge-info';
    }
  }

  formatStatusLabel(status: string): string {
    const normalized = (status ?? '')
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();

    return normalized.length > 0 ? normalized : 'Unknown';
  }

  getLineAmountExclTax(line: InvoiceDetail['lines'][number]): number {
    return Number((line.quantity * line.unitPriceExclTax).toFixed(2));
  }

  getLineVatAmount(line: InvoiceDetail['lines'][number]): number {
    return Number((line.lineAmountInclTax - this.getLineAmountExclTax(line)).toFixed(2));
  }

  getSortedPayments(): InvoiceDetail['payments'] {
    if (!this.invoice) {
      return [];
    }

    return [...this.invoice.payments].sort((left, right) => {
      const rightTime = new Date(right.paidAt).getTime();
      const leftTime = new Date(left.paidAt).getTime();
      return rightTime - leftTime;
    });
  }

  private clearFeedback(): void {
    this.successMessage = null;
    this.invoiceError = null;
    this.generateError = null;
    this.paymentError = null;
  }

  private resetPaymentForm(invoice: InvoiceDetail): void {
    this.paymentForm = {
      amount: invoice.balanceDue > 0 ? invoice.balanceDue.toFixed(2) : '',
      paymentMethod: 'SepaDirectDebit',
      transactionReference: ''
    };
  }

  private normalizeStatus(status: string): string {
    return (status ?? '').replace(/[\s_-]/g, '').toLowerCase();
  }

  private toPositiveInteger(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numericValue = Number(value);
    return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
  }

  private extractGeneratedInvoiceId(message: string): number | null {
    const match = /id\s*=\s*(\d+)/i.exec(message);
    if (!match) {
      return null;
    }

    const value = Number(match[1]);
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  private toApiErrorMessage(error: unknown, operation: 'load-invoice' | 'generate-invoice' | 'record-payment'): string {
    const defaultMessageByOperation: Record<typeof operation, string> = {
      'load-invoice': 'Failed to load invoice details.',
      'generate-invoice': 'Failed to generate invoice.',
      'record-payment': 'Failed to record payment.'
    };

    if (!(error instanceof HttpErrorResponse)) {
      return defaultMessageByOperation[operation];
    }

    const statusMessage = this.getStatusMessage(error.status, operation);
    const backendMessage = this.extractBackendMessage(error);
    const detailMessages = this.extractDetailMessages(error);

    const messages = [statusMessage];
    if (backendMessage && backendMessage.toLowerCase() !== statusMessage.toLowerCase()) {
      messages.push(backendMessage);
    }
    if (detailMessages.length > 0) {
      messages.push(`Details: ${detailMessages.join(' | ')}`);
    }

    return messages.filter((message) => message.trim().length > 0).join(' ');
  }

  private getStatusMessage(
    status: number,
    operation: 'load-invoice' | 'generate-invoice' | 'record-payment'
  ): string {
    switch (status) {
      case 0:
        return 'Billing service is unreachable. Verify backend availability and retry.';
      case 400:
        if (operation === 'generate-invoice') {
          return 'Contract details are invalid. Check the contract ID and try again.';
        }
        if (operation === 'record-payment') {
          return 'Payment details are invalid. Check amount, method, and reference.';
        }
        return 'Invoice ID is invalid. Enter a valid invoice ID and try again.';
      case 401:
        return 'Your session has expired. Sign in again to continue.';
      case 403:
        return 'You are not allowed to perform this billing action.';
      case 404:
        return operation === 'load-invoice'
          ? 'Invoice not found. Verify the invoice ID.'
          : 'Requested billing resource was not found.';
      case 409:
        return 'This action conflicts with the current invoice state. Refresh and try again.';
      case 422:
        return 'Business rules blocked this action. Review the details and adjust the request.';
      default:
        return 'Unexpected billing API error.';
    }
  }

  private extractBackendMessage(error: HttpErrorResponse): string | null {
    const payload = error.error;
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload.trim();
    }

    const message = payload?.message ?? payload?.Message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message.trim();
    }

    return null;
  }

  private extractDetailMessages(error: HttpErrorResponse): string[] {
    const details = error.error?.details ?? error.error?.Details;
    if (!details) {
      return [];
    }

    if (typeof details === 'string') {
      return [details];
    }

    if (!Array.isArray(details)) {
      return [];
    }

    return details
      .map((detail: any) => {
        if (typeof detail === 'string') {
          return detail;
        }

        const property = detail?.propertyName ?? detail?.PropertyName ?? detail?.field ?? '';
        const message = detail?.errorMessage ?? detail?.ErrorMessage ?? detail?.message ?? '';
        if (!message) {
          return '';
        }

        return property ? `${property}: ${message}` : String(message);
      })
      .filter((message: string) => message.trim().length > 0);
  }

  private getPaymentAmountError(invoice: InvoiceDetail | null): string | null {
    if (!invoice) {
      return 'Load an invoice before recording a payment.';
    }

    const amount = Number(this.paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return 'Payment amount must be greater than 0.';
    }

    if (amount > invoice.balanceDue + 0.01) {
      return `Payment amount cannot exceed remaining balance (${invoice.balanceDue.toFixed(2)}).`;
    }

    return null;
  }

  private getPaymentMethodError(): string | null {
    const paymentMethod = this.paymentForm.paymentMethod.trim();
    if (!this.paymentMethodOptions.some((option) => option.value === paymentMethod)) {
      return 'Select one of the payment methods supported by the backend.';
    }

    return null;
  }

  private getTransactionReferenceError(): string | null {
    const transactionReference = this.paymentForm.transactionReference.trim();
    if (!transactionReference) {
      return 'Transaction reference is required for successful payments.';
    }

    return null;
  }

  private getFirstPaymentValidationError(invoice: InvoiceDetail | null): string | null {
    return (
      this.getPaymentAmountError(invoice) ??
      this.getPaymentMethodError() ??
      this.getTransactionReferenceError()
    );
  }
}
