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

export interface EmployeeSummaryDto {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  role: string;
  clubId: number;
  clubName: string;
  hiredOn: string;
}

export interface EmployeeDetailDto {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  role: string;
  clubId: number;
  clubName: string;
  monthlySalary: number | null;
  qualifications: string | null;
  hiredOn: string;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  lastName: string;
  firstName: string;
  email: string;
  role: string;
  clubId: number;
  monthlySalary: number | null;
  qualifications: string | null;
  hiredOn: string;
}

export interface UpdateEmployeeRequest {
  lastName?: string;
  firstName?: string;
  email?: string;
  role?: string;
  clubId?: number;
  monthlySalary?: number | null;
  qualifications?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmployeesApiService {
  private readonly http = inject(HttpClient);

  listEmployees(page: number, pageSize: number, clubId?: number | null, search?: string | null): Observable<PagedResponse<EmployeeSummaryDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (clubId) params = params.set('clubId', clubId);
    if (search && search.trim()) params = params.set('search', search.trim());

    return this.http.get<PagedResponse<EmployeeSummaryDto>>('/api/employees', { params });
  }

  getEmployeeDetail(id: number): Observable<EmployeeDetailDto> {
    return this.http.get<EmployeeDetailDto>(`/api/employees/${id}`);
  }

  createEmployee(request: CreateEmployeeRequest): Observable<EmployeeDetailDto> {
    return this.http.post<EmployeeDetailDto>('/api/employees', request);
  }

  updateEmployee(id: number, request: UpdateEmployeeRequest): Observable<EmployeeDetailDto> {
    return this.http.put<EmployeeDetailDto>(`/api/employees/${id}`, request);
  }
}
