import { Injectable } from '@angular/core';
import { TableResponse } from '../models/table.model';

import { mockData } from '../mock/mock-data';
import { firstValueFrom, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiMockService {
  // simulate server-side filtering + paging; returns Promise<TableResponse>
  async fetch(params: { page: number; pageSize: number; search: string }): Promise<TableResponse> {
    const q = (params.search || '').trim().toLowerCase();
    const all = mockData.data;
    const filtered = q
      ? all.filter((item) =>
          Object.values(item).some((v) =>
            String(v || '')
              .toLowerCase()
              .includes(q)
          )
        )
      : all;
    const recordsFiltered = filtered.length;
    const start = (params.page - 1) * params.pageSize;
    const pageRows = filtered.slice(start, start + params.pageSize);

    // simulate delay
    await new Promise((r) => setTimeout(r, 250));

    return {
      data: pageRows,
      recordsTotal: mockData.recordsTotal,
      recordsFiltered,
    };
  }
}
