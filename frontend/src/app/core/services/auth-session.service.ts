import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private readonly sessionStateStorageKey = 'riada.auth.sessionActive';
  private readonly rolesStorageKey = 'riada.auth.roles';

  getAccessToken(): string | null {
    return null;
  }

  setAccessToken(token: string): void {
    if (token.trim().length === 0) {
      localStorage.removeItem(this.sessionStateStorageKey);
      return;
    }
    localStorage.setItem(this.sessionStateStorageKey, '1');
  }

  clearAccessToken(): void {
    localStorage.removeItem(this.sessionStateStorageKey);
    localStorage.removeItem(this.rolesStorageKey);
  }

  setRoles(roles: string[]): void {
    localStorage.setItem(this.rolesStorageKey, JSON.stringify(roles));
  }

  getRoles(): string[] {
    const raw = localStorage.getItem(this.rolesStorageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  hasActiveSession(): boolean {
    return localStorage.getItem(this.sessionStateStorageKey) === '1';
  }
}
