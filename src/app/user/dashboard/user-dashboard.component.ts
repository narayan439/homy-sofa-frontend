import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../../core/services/booking.service';
import { UserAuthService } from '../../core/services/user-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CancelBookingDialogComponent } from '../cancel-booking-dialog/cancel-booking-dialog.component';

interface Technician {
  name: string;
  phone: string;
  rating?: number;
  photo?: string;
}

interface StatusUpdate {
  status: string;
  date: string;
  note?: string;
}

interface UserBooking {
  id: number;
  reference?: string;
  serviceName: string;
  bookingDate: string;
  serviceDate?: string;  // The actual scheduled service date
  serviceTime?: string;  // The scheduled service time
  status: string;
  totalAmount: number;
  technician?: Technician;
  technicianStatus?: string;  // ASSIGNED, IN_PROGRESS, COMPLETED
  technicianName?: string;
  technicianPhone?: string;
  paymentStatus?: string;  // Pending, Completed, Failed
  paymentMethod?: string;  // Cash, Online, Card
  statusHistory?: StatusUpdate[];
  customerId?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  address?: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  completionDate?: string;
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  bookings: UserBooking[] = [];
  filteredBookings: UserBooking[] = [];
  isLoading: boolean = false;
  userId: number = 0;
  userName: string = '';
  displayedColumns: string[] = ['reference', 'serviceName', 'serviceDate', 'technicianStatus', 'technicianInfo', 'totalAmount', 'actions'];
  
  // Status order for timeline
  statusOrder = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
  
  // Statistics
  totalBookings: number = 0;
  completedBookings: number = 0;
  pendingBookings: number = 0;
  totalAmountSpent: number = 0;
  
  // Filtering
  selectedStatus: string = 'All';
  statusOptions = ['All', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private userAuthService: UserAuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    if (this.userId > 0) {
      this.loadBookings();
    } else {
      setTimeout(() => {
        this.loadUserData();
        if (this.userId > 0) {
          this.loadBookings();
        } else {
          this.snackBar.open('❌ Failed to load user. Please login again.', 'Close', { duration: 5000 });
        }
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    let user = this.userAuthService.getCurrentUser();
    
    if (!user || !user.id) {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          user = JSON.parse(userDataStr);
        } catch (e) {
          console.error('Error parsing userData:', e);
        }
      }
    }
    
    if (!user || !user.id) {
      const userIdStr = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      if (userIdStr) {
        user = { id: parseInt(userIdStr, 10), name: userName || 'User' };
      }
    }
    
    if (user) {
      this.userId = user.id || 0;
      this.userName = user.name || 'User';
    } else {
      this.userId = 0;
      this.userName = 'User';
    }
  }

  loadBookings(): void {
    console.log('[UserDashboard] loadBookings() called');
    console.log('[UserDashboard] userId:', this.userId);
    
    if (!this.userId) {
      this.snackBar.open('❌ User not identified', 'Close', { duration: 3000 });
      console.error('[UserDashboard] userId is 0, cannot load bookings');
      return;
    }

    this.isLoading = true;
    console.log('[UserDashboard] Calling bookingService.getUserBookings with userId:', this.userId);
    
    this.bookingService.getUserBookings(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('[UserDashboard] getUserBookings response:', response);
          console.log('[UserDashboard] response type:', Array.isArray(response) ? 'array' : typeof response);
          
          const rawBookings = Array.isArray(response) ? response : [];
          console.log('[UserDashboard] rawBookings count:', rawBookings.length);
          
          const currentUser = this.userAuthService.getCurrentUser();
          this.bookings = rawBookings.map((b: any) => {
            console.log('[UserDashboard] Processing booking:', b);
            return {
              id: b.id,
              reference: b.reference || `HOMY${new Date().getFullYear()}${b.id}`,  // Use backend reference or fallback
              serviceName: b.service || b.serviceName || '',
              bookingDate: b.createdAt || b.date || b.bookingDate || new Date().toISOString(),
              serviceDate: b.date || b.scheduledDate || '',  // The scheduled service date (dd/mm/yyyy format)
              serviceTime: b.timeSlot || b.scheduledTime || '',
              status: b.status || 'PENDING',
              totalAmount: b.totalAmount || b.price || 0,
              technician: b.technician ? {
                name: b.technician.name,
                phone: b.technician.phone,
                rating: b.technician.rating || 4.5
              } : undefined,
              technicianStatus: b.technicianStatus || '',  // ASSIGNED, IN_PROGRESS, COMPLETED
              technicianName: b.technicianName || (b.technician?.name) || '',
              technicianPhone: b.technicianPhone || (b.technician?.phone) || '',
              paymentStatus: b.paymentStatus || 'PENDING',  // Add payment status
              paymentMethod: b.paymentMethod || 'CASH',  // Add payment method
              statusHistory: b.statusHistory || this.generateStatusHistory(b.status),
              scheduledDate: b.scheduledDate,
              scheduledTime: b.scheduledTime,
              address: b.address || (currentUser?.address || ''),
              notes: b.notes,
              customerId: b.customerId,
              // Add customer details from the logged-in user
              customerName: b.customerName || currentUser?.name || '',
              customerEmail: b.customerEmail || currentUser?.email || '',
              customerPhone: b.customerPhone || currentUser?.phone || '',
              completionDate: b.completionDate || b.completedAt || null
            };
          });
          
          console.log('[UserDashboard] Transformed bookings:', this.bookings);
          console.log('[UserDashboard] Total bookings to display:', this.bookings.length);
          
          if (this.bookings.length === 0) {
            console.warn('[UserDashboard] No bookings found for user');
          }
          
          // Calculate statistics
          this.updateStatistics();
          
          // Apply filter
          this.filterBookingsByStatus();
          
          this.isLoading = false;
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('[UserDashboard] Error loading bookings:', error);
          console.error('[UserDashboard] Error details:', error.error, error.status, error.message);
          const message = error.error?.message || 'Failed to load bookings';
          this.snackBar.open(`❌ ${message}`, 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Generate status history for demo purposes
   */
  private generateStatusHistory(currentStatus: string): StatusUpdate[] {
    const history: StatusUpdate[] = [];
    const statuses = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = statuses.indexOf(currentStatus);
    
    for (let i = 0; i <= currentIndex; i++) {
      history.push({
        status: statuses[i],
        date: new Date(Date.now() - (currentIndex - i) * 86400000).toISOString(),
        note: this.getStatusNote(statuses[i])
      });
    }
    
    return history;
  }

  private getStatusNote(status: string): string {
    const notes: {[key: string]: string} = {
      'PENDING': 'Booking request submitted',
      'CONFIRMED': 'Booking confirmed by admin',
      'ASSIGNED': 'Technician assigned to your booking',
      'IN_PROGRESS': 'Work in progress',
      'COMPLETED': 'Service completed successfully'
    };
    return notes[status] || '';
  }

  /**
   * Get progress percentage for timeline
   */
  getStatusProgress(status: string): number {
    const index = this.statusOrder.indexOf(status?.toUpperCase());
    return index >= 0 ? index + 1 : 1;
  }

  /**
   * Open cancel booking dialog
   */
  openCancelDialog(booking: UserBooking): void {
    if (!this.canCancelBooking(booking)) {
      this.snackBar.open('⚠️ Cannot cancel this booking', 'Close', { duration: 2000 });
      return;
    }

    const dialogRef = this.dialog.open(CancelBookingDialogComponent, {
      width: '400px',
      data: { booking }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result && result.confirmed) {
          this.performCancelBooking(booking.id, result.reason);
        }
      });
  }

  /**
   * Execute booking cancellation
   */
  private performCancelBooking(bookingId: number, reason: string): void {
    this.isLoading = true;
    this.bookingService.cancelBooking(bookingId, reason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.snackBar.open('✓ Booking cancelled successfully', 'Close', { duration: 2000 });
          this.loadBookings();
        },
        error: (error: any) => {
          this.isLoading = false;
          const message = error.error?.message || 'Failed to cancel booking';
          this.snackBar.open(`❌ ${message}`, 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Navigate to new booking page
   */
  goToNewBooking(): void {
    this.router.navigate(['/booking']);
  }

  /**
   * Navigate to tracking page
   */
  goToTracking(): void {
    this.router.navigate(['/tracking']);
  }

  /**
   * View booking details
   */
  viewBookingDetails(booking: UserBooking): void {
    // Navigate to tracking page with booking data pre-filled
    this.router.navigate(['/tracking'], { 
      state: { 
        bookingData: booking,
        reference: booking.reference,
        phone: this.userAuthService.getCurrentUser()?.phone || ''
      }
    });
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'schedule';
      case 'CONFIRMED': return 'done_all';
      case 'ASSIGNED': return 'person';
      case 'IN_PROGRESS': return 'build';
      case 'COMPLETED': return 'check_circle';
      case 'CANCELLED': return 'cancel';
      default: return 'info';
    }
  }

  /**
   * Get technician status icon
   */
  getTechStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ASSIGNED': return 'person_check';
      case 'IN_PROGRESS': return 'engineering';
      case 'COMPLETED': return 'done_circle';
      default: return 'hourglass_empty';
    }
  }

  getPaymentStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'pending_actions';
      case 'COMPLETED': return 'check_circle';
      case 'SUCCESS': return 'check_circle';
      case 'FAILED': return 'cancel';
      default: return 'info';
    }
  }

  /**
   * Call technician via phone link
   */
  callTechnician(phone: string): void {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  }

  /**
   * Check if booking can be cancelled
   */
  canCancelBooking(booking: UserBooking): boolean {
    const status = booking.status?.toUpperCase();
    return status !== 'COMPLETED' && status !== 'CANCELLED' && status !== 'IN_PROGRESS';
  }

  /**
   * Logout user
   */
  logout(): void {
    this.userAuthService.logout();
    this.snackBar.open('✓ Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate(['/login']);
  }

  /**
   * Calculate dashboard statistics
   */
  updateStatistics(): void {
    this.totalBookings = this.bookings.length;
    this.completedBookings = this.bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED').length;
    this.pendingBookings = this.bookings.filter(b => b.status?.toUpperCase() === 'PENDING').length;
    this.totalAmountSpent = this.bookings
      .filter(b => b.status?.toUpperCase() === 'COMPLETED')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }

  /**
   * Filter bookings by selected status
   */
  filterBookingsByStatus(): void {
    if (this.selectedStatus === 'All') {
      this.filteredBookings = [...this.bookings];
    } else {
      this.filteredBookings = this.bookings.filter(b => 
        b.status?.toUpperCase() === this.selectedStatus.toUpperCase()
      );
    }
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.filterBookingsByStatus();
  }

  /**
   * Get count of bookings for a specific status
   */
  getBookingCountByStatus(status: string): number {
    if (status === 'All') {
      return this.bookings.length;
    }
    return this.bookings.filter(b => b.status?.toUpperCase() === status.toUpperCase()).length;
  }

  /**
   * Book this service again (for completed bookings)
   */
  bookAgain(booking: UserBooking): void {
    if (booking.status?.toUpperCase() === 'COMPLETED') {
      // Navigate to booking page with service info pre-filled
      this.router.navigate(['/booking'], {
        state: {
          prefilledService: booking.serviceName,
          serviceId: booking.id
        }
      });
    }
  }

  /**
   * Open rate & review dialog
   */
  openRateDialog(booking: UserBooking): void {
    if (booking.status?.toUpperCase() !== 'COMPLETED') {
      this.snackBar.open('⚠️ Service must be completed to rate', 'Close', { duration: 2000 });
      return;
    }
    
    // For now, just show a snackbar. Dialog will be implemented in next step
    this.snackBar.open('📝 Rate & Review feature coming soon!', 'Close', { duration: 2000 });
  }

  /**
   * Open reschedule dialog
   */
  openRescheduleDialog(booking: UserBooking): void {
    const status = booking.status?.toUpperCase();
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      this.snackBar.open('⚠️ Cannot reschedule this booking', 'Close', { duration: 2000 });
      return;
    }
    
    // For now, just show a snackbar. Dialog will be implemented in next step
    this.snackBar.open('📅 Reschedule feature coming soon!', 'Close', { duration: 2000 });
  }
}