import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductColor, DeliveryZoneInfo } from '../types';
import { 
  ArrowLeft, Star, Heart, CheckCircle2, ShieldCheck, Truck, RotateCcw, 
  Tag, ShoppingBag, Zap, Ruler, Share2, Sparkles, AlertCircle, Check, ThumbsUp,
  MessageCircle, LocateFixed, ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon
} from 'lucide-react';
import { SizeGuideModal } from './SizeGuideModal';
import { lookupPincodeAsync, autoDetectLocationAndPincode } from '../utils/pincodeService';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, size: string, color: ProductColor, quantity: number) => void;
  onBuyNow: (product: Product, size: string, color: ProductColor, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[1] || product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pincodeCheck, setPincodeCheck] = useState('122002');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneInfo | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectMsg, setLocationDetectMsg] = useState<string | null>(null);

  // Touch Swipe tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Initial lookup for default pincode
  useEffect(() => {
    lookupPincodeAsync('122002').then((zone) => {
      setDeliveryZone(zone);
    });
  }, []);

  const totalImages = product.images.length;

  const handleNextImage = useCallback(() => {
    if (totalImages <= 1) return;
    setSlideDirection(1);
    setSelectedImageIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const handlePrevImage = useCallback(() => {
    if (totalImages <= 1) return;
    setSlideDirection(-1);
    setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45; // 45px threshold

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Image
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous Image
      handlePrevImage();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation when user is on product page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showZoomModal) {
        if (e.key === 'ArrowRight') handleNextImage();
        if (e.key === 'ArrowLeft') handlePrevImage();
        if (e.key === 'Escape') setShowZoomModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showZoomModal, handleNextImage, handlePrevImage]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppInquire = () => {
    const text = encodeURIComponent(
      `Hi AKSelling! I want to order/inquire about the *${product.title}* (Size: ${selectedSize}, Color: ${selectedColor.name}) at ₹${product.price}. Could you confirm availability?`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeCheck.length === 6) {
      setIsCheckingPincode(true);
      const zone = await lookupPincodeAsync(pincodeCheck);
      setDeliveryZone(zone);
      setIsCheckingPincode(false);
    }
  };

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationDetectMsg('Detecting GPS location...');
    try {
      const zone = await autoDetectLocationAndPincode();
      if (zone && zone.pincode) {
        setPincodeCheck(zone.pincode);
        setDeliveryZone(zone);
        setLocationDetectMsg(`Detected: ${zone.city}, ${zone.state} (${zone.pincode})`);
      } else {
        setLocationDetectMsg('Auto-detection failed. Please enter PIN manually.');
      }
    } catch {
      setLocationDetectMsg('Could not detect location. Please enter PIN manually.');
    } finally {
      setIsDetectingLocation(false);
      setTimeout(() => setLocationDetectMsg(null), 4000);
    }
  };

  const saveAmount = product.originalPrice - product.price;

  return (
    <div className="bg-[#052610] min-h-screen pb-28 md:pb-20" id="dedicated-product-detail-view">
      {/* Top Header Bar */}
      <div className="bg-[#0A3A1E] text-white sticky top-0 z-30 shadow-md border-b border-[#134e2c]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-[#FFC107] font-bold text-xs sm:text-sm group"
            id="back-to-catalog-btn"
          >
            <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight font-bold">AKSelling Store</span>
              <span className="text-[10px] text-emerald-200/80 font-normal">T-Shirt Details</span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleWhatsAppInquire}
              className="bg-[#FFC107] text-[#052610] px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-sm hover:bg-[#FFD700] transition-colors"
              title="Chat with AKSelling"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">WhatsApp Inquire</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative"
              title="Share T-Shirt"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-7 right-0 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap shadow-md">
                  Link Copied!
                </span>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title={isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-rose-300 fill-rose-300' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Details Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          
          {/* LEFT: High-Resolution Product Images & Thumbnails (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm relative">
              {/* Main Interactive Touch-Swipe Image Canvas */}
              <div 
                className="aspect-4/5 w-full rounded-xl overflow-hidden bg-slate-100 relative group select-none touch-pan-y cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    custom={slideDirection}
                    initial={{ opacity: 0, x: slideDirection > 0 ? 80 : -80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: slideDirection > 0 ? -80 : 80 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={product.images[selectedImageIndex] || product.images[0]}
                      alt={`${product.title} - View ${selectedImageIndex + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 pointer-events-none"
                      id="main-product-high-res-image"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Left & Right Chevron Navigation (Visible on mobile & desktop hover) */}
                {totalImages > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges on Image (Top Left) */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  <span className="bg-[#FFC107] text-[#052610] text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                    {product.discountPercent}% OFF
                  </span>
                  {product.isAssured && (
                    <span className="bg-[#0A3A1E] text-[#FFC107] border border-[#FFC107]/40 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 fill-[#FFC107] text-[#0A3A1E]" />
                      AK-Assured
                    </span>
                  )}
                </div>

                {/* Top Right Counter & Zoom Button */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <div className="bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 font-mono">
                    <ImageIcon className="w-3 h-3 text-emerald-300" />
                    <span>{selectedImageIndex + 1}/{totalImages}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowZoomModal(true)}
                    className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur-md transition-colors shadow-md"
                    title="Fullscreen Zoom"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Swipe Indicator Dots */}
                {totalImages > 1 && (
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                    {product.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          selectedImageIndex === idx 
                            ? 'w-6 bg-[#FFC107] shadow-xs' 
                            : 'w-1.5 bg-slate-400/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails Gallery */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2.5 mt-3 overflow-x-auto no-scrollbar py-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSlideDirection(idx >= selectedImageIndex ? 1 : -1);
                        setSelectedImageIndex(idx);
                      }}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-[#FFC107] ring-2 ring-[#FFC107]/40 scale-102 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {selectedImageIndex === idx && (
                        <div className="absolute inset-x-0 bottom-0 bg-[#0A3A1E] text-[#FFC107] text-[8px] font-bold text-center py-0.5">
                          ACTIVE
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Swipe Hint on Mobile */}
              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400 font-medium">
                <span>👈 Swipe left or right to view all angles 👉</span>
              </div>
            </div>

            {/* Quality & Trust Badges */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 grid grid-cols-3 gap-2 text-center text-xs shadow-2xs">
              <div className="flex flex-col items-center gap-1 text-slate-700">
                <ShieldCheck className="w-5 h-5 text-[#0A3A1E]" />
                <span className="font-bold">100% Cotton</span>
                <span className="text-[10px] text-slate-400">Bio-Washed 240GSM</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-700 border-x border-slate-100 px-1">
                <RotateCcw className="w-5 h-5 text-[#0A3A1E]" />
                <span className="font-bold">7-Day Return</span>
                <span className="text-[10px] text-slate-400">Easy Doorstep Pickup</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-700">
                <Truck className="w-5 h-5 text-[#0A3A1E]" />
                <span className="font-bold">Fast Express</span>
                <span className="text-[10px] text-slate-400">Free Over ₹499</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info, Options, Description, and Checkout (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Title & Ratings Block */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black tracking-wider text-[#0A3A1E] bg-[#FFC107]/20 px-2 py-0.5 rounded-md uppercase border border-[#FFC107]/40">
                  {product.brand}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  SKU: AK-TEE-{product.id.toUpperCase()}
                </span>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                {product.title}
              </h1>

              {/* Ratings and Reviews */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="inline-flex items-center gap-1 bg-[#0A3A1E] text-[#FFC107] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  <span>{product.rating}</span>
                  <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />
                </div>
                <span className="text-slate-600 font-semibold">
                  {product.ratingCount.toLocaleString()} Ratings & {product.reviewsCount} Reviews
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-[#0A3A1E] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#0A3A1E] text-white" />
                  Verified Quality
                </span>
              </div>

              {/* Pricing Section */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono" id="product-price-display">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0A3A1E] bg-[#FFC107]/20 border border-[#FFC107]/30 px-2 py-0.5 rounded-md">
                    {product.discountPercent}% OFF
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    (You Save ₹{saveAmount})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Inclusive of all taxes • Free Express Shipping on this order
                </p>
              </div>

              {/* Available Offers Box */}
              <div className="bg-[#0A3A1E]/5 border border-[#0A3A1E]/20 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="font-bold text-[#0A3A1E] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#FFC107]" />
                  <span>Exclusive Offers & Coupons</span>
                </div>
                <ul className="space-y-1.5 text-slate-800">
                  {product.offers.map((offer, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#0A3A1E] font-bold">•</span>
                      <span>{offer}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Size Selector */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">Select Size:</span>
                    <span className="font-mono font-bold text-[#0A3A1E] bg-[#FFC107]/20 px-1.5 py-0.2 rounded border border-[#FFC107]/40">
                      {selectedSize}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[#0A3A1E] hover:text-[#052610] font-bold flex items-center gap-1 hover:underline"
                    id="size-chart-guide-btn"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-11 rounded-xl text-xs font-black font-mono transition-all border ${
                          isSelected
                            ? 'bg-[#0A3A1E] border-[#0A3A1E] text-[#FFC107] shadow-md scale-105 ring-2 ring-[#FFC107]/40'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-[#0A3A1E] hover:bg-slate-50'
                        }`}
                        id={`size-btn-${size.toLowerCase()}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Stock indicator */}
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hurry! Only {product.stockCount} left in stock for size <strong>{selectedSize}</strong></span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 font-bold hover:bg-slate-200 text-slate-700"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-mono font-bold bg-white text-slate-950">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                    className="px-3 py-1.5 font-bold hover:bg-slate-200 text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Delivery Estimator */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Delivery Details:</span>
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={isDetectingLocation}
                    className="text-[11px] font-bold text-[#0A3A1E] hover:text-[#052610] flex items-center gap-1 cursor-pointer bg-[#FFC107]/20 px-2 py-0.5 rounded-full border border-[#FFC107]/30 transition-colors"
                  >
                    <LocateFixed className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin text-[#0A3A1E]' : ''}`} />
                    <span>{isDetectingLocation ? 'Detecting...' : 'Auto-Detect PIN'}</span>
                  </button>
                </div>

                <form onSubmit={handlePincodeSubmit} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeCheck}
                    onChange={(e) => setPincodeCheck(e.target.value.replace(/\D/g, ''))}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono w-32 focus:ring-1 focus:ring-[#0A3A1E] outline-none"
                    placeholder="6-digit PIN"
                  />
                  <button
                    type="submit"
                    disabled={isCheckingPincode}
                    className="px-3 py-1.5 text-xs font-bold bg-[#F0F2F5] hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    {isCheckingPincode ? 'Checking...' : 'Check'}
                  </button>
                </form>

                {locationDetectMsg && (
                  <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                    {locationDetectMsg}
                  </p>
                )}

                {deliveryZone && (
                  <div className="text-xs text-[#0A3A1E] font-semibold space-y-1 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Truck className="w-3.5 h-3.5" />
                        <span>{deliveryZone.zone} ({deliveryZone.estimatedDate})</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {deliveryZone.isCodAvailable ? 'COD Available' : 'Prepaid Only'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Shipping to <strong>{deliveryZone.city}, {deliveryZone.state}</strong> via {deliveryZone.courierPartner} • <strong className="text-emerald-700">{deliveryZone.shippingCharge === 0 ? 'FREE Delivery' : `₹${deliveryZone.shippingCharge}`}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* CLEARLY PLACED IN-LINE 'ADD TO CART' & 'BUY NOW' BUTTONS RIGHT BELOW DESCRIPTION/OPTIONS */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3" id="inline-action-buttons">
                <button
                  onClick={() => onAddToCart(product, selectedSize, selectedColor, quantity)}
                  id="inline-add-to-cart-btn"
                  className="w-full bg-white hover:bg-slate-50 text-[#0A3A1E] border-2 border-[#0A3A1E] font-black text-sm py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  onClick={() => onBuyNow(product, selectedSize, selectedColor, quantity)}
                  id="inline-buy-now-btn"
                  className="w-full bg-[#FFC107] hover:bg-[#FFD700] active:bg-amber-400 text-[#052610] font-black text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Zap className="w-4 h-4 fill-[#052610] text-[#052610]" />
                  <span>BUY NOW</span>
                </button>
              </div>
            </div>

            {/* Detailed Description & Fabric Highlights */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-2">
                Product Details & Fabric Specifications
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {product.description}
              </p>

              {/* Highlights List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Key Highlights:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {product.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-[#0A3A1E] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specs Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 p-2.5 bg-slate-50 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Fabric Composition</span>
                  <span className="font-bold text-slate-900">{product.fabric}</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 bg-white border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">GSM / Fabric Density</span>
                  <span className="font-bold text-slate-900">{product.gsm}</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 bg-slate-50 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Fit & Silhouette</span>
                  <span className="font-bold text-slate-900">{product.fit}</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 bg-white">
                  <span className="text-slate-500 font-semibold">Care Instructions</span>
                  <span className="font-bold text-slate-900">{product.careInstructions}</span>
                </div>
              </div>
            </div>

            {/* Ratings & Customer Reviews Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-950">Ratings & Customer Reviews</h2>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A3A1E] bg-[#FFC107]/20 border border-[#FFC107]/30 px-2 py-1 rounded">
                  <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#0A3A1E]" />
                  <span>{product.rating} / 5</span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 divide-y divide-slate-100">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="pt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-0.5 bg-[#0A3A1E] text-[#FFC107] font-bold px-1.5 py-0.2 rounded text-[10px]">
                          <span>{rev.rating}</span>
                          <Star className="w-2.5 h-2.5 fill-[#FFC107]" />
                        </div>
                        <span className="font-bold text-slate-900">{rev.title}</span>
                      </div>
                      <span className="text-slate-400">{rev.date}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1 text-[#0A3A1E] font-medium">
                        <CheckCircle2 className="w-3 h-3 fill-[#0A3A1E] text-white" />
                        <span>{rev.author} (Verified Buyer)</span>
                      </div>
                      <button className="flex items-center gap-1 text-slate-500 hover:text-slate-800">
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div 
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 sm:p-3 shadow-2xl z-40"
        id="sticky-product-bottom-bar"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Price & Selection Summary */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-950 font-mono">
                ₹{(product.price * quantity).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through font-mono hidden xs:inline">
                ₹{(product.originalPrice * quantity).toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate">
              Size: <strong>{selectedSize}</strong> • {selectedColor.name} ({quantity}x)
            </span>
          </div>

          {/* Sticky Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onAddToCart(product, selectedSize, selectedColor, quantity)}
              id="sticky-add-to-cart-btn"
              className="bg-white hover:bg-slate-50 text-[#0A3A1E] border-2 border-[#0A3A1E] font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ADD TO CART</span>
            </button>

            <button
              onClick={() => onBuyNow(product, selectedSize, selectedColor, quantity)}
              id="sticky-buy-now-btn"
              className="bg-[#FFC107] hover:bg-[#FFD700] active:bg-amber-400 text-[#052610] font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-[#052610] text-[#052610]" />
              <span>BUY NOW</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Definition Zoom Modal */}
      {showZoomModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-5xl mx-auto w-full py-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{product.title}</span>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-mono">
                {selectedImageIndex + 1} / {totalImages}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowZoomModal(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Centered Image with Drag and Swipe Support */}
          <div className="relative flex-1 flex items-center justify-center max-w-4xl mx-auto w-full my-auto overflow-hidden">
            {totalImages > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-xs"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <AnimatePresence initial={false} custom={slideDirection} mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                referrerPolicy="no-referrer"
                custom={slideDirection}
                initial={{ opacity: 0, scale: 0.92, x: slideDirection > 0 ? 100 : -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.92, x: slideDirection > 0 ? -100 : 100 }}
                transition={{ duration: 0.22 }}
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
              />
            </AnimatePresence>

            {totalImages > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-xs"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div className="max-w-xl mx-auto w-full flex items-center justify-center gap-2 py-2 overflow-x-auto no-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSlideDirection(idx >= selectedImageIndex ? 1 : -1);
                  setSelectedImageIndex(idx);
                }}
                className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImageIndex === idx
                    ? 'border-emerald-400 scale-105 ring-2 ring-emerald-400/50'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
};

