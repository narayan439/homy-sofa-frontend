import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicianRoutingModule } from './technician-routing.module';
import { TechnicianLoginComponent } from './login/technician-login.component';
import { TechnicianDashboardComponent } from './dashboard/technician-dashboard.component';
import { TechnicianJobsComponent } from './jobs/technician-jobs.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from "@angular/material/list";
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedUiModule } from '../shared/shared-ui.module';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    TechnicianLoginComponent,
    TechnicianDashboardComponent,
    TechnicianJobsComponent
    
  ],
  imports: [
    CommonModule,
    SharedUiModule,
    TechnicianRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule
]
})
export class TechnicianModule {}
