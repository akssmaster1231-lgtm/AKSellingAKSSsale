import React, { useState, useEffect } from 'react';
import { Order, Product, Address, UserProfile } from '../types';
import { 
  Package, MapPin, User, HelpCircle, Store, ChevronRight, 
  Sparkles, Truck, PhoneCall, MessageSquare, Plus, Edit3, Trash2, 
  CheckCircle2, X, Check, Save, ChevronDown, ChevronUp, Clock, 
  ExternalLink, ArrowRight, ShieldCheck, CreditCard, Heart, ShoppingBag, 
  Headphones, AlertCircle, Info, RefreshCw, LogIn, LogOut, Database,
  Key, Shield, CheckCircle, Smartphone, Lock, Unlock, ToggleLeft, ToggleRight
} from 'lucide-react';
import { 
  loginWithGoogle,
  logOutUser,
  seedAllDataToFirebase,
  getFirebaseAuthErrorMessage,
  AppUser
} from '../lib/firebase';
import { 
  hasSupplierDashboardAccess, 
  isOwnerUser, 
  isOwnerSessionAuthorized,
  setOwnerSessionAuthorized, 
  revokeOwnerAccess 
} from '../lib/authUtils';
import { OwnerAuthModal } from './OwnerAuthModal';

interface AccountViewProps {
  orders: Order[];
  onOpenProduct: (product: Product) => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  userProfile: UserProfile;
  onUpdateUserProfile?: (updatedProfile: UserProfile) => void;
  savedAddresses: Address[];
  onAddAddress?: (address: Address) => void;
  onUpdateAddress?: (address: Address) => void;
  onDeleteAddress?: (id: string) => void;
  onSetDefaultAddress?: (id: string) => void;
  onOpenTrackingModal?: (order: Order) => void;
  onOpenSellerDashboard?: () => void;
  onOpenOrdersPage?: () => void;
  onOpenSupportPage?: () => void;
  firebaseUser?: AppUser | null;
  onRefreshData?: () => void;
  onOpenAuthModal?: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
  'Chhattisgarh', 'Delhi NCR', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 
  'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const AccountView: React.FC<AccountViewProps> = ({
  orders,
  onOpenProduct,
  wishlistCount,
  onOpenWishlist,
  userProfile,
  onUpdateUserProfile,
  savedAddresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onOpenTrackingModal,
  onOpenSellerDashboard,
  onOpenOrdersPage,
  onOpenSupportPage,
  firebaseUser,
  onRefreshData,
  onOpenAuthModal,
}) => {
  // Dedicated Modal State for each section (Flipkart app style)
  const [activeModal, setActiveModal] = useState<'orders' | 'addresses' | 'profile' | 'support' | 'firebase' | null>(null);

  // Orders Filter State (inside orders modal)
  const [orderFilter, setOrderFilter] = useState<'all' | 'in-transit' | 'delivered'>('all');

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState<UserProfile>({ ...userProfile });
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Address Management State
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [addrFormData, setAddrFormData] = useState<Omit<Address, 'id'>>({
    name: userProfile.name || 'Anoj Kumar',
    phone: '9876543210',
    house: '',
    street: '',
    landmark: '',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    type: 'Home',
    isDefault: false,
  });

  // Support FAQs & Ticket state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Firebase Auth State
  const [authLoading, setAuthLoading] = useState<'google' | 'signout' | 'seed' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [firebaseSeedSuccess, setFirebaseSeedSuccess] = useState<string | null>(null);

  // Secret Store Owner Switch & Authorization State
  const [showOwnerAuthModal, setShowOwnerAuthModal] = useState(false);
  const [isOwnerModeActive, setIsOwnerModeActive] = useState(() => hasSupplierDashboardAccess(firebaseUser));

  useEffect(() => {
    setIsOwnerModeActive(hasSupplierDashboardAccess(firebaseUser));
  }, [firebaseUser]);

  const handleToggleOwnerSwitch = () => {
    if (isOwnerModeActive) {
      if (onOpenSellerDashboard) {
        onOpenSellerDashboard();
      }
    } else {
      setShowOwnerAuthModal(true);
    }
  };

  const handleLockOwnerMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    revokeOwnerAccess();
    setIsOwnerModeActive(false);
  };

  const handleSeedAllFirebase = async () => {
    setAuthLoading('seed');
    try {
      const res = await seedAllDataToFirebase();
      if (res.success) {
        setFirebaseSeedSuccess(res.message);
        if (onRefreshData) onRefreshData();
      } else {
        setAuthError(res.message);
      }
    } catch (e: any) {
      setAuthError(e?.message || 'Failed to seed data');
    } finally {
      setAuthLoading(null);
    }
  };

  const inTransitCount = orders.filter((o) => o.status !== 'Delivered').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  // Update profileForm when userProfile prop changes
  useEffect(() => {
    setProfileForm({ ...userProfile });
  }, [userProfile]);

  // Social Auth Handlers (1-tap Google Login via Firebase)
  const handleGoogleLogin = async () => {
    setAuthLoading('google');
    setAuthError(null);
    try {
      const { error, user } = await loginWithGoogle();
      if (error && !user) {
        setAuthError(getFirebaseAuthErrorMessage(error));
        if (onOpenAuthModal) {
          onOpenAuthModal();
        }
      }
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setAuthError(getFirebaseAuthErrorMessage(err));
    } finally {
      setAuthLoading(null);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading('signout');
    await logOutUser();
    if (onRefreshData) onRefreshData();
    setAuthLoading(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUserProfile) {
      onUpdateUserProfile(profileForm);
    }
    setProfileSavedToast(true);
    setTimeout(() => {
      setProfileSavedToast(false);
      setActiveModal(null);
    }, 1200);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressId) {
      if (onUpdateAddress) {
        onUpdateAddress({ id: editingAddressId, ...addrFormData });
      }
      setEditingAddressId(null);
    } else {
      const newId = `addr-${Date.now()}`;
      if (onAddAddress) {
        onAddAddress({ id: newId, ...addrFormData });
      }
      setIsAddingNewAddr(false);
    }
    // reset form
    setAddrFormData({
      name: userProfile.name || 'Anoj Kumar',
      phone: '9876543210',
      house: '',
      street: '',
      landmark: '',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      type: 'Home',
      isDefault: false,
    });
  };

  const handleStartEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setIsAddingNewAddr(false);
    setAddrFormData({
      name: addr.name,
      phone: addr.phone,
      house: addr.house,
      street: addr.street,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault || false,
    });
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'in-transit') return o.status !== 'Delivered';
    if (orderFilter === 'delivered') return o.status === 'Delivered';
    return true;
  });

  const faqs = [
    {
      q: 'How do I track my order live?',
      a: 'Go to "My Orders" and click on any order card or the "Live Tracking" button. You will see real-time status from BlueDart/Delhivery, assigned courier agent phone contact, and your secure OTP.',
    },
    {
      q: 'How does Firebase Cloud Firestore sync my data?',
      a: 'AKSelling is powered by Google Firebase Cloud Firestore database. Your profile, delivery addresses, and completed orders are securely synchronized in real-time across all your sessions and devices.',
    },
    {
      q: 'What is the fabric and GSM quality of AKSelling T-Shirts?',
      a: 'All AKSelling drops are crafted from 240+ GSM 100% Super-Combed French Terry Cotton with Bio-Washed treatment, pre-shrunk fabric, and high-density precision screenprints.',
    },
    {
      q: 'What is the return & exchange policy?',
      a: 'We offer an instant 7-day hassle-free doorstep size exchange and refund. You can request it directly via 24x7 WhatsApp support or the ticket form below.',
    },
    {
      q: 'What payment options are supported?',
      a: 'We support official Razorpay 256-bit SSL payments, 1-tap Google Pay, PhonePe, Paytm UPI Intent, Dynamic Merchant QR, Visa/Mastercard/RuPay cards, and Net Banking.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-12 space-y-4" id="account-hub-view">
      
      {/* ================= 1. FIREBASE REAL-TIME CLOUD SYNC STATUS BAR ================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 text-white rounded-2xl p-3.5 sm:p-4 border border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-white">
                Firebase Cloud Firestore
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {firebaseUser ? `Logged in: ${firebaseUser.email}` : 'Profiles, Orders & Addresses live-synced in Google Cloud Firebase'}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-xs bg-emerald-900/40 text-emerald-300 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Firebase Secure</span>
        </div>
      </div>

      {/* ================= 2. 1-TAP SOCIAL LOGIN & USER PROFILE HEADER ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="relative shrink-0">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#2874F0]/30 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#2874F0]/10 text-[#2874F0] border-2 border-[#2874F0]/20 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xs">
                  {userProfile.name.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'AK'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {userProfile.name}
                </h1>
                <span className="bg-amber-100 text-amber-900 border border-amber-300/60 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>{userProfile.memberTier || 'AK PLUS GOLD'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {userProfile.email} • +91 {userProfile.phone}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-600">
                <span className="text-[#2874F0] font-bold">
                  {userProfile.superCoins || 520} SuperCoins
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Free Express Delivery</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setProfileForm({ ...userProfile });
                setActiveModal('profile');
              }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              id="btn-edit-profile-top"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#2874F0]" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Social Logins & Email Auth (Firebase Auth) */}
        {!firebaseUser && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Account Authentication (Firebase Auth)</span>
              <span className="text-[10px] text-slate-400">Persistent Session • Instant Cloud Sync</span>
            </div>

            {authError && (
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Continue with Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading === 'google'}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2.5 hover:border-slate-400 active:scale-[0.99] cursor-pointer"
                id="btn-login-google"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{authLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* Sign In with Email / Password */}
              <button
                onClick={() => onOpenAuthModal?.()}
                className="w-full bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] font-black text-xs py-2.5 px-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                id="btn-login-email"
              >
                <LogIn className="w-4 h-4" />
                <span>Email & Password Login</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= 3. CLEAN VERTICAL MENU LIST (FLIPKART STYLE) ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden" id="account-vertical-menu">
        
        {/* Menu Item 1: My Orders */}
        <button
          onClick={() => onOpenOrdersPage ? onOpenOrdersPage() : setActiveModal('orders')}
          className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
          id="menu-item-orders"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2874F0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-[#2874F0] transition-colors">
                  My Orders
                </span>
                {inTransitCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Truck className="w-3 h-3 text-amber-700" />
                    <span>{inTransitCount} In Transit</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {orders.length} total orders • Live tracking, tax invoice & returns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#2874F0] hidden sm:inline">
              View All
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2874F0] group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Menu Item 2: Saved Addresses */}
        <button
          onClick={() => setActiveModal('addresses')}
          className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors group"
          id="menu-item-addresses"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Saved Addresses
                </span>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {savedAddresses.length} saved
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {defaultAddress ? `Default: ${defaultAddress.house}, ${defaultAddress.city}` : 'Manage delivery addresses & locations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-emerald-700 hidden sm:inline">
              Manage
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Menu Item 3: Edit Profile */}
        <button
          onClick={() => {
            setProfileForm({ ...userProfile });
            setActiveModal('profile');
          }}
          className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors group"
          id="menu-item-profile"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors block">
                Edit Profile
              </span>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Personal details, email, registered mobile & SuperCoins balance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-indigo-700 hidden sm:inline">
              Edit
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Menu Item 4: 24x7 Help Center & Support */}
        <button
          onClick={() => onOpenSupportPage ? onOpenSupportPage() : setActiveModal('support')}
          className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
          id="menu-item-support"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#0A3A1E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-[#0A3A1E] transition-colors">
                  24x7 Help Center & Support
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Instant Support
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Customer service, order queries, returns & FAQs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#0A3A1E] hidden sm:inline">
              Get Help
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0A3A1E] group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Menu Item 5: Wishlist Shortcut */}
        <button
          onClick={onOpenWishlist}
          className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors group cursor-pointer"
          id="menu-item-wishlist"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-rose-100" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  My Wishlist
                </span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount} saved items
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Saved t-shirts, exclusive streetwear drops & size alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-rose-600 hidden sm:inline">
              View Items
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>
      </div>

      {/* ================= 4. SECURE STORE OWNER & SUPPLIER PORTAL (STORE ADMIN ONLY) ================= */}
      
        <div className={`rounded-2xl border transition-all overflow-hidden ${
          isOwnerModeActive 
            ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white border-emerald-300 shadow-sm ring-1 ring-emerald-500/20' 
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div 
            onClick={handleToggleOwnerSwitch}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left cursor-pointer group"
            id="menu-item-seller-hub"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                isOwnerModeActive 
                  ? 'bg-[#0A3A1E] text-white shadow-sm ring-2 ring-[#FFC107]/60' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {isOwnerModeActive ? (
                  <Store className="w-5 h-5 text-[#FFC107]" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-extrabold transition-colors ${
                    isOwnerModeActive ? 'text-[#0A3A1E]' : 'text-slate-800'
                  }`}>
                    {isOwnerModeActive ? 'Store Owner & Supplier Hub' : 'Store Owner Access'}
                  </span>
                  {isOwnerModeActive ? (
                    <span className="bg-[#0A3A1E] text-[#FFC107] text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider border border-[#FFC107]/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107] animate-pulse" />
                      Owner Mode Active
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
                      Restricted Area
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {isOwnerModeActive
                    ? 'Switch between Buyer Storefront and Full Supplier Operations Dashboard'
                    : 'Requires verified store administrator credentials or Master PIN'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isOwnerModeActive ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenSellerDashboard) onOpenSellerDashboard();
                    }}
                    className="bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Open Supplier Dashboard"
                  >
                    <Store className="w-3.5 h-3.5 text-[#052610]" />
                    <span className="hidden sm:inline">Launch Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLockOwnerMode}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                    title="Lock Owner Session"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 group-hover:text-slate-900">
                  <span className="hidden sm:inline bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    Authorize
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>
          
        

      {/* ================= 5. PROMINENT LOGOUT BUTTON (E-COMMERCE STYLE) ================= */}
      {firebaseUser ? (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={authLoading === 'signout'}
            className="w-full py-3.5 px-4 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-rose-600 hover:text-rose-700 font-bold text-sm rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50"
            id="btn-prominent-logout"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{authLoading === 'signout' ? 'Signing Out...' : `Log Out (${firebaseUser.email || 'Account'})`}</span>
          </button>
        </div>
      ) : (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onOpenAuthModal?.()}
            className="w-full py-3.5 px-4 bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="btn-prominent-login"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register with Google or Email</span>
          </button>
        </div>
      )}

      {/* Trust & Guarantee Badges Footer */}
      <div className="grid grid-cols-3 gap-2 text-center text-slate-500 text-[11px] pt-2">
        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-[#2874F0]" />
          <span className="font-bold text-slate-800">100% Genuine</span>
          <span className="text-[10px] text-slate-400">AK Authenticated</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col items-center gap-1">
          <RefreshCw className="w-4 h-4 text-[#0A3A1E]" />
          <span className="font-bold text-slate-800">7 Days Return</span>
          <span className="text-[10px] text-slate-400">Doorstep Exchange</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col items-center gap-1">
          <Truck className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-800">Free Delivery</span>
          <span className="text-[10px] text-slate-400">On Orders Above ₹499</span>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: MY ORDERS & LIVE DELIVERY TRACKING (Flipkart Style Modal)
      ========================================================================== */}
      {activeModal === 'orders' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            id="modal-my-orders"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2874F0] flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">My Orders</h2>
                  <p className="text-xs text-slate-500">{orders.length} orders synchronized with Firebase Cloud Firestore</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 text-xs font-bold overflow-x-auto no-scrollbar">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  orderFilter === 'all' 
                    ? 'bg-[#2874F0] text-white shadow-xs' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('in-transit')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  orderFilter === 'in-transit' 
                    ? 'bg-[#2874F0] text-white shadow-xs' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                In Transit ({inTransitCount})
              </button>
              <button
                onClick={() => setOrderFilter('delivered')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  orderFilter === 'delivered' 
                    ? 'bg-[#2874F0] text-white shadow-xs' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                Delivered ({deliveredCount})
              </button>
            </div>

            {/* Modal Body: Orders List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No orders found in this category.</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      if (onOpenTrackingModal) {
                        onOpenTrackingModal(order);
                      }
                    }}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#2874F0]/60 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{order.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{order.date}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (order.status as string) === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (order.status as string) === 'Shipped' || order.status === 'In Transit'
                          ? 'bg-blue-100 text-[#2874F0]'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        ● {order.status}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <img
                        src={order.items[0]?.product.images[0]}
                        alt={order.items[0]?.product.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-18 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1 text-xs min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-[#2874F0] transition-colors truncate">
                          {order.items[0]?.product.title}
                        </h4>
                        {order.items.length > 1 && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            + {order.items.length - 1} more item(s) in package
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500">
                          Size: {order.items[0]?.selectedSize} • Qty: {order.items[0]?.quantity}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono font-black text-sm text-slate-950">
                            ₹{order.totalAmount.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-bold text-[#2874F0] flex items-center gap-1 group-hover:underline">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Track Live</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>

                        {/* Logistics Carrier & Live Telemetry Badge */}
                        <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${
                              order.logisticsProvider === 'NimbusPost'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {order.logisticsProvider === 'NimbusPost' ? 'NP' : 'SR'}
                            </span>
                            <span className="font-semibold text-slate-700">
                              {order.courierPartner || (order.logisticsProvider === 'NimbusPost' ? 'Delhivery Direct' : 'BlueDart Air')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-slate-500">
                            <span>AWB: <strong>{order.trackingNumber || 'Assigned'}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SAVED ADDRESSES (Flipkart Style Modal)
      ========================================================================== */}
      {activeModal === 'addresses' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            id="modal-saved-addresses"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Manage Delivery Addresses</h2>
                  <p className="text-xs text-slate-500">{savedAddresses.length} saved addresses (Firestore Synced)</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveModal(null);
                  setIsAddingNewAddr(false);
                  setEditingAddressId(null);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Add New Address Button Header */}
              {!isAddingNewAddr && !editingAddressId && (
                <button
                  onClick={() => {
                    setIsAddingNewAddr(true);
                    setEditingAddressId(null);
                  }}
                  className="w-full p-3.5 border-2 border-dashed border-[#2874F0]/40 rounded-2xl bg-blue-50/50 hover:bg-blue-50 text-[#2874F0] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  id="btn-add-new-address"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add a New Delivery Address</span>
                </button>
              )}

              {/* Add / Edit Address Form */}
              {(isAddingNewAddr || editingAddressId) && (
                <form onSubmit={handleSaveAddress} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddr(false);
                        setEditingAddressId(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={addrFormData.name}
                        onChange={(e) => setAddrFormData({ ...addrFormData, name: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">10-Digit Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={addrFormData.phone}
                        onChange={(e) => setAddrFormData({ ...addrFormData, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">PIN Code *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addrFormData.pincode}
                        onChange={(e) => setAddrFormData({ ...addrFormData, pincode: e.target.value.replace(/\D/g, '') })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">State *</label>
                      <select
                        value={addrFormData.state}
                        onChange={(e) => setAddrFormData({ ...addrFormData, state: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#2874F0]"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-800">House No., Building Name *</label>
                      <input
                        type="text"
                        required
                        value={addrFormData.house}
                        onChange={(e) => setAddrFormData({ ...addrFormData, house: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Road / Area / Sector *</label>
                      <input
                        type="text"
                        required
                        value={addrFormData.street}
                        onChange={(e) => setAddrFormData({ ...addrFormData, street: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">City / District *</label>
                      <input
                        type="text"
                        required
                        value={addrFormData.city}
                        onChange={(e) => setAddrFormData({ ...addrFormData, city: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addrFormData.isDefault}
                        onChange={(e) => setAddrFormData({ ...addrFormData, isDefault: e.target.checked })}
                        className="accent-[#2874F0] rounded"
                      />
                      <span className="font-bold text-slate-700">Make this my default delivery address</span>
                    </label>

                    <button
                      type="submit"
                      className="bg-[#2874F0] hover:bg-[#1259c7] text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              <div className="space-y-3">
                {savedAddresses.length === 0 && !isAddingNewAddr && !editingAddressId && (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No saved delivery addresses yet</p>
                    <p className="text-[11px] text-slate-400">Add your delivery address once and it will be permanently saved for your account.</p>
                  </div>
                )}
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{addr.name}</span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditAddress(addr)}
                          className="p-1 text-slate-500 hover:text-[#2874F0]"
                          title="Edit Address"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {savedAddresses.length > 1 && (
                          <button
                            onClick={() => onDeleteAddress && onDeleteAddress(addr.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      {addr.house}, {addr.street}{addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city}, {addr.state} - <strong className="font-mono">{addr.pincode}</strong>
                    </p>
                    <p className="text-slate-500 font-mono">
                      Phone: <strong>+91 {addr.phone}</strong>
                    </p>

                    {!addr.isDefault && (
                      <div className="pt-1">
                        <button
                          onClick={() => onSetDefaultAddress && onSetDefaultAddress(addr.id)}
                          className="text-[11px] text-[#2874F0] font-bold hover:underline"
                        >
                          Set as Default Address
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EDIT PROFILE (Flipkart Style Modal)
      ========================================================================== */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full sm:max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            id="modal-edit-profile"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500">Update your profile info (Firestore Synced)</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {profileSavedToast && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Profile updated & saved to Supabase!</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-600 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Email Address *</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-600 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Mobile Number (Registered)</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono outline-none focus:ring-1 focus:ring-indigo-600 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Gender</label>
                <select
                  value={profileForm.gender || 'Male'}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-600 text-slate-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>

              {/* SuperCoins & Perks Info */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>{profileForm.memberTier || 'AK PLUS GOLD VIP'}</span>
                  </div>
                  <span className="font-mono font-black text-amber-400">{profileForm.superCoins || 520} SuperCoins</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Enjoy free priority express delivery on all orders & early access to new streetwear drops.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#2874F0] hover:bg-[#1259c7] text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: 24X7 HELP CENTER & SUPPORT (Flipkart Style Modal)
      ========================================================================== */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            id="modal-help-center"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#0A3A1E] flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">24x7 Customer Support</h2>
                  <p className="text-xs text-slate-500">We are here to help you 24x7</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Support Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://wa.me/919876543210?text=Hi%20AKSelling%2C%20I%20need%20help%20with%20my%20order."
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0A3A1E] text-[#FFC107] flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-950 block">Chat on WhatsApp</span>
                    <span className="text-[11px] text-emerald-800 font-medium">Instant executive reply</span>
                  </div>
                </a>

                <a
                  href="tel:+919876543210"
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-950 block">Toll-Free Helpline</span>
                    <span className="text-[11px] text-slate-600 font-mono">+91 98765 43210</span>
                  </div>
                </a>
              </div>

              {/* Frequently Asked Questions */}
              <div className="space-y-2.5">
                <h3 className="font-bold text-slate-950 text-sm">Frequently Asked Questions</h3>
                <div className="space-y-2">
                  {faqs.map((faq, idx) => {
                    const isExpanded = expandedFaq === idx;
                    return (
                      <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                          className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between gap-3 text-left font-bold text-slate-900 transition-colors"
                        >
                          <span>{faq.q}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />}
                        </button>
                        {isExpanded && (
                          <div className="p-3 bg-white text-slate-600 leading-relaxed border-t border-slate-200">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ticket Submission */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-950">Report an Issue with an Order</h4>
                {ticketSubmitted ? (
                  <div className="bg-emerald-100 text-emerald-900 p-3 rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Ticket registered! Support executive will reach out within 2 hours.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Subject / Order ID (e.g. Sizing exchange for ORD-76192)"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#0A3A1E]"
                    />
                    <textarea
                      rows={2}
                      placeholder="Describe your issue or exchange request..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#0A3A1E]"
                    />
                    <button
                      onClick={() => {
                        if (ticketSubject.trim()) {
                          setTicketSubmitted(true);
                          setTimeout(() => setTicketSubmitted(false), 4000);
                          setTicketSubject('');
                          setTicketMessage('');
                        }
                      }}
                      className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl"
                    >
                      Submit Support Ticket
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: FIREBASE CLOUD DATABASE & LIVE STORAGE MANAGEMENT MODAL
      ========================================================================== */}
      {activeModal === 'firebase' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full sm:max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            id="modal-firebase-config"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Firebase Cloud Firestore</h2>
                  <p className="text-xs text-slate-500">Google Cloud Database, Auth & Real-Time Sync</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {firebaseSeedSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{firebaseSeedSuccess}</span>
                </div>
              )}

              {authError && (
                <div className="p-3 bg-rose-100 text-rose-900 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">Firebase Database Connected</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">● Active 100%</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <p><span className="text-slate-500">Project:</span> akselling-7e183</p>
                  <p className="break-all"><span className="text-slate-500">Auth Domain:</span> akselling-7e183.firebaseapp.com</p>
                  <p><span className="text-slate-500">Auth System:</span> Google Identity & Firebase Auth</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Active Firestore Collections:</span>
                <div className="grid grid-cols-2 gap-1.5 text-slate-700 font-mono text-[11px]">
                  <span className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-slate-500" /> /products ({orders.length > 0 ? 'Live' : 'Ready'})</span>
                  <span className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5 text-slate-500" /> /orders ({orders.length} Synced)</span>
                  <span className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-500" /> /users & addresses</span>
                  <span className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-slate-500" /> /payments (UPI/Cards)</span>
                  <span className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><Store className="w-3.5 h-3.5 text-slate-500" /> /seller_settings</span>
                  <span className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-slate-500" /> /payouts</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  All Data Permanently Routed to Firebase
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Every single action—Google/Email login, product updates, order placement, live BlueDart tracking, UPI transactions, seller bank details, and payouts—is synchronized live to your dedicated Firebase Firestore database (linked to <span className="font-semibold text-blue-950">akyadavprintaksellig@gmail.com</span>).
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleSeedAllFirebase}
                  disabled={authLoading === 'seed'}
                  className="w-full bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] font-black py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  id="btn-seed-firebase"
                >
                  <RefreshCw className={`w-4 h-4 ${authLoading === 'seed' ? 'animate-spin' : ''}`} />
                  <span>{authLoading === 'seed' ? 'Syncing Everything to Firebase...' : 'Re-sync & Seed All Data to Firebase Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Authentication Modal */}
      <OwnerAuthModal
        isOpen={showOwnerAuthModal}
        onClose={() => setShowOwnerAuthModal(false)}
        onSuccess={() => {
          setIsOwnerModeActive(true);
          if (onOpenSellerDashboard) {
            onOpenSellerDashboard();
          }
        }}
        currentUser={firebaseUser}
        onOpenGeneralLogin={onOpenAuthModal}
      />

    </div>
  );
};
