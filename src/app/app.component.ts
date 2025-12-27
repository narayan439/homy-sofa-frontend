import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  showNavbar = true;
  showFooter = true;
  showWhatsApp = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        const isAdminPage = event.url.includes('/admin');

        // Hide everything in admin panel
        this.showNavbar = !isAdminPage;
        this.showFooter = !isAdminPage;
        this.showWhatsApp = !isAdminPage;
      }
    });
  }
}
