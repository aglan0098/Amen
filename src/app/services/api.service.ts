// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TableResponse } from '../models/table.model';
import { environment } from '../../environments/environment';

interface GlobalApiResponse<T = any> {
  isSuccess: boolean;
  errorTitle?: string;
  errorContent?: string;
  jwt?: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('APP_TOKEN') || '';
    const headersInit: { [k: string]: string } = { 'Content-Type': 'application/json' };
    if (token) headersInit['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headersInit);
  }

  // Normalize endpoint: if startsWith http(s) -> use as-is, else prefix environment.apiUrl
  private buildUrl(endpoint: string) {
    if (!endpoint) throw new Error('Endpoint is required');
    endpoint = endpoint.trim();
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
    // strip leading/trailing slashes to avoid double slashes
    const base = environment.apiUrl?.replace(/\/+$/g, '') ?? '';
    const path = endpoint.replace(/^\/+/g, '');
    return `${base}/${path}`;
  }

  fetchListFromEndpoint(
    endpoint: string,
    params: { page: number; pageSize: number; search: string; orderByDescending?: boolean }
  ): Observable<TableResponse> {
    const url = this.buildUrl(endpoint);
    const body = {
      searchValue: params.search || '',
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderByDescending: params.orderByDescending ?? true,
    };

    return this.http.post<GlobalApiResponse<any>>(url, body, { headers: this.getHeaders() }).pipe(
      map((res) => {
        if (!res) {
          return { data: [], recordsTotal: 0, recordsFiltered: 0 } as TableResponse;
        }
        // optionally update token if backend returned new jwt
        if (res.jwt) {
          sessionStorage.setItem('APP_TOKEN', res.jwt);
        }
        const obj = res.data ?? { totalRecords: 0, totalFiltered: 0, data: [] };
        return {
          data: Array.isArray(obj.data) ? obj.data : [],
          recordsTotal: obj.totalRecords ?? 0,
          recordsFiltered:
            obj.totalFiltered ??
            obj.totalRecords ??
            (Array.isArray(obj.data) ? obj.data.length : 0),
        } as TableResponse;
      })
    );
  }

  postToEndpoint<T = any>(endpoint: string, body: any): Observable<GlobalApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.http.post<GlobalApiResponse<T>>(url, body, { headers: this.getHeaders() }).pipe(
      map((res) => {
        if (res?.jwt) sessionStorage.setItem('APP_TOKEN', res.jwt);
        return res;
      })
    );
  }

  deleteById(endpoint: string, id: string): Observable<GlobalApiResponse<any>> {
    const url = this.buildUrl(endpoint);
    // إرسال id كـ query param لأن API بتطلب parameters وليس body
    const urlWithId = url.includes('?')
      ? `${url}&id=${encodeURIComponent(id)}`
      : `${url}?id=${encodeURIComponent(id)}`;
    // نرسل POST بدون body (أو null) — بما إن الـ API عندك POST /Delete?id=...
    return this.http
      .post<GlobalApiResponse<any>>(urlWithId, null, { headers: this.getHeaders() })
      .pipe(
        map((res) => {
          if (res?.jwt) sessionStorage.setItem('APP_TOKEN', res.jwt);
          return res;
        })
      );
  }

  // get data from endpoint wihout any parameters
  getFromEndpoint<T = any>(endpoint: string): Observable<GlobalApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.http.get<GlobalApiResponse<T>>(url, { headers: this.getHeaders() }).pipe(
      map((res) => {
        if (res?.jwt) sessionStorage.setItem('APP_TOKEN', res.jwt);
        return res;
      })
    );
  }
}
