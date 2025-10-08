// src/app/core/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'APP_TOKEN';
  private _isLoggedIn = signal<boolean>(this.hasToken());

  // قراءة سريعة لحالة الدخول: استدعاء الدالة يعطي قيمة boolean
  isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  login(email: string, password: string): Observable<void> {
    // Mock login — في الإنتاج استبدلها بـ this.http.post(...)
    if (email && password) {
      return of(undefined).pipe(
        delay(600),
        tap(() => {
          localStorage.setItem(this.TOKEN_KEY, 'fake-jwt-token');
          this._isLoggedIn.set(true);
        })
      );
    }
    return throwError(() => new Error('Invalid credentials'));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
