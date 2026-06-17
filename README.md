# Grand Palace - Hotel Booking Management Portal

A modern, production-quality Hotel Booking Management System built with a premium, responsive user interface and robust reservation logic. This system is designed like a real-world SaaS dashboard to manage rooms, bookings, occupancy rates, and revenue.

---

## 🌟 Key Features

1. **Dashboard Overview**: KPI cards for Total Rooms, Availability, Bookings, and Revenue with an active circular occupancy rate dial.
2. **Room Management**: Searchable and filterable grid of accommodation cards displaying prices, max capacity, and live status. Includes an integrated "Add Room" configuration form with inputs validation.
3. **Professional Booking Form**: Client reservation forms with live check-out validation, nights count, billing estimates, and real-time frontend/backend booking overlap checks.
4. **Booking History Registry**: Interactive table listing all reservation logs with full sorting (by Guest, Room, or Date), status indicators (Upcoming, Active, Completed), pagination, and a native **Export CSV** feature.
5. **Double-Booking Prevention**: Mathematical checks at database and client levels to guarantee that no room is reserved for conflicting timeframes.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: SQLite (Self-contained, no setup required)
- **ORM**: Prisma ORM
- **Validation**: Zod (backend requests validation)

---

## 🛡️ Double-Booking Prevention Logic

To prevent two bookings from overlapping on the same room, we check for conflicting dates prior to completing any reservation.

An overlap exists if the requested booking interval **[New Check-In, New Check-Out]** intersects with any existing reservation **[Existing Check-In, Existing Check-Out]** for that room. Mathematically, this is true if:

$$\text{New Check-In} < \text{Existing Check-Out} \quad \text{AND} \quad \text{New Check-Out} > \text{Existing Check-In}$$

### Implementation (Prisma SQLite Query)

```typescript
const overlappingBooking = await prisma.booking.findFirst({
  where: {
    roomId: selectedRoomId,
    checkIn: {
      lt: requestedCheckOutDate,
    },
    checkOut: {
      gt: requestedCheckInDate,
    },
  },
});

if (overlappingBooking) {
  throw new Error("Room is already booked for the selected dates.");
}
```

---

## 📁 Directory Structure

```
/hotel-management
  ├── backend/               # Express + Prisma Server
  │     ├── prisma/          # Schema definitions, migrations & seeding scripts
  │     ├── src/
  │     │     ├── controllers/ # Express business logic handlers
  │     │     ├── routes/      # REST API endpoints mapping
  │     │     ├── db.ts        # Prisma Client provider
  │     │     ├── validation.ts# Zod validation schemas
  │     │     └── index.ts     # Express server bootstrap
  │     ├── package.json
  │     └── tsconfig.json
  ├── frontend/              # Vite + React Client
  │     ├── src/
  │     │     ├── components/  # Reusable luxury UI components
  │     │     ├── types.ts     # Shared TypeScript typings
  │     │     ├── App.tsx      # Main application router and state
  │     │     └── index.css    # Tailwind base styles and keyframe animations
  │     ├── package.json
  │     └── tailwind.config.js
  └── README.md
```

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` (packaged with Node)

---

### Step 1: Database Setup & Seeding

Go to the `backend` directory, install server-side dependencies, run Prisma migrations, and seed initial database rooms/reservations:

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not already done)
npm install

# Run database migrations to create SQLite database (dev.db)
npx prisma migrate dev --name init

# Seed mock database rooms and bookings
npm run prisma:seed
```

---

### Step 2: Run the Backend Server

Start the Node.js Express server. It will listen on `http://localhost:5000`:

```bash
# Start backend in development mode (with nodemon reload)
npm run dev
```

---

### Step 3: Run the Frontend Application

Open a new terminal window, navigate to the `frontend` folder, install client-side dependencies, and boot up the Vite development server:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (if not already done)
npm install

# Start the Vite React client
npm run dev
```

Open `http://localhost:5173` in your browser to explore the dashboard.
