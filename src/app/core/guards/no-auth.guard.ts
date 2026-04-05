import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserAuthService } from '../services/user-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private userAuth: UserAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // If user is already logged in, redirect to dashboard
    if (this.userAuth.isUserLoggedIn()) {
      this.snackBar.open('You are already logged in', 'Close', { duration: 3000 });
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Not logged in, allow access to login/signup
    return true;
  }
}
