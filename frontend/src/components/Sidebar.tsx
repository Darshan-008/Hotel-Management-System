import React from 'react';
import { LayoutDashboard, BedDouble, CalendarPlus, History, Hotel, LogOut, MessageSquare, Users } from 'lucide-react';
import type { ActiveTab, UserRole } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  role: UserRole;
  user: { name: string; email: string; role: UserRole } | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
  role,
  user,
  onLogout,
}) => {
  const adminMenuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms' as ActiveTab, label: 'Room Management', icon: BedDouble },
    { id: 'book' as ActiveTab, label: 'Book a Room', icon: CalendarPlus },
    { id: 'history' as ActiveTab, label: 'Booking History', icon: History },
    { id: 'feedback' as ActiveTab, label: 'Guest Feedback', icon: MessageSquare },
    { id: 'staff' as ActiveTab, label: 'Staff Management', icon: Users },
  ];

  const guestMenuItems = [
    { id: 'rooms' as ActiveTab, label: 'Rooms & Rates', icon: BedDouble },
    { id: 'book' as ActiveTab, label: 'Book a Room', icon: CalendarPlus },
    { id: 'feedback' as ActiveTab, label: 'Give Feedback', icon: MessageSquare },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : guestMenuItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-[#06080e]/80 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#0d121f] border-r border-slate-800/80 transition-transform duration-300 transform md:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-0'
        } ${isOpen ? '' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
          <div className="p-2 bg-gold-950/40 rounded-lg border border-gold-500/20 text-gold-400">
            <Hotel className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold tracking-wide text-slate-100 uppercase">
              Grand Palace
            </h2>
            <p className="text-2xs uppercase tracking-widest text-gold-400 font-semibold">
              Hotel Management
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (isOpen) onToggle(); // Auto-close on mobile selection
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'active-nav-item'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-gold-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logged in User Profile Card */}
        {user && (
          <div className="px-4 py-4 border-t border-slate-800/60 space-y-3 bg-[#0f1525]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-950/40 border border-gold-500/20 flex items-center justify-center font-serif text-gold-400 font-bold uppercase flex-shrink-0 text-sm">
                {user.name.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{user.name}</h4>
                <p className="text-3xs text-slate-500 truncate">{user.email}</p>
                <span className="inline-flex px-1.5 py-0.5 rounded text-4xs font-bold uppercase tracking-wider bg-gold-950/40 border border-gold-500/20 text-gold-400 mt-1">
                  {user.role === 'admin' ? 'Admin Staff' : 'Hotel Guest'}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#171e2e] hover:bg-slate-800 hover:text-slate-100 active:bg-[#121824] text-slate-300 text-xs font-semibold rounded-lg border border-slate-800 transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              Sign Out
            </button>
          </div>
        )}

        {/* Version Footer */}
        <div className="p-3 border-t border-slate-800/60 text-center">
          <p className="text-2xs text-slate-500 uppercase tracking-widest font-semibold">
            System Version 1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};
