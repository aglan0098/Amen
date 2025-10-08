import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTable } from '../../../shared/generic-table/generic-table';
import { ApiService } from '../../../core/api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, GenericTable],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ];

  users$: Observable<any[]>;

  constructor(private api: ApiService) {
    this.users$ = this.api.getUsers(); // observable cached in ApiService
  }
}
