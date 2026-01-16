import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthActionsService {
  constructor(private authState: AuthStateService, private router: Router) {}

  requireLoginOrRedirect(returnUrl: string): boolean {
    if (this.authState.isAuthenticated()) return true;

    this.router.navigate(['/login'], { queryParams: { returnUrl } });
    return false;
  }
}
