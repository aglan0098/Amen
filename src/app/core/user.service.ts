import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppUser {
  id: string;
  userName: string;
  phoneNumber: 'string';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = environment.apiUrl;
  // save user data
  user = signal<AppUser | null>(this.loadFromSession());

  constructor(private http: HttpClient) {}

  // get current user data from api
  fetchCurrentUser() {
    const url = `${this.baseUrl}/Users/GetAll`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        const arr = res?.object;
        if (Array.isArray(arr) && arr.length > 0) {
          const u = arr[0];
          const simpleUser: AppUser = {
            id: u.id,
            userName: u.userName,
            phoneNumber: u.phoneNumber,
          };
          return simpleUser;
        }
        return null;
      }),
      tap((u) => {
        if (u) {
          this.user.set(u);
          sessionStorage.setItem('APP_USER', JSON.stringify(u));
        }
      })
    );
  }

  // load user data from sessionStorage
  private loadFromSession(): AppUser | null {
    try {
      const s = sessionStorage.getItem('APP_USER');
      return s ? (JSON.parse(s) as AppUser) : null;
    } catch {
      return null;
    }
  }

  // get user data snapshot
  getUserSnapshot(): AppUser | null {
    return this.user();
  }

  clearUser() {
    this.user.set(null);
    sessionStorage.removeItem('APP_USER');
  }
}
