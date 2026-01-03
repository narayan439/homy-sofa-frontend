import { Component, OnInit } from '@angular/core';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  serviceSteps: Feature[] = [];
  whyChooseUs: Feature[] = [];
  ourServices: string[] = [];
  
  ngOnInit(): void {
    this.loadServiceSteps();
    this.loadWhyChooseUs();
    this.loadOurServices();
  }

  loadServiceSteps(): void {
    this.serviceSteps = [
      {
        icon: 'calendar_today',
        title: 'Book Online',
        description: 'Book your service easily through our website or mobile app'
      },
      {
        icon: 'phone_in_talk',
        title: 'Confirmation Call',
        description: 'Our team contacts you to confirm visit time and details'
      },
      {
        icon: 'home_repair_service',
        title: 'Home Inspection',
        description: 'Technician visits for detailed inspection and assessment'
      },
      {
        icon: 'price_check',
        title: 'Transparent Pricing',
        description: 'Clear cost explanation before starting any work'
      },
      {
        icon: 'thumb_up',
        title: 'Your Approval',
        description: 'Work begins only after your complete satisfaction'
      },
      {
        icon: 'done_all',
        title: 'Quality Service',
        description: 'Professional service with complete transparency'
      }
    ];
  }

  loadWhyChooseUs(): void {
    this.whyChooseUs = [
      {
        icon: 'engineering',
        title: 'Skilled Technicians',
        description: 'Experienced and professionally trained service experts'
      },
      {
        icon: 'door_front',
        title: 'Doorstep Service',
        description: 'Convenient service at your home or office'
      },
      {
        icon: 'receipt',
        title: 'Transparent Pricing',
        description: 'Clear costs with no hidden charges or surprises'
      },
      {
        icon: 'verified',
        title: 'Quality Guarantee',
        description: '100% satisfaction guarantee on all our services'
      },
      {
        icon: 'location_on',
        title: 'Local Presence',
        description: 'Currently serving Bhubaneswar & Cuttack areas'
      },
      {
        icon: 'support_agent',
        title: 'Customer First',
        description: 'Your satisfaction is our top priority always'
      }
    ];
  }

  loadOurServices(): void {
    this.ourServices = [
      'Sofa Cleaning',
      'Sofa Repair',
      'Sofa Renovation',
      'Sofa Stitching & Upholstery'
    ];
  }
}