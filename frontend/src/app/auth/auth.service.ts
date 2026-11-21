import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface StudentSession {
  jwt: string;
  user: { email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = this.restoreSession();

  constructor(private http: HttpClient, private router: Router) {}

  signIn(identifier: string, password: string) {
    return this.http.post<StudentSession>(environment.apiUrl + 'auth/local', { identifier, password });
  }

  setUser(user: StudentSession): void {
    this.user = user;
    sessionStorage.setItem('intellikids-student', JSON.stringify(user));
  }

  signOut(): void {
    this.user = null;
    sessionStorage.removeItem('intellikids-student');
    void this.router.navigateByUrl('/login');
  }

  private restoreSession(): StudentSession | null {
    const saved = sessionStorage.getItem('intellikids-student');
    if (!saved) return null;

    try {
      const session = JSON.parse(saved) as StudentSession | null;
      return session && typeof session.jwt === 'string' ? session : null;
    } catch {
      return null;
    }
  }
}
