import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';
import { ServiceService, Service } from '../../core/services/service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-bookings',
  templateUrl: './manage-bookings.component.html',
  styleUrls: ['./manage-bookings.component.css']
})
export class ManageBookingsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'customer',
    'phone',
    'serviceDate',
    'service',
    'status'
  ];

  dataSource = new MatTableDataSource<Booking>();
  currentFilterStatus: Booking['status'] | '' = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  serviceMap: { [id: string]: string } = {};
  services: Service[] = [];

  constructor(
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
    this.serviceService.services$.subscribe(services => {
      this.services = services || [];
      this.serviceMap = {};
      for (const svc of this.services) {
        if (svc.id) this.serviceMap[svc.id] = svc.name;
      }
    });
    this.serviceService.loadServices();
    this.bookingService.bookings$.subscribe(bookings => {
      this.dataSource.data = bookings;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getServiceName(serviceId: string): string {
    return this.serviceMap[serviceId] || serviceId || 'General Service';
  }

  applySearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data: Booking, filter: string) => {
      const f = filter.trim().toLowerCase();
      return (
        (data.name || '').toLowerCase().includes(f) ||
        (data.phone || '').toLowerCase().includes(f) ||
        (data.email || '').toLowerCase().includes(f) ||
        (data.service || '').toLowerCase().includes(f)
      );
    };
    this.dataSource.filter = value.trim().toLowerCase();
  }

  filterByStatus(status: Booking['status'] | '') {
    this.currentFilterStatus = status;
    
    if (!status) {
      this.dataSource.filter = '';
      return;
    }
    
    this.dataSource.filterPredicate = (data: Booking, filter: string) =>
      data.status === filter;
    
    this.dataSource.filter = status;
  }

  updateStatus(booking: Booking, status: Booking['status']) {
    const oldStatus = booking.status;
    booking.status = status;
    
    if (!booking.id) return;

    this.bookingService.updateBookingStatus(booking.id, status).subscribe({
      next: () => {
        this.snackBar.open(`Booking status changed to ${status}`, 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: () => {
        booking.status = oldStatus;
        this.snackBar.open('Failed to update booking status', 'Close', { 
          duration: 3000, 
          panelClass: ['error-snackbar'] 
        });
      }
    });
  }

  getBookingCountByStatus(status: Booking['status'] | ''): number {
    if (!status) return this.dataSource.data.length;
    return this.dataSource.data.filter(b => b.status === status).length;
  }

  getInitials(fullName: string): string {
    try {
      const str = String(fullName || '');
      const parts = str.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return '?';
      return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
    } catch (e) {
      return '?';
    }
  }

  getServiceTypeClass(serviceType: string): string {
    const typeMap: {[key: string]: string} = {
      'cleaning': 'approved',
      'repair': 'pending',
      'renovation': 'completed',
      'stitching': 'pending',
      'sofa cleaning': 'approved',
      'sofa repair': 'pending',
      'sofa renovation': 'completed',
      'sofa stitching': 'pending'
    };
    const key = (serviceType || '').toLowerCase();
    return typeMap[key] || 'pending';
  }

  exportToExcel() {
    this.snackBar.open('Export feature coming soon!', 'Close', { duration: 3000 });
  }

  refreshBookings() {
    this.snackBar.open('Refreshing bookings...', 'Close', { duration: 2000 });
    this.bookingService.getAllBookings().subscribe({ 
      next: () => { 
        this.snackBar.open('Bookings refreshed', 'Close', { duration: 1500 }); 
      }, 
      error: () => { 
        this.snackBar.open('Failed to refresh bookings', 'Close', { 
          duration: 3000, 
          panelClass: ['error-snackbar'] 
        }); 
      } 
    });
  }
}