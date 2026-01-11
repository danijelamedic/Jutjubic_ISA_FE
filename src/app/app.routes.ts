import { Routes } from '@angular/router';

import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Activate } from './features/auth/pages/activate/activate';
import { Home } from './features/home/home'

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
  {
    path: 'home',
    component: Home
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
