import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private readonly sessionStateStorageKey = 'riada.auth.sessionActive';

  /**
   * JWTs are now handled via HttpOnly secure cookies on the API side.
   * Keep this method for backward compatibility with existing call sites.
   */
  getAccessToken(): string | null {
    return null;
  }

  setAccessToken(token: string): void {
    if (token.trim().length === 0) {
      sessionStorage.removeItem(this.sessionStateStorageKey);
      return;
    }

    sessionStorage.setItem(this.sessionStateStorageKey, '1');
  }

  clearAccessToken(): void {
    sessionStorage.removeItem(this.sessionStateStorageKey);
  }

  hasActiveSession(): boolean {
    return sessionStorage.getItem(this.sessionStateStorageKey) === '1';
  }
}
