import React, { useState, useMemo } from 'react';
import { Order, OrderTimelineStep } from '../../types';
import { 
  Search, Filter, PackageCheck, Truck, CheckCircle2, AlertCircle, 
  Printer, Clock, FileText, ChevronDown, ChevronUp, Check, X, ArrowUpRight,
  MapPin, Phone, User, Calendar, ExternalLink, RefreshCw, ShieldCheck,
  Mail, Sparkles, Send, Layers, Tag, Key, Navigation, Copy, Lock, Download
} from 'lucide-react';
import { LogisticsFulfillmentModal } from './LogisticsFulfillmentModal';
import { LiveTrackingModal } from '../LiveTrackingModal';
import { SELLER_ALERT_EMAIL } from '../../utils/emailNotificationService';
import { 
  SHIPROCKET_PORTAL_URL, NIMBUSPOST_PORTAL_URL,
  getShiprocketTrackingUrl, getNimbusPostTrackingUrl
} from '../../utils/logisticsService';

export type OrderStatusFilter = 'All' | 'On Hold' | 'Pending' | 'Ready to Ship' | 'Shipped' | 'Cancelled';
export type ProviderFilter = 'All' | 'Shiprocket' | 'NimbusPost' | 'Unfulfilled';

interface SellerOrdersViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status'], trackingStep?: number, notes?: string) => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
  onOpenWaybill: (order: Order) => void;
  onRefresh?: () => void;
}

export const SellerOrdersView: React.FC<SellerOrdersViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onUpdateOrder,
  onOpenWaybill,
  onRefresh,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<OrderStatusFilter>('Pending');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<ProviderFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Prepaid' | 'COD'>('All');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Logistics fulfillment modal state
  const [logisticsModalOrder, setLogisticsModalOrder] = useState<Order | null>(null);
  const [logisticsModalProvider, setLogisticsModalProvider] = useState<'Shiprocket' | 'NimbusPost'>('Shiprocket');
  const [logisticsModalInitialTab, setLogisticsModalInitialTab] = useState<'fulfill' | 'label' | 'pickup' | 'tracking' | 'api' | 'email'>('fulfill');

  // Live customer/seller tracking modal state
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      onHold: orders.filter((o) => o.status === 'Processing' && o.utrNumber?.includes('HOLD')).length,
      pending: orders.filter((o) => o.status === 'Processing' || o.status === 'Confirmed').length,
      readyToShip: orders.filter((o) => o.trackingStep === 2).length,
      shipped: orders.filter((o) => o.status === 'In Transit' || o.status === 'Delivered').length,
      cancelled: orders.filter((o) => o.status === 'Cancelled').length,
      shiprocketCount: orders.filter((o) => o.logisticsProvider === 'Shiprocket').length,
      nimbusPostCount: orders.filter((o) => o.logisticsProvider === 'NimbusPost').length,
    };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter matching
      let matchesStatus = true;
      if (selectedFilter === 'On Hold') {
        matchesStatus = order.status === 'Processing' || order.status === 'Confirmed';
      } else if (selectedFilter === 'Pending') {
        matchesStatus = order.status === 'Processing' || order.status === 'Confirmed';
      } else if (selectedFilter === 'Ready to Ship') {
        matchesStatus = order.trackingStep === 2 || order.status === 'Confirmed';
      } else if (selectedFilter === 'Shipped') {
        matchesStatus = order.status === 'In Transit' || order.status === 'Delivered';
      } else if (selectedFilter === 'Cancelled') {
        matchesStatus = order.status === 'Cancelled';
      }

      // Provider Filter
      let matchesProvider = true;
      if (selectedProviderFilter === 'Shiprocket') {
        matchesProvider = order.logisticsProvider === 'Shiprocket';
      } else if (selectedProviderFilter === 'NimbusPost') {
        matchesProvider = order.logisticsProvider === 'NimbusPost';
      } else if (selectedProviderFilter === 'Unfulfilled') {
        matchesProvider = !order.trackingNumber || !order.shippingLabelGenerated;
      }

      // Search Query matching (SKU, ID, Title, Customer, Pincode)
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const firstItem = order.items[0];
        matchesSearch =
          order.id.toLowerCase().includes(q) ||
          (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q)) ||
          (firstItem && firstItem.product.title.toLowerCase().includes(q)) ||
          (firstItem && firstItem.product.id.toLowerCase().includes(q)) ||
          (order.address && order.address.toLowerCase().includes(q)) ||
          (order.addressObj && order.addressObj.name.toLowerCase().includes(q));
      }

      // Payment Filter
      let matchesPayment = true;
      if (paymentFilter === 'Prepaid') {
        matchesPayment = order.paymentMethod?.toLowerCase().includes('upi') || order.paymentMethod?.toLowerCase().includes('razorpay') || !order.paymentMethod?.toLowerCase().includes('cash');
      } else if (paymentFilter === 'COD') {
        matchesPayment = order.paymentMethod?.toLowerCase().includes('cash') || order.paymentMethod?.toLowerCase().includes('cod');
      }

      return matchesStatus && matchesProvider && matchesSearch && matchesPayment;
    });
  }, [orders, selectedFilter, selectedProviderFilter, searchQuery, paymentFilter]);

  const handleAction = (orderId: string, action: 'ready_to_ship' | 'ship' | 'hold' | 'cancel') => {
    if (action === 'ready_to_ship') {
      onUpdateOrderStatus(orderId, 'Confirmed', 2, 'Packed and Ready to Handover to Courier');
    } else if (action === 'ship') {
      onUpdateOrderStatus(orderId, 'In Transit', 3, 'Handed over to BlueDart courier hub');
    } else if (action === 'hold') {
      onUpdateOrderStatus(orderId, 'Processing', 1, 'Placed on hold by seller for inventory verification');
    } else if (action === 'cancel') {
      onUpdateOrderStatus(orderId, 'Cancelled', 0, 'Cancelled by supplier before dispatch');
    }
  };

  const copyAWB = (awb: string, id: string) => {
    navigator.clipboard?.writeText(awb);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const openLogisticsModal = (
    order: Order, 
    provider: 'Shiprocket' | 'NimbusPost' = 'Shiprocket',
    tab: 'fulfill' | 'label' | 'pickup' | 'tracking' | 'api' | 'email' = 'fulfill'
  ) => {
    setLogisticsModalOrder(order);
    setLogisticsModalProvider(provider);
    setLogisticsModalInitialTab(tab);
  };

  const filterTabs: { id: OrderStatusFilter; label: string; count: number }[] = [
    { id: 'Pending', label: 'Pending', count: counts.pending },
    { id: 'Ready to Ship', label: 'Ready to Ship', count: counts.readyToShip },
    { id: 'Shipped', label: 'Shipped', count: counts.shipped },
    { id: 'On Hold', label: 'On Hold', count: counts.onHold },
    { id: 'Cancelled', label: 'Cancelled', count: counts.cancelled },
    { id: 'All', label: 'All Orders', count: counts.all },
  ];

  return (
    <div id="seller-orders-view" className="space-y-3 pb-24 px-3 sm:px-4 max-w-7xl mx-auto pt-3">
      
      {/* 1. Dual Logistics Hub Header Strip (Shiprocket & NimbusPost) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-3.5 sm:p-4 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Brand & API Status Indicators */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                Logistics Dispatch Hub
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Shiprocket Live API Active
              </span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                NimbusPost Dual Engine Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              One-click fulfillment, live courier rate comparison, automated AWB generation, and doorstep pickup.
            </p>
          </div>

          {/* Quick External Portals & API Key Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={SHIPROCKET_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Shiprocket.in ↗</span>
            </a>

            <a
              href={NIMBUSPOST_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>NimbusPost ↗</span>
            </a>

            <div className="px-3 py-1.5 rounded-xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direct Logistics Connected</span>
            </div>
          </div>
        </div>

        {/* Dual Provider Filters */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Logistics Filter:</span>
            {(['All', 'Shiprocket', 'NimbusPost', 'Unfulfilled'] as const).map((prov) => (
              <button
                key={prov}
                type="button"
                onClick={() => setSelectedProviderFilter(prov)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  selectedProviderFilter === prov
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {prov} {prov === 'Shiprocket' ? `(${counts.shiprocketCount})` : prov === 'NimbusPost' ? `(${counts.nimbusPostCount})` : ''}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Origin: Indore Central Hub (AK Yadav Prints)
          </span>
        </div>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-[#111b21] p-3 rounded-2xl border border-[#222e35] shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="orders-sku-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU ID, Order ID, Customer Name, Pincode..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#202c33] border border-[#2a3942] text-xs font-medium text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:bg-[#202c33]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-[#e9edef] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Payment mode filter chips */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider">Payment Mode:</span>
          <div className="flex items-center gap-1">
            {(['All', 'Prepaid', 'COD'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentFilter(mode)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  paymentFilter === mode
                    ? 'bg-[#00a884] text-white shadow-xs'
                    : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              id={`order-tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#00a884] text-white shadow-xs'
                  : 'bg-[#111b21] text-[#8696a0] hover:bg-[#202c33] hover:text-[#e9edef] border border-[#222e35]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#202c33] text-[#8696a0]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Order List Header */}
      <div className="flex items-center justify-between px-1 text-xs text-[#8696a0] font-semibold">
        <span>Showing {filteredOrders.length} orders</span>
        <span className="text-[#00a884] font-bold flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-[#FFC107]" />
          Express BlueDart, Delhivery &amp; DTDC Active
        </span>
      </div>

      {/* Orders List Stream */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#0A3A1E] flex items-center justify-center mx-auto">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">No Orders in "{selectedFilter}"</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              All tasks in this status filter are up-to-date. New incoming orders will appear here automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedFilter('All');
              setSelectedProviderFilter('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl text-xs font-black shadow-xs cursor-pointer"
          >
            View All Orders
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'Processing' || order.status === 'Confirmed';
            const isReadyToShip = order.trackingStep === 2;
            const isShipped = order.status === 'In Transit' || order.status === 'Delivered';
            const isShippedWithAwb = (isShipped || (order.trackingStep && order.trackingStep >= 3)) && Boolean(order.trackingNumber && order.trackingNumber.trim() !== '');
            const hasLogistics = !!order.logisticsProvider;
            const provider: 'Shiprocket' | 'NimbusPost' = order.logisticsProvider === 'NimbusPost' ? 'NimbusPost' : 'Shiprocket';
            const trackingNumber = order.trackingNumber;

            const trackingUrl = provider === 'Shiprocket'
              ? getShiprocketTrackingUrl(trackingNumber || '')
              : getNimbusPostTrackingUrl(trackingNumber || '');

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-[#111b21] rounded-3xl border border-[#222e35] shadow-xs hover:border-[#00a884]/60 hover:shadow-md transition-all overflow-hidden text-[#e9edef]"
              >
                {/* Order Top Bar: Order ID, Date, Logistics Tag and Status */}
                <div className="bg-[#162127] px-4 py-2.5 border-b border-[#222e35] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold text-[#e9edef] truncate">
                      {order.id}
                    </span>
                    <span className="text-[#8696a0]">•</span>
                    <span className="text-[#8696a0] text-[11px] truncate">
                      {order.date}
                    </span>
                    {hasLogistics && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        provider === 'Shiprocket'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        <Sparkles className="w-2.5 h-2.5" />
                        {provider}
                      </span>
                    )}
                    {order.isPartialAdvanceCod && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        Anti-RTO COD
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : order.status === 'In Transit'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Main Order Content Card */}
                <div className="p-4 space-y-3.5">
                  {/* Complete Items Breakdown with Selected Size, Color, Fabric & GSM */}
                  <div className="space-y-3">
                    {order.items.map((item, idx) => {
                      const p = item.product;
                      return (
                        <div 
                          key={`${order.id}-item-${idx}`}
                          className="flex items-start gap-3.5 pb-3 border-b border-[#222e35] last:border-b-0 last:pb-0"
                        >
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80'}
                            alt={p.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#222e35] shrink-0 shadow-xs"
                          />

                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="text-sm font-extrabold text-[#e9edef] leading-snug">
                              {p.title}
                            </h4>

                            {/* Size, Color, SKU Tags */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              {/* Selected Size */}
                              <span className="bg-[#202c33] text-white px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 border border-[#2a3942]">
                                Size: {item.selectedSize || 'L'}
                              </span>

                              {/* Selected Color with Swatch */}
                              <span className="bg-[#202c33] text-[#e9edef] px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-[#2a3942]">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full border border-white/20"
                                  style={{ backgroundColor: item.selectedColor?.hex || '#1e293b' }}
                                />
                                Color: {item.selectedColor?.name || 'Onyx Black'}
                              </span>

                              {/* SKU */}
                              <span className="text-[#8696a0] font-mono text-[11px] bg-[#162127] px-2 py-0.5 rounded border border-[#222e35]">
                                SKU: {p.id}
                              </span>
                            </div>

                            {/* Detailed Fabric & Quality Specs */}
                            <div className="pt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-[#00a884] font-medium bg-[#005c4b]/20 px-2.5 py-1 rounded-xl border border-[#005c4b]/40">
                              <Layers className="w-3 h-3 text-[#00a884] shrink-0" />
                              <strong className="font-bold">Fabric:</strong>
                              <span>{p.fabric || '100% Super-Combed French Terry'}</span>
                              <span className="text-[#00a884]/40">•</span>
                              <strong>GSM:</strong>
                              <span>{p.gsm || '240 GSM Heavyweight'}</span>
                              <span className="text-[#00a884]/40">•</span>
                              <strong>Fit:</strong>
                              <span>{p.fit || 'Drop-Shoulder Boxy Fit'}</span>
                            </div>

                            {/* Qty & Price */}
                            <div className="flex items-baseline justify-between pt-1">
                              <div className="text-xs">
                                <span className="text-[#8696a0]">Qty: </span>
                                <strong className="text-[#e9edef] font-extrabold">{item.quantity}</strong>
                                <span className="text-[#8696a0] mx-1.5">•</span>
                                <span className="text-[#8696a0]">Item Total: </span>
                                <strong className="text-[#00a884] font-extrabold text-sm">
                                  ₹{(p.price * item.quantity).toLocaleString()}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Customer Full Delivery Address & Contact Card */}
                  <div className="bg-[#162127] p-3 rounded-2xl border border-[#222e35] text-xs text-[#8696a0] space-y-1.5">
                    <div className="flex items-center justify-between border-b border-[#222e35] pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#e9edef] text-xs">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Full Delivery Address &amp; Consignee:</span>
                      </div>
                      <span className="text-[10px] bg-[#202c33] border border-[#2a3942] px-2 py-0.5 rounded-md font-mono font-bold text-[#00a884]">
                        PIN: {order.addressObj?.pincode || '122002'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-[#e9edef] font-extrabold text-xs">
                          {order.addressObj?.name || order.customerName || 'Anoj Kumar'}
                        </strong>
                        <span className="text-[#8696a0]">•</span>
                        <a 
                          href={`tel:${order.addressObj?.phone || order.customerPhone || '9876543210'}`}
                          className="font-bold text-[#00a884] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {order.addressObj?.phone || order.customerPhone || '+91 98765 43210'}
                        </a>
                      </div>

                      {/* Full Formatted Address */}
                      <p className="text-[#8696a0] leading-relaxed text-[11px]">
                        {order.addressObj ? (
                          <>
                            {order.addressObj.house ? `${order.addressObj.house}, ` : ''}
                            {order.addressObj.street ? `${order.addressObj.street}, ` : ''}
                            {order.addressObj.landmark ? `Near ${order.addressObj.landmark}, ` : ''}
                            {order.addressObj.city}, {order.addressObj.state} - <strong className="text-[#e9edef] font-bold">{order.addressObj.pincode}</strong> ({order.addressObj.type || 'Home'})
                          </>
                        ) : (
                          order.address || 'Cyber Hub Road, Sector 24, Gurugram, Haryana - 122002'
                        )}
                      </p>
                    </div>

                    {/* Email Notification & Payment Audit Strip */}
                    <div className="pt-1.5 border-t border-[#222e35] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-[#8696a0]">
                        <Mail className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
                        <span>Email Alert: </span>
                        <span className="font-semibold text-[#e9edef]">{order.customerEmail || 'Customer notified'}</span>
                        <span className="text-[#8696a0]/50">•</span>
                        <span className="text-[#00a884] font-bold">Seller alert sent ({SELLER_ALERT_EMAIL})</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px] text-[#8696a0]">
                        {order.isPartialAdvanceCod ? (
                          <>
                            <span className="text-emerald-400 font-bold">Advance Token: ₹{order.advancePaidAmount ?? 0} Paid</span>
                            <span>•</span>
                            <span className="text-amber-300 font-bold">Doorstep Collect: ₹{order.balanceDueOnDelivery ?? (order.totalAmount - (order.advancePaidAmount ?? 0))}</span>
                            <span>•</span>
                            <span className="text-[#8696a0]">(Total: ₹{order.totalAmount})</span>
                          </>
                        ) : (
                          <>
                            <span>Paid: <strong className="text-[#e9edef]">₹{order.totalAmount}</strong></span>
                            <span>•</span>
                            <span>{order.paymentMethod || 'Razorpay Prepaid'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Logistics Courier Status Bar (Shiprocket / NimbusPost) */}
                  <div className="bg-[#202c33] p-3 rounded-2xl border border-[#2a3942] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs ${
                        provider === 'NimbusPost' ? 'bg-blue-600' : 'bg-indigo-600'
                      }`}>
                        {provider === 'NimbusPost' ? 'NP' : 'SR'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-extrabold text-[#e9edef] text-xs">
                          <span>{provider} Express Partner:</span>
                          <span className="text-[#00a884]">{order.courierPartner || 'BlueDart Air Express'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-[#8696a0]">
                            AWB: <strong className="text-[#e9edef]">{trackingNumber || 'Pending AWB Assignment'}</strong>
                          </span>
                          {trackingNumber && (
                            <button
                              type="button"
                              onClick={() => copyAWB(trackingNumber, order.id)}
                              className="text-[10px] text-[#FFC107] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                            >
                              <Copy className="w-2.5 h-2.5" />
                              <span>{copiedOrderId === order.id ? 'Copied!' : 'Copy'}</span>
                            </button>
                          )}
                          {order.pickupScheduledDate && (
                            <span className="text-[10px] text-[#8696a0] font-medium">
                              • Pickup: {order.pickupScheduledDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prominent Direct "Ship" & Redirection Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* 1. Primary "Ship Order" Button */}
                      <button
                        type="button"
                        onClick={() => openLogisticsModal(order, provider, 'fulfill')}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Ship Order</span>
                      </button>

                      {/* 2. Direct Logistics Platform Redirection Links */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openLogisticsModal(
                            order, 
                            provider === 'Shiprocket' ? 'NimbusPost' : 'Shiprocket',
                            'fulfill'
                          )}
                          className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#162127] hover:bg-[#202c33] text-[#e9edef] border border-[#2a3942] shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="Switch logistics provider"
                        >
                          <span>{provider === 'Shiprocket' ? 'Via NimbusPost' : 'Via Shiprocket'}</span>
                        </button>

                        <a
                          href={provider === 'Shiprocket' ? SHIPROCKET_PORTAL_URL : NIMBUSPOST_PORTAL_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#162127] text-[#FFC107] hover:bg-[#202c33] border border-[#2a3942] flex items-center gap-1 transition-colors"
                          title={`Open ${provider} Portal`}
                        >
                          <span>{provider}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {/* 3. Track Live Button */}
                      <button
                        type="button"
                        onClick={() => setTrackingModalOrder(order)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-[#202c33] hover:bg-[#2a3942] text-[#FFC107] border border-[#FFC107]/40 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#FFC107]" />
                        <span>Track Live</span>
                      </button>

                      {/* 4. Direct Portal Redirection */}
                      {trackingNumber && (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#162127] text-[#FFC107] hover:bg-[#202c33] border border-[#2a3942] flex items-center gap-1 transition-colors"
                          title="Open Carrier Portal"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Secondary Action Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#222e35]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Shipping Label Button (Conditional on Order Status: Shipped / Dispatched with AWB) */}
                      {isShippedWithAwb ? (
                        <button
                          type="button"
                          onClick={() => openLogisticsModal(order, provider, 'label')}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Order Dispatched - Print & Download Shipping Label"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>Print &amp; Download Label</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </button>
                      ) : (
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => openLogisticsModal(order, provider, 'fulfill')}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#162127]/60 text-[#8696a0] hover:text-[#e9edef] hover:border-[#3b4a54] border border-[#222e35] flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Label locked until order is dispatched with AWB"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Label Locked (Ship to Unlock)</span>
                          </button>
                          <div className="hidden group-hover:block absolute bottom-full mb-1 left-0 z-30 bg-[#1f2c34] text-[#e9edef] text-[10px] font-medium p-2 rounded-xl shadow-xl border border-[#2a3942] whitespace-nowrap pointer-events-none">
                            Shipping label unlocks once status is &ldquo;Shipped&rdquo; with an AWB from {provider}
                          </div>
                        </div>
                      )}

                      {/* Schedule Pickup Button */}
                      <button
                        type="button"
                        onClick={() => openLogisticsModal(order, provider, 'pickup')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#162127] hover:bg-[#202c33] text-[#e9edef] border border-[#222e35] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#8696a0]" />
                        <span>Schedule Pickup</span>
                      </button>
                    </div>

                    {/* Order Workflow Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {isPending && !isReadyToShip && (
                        <button
                          type="button"
                          onClick={() => handleAction(order.id, 'ready_to_ship')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] flex items-center gap-1.5 shadow-xs transition-colors active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Pack &amp; Ready</span>
                        </button>
                      )}

                      {isReadyToShip && (
                        <button
                          type="button"
                          onClick={() => handleAction(order.id, 'ship')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors active:scale-95 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Handover to Courier</span>
                        </button>
                      )}

                      {isShipped && (
                        <span className="text-xs font-bold text-[#FFC107] bg-[#0A3A1E] px-3 py-1.5 rounded-xl flex items-center gap-1 border border-[#FFC107]/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC107]" />
                          <span>Dispatched via Hub</span>
                        </span>
                      )}

                      {order.status !== 'Cancelled' && !isShipped && (
                        <button
                          type="button"
                          onClick={() => handleAction(order.id, 'cancel')}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shiprocket & NimbusPost Logistics Fulfillment Modal */}
      {logisticsModalOrder && (
        <LogisticsFulfillmentModal
          isOpen={!!logisticsModalOrder}
          order={logisticsModalOrder}
          initialProvider={logisticsModalProvider}
          initialTab={logisticsModalInitialTab}
          onClose={() => setLogisticsModalOrder(null)}
          onOrderUpdated={(updated) => {
            onUpdateOrder?.(updated);
            if (updated.status !== logisticsModalOrder.status) {
              onUpdateOrderStatus(updated.id, updated.status, updated.trackingStep);
            }
            setLogisticsModalOrder(updated);
          }}
        />
      )}

      {/* Live Tracking Modal (Customer & Seller Real-time Milestones) */}
      {trackingModalOrder && (
        <LiveTrackingModal
          order={trackingModalOrder}
          onClose={() => setTrackingModalOrder(null)}
          onOrderUpdated={(updated) => {
            onUpdateOrder?.(updated);
            setTrackingModalOrder(updated);
          }}
        />
      )}
    </div>
  );
};
