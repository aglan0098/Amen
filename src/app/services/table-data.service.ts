import { Injectable } from '@angular/core';
import { Observable, of, from, tap, switchMap } from 'rxjs';
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

  // Build cache key deterministically
  buildKey(queryKey: string, params: { page: number; pageSize: number; search: string }) {
    return JSON.stringify([queryKey, params.page, params.pageSize, params.search]);
  }

  // get: returns Observable<TableResponse>. If cached and fresh -> returns cached immediately.
  // Else call fetcher, cache result, and return it.
  get(
    queryKey: string,
    params: { page: number; pageSize: number; search: string },
    fetcher: FetcherFn
  ): Observable<TableResponse> {
    const key = this.buildKey(queryKey, params);
    const now = Date.now();
    const cached = this.cache.get(key);

    if (cached && now - cached.ts < this.TTL) {
      // return cached sync-like observable
      return of(cached.data);
    }

    // call fetcher (handle Promise or Observable)
    const result = fetcher(params);

    let obs$: Observable<TableResponse>;

    if (result instanceof Observable) {
      obs$ = result.pipe(tap((res) => this.cache.set(key, { ts: Date.now(), data: res })));
    } else {
      // it's a Promise
      obs$ = from(result).pipe(tap((res) => this.cache.set(key, { ts: Date.now(), data: res })));
    }

    return obs$;
  }

  // optional: invalidate by queryKey
  invalidate(queryKey: string) {
    for (const k of Array.from(this.cache.keys())) {
      if (k.includes(JSON.stringify([queryKey]).slice(0, 10))) {
        this.cache.delete(k);
      }
    }
  }
}
