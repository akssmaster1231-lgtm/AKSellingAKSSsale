import React, { useState } from 'react';
import { 
  ShieldCheck, Sparkles, Database, Lock, AlertCircle, 
  CheckCircle2, ArrowRight, Truck, Gift, RefreshCw, Key, ChevronDown, ChevronUp,
  X, Mail, User, Phone, Eye, EyeOff, HelpCircle, Smartphone, KeyRound
} from 'lucide-react';
import { 
  loginWithGoogle,
  registerWithEmailPassword,
  loginWithEmailPassword,
  resetPasswordEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  getFirebaseAuthErrorMessage,
  loginWithCustomEmail,
  AppUser
} from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthenticated: (user: AppUser, profile: UserProfile) => void;
  title?: string;
  subtitle?: string;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  title = 'Sign In to Buy & Unlock Express Checkout',
  subtitle = 'Login or create a free account to complete your order, track live BlueDart delivery, and redeem SuperCoins.',
}) => {
  const [activeAuthTab, setActiveAuthTab] = useState<'phone' | 'signin' | 'signup' | 'forgot'>('phone');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'email' | 'phone' | 'forgot' | null>(null);
  
  // Phone OTP state
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [userNameForPhone, setUserNameForPhone] = useState('');

  // Email/Password Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Google Real 1-Tap / Popup Login via Firebase Auth
  const handleGoogleSignIn = async () => {
    setLoadingProvider('google');
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { user, error } = await loginWithGoogle();
      if (error) {
        setErrorMsg(getFirebaseAuthErrorMessage(error));
        setLoadingProvider(null);
        return;
      }
      
      if (user) {
        const userProfile: UserProfile = {
          name: user.name || 'AKSelling Member',
          email: user.email || 'user@example.com',
          phone: user.phone || '9876543210',
          gender: 'Male',
          avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'AK')}&backgroundColor=0284c7`,
          memberTier: 'AK PLUS GOLD VIP',
          superCoins: 650,
        };

        setSuccessMsg(`Welcome, ${userProfile.name}! Verified via Google & Firebase.`);
        setTimeout(() => {
          onAuthenticated(user, userProfile);
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(getFirebaseAuthErrorMessage(err));
      setLoadingProvider(null);
    }
  };

  // 2. Phone OTP: Send Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneInput.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoadingProvider('phone');
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await sendPhoneOtp(cleanNumber);
    setLoadingProvider(null);

    if (res.success) {
      setOtpSent(true);
      setConfirmationResult(res.confirmationResult || null);
      if (res.simulatedOtp) {
        setPhoneOtp(res.simulatedOtp);
        setSuccessMsg(`OTP sent to +91 ${cleanNumber.slice(-10)}. Test Code: ${res.simulatedOtp}`);
      } else {
        setSuccessMsg(`OTP sent to +91 ${cleanNumber.slice(-10)}. Please enter code below.`);
      }
    } else {
      setErrorMsg(res.error?.message || 'Failed to send OTP. Please try again.');
    }
  };

  // 3. Phone OTP: Verify Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp || phoneOtp.length < 4) {
      setErrorMsg('Please enter the 4 or 6-digit verification code.');
      return;
    }

    setLoadingProvider('phone');
    setErrorMsg(null);
    setSuccessMsg(null);

    const { user, error } = await verifyPhoneOtp(
      phoneInput,
      phoneOtp,
      confirmationResult,
      userNameForPhone || undefined
    );

    setLoadingProvider(null);

    if (error) {
      setErrorMsg(error.message || 'Invalid verification code.');
      return;
    }

    if (user) {
      const userProfile: UserProfile = {
        name: user.name || userNameForPhone || 'AK Customer',
        email: user.email || `${phoneInput.replace(/\D/g, '')}@akselling.in`,
        phone: user.phone || `+91 ${phoneInput.replace(/\D/g, '')}`,
        gender: 'Male',
        avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'AK')}&backgroundColor=0284c7`,
        memberTier: 'AK PLUS GOLD VIP',
        superCoins: 650,
      };

      setSuccessMsg(`Phone verified! Welcome ${userProfile.name}`);
      setTimeout(() => {
        onAuthenticated(user, userProfile);
      }, 500);
    }
  };

  // 4. Real Email & Password Sign In / Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (activeAuthTab !== 'forgot' && (!password || password.length < 6)) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoadingProvider('email');
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (activeAuthTab === 'signup') {
        const { user, error } = await registerWithEmailPassword(email, password, fullName, phone);
        if (error) {
          setErrorMsg(getFirebaseAuthErrorMessage(error));
          setLoadingProvider(null);
          return;
        }

        if (user) {
          const userProfile: UserProfile = {
            name: user.name || fullName || 'AKSelling Member',
            email: user.email || email,
            phone: user.phone || phone || '9876543210',
            gender: 'Male',
            avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'AK')}&backgroundColor=0284c7`,
            memberTier: 'AK PLUS GOLD VIP',
            superCoins: 650,
          };

          setSuccessMsg(`Account created successfully! Welcome to AKSelling.`);
          setTimeout(() => {
            onAuthenticated(user, userProfile);
          }, 600);
        }
      } else if (activeAuthTab === 'signin') {
        const { user, error } = await loginWithEmailPassword(email, password);
        if (error) {
          setErrorMsg(getFirebaseAuthErrorMessage(error));
          setLoadingProvider(null);
          return;
        }

        if (user) {
          const userProfile: UserProfile = {
            name: user.name || 'AKSelling Member',
            email: user.email || email,
            phone: user.phone || '9876543210',
            gender: 'Male',
            avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'AK')}&backgroundColor=0284c7`,
            memberTier: 'AK PLUS GOLD VIP',
            superCoins: 650,
          };

          setSuccessMsg(`Welcome back, ${userProfile.name}!`);
          setTimeout(() => {
            onAuthenticated(user, userProfile);
          }, 600);
        }
      }
    } catch (err: any) {
      setErrorMsg(getFirebaseAuthErrorMessage(err));
      setLoadingProvider(null);
    }
  };

  // 5. Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoadingProvider('forgot');
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await resetPasswordEmail(email);
    setLoadingProvider(null);
    if (res.success) {
      setSuccessMsg(`Password reset link has been sent to ${email}. Check your inbox.`);
    } else {
      setErrorMsg(getFirebaseAuthErrorMessage(res.error));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="relative bg-gradient-to-br from-[#0A3A1E] to-[#052610] p-6 text-white text-left border-b-2 border-[#FFC107]">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              id="auth-modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#FFC107] text-[#052610] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
              Firebase Auth Active
            </span>
            <span className="text-emerald-200 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-bit SSL Secure
            </span>
          </div>

          <h2 className="text-xl font-bold font-serif leading-snug">{title}</h2>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">{subtitle}</p>
        </div>

        {/* Benefits bar */}
        <div className="bg-emerald-50/80 px-5 py-2.5 border-b border-emerald-100/60 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-[#0A3A1E]" />
            <span>Fast Dispatch</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>650 SuperCoins</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Firebase Cloud</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-2 animate-shake">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
              
              {/* If unauthorized domain error, show instant 1-click fix guide */}
              {(errorMsg.includes('unauthorized-domain') || errorMsg.includes('Authorized Domains')) && (
                <div className="mt-2 pt-2 border-t border-rose-200/80 text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-xl space-y-2">
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    How to fix in 1 minute in Firebase Console:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                    <li>Open <strong>Firebase Console</strong> 👉 <strong>Authentication</strong> 👉 <strong>Settings</strong> tab</li>
                    <li>Scroll to <strong>Authorized domains</strong> 👉 click <strong>Add domain</strong></li>
                    <li>Paste this exact domain:</li>
                  </ol>
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
                    <code className="text-[11px] text-slate-900 font-mono flex-1 break-all select-all">
                      {typeof window !== 'undefined' ? window.location.hostname : 'run.app'}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.hostname);
                          alert(`Copied domain: ${window.location.hostname}`);
                        }
                      }}
                      className="px-2.5 py-1 bg-[#0A3A1E] text-white text-[10px] font-bold rounded hover:bg-[#052610] shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                  <a
                    href="https://console.firebase.google.com/project/akselling-7e183/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#0A3A1E] font-bold hover:underline text-[11px] mt-1"
                  >
                    Open Firebase Auth Settings ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Primary Action: Google 1-Tap / Popup Auth */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingProvider !== null}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-slate-800 text-sm flex items-center justify-center gap-3 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            id="auth-gate-google-signin-btn"
          >
            {loadingProvider === 'google' ? (
              <RefreshCw className="w-5 h-5 text-[#0A3A1E] animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Continue with Real Google Account</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or Firebase Email & Password
            </span>
          </div>

          {/* Multi-Method Form */}
          <div>
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-3 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => { setActiveAuthTab('phone'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeAuthTab === 'phone' ? 'bg-[#0A3A1E] text-[#FFC107] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signin'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeAuthTab === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signup'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeAuthTab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('forgot'); setErrorMsg(null); }}
                className={`py-1.5 px-2.5 rounded-lg transition-all ${
                  activeAuthTab === 'forgot' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Forgot?
              </button>
            </div>

            {/* Hidden container for Firebase invisible Recaptcha */}
            <div id="recaptcha-container"></div>

            {/* Tab 1: Phone Number & OTP Verification */}
            {activeAuthTab === 'phone' && (
              <div className="space-y-3">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Enter 10-Digit Mobile Number
                      </label>
                      <div className="relative flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 font-bold text-xs">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-r-xl focus:border-[#0A3A1E] focus:outline-none font-medium"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Instant SMS verification code will be sent to your mobile.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingProvider !== null || phoneInput.length < 10}
                      className="w-full py-3 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      id="auth-send-otp-btn"
                    >
                      {loadingProvider === 'phone' ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#052610]" />
                      ) : (
                        <>
                          <span>Send Verification OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">
                        Sent to: <strong className="text-slate-900">+91 {phoneInput}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setPhoneOtp(''); }}
                        className="text-[11px] text-[#0A3A1E] hover:underline font-bold"
                      >
                        Change Number
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Enter 4 or 6-Digit OTP Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          maxLength={6}
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value.trim())}
                          placeholder="7890"
                          className="w-full pl-9 pr-3 py-2 text-sm font-mono tracking-widest font-bold border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Your Name (Optional)
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={userNameForPhone}
                          onChange={(e) => setUserNameForPhone(e.target.value)}
                          placeholder="Anoj Kumar"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingProvider !== null || phoneOtp.length < 4}
                      className="w-full py-3 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      id="auth-verify-otp-btn"
                    >
                      {loadingProvider === 'phone' ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#052610]" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Login</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Tab 2: Forgot Password */}
            {activeAuthTab === 'forgot' && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter your registered email address. We will send you a password reset link:
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingProvider !== null}
                  className="w-full py-3 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loadingProvider === 'forgot' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#052610]" />
                  ) : (
                    <span>Send Password Reset Email</span>
                  )}
                </button>
              </form>
            )}

            {/* Tab 3 & 4: Sign In & Create Account */}
            {(activeAuthTab === 'signin' || activeAuthTab === 'signup') && (
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {activeAuthTab === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Anoj Kumar"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone (for Delivery SMS)</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Password {activeAuthTab === 'signup' && <span className="text-slate-400 font-normal">(min 6 chars)</span>}
                    </label>
                    {activeAuthTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setActiveAuthTab('forgot')}
                        className="text-[11px] text-[#0A3A1E] hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingProvider !== null}
                  className="w-full py-3 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                  id="auth-gate-submit-btn"
                >
                  {loadingProvider === 'email' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#052610]" />
                  ) : (
                    <>
                      <span>{activeAuthTab === 'signin' ? 'Sign In with Firebase' : 'Create Real Firebase Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Real-time Firebase Database Notice */}
          <div className="pt-1">
            <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 text-[11px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Google Firebase Auth & Firestore</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-[9px] border border-emerald-500/30">
                REAL AUTH
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

