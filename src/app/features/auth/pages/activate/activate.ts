import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.services';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './activate.html',
  styleUrl: './activate.scss'
})
export class Activate implements OnInit {
  successMessage = '';
  errorMessage = '';
  status: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'error';
      this.errorMessage = 'Token nije prosleđen u linku.';
      return;
    }

    this.status = 'loading';

    this.authService.activate(token).subscribe({
      next: (res) => {
        this.status = 'success';
        this.successMessage = res.message || 'Nalog je uspešno aktiviran.';
      },
      error: (err) => {
        this.status = 'error';
        this.errorMessage =
          err?.error?.message || 'Aktivacija nije uspela (neispravan ili istekao token).';
      }
    });
  }
}
