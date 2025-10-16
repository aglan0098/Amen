import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Column } from '../../models/table.model';
// table component
import { GenericTableComponent } from '../../shared/table/generic-table/generic-table';
// data
import { mockData } from '../../mock/mock-data';
import { ApiMockService } from '../../services/api-mock.service';

@Component({
  selector: 'app-reviewers',
  standalone: true,
  imports: [CommonModule, GenericTableComponent, MatIconModule],
  templateUrl: './reviewers.html',
  styleUrl: './reviewers.css',
})
export class Reviewers {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

  columns: Column[] = [];
  mockData = mockData;

  // UI state
  openMenuId: string | number | null = null;
  formDialog: null | { type: 'create' | 'edit'; data?: any } = null;
  deleteId: string | number | null = null;

  constructor(private apiMock: ApiMockService) {}

  ngAfterViewInit() {
    this.columns = [
      { key: 'id', label: 'رقم الهوية' },
      { key: 'name', label: 'الأسم' },
      { key: 'area', label: 'اسم المنطقة' },
      { key: 'prison', label: 'اسم السجن' },
      { key: 'end', label: 'اسم الإدارة' },
      { key: 'phone', label: 'رقم الهاتف' },
      { key: 'actions', label: 'اتخاذ إجراء', template: this.actionsTemplate },
    ];
  }

  // handlers for create/edit/delete will call API (here we use mock)
  onCreate() {
    this.formDialog = { type: 'create' };
    this.openMenuId = null;
  }

  // ... implement create/edit/delete using apiMock or real api
}
