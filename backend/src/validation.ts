import { z } from 'zod';

export const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required').trim(),
  roomType: z.enum(['Standard', 'Deluxe', 'Suite'], {
    errorMap: () => ({ message: 'Room type must be Standard, Deluxe, or Suite' }),
  }),
  price: z.number().positive('Price must be a positive number'),
});

export const bookingSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  roomId: z.string().uuid('Invalid Room ID'),
  checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid check-in date',
  }),
  checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid check-out date',
  }),
}).refine((data) => {
  const checkInDate = new Date(data.checkIn);
  const checkOutDate = new Date(data.checkOut);
  return checkOutDate > checkInDate;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['admin', 'guest'], {
    errorMap: () => ({ message: 'Role must be admin or guest' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(1, 'Password is required'),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string().min(5, 'Comment must be at least 5 characters long').max(500, 'Comment cannot exceed 500 characters').trim(),
});
