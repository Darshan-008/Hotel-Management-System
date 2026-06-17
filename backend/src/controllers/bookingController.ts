import { Request, Response } from 'express';
import prisma from '../db';
import { bookingSchema } from '../validation';

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        room: true,
      },
      orderBy: {
        checkIn: 'desc',
      },
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    // 1. Zod schema validation
    const validatedData = bookingSchema.parse(req.body);

    const checkInDate = new Date(validatedData.checkIn);
    const checkOutDate = new Date(validatedData.checkOut);

    // 2. Prevent booking in the past (only allow today onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Normalize check-in date for comparison (midnight of that day)
    const checkInMidnight = new Date(checkInDate);
    checkInMidnight.setHours(0, 0, 0, 0);

    if (checkInMidnight < today) {
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }

    // 3. Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // 4. Double booking prevention logic:
    // Check if there are overlapping bookings for this room.
    // Overlap formula: (newCheckIn < existingCheckOut) AND (newCheckOut > existingCheckIn)
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        roomId: validatedData.roomId,
        checkIn: {
          lt: checkOutDate,
        },
        checkOut: {
          gt: checkInDate,
        },
      },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        error: 'Room is already booked for the selected dates.',
      });
    }

    // 5. Save booking
    const newBooking = await prisma.booking.create({
      data: {
        guestName: validatedData.guestName,
        email: validatedData.email,
        roomId: validatedData.roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
      },
      include: {
        room: true,
      },
    });

    res.status(201).json(newBooking);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
