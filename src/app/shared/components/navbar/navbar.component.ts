import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  mobileSidebarOpen = false;
  isScrolled = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menuBtn = (event.target as HTMLElement).closest('.mobile-menu-btn');
    const mobileSidebar = (event.target as HTMLElement).closest('.mobile-sidebar');
    const overlay = (event.target as HTMLElement).closest('.mobile-sidebar-overlay');
    
    if (!menuBtn && !mobileSidebar && !overlay && this.mobileSidebarOpen) {
      this.closeMobileSidebar();
    }
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    document.body.style.overflow = this.mobileSidebarOpen ? 'hidden' : '';
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen = false;
    document.body.style.overflow = '';
  }

}