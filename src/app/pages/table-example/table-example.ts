import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Column } from '../../models/table.model';
import { mockData } from '../../mock/mock-data';
import { ApiMockService } from '../../services/api-mock.service';
import { GenericTableComponent } from '../../shared/table/generic-table/generic-table';
import { CommonModule } from '@angular/common';

// ستستخدم modals محلياً (بدون مكتبة خارجية) — simple overlay
@Component({
  selector: 'app-table-example',
  standalone: true,
  imports: [CommonModule, GenericTableComponent],
  templateUrl: './table-example.html',
})
export class TableExample {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

  columns: Column[] = [];
  mockData = mockData;

  // UI state
  openMenuId: string | number | null = null;
  formDialog: null | { type: 'create' | 'edit'; data?: any } = null;
  deleteId: string | number | null = null;

  constructor(private apiMock: ApiMockService) {}

  ngAfterViewInit() {
    // build columns and assign template for actions column
    this.columns = [
      { key: 'name', label: 'الأسم' },
      { key: 'location', label: 'المنظقة' },
      { key: 'actions', label: '#', template: this.actionsTemplate }, // NOTE: TemplateRef assigned after view init
    ];
  }

  // handlers for create/edit/delete will call API (here we use mock)
  onCreate() {
    this.formDialog = { type: 'create' };
    this.openMenuId = null;
  }

  // ... implement create/edit/delete using apiMock or real api
}
