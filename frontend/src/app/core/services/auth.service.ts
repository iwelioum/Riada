import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSessionService } from './auth-session.service';

export interface DevUser {
  label: string;
  userId: string;
  roles: string[];
  description: string;
}

export const DEV_USERS: DevUser[] = [
  {
    label: 'Administrator',
    userId: 'admin',
    roles: ['admin', 'billing', 'portique', 'dpo'],
    description: 'Full access to all features'
  },
  {
    label: 'Billing Manager',
    userId: 'billing-user',
    roles: ['billing'],
    description: 'Invoices, payments, contracts'
  },
  {
    label: 'Portique Staff',
    userId: 'portique-user',
    roles: ['portique'],
    description: 'Access control and check-in'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private session: AuthSessionService) {}

  login(userId: string, roles: string[]): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/Auth/token`, { userId, roles }, { withCredentials: true })
      .pipe(
        tap((response) => {
          const token = response?.accessToken ?? response?.AccessToken ?? '';
          this.session.setAccessToken(token || '1');
        })
      );
  }

  logout(): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/Auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.session.clearAccessToken()));
  }
}
