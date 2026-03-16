import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AccessCheckRequest,
  AccessCheckResponse,
  ClubFrequency,
  ClubDashboard,
  ClubSummary,
  CreateMaintenanceTicketPayload,
  CreateContractPayload,
  CreateMemberPayload,
  ContractLifecycleResponse,
  EquipmentItem,
  GenerateInvoicePayload,
  Guest,
  InvoiceDetail,
  MemberDetail,
  MemberSummary,
  OptionPopularity,
  PagedResponse,
  RecordPaymentPayload,
  RiskScore,
  SystemHealth,
  Session,
  SubscriptionPlan,
  SubscriptionPlanOption,
  UpdateMemberPayload,
  UpdateTicketStatusPayload
} from '../models/api-models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Helpers
  private toMemberSummary(dto: any): MemberSummary {
    return {
      id: dto.id,
      firstName: dto.firstName ?? dto.FirstName,
      lastName: dto.lastName ?? dto.LastName,
      email: dto.email ?? dto.Email,
      status: dto.status ?? dto.Status,
      homeClub: dto.homeClub ?? dto.HomeClub,
      currentPlan: dto.currentPlan ?? dto.CurrentPlan,
      lastVisitDate: dto.lastVisitDate ?? dto.LastVisitDate,
      totalVisits: dto.totalVisits ?? dto.TotalVisits ?? 0,
      mobilePhone: dto.mobilePhone ?? dto.MobilePhone,
      primaryGoal: dto.primaryGoal ?? dto.PrimaryGoal,
      marketingConsent: dto.marketingConsent ?? dto.MarketingConsent
    };
  }

  private toMemberDetail(dto: any): MemberDetail {
    return {
      ...this.toMemberSummary(dto),
      gender: dto.gender ?? dto.Gender,
      dateOfBirth: dto.dateOfBirth ?? dto.DateOfBirth,
      nationality: dto.nationality ?? dto.Nationality,
      mobilePhone: dto.mobilePhone ?? dto.MobilePhone,
      primaryGoal: dto.primaryGoal ?? dto.PrimaryGoal,
      gdprConsentAt: dto.gdprConsentAt ?? dto.GdprConsentAt,
      marketingConsent: dto.marketingConsent ?? dto.MarketingConsent,
      contracts: (dto.contracts ?? dto.Contracts ?? []).map((c: any) => ({
        id: c.id ?? c.Id,
        planName: c.planName ?? c.PlanName,
        homeClub: c.homeClub ?? c.HomeClub,
        startDate: c.startDate ?? c.StartDate,
        endDate: c.endDate ?? c.EndDate,
        contractType: c.contractType ?? c.ContractType,
        status: c.status ?? c.Status,
        freezeStartDate: c.freezeStartDate ?? c.FreezeStartDate,
        freezeEndDate: c.freezeEndDate ?? c.FreezeEndDate,
        options: c.options ?? c.Options ?? []
      }))
    };
  }

  private toInvoiceDetail(dto: any): InvoiceDetail {
    return {
      id: dto.id ?? dto.Id,
      invoiceNumber: dto.invoiceNumber ?? dto.InvoiceNumber ?? '',
      issuedOn: dto.issuedOn ?? dto.IssuedOn,
      dueDate: dto.dueDate ?? dto.DueDate,
      billingPeriodStart: dto.billingPeriodStart ?? dto.BillingPeriodStart,
      billingPeriodEnd: dto.billingPeriodEnd ?? dto.BillingPeriodEnd,
      amountExclTax: dto.amountExclTax ?? dto.AmountExclTax ?? 0,
      vatRate: dto.vatRate ?? dto.VatRate ?? 0,
      vatAmount: dto.vatAmount ?? dto.VatAmount ?? 0,
      amountInclTax: dto.amountInclTax ?? dto.AmountInclTax ?? 0,
      amountPaid: dto.amountPaid ?? dto.AmountPaid ?? 0,
      balanceDue: dto.balanceDue ?? dto.BalanceDue ?? 0,
      status: dto.status ?? dto.Status ?? 'Unknown',
      lines: (dto.lines ?? dto.Lines ?? []).map((line: any) => ({
        description: line.description ?? line.Description ?? '',
        lineType: line.lineType ?? line.LineType ?? '',
        quantity: line.quantity ?? line.Quantity ?? 0,
        unitPriceExclTax: line.unitPriceExclTax ?? line.UnitPriceExclTax ?? 0,
        lineAmountInclTax: line.lineAmountInclTax ?? line.LineAmountInclTax ?? 0
      })),
      payments: (dto.payments ?? dto.Payments ?? []).map((payment: any) => ({
        id: payment.id ?? payment.Id ?? 0,
        paidAt: payment.paidAt ?? payment.PaidAt ?? '',
        amount: payment.amount ?? payment.Amount ?? 0,
        status: payment.status ?? payment.Status ?? 'Unknown',
        paymentMethod: payment.paymentMethod ?? payment.PaymentMethod ?? 'Unknown',
        transactionReference: payment.transactionReference ?? payment.TransactionReference
      }))
    };
  }

  private toEquipmentItem(dto: any): EquipmentItem {
    return {
      id: dto.id ?? dto.Id,
      name: dto.name ?? dto.Name ?? '',
      equipmentType: dto.equipmentType ?? dto.EquipmentType ?? '',
      status: dto.status ?? dto.Status ?? '',
      clubId: dto.clubId ?? dto.ClubId ?? 0,
      acquisitionYear: dto.acquisitionYear ?? dto.AcquisitionYear ?? 0
    };
  }

  private toClubSummary(dto: any): ClubSummary {
    return {
      id: dto.id ?? dto.Id,
      name: dto.name ?? dto.Name ?? '',
      addressCity: dto.addressCity ?? dto.AddressCity,
      operationalStatus: dto.operationalStatus ?? dto.OperationalStatus,
      isOpen247: dto.isOpen247 ?? dto.IsOpen247
    };
  }

  private toClubDashboard(dto: any): ClubDashboard {
    return {
      id: dto.id ?? dto.Id,
      name: dto.name ?? dto.Name ?? '',
      addressStreet: dto.addressStreet ?? dto.AddressStreet,
      addressCity: dto.addressCity ?? dto.AddressCity,
      addressPostalCode: dto.addressPostalCode ?? dto.AddressPostalCode,
      operationalStatus: dto.operationalStatus ?? dto.OperationalStatus,
      employeeCount: dto.employeeCount ?? dto.EmployeeCount ?? 0,
      equipmentCount: dto.equipmentCount ?? dto.EquipmentCount ?? 0
    };
  }

  private toSubscriptionPlan(dto: any): SubscriptionPlan {
    return {
      id: dto.id ?? dto.Id,
      planName: dto.planName ?? dto.PlanName ?? '',
      basePrice: dto.basePrice ?? dto.BasePrice ?? 0,
      commitmentMonths: dto.commitmentMonths ?? dto.CommitmentMonths ?? 0,
      enrollmentFee: dto.enrollmentFee ?? dto.EnrollmentFee ?? 0,
      limitedClubAccess: dto.limitedClubAccess ?? dto.LimitedClubAccess ?? false,
      duoPassAllowed: dto.duoPassAllowed ?? dto.DuoPassAllowed ?? false
    };
  }

  private toSubscriptionPlanOption(dto: any): SubscriptionPlanOption {
    return {
      id: dto.id ?? dto.Id,
      optionName: dto.optionName ?? dto.OptionName ?? '',
      monthlyPrice: dto.monthlyPrice ?? dto.MonthlyPrice ?? 0
    };
  }

  private toGuest(dto: any): Guest {
    return {
      id: dto.id ?? dto.Id,
      firstName: dto.firstName ?? dto.FirstName ?? '',
      lastName: dto.lastName ?? dto.LastName ?? '',
      status: dto.status ?? dto.Status ?? 'Unknown',
      email: dto.email ?? dto.Email,
      dateOfBirth: dto.dateOfBirth ?? dto.DateOfBirth,
      sponsorMemberId: dto.sponsorMemberId ?? dto.SponsorMemberId,
      sponsorName: dto.sponsorName ?? dto.SponsorName
    };
  }

  // Members
  getMembers(options?: { page?: number; pageSize?: number; status?: string; search?: string }): Observable<PagedResponse<MemberSummary>> {
    let params = new HttpParams();
    if (options?.page) params = params.set('page', options.page);
    if (options?.pageSize) params = params.set('pageSize', options.pageSize);
    if (options?.status) params = params.set('status', options.status);
    if (options?.search) params = params.set('search', options.search);

    return this.http.get<PagedResponse<any>>(`${this.apiUrl}/Members`, { params }).pipe(
      map((response) => {
        const rawItems = (response as any).items ?? (response as any).Items ?? [];
        const page = (response as any).page ?? (response as any).Page ?? 1;
        const pageSize = (response as any).pageSize ?? (response as any).PageSize ?? rawItems.length;
        const totalCount = (response as any).totalCount ?? (response as any).TotalCount ?? rawItems.length;
        const totalPages = (response as any).totalPages ?? (response as any).TotalPages ?? 1;
        const hasNext = (response as any).hasNext ?? (response as any).HasNext ?? false;
        const hasPrevious = (response as any).hasPrevious ?? (response as any).HasPrevious ?? false;

        return {
          items: rawItems.map((m: any) => this.toMemberSummary(m)),
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNext,
          hasPrevious
        };
      })
    );
  }

  getMemberDetail(id: number): Observable<MemberDetail> {
    return this.http.get<any>(`${this.apiUrl}/Members/${id}`).pipe(
      map((dto) => this.toMemberDetail(dto))
    );
  }

  createMember(payload: CreateMemberPayload): Observable<MemberDetail> {
    return this.http.post<any>(`${this.apiUrl}/Members`, payload).pipe(
      map((dto) => this.toMemberDetail(dto))
    );
  }

  updateMember(id: number, payload: UpdateMemberPayload): Observable<MemberDetail> {
    return this.http.put<any>(`${this.apiUrl}/Members/${id}`, payload).pipe(
      map((dto) => this.toMemberDetail(dto))
    );
  }

  anonymizeMember(id: number, requestedBy: string): Observable<{ message: string }> {
    const body = { memberId: id, requestedBy };
    return this.http.delete<any>(`${this.apiUrl}/Members/${id}/gdpr`, { body }).pipe(
      map((r) => ({ message: r.message ?? r.Message ?? 'Member anonymized' }))
    );
  }

   // Contracts
  createContract(payload: CreateContractPayload): Observable<ContractLifecycleResponse> {
    return this.http.post<any>(`${this.apiUrl}/Contracts`, payload).pipe(
      map((r) => ({
        success: true,
        message: r.message ?? r.Message ?? 'Contract created'
      }))
    );
  }

  freezeContract(contractId: number, durationDays: number): Observable<ContractLifecycleResponse> {
    return this.http.post<any>(`${this.apiUrl}/Contracts/${contractId}/freeze`, { durationDays }).pipe(
      map((r) => ({
        success: r.success ?? r.Success ?? false,
        message: r.message ?? r.Message ?? 'Freeze processed'
      }))
    );
  }

  renewContract(contractId: number): Observable<ContractLifecycleResponse> {
    return this.http.post<any>(`${this.apiUrl}/Contracts/${contractId}/renew`, {}).pipe(
      map((r) => ({
        success: r.success ?? r.Success ?? false,
        message: r.message ?? r.Message ?? 'Contract renewed'
      }))
    );
  }

  // Courses / Sessions
  getUpcomingSessions(clubId: number, days = 14): Observable<Session[]> {
    const params = new HttpParams().set('clubId', clubId).set('days', days);
    return this.http.get<any[]>(`${this.apiUrl}/Courses/sessions`, { params }).pipe(
      map((sessions) =>
        (sessions ?? []).map((s) => ({
          id: s.id ?? s.Id,
          courseName: s.courseName ?? s.CourseName,
          instructorName: s.instructorName ?? s.InstructorName,
          clubName: s.clubName ?? s.ClubName,
          startsAt: s.startsAt ?? s.StartsAt,
          durationMinutes: s.durationMinutes ?? s.DurationMinutes,
          enrolledCount: s.enrolledCount ?? s.EnrolledCount,
          maxCapacity: s.maxCapacity ?? s.MaxCapacity,
          occupancyPercent: s.occupancyPercent ?? s.OccupancyPercent
        }))
      )
    );
  }

  bookSession(sessionId: number, memberId: number): Observable<{ message: string }> {
    return this.http.post<any>(`${this.apiUrl}/Courses/sessions/${sessionId}/book`, { sessionId, memberId }).pipe(
      map((r) => ({ message: r.message ?? r.Message ?? 'Booking confirmed' }))
    );
  }

  cancelBooking(memberId: number, sessionId: number): Observable<{ message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/Courses/bookings/${memberId}/${sessionId}`).pipe(
      map((r) => ({ message: r.message ?? r.Message ?? 'Booking cancelled successfully' }))
    );
  }

  // Billing
  generateMonthlyInvoice(payload: GenerateInvoicePayload): Observable<{ message: string }> {
    return this.http.post<any>(`${this.apiUrl}/Billing/generate`, payload).pipe(
      map((r) => ({ message: r.message ?? r.Message ?? 'Invoice generated' }))
    );
  }

  getInvoiceDetail(id: number): Observable<InvoiceDetail> {
    return this.http.get<any>(`${this.apiUrl}/Billing/invoices/${id}`).pipe(
      map((dto) => this.toInvoiceDetail(dto))
    );
  }

  recordPayment(payload: RecordPaymentPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Billing/payments`, payload);
  }

  // Equipment
  listEquipment(filters?: { clubId?: number; status?: string }): Observable<EquipmentItem[]> {
    let params = new HttpParams();
    if (filters?.clubId) params = params.set('clubId', filters.clubId);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<any[]>(`${this.apiUrl}/Equipment`, { params }).pipe(
      map((items) => (items ?? []).map((item: any) => this.toEquipmentItem(item)))
    );
  }

  createMaintenanceTicket(payload: CreateMaintenanceTicketPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Equipment/maintenance`, payload);
  }

  updateMaintenanceStatus(ticketId: number, payload: UpdateTicketStatusPayload): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/Equipment/maintenance/${ticketId}`, payload);
  }

  // Access Control
  checkMemberAccess(request: AccessCheckRequest): Observable<AccessCheckResponse> {
    return this.http.post<any>(`${this.apiUrl}/Access/member`, {
      memberId: request.memberId,
      clubId: request.clubId
    }).pipe(
      map((r) => ({
        decision: r.decision ?? r.Decision ?? 'Denied',
        denialReason: r.denialReason ?? r.DenialReason
      }))
    );
  }

  checkGuestAccess(request: AccessCheckRequest): Observable<AccessCheckResponse> {
    return this.http.post<any>(`${this.apiUrl}/Access/guest`, {
      guestId: request.guestId,
      companionMemberId: request.companionMemberId,
      clubId: request.clubId
    }).pipe(
      map((r) => ({
        decision: r.decision ?? r.Decision ?? 'Denied',
        denialReason: r.denialReason ?? r.DenialReason
      }))
    );
  }

  // Analytics
  getRiskScores(limit = 25): Observable<RiskScore[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<any[]>(`${this.apiUrl}/Analytics/risk-scores`, { params }).pipe(
      map((items) =>
        (items ?? []).map((r: any) => ({
          memberId: r.memberId ?? r.MemberId,
          memberName: `${r.firstName ?? r.FirstName ?? ''} ${r.lastName ?? r.LastName ?? ''}`.trim(),
          planName: r.planName ?? r.PlanName ?? '',
          overdueInvoiceCount: r.overdueInvoiceCount ?? r.OverdueInvoiceCount ?? 0,
          deniedAccess60d: r.deniedAccess60d ?? r.DeniedAccess60d ?? 0,
          riskScore: r.riskScore ?? r.RiskScore ?? 0,
          score: r.riskScore ?? r.RiskScore ?? 0
        }))
      )
    );
  }

  getFrequency(dateFrom?: string, dateTo?: string): Observable<ClubFrequency[]> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    return this.http.get<any[]>(`${this.apiUrl}/Analytics/frequency`, { params }).pipe(
      map((rows) =>
        (rows ?? []).map((r: any) => ({
          clubId: r.clubId ?? r.ClubId ?? 0,
          clubName: r.clubName ?? r.ClubName ?? 'Unknown',
          visitorCount: r.visitorCount ?? r.VisitorCount ?? 0,
          averageVisitsPerMember: r.averageVisitsPerMember ?? r.AverageVisitsPerMember ?? 0
        }))
      )
    );
  }

  getOptionPopularity(): Observable<OptionPopularity[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Analytics/options`).pipe(
      map((rows) =>
        (rows ?? []).map((r: any) => ({
          optionId: r.optionId ?? r.OptionId ?? r.id ?? r.Id ?? 0,
          optionName: r.optionName ?? r.OptionName ?? 'Option',
          subscriptionCount: r.subscriptionCount ?? r.SubscriptionCount ?? 0,
          popularityPercentage: r.popularityPercentage ?? r.PopularityPercentage ?? 0
        }))
      )
    );
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<any>(`${this.apiUrl}/Analytics/health`).pipe(
      map((r) => ({
        isHealthy: r.isHealthy ?? r.IsHealthy ?? false,
        status: r.status ?? r.Status ?? '',
        totalMembers: r.totalMembers ?? r.TotalMembers ?? 0,
        activeContracts: r.activeContracts ?? r.ActiveContracts ?? 0,
        pendingInvoices: r.pendingInvoices ?? r.PendingInvoices ?? 0
      }))
    );
  }

  // Clubs / Plans / Guests
  listClubs(): Observable<ClubSummary[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Clubs`).pipe(
      map((clubs) => (clubs ?? []).map((club: any) => this.toClubSummary(club)))
    );
  }

  getClubDashboard(id: number): Observable<ClubDashboard> {
    return this.http.get<any>(`${this.apiUrl}/Clubs/${id}`).pipe(
      map((club) => this.toClubDashboard(club))
    );
  }

  listSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<any[]>(`${this.apiUrl}/plans`).pipe(
      map((plans) => (plans ?? []).map((plan: any) => this.toSubscriptionPlan(plan)))
    );
  }

  getPlanOptions(planId: number): Observable<SubscriptionPlanOption[]> {
    return this.http.get<any[]>(`${this.apiUrl}/plans/${planId}/options`).pipe(
      map((options) => (options ?? []).map((option: any) => this.toSubscriptionPlanOption(option)))
    );
  }

  listGuests(): Observable<Guest[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Guests`).pipe(
      map((guests) => (guests ?? []).map((guest: any) => this.toGuest(guest)))
    );
  }

  registerGuest(payload: { sponsorMemberId: number; lastName: string; firstName: string; dateOfBirth: string; email?: string | null }): Observable<Guest> {
    return this.http.post<any>(`${this.apiUrl}/Guests`, payload).pipe(
      map((guest) => this.toGuest(guest))
    );
  }

  banGuest(id: number): Observable<{ message: string }> {
    return this.http.post<any>(`${this.apiUrl}/Guests/${id}/ban`, {}).pipe(
      map((r) => ({ message: r.message ?? r.Message ?? 'Guest banned successfully' }))
    );
  }

  // Health Check
  health(): Observable<any> {
    const apiRoot = this.apiUrl.replace(/\/api$/, '');
    return this.http.get<any>(`${apiRoot}/health`);
  }
}
