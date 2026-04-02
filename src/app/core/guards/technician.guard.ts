import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TechnicianGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.checkAuth();
  }

  canActivateChild(): boolean | UrlTree {
    return this.checkAuth();
  }

  private checkAuth(): boolean | UrlTree {
    const token = localStorage.getItem('technicianToken');
    if (token) return true;
    return this.router.parseUrl('/technician/login');
  }
}
