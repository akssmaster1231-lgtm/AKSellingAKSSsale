/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Product, Story, CartItem, TabType, Order, ProductColor, Address, 
  UserProfile, ReturnRecord, ClaimRecord, DailySalesPoint, SellerBankDetails, PayoutRecord,
  HeroBanner, CreatorProfile, LiveStoreMetrics, AppCategory 
} from './types';
import { 
  MOCK_PRODUCTS, MOCK_STORIES, INITIAL_ORDERS, INITIAL_ADDRESSES, 
  INITIAL_USER_PROFILE, INITIAL_RETURNS, INITIAL_CLAIMS, 
  INITIAL_DAILY_SALES, INITIAL_SELLER_BANK_DETAILS, INITIAL_PAYOUTS,
  INITIAL_CREATOR_PROFILE, MOCK_BANNERS 
} from './data/mockData';
import { Header } from './components/Header';
import { StoriesBar } from './components/StoriesBar';
import { StoryModal } from './components/StoryModal';
import { BannerCarousel } from './components/BannerCarousel';
import { ProductFeed } from './components/ProductFeed';
import { ProductDetailPage } from './components/ProductDetailPage';
import { BottomNav } from './components/BottomNav';
import { CartView } from './components/CartView';
import { CategoryView } from './components/CategoryView';
import { BestDealsView } from './components/BestDealsView';
import { AccountView } from './components/AccountView';
import { SupportPageView } from './components/SupportPageView';
import { MyOrdersPageView } from './components/MyOrdersPageView';
import { WhatsAppChatButton } from './components/WhatsAppChatButton';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { SellerDashboardView } from './components/seller/SellerDashboardView';
import { AuthGateModal } from './components/AuthGateModal';
import { LoginPage } from './components/LoginPage';
import { CheckCircle2, ShoppingBag, Store, Eye, RefreshCw, ShieldAlert } from 'lucide-react';
import { 
  subscribeToAuthChanges,
  fetchProductsFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeToProducts,
  fetchOrdersFromFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  subscribeToOrders,
  fetchAddressesFromFirestore,
  saveAddressToFirestore,
  deleteAddressFromFirestore,
  syncUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  fetchSellerBankDetailsFromFirestore,
  saveSellerBankDetailsToFirestore,
  fetchPayoutsFromFirestore,
  fetchLogisticsConfigFromFirestore,
  fetchBannersFromFirestore,
  subscribeToBanners,
  saveBannerToFirestore,
  deleteBannerFromFirestore,
  fetchStoriesFromFirestore,
  subscribeToStories,
  saveStoryToFirestore,
  deleteStoryFromFirestore,
  fetchCreatorProfileFromFirestore,
  saveCreatorProfileToFirestore,
  subscribeToCreatorProfile,
  fetchWishlistFromFirestore,
  saveWishlistToFirestore,
  subscribeToWishlist,
  fetchStoreMetricsFromFirestore,
  subscribeToStoreMetrics,
  recordLiveStoreActivity,
  DEFAULT_STORE_METRICS,
  fetchCategoriesFromFirestore,
  subscribeToCategories,
  deductProductInventoryOnOrder,
  AppUser
} from './lib/firebase';
import { hasSupplierDashboardAccess, isOwnerUser } from './lib/authUtils';
import { sendOrderNotificationEmails, SELLER_ALERT_EMAIL } from './utils/emailNotificationService';

export default function App() {
  // Mode State: 'store' (Buyer Storefront) vs 'seller' (Supplier Dashboard)
  // Strict View-State Lock: Loads and persists across page reloads/refreshes
  const [appMode, setAppMode] = useState<'store' | 'seller'>(() => {
    try {
      const saved = localStorage.getItem('ak_view_mode') || localStorage.getItem('ak_app_mode');
      if (saved === 'seller' || saved === 'store') return saved;
    } catch {}
    return 'store';
  });

  // Navigation State (for buyer storefront)
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Data State (Permanently persisted & synced via Firebase Firestore)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile>(INITIAL_CREATOR_PROFILE);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [banners, setBanners] = useState<HeroBanner[]>(MOCK_BANNERS);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());

  // Seller Hub Specific Data State
  const [returns, setReturns] = useState<ReturnRecord[]>(INITIAL_RETURNS);
  const [claims, setClaims] = useState<ClaimRecord[]>(INITIAL_CLAIMS);
  const [dailySales] = useState<DailySalesPoint[]>(INITIAL_DAILY_SALES);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [bankDetails, setBankDetails] = useState<SellerBankDetails>(INITIAL_SELLER_BANK_DETAILS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return [
      {
        id: `${MOCK_PRODUCTS[0].id}-L-${MOCK_PRODUCTS[0].colors[0].name}`,
        product: MOCK_PRODUCTS[0],
        selectedSize: 'L',
        selectedColor: MOCK_PRODUCTS[0].colors[0],
        quantity: 1,
      }
    ];
  });

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set(['prod-2', 'prod-7']));
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  // Firebase Auth & User State
  const [firebaseUser, setFirebaseUser] = useState<AppUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isGuestBrowsing, setIsGuestBrowsing] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTitle, setAuthModalTitle] = useState<string | undefined>(undefined);
  const [authModalSubtitle, setAuthModalSubtitle] = useState<string | undefined>(undefined);
  const [pendingBuyAction, setPendingBuyAction] = useState<(() => void) | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [storeMetrics, setStoreMetrics] = useState<LiveStoreMetrics>(DEFAULT_STORE_METRICS);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutCoupon, setCheckoutCoupon] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Helper to open Auth modal for Browse-First, Login-to-Buy flow
  const triggerLoginPrompt = (title?: string, subtitle?: string, onComplete?: () => void) => {
    setAuthModalTitle(title);
    setAuthModalSubtitle(subtitle);
    if (onComplete) {
      setPendingBuyAction(() => onComplete);
    } else {
      setPendingBuyAction(null);
    }
    setIsAuthModalOpen(true);
  };

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, selectedProduct, appMode]);

  // Load Initial Data from Firestore (Hydrating from offline cache + online sync)
  const loadFirestoreData = useCallback(async (userId?: string) => {
    setIsRefreshing(true);
    try {
      const [
        fetchedOrders, 
        fetchedProducts, 
        fetchedBankDetails, 
        fetchedPayouts,
        fetchedBanners,
        fetchedStories,
        fetchedCreatorProfile
      ] = await Promise.all([
        fetchOrdersFromFirestore(userId),
        fetchProductsFromFirestore(),
        fetchSellerBankDetailsFromFirestore(),
        fetchPayoutsFromFirestore(),
        fetchBannersFromFirestore(),
        fetchStoriesFromFirestore(),
        fetchCreatorProfileFromFirestore(),
      ]);

      if (fetchedOrders && fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
      }
      if (fetchedProducts && fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
      }
      if (fetchedBankDetails) {
        setBankDetails(fetchedBankDetails);
      }
      if (fetchedPayouts && fetchedPayouts.length > 0) {
        setPayouts(fetchedPayouts);
      }
      if (fetchedBanners && fetchedBanners.length > 0) {
        setBanners(fetchedBanners);
      }
      if (fetchedStories && fetchedStories.length > 0) {
        setStories(fetchedStories);
      }
      if (fetchedCreatorProfile) {
        setCreatorProfile(fetchedCreatorProfile);
      }

      fetchCategoriesFromFirestore().then((cats) => {
        if (cats && cats.length > 0) setCategories(cats);
      }).catch(() => {});

      // Pre-warm store telemetry metrics and logistics config from Firestore
      fetchStoreMetricsFromFirestore().then((m) => {
        if (m) setStoreMetrics(m);
      }).catch(() => {});
      fetchLogisticsConfigFromFirestore().catch(() => {});

      if (userId) {
        const [userAddresses, userWishlist] = await Promise.all([
          fetchAddressesFromFirestore(userId),
          fetchWishlistFromFirestore(userId),
        ]);
        if (userAddresses && userAddresses.length > 0) {
          setSavedAddresses(userAddresses);
        }
        if (userWishlist && userWishlist.length > 0) {
          setWishlistIds(new Set(userWishlist));
        }
      }
    } catch (e) {
      console.warn('Firestore initial data fetch notice:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Live Real-Time Subscriptions across sessions, tabs & devices
  useEffect(() => {
    const unsubscribeOrders = subscribeToOrders((liveOrders) => {
      if (liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
      }
    });

    const unsubscribeProducts = subscribeToProducts((liveProducts) => {
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      }
    });

    const unsubscribeBanners = subscribeToBanners((liveBanners) => {
      if (liveBanners && liveBanners.length > 0) {
        setBanners(liveBanners);
      }
    });

    const unsubscribeStories = subscribeToStories((liveStories) => {
      if (liveStories && liveStories.length > 0) {
        setStories(liveStories);
      }
    });

    const unsubscribeCreator = subscribeToCreatorProfile((liveProfile) => {
      if (liveProfile) {
        setCreatorProfile(liveProfile);
      }
    });

    const unsubscribeMetrics = subscribeToStoreMetrics((liveMetrics) => {
      if (liveMetrics) {
        setStoreMetrics(liveMetrics);
      }
    });

    const unsubscribeCategories = subscribeToCategories((liveCats) => {
      if (liveCats && liveCats.length > 0) {
        setCategories(liveCats);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeBanners();
      unsubscribeStories();
      unsubscribeCreator();
      unsubscribeMetrics();
      unsubscribeCategories();
    };
  }, []);

  // Initialize Firebase Auth Subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setFirebaseUser(user);
      setIsAuthChecking(false);

      if (user) {
        // Try to load any existing persisted user profile from Firestore first
        try {
          const remoteProfile = await fetchUserProfileFromFirestore(user.id);
          if (remoteProfile) {
            setUserProfile(remoteProfile);
          } else {
            const newProfile: UserProfile = {
              name: user.name || user.email?.split('@')[0] || INITIAL_USER_PROFILE.name,
              email: user.email || INITIAL_USER_PROFILE.email,
              phone: user.phone || INITIAL_USER_PROFILE.phone,
              gender: 'Male',
              avatar: user.avatar || INITIAL_USER_PROFILE.avatar,
              memberTier: 'AK PLUS GOLD VIP',
              superCoins: 650,
            };
            setUserProfile(newProfile);
            await syncUserProfileToFirestore(user);
          }
        } catch (err) {
          console.warn('Profile fetch notice:', err);
        }
        loadFirestoreData(user.id);
      } else {
        loadFirestoreData();
      }
    });

    return () => unsubscribe();
  }, [loadFirestoreData]);

  // Live Real-Time Wishlist Subscription for Authenticated User
  useEffect(() => {
    if (!firebaseUser?.id) return;
    const unsubscribeWishlist = subscribeToWishlist(firebaseUser.id, (ids) => {
      if (ids && ids.length > 0) {
        setWishlistIds(new Set(ids));
      }
    });
    return () => unsubscribeWishlist();
  }, [firebaseUser?.id]);

  // Mode Switch Helper with Strict View-State Persistence
  const switchAppMode = (mode: 'store' | 'seller') => {
    setAppMode(mode);
    try {
      localStorage.setItem('ak_view_mode', mode);
      localStorage.setItem('ak_app_mode', mode);
    } catch {}
  };

  // Route-Level & View-State Lock Protection
  useEffect(() => {
    const checkRouteAndAccess = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const isDashboardRoute = 
        path === '/supplier-dashboard' || 
        path.startsWith('/supplier-dashboard') || 
        hash === '#supplier-dashboard';

      if (isDashboardRoute && appMode !== 'seller') {
        switchAppMode('seller');
      }
    };

    checkRouteAndAccess();

    const handlePopState = () => checkRouteAndAccess();
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Secure Switcher to Seller Dashboard
  const handleOpenSellerDashboard = () => {
    switchAppMode('seller');
    try {
      window.history.pushState(null, '', '/supplier-dashboard');
    } catch {
      window.location.hash = 'supplier-dashboard';
    }
    showToast('Switched to Supplier Dashboard (AKSelling)', 'success');
  };

  // Switch to Buyer Storefront
  const handleSwitchToStore = () => {
    switchAppMode('store');
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
    showToast('Switched to Buyer Storefront', 'info');
  };

  // Handle successful login from Auth Modal
  const handleAuthenticated = (user: AppUser, profile: UserProfile) => {
    setFirebaseUser(user);
    setUserProfile(profile);
    syncUserProfileToFirestore(user);
    loadFirestoreData(user.id);
    setIsAuthModalOpen(false);
    showToast(`Welcome to AKSelling, ${profile.name}!`, 'success');

    // Automatically resume pending buy/checkout action
    if (pendingBuyAction) {
      const action = pendingBuyAction;
      setPendingBuyAction(null);
      setTimeout(() => {
        action();
      }, 300);
    }
  };

  // Story click handler
  const handleSelectStory = (story: Story) => {
    setActiveStory(story);
    setViewedStoryIds((prev) => new Set([...prev, story.id]));
  };

  // Wishlist toggle with Firestore cloud sync
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        showToast(`Removed "${product.title.slice(0, 24)}..." from Wishlist`, 'info');
      } else {
        next.add(product.id);
        showToast(`Saved "${product.title.slice(0, 24)}..." to Wishlist!`, 'success');
      }
      if (firebaseUser?.id) {
        saveWishlistToFirestore(firebaseUser.id, Array.from(next) as string[]).catch((err) => {
          console.warn('Wishlist Firestore sync notice:', err);
        });
      }
      return next;
    });
  };

  // Add to Cart
  const handleAddToCart = (product: Product, size?: string, color?: ProductColor, quantity: number = 1) => {
    const chosenSize = size || product.sizes[0];
    const chosenColor = color || product.colors[0];
    const itemId = `${product.id}-${chosenSize}-${chosenColor.name}`;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
          quantity,
        },
      ];
    });

    showToast(`Added ${quantity}x "${product.title.slice(0, 24)}..." (Size ${chosenSize}) to Cart!`);
  };

  // Quick Buy Now (Instant Checkout directly from product detail or story overlay)
  const handleBuyNow = (product: Product, size: string, color: ProductColor, quantity: number) => {
    const singleBuyItem: CartItem = {
      id: `${product.id}-${size}-${color.name}-instant`,
      product,
      selectedSize: size,
      selectedColor: color,
      quantity,
    };

    // Browse-First, Login-to-Buy Gate
    if (!firebaseUser) {
      triggerLoginPrompt(
        `Sign In to Buy "${product.title.slice(0, 28)}..."`,
        `Login or create an account to proceed with instant checkout, live BlueDart tracking, and 256-bit SSL security.`,
        () => {
          setCheckoutItems([singleBuyItem]);
          setCheckoutDiscount(0);
          setCheckoutCoupon('');
          setIsCheckoutOpen(true);
        }
      );
      return;
    }

    setCheckoutItems([singleBuyItem]);
    setCheckoutDiscount(0);
    setCheckoutCoupon('');
    setIsCheckoutOpen(true);
  };

  // Proceed to checkout from cart
  const handleProceedToCheckout = (discount: number, coupon: string) => {
    // Browse-First, Login-to-Buy Gate
    if (!firebaseUser) {
      triggerLoginPrompt(
        'Sign In to Complete Your Checkout',
        'Login or create your account to place your order with verified payment gateway and free express delivery.',
        () => {
          setCheckoutItems(cartItems);
          setCheckoutDiscount(discount);
          setCheckoutCoupon(coupon);
          setIsCheckoutOpen(true);
        }
      );
      return;
    }

    setCheckoutItems(cartItems);
    setCheckoutDiscount(discount);
    setCheckoutCoupon(coupon);
    setIsCheckoutOpen(true);
  };

  // On order placed & verified with Razorpay -> Sync to Firestore & send email notifications
  const handleOrderSuccess = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    
    // Direct sync to Firestore Orders Collection
    await saveOrderToFirestore(newOrder, firebaseUser?.id);

    // Deduct stock for purchased items and sync inventory to Firestore
    if (newOrder.items && newOrder.items.length > 0) {
      deductProductInventoryOnOrder(newOrder.items).catch(() => {});
      setProducts((prev) =>
        prev.map((prod) => {
          const purchasedItem = newOrder.items.find((i) => i.product.id === prod.id);
          if (purchasedItem) {
            const currentStock = typeof prod.stockCount === 'number' ? prod.stockCount : 50;
            const newStock = Math.max(0, currentStock - purchasedItem.quantity);
            return { ...prod, stockCount: newStock, inStock: newStock > 0 };
          }
          return prod;
        })
      );
    }

    // Record real-time order telemetry in Firestore store metrics
    recordLiveStoreActivity('order', newOrder.totalAmount || 0).catch(() => {});

    // Send automatic email notifications to customer and seller alert to akyadavprintaksellig@gmail.com
    try {
      await sendOrderNotificationEmails(newOrder, userProfile?.email || newOrder.customerEmail);
      showToast(`Order confirmed! Email sent to ${newOrder.customerEmail || userProfile?.email} & seller alerted`, 'success');
    } catch (e) {
      console.warn('Email notification dispatch notice:', e);
    }

    // Clear cart if whole cart was bought
    if (checkoutItems.length === cartItems.length) {
      setCartItems([]);
    }
  };

  // Full order updater for logistics and tracking updates
  const handleUpdateOrder = async (updatedOrder: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    await saveOrderToFirestore(updatedOrder, updatedOrder.userId || firebaseUser?.id);
    showToast(`Order #${updatedOrder.id} logistics synced!`);
  };

  // Cart item modifiers
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  // Open product detail page
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    recordLiveStoreActivity('view').catch(() => {});
  };

  // Back from product detail page
  const handleBackToFeed = () => {
    setSelectedProduct(null);
  };

  // Address handlers with Firestore sync
  const handleAddAddress = async (newAddr: Address) => {
    setSavedAddresses((prev) => {
      if (newAddr.isDefault) {
        return [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))];
      }
      return [newAddr, ...prev];
    });
    if (firebaseUser?.id) {
      await saveAddressToFirestore(firebaseUser.id, newAddr);
    }
    showToast('Delivery address saved to Firebase!');
  };

  const handleUpdateAddress = async (updated: Address) => {
    setSavedAddresses((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : updated.isDefault ? { ...a, isDefault: false } : a))
    );
    if (firebaseUser?.id) {
      await saveAddressToFirestore(firebaseUser.id, updated);
    }
    showToast('Address updated and synced!');
  };

  const handleDeleteAddress = async (id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    if (firebaseUser?.id) {
      await deleteAddressFromFirestore(firebaseUser.id, id);
    }
    showToast('Address removed from Firebase storage', 'info');
  };

  const handleSetDefaultAddress = async (id: string) => {
    const target = savedAddresses.find((a) => a.id === id);
    if (target) {
      const updatedTarget = { ...target, isDefault: true };
      setSavedAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      if (firebaseUser?.id) {
        await saveAddressToFirestore(firebaseUser.id, updatedTarget);
      }
      showToast('Default delivery address updated');
    }
  };

  // Profile handler with Firestore sync
  const handleUpdateUserProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    if (firebaseUser?.id) {
      await syncUserProfileToFirestore({
        id: firebaseUser.id,
        email: updated.email,
        name: updated.name,
        avatar: updated.avatar,
        phone: updated.phone
      });
    }
    showToast('Profile saved to Firebase!');
  };

  // Add new product from seller dashboard with Firestore sync
  const handleAddNewProduct = async (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    await saveProductToFirestore(newProduct);
    showToast(`"${newProduct.title}" is now live in catalog & Firebase!`);
  };

  // Update existing product from seller dashboard
  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    let updatedTarget: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedTarget = { ...p, ...updates };
          return updatedTarget;
        }
        return p;
      })
    );
    const targetProd = updatedTarget || products.find((p) => p.id === productId);
    if (targetProd) {
      await saveProductToFirestore({ ...targetProd, ...updates });
    }
    showToast('Product updated in Firebase catalog!');
  };

  // Delete product from seller dashboard
  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await deleteProductFromFirestore(productId);
    showToast('Product removed from catalog', 'info');
  };

  // Update order status with real-time Firestore sync
  const handleUpdateOrderStatus = async (
    orderId: string, 
    newStatus: Order['status'], 
    trackingStep?: number, 
    notes?: string
  ) => {
    await updateOrderStatusInFirestore(orderId, newStatus, trackingStep || 2);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, trackingStep: trackingStep || o.trackingStep } : o))
    );
    showToast(`Order ${orderId} updated to "${newStatus}"!`);
  };

  // Raise compensation claim on wrong returns
  const handleRaiseClaim = (claim: Partial<ClaimRecord>) => {
    const newClaim: ClaimRecord = {
      id: `CLM-${Date.now().toString().slice(-4)}`,
      returnId: claim.returnId || 'RET-000',
      sku: claim.sku || 'SKU-000',
      productTitle: claim.productTitle || 'Apparel Item',
      reason: claim.reason || 'Fraudulent Return / Wrong Item',
      claimAmount: claim.claimAmount || 699,
      status: 'Pending',
      raisedDate: 'Today',
      awbNumber: claim.awbNumber || 'AWB-PENDING',
      notes: claim.notes || 'Unboxing video verification submitted.',
    };

    setClaims((prev) => [newClaim, ...prev]);

    // Update return record status
    if (claim.returnId) {
      setReturns((prev) =>
        prev.map((r) =>
          r.id === claim.returnId ? { ...r, status: 'Claim Raised', claimStatus: 'Pending' } : r
        )
      );
    }

    showToast(`Claim ${newClaim.id} submitted for ₹${newClaim.claimAmount} reimbursement!`);
  };

  // Bank details update handler with permanent Firestore persistence
  const handleSaveBankDetails = async (updated: SellerBankDetails) => {
    setBankDetails(updated);
    await saveSellerBankDetailsToFirestore(updated);
    showToast('Bank details updated and permanently saved to Firebase!');
  };

  // Creator Profile Update Handler (Permanently saved to Firestore)
  const handleUpdateCreatorProfile = async (profile: CreatorProfile) => {
    setCreatorProfile(profile);

    // Synchronize author info across all active stories
    setStories((prev) => {
      return prev.map((s) => ({
        ...s,
        author: profile.brandName,
        authorHandle: profile.handle,
        avatar: profile.avatar,
        isAuthorVerified: profile.isVerified,
      }));
    });

    try {
      await saveCreatorProfileToFirestore(profile);
      showToast('Creator Profile permanently synced to Firestore!');
    } catch (e) {
      console.warn('Error saving creator profile:', e);
      showToast('Profile updated locally, syncing to cloud...', 'info');
    }
  };

  // Stories CRUD Handlers (Permanent Firestore persistence)
  const handleAddStory = async (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    try {
      await saveStoryToFirestore(newStory);
      showToast(`Story "${newStory.title}" published live & synced to Firestore!`);
    } catch (e) {
      console.warn('Error saving story to Firestore:', e);
      showToast(`Story published, syncing to cloud...`, 'info');
    }
  };

  const handleUpdateStory = async (storyId: string, updates: Partial<Story>) => {
    setStories((prev) => prev.map((s) => (s.id === storyId ? { ...s, ...updates } : s)));
    if (activeStory && activeStory.id === storyId) {
      setActiveStory((prev) => (prev ? { ...prev, ...updates } : null));
    }
    const current = stories.find((s) => s.id === storyId);
    if (current) {
      try {
        await saveStoryToFirestore({ ...current, ...updates });
        showToast('Story updated in Firestore!');
      } catch (e) {
        console.warn('Error updating story in Firestore:', e);
      }
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    try {
      await deleteStoryFromFirestore(storyId);
      showToast('Story removed from storefront & Firestore.', 'info');
    } catch (e) {
      console.warn('Error deleting story from Firestore:', e);
    }
  };

  // Banners CRUD Handlers (Permanent Firestore persistence)
  const handleAddBanner = async (newBanner: HeroBanner) => {
    setBanners((prev) => [newBanner, ...prev]);
    try {
      await saveBannerToFirestore(newBanner);
      showToast('Hero Carousel Banner saved to Firestore!');
    } catch (e) {
      console.warn('Error saving banner to Firestore:', e);
    }
  };

  const handleUpdateBanner = async (bannerId: string, updates: Partial<HeroBanner>) => {
    setBanners((prev) => prev.map((b) => (b.id === bannerId ? { ...b, ...updates } : b)));
    const current = banners.find((b) => b.id === bannerId);
    if (current) {
      try {
        await saveBannerToFirestore({ ...current, ...updates });
        showToast('Banner updated in Firestore!');
      } catch (e) {
        console.warn('Error updating banner in Firestore:', e);
      }
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    try {
      await deleteBannerFromFirestore(bannerId);
      showToast('Banner deleted from Firestore.', 'info');
    } catch (e) {
      console.warn('Error deleting banner from Firestore:', e);
    }
  };

  // Manual refresh trigger
  const handleRefreshAllData = async () => {
    await loadFirestoreData(firebaseUser?.id);
    showToast('Catalog & orders synchronized with Firestore!');
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const wishlistedProducts = products.filter((p) => wishlistIds.has(p.id));

  // =========================================================================
  // MANDATORY LOGIN GATE: NO ENTRY WITHOUT AUTHENTICATION
  // If user is not logged in, render the dedicated Full-Page Login Barrier
  // =========================================================================
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#052610] flex flex-col items-center justify-center text-[#f0fdf4] space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0A3A1E] to-[#052610] border border-[#FFC107]/40 flex items-center justify-center shadow-lg animate-bounce">
          <ShoppingBag className="w-6 h-6 text-[#FFC107]" />
        </div>
        <p className="text-sm font-bold text-emerald-100 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FFC107]" />
          <span>Verifying Secure Firebase Session...</span>
        </p>
      </div>
    );
  }

  if (!firebaseUser && !isGuestBrowsing) {
    return (
      <>
        <LoginPage 
          onAuthenticated={handleAuthenticated} 
          onExploreAsGuest={() => setIsGuestBrowsing(true)}
        />
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A3A1E]/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#FFC107]/30 text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#FFC107] shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        )}
      </>
    );
  }

  // =========================================================================
  // VIEW MODE ROUTER: FULL-SCREEN SELLER DASHBOARD VS BUYER STOREFRONT
  // Strict View-State Lock: Preserved stably until explicitly switched by user
  // =========================================================================
  if (appMode === 'seller') {
    return (
      <>
        {/* Full-Screen Meesho-Inspired Supplier Dashboard (AK Selling) */}
        <SellerDashboardView
          products={products}
          orders={orders}
          returns={returns}
          claims={claims}
          dailySales={dailySales}
          storeMetrics={storeMetrics}
          payouts={payouts}
          bankDetails={bankDetails}
          stories={stories}
          banners={banners}
          creatorProfile={creatorProfile}
          onUpdateCreatorProfile={handleUpdateCreatorProfile}
          onSaveBankDetails={handleSaveBankDetails}
          onAddProduct={handleAddNewProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateOrder={handleUpdateOrder}
          onRaiseClaim={handleRaiseClaim}
          onRefreshData={handleRefreshAllData}
          onToggleStorefront={handleSwitchToStore}
          onAddStory={handleAddStory}
          onUpdateStory={handleUpdateStory}
          onDeleteStory={handleDeleteStory}
          onAddBanner={handleAddBanner}
          onUpdateBanner={handleUpdateBanner}
          onDeleteBanner={handleDeleteBanner}
          onPreviewStory={(s) => setActiveStory(s)}
          isRefreshing={isRefreshing}
          firebaseUser={firebaseUser}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A3A1E]/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#FFC107]/30 text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#FFC107] shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#052610] text-[#f0fdf4] flex flex-col font-sans selection:bg-[#FFC107] selection:text-[#052610]">
      {/* Top Header Bar with AKSelling Branding (Public Access to Seller Hub completely removed) */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedProduct(null);
        }}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.size}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q && activeTab !== 'home') setActiveTab('home');
          if (selectedProduct) setSelectedProduct(null);
        }}
        onOpenWishlist={() => setShowWishlistModal(true)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        firebaseUser={firebaseUser}
        onOpenLogin={() => triggerLoginPrompt('Sign In to Your AKSelling Account', 'Access your live orders, BlueDart tracking, and saved delivery addresses.')}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {selectedProduct ? (
          /* Dedicated Full Product Page View */
          <ProductDetailPage
            product={selectedProduct}
            onBack={handleBackToFeed}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isWishlisted={wishlistIds.has(selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="space-y-4 pb-20 md:pb-12">
                {/* 1. TOP INSTAGRAM-STYLE STORIES BAR */}
                <StoriesBar
                  stories={stories}
                  onSelectStory={handleSelectStory}
                  viewedStoryIds={viewedStoryIds}
                />

                {/* 2. FLIPKART-STYLE PROMOTIONAL BANNER & PRODUCT FEED */}
                <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 pt-1">
                  <BannerCarousel
                    banners={banners}
                    onFilterCategory={(cat) => setSelectedCategory(cat)}
                  />

                  <ProductFeed
                    products={products}
                    categories={categories}
                    onOpenProduct={handleOpenProduct}
                    wishlistIds={wishlistIds}
                    onToggleWishlist={handleToggleWishlist}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    searchQuery={searchQuery}
                    onClearSearch={() => setSearchQuery('')}
                  />
                </div>
              </div>
            )}

            {activeTab === 'category' && (
              <CategoryView
                categories={categories}
                products={products}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setActiveTab('home');
                }}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'deals' && (
              <BestDealsView
                products={products}
                onOpenProduct={handleOpenProduct}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
              />
            )}

            {activeTab === 'cart' && (
              <CartView
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveCartItem}
                onOpenProduct={handleOpenProduct}
                onProceedToCheckout={handleProceedToCheckout}
                onStartShopping={() => {
                  setActiveTab('home');
                  setSelectedProduct(null);
                }}
              />
            )}

            {activeTab === 'account' && (
              <AccountView
                orders={orders}
                onOpenProduct={handleOpenProduct}
                wishlistCount={wishlistIds.size}
                onOpenWishlist={() => setShowWishlistModal(true)}
                userProfile={userProfile}
                onUpdateUserProfile={handleUpdateUserProfile}
                savedAddresses={savedAddresses}
                onAddAddress={handleAddAddress}
                onUpdateAddress={handleUpdateAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
                onOpenTrackingModal={(ord) => setActiveTrackingOrder(ord)}
                onOpenSellerDashboard={handleOpenSellerDashboard}
                onOpenOrdersPage={() => setActiveTab('orders')}
                onOpenSupportPage={() => setActiveTab('support')}
                firebaseUser={firebaseUser}
                onRefreshData={() => loadFirestoreData(firebaseUser?.id)}
                onOpenAuthModal={() => triggerLoginPrompt('Sign In to AKSelling', 'Access your live orders, BlueDart tracking, saved delivery addresses, and 650 SuperCoins.')}
              />
            )}

            {/* DEDICATED FULL-PAGE MY ORDERS & TRACKING VIEW */}
            {activeTab === 'orders' && (
              <MyOrdersPageView
                orders={orders}
                onBack={() => setActiveTab('home')}
                onOpenTrackingModal={(ord) => setActiveTrackingOrder(ord)}
                onOpenSupport={(orderId) => setActiveTab('support')}
                onContinueShopping={() => setActiveTab('home')}
              />
            )}

            {/* DEDICATED FULL-PAGE BUYER SUPPORT DESK */}
            {activeTab === 'support' && (
              <SupportPageView
                orders={orders}
                onBack={() => setActiveTab('home')}
                onOpenTrackingModal={(ord) => setActiveTrackingOrder(ord)}
                userEmail={firebaseUser?.email}
                userName={firebaseUser?.name}
              />
            )}
          </>
        )}
      </main>

      {/* Instagram Story Fullscreen Modal with Direct Buy Now Button */}
      {activeStory && (
        <StoryModal
          story={activeStory}
          allStories={stories}
          onClose={() => setActiveStory(null)}
          onSelectStory={handleSelectStory}
          onOpenProduct={(product) => {
            setActiveStory(null);
            setSelectedProduct(product);
          }}
          onBuyNow={(prod, sz, col, qty) => {
            setActiveStory(null);
            handleBuyNow(prod, sz, col, qty);
          }}
          onUpdateStoryInteractions={handleUpdateStory}
          products={products}
        />
      )}

      {/* Flipkart-Style Shipping Address & Real Payment Gateway Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setActiveTab('account');
        }}
        checkoutItems={checkoutItems}
        discountAmount={checkoutDiscount}
        couponCode={checkoutCoupon}
        savedAddresses={savedAddresses}
        onSaveNewAddress={handleAddAddress}
        onOrderSuccess={handleOrderSuccess}
        onViewOrderTracking={(ord) => {
          setIsCheckoutOpen(false);
          setActiveTab('account');
          setActiveTrackingOrder(ord);
        }}
      />

      {/* Detailed Live Order Delivery Tracking Modal */}
      {activeTrackingOrder && (
        <LiveTrackingModal
          order={activeTrackingOrder}
          onClose={() => setActiveTrackingOrder(null)}
        />
      )}

      {/* Wishlist Drawer/Modal */}
      <WishlistModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
        wishlistProducts={wishlistedProducts}
        onRemoveWishlist={handleToggleWishlist}
        onOpenProduct={(p) => {
          setShowWishlistModal(false);
          setSelectedProduct(p);
        }}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* Browse-First, Login-to-Buy Supabase Auth Modal */}
      <AuthGateModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingBuyAction(null);
        }}
        onAuthenticated={handleAuthenticated}
        title={authModalTitle}
        subtitle={authModalSubtitle}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A3A1E]/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-[#FFC107]/30 text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FFC107] shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Floating Live WhatsApp & In-App Chat Support for +919893598920 */}
      <WhatsAppChatButton
        phoneNumber="919893598920"
        orders={orders}
        userName={userProfile?.name || firebaseUser?.name || 'Customer'}
        userEmail={userProfile?.email || firebaseUser?.email || ''}
        onOpenTrackingModal={(ord) => setActiveTrackingOrder(ord)}
        onOpenSupportPage={() => setActiveTab('support')}
      />

      {/* FIXED BOTTOM NAVIGATION BAR (Home, Category, Best Deal, Cart, Account) */}
      {!selectedProduct && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedProduct(null);
          }}
          cartCount={totalCartCount}
        />
      )}
    </div>
  );
}
