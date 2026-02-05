import { Routes } from '@angular/router';

import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Activate } from './features/auth/pages/activate/activate';
import { Home } from './features/home/home';
import { VideoDetails } from './features/videos/pages/video-details/video-details';
import { PublicUserProfile } from './features/users/pages/public-user-profile/public-user-profile';
import { UploadVideo } from './features/videos/pages/upload-video/upload-video';
import { authGuard } from './core/guards/auth.guard';
import { WatchPartyHomeComponent } from './features/watch-party/pages/watch-party-home/watch-party-home';
import { WatchPartyRoomComponent } from './features/watch-party/pages/watch-party-room/watch-party-room';




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
  {
    path: 'upload',
    component: UploadVideo,
    canActivate: [authGuard]
  },
  {
    path: 'watch-party',
    component: WatchPartyHomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'watch-party/:roomId',
    component: WatchPartyRoomComponent,
    canActivate: [authGuard]
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
