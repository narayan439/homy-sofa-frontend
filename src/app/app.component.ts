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
        const isTechnicianPage = event.url.includes('/technician');

        // Hide navbar/footer/whatsapp on admin and technician panels
        const hide = isAdminPage || isTechnicianPage;
        this.showNavbar = !hide;
        this.showFooter = !hide;
        this.showWhatsApp = !hide;
      }
    });
  }
}
