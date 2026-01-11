import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Molimo popunite sva polja ispravno.';
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        const token = res.token || res.accessToken || res.jwt;
        if (!token) {
          this.errorMessage = 'Login uspeo, ali token nije vraćen sa servera.';
          return;
        }

        this.successMessage = 'Uspešna prijava.';
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.isSubmitting = false;

        const msg = err?.error?.message;

        if (err?.status === 403) {
          this.errorMessage =
            msg ||
            'Prijava nije dozvoljena (npr. nalog nije aktiviran ili je previše pokušaja).';
          return;
        }

        this.errorMessage = msg || 'Prijava nije uspela. Proverite podatke.';
      }
    });
  }
}
