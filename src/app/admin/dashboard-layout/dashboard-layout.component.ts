import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {

  isMobile = false;
  mobileSidebarOpen = false;

  constructor(private router: Router) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    console.debug('[DashboardLayout] initialized; isMobile=', this.isMobile, 'mobileSidebarOpen=', this.mobileSidebarOpen);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mobileSidebarOpen = false;
    }
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = this.mobileSidebarOpen ? 'hidden' : '';
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen = false;
    document.body.style.overflow = '';
  }

  logout() {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    this.router.navigate(['/admin/login']);
  }
}