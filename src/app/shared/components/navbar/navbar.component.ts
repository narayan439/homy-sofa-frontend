import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserAuthService } from '../../../core/services/user-auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  mobileSidebarOpen = false;
  isScrolled = false;
  isUserLoggedIn = false;
  currentUserName: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userAuthService: UserAuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialize current login state
    this.isUserLoggedIn = this.userAuthService.isUserLoggedIn();
    if (this.isUserLoggedIn) {
      const user = this.userAuthService.getCurrentUser();
      this.currentUserName = user?.name || 'User';
    }

    // Subscribe to login status changes
    this.userAuthService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        this.isUserLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          const user = this.userAuthService.getCurrentUser();
          this.currentUserName = user?.name || 'User';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  openCheckStatus() {
    // Navigate to the check booking status page
    this.router.navigate(['/booking']);
  }

  /**
   * Navigate to signup page
   */
  goToSignup(): void {
    this.router.navigate(['/signup']);
    this.closeMobileSidebar();
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMobileSidebar();
  }

  /**
   * Navigate to user dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
    this.closeMobileSidebar();
  }

  /**
   * Navigate to edit profile
   */
  goToEditProfile(): void {
    this.router.navigate(['/edit-profile']);
    this.closeMobileSidebar();
  }

  /**
   * Logout user
   */
  logout(): void {
    this.userAuthService.logout();
    this.snackBar.open('✓ Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate(['/login']);
    this.closeMobileSidebar();
  }

  /**
   * Try to book - check if logged in
   */
  goToBooking(): void {
    if (!this.isUserLoggedIn) {
      this.snackBar.open('⚠️ Please sign in to book a service', 'Sign In', { duration: 4000 })
        .onAction()
        .subscribe(() => {
          this.goToLogin();
        });
      return;
    }
    this.router.navigate(['/booking']);
    this.closeMobileSidebar();
  }

}