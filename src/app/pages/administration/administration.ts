import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Column } from '../../models/table.model';
import { ApiService } from '../../services/api.service';
import { TableDataService } from '../../services/table-data.service';
import { GenericTableComponent } from '../../shared/table/generic-table/generic-table';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [CommonModule, GenericTableComponent, MatIconModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('genericTableComp', { static: false }) genericTableComp!: GenericTableComponent;

  columns: Column[] = [];

  // UI state
  openMenuId: string | number | null = null;
  formDialog: null | { type: 'create' | 'edit'; data?: any } = null;
  deleteId: string | number | null = null;

  // result dialog for success/fail messages
  resultDialog: null | { title: string; message: string; type?: 'success' | 'error' } = null;

  // endpoints for this page
  endpoints = {
    list: '/Administrations/GetAll',
    create: '/Administrations/Create',
    update: '/Administrations/Update',
    delete: '/Administrations/Delete',
  };

  constructor(private api: ApiService, private tableData: TableDataService) {}

  ngOnInit() {
    this.columns = [
      { key: 'id', label: 'رقم' },
      { key: 'name', label: 'الإدارة' },
      { key: 'regions', label: 'المناطق' },
      { key: 'actions', label: 'اتخاذ إجراء', template: this.actionsTemplate },
    ];
  }

  // create button handler (يفتح الفورم)
  onCreate() {
    this.formDialog = { type: 'create' };
    this.openMenuId = null;
  }

  // فتح نافذة التعديل مع البيانات الحالية
  openEdit(row: any) {
    // normalize data to match form fields
    const data = {
      id: row.id ?? row._id,
      name: row.name,
    };
    this.formDialog = { type: 'edit', data };
  }

  // handle submit: نأخذ الـ event.target كـ HTMLFormElement
  async submitForm(ev: Event) {
    ev.preventDefault();
    const formEl = ev.target as HTMLFormElement;
    if (!formEl) return;

    const fd = new FormData(formEl);
    // build payload matching API contract
    const payload: any = {
      name: String(fd.get('name') ?? fd.get('name') ?? ''),
    };

    // if editing, include id
    if (this.formDialog?.type === 'edit') {
      payload.id = this.formDialog.data?.id;
    }

    try {
      if (this.formDialog?.type === 'create') {
        const res = await firstValueFrom(this.api.postToEndpoint(this.endpoints.create, payload));
        if (res?.isSuccess) {
          this.resultDialog = {
            title: 'تمت الإضافة',
            message: 'تم إضافة الإدارة بنجاح',
            type: 'success',
          };
        } else {
          this.resultDialog = {
            title: 'فشل الإضافة',
            message: res?.errorContent ?? 'حدث خطأ',
            type: 'error',
          };
        }
      } else {
        const res = await firstValueFrom(this.api.postToEndpoint(this.endpoints.update, payload));
        if (res?.isSuccess) {
          this.resultDialog = {
            title: 'تم التحديث',
            message: 'تم تحديث بيانات الإدارة',
            type: 'success',
          };
        } else {
          this.resultDialog = {
            title: 'فشل التحديث',
            message: res?.errorContent ?? 'حدث خطأ',
            type: 'error',
          };
        }
      }
    } catch (err: any) {
      this.resultDialog = {
        title: 'خطأ',
        message: err?.message ?? 'حدث خطأ أثناء الاتصال',
        type: 'error',
      };
    } finally {
      // أغلق الفورم، امسح الكاش وأعد تحميل الجدول
      this.formDialog = null;
      this.tableData.invalidate('administrations');
      // reload table if موجود
      try {
        this.genericTableComp?.reloadCurrentParams();
      } catch (e) {}
      // auto hide result after 2.5s
      setTimeout(() => (this.resultDialog = null), 2500);
    }
  }

  // confirm delete
  async confirmDelete() {
    if (!this.deleteId) return;
    try {
      const idStr = String(this.deleteId);
      const res = await firstValueFrom(this.api.deleteById(this.endpoints.delete, idStr));
      if (res?.isSuccess) {
        this.resultDialog = { title: 'تم الحذف', message: 'تم حذف السجل بنجاح', type: 'success' };
      } else {
        this.resultDialog = {
          title: 'فشل الحذف',
          message: res?.errorContent ?? 'حدث خطأ',
          type: 'error',
        };
      }
    } catch (err: any) {
      this.resultDialog = {
        title: 'خطأ',
        message: err?.message ?? 'حدث خطأ أثناء الاتصال',
        type: 'error',
      };
    } finally {
      this.deleteId = null;
      // important: invalidate will delete cache and broadcast reload$
      this.tableData.invalidate('administrations');
      // no need to manually call genericTable.reloadCurrentParams(); GenericTable listens to reload$
      setTimeout(() => (this.resultDialog = null), 2500);
    }
  }
}
