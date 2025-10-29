import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  isSuccess: boolean;
  errorTitle: string | null;
  errorContent: string | null;
  data: {
    token: string;
    tokenExpiresDateTime: string;
    tokenCreateDateTime: string;
    userClaims: any[];
    roles: string[];
    roleClaims: string[];
    user: {
      id: string;
      userName: string;
      email: string;
      nationalId: string | null;
      roles: string | null;
      claims: any[] | null;
      createDateTime: string | null;
    };
  };
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
        if (!res || !res.isSuccess || !res.data || !res.data.token) {
          // error handling
          const msg = res?.errorContent || 'Authentication failed';
          throw new Error(msg);
        }
        return res.data; // هنا رجعنا data مش object
      }),
      tap((data) => {
        sessionStorage.setItem(this.TOKEN_KEY, data.token);
        sessionStorage.setItem(this.APP_USER, JSON.stringify(data.user));
        if (data.tokenExpiresDateTime) {
          sessionStorage.setItem(this.TOKEN_EXPIRES_KEY, data.tokenExpiresDateTime);
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
