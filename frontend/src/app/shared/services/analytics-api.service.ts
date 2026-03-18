import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MemberRiskScoreResponse {
  memberId: number;
  lastName: string;
  firstName: string;
  planName: string;
  overdueInvoiceCount: number;
  deniedAccess60d: number;
  riskScore: number;
}

export interface ClubFrequencyResponse {
  clubId: number;
  clubName: string;
  visitorCount: number;
  averageVisitsPerMember: number;
}

export interface OptionPopularityResponse {
  optionId: number;
  optionName: string;
  subscriptionCount: number;
  popularityPercentage: number;
}

export interface SystemHealthCheckResponse {
  isHealthy: boolean;
  status: string;
  totalMembers: number;
  activeContracts: number;
  pendingInvoices: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly http = inject(HttpClient);

  getRiskScores(limit = 25): Observable<MemberRiskScoreResponse[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<MemberRiskScoreResponse[]>('/api/analytics/risk-scores', { params });
  }

  getFrequency(dateFrom: string, dateTo: string): Observable<ClubFrequencyResponse[]> {
    const params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);
    return this.http.get<ClubFrequencyResponse[]>('/api/analytics/frequency', { params });
  }

  getOptions(): Observable<OptionPopularityResponse[]> {
    return this.http.get<OptionPopularityResponse[]>('/api/analytics/options');
  }

  getHealth(): Observable<SystemHealthCheckResponse> {
    return this.http.get<SystemHealthCheckResponse>('/api/analytics/health');
  }
}
