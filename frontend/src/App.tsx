import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Rooms } from './components/Rooms';
import { BookRoom } from './components/BookRoom';
import { BookingHistory } from './components/BookingHistory';
import { ToastContainer } from './components/ToastContainer';
import { Auth } from './components/Auth';
import type { Room, Booking, ActiveTab, ToastMessage, UserRole, Feedback } from './types';
import { FeedbackBoard } from './components/FeedbackBoard';
import { StaffManagement } from './components/StaffManagement';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hotel_jwt_token'));
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: UserRole } | null>(
    JSON.parse(localStorage.getItem('hotel_user') || 'null')
  );
  const [preselectedRoomId, setPreselectedRoomId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  // Loading states
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  
  // Responsive design sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast helper
  const showToast = (type: 'success' | 'error', message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Rooms (Public endpoint but sends header if available)
  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error(error);
      showToast('error', 'Could not fetch rooms list. Please check if backend is running.');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Fetch Bookings (Protected endpoint)
  const fetchBookings = async (authToken?: string) => {
    const activeToken = authToken || token;
    if (!activeToken) return;

    // Safety: Only admin accounts are authorized to fetch bookings list
    if (user?.role !== 'admin') {
      return;
    }

    setIsLoadingBookings(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error(error);
      showToast('error', 'Could not fetch bookings list.');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch Feedback (Public endpoint)
  const fetchFeedback = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error(error);
      showToast('error', 'Could not fetch guest feedback.');
    }
  };

  // Submit Feedback (Protected endpoint)
  const handleSubmitFeedback = async (feedbackData: { rating: number; comment: string }): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast('error', result.error || 'Failed to submit feedback.');
        return false;
      }

      showToast('success', 'Feedback submitted successfully! Thank you!');
      fetchFeedback(); // refresh reviews list
      return true;
    } catch (error) {
      console.error(error);
      showToast('error', 'Network error submitting feedback.');
      return false;
    }
  };

  // Initial load & refresh on token/user change
  useEffect(() => {
    fetchRooms();
    fetchFeedback();
    if (token && user?.role === 'admin') {
      fetchBookings(token);
    }
  }, [token, user]);

  // Auth Handlers
  const handleAuthSuccess = (newToken: string, authenticatedUser: { id: string; name: string; email: string; role: UserRole }) => {
    setToken(newToken);
    setUser(authenticatedUser);
    localStorage.setItem('hotel_jwt_token', newToken);
    localStorage.setItem('hotel_user', JSON.stringify(authenticatedUser));
    
    // Default starting views based on user type
    if (authenticatedUser.role === 'admin') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('rooms');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hotel_jwt_token');
    localStorage.removeItem('hotel_user');
    setRooms([]);
    setBookings([]);
    showToast('success', 'Logged out successfully. See you again!');
  };

  const handleAddRoom = async (roomData: { roomNumber: string; roomType: 'Standard' | 'Deluxe' | 'Suite'; price: number }): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast('error', result.error || 'Failed to add room.');
        return false;
      }

      showToast('success', `Room ${roomData.roomNumber} (${roomData.roomType}) added successfully!`);
      fetchRooms(); // refresh rooms list
      return true;
    } catch (error) {
      console.error(error);
      showToast('error', 'Network error adding room.');
      return false;
    }
  };

  const handleEditRoom = async (roomId: string, roomData: { roomNumber: string; roomType: 'Standard' | 'Deluxe' | 'Suite'; price: number }): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast('error', result.error || 'Failed to update room.');
        return false;
      }

      showToast('success', `Room ${roomData.roomNumber} updated successfully!`);
      fetchRooms(); // refresh rooms list
      return true;
    } catch (error) {
      console.error(error);
      showToast('error', 'Network error updating room.');
      return false;
    }
  };

  const handleBookRoom = async (bookingData: {
    guestName: string;
    email: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
  }): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast('error', result.error || 'Failed to confirm booking.');
        return false;
      }

      const roomDetails = rooms.find((r) => r.id === bookingData.roomId);
      showToast('success', `Booking confirmed for ${bookingData.guestName} in Room ${roomDetails?.roomNumber || ''}!`);
      
      // Refresh both to sync calendar occupancy updates
      fetchBookings();
      fetchRooms();
      return true;
    } catch (error) {
      console.error(error);
      showToast('error', 'Network error checking availability / creating booking.');
      return false;
    }
  };

  // Render active tab view
  const renderView = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            rooms={rooms}
            bookings={bookings}
            feedbacks={feedbacks}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 'rooms':
        return (
          <Rooms
            rooms={rooms}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            isLoading={isLoadingRooms}
            role={user.role}
            onBookRoomClick={(roomId) => {
              setPreselectedRoomId(roomId);
              setActiveTab('book');
            }}
          />
        );
      case 'book':
        return (
          <BookRoom
            rooms={rooms}
            bookings={bookings}
            currentUser={user}
            preselectedRoomId={preselectedRoomId}
            clearPreselectedRoomId={() => setPreselectedRoomId('')}
            onBookRoom={handleBookRoom}
            onNavigateToRooms={() => setActiveTab('rooms')}
          />
        );
      case 'history':
        return <BookingHistory bookings={bookings} isLoading={isLoadingBookings} />;
      case 'feedback':
        return (
          <FeedbackBoard
            feedbacks={feedbacks}
            onSubmitFeedback={handleSubmitFeedback}
            isLoading={false}
            role={user.role}
          />
        );
      case 'staff':
        return <StaffManagement token={token} currentUser={user} showToast={showToast} />;
      default:
        return <div className="text-center py-12">Page not found</div>;
    }
  };

  // Render Auth view if not logged in
  if (!token || !user) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthSuccess} showToast={showToast} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#06080e]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={mobileSidebarOpen}
        onToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        role={user.role}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0d121f] border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-semibold tracking-wide text-slate-100 uppercase">
              Grand Palace
            </h2>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-200 active:bg-slate-800 rounded-lg transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* View Content Panel */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:p-10 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>

      {/* Floated custom notification alerts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;
