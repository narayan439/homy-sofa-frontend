import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material/material/material.module';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginComponent } from './login/login.component';
import { ManageServicesComponent } from './manage-services/manage-services.component';
import { ManageBookingsComponent } from './manage-bookings/manage-bookings.component';
import { adminRoutingComponents } from './admin-routing.module';
import { ManageCustomersComponent } from './manage-customers/manage-customers.component';
import { ManagePaymentsComponent } from './manage-payments/manage-payments.component';
import { SettingsComponent } from './settings/settings.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { AddressDialogComponent } from './address-dialog/address-dialog.component';
import { StatusUpdateDialogComponent } from './status-update-dialog/status-update-dialog.component';



@NgModule({
  declarations: [
    ...adminRoutingComponents,
    ManageServicesComponent,
    AddressDialogComponent,
    StatusUpdateDialogComponent,
    ManageCustomersComponent,
    ManagePaymentsComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
