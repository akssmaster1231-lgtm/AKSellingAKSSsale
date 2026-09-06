import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Star, Heart, CheckCircle2, Zap, Truck } from 'lucide-react';
import { getProductShippingLabel, getStoreShippingSettings } from '../utils/shippingSettingsService';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProduct,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [shippingInfo, setShippingInfo] = useState(() => getProductShippingLabel(product.price));

  useEffect(() => {
    const handleUpdate = () => {
      setShippingInfo(getProductShippingLabel(product.price, getStoreShippingSettings()));
    };
    window.addEventListener('ak_shipping_settings_updated', handleUpdate);
    return () => window.removeEventListener('ak_shipping_settings_updated', handleUpdate);
  }, [product.price]);

  return (
    <div
      onClick={() => onOpenProduct(product)}
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#FFC107] hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer relative shadow-sm"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isDealOfDay && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 uppercase tracking-wide">
              <Zap className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />
              Flash Deal
            </span>
          )}
          {product.isBestseller && !product.isDealOfDay && (
            <span className="bg-[#FFC107] text-[#052610] text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              Top Selling
            </span>
          )}
          {product.isTrending && !product.isBestseller && !product.isDealOfDay && (
            <span className="bg-[#0A3A1E] text-[#FFC107] border border-[#FFC107]/40 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              Trending
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/85 hover:bg-white text-slate-500 hover:text-rose-500 shadow-sm transition-all z-10 backdrop-blur-xs border border-slate-200"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'text-rose-500 fill-rose-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5 bg-white">
        <div>
          {/* Brand & Assured Tag */}
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {product.brand}
            </span>
            {product.isAssured && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#0A3A1E] bg-[#FFC107]/20 px-1.5 py-0.5 rounded border border-[#FFC107]/40 shrink-0">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#0A3A1E]" />
                AK-Assured
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0A3A1E] transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 my-0.5">
          <div className="inline-flex items-center gap-0.5 bg-[#0A3A1E] text-[#FFC107] text-[11px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
            <span>{product.rating}</span>
            <Star className="w-2.5 h-2.5 fill-[#FFC107] text-[#FFC107]" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            ({product.ratingCount.toLocaleString()})
          </span>
        </div>

        {/* Price Section */}
        <div className="pt-0.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
              ₹{product.price.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 line-through font-mono">
              ₹{product.originalPrice.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#0A3A1E]">
              {product.discountPercent}% off
            </span>
          </div>
        </div>

        {/* Clean Shipping Truck Icon & Controlled Shipping Text */}
        <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <div className="inline-flex items-center gap-1.5 font-semibold text-[#0A3A1E] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 min-w-0">
            <Truck className="w-3.5 h-3.5 text-[#FFC107] shrink-0" />
            <span className="truncate text-[10.5px]">{shippingInfo.text}</span>
          </div>
          <span className="text-slate-500 text-[10px] font-medium group-hover:text-[#0A3A1E] group-hover:underline transition-colors shrink-0">
            Details &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};


