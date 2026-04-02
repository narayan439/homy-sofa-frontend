import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TechnicianService } from '../../core/services/technician.service';
import { BookingService } from '../../core/services/booking.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ServiceService } from '../../core/services/service.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tech-jobs',
  templateUrl: './technician-jobs.component.html',
  styleUrls: ['./technician-jobs.component.css']
})
export class TechnicianJobsComponent implements OnInit {
  jobs: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  technicianId: string | number | undefined;
  // dialog/template
  @ViewChild('jobDialog') jobDialog!: TemplateRef<any>;
  currentJob: any = null;
  dialogRef: MatDialogRef<any> | null = null;

  // add-service / complete modes
  addServiceMode = false;
  completeMode = false;
  services: any[] = [];
  selectedServiceId: string | number | null = null;
  additionalServiceName = '';
  additionalServicePrice: number | null = null;
  totalAmount: number | null = null;
  completionNotes = '';
  searchQuery: string = '';
  statusFilter: string = 'all';
  dateFilter: string = 'all';
  filteredJobs: any[] = [];
  cancelMode: boolean = false;
  cancelReason: string = '';

  currentMonth: string = '';
currentYear: number = 2025;
calendarDays: Date[] = [];
weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
selectedDate: Date | null = null;
bookingCountMap: Map<string, number> = new Map();

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  // NEW: Sort order
  sortOrder: string = 'newest'; // 'newest' or 'oldest'
  // Pagination
  page: number = 0;
  size: number = 20;

  constructor(
    private techService: TechnicianService,
    private dialog: MatDialog,
    private serviceService: ServiceService,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    // Preload services once
    this.serviceService.loadServices();
    this.serviceService.services$.pipe(takeUntil(this.destroy$)).subscribe(s => this.services = s || []);

    // Wire up debounced search
    this.searchSubject.pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(q => {
      this.searchQuery = q;
      this.applyFilters();
    });

    this.initializeCalendar();
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    const tech = localStorage.getItem('technician');
    this.technicianId = tech ? JSON.parse(tech).id : undefined;

    this.techService.getBookingsForTechnician(this.technicianId, this.page, this.size).subscribe({
      next: (res: any) => {
        console.log('loadJobs response for technicianId=', this.technicianId, res);

        // Helper: try to extract the first array-like payload we can find
        const tryExtractArray = (obj: any): any[] | null => {
          if (!obj) return null;
          if (Array.isArray(obj)) return obj;
          // common container keys used by APIs / Spring Data pages
          if (Array.isArray(obj.content)) return obj.content;
          if (Array.isArray(obj.data)) return obj.data;
          if (Array.isArray(obj.bookings)) return obj.bookings;
          if (Array.isArray(obj.results)) return obj.results;
          if (Array.isArray(obj.payload)) return obj.payload;
          if (Array.isArray(obj.items)) return obj.items;
          if (Array.isArray(obj.rows)) return obj.rows;

          // shallow scan for an array value
          if (typeof obj === 'object') {
            for (const k of Object.keys(obj)) {
              try {
                const v = obj[k];
                if (Array.isArray(v)) return v;
              } catch (e) { /* ignore */ }
            }
          }

          return null;
        };

        let jobs: any[] = tryExtractArray(res) || tryExtractArray(res?.data) || tryExtractArray(res?.payload) || [];

        // If the response looks like a Spring Page object (has content) but tryExtract missed it, use content
        if ((!jobs || jobs.length === 0) && res && res.content && Array.isArray(res.content)) {
          jobs = res.content;
        }

        // If still empty but the response looks like a single booking object, wrap it
        if ((!jobs || jobs.length === 0) && res && typeof res === 'object') {
          const hasBookingLike = ('id' in res) || ('bookingId' in res) || ('date' in res) || ('service' in res) || ('technician_status' in res) || ('technicianStatus' in res);
          if (hasBookingLike) jobs = [res];
        }

        // Final fallback: shallow recursive scan for first array-of-objects
        if ((!jobs || jobs.length === 0) && res && typeof res === 'object') {
          const visited = new Set<any>();
          const queue: any[] = [res];
          while (queue.length > 0 && (!jobs || jobs.length === 0)) {
            const node = queue.shift();
            if (!node || visited.has(node)) continue;
            visited.add(node);
            if (Array.isArray(node) && node.length > 0 && node[0] && typeof node[0] === 'object') {
              const first = node[0];
              if ('id' in first || 'date' in first || 'service' in first || 'technician_status' in first || 'technicianStatus' in first) {
                jobs = node;
                break;
              }
            }
            if (typeof node === 'object') {
              for (const k of Object.keys(node)) {
                try { queue.push(node[k]); } catch (e) {}
              }
            }
          }
        }

        // Enrich jobs with customer info and normalize fields
        this.jobs = this.enrichJobs(jobs || []);
        this.isLoading = false;
        this.applyFilters();
        this.generateBookingCountMap();

        // Debug logging
        console.log('Extracted jobs count:', (jobs || []).length);
        if ((jobs || []).length > 0) {
          console.log('First raw job:', (jobs || [])[0]);
        }
        console.log('Jobs by status:', {
          ASSIGNED: this.assignedCount,
          ACCEPTED: this.acceptedCount,
          IN_PROGRESS: this.inProgressCount,
          COMPLETED: this.completedCount,
          CANCELLED: this.cancelledCount,
          TOTAL: this.totalJobs,
          ACTIVE: this.activeJobsCount
        });
        console.log('Filtered jobs:', this.filteredJobs.length);
        console.log('All jobs with enriched data:', this.jobs);
      },
      error: (err) => {
        console.error('Failed to load technician bookings', err);
        this.errorMessage = 'Failed to load jobs. Please try again.';
        this.isLoading = false;
      }
    });
  }

  enrichJobs(jobs: any[]): any[] {
    const parseDate = (raw: any): string | null => {
      if (!raw && raw !== 0) return null;
      // primitives
      if (typeof raw === 'string' || typeof raw === 'number') {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) return d.toISOString();
        const s = String(raw).trim();
        // try yyyy-MM-dd
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toISOString();
      }

      // LocalDate / object { year, month, day }
      if (typeof raw === 'object') {
        if ('year' in raw && 'month' in raw && 'day' in raw) {
          try { return new Date(Number(raw.year), Number(raw.month) - 1, Number(raw.day)).toISOString(); } catch (e) { }
        }
        // Instant-like { seconds, nanos }
        if ('seconds' in raw && ('nanos' in raw || 'nanoseconds' in raw)) {
          const secs = Number(raw.seconds || 0);
          const nanos = Number(raw.nanos || raw.nanoseconds || 0);
          const ms = secs * 1000 + Math.round(nanos / 1e6);
          const d = new Date(ms);
          if (!isNaN(d.getTime())) return d.toISOString();
        }
      }

      return null;
    };

    return (jobs || []).map(job => {
      const rawDate = job.date ?? job.bookingDate ?? job.created_at ?? job.createdAt;
      const parsed = parseDate(rawDate) || parseDate(job.date) || parseDate(job.bookingDate) || parseDate(job.created_at) || parseDate(job.createdAt) || null;
      const bookingDate = parsed || new Date().toISOString();

      // Normalize status to uppercase for consistent comparison (check multiple possible fields)
      const rawStatus = job.technicianStatus ?? job.technician_status ?? job.status ?? job.bookingStatus ?? job.state ?? job.technician_status_text;
      const status = rawStatus ? String(rawStatus).toUpperCase() : 'ASSIGNED';

      // Resolve service name: support string, object, and different field names
      let serviceName = 'Service';
      if (job.service) {
        if (typeof job.service === 'string') serviceName = job.service;
        else if (job.service.name) serviceName = job.service.name;
        else serviceName = JSON.stringify(job.service).slice(0, 60);
      }
      serviceName = job.serviceName || job.service_type || job.service_type_name || job.service_name || job.serviceName || job.serviceType || serviceName;
      if (job.serviceDetails && job.serviceDetails.name) serviceName = job.serviceDetails.name;

      // Time slot alternatives
      const timeSlot = job.timeSlot ?? job.time ?? job.time_slot ?? job.slot ?? 'Flexible';

      return {
        ...job,
        technicianStatus: status,
        customerName: job.name || job.customerName || job.customer?.name || 'Unknown',
        customerPhone: job.phone || job.customerPhone || job.customer?.phone || '',
        customerEmail: job.email || job.customerEmail || job.customer?.email || '',
        address: job.address || job.serviceAddress || job.address_text || job.customerAddress || 'No address',
        specialAddress: job.specialAddress || job.address || job.address_text,
        serviceType: serviceName,
        bookingDate,
        timeSlot,
        totalAmount: job.totalAmount ?? job.amount ?? job.price ?? job.total_amount ?? 0,
        reference: job.reference ?? job.bookingId ?? job.id ?? job.reference_no
      };
    });
  }

  accept(job: any) {
    this.techService.acceptJob(job.id, this.technicianId).subscribe({
      next: () => {
        job.technicianStatus = 'ACCEPTED';
        console.log('Job accepted');
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to accept job', err);
        this.errorMessage = 'Failed to accept job';
      }
    });
  }

  start(job: any) {
    this.techService.startJob(job.id, this.technicianId).subscribe({
      next: () => {
        job.technicianStatus = 'IN_PROGRESS';
        console.log('Job started');
        this.loadJobs();
      },
      error: (err) => {
        console.error('Failed to start job', err);
        this.errorMessage = 'Failed to start job';
      }
    });
  }

  // Get jobs by status (case-insensitive)
  getJobsByStatus(status: string): any[] {
    const normalizedStatus = String(status).toUpperCase();
    return this.jobs.filter(job => {
      const jobStatus = String(job.technicianStatus || '').toUpperCase();
      return jobStatus === normalizedStatus;
    });
  }

  complete(job: any) {
    this.techService.completeJob(job.id, this.technicianId).subscribe({
      next: () => {
        job.technicianStatus = 'COMPLETED';
        job.status = 'COMPLETED';
        job.completionDate = new Date().toISOString().split('T')[0];
        console.log('Job completed');
      },
      error: (err) => {
        console.error('Failed to complete job', err);
        this.errorMessage = 'Failed to complete job';
      }
    });
  }

  openDetails(job: any, resetModes: boolean = true) {
    console.log('openDetails called for job:', job);
    try { this.currentJob = this.enrichJobs([job])[0]; } catch { this.currentJob = job; }
    // reset dialog state by default
    if (resetModes) {
      this.addServiceMode = false;
      this.completeMode = false;
    }
    this.selectedServiceId = null;
    this.additionalServiceName = '';
    this.additionalServicePrice = null;
    this.totalAmount = null;
    this.completionNotes = '';

    // load services for add-service selector
    // load services for add-service selector (subscribe once)
    this.serviceService.services$.subscribe(s => this.services = s || []);
    this.serviceService.loadServices();

    // Refresh job details from backend to ensure latest info (additional services, notes, amounts)
    if (this.currentJob && this.currentJob.id != null) {
      console.log('Attempting to refresh booking from backend for id:', this.currentJob.id);
      this.bookingService.getBookingById(this.currentJob.id).subscribe({
        next: (fresh: any) => {
          console.log('Fetched fresh booking:', fresh);
          try { this.currentJob = this.enrichJobs([fresh])[0]; } catch (e) { console.warn('enrichJobs failed', e); this.currentJob = fresh; }
          console.log('Enriched currentJob for dialog:', this.currentJob);
          this.dialogRef = this.dialog.open(this.jobDialog, { width: '520px' });
          console.log('Dialog opened with booking id:', this.currentJob.id);
          this.dialogRef.afterClosed().subscribe(result => {
            if (result && (result.action === 'started' || result.action === 'completed' || result.action === 'accepted' || result.action === 'cancelled')) {
              this.loadJobs();
            }
            this.currentJob = null;
          });
        },
        error: (err) => {
          console.warn('Failed to fetch fresh booking, opening dialog with existing data. Error:', err);
          // fallback to opening dialog with existing data
          try { this.currentJob = this.enrichJobs([this.currentJob])[0]; } catch {};
          this.dialogRef = this.dialog.open(this.jobDialog, { width: '520px' });
          console.log('Dialog opened (fallback) for booking id:', this.currentJob.id);
          this.dialogRef.afterClosed().subscribe(result => {
            if (result && (result.action === 'started' || result.action === 'completed' || result.action === 'accepted' || result.action === 'cancelled')) {
              this.loadJobs();
            }
            this.currentJob = null;
          });
        }
      });
    } else {
      console.log('No booking id available; opening dialog with current data');
      try { this.currentJob = this.enrichJobs([this.currentJob])[0]; } catch {};
      this.dialogRef = this.dialog.open(this.jobDialog, { width: '520px' });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result && (result.action === 'started' || result.action === 'completed' || result.action === 'accepted' || result.action === 'cancelled')) {
          this.loadJobs();
        }
        this.currentJob = null;
      });
    }
  }

  // Dialog actions moved here
  enterAddServiceMode() {
    this.addServiceMode = true;
    this.additionalServiceName = '';
    this.additionalServicePrice = null;
    this.selectedServiceId = null;
  }

  onServiceSelected(event: any) {
    // handler may receive direct id (string/number) or an event; normalize to id
    let id: any = null;
    if (event == null) id = null;
    else if (typeof event === 'string' || typeof event === 'number') id = event;
    else if (event && event.value !== undefined) id = event.value;
    else if (event && event.target && event.target.value !== undefined) id = event.target.value;
    else id = event;

    const svc = this.services.find((s: any) => String(s.id) === String(id));
    if (svc) {
      this.additionalServiceName = svc.name;
      this.additionalServicePrice = svc.price !== undefined ? Number(svc.price) : null;
      this.selectedServiceId = svc.id;
    } else {
      this.additionalServiceName = '';
      this.additionalServicePrice = null;
      this.selectedServiceId = null;
    }
  }

  isServiceAlreadyAdded(service: any): boolean {
    if (!this.currentJob) return false;
    try {
      const existing = this.currentJob.additionalServicesJson ? JSON.parse(this.currentJob.additionalServicesJson) : [];
      if (!Array.isArray(existing)) return false;
      return existing.some((s: any) => {
        if (s.id && String(s.id) === String(service.id)) return true;
        if (s.name && service.name && String(s.name).toLowerCase() === String(service.name).toLowerCase()) return true;
        return false;
      });
    } catch (e) {
      return false;
    }
  }

  submitAddService() {
    if (!this.additionalServiceName || this.additionalServicePrice == null) {
      alert('Please select a service');
      return;
    }
    // Prevent adding the same service as the booking's main service
    const mainService = (this.currentJob?.serviceType || this.currentJob?.service || '').toString().trim().toLowerCase();
    if (mainService && this.additionalServiceName.toString().trim().toLowerCase() === mainService) {
      alert('Cannot add the same service as the main booking');
      return;
    }
    // prevent duplicates
    try {
      const existing = this.currentJob.additionalServicesJson ? JSON.parse(this.currentJob.additionalServicesJson) : [];
      if (Array.isArray(existing)) {
        const dup = existing.find((s: any) => (s.name || '').toLowerCase() === (this.additionalServiceName || '').toLowerCase());
        if (dup) {
          alert('This additional service has already been added');
          return;
        }
      }
    } catch (e) {}

    const tech = localStorage.getItem('technician');
    const id = tech ? JSON.parse(tech).id : null;
    this.techService.addAdditionalService(this.currentJob.id, this.additionalServiceName, this.additionalServicePrice, id).subscribe({
      next: () => {
        alert('Service added');
        this.addServiceMode = false;
        // update local job
        try {
          const arr = this.currentJob.additionalServicesJson ? JSON.parse(this.currentJob.additionalServicesJson) : [];
          arr.push({ id: this.selectedServiceId, name: this.additionalServiceName, price: this.additionalServicePrice });
          this.currentJob.additionalServicesJson = JSON.stringify(arr);
        } catch (e) {
          this.currentJob.additionalServicesJson = JSON.stringify([{ id: this.selectedServiceId, name: this.additionalServiceName, price: this.additionalServicePrice }]);
        }
      },
      error: () => alert('Failed to add service')
    });
  }

  getAdditionalServiceNames(job: any): string {
    try {
      const arr = job && job.additionalServicesJson ? JSON.parse(job.additionalServicesJson) : [];
      if (!Array.isArray(arr)) return '';
      return arr.map((s: any) => s.name || s.serviceName || '').filter((n: string) => n).join(', ');
    } catch (e) {
      return '';
    }
  }

  enterCompleteMode() { this.completeMode = true; }

  submitComplete() {
    if (this.totalAmount == null || this.totalAmount === 0) { alert('Please enter total amount collected'); return; }
    if (!this.completionNotes || this.completionNotes.trim().length === 0) { alert('Please enter completion notes'); return; }
    const tech = localStorage.getItem('technician');
    const id = tech ? JSON.parse(tech).id : null;
    const payload: any = { technicianNotes: this.completionNotes, totalAmount: this.totalAmount };
    this.techService.completeJob(this.currentJob.id, id, payload).subscribe({ next: () => {
      this.dialogRef?.close({ action: 'completed' });
    }, error: () => alert('Failed to complete') });
  }

  cancelByTechnician() {
    const confirmCancel = confirm('Are you sure you want to cancel this job?');
    if (!confirmCancel) return;
    let reason = (prompt('Enter cancel reason (required)') || '').trim();
    if (!reason) { alert('Cancel reason is required'); return; }
    const tech = localStorage.getItem('technician');
    const id = tech ? JSON.parse(tech).id : null;
    this.techService.cancelJob(this.currentJob.id, id, reason).subscribe({ next: () => this.dialogRef?.close({ action: 'cancelled' }), error: () => alert('Failed to cancel') });
  }

  // Summary counts for the header stats
  get totalJobs(): number {
    return (this.jobs || []).length;
  }

  get assignedCount(): number {
    return this.getJobsByStatus('ASSIGNED').length;
  }

  get acceptedCount(): number {
    return this.getJobsByStatus('ACCEPTED').length;
  }

  get inProgressCount(): number {
    return this.getJobsByStatus('IN_PROGRESS').length;
  }

  get activeJobsCount(): number {
    return this.getActiveJobs().length;
  }

  get completedCount(): number {
    return this.getCompletedJobs().length;
  }

  get cancelledCount(): number {
    return (this.jobs || []).filter(j => String(j.technicianStatus || '').toUpperCase() === 'CANCELLED').length;
  }

  openMap(latLong: string) {
    try { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latLong)}`, '_blank', 'noopener,noreferrer'); }
    catch { alert('Failed to open Google Maps'); }
  }
  
  applyFilters() {
    this.filteredJobs = this.jobs.filter(job => {
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const customerName = (job.customerName || '').toLowerCase();
        const service = (job.serviceType || job.service || '').toLowerCase();
        const address = (job.specialAddress || job.address || '').toLowerCase();
        
        if (!customerName.includes(query) && !service.includes(query) && !address.includes(query)) {
          return false;
        }
      }
      
      // Status filter (case-insensitive)
      if (this.statusFilter !== 'all') {
        const jobStatus = String(job.technicianStatus || '').toUpperCase();
        const filterStatus = String(this.statusFilter).toUpperCase();
        if (jobStatus !== filterStatus) {
          return false;
        }
      }
      
      // Date filter (simplified)
      if (this.dateFilter !== 'all') {
        try {
          const jobDate = new Date(job.bookingDate);
          const today = new Date();
          
          if (this.dateFilter === 'today') {
            if (jobDate.toDateString() !== today.toDateString()) return false;
          } else if (this.dateFilter === 'week') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (jobDate < weekAgo) return false;
          } else if (this.dateFilter === 'month') {
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            if (jobDate < monthAgo) return false;
          }
        } catch (e) {
          console.warn('Date filter error for job:', job, e);
        }
      }
      
      return true;
    });
    
    // Apply sorting based on sortOrder
    this.applySorting();
  }
  
  // NEW: Apply sorting based on booking date
  applySorting() {
    if (this.sortOrder === 'newest') {
      this.filteredJobs.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    } else if (this.sortOrder === 'oldest') {
      this.filteredJobs.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
    }
  }

  // Return jobs that are not completed (for main list)
  getActiveJobs(): any[] {
    return (this.jobs || []).filter(j => {
      const status = String(j.technicianStatus || '').toUpperCase();
      return status !== 'COMPLETED' && status !== 'CANCELLED';
    });
  }

  // Return completed jobs for history view
  getCompletedJobs(): any[] {
    return (this.jobs || []).filter(j => String(j.technicianStatus || '').toUpperCase() === 'COMPLETED');
  }

  // Return cancelled jobs
  getCancelledJobs(): any[] {
    return (this.jobs || []).filter(j => String(j.technicianStatus || '').toUpperCase() === 'CANCELLED');
  }
  
  // NEW: Toggle sort order
  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'newest' ? 'oldest' : 'newest';
    this.applySorting();
  }

  filterByStatus(status: string) {
    this.statusFilter = status;
    this.applyFilters();
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.dateFilter = 'all';
    this.sortOrder = 'newest'; // Reset to newest first
    this.applyFilters();
  }

  openAddService(job: any) {
    this.currentJob = job;
    this.addServiceMode = true;
    this.completeMode = false;
    this.cancelMode = false;
    this.openDetails(job, false);
  }

  openComplete(job: any) {
    this.currentJob = job;
    this.completeMode = true;
    this.addServiceMode = false;
    this.cancelMode = false;
    this.openDetails(job, false);
  }

  openCancel(job: any) {
    this.currentJob = job;
    this.cancelMode = true;
    this.addServiceMode = false;
    this.completeMode = false;
    this.openDetails(job, false);
  }

  enterCancelMode() {
    this.cancelMode = true;
    this.addServiceMode = false;
    this.completeMode = false;
  }

  submitCancel() {
    if (!this.cancelReason || this.cancelReason.trim().length === 0) {
      alert('Please enter a cancellation reason');
      return;
    }
    
    const tech = localStorage.getItem('technician');
    const id = tech ? JSON.parse(tech).id : null;
    
    this.techService.cancelJob(this.currentJob.id, id, this.cancelReason).subscribe({
      next: () => {
        this.dialogRef?.close({ action: 'cancelled' });
        this.loadJobs();
      },
      error: () => alert('Failed to cancel job')
    });
  }

  parseAdditionalServices(jsonString: string): any[] {
    try {
      return jsonString ? JSON.parse(jsonString) : [];
    } catch (e) {
      return [];
    }
  }

  // trackBy for ngFor to improve rendering performance and avoid template errors
  trackByJob(_: number, job: any): any {
    return job && (job.id !== undefined && job.id !== null) ? job.id : _;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  initializeCalendar() {
  const today = new Date();
  this.currentYear = today.getFullYear();
  this.currentMonth = today.toLocaleString('default', { month: 'long' });
  this.generateCalendarDays(today.getFullYear(), today.getMonth());
}

// Generate calendar days for a given month
generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const startOffset = firstDay.getDay();
  
  // Generate days from previous month to fill first week
  this.calendarDays = [];
  
  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    this.calendarDays.push(new Date(year, month - 1, prevMonthLastDay - i));
  }
  
  // Add current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    this.calendarDays.push(new Date(year, month, i));
  }
  
  // Add days from next month to complete grid (42 days total for 6 weeks)
  const totalDaysNeeded = 42;
  const remainingDays = totalDaysNeeded - this.calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    this.calendarDays.push(new Date(year, month + 1, i));
  }
}

// Check if a date is today
isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

// Check if date is selected
isSelectedDate(date: Date): boolean {
  if (!this.selectedDate) return false;
  return date.getDate() === this.selectedDate.getDate() &&
         date.getMonth() === this.selectedDate.getMonth() &&
         date.getFullYear() === this.selectedDate.getFullYear();
}

// Select a date
selectDate(date: Date) {
  this.selectedDate = date;
}

// Navigate to previous month
previousMonth() {
  let month = this.calendarDays[20].getMonth() - 1;
  let year = this.calendarDays[20].getFullYear();
  
  if (month < 0) {
    month = 11;
    year--;
  }
  
  this.currentYear = year;
  this.currentMonth = new Date(year, month).toLocaleString('default', { month: 'long' });
  this.generateCalendarDays(year, month);
}

// Navigate to next month
nextMonth() {
  let month = this.calendarDays[20].getMonth() + 1;
  let year = this.calendarDays[20].getFullYear();
  
  if (month > 11) {
    month = 0;
    year++;
  }
  
  this.currentYear = year;
  this.currentMonth = new Date(year, month).toLocaleString('default', { month: 'long' });
  this.generateCalendarDays(year, month);
}

// Get booking count for a specific date
getBookingsCountForDate(date: Date): number {
  const dateStr = this.formatDateForComparison(date);
  return this.jobs.filter(job => {
    const jobDate = new Date(job.bookingDate);
    return this.formatDateForComparison(jobDate) === dateStr;
  }).length;
}

// Get jobs for a specific date
getJobsForDate(date: Date): any[] {
  const dateStr = this.formatDateForComparison(date);
  return this.jobs.filter(job => {
    const jobDate = new Date(job.bookingDate);
    return this.formatDateForComparison(jobDate) === dateStr;
  });
}

// Get active jobs count for a date
getActiveJobsForDate(date: Date): number {
  return this.getJobsForDate(date).filter(job => 
    job.technicianStatus !== 'COMPLETED' && job.technicianStatus !== 'CANCELLED'
  ).length;
}

// Format date for comparison (YYYY-MM-DD)
formatDateForComparison(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Add these properties
showCalendarPopup: boolean = false;
todayDate: Date = new Date();

// Add these methods
toggleCalendarView() {
  this.showCalendarPopup = !this.showCalendarPopup;
  if (this.showCalendarPopup) {
    this.initializeCalendar();
  }
}

closeCalendarView() {
  this.showCalendarPopup = false;
}

getTodayBookingsCount(): number {
  return this.getBookingsCountForDate(new Date());
}

showAppointmentsForDate(date: Date) {
  // Already handled by selectDate
}

viewAllAppointments() {
  this.closeCalendarView();
  this.filterByStatus('all');
}

// Generate booking count map for calendar
generateBookingCountMap() {
  this.bookingCountMap.clear();
  this.jobs.forEach(job => {
    const dateStr = this.formatDateForComparison(new Date(job.bookingDate));
    const count = this.bookingCountMap.get(dateStr) || 0;
    this.bookingCountMap.set(dateStr, count + 1);
  });
}
}