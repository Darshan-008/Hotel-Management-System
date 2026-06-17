import React, { useState } from 'react';
import { Search, Download, Calendar, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking } from '../types';

interface BookingHistoryProps {
  bookings: Booking[];
  isLoading: boolean;
}

type StatusFilter = 'All' | 'Upcoming' | 'Active' | 'Completed';

export const BookingHistory: React.FC<BookingHistoryProps> = ({ bookings, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  
  // Sorting state
  const [sortField, setSortField] = useState<'checkIn' | 'guestName' | 'roomNumber'>('checkIn');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getBookingStatus = (booking: Booking): StatusFilter => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (today < checkIn) return 'Upcoming';
    if (today >= checkIn && today < checkOut) return 'Active';
    return 'Completed';
  };

  const calculateBookingTotal = (booking: Booking): number => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const roomPrice = booking.room?.price || 0;
    return diffDays * roomPrice;
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    if (bookings.length === 0) return;

    const headers = ['Booking ID', 'Guest Name', 'Email', 'Room Number', 'Room Type', 'Price per Night', 'Check In', 'Check Out', 'Nights', 'Total Amount', 'Status'];
    const rows = bookings.map((b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const totalAmount = nights * (b.room?.price || 0);
      const status = getBookingStatus(b);

      return [
        b.id,
        `"${b.guestName.replace(/"/g, '""')}"`,
        b.email,
        b.room?.roomNumber || 'N/A',
        b.room?.roomType || 'N/A',
        b.room?.price || 0,
        checkIn.toLocaleDateString(),
        checkOut.toLocaleDateString(),
        nights,
        totalAmount,
        status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotel_bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Sorting
  const handleSort = (field: 'checkIn' | 'guestName' | 'roomNumber') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.room?.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getBookingStatus(booking);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort Bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'checkIn') {
      comparison = new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
    } else if (sortField === 'guestName') {
      comparison = a.guestName.localeCompare(b.guestName);
    } else if (sortField === 'roomNumber') {
      comparison = (a.room?.roomNumber || '').localeCompare(b.room?.roomNumber || '');
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination calculations
  const totalItems = sortedBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Top action section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[#f4ebd5]">Booking Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Review historical records, check statuses, and export data summaries</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={bookings.length === 0}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 border border-slate-700/60 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold rounded-lg transition-all shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by guest name or room number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#1b2230] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Tab-style status filters */}
        <div className="flex gap-1 bg-[#1b2230] p-1 rounded-lg border border-slate-800 overflow-x-auto">
          {(['All', 'Upcoming', 'Active', 'Completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setStatusFilter(filter);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === filter
                  ? 'bg-gold-600 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table Container */}
      <div className="bg-[#121824] border border-slate-800/60 rounded-xl overflow-hidden shadow-md">
        {isLoading ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-sm">Loading registry records...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Calendar className="w-16 h-16 text-slate-700 mb-4" />
            <h4 className="text-lg font-serif text-[#f4ebd5] mb-1">No bookings found</h4>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              No booking records match your search search terms or filter selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#171e2e]/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Booking ID</th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('guestName')}>
                    <span className="flex items-center gap-1">
                      Guest Details <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('roomNumber')}>
                    <span className="flex items-center gap-1">
                      Room <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('checkIn')}>
                    <span className="flex items-center gap-1">
                      Check-In <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  </th>
                  <th className="p-4">Check-Out</th>
                  <th className="p-4 text-right">Total Cost</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {paginatedBookings.map((b) => {
                  const status = getBookingStatus(b);
                  const total = calculateBookingTotal(b);
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/15 transition-colors">
                      <td className="p-4 font-mono text-2xs text-slate-500 tracking-wider">
                        {b.id.substring(0, 8).toUpperCase()}...
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-200">{b.guestName}</div>
                        <div className="text-xs text-slate-500">{b.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-200">Room {b.room?.roomNumber || 'N/A'}</div>
                        <div className="text-3xs uppercase tracking-wider text-gold-400 font-semibold mt-0.5">
                          {b.room?.roomType || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(b.checkIn).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(b.checkOut).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 text-right font-serif font-medium text-slate-200">
                        ₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider border ${
                            status === 'Upcoming'
                              ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                              : status === 'Active'
                              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                              : 'bg-slate-850 border-slate-700/60 text-slate-400'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalItems > itemsPerPage && (
          <div className="p-4 border-t border-slate-800/80 bg-[#171e2e]/10 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-medium text-slate-200">{startIndex + 1}</span> to{' '}
              <span className="font-medium text-slate-200">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
              <span className="font-medium text-slate-200">{totalItems}</span> bookings
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center px-2.5 font-medium text-slate-300">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
