import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BillingInvoiceSummaryDto {
  id: number;
  invoiceNumber: string;
  issuedOn: string;
  dueDate: string;
  amountInclTax: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
  contractId: number | null;
  memberId: number | null;
  memberName: string | null;
}

export interface BillingInvoiceLineDto {
  description: string;
  lineType: string;
  quantity: number;
  unitPriceExclTax: number;
  lineAmountInclTax: number;
}

export interface BillingInvoicePaymentDto {
  id: number;
  paidAt: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionReference: string | null;
}

export interface BillingInvoiceDetailDto {
  id: number;
  contractId: number | null;
  memberId: number | null;
  memberName: string | null;
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
  status: string;
  lines: BillingInvoiceLineDto[];
  payments: BillingInvoicePaymentDto[];
}

export interface GenerateInvoiceRequest {
  contractId: number;
}

export interface GenerateInvoiceResponse {
  message: string;
}

export interface RecordPaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  transactionReference: string | null;
  errorCode: string | null;
}

export interface RecordPaymentResponse {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  transactionReference: string | null;
  paidAt: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly http = inject(HttpClient);

  listInvoices(): Observable<BillingInvoiceSummaryDto[]> {
    return this.http.get<BillingInvoiceSummaryDto[]>('/api/billing/invoices');
  }

  getInvoiceDetail(invoiceId: number): Observable<BillingInvoiceDetailDto> {
    return this.http.get<BillingInvoiceDetailDto>(`/api/billing/invoices/${invoiceId}`);
  }

  generateInvoice(request: GenerateInvoiceRequest): Observable<GenerateInvoiceResponse> {
    return this.http.post<GenerateInvoiceResponse>('/api/billing/generate', request);
  }

  recordPayment(request: RecordPaymentRequest): Observable<RecordPaymentResponse> {
    return this.http.post<RecordPaymentResponse>('/api/billing/payments', request);
  }
}
