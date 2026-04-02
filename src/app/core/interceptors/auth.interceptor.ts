import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(cloned).pipe(
      catchError((err: HttpErrorResponse) => {
        // Only handle 401 errors for protected routes (not login endpoints)
        if (err.status === 401) {
          // Don't redirect on login/register endpoints - let components handle their errors
          const isLoginEndpoint = req.url.includes('/auth/login') || 
                                  req.url.includes('/auth/register') ||
                                  req.url.includes('/technician/login');
          
          if (!isLoginEndpoint) {
            this.auth.logout();
            
            // Determine which login page to redirect to based on current URL
            const currentUrl = this.router.url;
            const isTechnicianRoute = currentUrl.includes('/technician');
            
            if (isTechnicianRoute) {
              // Technician route → redirect to technician login
              this.router.navigate(['/technician/login']);
            } else {
              // Admin/default route → redirect to admin login
              this.router.navigate(['/admin/login']);
            }
          }
        }
        return throwError(() => err);
      })
    );
  }
}
