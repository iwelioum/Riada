import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClubListDto {
  id: number;
  name: string;
  addressCity: string;
  operationalStatus: string;
  isOpen247: boolean;
}

export interface ClubDetailDto {
  id: number;
  name: string;
  addressStreet: string | null;
  addressCity: string;
  addressPostalCode: string | null;
  operationalStatus: string;
  employeeCount: number;
  equipmentCount: number;
}

@Injectable({ providedIn: 'root' })
export class ClubsApiService {
  private readonly http = inject(HttpClient);

  listClubs(): Observable<ClubListDto[]> {
    return this.http.get<ClubListDto[]>('/api/clubs');
  }

  getClubDetail(clubId: number): Observable<ClubDetailDto> {
    return this.http.get<ClubDetailDto>(`/api/clubs/${clubId}`);
  }
}
