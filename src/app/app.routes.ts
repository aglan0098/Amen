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
import { Regions } from './pages/regions/regions';
import { Administration } from './pages/administration/administration';
import { Prisons } from './pages/prisons/prisons';
import { Gates } from './pages/gates/gates';
import { Contractors } from './pages/contractors/contractors';

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
      { path: 'contractors', component: Contractors },
      { path: 'reviewers', component: Reviewers },
      { path: 'externals', component: Externals },
      { path: 'all', component: All },
      { path: 'administration', component: Administration },
      { path: 'regions', component: Regions },
      { path: 'prisons', component: Prisons },
      { path: 'gates', component: Gates },
      { path: 'roles', component: Roles },
      { path: 'reports', component: Reports },
      { path: 'exapmle', component: TableExample },
    ],
  },
  { path: '**', redirectTo: '' },
];
