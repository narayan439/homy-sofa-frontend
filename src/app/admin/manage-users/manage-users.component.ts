import { Component, OnInit } from '@angular/core';
import { UserAdminService, AdminUser } from '../../core/services/user-admin.service';
import { BookingService } from '../../core/services/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  displayedColumns: string[] = ['name', 'email', 'phone', 'status', 'createdAt', 'actions'];
  users: AdminUser[] = [];
  selectedUser: AdminUser | null = null;
  showDetailsDialog = false;
  selectedUserBookings: Booking[] = [];
  isLoading = false;
  isLoadingBookings = false;
  searchTerm = '';

  constructor(
    private userAdminService: UserAdminService,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load all users from backend
   */
  loadUsers(): void {
    this.isLoading = true;
    this.userAdminService.getAllUsers().subscribe({
      next: (response: any) => {
        // Backend returns { success, data: [...] }
        this.users = response?.data || response || [];
        this.isLoading = false;
        this.snackBar.open('Users loaded successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.isLoading = false;
        const message = err?.error?.message || 'Failed to load users';
        this.snackBar.open(`❌ ${message}`, 'Close', { duration: 3000 });
        console.error('Error loading users:', err);
        this.users = [];
      }
    });
  }

  /**
   * Get filtered users based on search term
   */
  get filteredUsers(): AdminUser[] {
    if (!this.searchTerm) {
      return this.users;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term)
    );
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  /**
   * Get inactive users count
   */
  getInactiveUsersCount(): number {
    return this.users.filter(u => !u.isActive).length;
  }

  /**
   * View user details and their bookings
   */
  viewUserDetails(user: AdminUser): void {
    this.selectedUser = user;
    this.showDetailsDialog = true;
    this.selectedUserBookings = [];
    this.isLoadingBookings = true;

    // Fetch bookings for this user
    if (user.id) {
      console.log('Fetching bookings for user:', user.id);
      this.bookingService.getUserBookings(user.id)
        .subscribe({
          next: (response: any) => {
            console.log('Bookings response:', response);
            
            // Handle both array and wrapped response formats
            if (Array.isArray(response)) {
              this.selectedUserBookings = response;
            } else if (response?.data && Array.isArray(response.data)) {
              this.selectedUserBookings = response.data;
            } else if (response?.bookings && Array.isArray(response.bookings)) {
              this.selectedUserBookings = response.bookings;
            } else {
              this.selectedUserBookings = [];
            }
            
            if (this.selectedUserBookings.length === 0) {
              console.warn('No bookings found for user:', user.id);
            } else {
              console.log('Loaded', this.selectedUserBookings.length, 'bookings');
            }
            this.isLoadingBookings = false;
          },
          error: (err) => {
            console.error('Error fetching user bookings:', err);
            this.selectedUserBookings = [];
            this.isLoadingBookings = false;
            const message = err?.error?.message || err?.message || 'Failed to load bookings';
            this.snackBar.open(`❌ ${message}`, 'Close', { duration: 3000 });
          }
        });
    }
  }

  /**
   * Close details dialog
   */
  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedUser = null;
    this.selectedUserBookings = [];
  }

  /**
   * Deactivate a user
   */
  deactivateUser(user: AdminUser): void {
    if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
      this.userAdminService.deactivateUser(user.id).subscribe({
        next: (response) => {
          user.isActive = false;
          this.snackBar.open('User deactivated successfully', 'Close', { duration: 2000 });
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to deactivate user';
          this.snackBar.open(`❌ ${message}`, 'Close', { duration: 3000 });
          console.error('Error deactivating user:', err);
        }
      });
    }
  }

  /**
   * Activate a user
   */
  activateUser(user: AdminUser): void {
    if (confirm(`Are you sure you want to activate ${user.name}?`)) {
      this.userAdminService.activateUser(user.id).subscribe({
        next: (response) => {
          user.isActive = true;
          this.snackBar.open('User activated successfully', 'Close', { duration: 2000 });
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to activate user';
          this.snackBar.open(`❌ ${message}`, 'Close', { duration: 3000 });
          console.error('Error activating user:', err);
        }
      });
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return dateStr || 'N/A';
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  /**
   * Get status label
   */
  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
