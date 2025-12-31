export interface Service {
  id?: string;
  name: string;
  description: string;
  price?: number | null;
  icon?: string;
  image?: string;
  imageUrl?: string;
  imagePath?: string;
  features?: string[];
  duration?: number; // in minutes
  category?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface ServiceFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}
