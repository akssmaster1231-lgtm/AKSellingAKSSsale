import React, { useState } from 'react';
import { 
  ShieldCheck, Sparkles, Database, Lock, AlertCircle, 
  CheckCircle2, ArrowRight, Truck, Gift, RefreshCw, Key,
  Mail, User, Phone, Eye, EyeOff, Smartphone, KeyRound, ShoppingBag, Shield
} from 'lucide-react';
import { 
  loginWithGoogle,
  registerWithEmailPassword,
  loginWithEmailPassword,
  resetPasswordEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  getFirebaseAuthErrorMessage,
  AppUser
} from '../lib/firebase';
import { UserProfile } from '../types';

interface LoginPageProps {
  onAuthenticated: (user: AppUser, profile: UserProfile) => void;
  onExploreAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated, onExploreAsGuest }) => {
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

  // 1. Google 1-Tap / Popup Login via Firebase Auth
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
          name: user.name || 'AK Member',
          email: user.email || 'user@akselling.in',
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
        setSuccessMsg(`OTP sent to +91 ${cleanNumber.slice(-10)}. Test code: ${res.simulatedOtp}`);
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
            name: user.name || fullName || 'AK Member',
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
            name: user.name || 'AK Member',
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
      setSuccessMsg(`Password reset link sent to ${email}. Check your inbox.`);
    } else {
      setErrorMsg(getFirebaseAuthErrorMessage(res.error));
    }
  };

  return (
    <div className="min-h-screen bg-[#052610] flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-[#FFC107] selection:text-[#052610]">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFC107]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#0A3A1E]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#FFC107]/30 z-10 flex flex-col animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-[#0A3A1E] to-[#052610] p-6 text-white text-center relative overflow-hidden border-b border-[#134e2c]">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFC107] text-[#052610] shadow-lg mb-3">
            <ShoppingBag className="w-7 h-7 stroke-[2.5]" />
          </div>
          
          <h1 className="text-2xl font-black tracking-tight font-display text-white">AKSELLING</h1>
          <p className="text-xs text-emerald-200 font-medium mt-1">
            Official Fashion &amp; Oversized Streetwear Hub
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 bg-[#FFC107]/15 px-3 py-1 rounded-full text-[11px] font-bold text-[#FFD700] border border-[#FFC107]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>Fast &amp; Secure Cloud Login</span>
            </div>
            {onExploreAsGuest && (
              <button
                type="button"
                onClick={onExploreAsGuest}
                className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-[#FFC107] px-3 py-1 rounded-full text-[11px] font-bold transition-all border border-[#FFC107]/40 cursor-pointer"
              >
                <span>Browse as Guest</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Benefits bar */}
        <div className="bg-[#052610] px-4 py-2 border-b border-[#134e2c] flex items-center justify-around text-xs text-emerald-200 font-semibold">
          <div className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#FFC107]" />
            <span>Free Express</span>
          </div>
          <div className="flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>650 SuperCoins</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Sync</span>
          </div>
        </div>

        {/* Login Body */}
        <div className="p-6 space-y-4 bg-white">
          
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Option 1: 1-Tap Google Sign-In */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loadingProvider !== null}
              className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-[#FFC107] text-slate-800 font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              id="main-login-google-btn"
            >
              {loadingProvider === 'google' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>1-Tap Google Sign-In</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Or Choose Login Method
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
                  activeAuthTab === 'phone' ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signin'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeAuthTab === 'signin' ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Email Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signup'); setErrorMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeAuthTab === 'signup' ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('forgot'); setErrorMsg(null); }}
                className={`py-1.5 px-2 rounded-lg transition-all ${
                  activeAuthTab === 'forgot' ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Reset
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
                          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-r-xl focus:border-[#0A3A1E] focus:outline-none font-medium"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Instant SMS verification OTP will be sent to your number.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingProvider !== null || phoneInput.length < 10}
                      className="w-full py-3 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                      id="main-login-send-otp-btn"
                    >
                      {loadingProvider === 'phone' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
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
                        Change
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
                      id="main-login-verify-otp-btn"
                    >
                      {loadingProvider === 'phone' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Access Store</span>
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
                      placeholder="support.akselling@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingProvider !== null || !email}
                  className="w-full py-2.5 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loadingProvider === 'forgot' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
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
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Number (Optional)</label>
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
                      placeholder="akyadavprintaksellig@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0A3A1E] focus:outline-none"
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
                  disabled={loadingProvider !== null || !email || password.length < 6}
                  className="w-full py-3 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                  id="main-login-submit-btn"
                >
                  {loadingProvider === 'email' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{activeAuthTab === 'signup' ? 'Create Account & Enter' : 'Sign In to Store'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Optional Guest Explorer Link */}
            {onExploreAsGuest && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onExploreAsGuest}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Continue to Storefront as Guest</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0A3A1E]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Firebase Cloud Authentication • 100% Secure</span>
          </p>
        </div>

      </div>
    </div>
  );
};
