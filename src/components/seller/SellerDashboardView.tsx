import React, { useState } from 'react';
import { 
  Product, Order, ReturnRecord, ClaimRecord, DailySalesPoint, 
  SellerBankDetails, PayoutRecord, SellerTabType, Story, HeroBanner, CreatorProfile,
  LiveStoreMetrics
} from '../../types';
import { SellerHeader } from './SellerHeader';
import { SellerBottomNav } from './SellerBottomNav';
import { SellerHomeView } from './SellerHomeView';
import { SellerOrdersView } from './SellerOrdersView';
import { SellerReturnsView } from './SellerReturnsView';
import { SellerInventoryView } from './SellerInventoryView';
import { SellerMenuView } from './SellerMenuView';
import { AddProductModal } from './AddProductModal';
import { WaybillModal } from './WaybillModal';
import { TrendingUp, ShoppingBag, Clock, IndianRupee, Users, Activity } from 'lucide-react';

interface SellerDashboardViewProps {
  products: Product[];
  orders: Order[];
  returns: ReturnRecord[];
  claims: ClaimRecord[];
  dailySales: DailySalesPoint[];
  payouts: PayoutRecord[];
  bankDetails: SellerBankDetails;
  stories?: Story[];
  banners?: HeroBanner[];
  creatorProfile?: CreatorProfile;
  storeMetrics?: LiveStoreMetrics;
  onUpdateCreatorProfile?: (profile: CreatorProfile) => void;
  onSaveBankDetails: (updated: SellerBankDetails) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status'], step?: number, notes?: string) => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
  onRaiseClaim: (claim: Partial<ClaimRecord>) => void;
  onRefreshData: () => void;
  onToggleStorefront: () => void;
  onAddStory?: (story: Story) => void;
  onUpdateStory?: (storyId: string, updates: Partial<Story>) => void;
  onDeleteStory?: (storyId: string) => void;
  onAddBanner?: (banner: HeroBanner) => void;
  onUpdateBanner?: (bannerId: string, updates: Partial<HeroBanner>) => void;
  onDeleteBanner?: (bannerId: string) => void;
  onPreviewStory?: (story: Story) => void;
  isRefreshing?: boolean;
  firebaseUser?: any;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  products,
  orders,
  returns,
  claims,
  dailySales,
  payouts,
  bankDetails,
  stories = [],
  banners = [],
  creatorProfile,
  storeMetrics,
  onUpdateCreatorProfile,
  onSaveBankDetails,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateOrder,
  onRaiseClaim,
  onRefreshData,
  onToggleStorefront,
  onAddStory,
  onUpdateStory,
  onDeleteStory,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  onPreviewStory,
  isRefreshing = false,
  firebaseUser,
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<SellerTabType>('home');

  // Modal States
  const [isAddCatalogOpen, setIsAddCatalogOpen] = useState(false);
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<Order | null>(null);

  // Counts for Badges
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Processing' || o.status === 'Confirmed'
  ).length;
  const lowStockCount = products.filter(
    (p) => p.stockCount <= 10 || !p.inStock
  ).length;
  const returnsCount = returns.filter(
    (r) => r.status === 'In Transit' || r.status === 'Out for Delivery' || r.status === 'Claim Raised'
  ).length;

  // Summary Metrics calculated directly from orders state
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrderCount = orders.length;
  const pendingOrderCount = orders.filter(
    (o) => o.status === 'Processing' || o.status === 'Confirmed'
  ).length;

  return (
    <div
      id="seller-dashboard-root"
      className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col font-sans selection:bg-[#00a884] selection:text-white"
    >
      {/* 1. TOP STICKY SUPPLIER HEADER */}
      <SellerHeader
        activeTab={activeTab}
        onRefresh={onRefreshData}
        isRefreshing={isRefreshing}
        onToggleStorefront={onToggleStorefront}
        sellerName="AK Yadav Prints"
        storeId="AKY-98214"
        unreadNotifications={3}
      />

      {/* 2. SUMMARY CARD (Calculating & displaying total revenue, total order count, and pending order count) */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 pt-3">
        <div 
          id="seller-orders-summary-card"
          className="bg-[#111b21] border border-[#202c33] rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00a884]/15 text-[#00a884] flex items-center justify-center font-black shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00a884]">
                Orders Ledger &amp; Revenue Overview
              </span>
              <h2 className="text-sm font-bold text-[#e9edef] tracking-tight">
                Live Storefront Performance
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#202c33] bg-[#0b141a]/60 sm:bg-transparent p-2 sm:p-0 rounded-xl">
            {/* Metric 1: Total Revenue */}
            <div className="text-center sm:text-left px-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#8696a0] block uppercase tracking-wider">
                Total Revenue
              </span>
              <span className="text-sm sm:text-lg font-black text-[#00a884] tracking-tight flex items-center justify-center sm:justify-start gap-0.5">
                <IndianRupee className="w-3 sm:w-4 h-3 sm:h-4 inline" />
                {totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Metric 2: Total Orders */}
            <div className="text-center sm:text-left px-2 sm:pl-4">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#8696a0] block uppercase tracking-wider">
                Total Orders
              </span>
              <span className="text-sm sm:text-lg font-black text-[#e9edef] tracking-tight flex items-center justify-center sm:justify-start gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-[#8696a0]" />
                {totalOrderCount}
              </span>
            </div>

            {/* Metric 3: Pending Orders */}
            <div className="text-center sm:text-left px-2 sm:pl-4">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#8696a0] block uppercase tracking-wider">
                Pending Orders
              </span>
              <span className="text-sm sm:text-lg font-black text-[#f59e0b] tracking-tight flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                {pendingOrderCount}
              </span>
            </div>

            {/* Metric 4: Live Active Shoppers (Real-time Firestore) */}
            <div className="text-center sm:text-left px-2 sm:pl-4">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#8696a0] flex items-center justify-center sm:justify-start gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Visitors
              </span>
              <span className="text-sm sm:text-lg font-black text-emerald-400 tracking-tight flex items-center justify-center sm:justify-start gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                {storeMetrics?.activeVisitorsCount || 24}
                <span className="text-[10px] text-emerald-400/80 font-normal">online</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA WITH 5 DISTINCT TABS */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {activeTab === 'home' && (
          <SellerHomeView
            products={products}
            orders={orders}
            returns={returns}
            dailySales={dailySales}
            storeMetrics={storeMetrics}
            onNavigateTab={setActiveTab}
            onOpenAddCatalog={() => setIsAddCatalogOpen(true)}
            onOpenOrderWaybill={(order) => setSelectedWaybillOrder(order)}
            onOpenPayouts={() => setActiveTab('menu')}
            onQuickShipOrder={(orderId) => {
              onUpdateOrderStatus(orderId, 'In Transit', 3, 'Dispatched via BlueDart hub');
            }}
          />
        )}

        {activeTab === 'orders' && (
          <SellerOrdersView
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onUpdateOrder={onUpdateOrder}
            onOpenWaybill={(order) => setSelectedWaybillOrder(order)}
            onRefresh={onRefreshData}
          />
        )}

        {activeTab === 'returns' && (
          <SellerReturnsView
            returns={returns}
            claims={claims}
            onRaiseClaim={onRaiseClaim}
            onRefresh={onRefreshData}
          />
        )}

        {activeTab === 'inventory' && (
          <SellerInventoryView
            products={products}
            onOpenAddCatalog={() => setIsAddCatalogOpen(true)}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onRefresh={onRefreshData}
          />
        )}

        {activeTab === 'menu' && (
          <SellerMenuView
            products={products}
            orders={orders}
            returns={returns}
            claims={claims}
            payouts={payouts}
            bankDetails={bankDetails}
            stories={stories}
            banners={banners}
            creatorProfile={creatorProfile}
            onUpdateCreatorProfile={onUpdateCreatorProfile}
            onSaveBankDetails={onSaveBankDetails}
            onOpenAddCatalog={() => setIsAddCatalogOpen(true)}
            onNavigateToTab={setActiveTab}
            onRefreshData={onRefreshData}
            onToggleStorefront={onToggleStorefront}
            onAddStory={onAddStory}
            onUpdateStory={onUpdateStory}
            onDeleteStory={onDeleteStory}
            onAddBanner={onAddBanner}
            onUpdateBanner={onUpdateBanner}
            onDeleteBanner={onDeleteBanner}
            onPreviewStory={onPreviewStory}
            firebaseUser={firebaseUser}
          />
        )}
      </main>

      {/* 3. FIXED BOTTOM 5-TAB NAVIGATION BAR */}
      <SellerBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
        returnsCount={returnsCount}
      />

      {/* 4. MODALS */}
      <AddProductModal
        isOpen={isAddCatalogOpen}
        onClose={() => setIsAddCatalogOpen(false)}
        onAddProduct={onAddProduct}
      />

      <WaybillModal
        order={selectedWaybillOrder}
        isOpen={!!selectedWaybillOrder}
        onClose={() => setSelectedWaybillOrder(null)}
      />
    </div>
  );
};
