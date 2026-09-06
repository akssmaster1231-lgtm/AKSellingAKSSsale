import React, { useState } from 'react';
import { CartItem, Product } from '../types';
import { Trash2, Plus, Minus, ShieldCheck, Tag, ArrowRight, ShoppingBag, Check, Sparkles } from 'lucide-react';

interface CartViewProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenProduct: (product: Product) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string) => void;
  onStartShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOpenProduct,
  onProceedToCheckout,
  onStartShopping,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  // Computations
  const totalMRP = items.reduce((acc, item) => acc + item.product.originalPrice * item.quantity, 0);
  const totalSellingPrice = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const productDiscount = totalMRP - totalSellingPrice;

  let couponDiscount = 0;
  if (appliedCoupon === 'AKFIRST10') {
    couponDiscount = Math.round(totalSellingPrice * 0.1);
  } else if (appliedCoupon === 'DEAL50') {
    couponDiscount = 50;
  } else if (appliedCoupon === 'AKFEST15') {
    couponDiscount = Math.round(totalSellingPrice * 0.15);
  }

  const deliveryCharge = totalSellingPrice > 499 || items.length === 0 ? 0 : 40;
  const finalPayable = Math.max(0, totalSellingPrice - couponDiscount + deliveryCharge);
  const totalSavings = productDiscount + couponDiscount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === 'AKFIRST10' || code === 'DEAL50' || code === 'AKFEST15') {
      setAppliedCoupon(code);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try AKFIRST10 or AKFEST15');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4" id="empty-cart-view">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your AKSelling Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Explore our trending oversized drops, vintage acid wash tees, and graphic collections to fill your cart.
        </p>
        <button
          onClick={onStartShopping}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2"
        >
          <span>Shop Trending T-Shirts</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-12 space-y-6" id="cart-view-container">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
          </h1>
          <span className="text-xs text-slate-500">
            Enjoy free delivery on all orders above ₹499
          </span>
        </div>
        <button
          onClick={onStartShopping}
          className="text-xs font-bold text-amber-700 hover:underline"
        >
          + Add More Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cart Items List (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          {items.map((item) => {
            const itemTotal = item.product.price * item.quantity;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between"
                id={`cart-item-${item.id}`}
              >
                <div className="flex gap-3.5">
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    referrerPolicy="no-referrer"
                    onClick={() => onOpenProduct(item.product)}
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-90 shrink-0"
                  />

                  {/* Info */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.product.brand}
                    </span>
                    <h3
                      onClick={() => onOpenProduct(item.product)}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 cursor-pointer line-clamp-2 leading-snug"
                    >
                      {item.product.title}
                    </h3>

                    {/* Selected Attributes */}
                    <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-semibold">
                        Size: <strong>{item.selectedSize}</strong>
                      </span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <span className="text-[11px] font-medium">{item.selectedColor.name}</span>
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm sm:text-base font-black text-slate-950 font-mono">
                        ₹{itemTotal.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{(item.product.originalPrice * item.quantity).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {item.product.discountPercent}% OFF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Stepper & Remove */}
                <div className="flex sm:flex-col justify-between sm:justify-between items-center sm:items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 text-xs">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-200"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1 font-mono font-bold bg-white text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-200"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Coupons & Price Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Apply Coupons & Promo Codes</span>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="e.g. AKFEST15"
                className="flex-1 px-3 py-2 text-xs uppercase font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-2 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Code '{appliedCoupon}' applied successfully!
                </span>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {couponError && (
              <p className="text-xs text-rose-600 font-medium">{couponError}</p>
            )}

            <div className="text-[11px] text-slate-500 pt-1 space-y-1">
              <p>Available codes:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setCouponInput('AKFEST15'); setAppliedCoupon('AKFEST15'); }}
                  className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold"
                >
                  AKFEST15 (15% Off)
                </button>
                <button
                  onClick={() => { setCouponInput('AKFIRST10'); setAppliedCoupon('AKFIRST10'); }}
                  className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold"
                >
                  AKFIRST10 (10% Off)
                </button>
              </div>
            </div>
          </div>

          {/* Price Breakdown - Flipkart Style */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Price Details
            </h2>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Price ({items.length} items)</span>
                <span className="font-mono text-slate-900">₹{totalMRP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount on MRP</span>
                <span className="font-mono font-bold">- ₹{productDiscount.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span className="font-mono font-bold">- ₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-950">Total Amount</span>
              <span className="text-xl font-black text-slate-950 font-mono" id="cart-total-payable">
                ₹{finalPayable.toLocaleString()}
              </span>
            </div>

            <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-2.5 rounded-xl text-center">
              🎉 You will save ₹{totalSavings.toLocaleString()} on this order!
            </div>

            {/* Place Order CTA */}
            <button
              onClick={() => onProceedToCheckout(couponDiscount, appliedCoupon || '')}
              id="cart-proceed-checkout-btn"
              className="w-full bg-slate-950 hover:bg-slate-900 active:bg-black text-amber-400 font-black text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Safe and Secure Payments • 100% Authentic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
