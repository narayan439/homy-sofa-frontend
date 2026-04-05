import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ServicesComponent } from './services/services.component';
import { BookingComponent } from './booking/booking.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { TrackingComponent } from './tracking/tracking.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UserDashboardComponent } from './dashboard/user-dashboard.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ManageAddressesComponent } from './manage-addresses/manage-addresses.component';
import { UserGuard } from '../core/guards/user.guard';
import { NoAuthGuard } from '../core/guards/no-auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'booking', component: BookingComponent, canActivate: [UserGuard] },
  { path: 'tracking', component: TrackingComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [NoAuthGuard] },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [UserGuard] },
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [UserGuard] },
  { path: 'addresses', component: ManageAddressesComponent, canActivate: [UserGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}

export const userRoutingComponents = [
  HomeComponent,
  ServicesComponent,
  BookingComponent,
  TrackingComponent,
  ContactComponent,
  AboutComponent,
  LoginComponent,
  SignupComponent,
  UserDashboardComponent,
  EditProfileComponent,
  ManageAddressesComponent
];
