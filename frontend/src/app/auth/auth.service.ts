import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StudentSession {
  jwt: string;
  user: { email: string };
}

const sessionKey = environment.isStudentPreview ? 'intellikids-preview-student' : 'intellikids-student';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = this.restoreSession();

  constructor(private http: HttpClient, private router: Router) {}

  signIn(identifier: string, password: string) {
    if (environment.isStudentPreview) {
      return identifier.trim().toLowerCase() === 'student@intellikids.test' && password === 'IntelliKids30!'
        ? of({ jwt: 'student-preview', user: { email: 'student@intellikids.test' } })
        : throwError(() => new HttpErrorResponse({ status: 401 }));
    }
    return this.http.post<StudentSession>(environment.apiUrl + 'auth/local', { identifier, password });
  }

  setUser(user: StudentSession): void {
    this.user = user;
    sessionStorage.setItem(sessionKey, JSON.stringify(user));
  }

  signOut(): void {
    this.user = null;
    sessionStorage.removeItem(sessionKey);
    void this.router.navigateByUrl('/login');
  }

  private restoreSession(): StudentSession | null {
    const saved = sessionStorage.getItem(sessionKey);
    if (!saved) return null;

    try {
      const session = JSON.parse(saved) as StudentSession | null;
      return session && typeof session.jwt === 'string' ? session : null;
    } catch {
      return null;
    }
  }
}
