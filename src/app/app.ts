import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthStateService } from './core/auth/auth-state.service';
import { CommonModule } from '@angular/common';
import { WatchPartyWsService } from './core/services/watch-party-ws.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(
    public authState: AuthStateService,
    private router: Router,
    private wpWs: WatchPartyWsService
  ) {}

  
  isLoggedIn(): boolean {
    return this.authState.isAuthenticated();
  }
  
  logout(): void {
    this.authState.clear();
    this.wpWs.disconnect();
    this.router.navigate(['/']);
  }

}
