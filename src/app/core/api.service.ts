// src/app/core/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { MOCK_USERS } from '../mock-data/mock-users';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private cache = new Map<string, Observable<any>>();
  private USE_MOCK = true;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    const key = 'users';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const obs = this.USE_MOCK
      ? of(MOCK_USERS).pipe(shareReplay(1))
      : this.http.get<any[]>('/api/users').pipe(shareReplay(1));

    this.cache.set(key, obs);
    return obs;
  }

  postContact(payload: any): Observable<any> {
    if (this.USE_MOCK) return of({ success: true, id: Date.now() });
    return this.http.post('/api/contact', payload);
  }

  invalidateCache(key?: string) {
    if (key) this.cache.delete(key);
    else this.cache.clear();
  }
}
