import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TechnicianNoAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    // If technician is already logged in, redirect to technician dashboard
    const token = localStorage.getItem('technicianToken');
    if (token) {
      return this.router.parseUrl('/technician/dashboard');
    }

    // Not logged in, allow access to login
    return true;
  }
}
