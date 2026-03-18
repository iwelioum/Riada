import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
export interface GuestResponse {
  id: number;
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  status: string;
  sponsorMemberId: number;
  sponsorName: string | null;
  email: string | null;
}

export interface CreateGuestRequest {
  sponsorMemberId: number;
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class GuestsApiService {
  private readonly http = inject(HttpClient);

  listGuests(page: number, pageSize: number): Observable<PagedResponse<GuestResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResponse<GuestResponse>>('/api/guests', { params });
  }

  createGuest(request: CreateGuestRequest): Observable<GuestResponse> {
    return this.http.post<GuestResponse>('/api/guests', request);
  }

  banGuest(guestId: number): Observable<void> {
    return this.http.post<void>(`/api/guests/${guestId}/ban`, null);
  }
}
