export type BookingStatus = 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  specialInstructions: any;
  instructions: any;
  paymentStatus: string;
  totalBookings: number;
  id?: number | string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string; // Format: dd/mm/yyyy
  message?: string;
  status: BookingStatus;
  timeSlot?: string;
  bookingDate?: string; // When the booking was created
  completionDate?: string; // When the booking was completed
  totalAmount?: number;
  price?: number;
  extraAmount?: number; // Additional service amount
  notes?: string;
  adminNotes?: string; // Admin's notes about the booking
  customerId?: number | string;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
  address?: string;
  addressId?: number; // Reference to UserAddress selected during booking
  latitude?: number; // Latitude of delivery address
  longitude?: number; // Longitude of delivery address
  latLong?: string; // "lat,lon"
  additionalServiceName?: string;
  additionalServicePrice?: number;
  additionalServicesJson?: string; // JSON array of multiple services
}

export interface BookingFilter {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  service?: string;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  assignedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageValue: number;
}