// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Home } from './pages/home/home';
import { Users } from './pages/users/users';
import { AuthGuard } from './core/auth.guard';
import { Visitors } from './pages/visitors/visitors';
import { Contracts } from './pages/contracts/contracts';
import { Reviewers } from './pages/reviewers/reviewers';
import { Externals } from './pages/externals/externals';
import { All } from './pages/all/all';
import { Roles } from './pages/roles/roles';
import { Reports } from './pages/reports/reports';
import { TableExample } from './pages/table-example/table-example';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: Home },
      { path: 'users', component: Users },
      { path: 'visitors', component: Visitors },
      { path: 'contracts', component: Contracts },
      { path: 'reviewers', component: Reviewers },
      { path: 'externals', component: Externals },
      { path: 'all', component: All },
      { path: 'roles', component: Roles },
      { path: 'reports', component: Reports },
      { path: 'exapmle', component: TableExample },
    ],
  },
  { path: '**', redirectTo: '' },
];
