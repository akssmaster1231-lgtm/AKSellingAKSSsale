import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingBag, Heart, Camera, MoreVertical, X, Sparkles, 
  MessageCircle, Mic, CheckCircle2, Package, ShieldCheck, ChevronDown, MapPin,
  User, LogIn, Store, ArrowLeftRight, LocateFixed, Truck, Volume2, MicOff, Zap
} from 'lucide-react';
import { TabType, DeliveryZoneInfo } from '../types';
import { isOwnerUser, isOwnerSessionAuthorized } from '../lib/authUtils';
import { 
  lookupPincodeAsync, 
  autoDetectLocationAndPincode, 
  saveActiveDeliveryLocation, 
  getSavedDeliveryLocation 
} from '../utils/pincodeService';

const DESKTOP_CATEGORIES = [
  { label: 'All Styles', value: 'All' },
  { label: 'Oversized Tees (240 GSM)', value: 'Oversized' },
  { label: 'Jeans & Denim', value: 'Jeans & Denim' },
  { label: 'Cargo Pants', value: 'Cargo Pants' },
  { label: 'Hoodies & Sweats', value: 'Hoodies & Sweats' },
  { label: 'Graphic DTF', value: 'Graphic' },
  { label: 'Shirts & Trousers', value: 'Shirts & Trousers' },
  { label: 'Acid Wash Vintage', value: 'Acid Wash' },
  { label: 'Anime & Gaming', value: 'Anime & Gaming' },
  { label: 'Plain Basics', value: 'Plain Basics' },
  { label: 'Gym & Active', value: 'Gym & Active' },
];

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenWishlist?: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  firebaseUser?: any;
  onOpenLogin?: () => void;
  onOpenSellerDashboard?: () => void;
  onToggleMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  searchQuery,
  setSearchQuery,
  onOpenWishlist,
  selectedCategory,
  setSelectedCategory,
  firebaseUser,
  onOpenLogin,
  onOpenSellerDashboard,
  onToggleMode,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pincode, setPincode] = useState('122002');
  const [city, setCity] = useState('Gurugram, Haryana');
  const [inputPincode, setInputPincode] = useState('');
  const [previewZone, setPreviewZone] = useState<DeliveryZoneInfo | null>(null);
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectLocationMsg, setDetectLocationMsg] = useState<string | null>(null);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const recognitionRef = useRef<any>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Load saved delivery location on start
  useEffect(() => {
    const saved = getSavedDeliveryLocation();
    if (saved && saved.pincode) {
      setPincode(saved.pincode);
      setCity(`${saved.city}, ${saved.state}`);
    } else {
      lookupPincodeAsync('122002').then((zone) => {
        setPincode(zone.pincode);
        setCity(`${zone.city}, ${zone.state}`);
        saveActiveDeliveryLocation(zone);
      });
    }

    const handleLocationEvent = (e: any) => {
      if (e.detail && e.detail.pincode) {
        setPincode(e.detail.pincode);
        setCity(`${e.detail.city}, ${e.detail.state}`);
      }
    };

    window.addEventListener('akselling_location_changed', handleLocationEvent);
    return () => window.removeEventListener('akselling_location_changed', handleLocationEvent);
  }, []);

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Pincode auto-lookup whenever input changes to 6 digits
  useEffect(() => {
    const cleaned = inputPincode.replace(/\D/g, '');
    if (cleaned.length === 6) {
      setIsLookingUpPin(true);
      lookupPincodeAsync(cleaned).then((zone) => {
        setPreviewZone(zone);
        setIsLookingUpPin(false);
      });
    } else {
      setPreviewZone(null);
      setIsLookingUpPin(false);
    }
  }, [inputPincode]);

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputPincode.replace(/\D/g, '');
    if (cleaned.length === 6) {
      setIsLookingUpPin(true);
      const zone = await lookupPincodeAsync(cleaned);
      setPincode(zone.pincode);
      setCity(`${zone.city}, ${zone.state}`);
      saveActiveDeliveryLocation(zone);
      setIsLookingUpPin(false);
      setShowLocationModal(false);
      setInputPincode('');
    }
  };

  const handleAutoDetectGPS = async () => {
    setIsDetectingLocation(true);
    setDetectLocationMsg('Accessing GPS coordinates...');
    try {
      const zone = await autoDetectLocationAndPincode();
      if (zone && zone.pincode) {
        setPincode(zone.pincode);
        setCity(`${zone.city}, ${zone.state}`);
        setInputPincode(zone.pincode);
        setPreviewZone(zone);
        setDetectLocationMsg(`Detected: ${zone.city}, ${zone.state} (${zone.pincode})`);
      }
    } catch {
      setDetectLocationMsg('GPS permission denied. Please enter 6-digit Pincode.');
    } finally {
      setIsDetectingLocation(false);
      setTimeout(() => setDetectLocationMsg(null), 3000);
    }
  };

  // Web Speech API Voice Search Implementation
  const startVoiceSearch = () => {
    setVoiceError(null);
    setVoiceTranscript('');
    setShowVoiceModal(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback if browser does not support Web Speech API natively
      setIsListening(true);
      setVoiceTranscript('Listening...');
      setTimeout(() => {
        const samplePhrases = [
          'Oversized 240 GSM',
          'Anime Graphic Tees',
          'Acid Wash Vintage',
          'Black Cotton Tee',
          'Waffle Knit Polo',
        ];
        const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
        setVoiceTranscript(randomPhrase);
        setSearchQuery(randomPhrase);
        setActiveTab('home');
        setIsListening(false);
        setTimeout(() => setShowVoiceModal(false), 1200);
      }, 1400);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('Listening... Speak now (e.g. "oversized anime t-shirt")');
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        const currentText = finalText || interimText;
        if (currentText) {
          setVoiceTranscript(currentText);
          setSearchQuery(currentText);
          setActiveTab('home');
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          setVoiceError(`Voice input notice: ${event.error || 'Please speak clearly'}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setVoiceError('Microphone access was blocked or is unavailable.');
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleSelectQuickQuery = (phrase: string) => {
    setSearchQuery(phrase);
    setActiveTab('home');
    setShowVoiceModal(false);
    stopVoiceSearch();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A3A1E] text-white shadow-lg border-b border-[#134e2c] select-none" id="whatsapp-app-header">
      {/* 1. Main Official Brand Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Store Branding with Full Official Logo */}
        <div 
          onClick={() => { setActiveTab('home'); setSelectedCategory('All'); }}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink-0"
          id="app-branding-logo"
        >
          {/* Clean Circular Brand Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#FFC107] to-[#FFD700] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#052610] flex items-center justify-center text-[#FFC107] font-serif font-black text-base border border-[#FFC107]/30">
                AK
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#FFC107] border-2 border-[#0A3A1E] rounded-full shadow-xs"></span>
          </div>

          {/* Business Title & Status */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-[#FFC107] transition-colors font-display">
                AKSELLING
              </span>
              <span className="inline-flex items-center gap-0.5 bg-[#FFC107]/20 text-[#FFD700] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#FFC107]/40">
                <CheckCircle2 className="w-2.5 h-2.5 fill-[#FFC107] text-[#052610]" />
                <span className="hidden xs:inline">Official Store</span>
              </span>
            </div>
            <span className="text-[11px] text-emerald-100/90 font-medium -mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107] inline-block animate-pulse"></span>
              <span>Official Fashion &amp; Streetwear • Online</span>
            </span>
          </div>
        </div>

        {/* Desktop Deliver-to Selector (Amazon/Flipkart style) */}
        <button
          onClick={() => setShowLocationModal(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer shrink-0 border border-white/10"
          id="desktop-location-selector-btn"
          title="Change delivery location"
        >
          <MapPin className="w-4 h-4 text-[#FFC107] shrink-0" />
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="text-emerald-200/80 font-normal">Deliver to</span>
            <span className="font-bold text-white truncate max-w-[110px] lg:max-w-[140px]">{city} ({pincode})</span>
          </div>
          <ChevronDown className="w-3 h-3 text-emerald-300 ml-0.5" />
        </button>

        {/* Center: Desktop Expanded Flipkart/Amazon Style Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-2 lg:mx-4">
          <div className="relative w-full flex items-center bg-white rounded-full shadow-inner border border-[#134e2c]">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="desktop-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 240+ GSM Tees, Cargo Pants, Denim Jeans, Hoodies..."
              className="w-full pl-10 pr-20 py-2 text-xs lg:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 outline-none font-medium rounded-full"
            />

            <div className="absolute right-2.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={startVoiceSearch}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-500 hover:text-[#0A3A1E] hover:bg-slate-100'
                }`}
                title="Voice Search"
                id="desktop-voice-search-btn"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Quick Nav Links (Flash Deals, Orders) */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'deals' ? 'bg-[#FFC107] text-[#052610]' : 'text-emerald-100 hover:text-[#FFC107] hover:bg-white/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#FFC107]" />
            <span>Deals</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#FFC107] text-[#052610]' : 'text-emerald-100 hover:text-[#FFC107] hover:bg-white/10'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-300" />
            <span>Orders</span>
          </button>
        </div>

        {/* Right: Top Action Icons (Camera, Wishlist, Cart, 3-Dots Menu) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Camera Icon */}
          <button
            onClick={() => alert('AK Camera: Snap or upload your fit check to get instant size recommendations!')}
            className="p-2 text-white/90 hover:text-[#FFC107] hover:bg-white/10 rounded-full transition-colors hidden xs:flex"
            title="Camera / Fit Check"
            id="whatsapp-camera-btn"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={onOpenWishlist}
            id="header-wishlist-button"
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
            title="Saved Wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-[#FFC107] fill-[#FFC107]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#FFC107] text-[#052610] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon with Gold Badge */}
          <button
            onClick={() => setActiveTab('cart')}
            id="header-cart-button"
            className="p-2 text-white/90 hover:text-[#FFC107] hover:bg-white/10 rounded-full transition-colors relative"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-0.5 bg-[#FFC107] text-[#052610] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md font-mono">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Sign In / Profile Quick Button */}
          {firebaseUser ? (
            <button
              onClick={() => setActiveTab('account')}
              className="p-1 rounded-full hover:ring-2 hover:ring-[#FFC107] transition-all ml-0.5"
              title="My Account"
              id="header-account-profile-btn"
            >
              <img
                src={firebaseUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt="Account"
                className="w-7 h-7 rounded-full object-cover border border-[#FFC107]/50"
              />
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] font-black text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm ml-0.5 cursor-pointer"
              title="Sign In"
              id="header-login-quick-btn"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* 3-Dots Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              id="whatsapp-menu-dots-btn"
              className="p-2 text-white/90 hover:text-[#FFC107] hover:bg-white/10 rounded-full transition-colors"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-11 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                {!firebaseUser && (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onOpenLogin?.();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 flex items-center gap-2 font-bold text-[#0A3A1E]"
                    >
                      <LogIn className="w-4 h-4 text-[#0A3A1E]" />
                      <span>Sign In / Create Account</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setSelectedCategory('Oversized');
                    setActiveTab('home');
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <Sparkles className="w-4 h-4 text-[#0A3A1E]" />
                  <span>New Drops (240 GSM)</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setActiveTab('deals');
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <Sparkles className="w-4 h-4 text-[#FFC107]" />
                  <span>Flash Sale &amp; Deals</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setActiveTab('orders');
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-100 flex items-center gap-2 font-medium"
                  id="header-menu-orders-btn"
                >
                  <Package className="w-4 h-4 text-[#0A3A1E]" />
                  <span>My Orders &amp; Tracking</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenWishlist?.();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Saved Wishlist ({wishlistCount})</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setActiveTab('support');
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-100 flex items-center gap-2 font-medium text-slate-700"
                  id="header-menu-support-btn"
                >
                  <MessageCircle className="w-4 h-4 text-[#0A3A1E]" />
                  <span>Customer Support &amp; Help Desk</span>
                </button>
                {(isOwnerUser(firebaseUser) || isOwnerSessionAuthorized()) && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onOpenSellerDashboard?.();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 flex items-center gap-2 font-bold text-[#0A3A1E]"
                    >
                      <Store className="w-4 h-4 text-[#0A3A1E]" />
                      <span>Supplier Dashboard (Owner)</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mobile Search Bar (Only shown on small screens) */}
      <div className="md:hidden bg-[#0A3A1E] pb-3 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative flex items-center bg-white rounded-full shadow-inner border border-[#134e2c]">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="search-products-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, sizes, fabrics, drops..."
              className="w-full pl-10 pr-20 py-2 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 outline-none font-medium rounded-full"
            />

            <div className="absolute right-2.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={startVoiceSearch}
                className={`p-1.5 rounded-full transition-colors ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-500 hover:text-[#0A3A1E] hover:bg-slate-100'
                }`}
                title="Voice Search"
                id="voice-search-btn"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2b. Desktop Flipkart-Style Category Navigation Ribbon */}
      <div className="hidden md:block bg-[#052610] border-b border-[#134e2c] text-emerald-100 overflow-x-auto no-scrollbar py-2 px-3 sm:px-6 shadow-xs" id="desktop-category-ribbon">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {DESKTOP_CATEGORIES.map((cat) => {
              const isActive = (cat.value === 'All' && selectedCategory === 'All') || selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setActiveTab('home');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-[#FFC107] text-[#052610] shadow-sm'
                      : 'bg-white/5 hover:bg-white/15 text-emerald-100 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-3 text-[11px] text-emerald-300 font-semibold shrink-0 pl-2">
            <span className="flex items-center gap-1 text-[#FFC107]">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Bio-Wash Cotton
            </span>
            <span className="text-emerald-700">•</span>
            <span className="flex items-center gap-1 text-white">
              <Truck className="w-3.5 h-3.5 text-[#FFC107]" />
              Same-Day Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* 3. Mobile Delivery & Assurance Sub-strip */}
      <div className="md:hidden bg-[#052610] text-emerald-200 text-xs px-3 sm:px-6 py-1.5 border-b border-[#134e2c] flex items-center justify-between">
        <button 
          onClick={() => setShowLocationModal(true)}
          className="flex items-center gap-1.5 hover:text-[#FFC107] transition-colors font-medium group"
          id="pincode-picker-btn"
        >
          <MapPin className="w-3.5 h-3.5 text-[#FFC107] group-hover:scale-110 transition-transform" />
          <span>Deliver to <strong className="text-white font-bold">{city} ({pincode})</strong></span>
          <ChevronDown className="w-3 h-3 text-emerald-400 group-hover:text-white" />
        </button>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-[#FFC107] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFC107]" />
            100% Cotton Assured
          </span>
          <span className="text-emerald-100 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#FFC107]" />
            Same-Day
          </span>
        </div>
      </div>

      {/* Location Pincode Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0A3A1E]" />
                <h3 className="font-bold text-slate-900 text-base">Select Delivery Location</h3>
              </div>
              <button 
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter your 6-digit postal pincode to calculate express delivery speed and cash on delivery availability.
            </p>
            <form onSubmit={handlePincodeSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={inputPincode}
                  onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode (e.g. 110001)"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FFC107] focus:border-[#0A3A1E] outline-none font-mono"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inputPincode.length !== 6}
                  className="flex-1 px-4 py-2 text-xs font-bold text-[#052610] bg-[#FFC107] hover:bg-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
                >
                  Apply Pincode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

