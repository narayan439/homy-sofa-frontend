import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  // Controls mobile sidebar state
  mobileSidebarOpen: boolean = false;
  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.isScrolled = scrollPosition > 50;
  }

  // Toggle sidebar (hamburger button)
  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    this.updateBodyScroll();
  }

  // Close sidebar (overlay / menu click)
  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
    this.updateBodyScroll();
  }

  // Handle body scroll when sidebar is open
  private updateBodyScroll(): void {
    document.body.style.overflow = this.mobileSidebarOpen ? 'hidden' : '';
  }
}