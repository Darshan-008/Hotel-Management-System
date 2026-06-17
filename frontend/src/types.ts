export interface Room {
  id: string;
  roomNumber: string;
  roomType: 'Standard' | 'Deluxe' | 'Suite';
  price: number;
  bookings?: Booking[];
  createdAt?: string;
}

export interface Booking {
  id: string;
  guestName: string;
  email: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  room?: Room;
  createdAt?: string;
}

export type ActiveTab = 'dashboard' | 'rooms' | 'book' | 'history' | 'feedback' | 'staff';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export type UserRole = 'admin' | 'guest';

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}
