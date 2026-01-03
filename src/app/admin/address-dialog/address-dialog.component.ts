import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.css']
})
export class AddressDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  openMap() {
    if (this.data && this.data.booking && this.data.booking.latLong) {
      window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(this.data.booking.latLong), '_blank');
      this.dialogRef.close('openMap');
    }
  }

  close() {
    this.dialogRef.close();
  }
}
