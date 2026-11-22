import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  readonly isStudentPreview = environment.isStudentPreview;
  readonly teacherCmsUrl = environment.teacherCmsUrl;
  readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  error = '';
  signingIn = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.user) void this.router.navigateByUrl('/dashboard');
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid || this.signingIn) return;

    this.signingIn = true;
    const { identifier, password } = this.form.getRawValue();
    this.auth.signIn(identifier, password)
      .pipe(finalize(() => this.signingIn = false))
      .subscribe({
        next: (session) => {
          this.auth.setUser(session);
          void this.router.navigateByUrl('/dashboard');
        },
        error: ({ status }) => {
          this.error = status === 400 || status === 401
            ? 'Check your student email and password.'
            : 'The sign-in service is unavailable. Try again.';
        },
      });
  }
}
