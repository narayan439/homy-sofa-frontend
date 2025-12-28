import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';
import { ServiceService, Service } from '../../core/services/service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-manage-bookings',
  templateUrl: './manage-bookings.component.html',
  styleUrls: ['./manage-bookings.component.css']
})
export class ManageBookingsComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = [
    'customer',
    'phone',
    'serviceDate',
    'service',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<Booking>();
  currentFilterStatus: Booking['status'] | '' = '';
  isLoading = true;
  searchQuery = '';
  isMobileView = false;

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
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());

    this.serviceService.services$.pipe(takeUntil(this.destroy$)).subscribe(services => {
      this.services = services || [];
      this.serviceMap = {};
      for (const svc of this.services) {
        if (svc.id) this.serviceMap[svc.id] = svc.name;
      }
    });
    
    this.serviceService.loadServices();
    
    this.bookingService.bookings$.pipe(takeUntil(this.destroy$)).subscribe(bookings => {
      this.dataSource.data = bookings;
      this.isLoading = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkMobileView());
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth < 768;
    if (this.isMobileView) {
      this.displayedColumns = ['customer', 'service', 'status', 'actions'];
    } else {
      this.displayedColumns = ['customer', 'phone', 'serviceDate', 'service', 'status', 'actions'];
    }
  }

  exportToExcel() {
    try {
      this.isLoading = true;
      
      // Get filtered or all data
      const exportData = this.dataSource.filteredData.length > 0 
        ? this.dataSource.filteredData 
        : this.dataSource.data;
      
      if (exportData.length === 0) {
        this.snackBar.open('No data to export', 'Close', { 
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        this.isLoading = false;
        return;
      }

      // Prepare data for Excel
      const excelData = exportData.map(booking => {
        const serviceName = this.getServiceName(booking.service);
        
        // Format date properly
        let formattedDate = 'N/A';
        if (booking.date) {
          const date = new Date(booking.date);
          formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }

        // Format booking time if exists
        let bookingTime = 'N/A';
        if (booking.timeSlot) {
          switch(booking.timeSlot) {
            case 'morning': bookingTime = '9 AM - 12 PM'; break;
            case 'afternoon': bookingTime = '12 PM - 4 PM'; break;
            case 'evening': bookingTime = '4 PM - 8 PM'; break;
            default: bookingTime = booking.timeSlot;
          }
        }

        // Calculate days until service
        let daysUntilService = 'N/A';
        if (booking.date) {
          const serviceDate = new Date(booking.date);
          const today = new Date();
          const diffTime = Math.abs(serviceDate.getTime() - today.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysUntilService = `${diffDays} days`;
        }

        return {
          'Booking ID': booking.id || 'N/A',
          'Customer Name': booking.name || 'N/A',
          'Email': booking.email || 'N/A',
          'Phone': booking.phone || 'N/A',
          'Service Type': serviceName,
          'Service Date': formattedDate,
          'Booking Time': bookingTime,
          'Status': booking.status || 'N/A',
          'Days Until Service': daysUntilService,
          'Booking Created': booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A',
          'Total Bookings by Customer': booking.totalBookings || 1
        };
      });

      // Create worksheet
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const wscols = [
        { wch: 15 }, // Booking ID
        { wch: 20 }, // Customer Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 20 }, // Service Type
        { wch: 15 }, // Service Date
        { wch: 15 }, // Booking Time
        { wch: 12 }, // Status
        { wch: 15 }, // Days Until Service
        { wch: 30 }, // Address
        { wch: 30 }, // Special Instructions
        { wch: 20 }, // Booking Created
        { wch: 10 }, // Total Bookings
      ];
      worksheet['!cols'] = wscols;

      // Create workbook
      const workbook: XLSX.WorkBook = { 
        Sheets: { 'Bookings': worksheet }, 
        SheetNames: ['Bookings'] 
      };

      // Generate Excel file
      const excelBuffer: any = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });

      // Save the file
      this.saveAsExcelFile(excelBuffer, 'HomY_Sofa_Bookings');

      this.isLoading = false;
      
      this.snackBar.open(`✅ Exported ${exportData.length} bookings to Excel`, 'Close', { 
        duration: 4000,
        panelClass: ['success-snackbar']
      });

    } catch (error) {
      console.error('Export error:', error);
      this.isLoading = false;
      this.snackBar.open('❌ Failed to export to Excel', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    try {
      // Create blob
      const data: Blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
      });
      
      // Create download link
      const link = document.createElement('a');
      
      // For modern browsers
      if (window.URL && window.URL.createObjectURL) {
        const url = window.URL.createObjectURL(data);
        link.href = url;
        link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        // Fallback for older browsers
        this.snackBar.open('Browser does not support file download', 'Close', { 
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  }

  // Export filtered data
  exportFilteredData() {
    const exportData = this.dataSource.filteredData.length > 0 
      ? this.dataSource.filteredData 
      : this.dataSource.data;
    
    if (exportData.length === 0) {
      this.snackBar.open('No filtered data to export', 'Close', { duration: 3000 });
      return;
    }

    this.exportDataToExcel(exportData, `HomY_Filtered_Bookings_${this.currentFilterStatus || 'All'}`);
  }

  // Export all data
  exportAllData() {
    if (this.dataSource.data.length === 0) {
      this.snackBar.open('No bookings to export', 'Close', { duration: 3000 });
      return;
    }

    this.exportDataToExcel(this.dataSource.data, 'HomY_All_Bookings');
  }

  private exportDataToExcel(data: any[], fileName: string) {
    this.isLoading = true;
    
    try {
      // Prepare data
      const excelData = data.map(booking => ({
        'Booking ID': booking.id || 'N/A',
        'Customer': booking.name || 'N/A',
        'Email': booking.email || 'N/A',
        'Phone': booking.phone || 'N/A',
        'Service': this.getServiceName(booking.service),
        'Date': booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A',
        'Status': booking.status || 'N/A',
        'Address': booking.address || 'N/A',
        'Notes': booking.details || 'N/A'
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

      // Generate and download
      XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      this.isLoading = false;
      this.snackBar.open(`✅ Exported ${data.length} bookings`, 'Close', { duration: 3000 });
    } catch (error) {
      this.isLoading = false;
      this.snackBar.open('❌ Export failed', 'Close', { duration: 3000 });
    }
  }

  getServiceName(serviceId: string): string {
    return this.serviceMap[serviceId] || serviceId || 'General Service';
  }

  applySearch() {
    this.dataSource.filterPredicate = (data: Booking, filter: string) => {
      const f = filter.trim().toLowerCase();
      return (
        (data.name || '').toLowerCase().includes(f) ||
        (data.phone || '').toLowerCase().includes(f) ||
        (data.email || '').toLowerCase().includes(f) ||
        (data.service || '').toLowerCase().includes(f) ||
        this.getServiceName(data.service).toLowerCase().includes(f)
      );
    };
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
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
        this.snackBar.open(`✅ Booking status changed to ${status}`, 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: () => {
        booking.status = oldStatus;
        this.snackBar.open('❌ Failed to update booking status', 'Close', { 
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

  getStatusIcon(status: string): string {
    switch(status) {
      case 'PENDING': return 'schedule';
      case 'APPROVED': return 'check_circle';
      case 'COMPLETED': return 'done_all';
      case 'CANCELLED': return 'cancel';
      default: return 'help';
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'PENDING': return '#f59e0b';
      case 'APPROVED': return '#10b981';
      case 'COMPLETED': return '#3b82f6';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  }

  refreshBookings() {
    this.isLoading = true;
    this.snackBar.open('🔄 Refreshing bookings...', 'Close', { duration: 2000 });
    this.bookingService.getAllBookings().subscribe({ 
      next: () => { 
        this.isLoading = false;
        this.snackBar.open('✅ Bookings refreshed', 'Close', { duration: 1500 }); 
      }, 
      error: () => { 
        this.isLoading = false;
        this.snackBar.open('❌ Failed to refresh bookings', 'Close', { 
          duration: 3000, 
          panelClass: ['error-snackbar'] 
        }); 
      } 
    });
  }



  clearFilters() {
    this.searchQuery = '';
    this.currentFilterStatus = '';
    this.dataSource.filter = '';
  }

  viewBookingDetails(booking: Booking) {
    this.snackBar.open(`Viewing details for ${booking.name}`, 'Close', { duration: 2000 });
  }

  editBooking(booking: Booking) {
    this.snackBar.open(`Edit booking for ${booking.name}`, 'Close', { duration: 2000 });
  }


  getServiceBadgeClass(serviceId: string): string {
  const serviceName = this.getServiceName(serviceId).toLowerCase();
  if (serviceName.includes('clean')) return 'cleaning-badge';
  if (serviceName.includes('repair')) return 'repair-badge';
  if (serviceName.includes('renovat')) return 'renovation-badge';
  if (serviceName.includes('stitch')) return 'stitching-badge';
  return 'cleaning-badge'; // default
}
}