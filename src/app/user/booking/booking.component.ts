import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '../../core/services/booking.service';
import { ServiceService, Service } from '../../core/services/service.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit, OnDestroy {
  bookingForm: FormGroup;
  selectedService: string | null = null;
  minDate: Date;
  services: Service[] = [];
  selectedServicePrice: number | null = null;
  
  // Location properties
  isGettingLocation: boolean = false;
  locationPermission: string = 'unknown'; // 'granted', 'denied', 'unknown'
  userLocation: { lat: number, lng: number, address: string } | null = null;
  locationError: string = '';
  isServiceable: boolean = true;
  private watchId: number | null = null;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private serviceService: ServiceService
  ) {
    this.minDate = new Date();

    // Initialize the booking form
    this.bookingForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z ]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      serviceDate: ['', Validators.required],
      timeSlot: [''],
      details: ['', [Validators.maxLength(500)]],
      serviceType: ['', Validators.required],
      // Address fields
      house: ['', Validators.required],
      area: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]],
      landmark: [''],
      // Location fields
      latitude: [''],
      longitude: [''],
      fullAddress: [''],
      // Google Maps link
      mapLink: ['']
    });
  }

  ngOnInit(): void {
    this.serviceService.services$.subscribe(list => {
      // Filter to only active services for booking
      this.services = (list || []).filter(s => s.isActive !== false);
      const selected = this.services.find(s => 
        s.id === this.bookingForm.get('serviceType')?.value || 
        s.name === this.bookingForm.get('serviceType')?.value
      );
      this.selectedServicePrice = selected?.price ?? null;
    });
    this.serviceService.loadServices();

    this.bookingForm.get('serviceType')?.valueChanges.subscribe(val => {
      const svc = this.services.find(s => s.id === val || s.name === val);
      this.selectedServicePrice = svc?.price ?? null;
    });

    // When pincode entered, try to detect city (India postal API)
    this.bookingForm.get('pincode')?.valueChanges.subscribe(async (val: string) => {
      if (!val) return;
      const cleaned = (val || '').toString().trim();
      if (/^[0-9]{6}$/.test(cleaned)) {
        try {
          const resp = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
          if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0 && data[0].Status === 'Success') {
              const postOffices = data[0].PostOffice || [];
              if (postOffices.length > 0) {
                // Prefer District or Division as city
                const po = postOffices[0];
                const cityName = po.District || po.Division || po.Block || po.State || '';
                if (cityName) {
                  this.bookingForm.patchValue({ city: cityName });
                }
              }
            }
          }
        } catch (e) {
          console.warn('Pincode lookup failed', e);
        }
      }
    });

    // Try to get location on page load
    this.checkLocationPermission();
  }

  ngOnDestroy(): void {
    this.stopLocationTracking();
  }

  // Location Methods
  async checkLocationPermission() {
    if (!navigator.permissions) {
      this.locationPermission = 'unknown';
      return;
    }
    
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      this.locationPermission = permissionStatus.state;
      
      permissionStatus.onchange = () => {
        this.locationPermission = permissionStatus.state;
        if (permissionStatus.state === 'granted') {
          this.getUserLocation();
        }
      };
    } catch (error) {
      console.warn('Permission query not supported:', error);
      this.locationPermission = 'unknown';
    }
  }

  async getUserLocation() {
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by your browser';
      return;
    }

    this.isGettingLocation = true;
    this.locationError = '';

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const { latitude, longitude } = position.coords;
      
      // Update form fields
      this.bookingForm.patchValue({
        latitude: latitude,
        longitude: longitude
      });

      // Get address from coordinates
      await this.reverseGeocode(latitude, longitude);

      this.userLocation = {
        lat: latitude,
        lng: longitude,
        address: this.bookingForm.get('fullAddress')?.value || ''
      };

      this.startLocationTracking();

    } catch (error: any) {
      console.error('Error getting location:', error);
      this.handleLocationError(error);
    } finally {
      this.isGettingLocation = false;
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    try {
      // Use Google Maps API (requires public API key or fallback to Nominatim)
      // Fallback to Nominatim if Google API is not available
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Build address components from Nominatim response
        let house = address.house_number || address.building || '';
        let road = address.road || address.street || address.street_address || '';
        let area = address.suburb || address.neighbourhood || address.locality || '';
        let city = address.city || address.town || address.village || address.county || '';
        let state = address.state || '';
        let pincode = address.postcode || '';
        
        // If no house/street info, use display_name
        if (!house && !road && data.display_name) {
          const parts = data.display_name.split(',');
          if (parts.length > 0) {
            road = parts[0].trim();
          }
          if (parts.length > 1) {
            area = parts[1].trim();
          }
        }
        
        // Build full address
        const fullAddress = [
          house && road ? house + ', ' + road : (house || road),
          area,
          city,
          state,
          pincode
        ].filter(Boolean).join(', ');

        // Update form fields with detected address
        this.bookingForm.patchValue({
          house: (house && road) ? house : (house || road),
          area: area || '',
          city: city || '',
          pincode: pincode || '',
          fullAddress: fullAddress || data.display_name || ''
        });

        // Determine serviceability based on detected city or full address
        const detectedCity = (city || '').toString();
        const detectedFull = (fullAddress || data.display_name || '').toString();
        this.isServiceable = this.checkServiceable(detectedCity, detectedFull);

        // Auto-fill landmark if not already set
        if (!this.bookingForm.get('landmark')?.value) {
          const landmark = address.amenity || address.shop || address.cafe || address.restaurant || '';
          if (landmark) {
            this.bookingForm.patchValue({
              landmark: landmark
            });
          }
        }
      } else {
        // If no address found, use coordinates
        this.bookingForm.patchValue({
          fullAddress: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`
        });
        // Coordinates-only — mark as not serviceable by default
        this.isServiceable = false;
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      // Still use coordinates even if reverse geocoding fails
      this.bookingForm.patchValue({
        fullAddress: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`
      });
      this.isServiceable = false;
    }
  }

  extractCoordinatesFromMapLink(link: string): { lat: number, lng: number } | null {
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      
      // Format 1: https://maps.google.com/?q=lat,lng
      const qMatch = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        lat = parseFloat(qMatch[1]);
        lng = parseFloat(qMatch[2]);
      }
      
      // Format 2: https://www.google.com/maps/@lat,lng
      const mapsMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (mapsMatch) {
        lat = parseFloat(mapsMatch[1]);
        lng = parseFloat(mapsMatch[2]);
      }
      
      // Format 3: https://www.google.com/maps/place/.../@lat,lng
      const placeMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (placeMatch) {
        lat = parseFloat(placeMatch[1]);
        lng = parseFloat(placeMatch[2]);
      }
      
      // Format 4: Decimal coordinates in the URL
      const coordMatch = link.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
      if (coordMatch) {
        lat = parseFloat(coordMatch[1]);
        lng = parseFloat(coordMatch[2]);
      }
      
      if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting coordinates:', error);
      return null;
    }
  }

  onMapLinkChange() {
    const link = this.bookingForm.get('mapLink')?.value;
    
    if (!link || link.trim() === '') {
      return;
    }
    
    const coordinates = this.extractCoordinatesFromMapLink(link);
    
    if (coordinates) {
      this.bookingForm.patchValue({
        latitude: coordinates.lat,
        longitude: coordinates.lng
      });
      
      // Get address from coordinates
      this.reverseGeocode(coordinates.lat, coordinates.lng);
      
      // Show success message
      this.snackBar.open('Location extracted from Google Maps link!', 'Close', {
        duration: 3000
      });
    } else {
      this.snackBar.open('Could not extract location from the link. Please check the format.', 'Close', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  startLocationTracking() {
    if (this.watchId !== null) return;
    
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update location in form
          this.bookingForm.patchValue({
            latitude: latitude,
            longitude: longitude
          });

          // Update user location object
          if (this.userLocation) {
            this.userLocation.lat = latitude;
            this.userLocation.lng = longitude;
          }
        },
        (error) => {
          console.warn('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 10000
        }
      );
    }
  }

  stopLocationTracking() {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;



      
    }
  }

  handleLocationError(error: GeolocationPositionError) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.locationError = 'Location access was denied. Please enable location services in your browser settings.';
        this.locationPermission = 'denied';
        break;
      case error.POSITION_UNAVAILABLE:
        this.locationError = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        this.locationError = 'Location request timed out. Please try again.';
        break;
      default:
        this.locationError = 'An unknown error occurred while getting location.';
        break;
    }
  }

  onUseCurrentLocation() {
    this.getUserLocation();
  }

  onManualAddress() {
    this.stopLocationTracking();
    this.userLocation = null;
    this.bookingForm.patchValue({
      latitude: '',
      longitude: '',
      fullAddress: ''
    });
  }

  selectService(service: string) {
    this.selectedService = service;
    this.bookingForm.patchValue({ serviceType: service });
    const svc = this.services.find(s => s.id === service || s.name === service);
    this.selectedServicePrice = svc?.price ?? null;
  }

  submit() {
    if (this.bookingForm.valid) {
      // Ensure address is within service area (Bhubaneswar or Cuttack)
      const cityVal = this.bookingForm.get('city')?.value || '';
      const fullVal = this.bookingForm.get('fullAddress')?.value || '';
      if (!this.checkServiceable(cityVal, fullVal)) {
        this.snackBar.open('Address not serviceable. We currently only serve Bhubaneswar and Cuttack.', 'Close', {
          duration: 6000,
          panelClass: ['warning-snackbar']
        });
        return;
      }
      // Format date to dd/mm/yyyy
      const rawDate = this.bookingForm.get('serviceDate')?.value;
      let formattedDate = '';
      
      if (rawDate) {
        const date = new Date(rawDate);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        formattedDate = `${dd}/${mm}/${yyyy}`;
      }

      // Build full address
      const house = this.bookingForm.get('house')?.value;
      const area = this.bookingForm.get('area')?.value;
      const city = this.bookingForm.get('city')?.value;
      const pincode = this.bookingForm.get('pincode')?.value;
      const landmark = this.bookingForm.get('landmark')?.value;
      const mapLink = this.bookingForm.get('mapLink')?.value;
      
      const addressParts = [house, area, city, landmark].filter(Boolean);
      const fullAddress = addressParts.join(', ') + (pincode ? ` - ${pincode}` : '');
      
      const bookingData: any = {
        name: this.bookingForm.get('fullName')?.value,
        email: this.bookingForm.get('email')?.value,
        phone: this.bookingForm.get('phone')?.value,
        service: this.bookingForm.get('serviceType')?.value,
        date: formattedDate,
        message: this.bookingForm.get('details')?.value,
        timeSlot: this.bookingForm.get('timeSlot')?.value,
        address: fullAddress,
        latitude: this.bookingForm.get('latitude')?.value || null,
        longitude: this.bookingForm.get('longitude')?.value || null,
        // combine lat/long into a single field expected by backend (format: "lat,lon")
        latLong: (this.bookingForm.get('latitude')?.value && this.bookingForm.get('longitude')?.value)
          ? `${this.bookingForm.get('latitude')?.value},${this.bookingForm.get('longitude')?.value}`
          : null,
        mapLink: mapLink || null,
        status: 'PENDING',
        price: this.selectedServicePrice ?? undefined,
        totalBookings: 1
      };

      // Call the booking service
      this.isSubmitting = true;
      this.bookingService.addBooking(bookingData).subscribe({
        next: (response: any) => {
          const bookingId = response.id || response.bookingId;
          const bookingRef = this.generateBookingRef(bookingId);
          
          this.snackBar.open(
            `Booking submitted successfully! Reference: ${bookingRef}`,
            'Close',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );

          // Reset form
          this.bookingForm.reset({});
          this.selectedService = null;
          this.stopLocationTracking();
          this.userLocation = null;
          this.selectedServicePrice = null;
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Failed to submit booking', err);
          if (err && err.status === 409) {
            // 409 Conflict: Customer already has an active booking
            const existingBooking = err.error;
            const refNum = existingBooking?.reference || 'N/A';
            this.snackBar.open(
              `You already have an active booking (Reference: ${refNum}). Please complete or cancel it first.`, 
              'Close', 
              { 
                duration: 6000, 
                panelClass: ['warning-snackbar'] 
              }
            );
          } else {
            this.snackBar.open('Failed to submit booking. Please try again.', 'Close', { 
              duration: 4000, 
              panelClass: ['error-snackbar'] 
            });
          }
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.get(key)?.markAsTouched();
      });
    }
  }

  generateBookingRef(bookingId?: number | string): string {
    const year = new Date().getFullYear();
    let num = 0;
    if (bookingId !== undefined && bookingId !== null) {
      const parsed = Number(bookingId);
      if (!isNaN(parsed)) {
        num = Math.max(0, Math.floor(parsed));
      }
    }
      const serial = String(num); // no zero-padding: e.g. 38 -> "38"
    return `HOMY${year}${serial}`;
  }

  /**
   * Check if the detected city/address is within service area.
   * Allowed cities: Bhubaneswar, BBSR, Cuttack (case-insensitive)
   */
  private checkServiceable(city: string, fullAddress?: string): boolean {
    if (!city && !fullAddress) return false;
    const c = (city || '').toString().toLowerCase();
    const f = (fullAddress || '').toString().toLowerCase();
    const allowed = [ 'khorda','bhubaneswar', 'bbsr', 'cuttack'];
    for (const a of allowed) {
      if (c.includes(a) || f.includes(a)) return true;
    }
    return false;
  }
}