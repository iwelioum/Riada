import { TestBed } from '@angular/core/testing';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSessionService);
    sessionStorage.clear();
    localStorage.clear();
  });

  it('does not expose access tokens to JavaScript storage', () => {
    service.setAccessToken('jwt-token-value');

    expect(service.getAccessToken()).toBeNull();
    expect(localStorage.getItem('riada.auth.accessToken')).toBeNull();
  });

  it('tracks authenticated session state via non-sensitive marker', () => {
    service.setAccessToken('jwt-token-value');

    expect(service.hasActiveSession()).toBeTrue();
  });

  it('clears session marker on logout or auth reset', () => {
    service.setAccessToken('jwt-token-value');
    service.clearAccessToken();

    expect(service.hasActiveSession()).toBeFalse();
  });

  it('treats empty tokens as no active session', () => {
    service.setAccessToken('');

    expect(service.hasActiveSession()).toBeFalse();
  });
});
