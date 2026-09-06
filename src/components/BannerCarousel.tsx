import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, Sparkles, Image as ImageIcon } from 'lucide-react';
import { HeroBanner } from '../types';
import { MOCK_BANNERS } from '../data/mockData';

interface BannerCarouselProps {
  banners?: HeroBanner[];
  onOpenProductById?: (id: string) => void;
  onFilterCategory?: (cat: string) => void;
}

const FALLBACK_BANNER_IMAGE = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80';

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ 
  banners = MOCK_BANNERS, 
  onFilterCategory 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  const activeBanners = banners.filter((b) => b.isActive !== false);
  const displayBanners = activeBanners.length > 0 ? activeBanners : MOCK_BANNERS;

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  // Prevent out of bound if banners change
  const currentBanner = displayBanners[currentIndex % displayBanners.length];

  if (!currentBanner) return null;

  const bannerImgSrc = (!imgErrorMap[currentBanner.id] && currentBanner.image) 
    ? currentBanner.image 
    : FALLBACK_BANNER_IMAGE;

  return (
    <div id="home-hero-banner-carousel" className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-md border border-slate-200/80 mb-4 select-none group">
      <div className={`bg-gradient-to-r ${currentBanner.bgColor || 'from-slate-950 via-slate-900 to-indigo-950'} p-3.5 sm:p-6 text-white min-h-[165px] sm:min-h-[195px] flex items-center justify-between gap-3 sm:gap-6 transition-all duration-500`}>
        {/* Left Text Block */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2.5 z-10">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="bg-white/20 backdrop-blur-xs text-[9px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-amber-300 border border-white/25 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 animate-pulse" />
              {currentBanner.badge || 'EXCLUSIVE DROP'}
            </span>
            {currentBanner.code && (
              <span className="text-[10px] sm:text-xs text-white/90 font-mono bg-black/30 px-2 py-0.5 rounded-md border border-white/10 font-bold">
                Code: {currentBanner.code}
              </span>
            )}
          </div>

          <h2 className={`text-lg sm:text-2xl md:text-3xl font-black tracking-tight ${currentBanner.accentColor || 'text-amber-400'} font-serif drop-shadow-sm leading-tight line-clamp-2`}>
            {currentBanner.headline}
          </h2>

          <p className="text-[11px] sm:text-sm text-slate-200 line-clamp-2 leading-snug sm:leading-relaxed max-w-lg">
            {currentBanner.subheadline}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="banner-shop-now-cta"
              onClick={() => onFilterCategory?.(currentBanner.category)}
              className="bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] font-black text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-[#052610] text-[#052610]" />
              Shop {currentBanner.category || 'Collection'}
            </button>
            <span className="text-[10px] sm:text-[11px] text-white/80 hidden sm:inline font-semibold">
              Free Express Delivery across India
            </span>
          </div>
        </div>

        {/* Right Product / Promotional Image Display (Always clearly visible alongside text) */}
        <div 
          onClick={() => onFilterCategory?.(currentBanner.category)}
          className="shrink-0 relative w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-44 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-white/40 bg-slate-900 cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
        >
          <img
            id="hero-banner-image-preview"
            src={bannerImgSrc}
            alt={currentBanner.headline}
            referrerPolicy="no-referrer"
            loading="eager"
            onError={() => setImgErrorMap((prev) => ({ ...prev, [currentBanner.id]: true }))}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          
          {/* Subtle Category Pill on Image */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
            <span className="bg-black/70 backdrop-blur-xs text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs truncate max-w-[90%]">
              {currentBanner.category}
            </span>
          </div>
        </div>
      </div>

      {/* Nav dots & indicators */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-2 right-3 sm:right-4 flex items-center gap-1.5 z-20">
          {displayBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex % displayBanners.length ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow Controls */}
      {displayBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? displayBanners.length - 1 : prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-sm cursor-pointer"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % displayBanners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-sm cursor-pointer"
            aria-label="Next banner"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};
