import { Component, OnInit } from '@angular/core';
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
  invoiceIdInput = 1;
  lastError: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.lastError = null;
    this.apiService.getInvoiceDetail(this.invoiceIdInput).subscribe({
      next: (data) => {
        this.invoices = [data];
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading invoice detail:', err);
        this.invoices = [];
        this.lastError = 'Invoice not found or API unavailable';
        this.calculateStats();
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

  recordPayment(invoiceId: number) {
    const amount = prompt('Enter payment amount:');
    if (amount) {
      this.apiService.recordPayment({
        invoiceId,
        amount: parseFloat(amount),
        paymentMethod: 'Manual'
      }).subscribe({
        next: () => {
          alert('Payment recorded successfully');
          this.loadInvoices();
        },
        error: (err) => {
          console.error('Error recording payment:', err);
          alert('Failed to record payment');
        }
      });
    }
  }

  generateInvoice() {
    const today = new Date();
    const payload = {
      clubId: 1,
      periodYear: today.getFullYear(),
      periodMonth: today.getMonth() + 1
    };

    this.apiService.generateMonthlyInvoice(payload).subscribe({
      next: (res) => {
        alert(res.message);
        this.loadInvoices();
      },
      error: (err) => {
        console.error('Error generating invoice:', err);
        alert('Failed to generate invoice');
      }
    });
  }
}
