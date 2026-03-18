import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlanSummaryDto {
  id: number;
  planName: string;
  basePrice: number;
  commitmentMonths: number | null;
  enrollmentFee: number;
  limitedClubAccess: boolean;
  duoPassAllowed: boolean;
}

export interface PlanOptionDto {
  id: number;
  optionName: string;
  monthlyPrice: number;
}

@Injectable({ providedIn: 'root' })
export class PlansApiService {
  private readonly http = inject(HttpClient);

  listPlans(): Observable<PlanSummaryDto[]> {
    return this.http.get<PlanSummaryDto[]>('/api/plans');
  }

  listPlanOptions(planId: number): Observable<PlanOptionDto[]> {
    return this.http.get<PlanOptionDto[]>(`/api/plans/${planId}/options`);
  }
}
