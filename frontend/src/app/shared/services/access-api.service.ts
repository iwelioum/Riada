import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccessLogEntryResponse {
  id: number;
  isGuest: boolean;
  personId: number | null;
  personName: string | null;
  clubId: number;
  clubName: string;
  accessedAt: string;
  accessStatus: string;
  denialReason: string | null;
}

export interface AccessCheckResponse {
  decision: string;
  denialReason?: string | null;
}

export interface MemberAccessCheckRequest {
  memberId: number;
  clubId: number;
}

export interface GuestAccessCheckRequest {
  guestId: number;
  companionMemberId: number;
  clubId: number;
}

@Injectable({ providedIn: 'root' })
export class AccessApiService {
  private readonly http = inject(HttpClient);

  listAccessLogs(limit = 50): Observable<AccessLogEntryResponse[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<AccessLogEntryResponse[]>('/api/access/log', { params });
  }

  checkMemberAccess(request: MemberAccessCheckRequest): Observable<AccessCheckResponse> {
    return this.http.post<AccessCheckResponse>('/api/access/member', request);
  }

  checkGuestAccess(request: GuestAccessCheckRequest): Observable<AccessCheckResponse> {
    return this.http.post<AccessCheckResponse>('/api/access/guest', request);
  }
}
