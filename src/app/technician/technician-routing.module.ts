import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TechnicianLoginComponent } from './login/technician-login.component';
import { TechnicianDashboardComponent } from './dashboard/technician-dashboard.component';
import { TechnicianJobsComponent } from './jobs/technician-jobs.component';
import { TechnicianProfileComponent } from './profile/technician-profile.component';
import { TechnicianHistoryComponent } from './history/technician-history.component';
import { TechnicianCompletedComponent } from './completed/technician-completed.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { TechnicianDashboardLayoutComponent } from './dashboard-layout/technician-dashboard-layout.component';
import { TechnicianGuard } from '../core/guards/technician.guard';
import { TechnicianNoAuthGuard } from '../core/guards/technician-no-auth.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: TechnicianLoginComponent, canActivate: [TechnicianNoAuthGuard] },
  {
    path: '',
    component: TechnicianDashboardLayoutComponent,
    canActivate: [TechnicianGuard],
    children: [
      { path: 'dashboard', component: TechnicianDashboardComponent },
      { path: 'jobs', component: TechnicianJobsComponent },
      { path: 'profile', component: TechnicianProfileComponent },
      { path: 'history', component: TechnicianHistoryComponent },
      { path: 'completed', component: TechnicianCompletedComponent },
      { path: 'job-details/:id', component: JobDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TechnicianRoutingModule {}
