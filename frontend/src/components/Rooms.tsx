import React, { useState } from 'react';
import { Plus, Search, Bed, IndianRupee, Tag, AlertTriangle, ShieldCheck, Edit, X } from 'lucide-react';
import type { Room, UserRole } from '../types';

interface RoomsProps {
  rooms: Room[];
  onAddRoom: (roomData: { roomNumber: string; roomType: 'Standard' | 'Deluxe' | 'Suite'; price: number }) => Promise<boolean>;
  onEditRoom: (roomId: string, roomData: { roomNumber: string; roomType: 'Standard' | 'Deluxe' | 'Suite'; price: number }) => Promise<boolean>;
  isLoading: boolean;
  role: UserRole;
  onBookRoomClick?: (roomId: string) => void;
}

const ROOM_IMAGES = {
  Standard: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80',
  Deluxe: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
  Suite: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
};

export const Rooms: React.FC<RoomsProps> = ({ rooms, onAddRoom, onEditRoom, isLoading, role, onBookRoomClick }) => {
  const isGuest = role === 'guest';

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Standard' | 'Deluxe' | 'Suite'>('All');

  // Form state & edit tracking
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState<'Standard' | 'Deluxe' | 'Suite'>('Standard');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<{ roomNumber?: string; price?: string }>({});
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);

  // Check room occupancy status right now
  const isRoomOccupiedToday = (room: Room) => {
    if (!room.bookings) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return room.bookings.some((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      return today >= checkIn && today < checkOut;
    });
  };

  // Validate form
  const validateForm = () => {
    const tempErrors: { roomNumber?: string; price?: string } = {};
    let isValid = true;

    if (!roomNumber.trim()) {
      tempErrors.roomNumber = 'Room number is required';
      isValid = false;
    } else if (
      rooms.some(
        (r) =>
          r.id !== editingRoomId &&
          r.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase()
      )
    ) {
      tempErrors.roomNumber = 'This room number already exists';
      isValid = false;
    }

    if (!price) {
      tempErrors.price = 'Price is required';
      isValid = false;
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      tempErrors.price = 'Price must be a positive number';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Trigger edit mode for a room
  const handleStartEdit = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType as 'Standard' | 'Deluxe' | 'Suite');
    setPrice(room.price.toString());
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setRoomNumber('');
    setRoomType('Standard');
    setPrice('');
    setErrors({});
  };

  // Handle submit (add or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormIsSubmitting(true);
    let success = false;

    if (editingRoomId) {
      success = await onEditRoom(editingRoomId, {
        roomNumber: roomNumber.trim(),
        roomType,
        price: Number(price),
      });
    } else {
      success = await onAddRoom({
        roomNumber: roomNumber.trim(),
        roomType,
        price: Number(price),
      });
    }

    setFormIsSubmitting(false);

    if (success) {
      // Reset form & states
      setEditingRoomId(null);
      setRoomNumber('');
      setRoomType('Standard');
      setPrice('');
      setErrors({});
    }
  };

  // Filtered rooms: if Guest role, filter out currently occupied rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = typeFilter === 'All' || room.roomType === typeFilter;
    const isOccupied = isRoomOccupiedToday(room);
    const matchesRoleVisibility = !isGuest || !isOccupied; // Guest only sees available rooms
    return matchesSearch && matchesFilter && matchesRoleVisibility;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-in">
      {/* Left Column: Add/Edit Room Form (Only show for Admin) */}
      {!isGuest && (
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-6 shadow-md sticky top-6">
            <div className="border-b border-slate-800/80 pb-3 mb-5 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-serif text-[#f4ebd5]">
                  {editingRoomId ? 'Edit Room' : 'Add New Room'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {editingRoomId
                    ? 'Modify the current room configuration and parameters'
                    : 'Configure and release a new room to the booking register'}
                </p>
              </div>
              {editingRoomId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                  title="Cancel edit"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Room Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Room Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 104, 305B"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className={`w-full bg-[#1b2230] border rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                    errors.roomNumber ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.roomNumber && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {errors.roomNumber}
                  </p>
                )}
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Room Type
                </label>
                <div className="relative">
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as 'Standard' | 'Deluxe' | 'Suite')}
                    className="w-full bg-[#1b2230] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Standard">Standard Room</option>
                    <option value="Deluxe">Deluxe Room</option>
                    <option value="Suite">Presidential Suite</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Price Per Night */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Price per Night (₹)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full bg-[#1b2230] border rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.price ? 'border-rose-500/50' : 'border-slate-800'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {errors.price}
                  </p>
                )}
              </div>

              {/* Submit / Action buttons */}
              <div className="flex gap-2.5">
                {editingRoomId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-2.5 px-4 bg-slate-800 border border-slate-750 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg shadow-sm transition-all text-sm mt-4 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={formIsSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gold-600 hover:bg-gold-500 disabled:bg-gold-800 disabled:text-slate-500 active:bg-gold-700 text-slate-900 font-semibold rounded-lg shadow-md transition-all text-sm mt-4 cursor-pointer"
                >
                  {formIsSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : editingRoomId ? (
                    <>
                      <Edit className="w-4 h-4" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add Room
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Right Column: Rooms List */}
      <div className={`${isGuest ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
        {/* Search & Filter Header */}
        <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={isGuest ? "Search available rooms by number..." : "Search all rooms by number..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1b2230] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Type filters */}
          <div className="flex gap-1 bg-[#1b2230] p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {(['All', 'Standard', 'Deluxe', 'Suite'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  typeFilter === type
                    ? 'bg-gold-600 text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Room Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-[#121824] border border-slate-800/60 rounded-xl h-72 animate-pulse overflow-hidden">
                <div className="h-40 bg-slate-800"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <Bed className="w-16 h-16 text-slate-700 mb-4" />
            <h4 className="text-lg font-serif text-[#f4ebd5] mb-1">
              {isGuest ? 'No available rooms found' : 'No rooms found'}
            </h4>
            <p className="text-slate-400 text-sm max-w-xs">
              {isGuest
                ? 'All rooms of this category are currently booked or occupied. Please check back later!'
                : 'No rooms match your search or filter configuration. Try resetting filters or add a new room.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredRooms.map((room) => {
              const occupied = isRoomOccupiedToday(room);
              return (
                <div
                  key={room.id}
                  className="group bg-[#121824] border border-slate-800/60 rounded-xl overflow-hidden shadow-md hover:border-gold-500/20 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Room Cover Photo */}
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={ROOM_IMAGES[room.roomType]}
                      alt={`${room.roomType}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent"></div>

                    {/* Occupancy Status Badge */}
                    {!isGuest && (
                      <div className="absolute top-4 right-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm backdrop-blur-md ${
                            occupied
                              ? 'bg-rose-950/80 border-rose-500/30 text-rose-300'
                              : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${occupied ? 'bg-rose-400' : 'bg-emerald-400'}`}
                          ></span>
                          {occupied ? 'Occupied' : 'Available'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Room Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-serif text-[#f4ebd5] group-hover:text-gold-400 transition-colors">
                            Room {room.roomNumber}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <Tag className="w-3.5 h-3.5 text-gold-500/60" />
                            <span>{room.roomType} Room</span>
                          </div>
                        </div>

                        {/* Price Display */}
                        <div className="text-right">
                          <p className="text-[#f4ebd5] text-xl font-medium font-serif">
                            ₹{room.price}
                          </p>
                          <p className="text-slate-500 text-3xs uppercase tracking-wider font-semibold">
                            per night
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="border-t border-slate-800/60 pt-3 flex justify-between items-center text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-slate-600" />
                        {room.roomType === 'Suite'
                          ? '4 Guests Max'
                          : room.roomType === 'Deluxe'
                          ? '3 Guests Max'
                          : '2 Guests Max'}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-slate-600" />
                        Prisma Sync
                      </span>
                    </div>

                    {/* Book Room Button (Only visible for Guests) */}
                    {isGuest ? (
                      <button
                        onClick={() => onBookRoomClick?.(room.id)}
                        className="w-full mt-3 py-2 px-4 bg-gold-600 hover:bg-gold-500 active:bg-gold-700 text-slate-900 text-xs font-semibold rounded-lg shadow-sm transition-all text-center cursor-pointer font-bold"
                      >
                        Book Room
                      </button>
                    ) : (
                      /* Edit Room Details Button (Visible for Admins) */
                      <button
                        onClick={() => handleStartEdit(room)}
                        className="w-full mt-3 py-2 px-4 bg-[#171e2e] hover:bg-slate-800 border border-slate-850 hover:text-slate-100 text-slate-300 text-xs font-semibold rounded-lg shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-350" />
                        Edit Room Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
