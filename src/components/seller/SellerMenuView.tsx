import React, { useState, useEffect } from 'react';
import { SellerBankDetails, SellerPickupAddress, PayoutRecord, Product, Order, ReturnRecord, ClaimRecord, Story, HeroBanner, CreatorProfile } from '../../types';
import { 
  Tag, ShieldCheck, UploadCloud, CreditCard, Star, 
  MapPin, BarChart3, Database, RefreshCw, ChevronRight,
  ExternalLink, Building, QrCode, Phone, User, CheckCircle2,
  Sparkles, Layers, Eye, Smartphone, AlertCircle, Check, X,
  Video, Flame, Zap, Navigation, Clock, Truck, ShieldAlert
} from 'lucide-react';
import { StoryBannerManager } from './StoryBannerManager';
import { INITIAL_SELLER_PICKUP_ADDRESS } from '../../data/mockData';
import { saveSellerPickupAddressToFirestore } from '../../lib/firebase';
import { LogisticsFulfillmentModal } from './LogisticsFulfillmentModal';

interface SellerMenuViewProps {
  products: Product[];
  orders: Order[];
  returns: ReturnRecord[];
  claims?: ClaimRecord[];
  payouts: PayoutRecord[];
  bankDetails: SellerBankDetails;
  stories?: Story[];
  banners?: HeroBanner[];
  creatorProfile?: CreatorProfile;
  onUpdateCreatorProfile?: (profile: CreatorProfile) => void;
  onSaveBankDetails: (updated: SellerBankDetails) => void;
  onOpenAddCatalog: () => void;
  onNavigateToTab: (tab: 'home' | 'orders' | 'returns' | 'inventory') => void;
  onRefreshData?: () => void;
  onToggleStorefront?: () => void;
  onAddStory?: (story: Story) => void;
  onUpdateStory?: (storyId: string, updates: Partial<Story>) => void;
  onDeleteStory?: (storyId: string) => void;
  onAddBanner?: (banner: HeroBanner) => void;
  onUpdateBanner?: (bannerId: string, updates: Partial<HeroBanner>) => void;
  onDeleteBanner?: (bannerId: string) => void;
  onPreviewStory?: (story: Story) => void;
  firebaseUser?: any;
}

export const SellerMenuView: React.FC<SellerMenuViewProps> = ({
  products,
  orders,
  returns,
  claims = [],
  payouts,
  bankDetails,
  stories = [],
  banners = [],
  creatorProfile,
  onUpdateCreatorProfile,
  onSaveBankDetails,
  onOpenAddCatalog,
  onNavigateToTab,
  onRefreshData,
  onToggleStorefront,
  onAddStory,
  onUpdateStory,
  onDeleteStory,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  onPreviewStory,
  firebaseUser,
}) => {
  // Modal / Drawer state for sub-sections
  const [activeModal, setActiveModal] = useState<
    'none' | 'stories_banners' | 'pricing' | 'claims' | 'payments' | 'quality' | 'warehouse' | 'analytics' | 'database' | 'logistics' | 'upload'
  >('none');

  // Bank Form State
  const [bankForm, setBankForm] = useState<SellerBankDetails>(bankDetails);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankSaveSuccess, setBankSaveSuccess] = useState(false);

  // Warehouse Pickup Address Form State
  const [pickupForm, setPickupForm] = useState<SellerPickupAddress>(
    bankDetails.pickupAddressDetails || INITIAL_SELLER_PICKUP_ADDRESS
  );
  const [warehouseSaved, setWarehouseSaved] = useState(false);
  const [isSavingPickup, setIsSavingPickup] = useState(false);

  // Sync state if bankDetails prop updates
  useEffect(() => {
    if (bankDetails.pickupAddressDetails) {
      setPickupForm(bankDetails.pickupAddressDetails);
    }
  }, [bankDetails]);

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBankDetails(bankForm);
    setIsEditingBank(false);
    setBankSaveSuccess(true);
    setTimeout(() => setBankSaveSuccess(false), 2500);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPickup(true);
    try {
      // Save directly to Firestore collection
      await saveSellerPickupAddressToFirestore(pickupForm);
      
      const formattedAddressStr = `${pickupForm.houseOrBuilding}, ${pickupForm.streetArea}, ${pickupForm.landmark ? `Near ${pickupForm.landmark}, ` : ''}${pickupForm.city}, ${pickupForm.state} - ${pickupForm.pincode}`;
      
      onSaveBankDetails({
        ...bankDetails,
        pickupAddress: formattedAddressStr,
        pickupAddressDetails: pickupForm,
      });

      setWarehouseSaved(true);
      setTimeout(() => setWarehouseSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save warehouse pickup address', err);
    } finally {
      setIsSavingPickup(false);
    }
  };

  const handleResetToIndoreHub = () => {
    setPickupForm(INITIAL_SELLER_PICKUP_ADDRESS);
  };

  const menuSections = [
    {
      id: 'logistics' as const,
      title: 'Shiprocket & NimbusPost Logistics Hub',
      subtitle: 'Live API credentials, courier SLAs, rates & automated AWB',
      icon: Truck,
      iconBg: 'bg-indigo-50 text-indigo-700',
      badge: 'Shiprocket Live Active',
      isHighlighted: true,
    },
    {
      id: 'stories_banners' as const,
      title: 'Story & Banner Manager',
      subtitle: 'Upload reels, manage hero banners & live engagement',
      icon: Video,
      iconBg: 'bg-rose-50 text-rose-600',
      badge: `${stories.length} Live Drops`,
      isHighlighted: true,
    },
    {
      id: 'pricing' as const,
      title: 'Pricing & Promotions',
      subtitle: 'Price recommendations & discount campaigns',
      icon: Tag,
      iconBg: 'bg-amber-50 text-[#0A3A1E]',
      badge: 'Smart Pricing Active',
    },
    {
      id: 'claims' as const,
      title: 'Claims & Compensation',
      subtitle: 'Wrong returns, RTO disputes & claims status',
      icon: ShieldCheck,
      iconBg: 'bg-blue-50 text-blue-700',
      badge: claims.filter(c => c.status === 'Approved').length > 0
        ? `₹${claims.filter(c => c.status === 'Approved').reduce((s, c) => s + c.claimAmount, 0).toLocaleString('en-IN')} Reimbursed`
        : '0 Active Claims',
    },
    {
      id: 'upload' as const,
      title: 'Catalog Upload',
      subtitle: 'Add single product or upload bulk CSV drops',
      icon: UploadCloud,
      iconBg: 'bg-purple-50 text-purple-700',
      action: onOpenAddCatalog,
    },
    {
      id: 'payments' as const,
      title: 'Payments & Bank Settlements',
      subtitle: 'UTR settlement cycles, outstanding & bank info',
      icon: CreditCard,
      iconBg: 'bg-amber-50 text-[#0A3A1E]',
      badge: payouts.length > 0 ? `Latest: ₹${payouts[0].amount.toLocaleString('en-IN')}` : '₹0 Pending',
    },
    {
      id: 'quality' as const,
      title: 'Quality & Customer Ratings',
      subtitle: '4.8★ supplier score & return rate health',
      icon: Star,
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'Gold Star Tier',
    },
    {
      id: 'warehouse' as const,
      title: 'Warehouse & Pickup Address',
      subtitle: 'Courier pickup hub, time slots & GSTIN details',
      icon: MapPin,
      iconBg: 'bg-rose-50 text-rose-600',
      badge: `${pickupForm.city || 'Indore'} Dispatch Hub`,
    },
    {
      id: 'analytics' as const,
      title: 'Business Dashboard',
      subtitle: 'Category-wise revenue, customer pincodes & views',
      icon: BarChart3,
      iconBg: 'bg-indigo-50 text-indigo-700',
    },
    {
      id: 'database' as const,
      title: 'Firebase Database & Sync',
      subtitle: 'Connected project akselling-7e183 & live backup',
      icon: Database,
      iconBg: 'bg-teal-50 text-teal-700',
      badge: '100% Synced',
    },
  ];

  return (
    <div id="seller-menu-view" className="space-y-4 pb-24 px-3 sm:px-4 max-w-7xl mx-auto pt-3">
      {/* 1. SELLER PROFILE IDENTITY CARD */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A3A1E] to-[#052610] text-[#FFC107] flex items-center justify-center text-xl font-black shadow-md ring-4 ring-amber-100">
            AK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">AK Yadav Prints</h3>
              <span className="bg-[#FFC107] text-[#052610] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#FFC107]/40">
                Gold Star Supplier
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Store ID: AKY-98214 • GSTIN: 07AABCA1234F1Z8
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#FFC107]" />
              WhatsApp Catalog &amp; BlueDart Verified
            </p>
          </div>
        </div>

        {onToggleStorefront && (
          <button
            type="button"
            onClick={onToggleStorefront}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95"
          >
            <Eye className="w-4 h-4 text-[#FFC107]" />
            <span>Open Customer View</span>
          </button>
        )}
      </div>

      {/* 2. OPERATIONAL MEESHO SELLER MODULES */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
          Supplier Management Operations
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {menuSections.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                id={`menu-item-${item.id}`}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveModal(item.id);
                  }
                }}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center font-bold shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-extrabold text-slate-900 group-hover:text-[#0A3A1E] truncate">
                        {item.title}
                      </h5>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0A3A1E] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MODALS / DRAWERS FOR DETAILED SUB-SECTIONS */}

      {/* STORY & BANNER MANAGER MODAL / VIEW */}
      {activeModal === 'stories_banners' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-100 w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0A3A1E] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#FFC107]" />
                <h3 className="text-base font-black">Story &amp; Banner Manager</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <StoryBannerManager
                stories={stories}
                banners={banners}
                products={products}
                creatorProfile={creatorProfile}
                onUpdateCreatorProfile={onUpdateCreatorProfile}
                onAddStory={(s) => onAddStory?.(s)}
                onUpdateStory={(id, up) => onUpdateStory?.(id, up)}
                onDeleteStory={(id) => onDeleteStory?.(id)}
                onAddBanner={(b) => onAddBanner?.(b)}
                onUpdateBanner={(id, up) => onUpdateBanner?.(id, up)}
                onDeleteBanner={(id) => onDeleteBanner?.(id)}
                onPreviewStory={(s) => {
                  setActiveModal('none');
                  onPreviewStory?.(s);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* A. PRICING & PROMOTIONS MODAL */}
      {activeModal === 'pricing' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A3A1E] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FFC107]" />
                <h3 className="text-sm font-extrabold">Pricing &amp; Promotional Recommendations</h3>
              </div>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-1">
                <p className="font-bold text-[#0A3A1E] flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Smart Price Benchmark for T-Shirts:
                </p>
                <p className="text-slate-600">
                  Setting Oversized T-Shirts at <strong>₹649 - ₹699</strong> boosts order volume by <strong>+38%</strong> compared to competitor listings.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Active Festive Campaigns:</h5>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Festive Mega Streetwear Drop Sale</p>
                    <p className="text-[11px] text-slate-500">Auto 10% instant discount sponsored by platform</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Enrolled
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. PAYMENTS & BANK SETTLEMENTS MODAL */}
      {activeModal === 'payments' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A3A1E] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FFC107]" />
                <h3 className="text-sm font-extrabold">Payments &amp; Bank Settlements</h3>
              </div>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
              {/* Next Payout Card */}
              <div className="bg-gradient-to-br from-[#0A3A1E] to-[#052610] text-white p-4 rounded-2xl shadow-md space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-100">
                  <span>Upcoming Settlement Cycle</span>
                  <span className="bg-[#FFC107] text-[#052610] px-2 py-0.5 rounded-full font-black text-[10px]">
                    Auto-Disbursal
                  </span>
                </div>
                <p className="text-2xl font-black text-[#FFC107]">₹14,850.00</p>
                <p className="text-[11px] text-amber-100">
                  Bank: {bankDetails.bankName} (A/C: •••• {bankDetails.accountNumber.slice(-4)}) • Date: 03 Sep 2026
                </p>
              </div>

              {/* Bank Account Form */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-slate-900">Verified Bank &amp; UPI Account</h5>
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(!isEditingBank)}
                    className="text-[#0A3A1E] font-bold hover:underline text-[11px] cursor-pointer"
                  >
                    {isEditingBank ? 'Cancel Edit' : 'Edit Bank Info'}
                  </button>
                </div>

                {bankSaveSuccess && (
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bank account details saved to Firebase successfully!</span>
                  </div>
                )}

                {isEditingBank ? (
                  <form onSubmit={handleSaveBank} className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Account Holder Name</label>
                      <input
                        type="text"
                        value={bankForm.accountHolderName}
                        onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Bank Name</label>
                      <input
                        type="text"
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Account Number</label>
                        <input
                          type="text"
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">IFSC Code</label>
                        <input
                          type="text"
                          value={bankForm.ifscCode}
                          onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                          className="w-full p-2 rounded-lg border border-slate-200 font-mono uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">UPI ID for Instant Settlement</label>
                      <input
                        type="text"
                        value={bankForm.upiId}
                        onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#0A3A1E] text-[#FFC107] rounded-xl font-bold hover:bg-[#052610] cursor-pointer transition-colors"
                    >
                      Save Bank Details
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 text-xs">
                    <p><span className="text-slate-500">Beneficiary:</span> <strong>{bankDetails.accountHolderName}</strong></p>
                    <p><span className="text-slate-500">Bank &amp; Branch:</span> {bankDetails.bankName}</p>
                    <p className="font-mono"><span className="text-slate-500">A/C Number:</span> {bankDetails.accountNumber}</p>
                    <p className="font-mono"><span className="text-slate-500">IFSC Code:</span> {bankDetails.ifscCode}</p>
                    <p className="font-mono text-[#0A3A1E]"><span className="text-slate-500">UPI VPA:</span> {bankDetails.upiId}</p>
                  </div>
                )}
              </div>

              {/* Past Settlement Cycles */}
              <div className="space-y-2 pt-1">
                <h5 className="font-extrabold text-slate-900">Recent Disbursed Payouts</h5>
                <div className="space-y-2">
                  {payouts.map((po) => (
                    <div key={po.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{po.id}</span>
                        <p className="text-[10px] text-slate-500 font-mono">UTR: {po.utrNumber} • {po.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700 text-sm">₹{po.amount.toLocaleString('en-IN')}</span>
                        <span className="block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                          Settled 100%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* C. WAREHOUSE & PICKUP ADDRESS MODAL */}
      {activeModal === 'warehouse' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="bg-[#0A3A1E] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <MapPin className="w-6 h-6 text-[#FFC107]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Seller &amp; Warehouse Pickup Hub</h3>
                  <p className="text-xs text-amber-200">Official BlueDart, Delhivery &amp; Xpressbees Dispatch Facility</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveModal('none')} 
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="p-5 sm:p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
              {warehouseSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Indore Dispatch Hub successfully updated and synced across all courier integrations &amp; Firestore!</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-mono">LIVE SYNCED</span>
                </div>
              )}

              {/* Quick Preset Banner */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0A3A1E]" />
                  <span className="font-bold text-slate-900">Current Facility: Indore Central Hub (Madhya Pradesh)</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetToIndoreHub}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#0A3A1E] border border-slate-300 rounded-lg font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to Verified Indore Hub</span>
                </button>
              </div>

              {/* Store & Manager Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>Store / Enterprise Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupForm.storeName}
                    onChange={(e) => setPickupForm({ ...pickupForm, storeName: e.target.value })}
                    placeholder="e.g. AKSelling Apparel Studio & Dispatch Hub"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>Dispatch Manager / Contact Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupForm.contactPerson}
                    onChange={(e) => setPickupForm({ ...pickupForm, contactPerson: e.target.value })}
                    placeholder="e.g. Anoj Kumar Yadav"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                  />
                </div>
              </div>

              {/* Phone Numbers & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>Primary Phone (Courier Rider)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={pickupForm.phone}
                    onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#0A3A1E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Alternate Phone</label>
                  <input
                    type="tel"
                    value={pickupForm.alternatePhone || ''}
                    onChange={(e) => setPickupForm({ ...pickupForm, alternatePhone: e.target.value })}
                    placeholder="+91 91234 56780"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#0A3A1E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Official Seller Email</label>
                  <input
                    type="email"
                    value={pickupForm.email || ''}
                    onChange={(e) => setPickupForm({ ...pickupForm, email: e.target.value })}
                    placeholder="akyadavprintaksellig@gmail.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                  />
                </div>
              </div>

              {/* Exact Physical Location */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>Plot / Building / Commercial Complex (Line 1)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupForm.houseOrBuilding}
                    onChange={(e) => setPickupForm({ ...pickupForm, houseOrBuilding: e.target.value })}
                    placeholder="e.g. Plot 104, Royal Horizon Hub, Commercial Zone, AB Road"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <span>Street / Area / Colony (Line 2)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupForm.streetArea}
                      onChange={(e) => setPickupForm({ ...pickupForm, streetArea: e.target.value })}
                      placeholder="e.g. South Tukoganj, Near Chhappan Dukan Food Street"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <span>Famous Landmark (For Rider Navigation)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupForm.landmark || ''}
                      onChange={(e) => setPickupForm({ ...pickupForm, landmark: e.target.value })}
                      placeholder="e.g. Opposite MP High Court Bench / Near Apollo Tower"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">City</label>
                    <input
                      type="text"
                      required
                      value={pickupForm.city}
                      onChange={(e) => setPickupForm({ ...pickupForm, city: e.target.value })}
                      placeholder="Indore"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">District</label>
                    <input
                      type="text"
                      value={pickupForm.district || 'Indore'}
                      onChange={(e) => setPickupForm({ ...pickupForm, district: e.target.value })}
                      placeholder="Indore"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">State</label>
                    <input
                      type="text"
                      required
                      value={pickupForm.state}
                      onChange={(e) => setPickupForm({ ...pickupForm, state: e.target.value })}
                      placeholder="Madhya Pradesh"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pickupForm.pincode}
                      onChange={(e) => setPickupForm({ ...pickupForm, pincode: e.target.value })}
                      placeholder="452001"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Windows & Gate Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0A3A1E]" />
                    <span>Courier Pickup Time Window</span>
                  </label>
                  <input
                    type="text"
                    value={pickupForm.operatingHours || '04:00 PM - 07:30 PM (Daily Mon-Sat)'}
                    onChange={(e) => setPickupForm({ ...pickupForm, operatingHours: e.target.value })}
                    placeholder="04:00 PM - 07:30 PM (Daily Mon-Sat)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-[#0A3A1E]" />
                    <span>Rider Gate Instructions</span>
                  </label>
                  <input
                    type="text"
                    value={pickupForm.instructionsForRider || 'Ground Floor Dispatch Dock; Ask for Warehouse Manager at Gate 2.'}
                    onChange={(e) => setPickupForm({ ...pickupForm, instructionsForRider: e.target.value })}
                    placeholder="e.g. Ground Floor Dispatch Dock; Gate 2"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0A3A1E]"
                  />
                </div>
              </div>

              {/* Courier Format Live Preview Box */}
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#0A3A1E]" />
                    <span>Courier Label Formatted Pickup Tag:</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#0A3A1E] font-bold bg-[#FFC107]/30 px-2 py-0.5 rounded">
                    Indore, MP
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-800 leading-relaxed bg-white p-2 rounded-xl border border-emerald-100">
                  <strong>{pickupForm.storeName || 'AKSelling Studio'}</strong> ({pickupForm.contactPerson || 'Dispatch Manager'} • {pickupForm.phone})<br />
                  {pickupForm.houseOrBuilding}, {pickupForm.streetArea}, {pickupForm.landmark ? `Near ${pickupForm.landmark}, ` : ''}{pickupForm.city}, {pickupForm.state} - {pickupForm.pincode}
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSavingPickup}
                  className="px-6 py-2.5 bg-[#0A3A1E] text-[#FFC107] rounded-xl font-bold shadow-md hover:bg-[#052610] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isSavingPickup ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FFC107]" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#FFC107]" />
                      <span>Save Pickup Hub</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. QUALITY & RATING MODAL */}
      {activeModal === 'quality' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A3A1E] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#FFC107]" />
                <h3 className="text-sm font-extrabold">Quality &amp; Supplier Rating Scorecard</h3>
              </div>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <div>
                  <span className="text-3xl font-black text-amber-900">4.8★</span>
                  <p className="text-xs font-bold text-amber-800 mt-0.5">Overall Supplier Rating</p>
                  <p className="text-[10px] text-amber-700">Based on 1,420+ verified customer reviews</p>
                </div>
                <span className="bg-[#FFC107] text-[#052610] px-3 py-1 rounded-full text-xs font-black">
                  Top 5% Supplier
                </span>
              </div>

              <div className="space-y-2">
                <h5 className="font-extrabold text-slate-900">Quality Benchmark Checklist:</h5>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span>Fabric &amp; Stitching Defect Rate:</span>
                    <strong className="text-emerald-700">0.4% (&lt;1% Target)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span>Dispatch SLA Breaches:</span>
                    <strong className="text-emerald-700">0% (100% On-Time)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span>Customer Return Rate:</span>
                    <strong className="text-emerald-700">4.2% (Healthy &lt;6%)</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setActiveModal('none')} className="px-4 py-2 bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] rounded-xl font-bold cursor-pointer transition-colors">
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E. FIREBASE & CLOUD BACKUP MODAL */}
      {activeModal === 'database' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A3A1E] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#FFC107]" />
                <h3 className="text-sm font-extrabold">Firebase Cloud Sync &amp; Database</h3>
              </div>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Firebase Connected</span>
                  <span>● Active 100%</span>
                </div>
                <p><span className="text-slate-400">Project:</span> akselling-7e183</p>
                <p><span className="text-slate-400">Auth Domain:</span> akselling-7e183.firebaseapp.com</p>
                <p><span className="text-slate-400">Collections:</span> products, orders, users, payouts, seller_bank</p>
              </div>

              {onRefreshData && (
                <button
                  type="button"
                  onClick={() => {
                    onRefreshData();
                    setActiveModal('none');
                  }}
                  className="w-full py-2.5 bg-[#0A3A1E] text-[#FFC107] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#052610] cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-[#FFC107]" />
                  <span>Force Re-Sync All Collections from Cloud</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* F. BUSINESS DASHBOARD / DEEP ANALYTICS MODAL */}
      {activeModal === 'analytics' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A3A1E] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#FFC107]" />
                <h3 className="text-sm font-extrabold">Deep Business Analytics</h3>
              </div>
              <button type="button" onClick={() => setActiveModal('none')} className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="space-y-2">
                <h5 className="font-extrabold text-slate-900">Top Revenue by Category:</h5>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span>1. Heavyweight Oversized Graphic Tees</span>
                    <strong className="text-emerald-700">58% (₹1,42,600)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span>2. Mineral Acid Wash Vintage Tees</span>
                    <strong className="text-emerald-700">24% (₹59,000)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span>3. Waffle Knit Textured Collared Polos</span>
                    <strong className="text-emerald-700">18% (₹44,290)</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setActiveModal('none')} className="px-4 py-2 bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] rounded-xl font-bold cursor-pointer transition-colors">
                  Close Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* G. SHIPROCKET & NIMBUSPOST LOGISTICS MODAL */}
      {activeModal === 'logistics' && (
        <LogisticsFulfillmentModal
          order={orders[0] || null}
          isOpen={true}
          onClose={() => setActiveModal('none')}
          onOrderUpdated={() => {
            if (onRefreshData) onRefreshData();
          }}
          initialProvider="Shiprocket"
          initialTab="api"
        />
      )}
    </div>
  );
};
