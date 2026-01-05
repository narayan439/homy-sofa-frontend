import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../models/booking.model';
import { ServiceService, Service } from '../../core/services/service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExcelExportService } from '../../core/services/excel-export.service';

@Component({
  selector: 'app-manage-bookings',
  templateUrl: './manage-bookings.component.html',
  styleUrls: ['./manage-bookings.component.css']
})
export class ManageBookingsComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = [
    'customer',
    'reference',
    'bookingCreated',
    'serviceDate',
    'service',
    'additionalServices',
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
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private excelExportService: ExcelExportService
  ) {}

  ngOnInit() {
    this.checkMobileView();

    this.serviceService.services$.pipe(takeUntil(this.destroy$)).subscribe(services => {
      this.services = services || [];
      this.serviceMap = {};
      for (const svc of this.services) {
        if (svc.id) this.serviceMap[svc.id] = svc.name;
      }
    });
    
    this.serviceService.loadServices();
    
    this.bookingService.bookings$.pipe(takeUntil(this.destroy$)).subscribe(bookings => {
      const incoming: Booking[] = (bookings || []).map(b => ({ ...(b || {}), status: b?.status || '' } as Booking));
      // Sort bookings by reference number (highest first)
      const sortedBookings = this.sortBookingsByReference(incoming);
      this.dataSource.data = sortedBookings;
      this.isLoading = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sorting for reference number
    if (this.dataSource.sort) {
      this.dataSource.sortingDataAccessor = (booking: Booking, sortHeaderId: string) => {
        if (sortHeaderId === 'reference') {
          // Extract numeric part from reference for proper sorting
          const ref = booking.reference || '';
          const match = ref.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        }
        if (sortHeaderId === 'serviceDate') {
          return booking.date ? new Date(booking.date).getTime() : 0;
        }
        return (booking as any)[sortHeaderId];
      };
      
      // Set default sort to show newest bookings first (reference descending)
      this.sort.sort({ 
        id: 'reference', 
        start: 'desc', 
        disableClear: false 
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Sort bookings by reference number (highest first)
  private sortBookingsByReference(bookings?: Booking[]): Booking[] {
    const list = bookings || [];
    return [...list].sort((a, b) => {
      const getRefNumber = (ref: string | undefined): number => {
        if (!ref) return 0;
        const match = ref.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      
      const refA = getRefNumber(a.reference);
      const refB = getRefNumber(b.reference);
      return refB - refA; // Descending order (newest first)
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobileView();
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth < 768;
  }

  // Parse address into parts
  getAddressPart(address: string, part: string): string {
    if (!address) return 'N/A';
    
    // Try to parse structured address
    const addressLower = address.toLowerCase();
    
    // Common patterns
    const patterns: { [key: string]: RegExp } = {
      house: /house\s*(no\.?|number)?\s*[:#]?\s*([^,.\n]+)/i,
      area: /(?:area|locality|sector)\s*[:]?\s*([^,.\n]+)/i,
      city: /(?:city|town)\s*[:]?\s*([^,.\n]+)/i,
      pincode: /(?:pincode|pin\s*code|zip\s*code)\s*[:#]?\s*(\d{6})/i,
      landmark: /(?:near|landmark|opposite|beside)\s*[:]?\s*([^,.\n]+)/i
    };
    
    if (patterns[part]) {
      const match = address.match(patterns[part]);
      if (match && match[2]) return match[2].trim();
      if (match && match[1]) return match[1].trim();
    }
    
    // Fallback: Try to extract from comma-separated address
    const parts = address.split(',').map(p => p.trim());
    
    switch(part) {
      case 'house':
        // First part usually contains house number
        return parts[0] || 'N/A';
      case 'area':
        // Second part might be area
        return parts.length > 1 ? parts[1] : 'N/A';
      case 'city':
        // Look for city name patterns
        for (const part of parts) {
          if (part.toLowerCase().includes('city') || 
              part.toLowerCase().includes('town') ||
              /^\d{6}$/.test(part) === false) {
            return part.replace(/city|town/gi, '').trim() || 'N/A';
          }
        }
        return parts.length > 2 ? parts[2] : 'N/A';
      case 'pincode':
        // Look for 6-digit pincode
        const pincodeMatch = address.match(/\b\d{6}\b/);
        return pincodeMatch ? pincodeMatch[0] : 'N/A';
      case 'landmark':
        // Look for near/landmark keywords
        for (const part of parts) {
          if (part.toLowerCase().includes('near') || 
              part.toLowerCase().includes('opposite') ||
              part.toLowerCase().includes('beside') ||
              part.toLowerCase().includes('landmark')) {
            return part.replace(/near|opposite|beside|landmark/gi, '').trim() || 'N/A';
          }
        }
        return parts.length > 3 ? parts[3] : 'N/A';
      default:
        return 'N/A';
    }
  }

  // Open Google Maps with given latLong
  openMap(latLong: string) {
    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latLong)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Failed to open map', e);
      this.snackBar.open('Failed to open Google Maps', 'Close', { duration: 3000 });
    }
  }

  // Copy reference to clipboard
  copyReference(reference: string) {
    if (!reference || reference === 'N/A') return;
    
    navigator.clipboard.writeText(reference).then(() => {
      this.snackBar.open('Reference copied to clipboard!', 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    }).catch(() => {
      this.snackBar.open('Failed to copy reference', 'Close', {
        duration: 2000,
        panelClass: ['error-snackbar']
      });
    });
  }

  // Calculate days until service
  getDaysUntilService(dateString: any): string {
    if (!dateString) return 'N/A';
    
    try {
      const serviceDate = new Date(dateString);
      const today = new Date();
      
      // Reset time portions for accurate day calculation
      serviceDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = serviceDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
      return `In ${diffDays} days`;
    } catch {
      return 'N/A';
    }
  }

  // Enhanced service badge with icons
  getServiceBadgeWithIcon(serviceId: string): { name: string, icon: string, class: string } {
    const serviceName = this.getServiceName(serviceId).toLowerCase();
    
    if (serviceName.includes('clean')) {
      return { 
        name: 'Cleaning', 
        icon: 'cleaning_services', 
        class: 'cleaning-badge' 
      };
    }
    if (serviceName.includes('repair')) {
      return { 
        name: 'Repair', 
        icon: 'handyman', 
        class: 'repair-badge' 
      };
    }
    if (serviceName.includes('renovat')) {
      return { 
        name: 'Renovation', 
        icon: 'home_repair_service', 
        class: 'renovation-badge' 
      };
    }
    if (serviceName.includes('stitch')) {
      return { 
        name: 'Stitching', 
        icon: 'content_cut', 
        class: 'stitching-badge' 
      };
    }
    
    return { 
      name: serviceName || 'Service', 
      icon: 'miscellaneous_services', 
      class: 'cleaning-badge' 
    };
  }

  // Rest of your existing methods remain the same...
  getServiceName(serviceId: string): string {
    return this.serviceMap[serviceId] || serviceId || 'General Service';
  }

  getServiceBadgeClass(serviceId: string): string {
    const serviceName = this.getServiceName(serviceId).toLowerCase();
    if (serviceName.includes('clean')) return 'cleaning-badge';
    if (serviceName.includes('repair')) return 'repair-badge';
    if (serviceName.includes('renovat')) return 'renovation-badge';
    if (serviceName.includes('stitch')) return 'stitching-badge';
    return 'cleaning-badge';
  }

  applySearch() {
    this.dataSource.filterPredicate = (data: Booking, filter: string) => {
      const f = filter.trim().toLowerCase();
      const addr = (() => {
        if (!data.address) return '';
        if (typeof data.address === 'string') return data.address;
        try { return JSON.stringify(data.address); } catch { return ''; }
      })();

      return (
        String(data.name || '').toLowerCase().includes(f) ||
        String(data.phone || '').toLowerCase().includes(f) ||
        String(data.email || '').toLowerCase().includes(f) ||
        String(data.reference || '').toLowerCase().includes(f) ||
        String(addr || '').toLowerCase().includes(f)
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

  // Parse additional services JSON and return array
  parseAdditionalServices(jsonString?: string): Array<{ id: string; name: string; price: number }> {
    try {
      if (!jsonString) return [];
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse additional services JSON', e);
      return [];
    }
  }

  isStatusLocked(status: Booking['status']): boolean {
    const s = String(status).toUpperCase();
    return s === 'COMPLETED' || s === 'CANCELLED';
  }

  getStatusLockReason(status: Booking['status']): string {
    const s = String(status).toUpperCase();
    if (s === 'COMPLETED') return 'Booking is completed - cannot change status';
    if (s === 'CANCELLED') return 'Booking is cancelled - cannot change status';
    return '';
  }

  canShowStatus(optionStatus: Booking['status'], currentStatus: Booking['status']): boolean {
    const current = String(currentStatus).toUpperCase();
    const option = String(optionStatus).toUpperCase();

    if (current === option) return true;

    if (current === 'PENDING') {
      return option === 'APPROVED' || option === 'CANCELLED';
    }

    if (current === 'APPROVED') {
      return option === 'COMPLETED';
    }

    return false;
  }

  isStatusTransitionAllowed(currentStatus: Booking['status'], newStatus: Booking['status']): boolean {
    const current = String(currentStatus).toUpperCase();
    const next = String(newStatus).toUpperCase();

    if (current === next) return true;

    if (current === 'COMPLETED' || current === 'CANCELLED') {
      return false;
    }

    if (current === 'PENDING') {
      return next === 'APPROVED' || next === 'CANCELLED';
    }

    if (current === 'APPROVED') {
      return next === 'COMPLETED';
    }

    return false;
  }

  updateStatus(booking: Booking, status: Booking['status']) {
    if (!this.isStatusTransitionAllowed(booking.status, status)) {
      const reason = this.getTransitionBlockReason(booking.status, status);
      this.snackBar.open(`⚠️ Cannot change: ${reason}`, 'Close', { 
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const oldStatus = booking.status;

    // For certain transitions, ask admin for additional info via dialog
    if (!booking.id) return;

    const needsDialog = ['APPROVED', 'CANCELLED', 'COMPLETED'].includes(String(status).toUpperCase());

    // Open our StatusUpdateDialogComponent for richer inputs when needed
    if (needsDialog) {
      // import component type dynamically to satisfy AOT
      import('../status-update-dialog/status-update-dialog.component').then(m => {
        const comp = m.StatusUpdateDialogComponent;
        const bookingId = booking.id as string | number;
        const ref = this.dialog.open(comp, {
          width: '480px',
          data: { 
            bookingId: bookingId, 
            currentStatus: booking.status, 
            newStatus: status,
            currentBookingService: booking.service // Pass current service name to exclude from dropdown
          }
        });

        ref.afterClosed().subscribe(result => {
          if (!result) {
            // cancelled by admin, do not proceed
            return;
          }

          // Build partial update payload (use dedicated fields, avoid stuffing amounts into message)
          const payload: any = { status };
          if (result.adminNotes) payload.adminNotes = result.adminNotes || result.message;
          if (result.extraAmount !== undefined) payload.extraAmount = result.extraAmount;
          if (result.instruments) payload.instruments = result.instruments;
          // totalAmount may be provided as totalAmount or completedTotal depending on dialog version
          const total = result.totalAmount !== undefined ? result.totalAmount : (result.completedTotal !== undefined ? result.completedTotal : undefined);
          if (total !== undefined) payload.totalAmount = total;
          if (result.completionDate) payload.completionDate = result.completionDate;
          if (result.cancelReason) payload.cancelReason = result.cancelReason;
          
          // Handle multiple added services from new dialog
          if (result.addedServices && result.addedServices.length > 0) {
            // Store all services as JSON array in additionalServicesJson
            payload.additionalServicesJson = JSON.stringify(result.addedServices);
            // Store first service as primary additional service for backward compatibility
            const firstSvc = result.addedServices[0];
            if (firstSvc) {
              payload.additionalServiceName = firstSvc.name;
              payload.additionalServicePrice = firstSvc.price;
            }
          } else {
            // Legacy support for single additional service
            if (result.additionalServiceName) payload.additionalServiceName = result.additionalServiceName;
            if (result.additionalServicePrice !== undefined) payload.additionalServicePrice = result.additionalServicePrice;
          }

          this.bookingService.updateBooking(bookingId, payload).subscribe({
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
        });
      }).catch(err => {
        console.error('Failed to load status dialog', err);
        this.snackBar.open('❌ Failed to open status dialog', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      });

      return;
    }

    // Fallback: simple status-only update
    booking.status = status;
    this.bookingService.updateBookingStatus(booking.id, status, true).subscribe({
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

  getTransitionBlockReason(currentStatus: Booking['status'], newStatus: Booking['status']): string {
    const current = String(currentStatus).toUpperCase();
    const next = String(newStatus).toUpperCase();

    if (current === 'COMPLETED') {
      return 'Completed bookings cannot change status';
    }
    if (current === 'CANCELLED') {
      return 'Cancelled bookings cannot change status';
    }
    if (current === 'PENDING' && !(next === 'APPROVED' || next === 'CANCELLED')) {
      return 'Pending bookings can only be approved or cancelled';
    }
    if (current === 'APPROVED' && next !== 'COMPLETED') {
      return 'Approved bookings can only be marked as completed';
    }

    return 'Invalid status transition';
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
    const extraServices = this.parseAdditionalServices(booking.additionalServicesJson || '');
    const extraServicesText = extraServices.length > 0 
      ? extraServices.map(s => `${s.name} (₹${s.price})`).join(', ')
      : 'None';
    
    // Create a simple dialog content object for Material Dialog
    const dialogContent = {
      title: `Booking Details - ${booking.reference}`,
      booking: booking,
      extraServices: extraServices,
      extraServicesText: extraServicesText,
      getServiceName: (id: string) => this.getServiceName(id),
      getAddressPart: (addr: string, part: string) => this.getAddressPart(addr, part)
    };
    
    // Use window.alert with formatted content as fallback (enhanced formatting)
    const formattedAlert = `
BOOKING DETAILS - ${booking.reference}

👤 CUSTOMER DETAILS
━━━━━━━━━━━━━━━━━━━━━
Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email || 'N/A'}

📋 BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━
Reference No: ${booking.reference || 'N/A'}
Booking ID: ${booking.id || 'N/A'}
Service Type: ${this.getServiceName(booking.service)}
Status: ${booking.status || 'N/A'}
Service Date: ${booking.date || 'N/A'}
Time Slot: ${booking.timeSlot ? booking.timeSlot.toUpperCase() : 'N/A'}
Booking Created: ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleString() : 'N/A'}

💰 SERVICES & PRICING
━━━━━━━━━━━━━━━━━━━━━
Main Service Price: ₹${booking.price || 'N/A'}
Extra Amount: ₹${booking.extraAmount || '0'}
Completed Amount: ₹${booking.totalAmount || booking.price || 'N/A'}
Extra Services: ${extraServicesText}

📍 ADDRESS DETAILS
━━━━━━━━━━━━━━━━━━━━━
House/Flat: ${this.getAddressPart(booking.address || '', 'house')}
Area: ${this.getAddressPart(booking.address || '', 'area')}
City: ${this.getAddressPart(booking.address || '', 'city')}
Pincode: ${this.getAddressPart(booking.address || '', 'pincode')}
Landmark: ${this.getAddressPart(booking.address || '', 'landmark')}

${booking.completionDate ? `✓ Completion Date: ${booking.completionDate}\n` : ''}
${booking.adminNotes ? `📝 Admin Notes: ${booking.adminNotes}` : ''}
    `;
    
    alert(formattedAlert);
  }

  viewAddress(booking: Booking) {
    try {
      // Lazy import AddressDialogComponent to avoid circular issues
      import('../address-dialog/address-dialog.component').then(m => {
        const comp = m.AddressDialogComponent;
        const ref = this.dialog.open(comp, {
          width: '520px',
          data: { booking, address: booking.address, customerName: booking.name, phone: booking.phone, reference: booking.reference },
          panelClass: 'address-dialog-container'
        });

        ref.afterClosed().subscribe(result => {
          if (result === 'openMap' && booking.latLong) {
            this.openMap(booking.latLong);
          }
        });
      }).catch(err => {
        console.error('Failed to open address dialog', err);
        this.snackBar.open('Failed to open address dialog', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      });
    } catch (e) {
      console.error('viewAddress error', e);
    }
  }

  exportToExcel() {
    try {
      this.isLoading = true;

      const exportData = this.dataSource.filteredData.length > 0 ? this.dataSource.filteredData : this.dataSource.data;

      if (exportData.length === 0) {
        this.snackBar.open('No data to export', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        this.isLoading = false;
        return;
      }

      // Delegate Excel export to shared service
      this.excelExportService.exportBookings(exportData, this.getServiceName.bind(this));

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

  


  saveAsExcelFile(excelBuffer: any, fileName: string) {
    // Method removed - saving is now handled by ExcelExportService
  }
}