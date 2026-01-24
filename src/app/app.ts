import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthStateService } from './core/auth/auth-state.service';
import { CommonModule } from '@angular/common';

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
    private router: Router
  ) {}

  
  isLoggedIn(): boolean {
    return this.authState.isAuthenticated(); // computed signal -> poziva se kao funkcija
  }
  
  logout(): void {
  this.authState.clear();
  this.router.navigate(['/']);
}

}
