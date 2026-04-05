import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { UserAuthService } from './core/services/user-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  showNavbar = true;
  showFooter = true;
  showWhatsApp = true;

  constructor(
    private router: Router,
    private userAuthService: UserAuthService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        const isAdminPage = event.url.includes('/admin');
        const isTechnicianPage = event.url.includes('/technician');
        const isUserLoggedIn = this.userAuthService.isUserLoggedIn();

        // Hide navbar/footer/whatsapp on admin and technician panels
        // Hide footer when user is logged in
        const hideNav = isAdminPage || isTechnicianPage;
        const hideFooter = isAdminPage || isTechnicianPage || isUserLoggedIn;
        this.showNavbar = !hideNav;
        this.showFooter = !hideFooter;
        this.showWhatsApp = !hideNav;
      }
    });
  }
}
