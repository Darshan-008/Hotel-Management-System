import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.booking.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding default users...');
  const adminPassword = await bcrypt.hash('adminpassword', 10);
  const guestPassword = await bcrypt.hash('guestpassword', 10);

  await prisma.user.create({
    data: {
      name: 'Admin Manager',
      email: 'admin@grandpalace.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Alice Guest',
      email: 'alice@example.com',
      password: guestPassword,
      role: 'guest',
    },
  });

  console.log('Seeding rooms...');
  const rooms = await Promise.all([
    prisma.room.create({
      data: { roomNumber: '101', roomType: 'Standard', price: 80.0 },
    }),
    prisma.room.create({
      data: { roomNumber: '102', roomType: 'Standard', price: 85.0 },
    }),
    prisma.room.create({
      data: { roomNumber: '103', roomType: 'Standard', price: 90.0 },
    }),
    prisma.room.create({
      data: { roomNumber: '201', roomType: 'Deluxe', price: 150.0 },
    }),
    prisma.room.create({
      data: { roomNumber: '202', roomType: 'Deluxe', price: 165.0 },
    }),
    prisma.room.create({
      data: { roomNumber: '301', roomType: 'Suite', price: 300.0 },
    }),
    prisma.room.create({
      data: { roomNumber: '302', roomType: 'Suite', price: 380.0 },
    }),
  ]);

  console.log('Seeding bookings...');
  const today = new Date();
  
  // Booking 1: check-in in 2 days, stay 4 days (for room 101)
  const b1CheckIn = new Date(today);
  b1CheckIn.setDate(today.getDate() + 2);
  b1CheckIn.setHours(12, 0, 0, 0);

  const b1CheckOut = new Date(today);
  b1CheckOut.setDate(today.getDate() + 6);
  b1CheckOut.setHours(11, 0, 0, 0);

  // Booking 2: check-in in 5 days, stay 3 days (for room 201)
  const b2CheckIn = new Date(today);
  b2CheckIn.setDate(today.getDate() + 5);
  b2CheckIn.setHours(12, 0, 0, 0);

  const b2CheckOut = new Date(today);
  b2CheckOut.setDate(today.getDate() + 8);
  b2CheckOut.setHours(11, 0, 0, 0);

  await prisma.booking.create({
    data: {
      guestName: 'Alice Guest', // Matches our seeded guest user
      email: 'alice@example.com',
      roomId: rooms[0].id, // Room 101
      checkIn: b1CheckIn,
      checkOut: b1CheckOut,
    },
  });

  await prisma.booking.create({
    data: {
      guestName: 'Bob Smith',
      email: 'bob@example.com',
      roomId: rooms[3].id, // Room 201
      checkIn: b2CheckIn,
      checkOut: b2CheckOut,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
