// src/app/services/table-data.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, from, tap, Subject } from 'rxjs';
import { TableResponse } from '../models/table.model';

type FetcherFn = (params: {
  page: number;
  pageSize: number;
  search: string;
}) => Promise<TableResponse> | Observable<TableResponse>;

@Injectable({ providedIn: 'root' })
export class TableDataService {
  private cache = new Map<string, { ts: number; data: TableResponse }>();
  private TTL = 1000 * 60 * 2; // 2 minutes

  // Subject to notify components to reload when invalidate called
  public reload$ = new Subject<string>(); // emits queryKey that needs reload

  buildKey(queryKey: string, params: { page: number; pageSize: number; search: string }) {
    return JSON.stringify([queryKey, params.page, params.pageSize, params.search]);
  }

  get(
    queryKey: string,
    params: { page: number; pageSize: number; search: string },
    fetcher: FetcherFn,
    options?: { force?: boolean }
  ): Observable<TableResponse> {
    const key = this.buildKey(queryKey, params);
    const now = Date.now();
    const cached = this.cache.get(key);

    // if not forcing and cache is fresh, return cached
    if (!options?.force && cached && now - cached.ts < this.TTL) {
      return of(cached.data);
    }

    // call fetcher (handle Promise or Observable)
    const result = fetcher(params);
    let obs$: Observable<TableResponse>;

    if (result instanceof Observable) {
      obs$ = result.pipe(tap((res) => this.cache.set(key, { ts: Date.now(), data: res })));
    } else {
      obs$ = from(result).pipe(tap((res) => this.cache.set(key, { ts: Date.now(), data: res })));
    }

    return obs$;
  }

  // invalidate cache entries that contain this queryKey (or exact match)
  invalidate(queryKey: string) {
    for (const k of Array.from(this.cache.keys())) {
      try {
        const parsed = JSON.parse(k);
        if (Array.isArray(parsed) && parsed[0] === queryKey) {
          this.cache.delete(k);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    // broadcast reload to any listeners
    this.reload$.next(queryKey);
  }

  // optional: clear all cache
  clearAll() {
    this.cache.clear();
  }
}
