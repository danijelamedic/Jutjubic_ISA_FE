import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.services';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activate.html',
  styleUrl: './activate.scss'
})
export class Activate implements OnInit {
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      this.errorMessage = 'Token nije prosleđen u linku.';
      return;
    }

    this.authService.activate(token).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message || 'Nalog je uspešno aktiviran.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Aktivacija nije uspela (neispravan ili istekao token).';
      }
    });
  }
}
