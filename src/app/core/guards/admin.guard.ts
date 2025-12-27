import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router, private auth: AuthService) {}

  canActivate(): boolean | UrlTree {
    return this.checkAuth();
  }

  canActivateChild(): boolean | UrlTree {
    return this.checkAuth();
  }

  private checkAuth(): boolean | UrlTree {
    // Use localStorage token presence for synchronous check
    const token = this.auth.getToken();
    const isAuth = this.auth.isAuthenticated();
    console.debug('[AdminGuard] token-present=', !!token, 'isAuthenticated=', isAuth);
    if (isAuth) {
      return true;
    }
    // Return a UrlTree instead of imperative navigation to avoid navigation side-effects on reload
    const tree = this.router.parseUrl('/admin/login');
    console.debug('[AdminGuard] redirecting to', tree.toString());
    return tree;
  }
}
