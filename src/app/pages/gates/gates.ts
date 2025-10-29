import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Column } from '../../models/table.model';
import { ApiService } from '../../services/api.service';
import { TableDataService } from '../../services/table-data.service';
import { GenericTableComponent } from '../../shared/table/generic-table/generic-table';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-gates',
  standalone: true,
  imports: [CommonModule, GenericTableComponent, MatIconModule],
  templateUrl: './gates.html',
  styleUrl: './gates.css',
})
export class Gates implements OnInit {
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
    list: '/Gates/GetAll',
    create: '/Gates/Create',
    update: '/Gates/Update',
    delete: '/Gates/Delete',
  };

  // data for select options
  prisons: Array<{ name: string; id: string }> = [];
  regions: Array<{ name: string; id: string }> = [];
  administrations: Array<{ name: string; id: string }> = [];

  constructor(private api: ApiService, private tableData: TableDataService) {}

  ngOnInit() {
    this.columns = [
      { key: 'id', label: 'رقم' },
      { key: 'name', label: 'البوابة' },
      { key: 'prisonId', label: 'السجن' },
      { key: 'actions', label: 'اتخاذ إجراء', template: this.actionsTemplate },
    ];

    this.fetchPrisons();
    this.fetchRegions();
    this.fetchAdministrations();
  }

  // fetch all prisons
  async fetchPrisons() {
    try {
      const res = await firstValueFrom(
        this.api.fetchListFromEndpoint('/Prisons/GetAll', {
          page: 1,
          pageSize: 100,
          search: '',
        })
      );
      if (res?.data) {
        this.prisons = res.data.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));
      }
    } catch (error) {
      console.error('Error fetching prisons', error);
    }
  }

  // fetch all regions
  async fetchRegions() {
    try {
      const res = await firstValueFrom(
        this.api.fetchListFromEndpoint('/Regions/GetAll', {
          page: 1,
          pageSize: 100,
          search: '',
        })
      );
      if (res?.data) {
        this.regions = res.data.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));
      }
    } catch (error) {
      console.error('Error fetching regions', error);
    }
  }

  // fetch all administrations
  async fetchAdministrations() {
    try {
      const res = await firstValueFrom(
        this.api.fetchListFromEndpoint('/Administrations/GetAll', {
          page: 1,
          pageSize: 100,
          search: '',
        })
      );
      if (res?.data) {
        this.administrations = res.data.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));
      }
    } catch (error) {
      console.error('Error fetching administrations', error);
    }
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
      prisonId: row.prisonId,
      regionId: row.regionId,
      administrationId: row.administrationId,
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
      prisonId: String(fd.get('prisonId') ?? fd.get('prisonId') ?? ''),
      regionId: String(fd.get('regionId') ?? fd.get('regionId') ?? ''),
      administrationId: String(fd.get('administrationId') ?? fd.get('administrationId') ?? ''),
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
            message: 'تم إضافة البوابة بنجاح',
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
            message: 'تم تحديث بيانات البوابة',
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
      this.tableData.invalidate('gates');
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
        this.resultDialog = { title: 'تم الحذف', message: 'تم حذف ابوابة بنجاح', type: 'success' };
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
      this.tableData.invalidate('gates');
      setTimeout(() => (this.resultDialog = null), 2500);
    }
  }
}
