import { Component, OnInit } from '@angular/core';
import { Service } from '../../models/service.model';
import { ServiceService } from '../../core/services/service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-services',
  templateUrl: './manage-services.component.html',
  styleUrls: ['./manage-services.component.css']
})
export class ManageServicesComponent implements OnInit {

  selectedImageFile: File | null = null;
  previewDataUrl: string | null = null;
  isUploading = false;

  services: Service[] = [];

  newService: Service = {
    id: '',
    name: '',
    description: '',
    price: 0,
    imagePath: '',
    isActive: true
  } as any;

  isEdit = false;
  editingPriceId: string | null = null;
  editingPriceValue: number = 0;

  constructor(
    private serviceService: ServiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.serviceService.services$.subscribe(svc => {
      this.services = (svc || []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        price: s.price ?? 0,
        imagePath: (s as any).imagePath || '',
        icon: (s as any).icon,
        image: (s as any).image,
        features: (s as any).features,
        duration: (s as any).duration,
        category: (s as any).category,
        isActive: s.isActive ?? true,
        createdAt: (s as any).createdAt,
        updatedAt: (s as any).updatedAt
      } as Service));
    });
    this.serviceService.loadServices();
  }

  onImageSelected(event?: Event) {
    const input = event?.target as HTMLInputElement | undefined;
    if (input && input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
      // Preview image locally immediately
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewDataUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedImageFile);

      // Upload to backend and set imagePath only after upload completes
      this.isUploading = true;
      if (this.selectedImageFile) {
        this.serviceService.uploadServiceImage(this.selectedImageFile).subscribe({
          next: (path: string) => {
            this.newService.imagePath = path;
            this.isUploading = false;
            this.snack('Image uploaded successfully');
          },
          error: (err: any) => {
            console.error('Image upload failed', err);
            this.isUploading = false;
            this.snack('Failed to upload image');
            // keep preview but clear server path
            this.newService.imagePath = '';
          }
        });
      }
    }
  }

  removeImage() {
    this.newService.imagePath = '';
    this.previewDataUrl = null;
    this.selectedImageFile = null;
  }

  saveService() {
    if (this.isEdit && this.newService.id) {
      this.serviceService.updateService(this.newService.id!, this.newService).subscribe({
        next: () => {
          this.snack('Service updated successfully');
          this.resetForm();
        },
        error: (err) => { 
          console.error('Failed to update service', err);
          this.snack('Failed to update service');
          this.resetForm();
        }
      });
      this.isEdit = false;
    } else {
      this.serviceService.createService(this.newService).subscribe({
        next: () => {
          this.snack('Service created successfully');
          this.resetForm();
        },
        error: (err) => { 
          console.error('Failed to create service', err);
          this.snack('Failed to create service');
          this.resetForm();
        }
      });
    }
  }

  editService(service: Service) {
    this.newService = { ...service };
    this.isEdit = true;
    // Scroll to form
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  startEditPrice(service: Service) {
    this.editingPriceId = service.id || null;
    this.editingPriceValue = service.price ?? 0;
  }

  cancelEditPrice() {
    this.editingPriceId = null;
    this.editingPriceValue = 0;
  }

  savePrice(service: Service) {
    if (!service.id) return;
    const updated = { price: this.editingPriceValue } as Partial<Service>;
    this.serviceService.updateService(service.id!, updated).subscribe({
      next: () => {
        this.snack('Price updated successfully');
        this.cancelEditPrice();
      },
      error: (err) => {
        console.error('Failed to update price', err);
        this.snack('Failed to update price');
      }
    });
  }

  private snack(msg: string) {
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  deleteService(id: string | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this service?')) {
      this.serviceService.deleteService(id).subscribe({
        next: () => {
          this.snack('Service deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete service', err);
          this.snack('Failed to delete service');
        }
      });
    }
  }

  resetForm() {
    this.newService = {
      id: '',
      name: '',
      description: '',
      price: 0,
      imagePath: '',
      isActive: true
    } as any;
    this.selectedImageFile = null;
    this.previewDataUrl = null;
    this.isUploading = false;
    this.isEdit = false;
  }

  // Ensure image path is absolute from web root so browser can load it
  imageSrc(path?: string | null): string {
    if (!path) return '';
    const p = path.trim();
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    return p.startsWith('/') ? p : '/' + p;
  }


  // Add these methods to your existing ManageServicesComponent class

getActiveServicesCount(): number {
  return this.services.filter(service => service.isActive).length;
}

getAveragePrice(): string {
  if (this.services.length === 0) return '₹0';
  const total = this.services.reduce((sum, service) => sum + (service.price || 0), 0);
  const average = Math.round(total / this.services.length);
  return `₹${average}`;
}

  onImageLoadError() {
    console.warn('Failed to load image from path:', this.newService.imagePath || this.previewDataUrl);
    // If preview exists, clear preview; otherwise clear saved path
    if (this.previewDataUrl) {
      this.previewDataUrl = null;
    } else {
      this.newService.imagePath = '';
    }
    this.snack('Failed to load image');
  }
}