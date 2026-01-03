import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';
import { ServiceService, Service } from '../../core/services/service.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {

  dashboardStats = {
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalCustomers: 0,
    todaysBookings: 0,
    monthlyRevenue: 0
  };

  recentBookings: Booking[] = [];
  recentBookingsDataSource = new MatTableDataSource<Booking>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private serviceMap: { [id: string]: Service } = {};

  constructor(
    private bookingService: BookingService, 
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
    // Build service map for name/price lookups
    this.serviceService.services$.subscribe(list => {
      (list || []).forEach(s => { 
        if (s && s.id) this.serviceMap[s.id] = s; 
      });
    });
    
    this.serviceService.loadServices();
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    this.recentBookingsDataSource.paginator = this.paginator;
  }

  loadDashboardData() {
    this.bookingService.bookings$.subscribe((bookings: Booking[]) => {
      this.calculateDashboardStats(bookings);
      this.updateRecentBookings(bookings);
    });
  }

  calculateDashboardStats(bookings: Booking[]) {
    const total = bookings.length;
    const pending = bookings.filter(b => String(b.status).toUpperCase() === 'PENDING').length;
    const confirmed = bookings.filter(b => {
      const s = String(b.status).toUpperCase();
      return s === 'CONFIRMED' || s === 'APPROVED';
    }).length;
    const completed = bookings.filter(b => String(b.status).toUpperCase() === 'COMPLETED').length;
    const cancelled = bookings.filter(b => String(b.status).toUpperCase() === 'CANCELLED').length;
    
    // Count unique customers
    const uniqueCustomers = new Set(bookings.map(b => b.customerId || b.email || b.phone)).size;
    
    // Today's bookings (based on booking date, not creation date)
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-GB'); // Format: dd/mm/yyyy
    
    const todays = bookings.filter(b => {
      try {
        const bookingDate = this.normalizeDate((b as any).date);
        if (!bookingDate) return false;
        const bookingDateStr = bookingDate.toLocaleDateString('en-GB');
        return bookingDateStr === todayStr;
      } catch { 
        return false; 
      }
    }).length;

    // Calculate monthly revenue ONLY from COMPLETED bookings in current month
    const now = new Date();
    const monthlyRevenue = bookings.reduce((sum, b) => {
      if (String(b.status).toUpperCase() !== 'COMPLETED') return sum;
      
      try {
        const bookingDate = this.normalizeDate((b as any).date);
        if (!bookingDate) return sum;
        
        // Check if booking is in current month
        if (
          bookingDate.getFullYear() === now.getFullYear() && 
          bookingDate.getMonth() === now.getMonth()
        ) {
          const amount = (b as any).price ?? (b as any).totalAmount ?? 0;
          return sum + (Number(amount) || 0);
        }
      } catch (e) {
        console.error('Error processing booking revenue:', e);
      }
      return sum;
    }, 0);

    this.dashboardStats = {
      totalBookings: total,
      pendingBookings: pending,
      confirmedBookings: confirmed,
      completedBookings: completed,
      cancelledBookings: cancelled,
      totalCustomers: uniqueCustomers,
      todaysBookings: todays,
      monthlyRevenue: monthlyRevenue
    };
  }

  updateRecentBookings(bookings: Booking[]) {
    try {
      // Simple solution: Sort by reference number alphabetically descending
      // Since HOMY202650 > HOMY202649 > HOMY202648, etc.
      const sorted = [...bookings].sort((a, b) => {
        const refA = a.reference || '';
        const refB = b.reference || '';
        return refB.localeCompare(refA);
      });
      
      // Take only the 5 most recent bookings but use MatTableDataSource for pagination
      this.recentBookings = sorted.slice(0, 100); // Store more for pagination
      this.recentBookingsDataSource.data = this.recentBookings;
      
      console.log('Recent bookings (newest first):', this.recentBookings.map(b => ({ reference: b.reference, totalAmount: (b as any).totalAmount, price: (b as any).price, message: (b as any).message })));
      
    } catch (e) {
      console.error('Error updating recent bookings:', e);
      this.recentBookings = bookings.slice(0, 5);
      this.recentBookingsDataSource.data = this.recentBookings;
    }
  }

  normalizeDate(d: any): Date | null {
    if (!d) return null;
    
    // If it's already a Date object
    if (d instanceof Date) return d;
    
    // If it's a timestamp
    if (typeof d === 'number') return new Date(d);
    
    // If it's a string
    if (typeof d === 'string') {
      // Try ISO format first
      const isoDate = new Date(d);
      if (!isNaN(isoDate.getTime())) return isoDate;
      
      // Try dd/MM/yyyy format (common in Indian systems)
      const ddMMyyyyMatch = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddMMyyyyMatch) {
        const day = parseInt(ddMMyyyyMatch[1], 10);
        const month = parseInt(ddMMyyyyMatch[2], 10) - 1; // Month is 0-indexed
        const year = parseInt(ddMMyyyyMatch[3], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
      
      // Try yyyy-MM-dd format
      const yyyyMMddMatch = d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (yyyyMMddMatch) {
        const year = parseInt(yyyyMMddMatch[1], 10);
        const month = parseInt(yyyyMMddMatch[2], 10) - 1;
        const day = parseInt(yyyyMMddMatch[3], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
      
      // Try any other parseable date format
      const parsedDate = Date.parse(d);
      if (!isNaN(parsedDate)) return new Date(parsedDate);
    }
    
    return null;
  }

  // Helper used by template to get service display name
  getServiceName(serviceIdOrName?: string): string {
    if (!serviceIdOrName) return 'General Service';
    
    // Check if it's a service ID in the map
    const svc = this.serviceMap[serviceIdOrName];
    if (svc && svc.name) return svc.name;
    
    // If it's already a name, return it
    if (typeof serviceIdOrName === 'string' && serviceIdOrName.length > 0) {
      return serviceIdOrName;
    }
    
    return 'General Service';
  }

  // Helper to get displayed price for a booking
  getBookingPrice(b: Booking): number {
    // ALWAYS display totalAmount (from total_amount DB column)
    // Only fall back to message extraction if totalAmount is not set
    const total = (b as any).totalAmount;
    if (total != null && !isNaN(Number(total))) return Number(total);

    // Try to extract amount from legacy message field if totalAmount is missing
    const msg = (b as any).message || '';
    if (msg) {
      const matches = String(msg).match(/[0-9,.]+/g);
      if (matches && matches.length > 0) {
        const candidate = matches.reduce((a: string, c: string) => a.length >= c.length ? a : c);
        const cleaned = candidate.replace(/[^0-9.\-]/g, '');
        if (cleaned !== '') {
          const parsed = Number(cleaned);
          if (!isNaN(parsed)) return parsed;
        }
      }
    }

    // Default: return 0 (do NOT use price or service price)
    return 0;
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-pending';
    
    const statusLower = status.toLowerCase();
    switch(statusLower) {
      case 'pending': return 'status-pending';
      case 'confirmed':
      case 'approved': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getAmountColorClass(booking: Booking): string {
    const status = String(booking.status || '').toUpperCase();
    
    if (status === 'COMPLETED') {
      return 'amount-completed';
    }
    
    if (status === 'CONFIRMED' || status === 'APPROVED') {
      return 'amount-approved';
    }
    
    if (status === 'PENDING') {
      return 'amount-pending';
    }
    
    if (status === 'CANCELLED') {
      return 'amount-cancelled';
    }
    
    return 'amount-default';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
  }

  // Refresh recent bookings from backend
  refreshRecent() {
    this.bookingService.getAllBookings().subscribe({ 
      next: () => {
        console.log('Bookings refreshed successfully');
      }, 
      error: (err) => console.error('Refresh bookings failed', err) 
    });
  }

  // New method to get display date for booking
  getDisplayDate(booking: Booking): string {
    const dateField = (booking as any).date || (booking as any).bookingDate || (booking as any).createdAt;
    const date = this.normalizeDate(dateField);
    
    if (!date) return 'N/A';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise return formatted date
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }
}