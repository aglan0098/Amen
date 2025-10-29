import { Component, Input, Output, EventEmitter, TemplateRef, OnDestroy } from '@angular/core';
import { TableDataService } from '../../../services/table-data.service';
import { ApiMockService } from '../../../services/api-mock.service';
import { ApiService } from '../../../services/api.service';
import { Column, TableResponse } from '../../../models/table.model';
import { Observable, BehaviorSubject, switchMap, tap, Subscription } from 'rxjs';
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
export class GenericTableComponent implements OnDestroy {
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
  @Input() endpoints?: { list: string; create?: string; update?: string; delete?: string };
  @Output() create = new EventEmitter<void>();

  // state
  page = 1;
  search = '';

  // observables & flags
  data$!: Observable<TableResponse>;
  isLoading = true;
  isFetching = false;
  error: any = null;

  private params$ = new BehaviorSubject({ page: 1, pageSize: this.pageSize, search: '' });
  private subs = new Subscription();

  constructor(
    private tableData: TableDataService,
    private apiMock: ApiMockService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // default pipeline: when params change -> call tableData.get(...)
    this.data$ = this.params$.pipe(
      tap(() => {
        this.isFetching = true;
        this.error = null;
      }),
      switchMap((params) => {
        const fetcher = this.queryFn
          ? this.queryFn
          : this.endpoints?.list
          ? (p: any) => this.apiService.fetchListFromEndpoint(this.endpoints!.list, p)
          : (p: any) => this.apiMock.fetch(p);

        // by default do not force reload here (force is handled when reload broadcast arrives)
        return this.tableData.get(this.queryKey, params, fetcher);
      }),
      tap(() => {
        this.isLoading = false;
        this.isFetching = false;
      })
    );

    // subscribe to tableData.reload$ to force reload when somebody invalidates the queryKey
    const reloadSub = this.tableData.reload$.subscribe((key) => {
      if (!this.queryKey) return;
      if (key === this.queryKey) {
        // force a refetch of the current params (bypass cache)
        const current = this.params$.value;
        // call get with force=true by pushing into a dedicated pipeline:
        this.isFetching = true;
        const fetcher = this.queryFn
          ? this.queryFn
          : this.endpoints?.list
          ? (p: any) => this.apiService.fetchListFromEndpoint(this.endpoints!.list, p)
          : (p: any) => this.apiMock.fetch(p);

        // directly call tableData.get with force option and subscribe to update cache/data flow
        const obs = this.tableData.get(this.queryKey, current, fetcher, { force: true });

        // subscribe once and ignore value because data$ observable will pick up cached result on next params$.next

        const s = obs.subscribe({
          next: (res) => {
            // update states; to ensure UI sees new data, push same params to params$ to retrigger data$ pipeline

            this.params$.next({ ...current });
          },
          error: (err) => {
            this.isFetching = false;
            this.error = err;
          },
        });
        this.subs.add(s);
      }
    });
    this.subs.add(reloadSub);
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
  public reloadCurrentParams() {
    const current = this.params$.value;
    // call invalidate on same queryKey to trigger reload pipeline elsewhere if needed
    this.params$.next({ ...current });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
