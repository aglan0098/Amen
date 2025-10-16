import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// services
import { AuthService } from '../../core/auth.service';
import { UserService } from '../../core/user.service';
import { catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);

  form = this.fb.group({
    userName: ['', [Validators.required]],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { userName, password } = this.form.value;

    this.auth
      .login(userName!, password!)
      .pipe(
        switchMap(() =>
          this.userService.fetchCurrentUser().pipe(
            catchError((e) => {
              console.error('Failed to fetch user', e);
              return of(null);
            })
          )
        )
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.message || 'فشل تسجيل الدخول';
        },
      });
  }
}
