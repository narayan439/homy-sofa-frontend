import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserAddress } from '../../core/services/address.service';

@Component({
  selector: 'app-address-selection-dialog',
  templateUrl: './address-selection-dialog.component.html',
  styleUrls: ['./address-selection-dialog.component.css']
})
export class AddressSelectionDialogComponent {

  selectedAddressId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<AddressSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { addresses: UserAddress[] }
  ) {
    // Pre-select default address
    const defaultAddress = data.addresses.find(a => a.isDefault);
    if (defaultAddress) {
      this.selectedAddressId = defaultAddress.id || null;
    } else if (data.addresses.length > 0) {
      this.selectedAddressId = data.addresses[0].id || null;
    }
  }

  /**
   * Confirm selection
   */
  selectAddress(): void {
    const selected = this.data.addresses.find(a => a.id === this.selectedAddressId);
    if (selected) {
      this.dialogRef.close(selected);
    }
  }

  /**
   * Cancel dialog
   */
  cancel(): void {
    this.dialogRef.close(null);
  }

  /**
   * Get address display text
   */
  getAddressDisplay(address: UserAddress): string {
    const parts = [address.house, address.area, address.city];
    return parts.filter(p => p).join(', ');
  }
}
