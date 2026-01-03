import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceService, Service } from '../../core/services/service.service';

export interface StatusDialogData {
  bookingId: string | number;
  currentStatus: string;
  newStatus: string;
  currentBookingService?: string; // Current service name to exclude from dropdown
}

@Component({
  selector: 'app-status-update-dialog',
  templateUrl: './status-update-dialog.component.html',
  styleUrls: ['./status-update-dialog.component.css']
})
export class StatusUpdateDialogComponent implements OnInit {
  additionalService = false;
  extraAmount: number | null = null;
  instruments: string = '';
  cancelReason: string = '';
  completedTotal: number | null = null;
  notes: string = '';
  
  services: Service[] = [];
  selectedServiceId: string | null = null;
  selectedService: Service | null = null;
  
  // Support multiple services
  addedServices: Array<{ id: string; name: string; price: number }> = [];

  constructor(
    public dialogRef: MatDialogRef<StatusUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StatusDialogData,
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
    // Load services for the dropdown
    this.serviceService.loadServices();
    this.serviceService.services$.subscribe(services => {
      this.services = services || [];
    });
  }

  onServiceSelected() {
    if (this.selectedServiceId) {
      this.selectedService = this.services.find(s => s.id === this.selectedServiceId) || null;
    } else {
      this.selectedService = null;
    }
  }

  // Filter services to exclude current booking's service
  getAvailableServices(): Service[] {
    if (!this.data.currentBookingService) {
      return this.services;
    }
    // Hide services that match the current booking service name or already added services
    const addedNames = this.addedServices.map(s => s.name.toLowerCase());
    return this.services.filter(s => 
      s.name && 
      s.name.toLowerCase() !== String(this.data.currentBookingService).toLowerCase() &&
      !addedNames.includes(s.name.toLowerCase())
    );
  }

  // Add service to the list of additional services
  addServiceToList() {
    if (this.selectedService && this.extraAmount != null && this.instruments.trim()) {
      const alreadyAdded = this.addedServices.some(s => s.id === this.selectedService!.id);
      if (alreadyAdded) {
        alert('This service is already added.');
        return;
      }
      // Use extraAmount as the price (admin enters the actual amount needed, not service default price)
      const serviceId = this.selectedService.id || '';
      const adminEnteredPrice = this.extraAmount; // Use the amount admin entered
      
      this.addedServices.push({
        id: serviceId,
        name: this.selectedService.name,
        price: adminEnteredPrice // Store admin-entered price, not service default price
      });
      // Reset form for next service
      this.selectedServiceId = null;
      this.selectedService = null;
      this.extraAmount = null;
      this.instruments = '';
    } else {
      alert('Please fill in all required fields: Service, Amount, and Instruments.');
    }
  }

  // Remove a service from the list
  removeService(index: number) {
    this.addedServices.splice(index, 1);
  }

  submit() {
    const payload: any = { status: this.data.newStatus };
    
    if (this.data.newStatus === 'APPROVED') {
      // For APPROVED, send array of additional services
      if (this.addedServices.length > 0) {
        payload.addedServices = this.addedServices;
      }
      payload.adminNotes = this.notes;
    }

    if (this.data.newStatus === 'CANCELLED') {
      payload.cancelReason = this.cancelReason;
      payload.adminNotes = this.cancelReason;
    }

    if (this.data.newStatus === 'COMPLETED') {
      payload.totalAmount = this.completedTotal;
      // Auto-set completion date to today
      const today = new Date();
      const formattedDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
      payload.completionDate = formattedDate;
      payload.adminNotes = this.notes;
    }

    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
