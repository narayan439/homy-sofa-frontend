import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AddressDisplayComponent } from './components/address-display/address-display.component';
import { MaterialModule } from './material/material/material.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    AddressDisplayComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    AddressDisplayComponent,
    MaterialModule
  ]
})
export class SharedUiModule { }
