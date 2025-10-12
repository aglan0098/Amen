import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column } from '../../../models/table.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
})
export class TableComponent {
  @Input() columns: Column[] = [];
  @Input() rows: any[] = [];

  // Each column may optionally carry a TemplateRef (passed by parent via columns array)
}
