import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private readonly sessionStateStorageKey = 'riada.auth.sessionActive';

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
  }

  hasActiveSession(): boolean {
    return localStorage.getItem(this.sessionStateStorageKey) === '1';
  }
}
