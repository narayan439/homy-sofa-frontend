import { Component, OnInit } from '@angular/core';
import { ServiceService as BackendService, Service as Svc } from '../../core/services/service.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  services: Svc[] = [];

  constructor(private backend: BackendService) { }

  ngOnInit(): void {
    this.backend.services$.subscribe(list => {
      // Filter to only active services
      this.services = (list || []).filter(s => s.isActive !== false);
    });
    this.backend.loadServices();
  }

  imageSrc(path?: string | null): string {
    if (!path) return '';
    const p = path.trim();
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    return p.startsWith('/') ? p : '/' + p;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}