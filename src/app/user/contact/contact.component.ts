import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService, ContactPayload } from '../../core/services/contact.service';
import { ServiceService, Service } from '../../core/services/service.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  contactForm: FormGroup;
  services: Service[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private contactService: ContactService,
    private serviceService: ServiceService
  ) {
    this.contactForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z ]+$/)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      subject: ['booking', Validators.required],
      message: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(100)
      ]]
    });
  }

  ngOnInit() {
    // Load services to display on contact page
    this.serviceService.services$.subscribe(services => {
      this.services = services || [];
    });
    this.serviceService.loadServices();
  }

  submitForm() {
    if (!this.contactForm.valid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }

    const payload: ContactPayload = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message
    };

    this.contactService.submitContact(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Thank you for your message! We will contact you within 24 hours.', 'Close', { duration: 5000, panelClass: ['success-snackbar'] });
        this.contactForm.reset({ subject: 'booking' });
      },
      error: (err) => {
        console.error('Contact submit error', err);
        this.snackBar.open('Failed to send message. Please try again later.', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  // Social media links
  socialLinks = {
    facebook: 'https://facebook.com/homysofa',
    instagram: 'https://instagram.com/homysofa',
    twitter: 'https://twitter.com/homysofa',
    linkedin: 'https://linkedin.com/company/homysofa'
  };

}