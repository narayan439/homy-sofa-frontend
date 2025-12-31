import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';
import { ServiceService, Service } from '../../core/services/service.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {

  dashboardStats = {
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,  // Added cancelled bookings
    totalCustomers: 0,
    todaysBookings: 0,
    monthlyRevenue: 0
  };

  
  recentBookings: Booking[] = [];
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
    const cancelled = bookings.filter(b => String(b.status).toUpperCase() === 'CANCELLED').length; // Count cancelled
    
    // Count unique customers
    const uniqueCustomers = new Set(bookings.map(b => b.customerId || b.email || b.phone)).size;
    
    // Today's bookings
    const todays = bookings.filter(b => {
      try {
        const bookingDate = this.normalizeDate((b as any).date);
        if (!bookingDate) return false;
        const today = new Date();
        return bookingDate.toDateString() === today.toDateString();
      } catch { 
        return false; 
      }
    }).length;

    // Calculate monthly revenue ONLY from COMPLETED bookings in current month
    const now = new Date();
    const monthlyRevenue = bookings.reduce((sum, b) => {
      if (String(b.status).toUpperCase() !== 'COMPLETED') return sum; // Only count completed bookings
      
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
      cancelledBookings: cancelled, // Add cancelled count
      totalCustomers: uniqueCustomers,
      todaysBookings: todays,
      monthlyRevenue: monthlyRevenue
    };
  }

  updateRecentBookings(bookings: Booking[]) {
    // Normalize booking dates into Date objects, then sort by date desc and take latest 5
    const normalizeDate = (d: any): Date | null => {
      if (!d) return null;
      if (d instanceof Date) return d;
      if (typeof d === 'number') return new Date(d);
      if (typeof d === 'string') {
        // Try ISO first
        const iso = new Date(d);
        if (!isNaN(iso.getTime())) return iso;
        // Try dd/MM/yyyy or d/M/yyyy
        const parts = d.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const parsed = new Date(year, month, day);
          if (!isNaN(parsed.getTime())) return parsed;
        }
      }
      return null;
    };

    try {
      const mapped = bookings.map(b => ({ 
        ...b, 
        date: normalizeDate((b as any).date) 
      }));
      
      const sorted = mapped.slice().sort((a, b) => {
        const dateA = a.date ? (a.date as Date).getTime() : 0;
        const dateB = b.date ? (b.date as Date).getTime() : 0;
        return dateB - dateA;
      });
      
      this.recentBookings = sorted.slice(0, 5) as unknown as Booking[];
    } catch (e) {
      this.recentBookings = bookings.slice(0, 5);
    }
  }

  normalizeDate(d: any): Date | null {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d === 'number') return new Date(d);
    if (typeof d === 'string') {
      const iso = new Date(d);
      if (!isNaN(iso.getTime())) return iso;
      
      // Try dd/MM/yyyy format
      const parts = d.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsed = new Date(year, month, day);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      
      // Try other formats
      const parsedDate = Date.parse(d);
      if (!isNaN(parsedDate)) return new Date(parsedDate);
    }
    return null;
  }

  // Helper used by template to get service display name
  getServiceName(serviceIdOrName?: string): string {
    if (!serviceIdOrName) return 'General Service';
    const svc = this.serviceMap[serviceIdOrName];
    if (svc && svc.name) return svc.name;
    return serviceIdOrName;
  }

  // Helper to get displayed price for a booking (prefer booking.price, else service price)
  getBookingPrice(b: Booking): number {
    if ((b as any).price != null) return (b as any).price;
    const svc = this.serviceMap[b.service || ''];
    if (svc && svc.price != null) return svc.price as number;
    return (b as any).totalAmount ?? 0;
  }

  getStatusClass(status: string): string {
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

  getServiceTypeClass(serviceType: string): string {
    if (!serviceType) return 'service-general';
    const typeLower = serviceType.toLowerCase();
    if (typeLower.includes('clean')) return 'service-cleaning';
    if (typeLower.includes('repair')) return 'service-repair';
    if (typeLower.includes('reno')) return 'service-renovation';
    if (typeLower.includes('stitch')) return 'service-stitching';
    return 'service-general';
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
}