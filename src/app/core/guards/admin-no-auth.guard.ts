import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminNoAuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    // If admin is already logged in, redirect to admin dashboard
    if (this.auth.isAuthenticated()) {
      return this.router.parseUrl('/admin/dashboard');
    }

    // Not logged in, allow access to login
    return true;
  }
}
