import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddressService, UserAddress } from '../../core/services/address.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-manage-addresses',
  templateUrl: './manage-addresses.component.html',
  styleUrls: ['./manage-addresses.component.css']
})
export class ManageAddressesComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap) map!: GoogleMap;

  addresses: UserAddress[] = [];
  addressForm: FormGroup;
  showAddForm = false;
  isLoading = false;
  isSaving = false;
  editingId: number | null = null;

  addressTypes = ['Home', 'Office', 'Other'];

  // Location/Map properties
  currentLocation: { latitude: number; longitude: number } | null = null;
  selectedLocation: { latitude: number; longitude: number } | null = null;
  isGettingLocation = false;
  locationError = '';
  mapCenter: any = { lat: 20.5937, lng: 78.9629 }; // India center
  mapZoom = 13;
  mapMarker: any | null = null;
  showMap = false;
  isLocationDetectionSupported = true;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.isLocationDetectionSupported = 'geolocation' in navigator;
    
    this.addressForm = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(2)]],
      addressType: ['Home', Validators.required],
      house: ['', Validators.required],
      area: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      landmark: [''],
      latitude: [null],
      longitude: [null]
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
    // Try to get user's current location on component init
    if (this.isLocationDetectionSupported) {
      this.detectCurrentLocation();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Detect user's current location using Geolocation API
   */
  detectCurrentLocation(): void {
    if (!this.isLocationDetectionSupported) {
      this.snackBar.open('⚠️ Geolocation not supported on this device', 'Close', { duration: 3000 });
      return;
    }

    this.isGettingLocation = true;
    this.locationError = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        // Update map center to current location
        this.mapCenter = { lat: this.currentLocation.latitude, lng: this.currentLocation.longitude };
        
        this.isGettingLocation = false;
        this.snackBar.open('✅ Current location detected', 'Close', { duration: 2000 });
      },
      (error) => {
        this.isGettingLocation = false;
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Location information not available.';
            break;
          case error.TIMEOUT:
            this.locationError = 'Location request timed out. Please try again.';
            break;
          default:
            this.locationError = 'An error occurred while getting your location.';
        }
        
        console.error('Geolocation error:', error);
        this.snackBar.open(`❌ ${this.locationError}`, 'Close', { duration: 3000 });
      }
    );
  }

  /**
   * Open map for location selection
   */
  openMapForPinLocation(): void {
    this.showMap = true;
    
    // If we have current location, use it; otherwise use existing selected location or India center
    if (this.currentLocation) {
      this.mapCenter = { lat: this.currentLocation.latitude, lng: this.currentLocation.longitude };
    } else if (this.selectedLocation) {
      this.mapCenter = { lat: this.selectedLocation.latitude, lng: this.selectedLocation.longitude };
    }

    // Set initial marker if location exists
    if (this.selectedLocation) {
      this.mapMarker = { lat: this.selectedLocation.latitude, lng: this.selectedLocation.longitude };
    }
  }

  /**
   * Close map
   */
  closeMap(): void {
    this.showMap = false;
  }

  /**
   * Handle map click to pin location
   */
  onMapClick(event: any): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      this.mapMarker = { lat, lng };
      this.selectedLocation = { latitude: lat, longitude: lng };
      
      this.snackBar.open('📍 Location pinned on map', 'Close', { duration: 2000 });
    }
  }

  /**
   * Use current location as the selected location
   */
  useCurrentLocationAsPin(): void {
    if (!this.currentLocation) {
      this.snackBar.open('❌ Current location not available', 'Close', { duration: 3000 });
      return;
    }

    this.selectedLocation = { ...this.currentLocation };
    this.mapMarker = { lat: this.currentLocation.latitude, lng: this.currentLocation.longitude };
    this.mapCenter = { lat: this.currentLocation.latitude, lng: this.currentLocation.longitude };
    
    this.snackBar.open('✅ Current location selected', 'Close', { duration: 2000 });
  }

  /**
   * Confirm map location and close map
   */
  confirmMapLocation(): void {
    if (!this.selectedLocation) {
      this.snackBar.open('❌ Please pin a location on the map', 'Close', { duration: 3000 });
      return;
    }

    // Update form with selected coordinates
    this.addressForm.patchValue({
      latitude: this.selectedLocation.latitude,
      longitude: this.selectedLocation.longitude
    });

    this.closeMap();
    this.snackBar.open('✅ Location confirmed', 'Close', { duration: 2000 });
  }

  /**
   * Load all addresses
   */
  loadAddresses(): void {
    this.isLoading = true;
    this.addressService.getAddresses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.addresses = response?.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('❌ Failed to load addresses', 'Close', { duration: 3000 });
          console.error('Error loading addresses:', err);
        }
      });
  }

  /**
   * Toggle add address form
   */
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.selectedLocation = null;
    this.mapMarker = null;
    
    if (!this.showAddForm) {
      this.addressForm.reset({ addressType: 'Home', landmark: '' });
      this.editingId = null;
    }
  }

  /**
   * Edit address
   */
  editAddress(address: UserAddress): void {
    this.editingId = address.id || null;
    
    // Set selected location if available
    if (address.latitude && address.longitude) {
      this.selectedLocation = {
        latitude: address.latitude,
        longitude: address.longitude
      };
    }
    
    this.addressForm.patchValue({
      label: address.label,
      addressType: address.addressType,
      house: address.house,
      area: address.area,
      city: address.city,
      pincode: address.pincode,
      landmark: address.landmark || '',
      latitude: address.latitude || null,
      longitude: address.longitude || null
    });
    this.showAddForm = true;
  }

  /**
   * Save address (add or update)
   */
  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.snackBar.open('❌ Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const addressData = this.addressForm.value;

    if (this.editingId) {
      // Update existing
      this.addressService.updateAddress(this.editingId, addressData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response?.success) {
              this.snackBar.open('✅ Address updated successfully', 'Close', { duration: 3000 });
              this.loadAddresses();
              this.toggleAddForm();
            }
            this.isSaving = false;
          },
          error: (err) => {
            this.isSaving = false;
            this.snackBar.open('❌ Failed to update address', 'Close', { duration: 3000 });
          }
        });
    } else {
      // Add new
      this.addressService.addAddress(addressData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response?.success) {
              this.snackBar.open('✅ Address added successfully', 'Close', { duration: 3000 });
              this.loadAddresses();
              this.toggleAddForm();
            }
            this.isSaving = false;
          },
          error: (err) => {
            this.isSaving = false;
            this.snackBar.open('❌ Failed to add address', 'Close', { duration: 3000 });
          }
        });
    }
  }

  /**
   * Delete address
   */
  deleteAddress(addressId: number | undefined): void {
    if (!addressId) return;

    const confirm = window.confirm('Are you sure you want to delete this address?');
    if (!confirm) return;

    this.addressService.deleteAddress(addressId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            this.snackBar.open('✅ Address deleted', 'Close', { duration: 3000 });
            this.loadAddresses();
          }
        },
        error: (err) => {
          this.snackBar.open('❌ Failed to delete address', 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Set as default address
   */
  setDefault(addressId: number | undefined): void {
    if (!addressId) return;

    this.addressService.setDefaultAddress(addressId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            this.snackBar.open('✅ Default address updated', 'Close', { duration: 3000 });
            this.loadAddresses();
          }
        },
        error: (err) => {
          this.snackBar.open('❌ Failed to update default address', 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    this.toggleAddForm();
  }
}
