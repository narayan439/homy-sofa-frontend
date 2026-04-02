import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-technician-dashboard-layout',
  templateUrl: './technician-dashboard-layout.component.html',
  styleUrls: ['./technician-dashboard-layout.component.css']
})
export class TechnicianDashboardLayoutComponent implements OnInit {

  isMobile = false;
  mobileSidebarOpen = false;
  technicianName: string = '';

  constructor(private router: Router) {
    this.checkScreenSize();
    this.loadTechnicianInfo();
  }

  ngOnInit(): void {
    console.debug('[TechnicianDashboardLayout] initialized; isMobile=', this.isMobile);
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

  private loadTechnicianInfo() {
    try {
      const technicianData = localStorage.getItem('technician');
      if (technicianData) {
        const technician = JSON.parse(technicianData);
        this.technicianName = technician.name || 'Technician';
      }
    } catch (e) {
      console.error('Error loading technician info:', e);
      this.technicianName = 'Technician';
    }
  }

  getTechnicianInitials(): string {
    if (!this.technicianName) return '?';
    const parts = this.technicianName.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    document.body.style.overflow = this.mobileSidebarOpen ? 'hidden' : '';
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen = false;
    document.body.style.overflow = '';
  }

  logout() {
    localStorage.removeItem('technician');
    localStorage.removeItem('technicianToken');
    this.router.navigate(['/technician/login']);
  }
}
