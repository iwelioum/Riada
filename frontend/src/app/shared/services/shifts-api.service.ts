import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShiftResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeRole: string;
  clubId: number;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: string;
}

export interface CreateShiftRequest {
  employeeId: number;
  clubId: number;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: string;
}

@Injectable({ providedIn: 'root' })
export class ShiftsApiService {
  private readonly http = inject(HttpClient);

  listWeekShifts(clubId: number | null, weekStart: string): Observable<ShiftResponse[]> {
    let params = new HttpParams().set('weekStart', weekStart);
    if (clubId !== null) {
      params = params.set('clubId', clubId);
    }

    return this.http.get<ShiftResponse[]>('/api/shifts', { params });
  }

  createShift(request: CreateShiftRequest): Observable<ShiftResponse> {
    return this.http.post<ShiftResponse>('/api/shifts', request);
  }

  deleteShift(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/shifts/${id}`);
  }
}
