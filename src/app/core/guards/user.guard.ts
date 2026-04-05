import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserAuthService } from '../services/user-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(
    private userAuth: UserAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.userAuth.isUserLoggedIn()) {
      return true;
    }

    // Not logged in, redirect to login
    this.snackBar.open('Please login to continue', 'Close', { duration: 3000 });
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
