import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Update the import path if the actual location is different; for example:
import { MaterialModule } from '../shared/material/material/material.module';
import { UserRoutingModule, userRoutingComponents } from './user-routing.module';

@NgModule({
  declarations: [
    ...userRoutingComponents
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    UserRoutingModule
  ]
})
export class UserModule { }
