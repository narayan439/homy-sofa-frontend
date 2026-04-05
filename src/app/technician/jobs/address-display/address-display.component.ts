import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-address-display',
  templateUrl: './address-display.component.html',
  styleUrls: ['./address-display.component.css']
})
export class AddressDisplayComponent {
  @Input() booking: any;

  constructor(private snackBar: MatSnackBar) {}

  getAddress(): string {
    if (!this.booking) return 'Address not available';

    // Try each possible address field in order of preference
    const addressFields = [
      this.booking.address,
      this.booking.specialAddress,
      this.booking.special_address,
      this.booking.addressText,
      this.booking.address_text,
      this.booking.fullAddress,
      this.booking.full_address
    ];

    // Find first non-empty address
    for (const field of addressFields) {
      if (field && String(field).trim() && field !== 'No address' && field !== 'Address not available') {
        return String(field).trim();
      }
    }

    // Fallback: reconstruct from parts
    const parts: string[] = [];
    if (this.booking.house) parts.push(String(this.booking.house).trim());
    if (this.booking.area) parts.push(String(this.booking.area).trim());
    if (this.booking.city) parts.push(String(this.booking.city).trim());
    if (this.booking.landmark) parts.push(String(this.booking.landmark).trim());
    if (this.booking.pincode) parts.push(String(this.booking.pincode).trim());

    if (parts.length > 0) {
      return parts.filter(Boolean).join(', ');
    }

    return 'Address not available';
  }

  viewAddress() {
    const addr = this.getAddress();
    console.log('AddressDisplay.viewAddress() called with address:', addr);
    if (addr && addr !== 'Address not available') {
      this.snackBar.open(`📍 ${addr}`, 'Close', {
        duration: 6000,
        panelClass: ['address-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } else {
      this.snackBar.open('📍 No address available', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  hasCoordinates(): boolean {
    if (!this.booking) return false;
    const latLong = this.booking.latLong || this.booking.lat_long;
    if (!latLong) return false;
    return String(latLong).trim() !== '' && String(latLong).trim() !== 'null';
  }

  openMap() {
    if (!this.hasCoordinates()) return;
    
    const latLong = this.booking.latLong || this.booking.lat_long;
    console.log('AddressDisplay.openMap() called with latLong:', latLong);
    
    // Parse lat,long format (expects "lat,long")
    const coords = String(latLong).trim().split(',').map((c: string) => c.trim());
    if (coords.length === 2 && coords[0] && coords[1]) {
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(mapsUrl, '_blank');
        console.log('Opening Google Maps:', mapsUrl);
      }
    }
  }
}

