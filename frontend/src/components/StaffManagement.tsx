import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Mail, Lock, User, AlertTriangle, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface StaffManagementProps {
  token: string | null;
  currentUser: { id: string; name: string; email: string; role: string } | null;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ token, currentUser, showToast }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});

  const fetchStaff = async () => {
    if (!token) return;
    setIsLoadingList(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/staff', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch staff list');
      }
      const data = await response.json();
      setStaffList(data);
    } catch (error) {
      console.error(error);
      showToast('error', 'Could not load staff members list');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const validateForm = () => {
    const errors: typeof formErrors = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Full name is required';
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email address';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !token) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/auth/register-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormErrors({ general: data.error || 'Failed to add staff member' });
        showToast('error', data.error || 'Failed to add staff member');
        return;
      }

      showToast('success', `Staff member ${name} registered successfully!`);
      setName('');
      setEmail('');
      setPassword('');
      fetchStaff(); // Refresh list
    } catch (error) {
      console.error(error);
      setFormErrors({ general: 'Network connection failed' });
      showToast('error', 'Network error. Failed to add staff.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!token) return;
    const confirmDelete = window.confirm(`Are you sure you want to remove staff member "${name}"?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/auth/staff/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        showToast('error', data.error || 'Failed to remove staff member');
        return;
      }

      showToast('success', `Staff member ${name} removed successfully!`);
      fetchStaff(); // Refresh list
    } catch (error) {
      console.error(error);
      showToast('error', 'Network error removing staff member.');
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#f4ebd5] tracking-wide uppercase">
            Staff & Authority Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register and review hotel administrator and manager accounts
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gold-950/20 border border-gold-500/10 rounded-lg text-gold-400 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Restricted Admin Operations</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Add New Staff (1/3 width) */}
        <div className="bg-[#0d121f] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-5 h-fit">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-1.5 bg-gold-950/40 rounded-lg text-gold-400 border border-gold-500/10">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Register Staff Member</h3>
          </div>

          <form onSubmit={handleAddStaffSubmit} className="space-y-4">
            {formErrors.general && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Alexander Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-[#1b2230] border rounded-lg pl-10 pr-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                    formErrors.name ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
              </div>
              {formErrors.name && (
                <p className="text-rose-400 text-3xs mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="e.g. staff@grandpalace.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-[#1b2230] border rounded-lg pl-10 pr-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                    formErrors.email ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-rose-400 text-3xs mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Temporary Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#1b2230] border rounded-lg pl-10 pr-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                    formErrors.password ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
              </div>
              {formErrors.password && (
                <p className="text-rose-400 text-3xs mt-1">{formErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gold-600 hover:bg-gold-500 disabled:bg-gold-800 disabled:text-slate-500 text-slate-900 font-bold rounded-lg shadow-md transition-all text-xs cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Staff Member
                </>
              )}
            </button>
          </form>
        </div>

        {/* List: Staff Members (2/3 width) */}
        <div className="lg:col-span-2 bg-[#0d121f] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-5 flex flex-col h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gold-950/40 rounded-lg text-gold-400 border border-gold-500/10">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Active Staff List</h3>
            </div>
            <button
              onClick={fetchStaff}
              disabled={isLoadingList}
              className="p-1.5 bg-[#171e2e] hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Refresh List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            {isLoadingList && staffList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-550 space-y-2">
                <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-450">Loading staff list...</span>
              </div>
            ) : staffList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-600" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-350">No staff registered</h4>
                  <p className="text-3xs text-slate-500 mt-1">Use the registration form to create staff accounts</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-800 text-3xs text-slate-550 uppercase tracking-wider">
                    <th className="py-2.5 font-semibold">Staff Name</th>
                    <th className="py-2.5 font-semibold">Email</th>
                    <th className="py-2.5 font-semibold">Authority</th>
                    <th className="py-2.5 font-semibold">Date Registered</th>
                    <th className="py-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-900/20">
                      <td className="py-3 pr-4 font-medium text-slate-200 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold-950/20 border border-gold-500/10 flex items-center justify-center text-gold-450 text-3xs font-bold font-serif uppercase">
                          {staff.name.substring(0, 2)}
                        </div>
                        {staff.name}
                      </td>
                      <td className="py-3 pr-4 text-slate-400 font-mono text-3xs">{staff.email}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex px-1.5 py-0.5 rounded text-4xs font-bold uppercase tracking-wider bg-gold-950/30 border border-gold-500/20 text-gold-400">
                          {staff.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-3xs font-mono">
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        {currentUser && currentUser.id !== staff.id ? (
                          <button
                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors rounded hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 cursor-pointer"
                            title={`Remove ${staff.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-3xs text-slate-500 italic font-medium pr-2 select-none">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
