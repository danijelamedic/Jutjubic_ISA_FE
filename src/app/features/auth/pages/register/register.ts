import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.services';
import { RegistrationRequest } from '../../../../core/models/auth.models';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!pass || !confirm) return null;
  return pass === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        address: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
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

    const payload: RegistrationRequest = {
      email: this.f['email'].value,
      username: this.f['username'].value,
      password: this.f['password'].value,
      confirmPassword: this.f['confirmPassword'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      address: this.f['address'].value,
    };

    this.isSubmitting = true;

    this.authService.register(payload).subscribe({
      next: (_res) => {
        this.successMessage = 'Registracija uspešna. Proverite email i aktivirajte nalog preko linka.';
        this.isSubmitting = false;
        this.form.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Došlo je do greške. Pokušajte ponovo.';
      },
    });
  }
}
