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
  accent: string;
  avatarGradient: string;
  accessList: string[];
}

export const DEV_USERS: DevUser[] = [
  {
    label: 'Administrator',
    userId: 'admin',
    roles: ['admin', 'billing', 'portique', 'dpo'],
    description: 'Full platform access',
    accent: '#6c63ff',
    avatarGradient: 'linear-gradient(135deg, #6c63ff, #4f46e5)',
    accessList: ['Dashboard', 'Members', 'Billing', 'Access Control', 'Settings', 'Reports', 'Equipment']
  },
  {
    label: 'Billing Manager',
    userId: 'billing-user',
    roles: ['billing'],
    description: 'Invoices, payments & contracts',
    accent: '#10b981',
    avatarGradient: 'linear-gradient(135deg, #10b981, #059669)',
    accessList: ['Dashboard', 'Members', 'Billing', 'Schedule', 'Classes', 'Reports']
  },
  {
    label: 'Receptionist',
    userId: 'portique-user',
    roles: ['portique'],
    description: 'Front desk — members, contracts, check-in, classes',
    accent: '#f59e0b',
    avatarGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    accessList: ['Members', 'Schedule', 'Classes', 'Billing (pay)', 'Access', 'Guests', 'Employees']
  },
  {
    label: 'DPO',
    userId: 'dpo-user',
    roles: ['dpo'],
    description: 'Data protection & compliance',
    accent: '#ec4899',
    avatarGradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    accessList: ['Dashboard', 'Members', 'Reports']
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
      .post<any>(`${this.apiUrl}/auth/token`, { userId, roles }, { withCredentials: true })
      .pipe(
        tap((response) => {
          const token = response?.accessToken ?? response?.AccessToken ?? '';
          this.session.setAccessToken(token || '1');
          this.session.setRoles(roles);
        })
      );
  }

  logout(): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.session.clearAccessToken()));
  }
}
