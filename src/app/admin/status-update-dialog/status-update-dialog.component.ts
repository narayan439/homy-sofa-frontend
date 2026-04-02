import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceService, Service } from '../../core/services/service.service';

export interface StatusDialogData {
  bookingId: string | number;
  currentStatus: string;
  newStatus: string;
  currentBookingService?: string;
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
  
  
  services: Service[] = [];
  selectedServiceId: string | null = null;
  selectedService: Service | null = null;
  
  addedServices: Array<{ id: string; name: string; price: number }> = [];

  constructor(
    public dialogRef: MatDialogRef<StatusUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StatusDialogData,
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
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

  getAvailableServices(): Service[] {
    if (!this.data.currentBookingService) {
      return this.services;
    }
    const addedNames = this.addedServices.map(s => s.name.toLowerCase());
    return this.services.filter(s => 
      s.name && 
      s.name.toLowerCase() !== String(this.data.currentBookingService).toLowerCase() &&
      !addedNames.includes(s.name.toLowerCase())
    );
  }

  addServiceToList() {
    if (this.selectedService && this.extraAmount != null && this.extraAmount > 0 && this.instruments.trim()) {
      const alreadyAdded = this.addedServices.some(s => s.id === this.selectedService!.id);
      if (alreadyAdded) {
        alert('This service is already added.');
        return;
      }
      
      this.addedServices.push({
        id: this.selectedService.id || '',
        name: this.selectedService.name,
        price: this.extraAmount
      });
      
      this.selectedServiceId = null;
      this.selectedService = null;
      this.extraAmount = null;
      this.instruments = '';
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }

  removeService(index: number) {
    this.addedServices.splice(index, 1);
  }

  getTodayDate(): string {
    const today = new Date();
    return today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
  }

  isFormInvalid(): boolean {
    if (this.data.newStatus === 'ASSIGNED') {
      // If additional service is checked, validate service fields
      if (this.additionalService) {
        if (this.addedServices.length === 0) {
          return true;
        }
      }
    }
    // No manual technician selection; backend will auto-assign

    if (this.data.newStatus === 'CANCELLED') {
      return !this.cancelReason.trim();
    }

    // COMPLETED handled by technician; admin does not need to fill details
    return false;
  }

  submit() {
    // Final validation
    if (this.isFormInvalid()) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload: any = { status: this.data.newStatus };
    
    if (this.data.newStatus === 'ASSIGNED') {
      if (this.addedServices.length > 0) {
        payload.addedServices = this.addedServices;
        payload.extraAmount = this.addedServices.reduce((sum, svc) => sum + svc.price, 0);
      }
      // Technician assignment is automatic; backend will select and notify the technician.
    }

    if (this.data.newStatus === 'CANCELLED') {
      payload.cancelReason = this.cancelReason.trim();
    }

    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}