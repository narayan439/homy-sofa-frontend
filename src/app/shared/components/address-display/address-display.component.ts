import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-address-display',
  templateUrl: './address-display.component.html',
  styleUrls: ['./address-display.component.css']
})
export class AddressDisplayComponent {
  @Input() booking: any;

  get fullAddress(): string {
    if (!this.booking) return '';
    const address = this.booking.bookingAddress || this.booking.address || {};
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    return parts.join(', ');
  }
}
