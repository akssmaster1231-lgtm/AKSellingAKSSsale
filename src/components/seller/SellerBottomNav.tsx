import React from 'react';
import { SellerTabType } from '../../types';
import { Home, PackageCheck, RotateCcw, Layers, Grid } from 'lucide-react';

interface SellerBottomNavProps {
  activeTab: SellerTabType;
  setActiveTab: (tab: SellerTabType) => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
  returnsCount?: number;
}

export const SellerBottomNav: React.FC<SellerBottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingOrdersCount = 14,
  lowStockCount = 5,
  returnsCount = 4,
}) => {
  const tabs = [
    {
      id: 'home' as SellerTabType,
      label: 'Home',
      icon: Home,
      badge: null,
    },
    {
      id: 'orders' as SellerTabType,
      label: 'Orders',
      icon: PackageCheck,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'returns' as SellerTabType,
      label: 'Returns',
      icon: RotateCcw,
      badge: returnsCount > 0 ? returnsCount : null,
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'inventory' as SellerTabType,
      label: 'Inventory',
      icon: Layers,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'menu' as SellerTabType,
      label: 'Menu',
      icon: Grid,
      badge: null,
    },
  ];

  return (
    <nav
      id="seller-bottom-nav"
      aria-label="Seller Dashboard Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#111b21] border-t border-[#222e35] shadow-lg shadow-black/40 safe-area-bottom"
    >
      <div className="max-w-md mx-auto sm:max-w-xl md:max-w-2xl px-2">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`seller-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 select-none ${
                  isActive ? 'text-[#00a884]' : 'text-[#8696a0] hover:text-[#e9edef]'
                }`}
              >
                {/* Active Indicator Top Bar */}
                {isActive && (
                  <span className="absolute -top-0.5 w-10 h-1 bg-[#00a884] rounded-full shadow-sm shadow-[#00a884]/40" />
                )}

                <div className="relative">
                  <div
                    className={`p-1 rounded-xl transition-colors ${
                      isActive ? 'bg-[#005c4b]/30 text-[#00a884]' : ''
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-150 ${
                        isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                      }`}
                    />
                  </div>

                  {/* Badge */}
                  {tab.badge !== null && (
                    <span
                      className={`absolute -top-1 -right-2 text-[10px] font-black text-white px-1.5 py-0.2 min-w-[17px] h-[17px] flex items-center justify-center rounded-full shadow-sm ring-2 ring-[#111b21] ${
                        tab.badgeColor || 'bg-emerald-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[11px] mt-0.5 tracking-tight font-medium ${
                    isActive ? 'font-bold text-[#00a884]' : 'text-[#8696a0]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
