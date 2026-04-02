import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TechnicianLoginComponent } from './login/technician-login.component';
import { TechnicianDashboardComponent } from './dashboard/technician-dashboard.component';
import { TechnicianJobsComponent } from './jobs/technician-jobs.component';
import { TechnicianGuard } from '../core/guards/technician.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: TechnicianLoginComponent },
  { path: 'dashboard', component: TechnicianDashboardComponent, canActivate: [TechnicianGuard] },
  { path: 'jobs', component: TechnicianJobsComponent, canActivate: [TechnicianGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TechnicianRoutingModule {}
