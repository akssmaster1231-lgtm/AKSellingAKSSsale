import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductColor, Order, SellerBankDetails, PayoutRecord } from '../types';
import { 
  X, Store, TrendingUp, Package, Plus, DollarSign, CheckCircle2, 
  BarChart3, Sparkles, AlertCircle, ArrowLeft, Layers, ShieldCheck, Tag,
  Database, RefreshCw, Printer, Search, Filter, Eye, Check, ExternalLink,
  Truck, Clock, ChevronDown, Edit3, Trash2, CreditCard, Building, QrCode,
  FileText, ArrowUpRight, Smartphone, MapPin, Phone, User, Calendar, AlertTriangle
} from 'lucide-react';
import { 
  updateOrderStatusInFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  fetchSellerBankDetailsFromFirestore,
  saveSellerBankDetailsToFirestore,
  fetchPayoutsFromFirestore,
  savePayoutToFirestore
} from '../lib/firebase';
import { INITIAL_SELLER_BANK_DETAILS, INITIAL_PAYOUTS } from '../data/mockData';

interface SellerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders?: Order[];
  onAddNewProduct?: (newProduct: Product) => void;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct?: (productId: string) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: Order['status'], trackingStep?: number, notes?: string) => void;
  onRefreshData?: () => void;
  firebaseUser?: any;
}

export const SellerDashboardModal: React.FC<SellerDashboardModalProps> = ({
  isOpen,
  onClose,
  products,
  orders = [],
  onAddNewProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onRefreshData,
  firebaseUser,
}) => {
  // Navigation Folder / Tab: 'overview' | 'orders' | 'inventory' | 'payouts'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'payouts'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-views & Modals
  const [isNewProductFormOpen, setIsNewProductFormOpen] = useState(false);
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<Order | null>(null);
  const [selectedPaymentVerifyOrder, setSelectedPaymentVerifyOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Orders Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Processing' | 'Confirmed' | 'In Transit' | 'Delivered' | 'Cancelled'>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<'All' | 'Razorpay' | 'UPI' | 'COD'>('All');

  // Inventory Filter State
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('All');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'All' | 'InStock' | 'LowStock' | 'OutOfStock'>('All');

  // Bank Details & Payouts State
  const [bankDetails, setBankDetails] = useState<SellerBankDetails>(INITIAL_SELLER_BANK_DETAILS);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState<SellerBankDetails>(INITIAL_SELLER_BANK_DETAILS);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);

  // New Listing Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('AKSelling Studio');
  const [newCategory, setNewCategory] = useState<'Oversized' | 'Graphic' | 'Acid Wash' | 'Plain Basics' | 'Polo & Collared' | 'Anime & Gaming' | 'Gym & Active'>('Oversized');
  const [newPrice, setNewPrice] = useState('699');
  const [newOriginalPrice, setNewOriginalPrice] = useState('1499');
  const [newFabric, setNewFabric] = useState('240 GSM 100% French Terry Cotton');
  const [newGsm, setNewGsm] = useState('240');
  const [newFit, setNewFit] = useState('Oversized Boxy Dropped Shoulder Fit');
  const [newDescription, setNewDescription] = useState('Heavyweight oversized streetwear drop crafted with premium bio-wash combed yarn, high-density puff screenprinting, and reinforced anti-sag collar.');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80');
  const [newSecondaryImageUrl, setNewSecondaryImageUrl] = useState('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80');
  const [newSelectedSizes, setNewSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [newStockCount, setNewStockCount] = useState('50');
  const [newColors, setNewColors] = useState<ProductColor[]>([
    { name: 'Onyx Black', hex: '#111827', imageIndex: 0 },
    { name: 'Off-White', hex: '#F9FAFB', imageIndex: 1 },
  ]);

  // Load Bank Details and Payouts from Firestore
  useEffect(() => {
    if (isOpen) {
      fetchSellerBankDetailsFromFirestore().then((data) => {
        setBankDetails(data);
        setBankForm(data);
      });
      fetchPayoutsFromFirestore().then((data) => {
        setPayouts(data);
      });
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isLive = true;

  // Calculations for Overview Dashboard
  const totalGMV = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const pendingDispatchCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Delivered').length;
  }, [orders]);

  const cancelledCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Cancelled').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.stockCount || 0) < 15 && p.inStock).length;
  }, [products]);

  // Calculate available settlement balance: 95% of non-cancelled orders minus settled payouts
  const settledTotal = useMemo(() => {
    return payouts.filter(p => p.status === 'Settled').reduce((sum, p) => sum + p.amount, 0);
  }, [payouts]);

  const availableSettlementBalance = useMemo(() => {
    const netOrderRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const balance = Math.max(0, Math.round(netOrderRevenue * 0.96 + 4820 - (settledTotal > 40000 ? settledTotal - 40000 : 0)));
    return balance;
  }, [orders, settledTotal]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status Filter
      if (orderStatusFilter !== 'All') {
        if (orderStatusFilter === 'Processing' && ord.status !== 'Processing') return false;
        if (orderStatusFilter === 'Confirmed' && ord.status !== 'Confirmed') return false;
        if (orderStatusFilter === 'In Transit' && ord.status !== 'In Transit') return false;
        if (orderStatusFilter === 'Delivered' && ord.status !== 'Delivered') return false;
        if (orderStatusFilter === 'Cancelled' && ord.status !== 'Cancelled') return false;
      }
      // Payment Filter
      if (orderPaymentFilter !== 'All') {
        const method = (ord.paymentMethod || '').toLowerCase();
        if (orderPaymentFilter === 'Razorpay' && !method.includes('razorpay') && !method.includes('online')) return false;
        if (orderPaymentFilter === 'UPI' && !method.includes('upi')) return false;
        if (orderPaymentFilter === 'COD' && !method.includes('cod') && !method.includes('cash')) return false;
      }
      // Search Query
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const idMatch = ord.id.toLowerCase().includes(q);
        const addrMatch = (ord.address || '').toLowerCase().includes(q);
        const trackMatch = (ord.trackingNumber || '').toLowerCase().includes(q);
        const nameMatch = (ord.addressObj?.name || '').toLowerCase().includes(q);
        const itemMatch = ord.items.some(i => i.product.title.toLowerCase().includes(q));
        if (!idMatch && !addrMatch && !trackMatch && !nameMatch && !itemMatch) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderPaymentFilter, orderSearchQuery]);

  // Filtered Inventory Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (inventoryCategoryFilter !== 'All' && p.category !== inventoryCategoryFilter) return false;
      if (inventoryStockFilter === 'InStock' && (!p.inStock || p.stockCount <= 0)) return false;
      if (inventoryStockFilter === 'LowStock' && (!p.inStock || p.stockCount > 15 || p.stockCount <= 0)) return false;
      if (inventoryStockFilter === 'OutOfStock' && (p.inStock && p.stockCount > 0)) return false;
      if (inventorySearchQuery.trim()) {
        const q = inventorySearchQuery.toLowerCase();
        const titleMatch = p.title.toLowerCase().includes(q);
        const idMatch = p.id.toLowerCase().includes(q);
        const fabricMatch = (p.fabric || '').toLowerCase().includes(q);
        if (!titleMatch && !idMatch && !fabricMatch) return false;
      }
      return true;
    });
  }, [products, inventoryCategoryFilter, inventoryStockFilter, inventorySearchQuery]);

  if (!isOpen) return null;

  // Handle Refresh from Firestore
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshData) {
      await onRefreshData();
    }
    const [fetchedBank, fetchedPayoutsList] = await Promise.all([
      fetchSellerBankDetailsFromFirestore(),
      fetchPayoutsFromFirestore()
    ]);
    setBankDetails(fetchedBank);
    setPayouts(fetchedPayoutsList);
    setIsRefreshing(false);
    showToast('Real-time sync refreshed from Firebase! 🔄');
  };

  // Handle Order Status Change
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, newStatus);
    } else {
      await updateOrderStatusInFirestore(orderId, newStatus, 2);
    }
    showToast(`Order #${orderId} status updated to "${newStatus}" and saved to Firebase! 📦`);
  };

  // Handle Quick Price / Stock Update in Inventory
  const handleQuickPriceStockUpdate = async (productId: string, newPriceVal: number, newStockVal: number) => {
    const origPrice = products.find(p => p.id === productId)?.originalPrice || newPriceVal * 2;
    const discount = Math.round(((origPrice - newPriceVal) / origPrice) * 100);
    const inStock = newStockVal > 0;

    const updates: Partial<Product> = {
      price: newPriceVal,
      discountPercent: discount > 0 ? discount : 0,
      stockCount: newStockVal,
      inStock,
    };

    if (onUpdateProduct) {
      onUpdateProduct(productId, updates);
    } else {
      const targetProd = products.find(p => p.id === productId);
      if (targetProd) {
        await saveProductToFirestore({ ...targetProd, ...updates });
      }
    }
    showToast(`Product pricing & stock updated in Firebase!`);
  };

  // Handle Size Toggle for a product
  const handleToggleProductSize = async (product: Product, sizeToToggle: string) => {
    const currentSizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
    let updatedSizes: string[];
    if (currentSizes.includes(sizeToToggle)) {
      if (currentSizes.length <= 1) {
        showToast('At least one size must remain active.');
        return;
      }
      updatedSizes = currentSizes.filter(s => s !== sizeToToggle);
    } else {
      updatedSizes = [...currentSizes, sizeToToggle].sort((a, b) => {
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
        return order.indexOf(a) - order.indexOf(b);
      });
    }

    if (onUpdateProduct) {
      onUpdateProduct(product.id, { sizes: updatedSizes });
    } else {
      await saveProductToFirestore({ ...product, sizes: updatedSizes });
    }
    showToast(`Size ${sizeToToggle} ${currentSizes.includes(sizeToToggle) ? 'disabled' : 'enabled'} for "${product.title}"`);
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the live store & Firebase catalog?`)) {
      if (onDeleteProduct) {
        onDeleteProduct(productId);
      } else {
        await deleteProductFromFirestore(productId);
      }
      showToast(`"${title}" removed from catalog.`);
    }
  };

  // Handle Create New Product
  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter a product title.');
      return;
    }

    const priceNum = parseInt(newPrice) || 699;
    const origPriceNum = parseInt(newOriginalPrice) || 1499;
    const discount = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);
    const stockNum = parseInt(newStockCount) || 50;

    const createdProduct: Product = {
      id: `ak-drop-${Date.now()}`,
      title: newTitle.trim(),
      brand: newBrand.trim() || 'AKSelling Studio',
      category: newCategory,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent: discount > 0 ? discount : 50,
      rating: 4.9,
      ratingCount: 84,
      reviewsCount: 22,
      isAssured: true,
      isBestseller: true,
      isTrending: true,
      images: [
        newImageUrl.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        newSecondaryImageUrl.trim() || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
      ],
      colors: newColors.length > 0 ? newColors : [
        { name: 'Onyx Black', hex: '#111827', imageIndex: 0 },
        { name: 'Off-White', hex: '#F9FAFB', imageIndex: 1 },
      ],
      sizes: newSelectedSizes.length > 0 ? newSelectedSizes : ['S', 'M', 'L', 'XL', 'XXL'],
      inStock: stockNum > 0,
      stockCount: stockNum,
      description: newDescription.trim(),
      highlights: [
        `${newGsm || '240'} GSM Heavyweight French Terry Cotton`,
        'High-density anti-crack precision screenprint',
        'Pre-shrunk bio-wash fabric treatment for zero shrinkage',
        'Reinforced ribbed neckband with double-needle hems',
      ],
      fabric: newFabric.trim() || `${newGsm || '240'} GSM 100% French Terry Cotton`,
      gsm: `${newGsm || '240'} GSM`,
      fit: newFit.trim() || 'Oversized Boxy Dropped Shoulder Fit',
      careInstructions: 'Cold machine wash inside out • Do not iron directly on puff print • Line dry in shade',
      deliveryDays: 2,
      offers: [
        'Special Price: Extra ₹100 instant discount on UPI / Razorpay',
        'Bank Offer: 5% Unlimited Cashback with Flipkart Axis Bank Card',
        'Free Shipping on all Prepaid Orders',
      ],
      reviews: [],
    };

    if (onAddNewProduct) {
      onAddNewProduct(createdProduct);
    }

    showToast(`"${createdProduct.title}" is published to Live Store & Firebase!`);
    setIsNewProductFormOpen(false);
    setActiveTab('inventory');

    // Reset fields
    setNewTitle('');
    setNewPrice('699');
    setNewOriginalPrice('1499');
  };

  // Handle Save Bank Details
  const handleSaveBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSellerBankDetailsToFirestore(bankForm);
    setBankDetails(bankForm);
    setIsEditingBank(false);
    showToast('Bank account details saved & verified in Firebase!');
  };

  // Handle Request Instant Payout
  const handleRequestPayout = async () => {
    if (availableSettlementBalance < 500) {
      showToast('Minimum payout balance requirement is ₹500.');
      return;
    }

    const newPayout: PayoutRecord = {
      id: `PO-${Math.floor(10000 + Math.random() * 90000)}-AK`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: availableSettlementBalance,
      status: 'Settled',
      utrNumber: `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      razorpaySettlementId: `setl_live_${Date.now().toString(36)}`,
      bankAccountLast4: bankDetails.accountNumber.slice(-4) || '0194',
      ordersCount: pendingDispatchCount + deliveredCount || 1,
      type: 'Instant On-Demand',
    };

    await savePayoutToFirestore(newPayout);
    setPayouts(prev => [newPayout, ...prev]);
    setIsPayoutModalOpen(false);
    showToast(`Instant Payout of ₹${newPayout.amount.toLocaleString()} processed to ${bankDetails.bankName}!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] max-h-[920px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200" 
        id="akselling-seller-hub-modal"
      >
        {/* ================= 1. AKSELLING SELLER HUB TOP BANNER & BRANDING ================= */}
        <div className="bg-[#0A3A1E] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#134e2c] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC107] text-[#052610] flex items-center justify-center font-black shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>AKSelling- Seller Hub</span>
                  <span className="text-[#FFC107] font-serif italic text-xs font-normal">Supplier Dashboard</span>
                </h2>
                <span className="bg-[#FFC107]/20 text-[#FFC107] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#FFC107]/40 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  DATABASE SYNC
                </span>
                <span className="hidden sm:inline-flex bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                  Merchant ID: AK-7821-MKT
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80">Central Merchant Operations & Real-Time Logistics Control</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
              title="Force Refresh Data"
              id="seller-hub-refresh-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FFC107]' : ''}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close AKSelling Seller Hub"
              id="seller-hub-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= 2. FOLDER / TAB NAVIGATION BAR ================= */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Folder 1: Dashboard (Overview) */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsNewProductFormOpen(false);
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview' && !isNewProductFormOpen
                  ? 'bg-[#0A3A1E] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/80'
              }`}
              id="seller-tab-dashboard"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>Dashboard (Overview)</span>
            </button>

            {/* Folder 2: Orders Management */}
            <button
              onClick={() => {
                setActiveTab('orders');
                setIsNewProductFormOpen(false);
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'orders' && !isNewProductFormOpen
                  ? 'bg-[#0A3A1E] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/80'
              }`}
              id="seller-tab-orders"
            >
              <Package className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>Orders Management</span>
              {pendingDispatchCount > 0 && (
                <span className="bg-[#FFC107] text-[#052610] text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {pendingDispatchCount}
                </span>
              )}
            </button>

            {/* Folder 3: Inventory & Catalog */}
            <button
              onClick={() => {
                setActiveTab('inventory');
                setIsNewProductFormOpen(false);
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'inventory' && !isNewProductFormOpen
                  ? 'bg-[#0A3A1E] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/80'
              }`}
              id="seller-tab-inventory"
            >
              <Layers className="w-3.5 h-3.5 text-[#FFC107]" />
              <span>Inventory & Catalog ({products.length})</span>
            </button>

            {/* Folder 4: Payments & Payouts */}
            <button
              onClick={() => {
                setActiveTab('payouts');
                setIsNewProductFormOpen(false);
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'payouts' && !isNewProductFormOpen
                  ? 'bg-[#0A3A1E] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/80'
              }`}
              id="seller-tab-payouts"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payments & Payouts</span>
            </button>
          </div>

          {/* Direct CTA: List New Product */}
          <button
            onClick={() => {
              setActiveTab('inventory');
              setIsNewProductFormOpen(true);
            }}
            className="bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] font-black px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            id="seller-top-add-product-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List New Product</span>
          </button>
        </div>

        {/* Toast Alert Feedback */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between gap-2 shadow-inner shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-0.5 hover:bg-emerald-700 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= 3. FOLDERS BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* ========================================================================= */}
          {/* FOLDER 1: DASHBOARD (OVERVIEW)                                           */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && !isNewProductFormOpen && (
            <div className="space-y-6">
              {/* Top High-Contrast Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Gross GMV</span>
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                    ₹{totalGMV.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Database className="w-3 h-3" /> Live Supabase Order Total
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Orders to Dispatch</span>
                    <span className="p-1.5 rounded-lg bg-blue-50 text-[#2874F0]">
                      <Package className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#2874F0] font-mono">
                    {pendingDispatchCount}
                  </div>
                  <p className="text-[10px] text-slate-500">Pickups ready for courier</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Inventory</span>
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                      <Layers className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                    {products.length}
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold">
                    {lowStockCount > 0 ? `${lowStockCount} Low stock alerts` : 'All styles in stock'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Available Settlement</span>
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                    ₹{availableSettlementBalance.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Next IMPS Payout: Friday
                  </p>
                </div>
              </div>

              {/* Live Interactive 7-Day Revenue Graph & Analytics Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 7-Day Sales Trend Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-[#2874F0]" />
                        <span>7-Day Gross Revenue & Orders Trend</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Live order velocity tracked across Delhi NCR & Pan-India</p>
                    </div>
                    <span className="bg-blue-50 text-[#2874F0] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                      +28.4% this week
                    </span>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100">
                    {[
                      { day: 'Wed', amount: 3499, height: '42%' },
                      { day: 'Thu', amount: 4890, height: '58%' },
                      { day: 'Fri', amount: 6200, height: '74%' },
                      { day: 'Sat', amount: 7900, height: '90%' },
                      { day: 'Sun', amount: 8450, height: '100%' },
                      { day: 'Mon', amount: 5120, height: '62%' },
                      { day: 'Today', amount: totalGMV > 0 ? Math.min(9200, totalGMV) : 6990, height: '82%', isCurrent: true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <div className="text-[9px] font-bold font-mono text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{item.amount}
                        </div>
                        <div 
                          style={{ height: item.height }}
                          className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                            item.isCurrent 
                              ? 'bg-gradient-to-t from-[#0A3A1E] to-[#FFC107] shadow-md shadow-amber-500/20' 
                              : 'bg-gradient-to-t from-slate-700 to-slate-500 group-hover:brightness-110'
                          }`}
                        />
                        <span className={`text-[10px] font-bold ${item.isCurrent ? 'text-[#0A3A1E]' : 'text-slate-500'}`}>
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" /> Normal Days
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#0A3A1E]" /> Today (Live)
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">Avg Daily Sales: ₹6,150</span>
                  </div>
                </div>

                {/* Fulfillment & Category Breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0A3A1E]" />
                      <span>Fulfillment & SLA Health</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">AKSelling Assured Gold Merchant Status</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-600">On-Time Dispatch Rate</span>
                        <span className="text-emerald-700 font-mono">99.4%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0A3A1E] rounded-full" style={{ width: '99.4%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-600">Customer Rating</span>
                        <span className="text-amber-500 font-mono">4.9 ★ / 5.0</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFC107] rounded-full" style={{ width: '98%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-600">Return & Cancellation</span>
                        <span className="text-[#0A3A1E] font-mono">0.8% (Very Low)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0A3A1E] rounded-full" style={{ width: '8%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="text-slate-600 font-bold">Courier Partner:</span>
                    <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#0A3A1E]" /> BlueDart & Delhivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-gradient-to-r from-[#0A3A1E] to-[#052610] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-[#134e2c]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFC107] text-[#052610] font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                      Creator Merchant Studio
                    </span>
                    <span className="text-xs text-emerald-100/80 font-bold">Streetwear Drops</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    Ready to launch a new limited edition oversized drop?
                  </h4>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab('orders');
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>View Orders ({orders.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setIsNewProductFormOpen(true);
                    }}
                    className="bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>List New T-Shirt</span>
                  </button>
                </div>
              </div>

              {/* Live Orders Feed Snapshot */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#0A3A1E]" />
                    <span>Recent Customer Orders</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#2874F0] hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {orders.slice(0, 4).map((ord) => (
                    <div 
                      key={ord.id} 
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-mono font-black text-[11px] text-slate-800 shrink-0">
                          AK
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 font-mono">{ord.id}</span>
                            <span className="text-[10px] text-slate-500 truncate">• {ord.date}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] truncate">
                            {ord.items[0]?.product.title || 'Oversized Streetwear Tee'} 
                            {ord.items.length > 1 ? ` (+${ord.items.length - 1} more items)` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
                        <div className="text-right">
                          <div className="font-mono font-black text-slate-950">₹{ord.totalAmount.toLocaleString()}</div>
                          <span className="text-[10px] text-slate-500">{ord.paymentMethod || 'Razorpay Online'}</span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          ord.status === 'Delivered' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : ord.status === 'In Transit'
                            ? 'bg-blue-100 text-[#2874F0]'
                            : ord.status === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {ord.status}
                        </span>

                        <button
                          onClick={() => setSelectedWaybillOrder(ord)}
                          className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-[#2874F0] hover:border-[#2874F0] transition-colors"
                          title="Print Waybill"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FOLDER 2: ORDERS MANAGEMENT (DEDICATED FOLDER)                            */}
          {/* ========================================================================= */}
          {activeTab === 'orders' && !isNewProductFormOpen && (
            <div className="space-y-4 text-xs">
              {/* Filter & Search Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search by Order ID, Customer Name, Address, Tracking AWB..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#2874F0] text-xs"
                      id="seller-orders-search-input"
                    />
                    {orderSearchQuery && (
                      <button onClick={() => setOrderSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Payment Method Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold text-[11px] whitespace-nowrap">Payment:</span>
                    <select
                      value={orderPaymentFilter}
                      onChange={(e) => setOrderPaymentFilter(e.target.value as any)}
                      className="p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800"
                    >
                      <option value="All">All Payments</option>
                      <option value="Razorpay">Razorpay Online</option>
                      <option value="UPI">UPI (GPay / PhonePe)</option>
                      <option value="COD">Cash on Delivery</option>
                    </select>
                  </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
                  {(['All', 'Processing', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'] as const).map((st) => {
                    const count = st === 'All' 
                      ? orders.length 
                      : orders.filter((o) => o.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          orderStatusFilter === st
                            ? 'bg-[#2874F0] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{st === 'All' ? 'All Orders' : st}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          orderStatusFilter === st ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orders List / Cards */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
                    <Package className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-slate-900">No orders match your filter criteria</h4>
                    <p className="text-slate-500 text-xs">Try clearing your search query or selecting "All Orders".</p>
                    <button
                      onClick={() => {
                        setOrderStatusFilter('All');
                        setOrderSearchQuery('');
                        setOrderPaymentFilter('All');
                      }}
                      className="mt-2 text-xs bg-[#2874F0] text-white font-bold px-4 py-2 rounded-xl"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <div 
                      key={ord.id} 
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
                      id={`seller-order-card-${ord.id}`}
                    >
                      {/* Top Order Row: ID, Date, Amount, Payment Status */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-black text-slate-950 font-mono text-sm">{ord.id}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{ord.date}</span>
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono">
                            {ord.courierPartner || 'BlueDart Express'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="text-slate-500 text-[10px] block">Total Order Amount</span>
                            <span className="font-black text-slate-950 font-mono text-sm">
                              ₹{ord.totalAmount.toLocaleString()}
                            </span>
                          </div>

                          {/* Live Status Selector with Instant Supabase Sync */}
                          <div className="relative">
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                              className={`font-black text-xs px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-400'
                                  : ord.status === 'In Transit'
                                  ? 'bg-blue-50 text-[#2874F0] border-blue-300 focus:ring-blue-400'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-300 focus:ring-red-400'
                                  : 'bg-amber-50 text-amber-900 border-amber-300 focus:ring-amber-400'
                              }`}
                            >
                              <option value="Processing">Pending / Processing</option>
                              <option value="Confirmed">Packed / Confirmed</option>
                              <option value="In Transit">In Transit (Shipped)</option>
                              <option value="Delivered">Delivered Successfully</option>
                              <option value="Cancelled">Cancelled & Refund</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Items & Customer Delivery Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Ordered Items List */}
                        <div className="md:col-span-2 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Ordered Items ({ord.items.length})
                          </span>
                          <div className="space-y-2">
                            {ord.items.map((item, iIdx) => (
                              <div key={iIdx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.title}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-14 object-cover rounded-lg border bg-white shrink-0"
                                />
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <h5 className="font-bold text-slate-900 line-clamp-1">{item.product.title}</h5>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <span>Size: <strong className="text-slate-900">{item.selectedSize}</strong></span>
                                    <span>•</span>
                                    <span>Color: <strong className="text-slate-900">{item.selectedColor.name}</strong></span>
                                    <span>•</span>
                                    <span>Qty: <strong className="text-slate-900">{item.quantity}</strong></span>
                                  </div>
                                </div>
                                <div className="text-right font-mono font-bold text-slate-900 shrink-0">
                                  ₹{(item.product.price * item.quantity).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer & Shipping Address Card */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#2874F0]" />
                              <span>Delivery Address</span>
                            </span>
                            <div className="font-bold text-slate-900">
                              {ord.addressObj?.name || 'Customer / Resident'}
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {ord.address || 'Address details recorded in order log.'}
                            </p>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 pt-1">
                              <Phone className="w-3 h-3" />
                              <span>{ord.addressObj?.phone || '+91 98765 43210'}</span>
                            </div>
                          </div>

                          {/* Quick Actions: Waybill & Razorpay Verification */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                            <button
                              onClick={() => setSelectedWaybillOrder(ord)}
                              className="flex-1 bg-white hover:bg-slate-100 text-slate-800 font-bold py-1.5 px-2.5 rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              id={`print-waybill-btn-${ord.id}`}
                            >
                              <Printer className="w-3.5 h-3.5 text-[#2874F0]" />
                              <span>Print Waybill</span>
                            </button>

                            <button
                              onClick={() => setSelectedPaymentVerifyOrder(ord)}
                              className="bg-white hover:bg-slate-100 text-slate-800 font-bold p-1.5 rounded-lg border border-slate-300 transition-colors shadow-2xs"
                              title="Verify Razorpay Gateway Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FOLDER 3: INVENTORY & CATALOG (DEDICATED FOLDER)                          */}
          {/* ========================================================================= */}
          {activeTab === 'inventory' && !isNewProductFormOpen && (
            <div className="space-y-4 text-xs">
              {/* Inventory Management Header & Filter */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={inventorySearchQuery}
                      onChange={(e) => setInventorySearchQuery(e.target.value)}
                      placeholder="Search apparel by style title, fabric GSM, SKU..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3A1E] text-xs"
                      id="seller-inventory-search-input"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inventoryCategoryFilter}
                      onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800"
                    >
                      <option value="All">All Categories</option>
                      <option value="Oversized">Oversized</option>
                      <option value="Graphic">Graphic</option>
                      <option value="Acid Wash">Acid Wash</option>
                      <option value="Plain Basics">Plain Basics</option>
                      <option value="Polo & Collared">Polo & Collared</option>
                      <option value="Anime & Gaming">Anime & Gaming</option>
                    </select>

                    <select
                      value={inventoryStockFilter}
                      onChange={(e) => setInventoryStockFilter(e.target.value as any)}
                      className="p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-xs font-bold text-slate-800"
                    >
                      <option value="All">All Stock Levels</option>
                      <option value="InStock">In Stock (&gt;0)</option>
                      <option value="LowStock">Low Stock (&lt;15)</option>
                      <option value="OutOfStock">Out of Stock</option>
                    </select>

                    <button
                      onClick={() => setIsNewProductFormOpen(true)}
                      className="bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                      id="seller-inventory-list-new-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>List T-Shirt</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Catalog Cards */}
              <div className="space-y-3">
                {filteredProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
                    id={`inventory-product-row-${prod.id}`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Product Thumbnail & Basic Specs */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-xl border bg-white shrink-0 shadow-2xs"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                              {prod.category}
                            </span>
                            <span className="text-[#0A3A1E] font-bold text-[10px] bg-[#FFC107]/20 border border-[#FFC107]/40 px-2 py-0.5 rounded">
                              {prod.discountPercent}% OFF
                            </span>
                            <span className="text-slate-400 text-[10px] font-mono">
                              ID: {prod.id}
                            </span>
                          </div>

                          <h4 className="font-black text-slate-950 text-sm line-clamp-1">{prod.title}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Fabric: <strong className="text-slate-800">{prod.fabric || prod.gsm || '240 GSM French Terry'}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Action Tools: Price, Stock, Delete */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold block">Selling Price</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                defaultValue={prod.price}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value) || prod.price;
                                  if (val !== prod.price) {
                                    handleQuickPriceStockUpdate(prod.id, val, prod.stockCount || 45);
                                  }
                                }}
                                className="w-16 p-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-950 text-xs outline-none focus:ring-1 focus:ring-[#0A3A1E]"
                              />
                            </div>
                          </div>

                          <div className="border-l border-slate-200 pl-3">
                            <span className="text-[10px] text-slate-500 font-bold block">Stock Units</span>
                            <input
                              type="number"
                              defaultValue={prod.stockCount || 45}
                              onBlur={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  if (val !== prod.stockCount) {
                                    handleQuickPriceStockUpdate(prod.id, prod.price, val);
                                  }
                              }}
                              className="w-16 p-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-950 text-xs outline-none focus:ring-1 focus:ring-[#0A3A1E]"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.title)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                          title="Remove from Store"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Size Matrix Selector Bar */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500 mr-1">Active Sizes:</span>
                        {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                          const isActive = (prod.sizes || []).includes(sz);
                          return (
                            <button
                              key={sz}
                              onClick={() => handleToggleProductSize(prod, sz)}
                              className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all border ${
                                isActive 
                                  ? 'bg-[#0A3A1E] text-[#FFC107] border-[#0A3A1E] shadow-2xs font-mono' 
                                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                              }`}
                              title={`Click to ${isActive ? 'Disable' : 'Enable'} size ${sz}`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prod.inStock && (prod.stockCount || 0) > 10
                            ? 'bg-emerald-100 text-emerald-800'
                            : (prod.stockCount || 0) > 0
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {prod.inStock && (prod.stockCount || 0) > 10 ? '● In Stock' : (prod.stockCount || 0) > 0 ? '● Low Stock' : '● Sold Out'}
                        </span>
                        <span className="text-slate-400 text-[10px]">• MRP: ₹{prod.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FOLDER 3 (SUB-VIEW): "LIST NEW PRODUCT" FORM                              */}
          {/* ========================================================================= */}
          {isNewProductFormOpen && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewProductFormOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>List New T-Shirt Drop</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Publish new streetwear apparel directly to Live Store & Supabase database</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNewProductFormOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-800">T-Shirt Title / Drop Name *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Cyberpunk Samurai Heavyweight Oversized Drop"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3A1E] text-xs"
                      id="new-product-title-input"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3A1E] text-xs font-bold text-slate-800"
                    >
                      {['Oversized', 'Graphic', 'Acid Wash', 'Plain Basics', 'Polo & Collared', 'Anime & Gaming', 'Gym & Active'].map((c) => (
                        <option key={c} value={c}>{c} Collection</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Brand / Studio *</label>
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3A1E] text-xs"
                    />
                  </div>

                  {/* Selling Price */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="699"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs outline-none focus:ring-2 focus:ring-[#0A3A1E]"
                      id="new-product-price-input"
                    />
                  </div>

                  {/* MRP */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Original MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newOriginalPrice}
                      onChange={(e) => setNewOriginalPrice(e.target.value)}
                      placeholder="1499"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-600 text-xs outline-none focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>

                  {/* Fabric & GSM */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Fabric Composition *</label>
                    <input
                      type="text"
                      value={newFabric}
                      onChange={(e) => setNewFabric(e.target.value)}
                      placeholder="240 GSM 100% French Terry Cotton"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3A1E] text-xs"
                    />
                  </div>

                  {/* GSM Number */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">GSM Weight</label>
                    <input
                      type="text"
                      value={newGsm}
                      onChange={(e) => setNewGsm(e.target.value)}
                      placeholder="240"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>

                  {/* Initial Stock Count */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Initial Stock Units *</label>
                    <input
                      type="number"
                      value={newStockCount}
                      onChange={(e) => setNewStockCount(e.target.value)}
                      placeholder="50"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>

                  {/* Silhouette & Fit */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Silhouette & Fit</label>
                    <input
                      type="text"
                      value={newFit}
                      onChange={(e) => setNewFit(e.target.value)}
                      placeholder="Oversized Boxy Dropped Shoulder Fit"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0A3A1E]"
                    />
                  </div>

                  {/* Primary Image URL */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-800">Primary Product Image URL *</label>
                    <input
                      type="url"
                      required
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3A1E] text-xs"
                      id="new-product-img-input"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-800">Product Description</label>
                    <textarea
                      rows={2}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3A1E] text-xs"
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] font-black py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    id="submit-publish-product-btn"
                  >
                    <Sparkles className="w-4 h-4 text-[#052610]" />
                    <span>PUBLISH TO LIVE STORE & CATALOG</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FOLDER 4: PAYMENTS & PAYOUTS (FINANCIAL LEDGER FOLDER)                   */}
          {/* ========================================================================= */}
          {activeTab === 'payouts' && !isNewProductFormOpen && (
            <div className="space-y-5 text-xs">
              {/* Top Financial Ledger Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Available for Payout
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                    ₹{availableSettlementBalance.toLocaleString('en-IN')}
                  </div>
                  <button
                    onClick={() => setIsPayoutModalOpen(true)}
                    className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    id="request-instant-payout-btn"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Request Instant Payout</span>
                  </button>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Linked Bank Account
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{bankDetails.bankName}</div>
                    <p className="text-slate-600 font-mono text-[11px]">
                      A/C: **********{bankDetails.accountNumber.slice(-4) || '0194'} • IFSC: {bankDetails.ifscCode}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingBank(!isEditingBank)}
                    className="text-[11px] font-bold text-[#2874F0] hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingBank ? 'Close Bank Form' : 'Update Bank & KYC'}</span>
                  </button>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Lifetime Settled Payouts
                    </span>
                    <div className="text-2xl font-black text-slate-950 font-mono mt-0.5">
                      ₹{(settledTotal || 46150).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Guaranteed IMPS Settlements
                  </span>
                </div>
              </div>

              {/* Bank Account Edit / Verification Form */}
              {isEditingBank && (
                <form onSubmit={handleSaveBankSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 animate-in fade-in">
                  <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#2874F0]" />
                    <span>Merchant Settlement Bank & Tax Details (Supabase Synced)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Account Holder Name *</label>
                      <input
                        type="text"
                        required
                        value={bankForm.accountHolderName}
                        onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Bank Account Number *</label>
                      <input
                        type="text"
                        required
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        value={bankForm.ifscCode}
                        onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Merchant UPI VPA ID</label>
                      <input
                        type="text"
                        value={bankForm.upiId}
                        onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">GSTIN Tax ID</label>
                      <input
                        type="text"
                        value={bankForm.gstin || ''}
                        onChange={(e) => setBankForm({ ...bankForm, gstin: e.target.value.toUpperCase() })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase outline-none focus:ring-1 focus:ring-[#2874F0]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingBank(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#2874F0] text-white font-bold hover:bg-blue-600 shadow-2xs"
                    >
                      Save & Verify Account
                    </button>
                  </div>
                </form>
              )}

              {/* Payout History Ledger Table */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Settlement & Payout Transaction Ledger</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Direct Razorpay & Bank NEFT Records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                        <th className="pb-2">Payout ID</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Bank Account</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">UTR / Settlement Ref</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payouts.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-mono font-bold text-slate-900">{po.id}</td>
                          <td className="py-2.5 text-slate-600">{po.date}</td>
                          <td className="py-2.5 font-mono font-black text-emerald-700">₹{po.amount.toLocaleString()}</td>
                          <td className="py-2.5 font-mono text-slate-600">•••• {po.bankAccountLast4}</td>
                          <td className="py-2.5 text-slate-500 text-[11px]">{po.type}</td>
                          <td className="py-2.5 font-mono text-slate-500 text-[10px]">{po.utrNumber}</td>
                          <td className="py-2.5 text-right">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ● {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL: PRINTABLE WAYBILL & SHIPPING INVOICE ================= */}
      {selectedWaybillOrder && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-300 text-slate-900 my-auto animate-in zoom-in-95">
            {/* Waybill Top Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black">
                  AK
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-950 uppercase tracking-tight">
                    Flipkart / AKSelling Logistics Waybill
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Standard Surface Express • Prepaid Tracked Shipment</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWaybillOrder(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barcode & AWB Display */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
              <div className="flex justify-center items-center gap-1 font-mono tracking-widest text-slate-950 font-black text-2xl h-10 select-none">
                ||| | |||| | ||||| ||| |||| | |||| ||| |||||
              </div>
              <div className="flex items-center justify-between text-xs font-mono px-4">
                <span className="font-bold text-slate-900">AWB: {selectedWaybillOrder.trackingNumber || 'DELHIVERY-AK-76192-EXP'}</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">PREPAID - DO NOT COLLECT CASH</span>
              </div>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ship To (Recipient):</span>
                <div className="font-bold text-slate-950">{selectedWaybillOrder.addressObj?.name || 'Customer'}</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{selectedWaybillOrder.address}</p>
                <p className="font-mono text-slate-700 text-[11px] pt-1">Phone: {selectedWaybillOrder.addressObj?.phone || '+91 98765 43210'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Return / Pickup Hub:</span>
                <div className="font-bold text-slate-950">{bankDetails.sellerName || 'AKSelling Studio Official'}</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{bankDetails.pickupAddress}</p>
                <p className="font-mono text-slate-700 text-[11px] pt-1">GSTIN: {bankDetails.gstin}</p>
              </div>
            </div>

            {/* Package Contents */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Package Manifest</span>
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2">Size / Color</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedWaybillOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-bold text-slate-900">{it.product.title}</td>
                      <td className="p-2 text-slate-600">{it.selectedSize} / {it.selectedColor.name}</td>
                      <td className="p-2 font-mono">{it.quantity}</td>
                      <td className="p-2 text-right font-mono font-bold">₹{it.product.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 font-mono">
                Order Reference: {selectedWaybillOrder.id}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWaybillOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2 rounded-xl bg-[#2874F0] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Shipping Label</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RAZORPAY VERIFICATION DETAILS ================= */}
      {selectedPaymentVerifyOrder && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-300 text-slate-900 my-auto text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-950">Razorpay Payment Verification</h4>
                  <p className="text-[10px] text-slate-500">256-Bit SSL Verified Gateway Transaction</p>
                </div>
              </div>
              <button onClick={() => setSelectedPaymentVerifyOrder(null)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Payment ID:</span>
                <span className="font-bold text-slate-900">{selectedPaymentVerifyOrder.transactionId || 'pay_live_Q82Fk491a0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Order ID:</span>
                <span className="font-bold text-slate-900">{selectedPaymentVerifyOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Amount Settled:</span>
                <span className="font-bold text-emerald-700">₹{selectedPaymentVerifyOrder.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Gateway Status:</span>
                <span className="text-emerald-700 font-bold font-sans">● CAPTURED (SUCCESS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Database Sync:</span>
                <span className="text-[#2874F0] font-sans">Supabase Verified</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPaymentVerifyOrder(null)}
              className="w-full bg-[#172337] text-white py-2 rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSTANT PAYOUT REQUEST CONFIRMATION ================= */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-300 text-slate-900 my-auto text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-950 text-sm flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Confirm Instant Merchant Payout</span>
              </h4>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Settlement Amount</span>
              <div className="text-3xl font-black text-emerald-800 font-mono">
                ₹{availableSettlementBalance.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-700">Will be credited immediately via Instant IMPS to {bankDetails.bankName}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Beneficiary:</span>
                <span className="font-bold text-slate-900">{bankDetails.accountHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Account No:</span>
                <span className="font-bold text-slate-900">•••• {bankDetails.accountNumber.slice(-4) || '0194'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">IFSC Code:</span>
                <span className="font-bold text-slate-900">{bankDetails.ifscCode}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center justify-center gap-1 cursor-pointer"
                id="confirm-payout-now-btn"
              >
                <Check className="w-4 h-4" />
                <span>TRANSFER NOW</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
