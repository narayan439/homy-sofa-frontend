import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './login/login.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { ManageBookingsComponent } from './manage-bookings/manage-bookings.component';
import { ManageCustomersComponent } from './manage-customers/manage-customers.component';
import { ManageServicesComponent } from './manage-services/manage-services.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminGuard } from '../core/guards/admin.guard';

// Export all components for module
export const adminRoutingComponents = [
  AdminLoginComponent,
  DashboardLayoutComponent,
  DashboardHomeComponent,
  ManageBookingsComponent,
  // Removed student, teacher, subject, recheck, add/edit, marks, profile components
];

const routes: Routes = [
  { 
    path: 'login', 
    component: AdminLoginComponent 
  },
  {
    path: '',
    component: DashboardLayoutComponent, // This is the layout wrapper
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        component: DashboardHomeComponent 
      },
      { 
        path: 'manage-bookings', 
        component: ManageBookingsComponent 
      },
      {
        path: 'manage-customers',
        component: ManageCustomersComponent
      },
      {
        path: 'manage-services',
        component: ManageServicesComponent

      },
      {
        path: 'settings',
        component: SettingsComponent

      },
     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }