import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private readonly sessionStateStorageKey = 'riada.auth.sessionActive';
  private readonly accessTokenStorageKey = 'riada.auth.accessToken';
  private readonly rolesStorageKey = 'riada.auth.roles';

  /**
   * Get the access token from session storage.
   * Note: In production, this should be stored in httpOnly cookies.
   * The backend (Program.cs) supports reading from cookies via OnMessageReceived event.
   */
  getAccessToken(): string | null {
    const token = sessionStorage.getItem(this.accessTokenStorageKey);
    return token && token.trim().length > 0 ? token.trim() : null;
  }

  setAccessToken(token: string): void {
    if (!token || token.trim().length === 0) {
      sessionStorage.removeItem(this.accessTokenStorageKey);
      localStorage.removeItem(this.sessionStateStorageKey);
      return;
    }
    const trimmedToken = token.trim();
    sessionStorage.setItem(this.accessTokenStorageKey, trimmedToken);
    localStorage.setItem(this.sessionStateStorageKey, '1');
  }

  clearAccessToken(): void {
    sessionStorage.removeItem(this.accessTokenStorageKey);
    localStorage.removeItem(this.sessionStateStorageKey);
    localStorage.removeItem(this.rolesStorageKey);
  }

  setRoles(roles: string[]): void {
    if (!roles || roles.length === 0) {
      localStorage.removeItem(this.rolesStorageKey);
      return;
    }
    const normalizedRoles = roles
      .filter(r => r && typeof r === 'string' && r.trim().length > 0)
      .map(r => r.trim())
      .filter((r, idx, arr) => arr.indexOf(r) === idx);
    localStorage.setItem(this.rolesStorageKey, JSON.stringify(normalizedRoles));
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
    return localStorage.getItem(this.sessionStateStorageKey) === '1' && this.getAccessToken() !== null;
  }
}
