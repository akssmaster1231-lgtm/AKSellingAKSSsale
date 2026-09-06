import React from 'react';
import { Product } from '../types';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveWishlist: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveWishlist,
  onOpenProduct,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="font-black text-slate-950 text-base">
              My Saved Wishlist ({wishlistProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tap the heart icon on any T-shirt in the feed to save your favorite streetwear drops.
              </p>
            </div>
          ) : (
            wishlistProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs"
              >
                <div
                  onClick={() => {
                    onClose();
                    onOpenProduct(prod);
                  }}
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {prod.brand}
                    </span>
                    <h4 className="font-bold text-slate-900 hover:text-amber-600 truncate max-w-[180px]">
                      {prod.title}
                    </h4>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-slate-950">₹{prod.price}</span>
                      <span className="text-slate-400 line-through text-[10px] font-mono">₹{prod.originalPrice}</span>
                      <span className="text-emerald-600 font-bold text-[10px]">{prod.discountPercent}% OFF</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onAddToCart(prod);
                      onRemoveWishlist(prod);
                    }}
                    className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1 text-[11px]"
                    title="Move to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Move to Cart</span>
                  </button>
                  <button
                    onClick={() => onRemoveWishlist(prod)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
