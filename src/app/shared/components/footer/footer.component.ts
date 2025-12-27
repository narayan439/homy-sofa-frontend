import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  newsletterEmail = '';
  showBackToTop = false;
  currentYear = new Date().getFullYear();

  // Social media links
  // socialLinks = {
  //   facebook: 'https://facebook.com/homysofa',
  //   instagram: 'https://instagram.com/homysofa',
  //   twitter: 'https://twitter.com/homysofa',
  //   whatsapp: 'https://wa.me/919876543210'
  // };

  ngOnInit() {
    // Initialize current year
    this.currentYear = new Date().getFullYear();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show back to top button when scrolled down
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  subscribeNewsletter() {
    if (this.newsletterEmail && this.validateEmail(this.newsletterEmail)) {
      // In a real app, you would call a service here
      console.log('Newsletter subscription:', this.newsletterEmail);
      
      // Show success message (you can use MatSnackBar here)
      alert(`Thank you for subscribing! We've sent a confirmation to ${this.newsletterEmail}`);
      
      // Reset form
      this.newsletterEmail = '';
    } else {
      alert('Please enter a valid email address');
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Smooth scroll to sections
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}