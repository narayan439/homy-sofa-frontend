import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserAuthService } from '../services/user-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private userAuth: UserAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Determine which token to use based on URL and current user type
    let token = null;
    
    // Check if user is logged in and this is a user-related endpoint
    const userToken = this.userAuth.getToken();
    const isUserLoggedIn = userToken && this.userAuth.isUserLoggedIn();
    
    // Prioritize user token for user-related endpoints: auth, bookings, profile updates
    if (isUserLoggedIn && (req.url.includes('/users/') || req.url.includes('/bookings'))) {
      token = userToken;
      console.log('[AuthInterceptor] Using user token for request to:', req.url);
    } 
    // Otherwise use admin/technician token if available
    else {
      const adminToken = this.auth.getToken();
      if (adminToken) {
        token = adminToken;
        console.log('[AuthInterceptor] Using admin token for request to:', req.url);
      }
    }

    const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(cloned).pipe(
      catchError((err: HttpErrorResponse) => {
        // Only handle 401 errors for protected routes (not login endpoints)
        if (err.status === 401) {
          // Don't redirect on login/register endpoints - let components handle their errors
          const isLoginEndpoint = req.url.includes('/auth/login') || 
                                  req.url.includes('/auth/register') ||
                                  req.url.includes('/users/login') ||
                                  req.url.includes('/users/register') ||
                                  req.url.includes('/technician/login');
          
          if (!isLoginEndpoint) {
            // Determine which type of user to logout
            const isUserRoute = req.url.includes('/users/') || req.url.includes('/bookings') || this.router.url.includes('/user/');
            const isTechnicianRoute = this.router.url.includes('/technician');

            if (isUserRoute) {
              this.userAuth.logout();
              this.router.navigate(['/login']);
            } else if (isTechnicianRoute) {
              this.auth.logout();
              this.router.navigate(['/technician/login']);
            } else {
              this.auth.logout();
              this.router.navigate(['/admin/login']);
            }
          }
        }
        return throwError(() => err);
      })
    );
  }
}
