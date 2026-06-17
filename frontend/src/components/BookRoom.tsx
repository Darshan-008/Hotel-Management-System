import React, { useState, useEffect } from 'react';
import { CalendarPlus, Calendar, User, Mail, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Room, Booking, UserRole } from '../types';
import { PaymentModal } from './PaymentModal';

interface BookRoomProps {
  rooms: Room[];
  bookings: Booking[];
  currentUser: { name: string; email: string; role: UserRole } | null;
  preselectedRoomId?: string;
  clearPreselectedRoomId?: () => void;
  onBookRoom: (bookingData: {
    guestName: string;
    email: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
  }) => Promise<boolean>;
  onNavigateToRooms: () => void;
}

export const BookRoom: React.FC<BookRoomProps> = ({
  rooms,
  bookings,
  currentUser,
  preselectedRoomId,
  clearPreselectedRoomId,
  onBookRoom,
  onNavigateToRooms,
}) => {
  // Form fields
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Sync user details when guest is logged in
  useEffect(() => {
    if (currentUser && currentUser.role === 'guest') {
      setGuestName(currentUser.name);
      setEmail(currentUser.email);
    } else {
      setGuestName('');
      setEmail('');
    }
  }, [currentUser]);

  // Preselect room if passed via redirect routing
  useEffect(() => {
    if (preselectedRoomId) {
      setRoomId(preselectedRoomId);
      clearPreselectedRoomId?.();
    }
  }, [preselectedRoomId, clearPreselectedRoomId]);

  // Validations & UI feedback
  const [errors, setErrors] = useState<{ guestName?: string; email?: string; checkIn?: string; checkOut?: string; general?: string }>({});
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Get selected room object
  const selectedRoom = rooms.find((r) => r.id === roomId);

  // Calculate live booking totals
  const [nights, setNights] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Set default check-in date as today's date format (YYYY-MM-DD)
  const getTodayString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const todayStr = getTodayString();

  // Handle live calculation and real-time double booking check
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setNights(0);
      setTotalCost(0);
      setDateWarning(null);
      return;
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    inDate.setHours(0, 0, 0, 0);
    outDate.setHours(0, 0, 0, 0);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      setNights(0);
      setTotalCost(0);
      setDateWarning(null);
      return;
    }

    // Ensure checkout is after check-in
    if (outDate <= inDate) {
      setNights(0);
      setTotalCost(0);
      setDateWarning('Check-out date must be after check-in date');
      return;
    }

    // Calculate nights
    const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
    const calculatedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNights(calculatedNights);

    if (selectedRoom) {
      setTotalCost(calculatedNights * selectedRoom.price);
    } else {
      setTotalCost(0);
    }

    // Live overlap checking
    if (roomId) {
      const isOverlapping = bookings.some((booking) => {
        if (booking.roomId !== roomId) return false;
        
        const bIn = new Date(booking.checkIn);
        const bOut = new Date(booking.checkOut);
        bIn.setHours(0, 0, 0, 0);
        bOut.setHours(0, 0, 0, 0);

        // Overlap query logic: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
        return inDate < bOut && outDate > bIn;
      });

      if (isOverlapping) {
        setDateWarning('Room is already booked for the selected dates.');
      } else {
        setDateWarning(null);
      }
    } else {
      setDateWarning(null);
    }
  }, [checkIn, checkOut, roomId, selectedRoom, bookings]);

  // Form Validation
  const validateForm = () => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    if (!guestName.trim()) {
      tempErrors.guestName = 'Guest name is required';
      isValid = false;
    }

    if (!email.trim()) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Invalid email address';
      isValid = false;
    }

    if (!roomId) {
      tempErrors.general = 'Please select a room';
      isValid = false;
    }

    if (!checkIn) {
      tempErrors.checkIn = 'Check-in date is required';
      isValid = false;
    } else if (new Date(checkIn) < new Date(todayStr)) {
      tempErrors.checkIn = 'Check-in date cannot be in the past';
      isValid = false;
    }

    if (!checkOut) {
      tempErrors.checkOut = 'Check-out date is required';
      isValid = false;
    } else if (checkIn && new Date(checkOut) <= new Date(checkIn)) {
      tempErrors.checkOut = 'Check-out date must be after check-in';
      isValid = false;
    }

    if (dateWarning && dateWarning.includes('already booked')) {
      tempErrors.general = 'Room is already booked for the selected dates.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (): Promise<boolean> => {
    const success = await onBookRoom({
      guestName: guestName.trim(),
      email: email.trim(),
      roomId,
      checkIn,
      checkOut,
    });

    if (success) {
      // Clear form (retain guest details if guest is booking for themselves)
      if (currentUser?.role !== 'guest') {
        setGuestName('');
        setEmail('');
      }
      setRoomId('');
      setCheckIn('');
      setCheckOut('');
      setErrors({});
    }
    return success;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-slide-in">
      {/* Left Columns (3): Booking Form */}
      <div className="lg:col-span-3 bg-[#121824] border border-slate-800/60 rounded-xl p-6 shadow-md">
        <div className="border-b border-slate-800/80 pb-3 mb-6">
          <h3 className="text-xl font-serif text-[#f4ebd5]">Reserve a Room</h3>
          <p className="text-xs text-slate-400 mt-1">Submit guest registration details and block booking dates</p>
        </div>

        {rooms.length === 0 ? (
          <div className="py-8 text-center space-y-4">
            <Info className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">Please add rooms to the system before making a reservation.</p>
            <button
              onClick={onNavigateToRooms}
              className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-slate-900 rounded-lg text-xs font-semibold transition-colors"
            >
              Go to Room Management
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Guest Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Guest Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  readOnly={currentUser?.role === 'guest'}
                  className={`w-full bg-[#1b2230] border rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                    errors.guestName ? 'border-rose-500/50' : 'border-slate-800'
                  } ${currentUser?.role === 'guest' ? 'opacity-75 cursor-not-allowed bg-slate-800/35' : ''}`}
                />
              </div>
              {errors.guestName && (
                <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.guestName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={currentUser?.role === 'guest'}
                  className={`w-full bg-[#1b2230] border rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                    errors.email ? 'border-rose-500/50' : 'border-slate-800'
                  } ${currentUser?.role === 'guest' ? 'opacity-75 cursor-not-allowed bg-slate-800/35' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.email}
                </p>
              )}
            </div>

            {/* Room Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Room
              </label>
              <div className="relative">
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-[#1b2230] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">-- Choose a room --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} - {room.roomType} (₹{room.price}/night)
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Check-In Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className={`w-full bg-[#1b2230] border rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.checkIn ? 'border-rose-500/50' : 'border-slate-800'
                    }`}
                  />
                </div>
                {errors.checkIn && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {errors.checkIn}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Check-Out Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={checkIn || todayStr}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={`w-full bg-[#1b2230] border rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.checkOut ? 'border-rose-500/50' : 'border-slate-800'
                    }`}
                  />
                </div>
                {errors.checkOut && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {errors.checkOut}
                  </p>
                )}
              </div>
            </div>

            {/* Date overlap or custom date error warnings */}
            {dateWarning && (
              <div
                className={`p-3.5 rounded-lg border text-sm flex items-start gap-3 ${
                  dateWarning.includes('already booked')
                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    : 'bg-yellow-950/40 border-yellow-500/30 text-yellow-300'
                }`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Booking Blocked</p>
                  <p className="text-xs opacity-90 mt-0.5">{dateWarning}</p>
                </div>
              </div>
            )}

            {errors.general && (
              <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPaymentModalOpen || !!dateWarning}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold-600 hover:bg-gold-500 disabled:bg-[#1f2638] disabled:text-slate-600 active:bg-gold-700 text-slate-900 font-semibold rounded-lg shadow-md transition-all text-sm mt-4 cursor-pointer disabled:cursor-not-allowed"
            >
              <CalendarPlus className="w-4 h-4" /> Book Room
            </button>
          </form>
        )}
      </div>

      {/* Right Columns (2): Booking Summary Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-5 shadow-md flex flex-col justify-between h-fit sticky top-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3 mb-4">
            Reservation Summary
          </h3>

          {!selectedRoom ? (
            <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-slate-700" />
              <p>Select a room and reservation dates to display live billing totals.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Room details summary */}
              <div className="p-3 bg-[#1b2230] rounded-lg border border-slate-800/80">
                <p className="text-2xs uppercase tracking-wider font-semibold text-gold-400">Selected Accommodation</p>
                <h4 className="text-base font-medium text-slate-200 mt-1">Room {selectedRoom.roomNumber}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{selectedRoom.roomType} Room</p>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Price per night</span>
                  <span className="text-slate-200 font-medium">₹{selectedRoom.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total duration</span>
                  <span className="text-slate-200 font-medium">
                    {nights > 0 ? `${nights} ${nights === 1 ? 'Night' : 'Nights'}` : '--'}
                  </span>
                </div>
                {checkIn && checkOut && (
                  <div className="p-2.5 bg-slate-800/30 rounded border border-slate-800/40 text-2xs space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Check-In:</span>
                      <span className="text-slate-300">{new Date(checkIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-Out:</span>
                      <span className="text-slate-300">{new Date(checkOut).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total display */}
              <div className="border-t border-slate-800/80 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Estimated Total</span>
                <span className="text-2xl font-serif font-medium text-gold-400">
                  ₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Security info */}
              <div className="border-t border-slate-800/80 pt-4 text-3xs text-slate-500 uppercase tracking-widest leading-relaxed flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold-500/40 flex-shrink-0" />
                <span>Double-Booking Protection Active</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handlePaymentConfirm}
        amount={totalCost}
        roomNumber={selectedRoom?.roomNumber || ''}
        roomType={selectedRoom?.roomType || ''}
        nights={nights}
        guestName={guestName}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    </div>
  );
};
