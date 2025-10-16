import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  isSuccess: boolean;
  errorTitle: string | null;
  errorContent: string | null;
  jwt: any;
  object: { token?: string; expiresInDateTime?: string; createDateTime?: string } | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'APP_TOKEN';
  private TOKEN_EXPIRES_KEY = 'APP_TOKEN_EXPIRES';
  private APP_USER = 'APP_USER';
  private _isLoggedIn = signal<boolean>(this.hasToken());

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // login status
  isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  private hasToken(): boolean {
    return !!sessionStorage.getItem(this.TOKEN_KEY);
  }

  login(userName: string, password: string): Observable<void> {
    const url = `${this.baseUrl}/Auth/Authenticate`;
    const payload = {
      userName,
      password,
    };

    return this.http.post<AuthResponse>(url, payload).pipe(
      map((res) => {
        if (!res || !res.isSuccess || !res.object || !res.object.token) {
          // error handling
          const msg = res?.errorContent || 'Authentication failed';
          throw new Error(msg);
        }
        return res.object;
      }),
      tap((obj) => {
        sessionStorage.setItem(this.TOKEN_KEY, obj.token!);
        if (obj.expiresInDateTime) {
          sessionStorage.setItem(this.TOKEN_EXPIRES_KEY, obj.expiresInDateTime);
        } else {
          sessionStorage.removeItem(this.TOKEN_EXPIRES_KEY);
        }
        this._isLoggedIn.set(true);
      }),
      map(() => void 0)
    );
  }

  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_EXPIRES_KEY);
    sessionStorage.removeItem(this.APP_USER);
    this._isLoggedIn.set(false);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const t = sessionStorage.getItem(this.TOKEN_EXPIRES_KEY);
    if (!t) return false;
    const exp = Date.parse(t);
    return isNaN(exp) ? false : Date.now() > exp;
  }
}
