import React from 'react';
import { Bed, Calendar, IndianRupee, ArrowRight } from 'lucide-react';
import type { Room, Booking, Feedback } from '../types';

interface DashboardProps {
  rooms: Room[];
  bookings: Booking[];
  feedbacks: Feedback[];
  onNavigate: (tab: 'rooms' | 'book' | 'history' | 'feedback') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ rooms, bookings, feedbacks, onNavigate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate stats
  const totalRooms = rooms.length;

  // Active bookings today
  const activeBookings = bookings.filter((booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    // Remove time components for simple calendar day comparison
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    return today >= checkIn && today < checkOut;
  });

  const bookedRoomsCount = new Set(activeBookings.map((b) => b.roomId)).size;
  const availableRoomsCount = Math.max(0, totalRooms - bookedRoomsCount);
  const totalBookingsCount = bookings.length;

  // Calculate total nights and total revenue
  const totalRevenue = bookings.reduce((sum, booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const roomPrice = booking.room?.price || 0;
    return sum + diffDays * roomPrice;
  }, 0);

  const occupancyRate = totalRooms > 0 ? Math.round((bookedRoomsCount / totalRooms) * 100) : 0;

  // Get recent 4 bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Welcome Panel */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-luxury-950 to-slate-900 border border-luxury-800/20 p-6 md:p-8">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full text-gold-400" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
            <path d="M0 100 C 20 0, 50 0, 100 100 Z" />
          </svg>
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl md:text-4xl font-serif font-light text-[#f4ebd5]">
            Welcome to <span className="text-gradient font-medium">Grand Palace</span> Portal
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Manage your rooms, bookings, and guests in real-time. View live occupancy rates and track daily business progress.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Rooms */}
        <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-5 hover:border-gold-500/30 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Rooms</p>
              <h3 className="text-3xl font-serif font-medium mt-2 text-slate-100">{totalRooms}</h3>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg text-gold-400">
              <Bed className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-400 font-medium">100%</span> configured and active
          </div>
        </div>

        {/* Available Rooms */}
        <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-5 hover:border-gold-500/30 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Available Rooms</p>
              <h3 className="text-3xl font-serif font-medium mt-2 text-emerald-400">{availableRoomsCount}</h3>
            </div>
            <div className="p-3 bg-emerald-950/40 rounded-lg text-emerald-400">
              <Bed className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalRooms > 0 ? (availableRoomsCount / totalRooms) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Booked Rooms */}
        <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-5 hover:border-gold-500/30 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Booked Rooms</p>
              <h3 className="text-3xl font-serif font-medium mt-2 text-rose-400">{bookedRoomsCount}</h3>
            </div>
            <div className="p-3 bg-rose-950/40 rounded-lg text-rose-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalRooms > 0 ? (bookedRoomsCount / totalRooms) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-5 hover:border-gold-500/30 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Revenue generated</p>
              <h3 className="text-3xl font-serif font-medium mt-2 text-gold-400">₹{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-gold-950/30 rounded-lg text-gold-400">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-gold-400 font-semibold">{totalBookingsCount}</span> total lifetime bookings
          </div>
        </div>
      </div>

      {/* Main Grid: Occupancy chart placeholder and Recent bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Quick Actions */}
        <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-6 space-y-6 lg:col-span-1">
          <h3 className="text-lg font-serif text-[#f4ebd5] border-b border-slate-800/80 pb-3">Occupancy Status</h3>
          
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center w-36 h-36">
              {/* Outer circular indicator using progress styling */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-gold-500 transition-all duration-1000"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * occupancyRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-serif font-medium text-slate-100">{occupancyRate}%</span>
                <span className="text-slate-400 text-2xs uppercase tracking-wider font-semibold">Occupied</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-800/80 pt-4">
            <div>
              <p className="text-slate-400 text-xs">Occupied Today</p>
              <p className="text-lg font-serif font-medium text-rose-400 mt-1">{bookedRoomsCount} Rooms</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Available Today</p>
              <p className="text-lg font-serif font-medium text-emerald-400 mt-1">{availableRoomsCount} Rooms</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs uppercase text-slate-400 tracking-wider font-semibold">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('book')}
                className="py-2.5 px-3 bg-gold-600 hover:bg-gold-500 active:bg-gold-700 text-slate-900 text-xs font-semibold rounded-lg transition-all shadow-md"
              >
                Book a Room
              </button>
              <button
                onClick={() => onNavigate('rooms')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/60 transition-all"
              >
                Add Room
              </button>
            </div>
          </div>

          {/* Feedback Score Summary */}
          {(() => {
            const totalReviews = feedbacks.length;
            const averageRating = totalReviews > 0
              ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
              : '0.0';
            return (
              <div className="border-t border-slate-800/80 pt-4 mt-2 space-y-2">
                <h4 className="text-xs uppercase text-slate-400 tracking-wider font-semibold">Guest Feedback</h4>
                <div className="bg-[#1b2230] border border-slate-850 rounded-lg p-3.5 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-3xs uppercase tracking-wider text-slate-500 font-semibold">Average Score</p>
                    <p className="text-base font-serif font-semibold text-gold-450 mt-1 flex items-center gap-1.5">
                      {averageRating} ★ <span className="text-3xs text-slate-500 font-sans font-normal font-semibold">({totalReviews} reviews)</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('feedback')}
                    className="text-3xs font-bold text-gold-400 hover:text-gold-300 border border-gold-500/20 px-2.5 py-1.5 rounded-md hover:bg-gold-500/5 transition-colors cursor-pointer"
                  >
                    Read Reviews
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Recent Bookings */}
        <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-lg font-serif text-[#f4ebd5]">Recent Bookings</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-medium text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
            >
              View History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm">No bookings recorded yet</p>
              <button
                onClick={() => onNavigate('book')}
                className="mt-4 text-xs text-gold-400 border border-gold-500/30 px-3 py-1.5 rounded-lg hover:bg-gold-500/10 transition-colors"
              >
                Make First Booking
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3 pt-1">Guest</th>
                    <th className="pb-3 pt-1">Room</th>
                    <th className="pb-3 pt-1">Check In</th>
                    <th className="pb-3 pt-1">Check Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 text-sm">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-800/20 group transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="font-medium text-slate-200">{booking.guestName}</div>
                        <div className="text-xs text-slate-500">{booking.email}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-gold-300 group-hover:bg-slate-700 transition-colors">
                          Room {booking.room?.roomNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(booking.checkIn).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(booking.checkOut).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
