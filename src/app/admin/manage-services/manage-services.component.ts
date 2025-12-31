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
  isDragOver = false;

  services: Service[] = [];

  newService: Service = {
    id: '',
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
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
        imageUrl: s.imageUrl || (s as any).imagePath || '',
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

  onImageUrlInput(event: any): void {
    const url = event.target.value;
    if (url && this.isValidImageUrl(url)) {
      // Clear file upload if URL is entered
      this.selectedImageFile = null;
      this.previewDataUrl = null;
    }
  }

  onImageSelected(event?: Event): void {
    const input = event?.target as HTMLInputElement | undefined;
    if (input && input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
      
      // Clear URL input when file is selected
      this.newService.imageUrl = '';
      
      // Preview image locally
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewDataUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedImageFile);

      // Upload to backend
      this.isUploading = true;
      if (this.selectedImageFile) {
        this.serviceService.uploadServiceImage(this.selectedImageFile).subscribe({
          next: (url: string) => {
            this.newService.imageUrl = url;
            this.isUploading = false;
            this.snack('Image uploaded successfully');
          },
          error: (err: any) => {
            console.error('Image upload failed', err);
            this.isUploading = false;
            this.snack('Failed to upload image');
            this.newService.imageUrl = '';
          }
        });
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        // Create a fake change event
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const input = document.createElement('input');
        input.type = 'file';
        input.files = dataTransfer.files;
        
        this.onImageSelected({ target: input } as any);
      } else {
        this.snack('Please drop only image files');
      }
    }
  }

  clearImage(): void {
    this.newService.imageUrl = '';
    this.selectedImageFile = null;
    this.previewDataUrl = null;
  }

  getSafeImageUrl(url: string): string {
    if (!url) return '';
    
    // If it's already a valid URL, return as is
    if (this.isValidImageUrl(url)) {
      return url;
    }
    
    // If it's a data URL, return as is
    if (url.startsWith('data:')) {
      return url;
    }
    
    // For relative paths, add base URL
    return url.startsWith('/') ? url : `/${url}`;
  }

  isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    // Check for common image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const urlLower = url.toLowerCase();
    
    // Check if it's a data URL
    if (url.startsWith('data:image/')) {
      return true;
    }
    
    // Check if it's a valid URL with image extension
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      return imageExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      // If not a valid URL, check if it's a relative path with image extension
      return imageExtensions.some(ext => urlLower.endsWith(ext));
    }
  }

  saveService(): void {
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

  editService(service: Service): void {
    this.newService = { ...service };
    this.isEdit = true;
    // Scroll to form
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  startEditPrice(service: Service): void {
    this.editingPriceId = service.id || null;
    this.editingPriceValue = service.price ?? 0;
  }

  cancelEditPrice(): void {
    this.editingPriceId = null;
    this.editingPriceValue = 0;
  }

  savePrice(service: Service): void {
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

  deleteService(id: string | undefined): void {
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

  resetForm(): void {
    this.newService = {
      id: '',
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      isActive: true
    } as any;
    this.selectedImageFile = null;
    this.previewDataUrl = null;
    this.isUploading = false;
    this.isEdit = false;
    this.isDragOver = false;
  }

  handleImageError(service: Service): void {
    console.warn('Failed to load image for service:', service.name);
    service.imageUrl = '';
  }

  onImageLoadError(): void {
    console.warn('Failed to load image from URL:', this.newService.imageUrl);
    this.newService.imageUrl = '';
    this.snack('Failed to load image. Please check the URL or upload a new image.');
  }

  getActiveServicesCount(): number {
    return this.services.filter(service => service.isActive).length;
  }

  getAveragePrice(): string {
    if (this.services.length === 0) return '₹0';
    const total = this.services.reduce((sum, service) => sum + (service.price || 0), 0);
    const average = Math.round(total / this.services.length);
    return `₹${average}`;
  }

  private snack(msg: string): void {
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }
}