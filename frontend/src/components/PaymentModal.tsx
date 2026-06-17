import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, X, AlertTriangle, ShieldCheck, RefreshCw, QrCode, Smartphone } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  amount: number;
  roomNumber: string;
  roomType: string;
  nights: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  roomNumber,
  roomType,
  nights,
  guestName,
  checkIn,
  checkOut,
}) => {
  // Navigation & Methods state
  const [activeTab, setActiveTab] = useState<'card' | 'upi'>('card');
  const [upiSubMethod, setUpiSubMethod] = useState<'qr' | 'upi_id'>('qr');

  // Input fields state
  const [cardName, setCardName] = useState(guestName);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // QR Timer state
  const [timeLeft, setTimeLeft] = useState(300);

  // Validations & Processing States
  const [errors, setErrors] = useState<{
    cardName?: string;
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
    upiId?: string;
    general?: string;
  }>({});
  const [processingState, setProcessingState] = useState<'idle' | 'authorizing' | 'securing' | 'completed'>('idle');

  // Timer effect for QR Code expiry
  useEffect(() => {
    if (!isOpen || activeTab !== 'upi' || upiSubMethod !== 'qr') return;

    setTimeLeft(300);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, upiSubMethod]);

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry Date (adds '/' after 2 digits MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setExpiry(formatted);
  };

  // Format CVV (max 3 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(value);
  };

  // Pre-fill UPI Handle on selecting provider
  const handleSelectProvider = (suffix: string) => {
    const base = guestName.toLowerCase().replace(/\s+/g, '') || 'guest';
    setUpiId(`${base}${suffix}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validatePayment = () => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    if (activeTab === 'card') {
      if (!cardName.trim()) {
        tempErrors.cardName = 'Cardholder name is required';
        isValid = false;
      }

      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length !== 16) {
        tempErrors.cardNumber = 'Card number must be 16 digits';
        isValid = false;
      }

      if (expiry.length !== 5) {
        tempErrors.expiry = 'Expiry date is required (MM/YY)';
        isValid = false;
      } else {
        const [month] = expiry.split('/').map(Number);
        if (month < 1 || month > 12) {
          tempErrors.expiry = 'Invalid month (01-12)';
          isValid = false;
        }
      }

      if (cvv.length !== 3) {
        tempErrors.cvv = 'CVV must be 3 digits';
        isValid = false;
      }
    } else {
      if (upiSubMethod === 'upi_id') {
        if (!upiId.trim()) {
          tempErrors.upiId = 'UPI ID is required';
          isValid = false;
        } else if (!upiId.includes('@')) {
          tempErrors.upiId = 'Please enter a valid UPI ID (e.g. user@bank)';
          isValid = false;
        }
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;

    // Start payment processing steps
    setProcessingState('authorizing');

    // Step 1: Simulate payment verification (1200ms)
    setTimeout(() => {
      setProcessingState('securing');

      // Step 2: Confirm booking to database (800ms)
      setTimeout(async () => {
        try {
          const success = await onConfirm();
          if (success) {
            setProcessingState('completed');
            // Give user a moment to see checkmark before closing
            setTimeout(() => {
              onClose();
            }, 800);
          } else {
            setProcessingState('idle');
            setErrors({ general: 'Reservation checkout failed. Overlap or validation error.' });
          }
        } catch (error) {
          console.error(error);
          setProcessingState('idle');
          setErrors({ general: 'Transaction failed. Could not communicate with server.' });
        }
      }, 800);
    }, 1200);
  };

  // Reset inputs when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCardName(guestName);
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setUpiId('');
      setErrors({});
      setProcessingState('idle');
      setActiveTab('card');
      setUpiSubMethod('qr');
    }
  }, [isOpen, guestName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080e]/80 backdrop-blur-sm px-4 animate-fade-in">
      {/* Modal Card container */}
      <div className="w-full max-w-md bg-[#0d121f] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Cancel button in top right */}
        {processingState === 'idle' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Processing State Screens */}
        {processingState !== 'idle' && (
          <div className="absolute inset-0 bg-[#0d121f]/95 z-20 flex flex-col items-center justify-center text-center p-6 space-y-4">
            {processingState === 'authorizing' && (
              <>
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <h3 className="text-[#f4ebd5] font-serif text-lg">
                    {activeTab === 'card'
                      ? 'Authorizing Card...'
                      : upiSubMethod === 'qr'
                      ? 'Confirming QR Transaction...'
                      : 'Sending UPI Request...'}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">
                    {activeTab === 'card'
                      ? 'Contacting Secure Banking Gateway'
                      : upiSubMethod === 'qr'
                      ? 'Verifying incoming bank notification'
                      : `Awaiting authorization on your UPI App`}
                  </p>
                </div>
              </>
            )}
            {processingState === 'securing' && (
              <>
                <RefreshCw className="w-12 h-12 text-gold-400 animate-spin" />
                <div>
                  <h3 className="text-[#f4ebd5] font-serif text-lg">Securing Booking Hold...</h3>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">Locking Room Calendar Dates</p>
                </div>
              </>
            )}
            {processingState === 'completed' && (
              <>
                <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
                  ✓
                </div>
                <div>
                  <h3 className="text-[#f4ebd5] font-serif text-xl">Payment Approved</h3>
                  <p className="text-emerald-400 text-xs mt-1 font-semibold uppercase tracking-wider">Reservation Confirmed</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Header summary */}
        <div className="bg-[#121824] p-5 border-b border-slate-800 flex items-start gap-3">
          <div className="p-2 bg-gold-950/40 rounded-lg text-gold-400 border border-gold-500/10">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[#f4ebd5] font-serif text-base">Secure Checkout</h3>
            <p className="text-3xs uppercase tracking-widest text-slate-500 mt-0.5">SSL 256-bit Encrypted Transaction</p>
          </div>
        </div>

        {/* Billing Overview */}
        <div className="p-5 bg-slate-900/40 border-b border-slate-800 space-y-2 text-xs text-slate-400">
          <div className="flex justify-between font-medium">
            <span className="text-[#f4ebd5]">Room {roomNumber} ({roomType})</span>
            <span className="text-[#f4ebd5] font-serif">₹{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xs">
            <span>Duration ({nights} {nights === 1 ? 'Night' : 'Nights'})</span>
            <span>{new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-colors flex justify-center items-center gap-1.5 ${
              activeTab === 'card'
                ? 'text-gold-400 border-b-2 border-gold-500 bg-slate-900/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Card Payment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upi')}
            className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-colors flex justify-center items-center gap-1.5 ${
              activeTab === 'upi'
                ? 'text-gold-400 border-b-2 border-gold-500 bg-slate-900/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            UPI / QR / Phone Pay
          </button>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
          {errors.general && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-350 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {activeTab === 'card' ? (
            /* --- CARD METHOD VIEW --- */
            <div className="space-y-4">
              {/* Cardholder Name */}
              <div>
                <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="As shown on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className={`w-full bg-[#1b2230] border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                    errors.cardName ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.cardName && (
                  <p className="text-rose-400 text-3xs mt-1">{errors.cardName}</p>
                )}
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className={`w-full bg-[#1b2230] border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.cardNumber ? 'border-rose-500/50' : 'border-slate-800'
                    }`}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                {errors.cardNumber && (
                  <p className="text-rose-400 text-3xs mt-1">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className={`w-full bg-[#1b2230] border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.expiry ? 'border-rose-500/50' : 'border-slate-800'
                    }`}
                  />
                  {errors.expiry && (
                    <p className="text-rose-400 text-3xs mt-1">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={handleCvvChange}
                    className={`w-full bg-[#1b2230] border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.cvv ? 'border-rose-500/50' : 'border-slate-800'
                    }`}
                  />
                  {errors.cvv && (
                    <p className="text-rose-400 text-3xs mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Pay & Confirm Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold-600 hover:bg-gold-500 active:bg-gold-700 text-slate-900 font-bold rounded-lg shadow-md transition-all text-xs mt-6 cursor-pointer"
              >
                Pay & Confirm Booking (₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})
              </button>
            </div>
          ) : (
            /* --- UPI / QR / PHONE PAY VIEW --- */
            <div className="space-y-4">
              {/* Sub-selector pills */}
              <div className="flex bg-[#121824] p-1 rounded-lg border border-slate-800/80 mb-2">
                <button
                  type="button"
                  onClick={() => setUpiSubMethod('qr')}
                  className={`flex-1 py-1.5 text-center text-2xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                    upiSubMethod === 'qr'
                      ? 'bg-gold-600 text-slate-900 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-3 h-3" />
                  Scan QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setUpiSubMethod('upi_id')}
                  className={`flex-1 py-1.5 text-center text-2xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                    upiSubMethod === 'upi_id'
                      ? 'bg-gold-600 text-slate-900 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  UPI ID / Phone Pay
                </button>
              </div>

              {upiSubMethod === 'qr' ? (
                /* Sub-method A: QR Code scanner */
                <div className="space-y-4 py-2 text-center">
                  <div className="relative inline-block">
                    {/* Visual QR Code Mock */}
                    <svg className="w-36 h-36 mx-auto bg-white p-3 rounded-xl shadow-lg border border-gold-500/20" viewBox="0 0 100 100">
                      {/* Corner squares */}
                      <path d="M5,5 h20 v20 h-20 z M10,10 h10 v10 h-10 z M75,5 h20 v20 h-20 z M80,10 h10 v10 h-10 z M5,75 h20 v20 h-20 z M10,80 h10 v10 h-10 z" fill="#0d121f" />
                      {/* Random QR code paths */}
                      <path d="M35,10 h10 v5 h-10 z M55,5 h10 v5 h-10 z M45,20 h5 v5 h-5 z M30,30 h10 v5 h-10 z M50,30 h15 v5 h-15 z M70,30 h10 v5 h-10 z M35,45 h15 v5 h-15 z M60,45 h10 v5 h-10 z M80,45 h15 v5 h-15 z M30,60 h5 v15 h-5 z M45,65 h15 v5 h-15 z M70,60 h10 v10 h-10 z M35,80 h15 v5 h-15 z M60,80 h15 v5 h-15 z M85,80 h10 v15 h-10 z M35,90 h10 v5 h-10 z M55,90 h15 v5 h-15 z" fill="#0d121f" />
                      {/* Inner gold hotel logo marker */}
                      <rect x="42.5" y="42.5" width="15" height="15" rx="3" fill="#d97706" />
                      <circle cx="50" cy="50" r="3" fill="#ffffff" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-slate-400 text-2xs font-semibold">
                      Scan QR using PhonePe, GPay, Paytm or any UPI App
                    </p>
                    {timeLeft > 0 ? (
                      <p className="text-amber-500 font-mono text-3xs mt-1 uppercase tracking-wider font-semibold">
                        QR Code expires in {formatTime(timeLeft)}
                      </p>
                    ) : (
                      <p className="text-rose-500 text-3xs mt-1 uppercase tracking-wider font-semibold">
                        QR Code Expired. Please close and try again.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={timeLeft === 0}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold-600 hover:bg-gold-500 active:bg-gold-700 text-slate-900 font-bold rounded-lg shadow-md transition-all text-xs mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Simulate QR Scan Approval (₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                  </button>
                </div>
              ) : (
                /* Sub-method B: UPI ID & Phone Pay */
                <div className="space-y-4">
                  <div>
                    <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Enter UPI ID / Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@ybl or user@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className={`w-full bg-[#1b2230] border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                        errors.upiId ? 'border-rose-500/50' : 'border-slate-800'
                      }`}
                    />
                    {errors.upiId && (
                      <p className="text-rose-400 text-3xs mt-1">{errors.upiId}</p>
                    )}
                  </div>

                  {/* App Quick Select badges */}
                  <div>
                    <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Popular Options
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectProvider('@ybl')}
                        className="py-2 px-3 bg-[#121824] hover:bg-gold-950/20 hover:border-gold-500/30 text-slate-300 hover:text-[#f4ebd5] border border-slate-850 rounded-lg text-3xs font-medium text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        PhonePe
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectProvider('@okaxis')}
                        className="py-2 px-3 bg-[#121824] hover:bg-gold-950/20 hover:border-gold-500/30 text-slate-300 hover:text-[#f4ebd5] border border-slate-850 rounded-lg text-3xs font-medium text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Google Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectProvider('@paytm')}
                        className="py-2 px-3 bg-[#121824] hover:bg-gold-950/20 hover:border-gold-500/30 text-slate-300 hover:text-[#f4ebd5] border border-slate-850 rounded-lg text-3xs font-medium text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        Paytm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectProvider('@upi')}
                        className="py-2 px-3 bg-[#121824] hover:bg-gold-950/20 hover:border-gold-500/30 text-slate-300 hover:text-[#f4ebd5] border border-slate-850 rounded-lg text-3xs font-medium text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        BHIM UPI
                      </button>
                    </div>
                  </div>

                  {/* Pay & Confirm UPI Request Button */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold-600 hover:bg-gold-500 active:bg-gold-700 text-slate-900 font-bold rounded-lg shadow-md transition-all text-xs mt-6 cursor-pointer"
                  >
                    Request UPI Payment (₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        {/* SSL indicator */}
        <div className="bg-[#121824] px-5 py-3 border-t border-slate-850 flex items-center justify-center gap-1.5 text-3xs text-slate-500 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500/20" />
          <span>PCI-DSS Compliant Gateway</span>
        </div>
      </div>
    </div>
  );
};
