import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Zap, Clock, Sparkles, Tag, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface BestDealsViewProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Product) => void;
}

export const BestDealsView: React.FC<BestDealsViewProps> = ({
  products,
  onOpenProduct,
  wishlistIds,
  onToggleWishlist,
}) => {
  // Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.filter((p) => p.featureInBestDeals || (!p.isStandardCatalogOnly && (p.discountPercent >= 53 || p.isDealOfDay)));
  const under500Products = products.filter((p) => !p.isStandardCatalogOnly && p.price <= 499);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-12 space-y-6" id="best-deals-hub-view">
      {/* Flash Sale Banner with Live Clock */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 rounded-2xl p-4 sm:p-6 text-white border border-rose-900/50 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>AK 24-HOUR FLASH SALE</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-amber-400 font-serif">
              Deals of the Day: Up to 60% OFF
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Steal prices on premium 240 GSM drops, mineral acid washes, and anime puff tees.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Flash Sale Ends In:</span>
            </span>
            <div className="flex items-center gap-2 text-center font-mono font-black">
              <div className="bg-white/10 px-2.5 py-1 rounded-lg">
                <span className="text-lg sm:text-2xl text-amber-400">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-slate-400 font-sans">HRS</span>
              </div>
              <span className="text-amber-400 text-xl">:</span>
              <div className="bg-white/10 px-2.5 py-1 rounded-lg">
                <span className="text-lg sm:text-2xl text-amber-400">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-slate-400 font-sans">MINS</span>
              </div>
              <span className="text-amber-400 text-xl">:</span>
              <div className="bg-white/10 px-2.5 py-1 rounded-lg">
                <span className="text-lg sm:text-2xl text-rose-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-slate-400 font-sans">SECS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Flash Deal Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-slate-950">
              Today's Highest Discount T-Shirts (50%+ OFF)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Limited stock allocated</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {dealProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenProduct={onOpenProduct}
              isWishlisted={wishlistIds.has(prod.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>

      {/* Under ₹500 Corner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded uppercase tracking-wider">
              Budget Friendly
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-950 mt-1">
              Flat Under ₹499 Corner
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {under500Products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenProduct={onOpenProduct}
              isWishlisted={wishlistIds.has(prod.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
