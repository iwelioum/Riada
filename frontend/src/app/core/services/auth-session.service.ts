import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private readonly accessTokenStorageKey = 'riada.auth.accessToken';

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenStorageKey);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenStorageKey, token);
  }

  clearAccessToken(): void {
    localStorage.removeItem(this.accessTokenStorageKey);
  }
}
