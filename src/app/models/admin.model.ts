export type AdminRole = 'admin' | 'manager' | 'staff';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  profileImage?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalCustomers: number;
  todaysBookings: number;
  monthlyRevenue: number;
}
