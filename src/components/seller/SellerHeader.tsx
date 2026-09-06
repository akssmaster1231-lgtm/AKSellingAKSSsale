import React from 'react';
import { SellerTabType } from '../../types';
import { 
  Store, RefreshCw, Eye, Bell, ShieldCheck, Database, 
  ChevronRight, Sparkles, ArrowLeftRight, ShoppingBag
} from 'lucide-react';

interface SellerHeaderProps {
  activeTab: SellerTabType;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onToggleStorefront?: () => void;
  sellerName?: string;
  storeId?: string;
  unreadNotifications?: number;
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({
  activeTab,
  onRefresh,
  isRefreshing = false,
  onToggleStorefront,
  sellerName = 'AK Yadav Prints',
  storeId = 'AKY-98214',
  unreadNotifications = 3,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Supplier Dashboard';
      case 'orders':
        return 'Order Management';
      case 'returns':
        return 'Returns & RTO Desk';
      case 'inventory':
        return 'Catalog & Stock';
      case 'menu':
        return 'AKSelling- Seller Hub';
      default:
        return 'AKSelling';
    }
  };

  return (
    <header
      id="seller-header"
      className="sticky top-0 z-30 bg-[#0A3A1E] text-white shadow-md border-b border-[#FFC107]/30 safe-area-top"
    >
      {/* Top Banner Status Bar */}
      <div className="bg-[#052610] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-emerald-100/80 border-b border-[#FFC107]/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0A3A1E] px-2 py-0.5 rounded-full text-[10px] font-bold text-[#FFC107] border border-[#FFC107]/30">
            <span className="w-2 h-2 rounded-full bg-[#FFC107] animate-pulse" />
            <span>Firebase Live: akselling-7e183</span>
          </div>
          <span className="hidden sm:inline-block text-emerald-200/50">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-200 font-medium">
            <ShieldCheck className="w-3 h-3 text-[#FFC107]" />
            GSTIN: 07AABCA1234F1Z8
          </span>
        </div>

        {onToggleStorefront && (
          <button
            id="seller-btn-preview-store"
            type="button"
            onClick={onToggleStorefront}
            className="flex items-center gap-1.5 text-[11px] font-black text-[#052610] bg-[#FFC107] hover:bg-[#FFD700] px-3 py-0.5 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Switch to Customer Store View"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Switch to Buyer Store</span>
            <ArrowLeftRight className="w-3 h-3 text-[#052610]/80" />
          </button>
        )}
      </div>

      {/* Main Header Bar */}
      <div className="px-3.5 py-2.5 max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Supplier Info & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#FFA000] flex items-center justify-center text-[#052610] shadow-inner font-black text-lg shrink-0 ring-2 ring-[#FFC107]/40">
            AK
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white truncate">
                {sellerName}
              </h1>
              <span className="bg-[#FFC107]/20 text-[#FFC107] text-[10px] font-bold px-1.5 py-0.2 rounded border border-[#FFC107]/40 shrink-0 flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 font-medium truncate flex items-center gap-1">
              <span>{getTabTitle()}</span>
              <span className="text-emerald-300/50">•</span>
              <span className="font-mono text-[#FFC107]">ID: {storeId}</span>
            </p>
          </div>
        </div>

        {/* Right: Actions (Switch Button, Refresh, Notifications) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleStorefront && (
            <button
              id="seller-header-switch-btn"
              type="button"
              onClick={onToggleStorefront}
              className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#052610] hover:bg-[#052610]/80 text-[#FFC107] text-xs font-bold transition-all border border-[#FFC107]/30 shadow-xs cursor-pointer active:scale-95"
              title="Open Buyer Storefront"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>Buyer Store</span>
              <ArrowLeftRight className="w-3 h-3 text-[#FFC107]/70" />
            </button>
          )}

          <button
            id="seller-btn-refresh"
            type="button"
            onClick={onRefresh}
            title="Refresh Orders & Catalog"
            className="p-2 rounded-xl bg-[#052610] hover:bg-[#052610]/80 active:scale-95 text-[#FFC107] transition-colors relative cursor-pointer border border-[#FFC107]/20"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#FFC107] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
          </button>

          <div className="relative">
            <button
              id="seller-btn-notifications"
              type="button"
              className="p-2 rounded-xl bg-[#052610] hover:bg-[#052610]/80 text-[#FFC107] transition-colors cursor-pointer border border-[#FFC107]/20"
            >
              <Bell className="w-4 h-4 text-[#FFC107]" />
            </button>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFC107] text-[#052610] text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-[#0A3A1E]">
                {unreadNotifications}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
