import React from 'react';
import { Home, Layers, Zap, ShoppingBag, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
}) => {
  const NAV_ITEMS = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'category' as TabType,
      label: 'Category',
      icon: Layers,
    },
    {
      id: 'deals' as TabType,
      label: 'Best Deal',
      icon: Zap,
      badge: 'HOT',
    },
    {
      id: 'cart' as TabType,
      label: 'Cart',
      icon: ShoppingBag,
      count: cartCount,
    },
    {
      id: 'account' as TabType,
      label: 'Account',
      icon: User,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 bg-[#0A3A1E]/95 backdrop-blur-md border-t border-[#134e2c] py-1.5 px-2 z-40 shadow-2xl pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      id="fixed-bottom-navigation-bar"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative select-none group min-w-[58px] ${
                isActive
                  ? 'text-[#FFC107] font-bold'
                  : 'text-emerald-300/70 hover:text-white'
              }`}
              id={`bottom-nav-${item.id}`}
            >
              {/* Icon Container with Gold Active Pill background */}
              <div className="relative">
                <div
                  className={`px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isActive ? 'bg-[#FFC107]/20 text-[#FFC107]' : 'text-emerald-200/70'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'stroke-[2.5] text-[#FFC107]' : 'stroke-[1.8]'
                    }`}
                  />
                </div>

                {/* Cart badge count */}
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 right-1 bg-[#FFC107] text-[#052610] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-[#0A3A1E] font-mono">
                    {item.count}
                  </span>
                )}

                {/* Hot Badge for Deals */}
                {item.badge && (
                  <span className="absolute -top-1.5 right-0.5 bg-[#FFC107] text-[#052610] text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive ? 'text-[#FFC107] font-black' : 'text-emerald-200/70 font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

