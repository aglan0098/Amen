import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Column } from '../../models/table.model';
import { ApiService } from '../../services/api.service';
import { TableDataService } from '../../services/table-data.service';
import { GenericTableComponent } from '../../shared/table/generic-table/generic-table';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, GenericTableComponent, MatIconModule],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css',
})
export class Contracts implements OnInit {
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
    list: '/Contracts/GetAll',
    create: '/Contracts/Create',
    update: '/Contracts/Update',
    delete: '/Contracts/Delete',
  };

  constructor(private api: ApiService, private tableData: TableDataService) {}

  ngOnInit() {
    this.columns = [
      { key: 'id', label: 'رقم' },
      { key: 'contractNumber', label: 'رقم العقد' },
      { key: 'description', label: 'الوصف' },
      { key: 'beginDate', label: 'تاريح البداية' },
      { key: 'endDate', label: 'تاريح النهاية' },
      { key: 'actions', label: 'اتخاذ إجراء', template: this.actionsTemplate },
    ];
  }

  // create button handler
  onCreate() {
    this.formDialog = { type: 'create' };
    this.openMenuId = null;
  }

  openEdit(row: any) {
    const data = {
      id: row.id ?? row._id,
      contractNumber: row.contractNumber,
      description: row.description,
      beginDate: row.beginDate,
      endDate: row.endDate,
    };
    this.formDialog = { type: 'edit', data };
  }

  // submit form handler
  async submitForm(ev: Event) {
    ev.preventDefault();
    const formEl = ev.target as HTMLFormElement;
    if (!formEl) return;

    const fd = new FormData(formEl);
    // build payload matching API contract
    const payload: any = {
      contractNumber: String(fd.get('contractNumber') ?? fd.get('contractNumber') ?? ''),
      description: String(fd.get('description') ?? fd.get('description') ?? ''),
      beginDate: String(fd.get('beginDate') ?? fd.get('beginDate') ?? ''),
      endDate: String(fd.get('endDate') ?? fd.get('endDate') ?? ''),
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
            message: 'تم إضافة العقد بنجاح',
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
            message: 'تم تحديث بيانات العقد',
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
      this.formDialog = null;
      this.tableData.invalidate('contracts');
      try {
        this.genericTableComp?.reloadCurrentParams();
      } catch (e) {}
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
        this.resultDialog = { title: 'تم الحذف', message: 'تم حذف العقد بنجاح', type: 'success' };
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
      this.tableData.invalidate('contracts');
      setTimeout(() => (this.resultDialog = null), 2500);
    }
  }
}
