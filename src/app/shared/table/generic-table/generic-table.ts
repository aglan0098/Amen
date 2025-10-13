import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { TableDataService } from '../../../services/table-data.service';
import { ApiMockService } from '../../../services/api-mock.service';
import { Column, TableResponse } from '../../../models/table.model';
import { Observable, BehaviorSubject, switchMap, startWith, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

// components
import { SearchInputComponent } from '../search/search';
import { TableComponent } from '../table/table';
import { PaginationComponent } from '../pagination/pagination';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [CommonModule, SearchInputComponent, TableComponent, PaginationComponent],
  templateUrl: './generic-table.html',
})
export class GenericTableComponent {
  Math = Math;

  @Input() mockData: any = null;
  @Input() columns: Column[] = [];
  @Input() queryKey = '';
  @Input() queryFn?: (params: {
    page: number;
    pageSize: number;
    search: string;
  }) => Promise<TableResponse> | Observable<TableResponse>;
  @Input() pageSize = 10;
  @Input() showCreateButton = false;
  @Output() create = new EventEmitter<void>();

  // state
  page = 1;
  search = '';

  // observables & flags
  data$!: Observable<TableResponse>;
  isLoading = true;
  isFetching = false;
  error: any = null;

  // internal trigger for params
  private params$ = new BehaviorSubject({ page: 1, pageSize: this.pageSize, search: '' });

  constructor(private tableData: TableDataService, private apiMock: ApiMockService) {}

  ngOnInit() {
    // Observable pipeline that calls tableData.get(...) whenever params change
    this.data$ = this.params$.pipe(
      tap(() => {
        // set fetching state; but if first load, leave isLoading true
        this.isFetching = true;
        this.error = null;
      }),
      switchMap((params) => {
        const fetcher = this.queryFn ? this.queryFn : (p: any) => this.apiMock.fetch(p);
        // keepPreviousData behavior: we won't wipe previous data synchronously because data$ is continuous
        return this.tableData.get(this.queryKey, params, fetcher);
      }),
      tap(() => {
        this.isLoading = false;
        this.isFetching = false;
      })
    );
  }

  // called by SearchInput (with debounce)
  onSearch(v: string) {
    this.page = 1;
    this.search = v;
    this.params$.next({ page: this.page, pageSize: this.pageSize, search: this.search });
  }

  onPageChange(p: number | Event) {
    const pageNum =
      typeof p === 'number'
        ? p
        : (p as any)?.page ?? (p as any)?.pageIndex ?? (p as any)?.detail ?? this.page;

    const page = Number(pageNum) || 1;
    if (page < 1) return;
    this.page = page;
    this.params$.next({ page: this.page, pageSize: this.pageSize, search: this.search });
  }
}
