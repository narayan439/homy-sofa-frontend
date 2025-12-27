import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query('.service-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger('100ms', [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('500ms 300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('servicesSection') servicesSection!: ElementRef;
  @ViewChild('whyUsSection') whyUsSection!: ElementRef;
  @ViewChild('ctaSection') ctaSection!: ElementRef;

  slides = [
    {
      image: '/assets/images/renovation.jpg',
      title: 'Professional Sofa Repair & Cleaning',
      description: 'Sofa Cleaning • Sofa Repair • Sofa Renovation • Sofa Stitching',
      buttonText: 'Book Service Now',
      gradient: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))'
    },
    {
      image: '/assets/images/cleaning.jpg',
      title: 'Expert Sofa Cleaning Services',
      description: 'Deep cleaning with eco-friendly products that protect your fabric',
      buttonText: 'Book Cleaning',
      gradient: 'linear-gradient(rgba(26, 35, 126, 0.7), rgba(48, 79, 254, 0.5))'
    },
    {
      image: '/assets/images/repair.jpg',
      title: 'Quality Sofa Repair Services',
      description: 'Repair broken frames, springs & cushions with expert craftsmanship',
      buttonText: 'Book Repair',
      gradient: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))'
    }
  ];

  currentSlide = 0;
  private slideInterval: any;
  private observer!: IntersectionObserver;
  
  // Animation states
  servicesInView = false;
  whyUsInView = false;
  ctaInView = false;

  ngOnInit() {
    this.startAutoSlide();
    this.setupIntersectionObserver();
  }

//   scrollToServices() {
//   const servicesSection = document.querySelector('.services-section');
//   if (servicesSection) {
//     servicesSection.scrollIntoView({ 
//       behavior: 'smooth',
//       block: 'start'
//     });
//   }
// }

  ngAfterViewInit() {
    this.observeElements();
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000); // Increased to 6 seconds for better viewing
  }


  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.resetAutoSlide();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.resetAutoSlide();
  }

  resetAutoSlide() {
    clearInterval(this.slideInterval);
    this.startAutoSlide();
  }

  // Intersection Observer for scroll animations
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          if (target.classList.contains('services-section')) {
            this.servicesInView = true;
          } else if (target.classList.contains('why-us-section')) {
            this.whyUsInView = true;
          } else if (target.classList.contains('cta-section')) {
            this.ctaInView = true;
          }
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });
  }

  observeElements() {
    if (this.servicesSection) {
      this.observer.observe(this.servicesSection.nativeElement);
    }
    if (this.whyUsSection) {
      this.observer.observe(this.whyUsSection.nativeElement);
    }
    if (this.ctaSection) {
      this.observer.observe(this.ctaSection.nativeElement);
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    // This triggers Angular change detection for scroll-based animations
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}