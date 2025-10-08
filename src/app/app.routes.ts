// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Home } from './pages/dashboard/home/home';
import { Users } from './pages/dashboard/users/users';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: Home },
      { path: 'users', component: Users },
    ],
  },
  { path: '**', redirectTo: '' },
];
