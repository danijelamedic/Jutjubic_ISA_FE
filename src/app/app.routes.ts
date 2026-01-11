import { Routes } from '@angular/router';

import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Activate } from './features/auth/pages/activate/activate';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'activate',
    component: Activate
  },
  
  // default route
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // fallback route
  {
    path: '**',
    redirectTo: 'login'
  }
];
