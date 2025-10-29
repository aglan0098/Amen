import { Component, TemplateRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Column } from '../../models/table.model';
import { ApiService } from '../../services/api.service';
import { TableDataService } from '../../services/table-data.service';
import { GenericTableComponent } from '../../shared/table/generic-table/generic-table';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, GenericTableComponent, MatIconModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit {
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
    list: '/Users/GetAll',
    create: '/Users/Create',
    update: '/Users/Update',
    delete: '/Users/Delete',
  };

  constructor(private api: ApiService, private tableData: TableDataService) {}

  ngOnInit() {
    this.columns = [
      { key: 'id', label: 'رقم' },
      { key: 'nationalId', label: 'رقم الهوية' },
      { key: 'userName', label: 'الأسم' },
      { key: 'email', label: 'الإيميل' },
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
      userName: row.userName,
      email: row.email,
      nationalId: row.nationalId,
      roles: row.roles ?? [],
      claims: row.claims ?? [],
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
      userName: String(fd.get('userName') ?? fd.get('userName') ?? ''),
      email: String(fd.get('email') ?? fd.get('email') ?? ''),
      nationalId: String(fd.get('nationalId') ?? fd.get('nationalId') ?? ''),
      password: String(fd.get('password') ?? '') || undefined,
      // roleIds expected as array of strings - we accept CSV from input and convert
      roleIds: [],
      claims: [],
      gateIds: [],
    };

    // roles CSV -> array
    const rolesRaw = String(fd.get('roleIds') ?? '');
    payload.roleIds = rolesRaw
      ? rolesRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const claimsRaw = String(fd.get('claims') ?? '');
    payload.claims = claimsRaw
      ? claimsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // if editing, include id
    if (this.formDialog?.type === 'edit') {
      payload.id = this.formDialog.data?.id;
      // If password empty, remove it so backend doesn't change it accidentally
      if (!payload.password) delete payload.password;
    }

    try {
      if (this.formDialog?.type === 'create') {
        const res = await firstValueFrom(this.api.postToEndpoint(this.endpoints.create, payload));
        if (res?.isSuccess) {
          this.resultDialog = {
            title: 'تمت الإضافة',
            message: 'تم إضافة المستخدم بنجاح',
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
            message: 'تم تحديث بيانات المستخدم',
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
      this.tableData.invalidate('users');
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
      this.tableData.invalidate('users');
      // no need to manually call genericTable.reloadCurrentParams(); GenericTable listens to reload$
      setTimeout(() => (this.resultDialog = null), 2500);
    }
  }
}
