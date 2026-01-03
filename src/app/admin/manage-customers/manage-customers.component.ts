import { Component, OnInit } from '@angular/core';
import { CustomerService, Customer } from '../../core/services/customer.service';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-manage-customers',
  templateUrl: './manage-customers.component.html',
  styleUrls: ['./manage-customers.component.css']
})
export class ManageCustomersComponent implements OnInit {

  displayedColumns: string[] = ['name', 'phone', 'email', 'totalServices', 'actions'];
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  showDetailsDialog = false;
  selectedCustomerBookings: Booking[] = [];

  constructor(private customerService: CustomerService, private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (data) => this.customers = data || [],
      error: (err) => {
        console.error('Failed to load customers', err);
        this.customers = [];
      }
    });
  }

  getTotalServices(): number {
    return this.customers.reduce((total, customer) => total + (customer.totalServices || 0), 0);
  }

  viewCustomerDetails(customer: Customer) {
    this.selectedCustomer = customer;
    this.showDetailsDialog = true;
    // Fetch booking/service history for this customer by email
    this.selectedCustomerBookings = [];
    if (customer && customer.email) {
      this.bookingService.getBookingsByCustomer(customer.email).subscribe({
        next: (list) => {
          this.selectedCustomerBookings = (list || []).map(b => {
            // normalize date: if dd/MM/yyyy convert to ISO for consistent display
            if (b && typeof b.date === 'string' && b.date.includes('/')) {
              const parts = b.date.split('/').map(p => p.trim());
              if (parts.length === 3) {
                const day = Number(parts[0]);
                const month = Number(parts[1]) - 1;
                const year = Number(parts[2]);
                const d = new Date(year, month, day);
                if (!isNaN(d.getTime())) b.date = d.toISOString();
              }
            }
            return b;
          });
        },
        error: (err) => {
          console.error('Failed to load customer bookings', err);
          this.selectedCustomerBookings = [];
        }
      });
    }
  }

  closeDetailsDialog() {
    this.showDetailsDialog = false;
    this.selectedCustomer = null;
    this.selectedCustomerBookings = [];
  }

  formatBookingDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
      // If ISO string
      if (dateStr.includes('T')) {
        return new Date(dateStr).toLocaleDateString();
      }
      // If dd/MM/yyyy
      if (dateStr.includes('/')) return dateStr;
      // Fallback parse
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  getCompletedServicesCount(): number {
    if (this.selectedCustomerBookings && this.selectedCustomerBookings.length > 0) {
      return this.selectedCustomerBookings.filter(b => (b.status || '').toString().toUpperCase() === 'COMPLETED').length;
    }
    // fallback to customer data if available
    if (this.selectedCustomer && (this.selectedCustomer as any).completedCount) {
      return (this.selectedCustomer as any).completedCount || 0;
    }
    return 0;
  }

    // Parse additional services JSON and return array
    parseAdditionalServices(jsonString: string): Array<{ id: string; name: string; price: number }> {
      try {
        if (!jsonString) return [];
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse additional services JSON', e);
        return [];
      }
    }
  }