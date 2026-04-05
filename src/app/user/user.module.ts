import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Update the import path if the actual location is different; for example:
import { MaterialModule } from '../shared/material/material/material.module';
import { UserRoutingModule, userRoutingComponents } from './user-routing.module';
import { AboutComponent } from './about/about.component';
import { CancelBookingDialogComponent } from './cancel-booking-dialog/cancel-booking-dialog.component';
import { AddServiceDialogComponent } from './add-service-dialog/add-service-dialog.component';
import { ConfirmDeleteDialogComponent } from './edit-profile/edit-profile.component';
import { UserGuard } from '../core/guards/user.guard';

@NgModule({
  declarations: [
    ...userRoutingComponents,
    AboutComponent,
    CancelBookingDialogComponent,
    AddServiceDialogComponent,
    ConfirmDeleteDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    UserRoutingModule
  ],
  providers: [UserGuard]
})
export class UserModule { }
