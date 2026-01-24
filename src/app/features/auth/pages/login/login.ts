import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.services';
import { AuthStateService } from '../../../../core/auth/auth-state.service'; 
import { ActivatedRoute } from '@angular/router';


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
    private authState: AuthStateService, 
    private router: Router,
    private route: ActivatedRoute
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

        const token = (res as any).token || (res as any).accessToken || (res as any).jwt;
        if (!token) {
          this.errorMessage = 'Login uspeo, ali token nije vraćen sa servera.';
          return;
        }

        this.authState.setToken(token); 

        this.successMessage = 'Uspešna prijava.';

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
        this.router.navigateByUrl(returnUrl);

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
