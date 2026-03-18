import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EquipmentStatusFilter = 'InService' | 'UnderMaintenance' | 'Broken' | 'Retired';

export interface EquipmentResponse {
  id: number;
  name: string;
  equipmentType: string;
  status: string;
  clubId: number;
  acquisitionYear: number;
  brand?: string | null;
  model?: string | null;
}

export interface CreateMaintenanceTicketRequest {
  equipmentId: number;
  priority: string;
  description: string;
}

export interface UpdateMaintenanceTicketRequest {
  status: string;
  resolvedAt: string | null;
}

export interface MaintenanceTicketResponse {
  id: number;
  equipmentId: number;
  priority: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class EquipmentApiService {
  private readonly http = inject(HttpClient);

  listEquipment(clubId?: number | null, status?: EquipmentStatusFilter | null): Observable<EquipmentResponse[]> {
    let params = new HttpParams();

    if (clubId !== null && clubId !== undefined) {
      params = params.set('clubId', clubId);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<EquipmentResponse[]>('/api/equipment', { params });
  }

  createMaintenanceTicket(request: CreateMaintenanceTicketRequest): Observable<MaintenanceTicketResponse> {
    return this.http.post<MaintenanceTicketResponse>('/api/equipment/maintenance', request);
  }

  updateMaintenanceTicket(ticketId: number, request: UpdateMaintenanceTicketRequest): Observable<MaintenanceTicketResponse> {
    return this.http.patch<MaintenanceTicketResponse>(`/api/equipment/maintenance/${ticketId}`, request);
  }
}
