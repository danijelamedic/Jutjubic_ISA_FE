import { Routes } from '@angular/router';

import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Activate } from './features/auth/pages/activate/activate';
import { Home } from './features/home/home';
import { VideoDetails } from './features/videos/pages/video-details/video-details';
import { PublicUserProfile } from './features/users/pages/public-user-profile/public-user-profile';



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

  // home je public feed (default)
  {
    path: '',
    component: Home
  },
  {
    path: 'videos/:id',
    component: VideoDetails
  },
  {
    path: 'users/:username',
    component: PublicUserProfile
  },

  // default
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },

  // fallback route
  {
    path: '**',
    redirectTo: ''
  }
];
