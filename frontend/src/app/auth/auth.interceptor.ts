import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    const token = this.auth.user?.jwt;
    if (!environment.isStudentPreview && token && request.url.startsWith(environment.apiUrl)) {
      request = request.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
    }
    return next.handle(request);
  }
}
