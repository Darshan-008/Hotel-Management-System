import { Request, Response } from 'express';
import prisma from '../db';
import { roomSchema } from '../validation';

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        bookings: true,
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    // Parse request body
    const validatedData = roomSchema.parse(req.body);

    // Check if room number is unique
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber: validatedData.roomNumber },
    });

    if (existingRoom) {
      return res.status(400).json({ error: 'Room number must be unique' });
    }

    // Create room
    const newRoom = await prisma.room.create({
      data: validatedData,
    });

    res.status(201).json(newRoom);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = roomSchema.parse(req.body);

    // Check if another room has the same room number
    const duplicateRoom = await prisma.room.findFirst({
      where: {
        roomNumber: validatedData.roomNumber,
        NOT: { id },
      },
    });

    if (duplicateRoom) {
      return res.status(400).json({ error: 'Room number is already in use by another room' });
    }

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: validatedData,
    });

    res.json(updatedRoom);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};
