import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { InvoiceDetail } from '../../core/models/api-models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {
  invoices: InvoiceDetail[] = [];
  loading = false;
  totalRevenue = 0;
  paidAmount = 0;
  pendingAmount = 0;
  invoiceIdInput: number | null = 1;
  invoiceLookupAttempted = false;
  hasLoadedInvoice = false;
  activePaymentInvoiceId: number | null = null;
  recordingPayment = false;
  generatingInvoice = false;
  paymentError: string | null = null;
  successMessage: string | null = null;
  generateError: string | null = null;
  paymentForm = {
    amount: '',
    paymentMethod: 'Manual',
    transactionReference: ''
  };
  generateForm = {
    clubId: 1,
    periodYear: new Date().getFullYear(),
    periodMonth: new Date().getMonth() + 1
  };
  lastError: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceLookupAttempted = true;
    this.hasLoadedInvoice = false;
    this.activePaymentInvoiceId = null;
    this.paymentError = null;
    this.lastError = null;

    if (!this.invoiceIdInput || this.invoiceIdInput < 1) {
      this.invoices = [];
      this.lastError = 'Invoice ID must be greater than 0.';
      this.calculateStats();
      this.hasLoadedInvoice = true;
      return;
    }

    this.loading = true;
    const invoiceId = Number(this.invoiceIdInput);
    this.apiService.getInvoiceDetail(invoiceId).subscribe({
      next: (data) => {
        this.invoices = [data];
        this.calculateStats();
        this.hasLoadedInvoice = true;
        this.loading = false;
      },
      error: (err) => {
        this.invoices = [];
        this.lastError = this.getErrorMessage(err, 'Invoice not found or API unavailable.');
        this.calculateStats();
        this.hasLoadedInvoice = true;
        this.loading = false;
      }
    });
  }

  calculateStats() {
    if (this.invoices.length === 0) {
      this.totalRevenue = 0;
      this.paidAmount = 0;
      this.pendingAmount = 0;
      return;
    }

    const invoice = this.invoices[0];
    this.totalRevenue = invoice.amountInclTax;
    this.paidAmount = invoice.amountPaid;
    this.pendingAmount = invoice.balanceDue;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'badge-success';
      case 'Pending':
        return 'badge-warning';
      case 'Overdue':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  openPaymentForm(invoice: InvoiceDetail) {
    this.clearActionMessages();
    this.paymentError = null;
    if (invoice.balanceDue <= 0) {
      this.paymentError = 'This invoice has no remaining balance.';
      return;
    }

    this.activePaymentInvoiceId = invoice.id;
    this.paymentForm = {
      amount: invoice.balanceDue > 0 ? String(invoice.balanceDue) : '',
      paymentMethod: 'Manual',
      transactionReference: ''
    };
  }

  cancelPaymentForm() {
    this.activePaymentInvoiceId = null;
    this.paymentError = null;
  }

  submitPayment() {
    this.clearActionMessages();
    this.paymentError = null;

    if (!this.activePaymentInvoiceId) {
      this.paymentError = 'Select an invoice before recording a payment.';
      return;
    }
    const selectedInvoice = this.invoices.find((invoice) => invoice.id === this.activePaymentInvoiceId);
    if (!selectedInvoice) {
      this.paymentError = 'Selected invoice is no longer available. Reload the invoice first.';
      return;
    }

    const amount = Number(this.paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      this.paymentError = 'Payment amount must be greater than 0.';
      return;
    }
    if (amount > selectedInvoice.balanceDue) {
      this.paymentError = `Payment amount cannot exceed the remaining balance (${selectedInvoice.balanceDue.toFixed(2)}).`;
      return;
    }

    if (!this.paymentForm.paymentMethod.trim()) {
      this.paymentError = 'Payment method is required.';
      return;
    }

    this.recordingPayment = true;
    this.apiService.recordPayment({
      invoiceId: this.activePaymentInvoiceId,
      amount,
      paymentMethod: this.paymentForm.paymentMethod.trim(),
      transactionReference: this.paymentForm.transactionReference.trim() || undefined
    }).subscribe({
      next: () => {
        this.successMessage = 'Payment recorded successfully.';
        this.activePaymentInvoiceId = null;
        this.recordingPayment = false;
        this.loadInvoices();
      },
      error: (err) => {
        this.paymentError = this.getErrorMessage(err, 'Failed to record payment.');
        this.recordingPayment = false;
      }
    });
  }

  generateInvoice() {
    this.clearActionMessages();
    this.generateError = null;

    if (!Number.isInteger(this.generateForm.clubId) || this.generateForm.clubId < 1) {
      this.generateError = 'Club ID must be a positive number.';
      return;
    }
    if (!Number.isInteger(this.generateForm.periodYear) || this.generateForm.periodYear < 2000) {
      this.generateError = 'Year must be valid.';
      return;
    }
    if (!Number.isInteger(this.generateForm.periodMonth) || this.generateForm.periodMonth < 1 || this.generateForm.periodMonth > 12) {
      this.generateError = 'Month must be between 1 and 12.';
      return;
    }

    this.generatingInvoice = true;
    const payload = {
      clubId: this.generateForm.clubId,
      periodYear: this.generateForm.periodYear,
      periodMonth: this.generateForm.periodMonth
    };

    this.apiService.generateMonthlyInvoice(payload).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.generatingInvoice = false;
        this.loadInvoices();
      },
      error: (err) => {
        this.generateError = this.getErrorMessage(err, 'Failed to generate invoice.');
        this.generatingInvoice = false;
      }
    });
  }

  private clearActionMessages() {
    this.successMessage = null;
    this.generateError = null;
  }

  get selectedInvoice(): InvoiceDetail | null {
    return this.invoices[0] ?? null;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Session expired. Sign in again before using billing endpoints.';
      }
      if (error.status === 403) {
        return 'Your role does not include billing permissions.';
      }

      const backendMessage = error.error?.message ?? error.error?.Message;
      if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
        return backendMessage;
      }
    }

    return fallback;
  }
}
