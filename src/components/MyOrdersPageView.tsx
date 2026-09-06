import React, { useState } from 'react';
import { 
  Package, Truck, ArrowLeft, Search, CheckCircle2, 
  ExternalLink, FileText, Clock, HelpCircle, ChevronRight, 
  MapPin, AlertCircle, ShoppingBag
} from 'lucide-react';
import { Order } from '../types';

interface MyOrdersPageViewProps {
  orders: Order[];
  onBack: () => void;
  onOpenTrackingModal?: (order: Order) => void;
  onOpenSupport?: (orderId?: string) => void;
  onContinueShopping?: () => void;
}

export const MyOrdersPageView: React.FC<MyOrdersPageViewProps> = ({
  orders,
  onBack,
  onOpenTrackingModal,
  onOpenSupport,
  onContinueShopping,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-transit' | 'delivered' | 'processing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const inTransitCount = orders.filter((o) => o.status === 'In Transit').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const processingCount = orders.filter((o) => o.status === 'Processing' || o.status === 'Confirmed').length;

  const filteredOrders = orders.filter((o) => {
    // Filter by tab
    if (activeFilter === 'in-transit' && o.status !== 'In Transit') return false;
    if (activeFilter === 'delivered' && o.status !== 'Delivered') return false;
    if (activeFilter === 'processing' && (o.status === 'Delivered' || o.status === 'In Transit' || o.status === 'Cancelled')) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = o.id.toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.product.title.toLowerCase().includes(q));
      if (!matchId && !matchItem) return false;
    }

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 pb-24 space-y-6" id="my-orders-fullpage-view">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0A3A1E] transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          id="btn-back-from-orders"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Package className="w-4 h-4 text-[#0A3A1E]" />
          <span>{orders.length} Total Orders</span>
        </div>
      </div>

      {/* Page Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Orders &amp; Delivery Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time courier telemetry, verified OTPs, and tax invoices
          </p>
        </div>

        {/* Search within Orders */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or item..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0A3A1E]"
            id="input-search-my-orders"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
          id="filter-orders-all"
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveFilter('in-transit')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === 'in-transit'
              ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
          id="filter-orders-transit"
        >
          In Transit / Out for Delivery ({inTransitCount})
        </button>
        <button
          onClick={() => setActiveFilter('delivered')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === 'delivered'
              ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
          id="filter-orders-delivered"
        >
          Delivered ({deliveredCount})
        </button>
        {processingCount > 0 && (
          <button
            onClick={() => setActiveFilter('processing')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'processing'
                ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
            id="filter-orders-processing"
          >
            Processing ({processingCount})
          </button>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'No orders match your search term.' : 'You have not placed any orders in this section yet.'}
            </p>
          </div>
          <button
            onClick={onContinueShopping || onBack}
            className="bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm inline-flex items-center gap-2"
          >
            <span>Explore T-Shirts &amp; Streetwear</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'Delivered';
            const isTransit = order.status === 'In Transit';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all space-y-4 p-4 sm:p-5"
                id={`order-card-${order.id}`}
              >
                {/* Order Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.id}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{order.date}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-semibold">{order.paymentMethod || 'Razorpay Prepaid'}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : isTransit
                        ? 'bg-blue-100 text-[#2874F0]'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isDelivered ? 'bg-emerald-600' : isTransit ? 'bg-blue-600 animate-pulse' : 'bg-amber-600'
                      }`} />
                      <span>{order.status}</span>
                    </span>
                  </div>
                </div>

                {/* Items in the Order */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 sm:gap-4 items-center">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1 min-w-0 flex-1 text-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {item.product.brand}
                        </span>
                        <h3 className="font-bold text-slate-900 line-clamp-1 sm:line-clamp-2 text-sm">
                          {item.product.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <span>Size: <strong className="text-slate-900">{item.selectedSize}</strong></span>
                          <span>•</span>
                          <span>Qty: <strong className="text-slate-900">{item.quantity}</strong></span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm pt-0.5">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address Summary */}
                {(order.addressObj || order.address) && (
                  <div className="bg-slate-50 rounded-xl p-3 text-xs flex items-start gap-2.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-[#0A3A1E] shrink-0 mt-0.5" />
                    <div>
                      {order.addressObj ? (
                        <>
                          <span className="font-bold text-slate-900">
                            {order.addressObj.name} (+91 {order.addressObj.phone})
                          </span>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            {order.addressObj.house ? `${order.addressObj.house}, ` : ''}{order.addressObj.street}, {order.addressObj.city}, {order.addressObj.state} - {order.addressObj.pincode}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-700 text-xs">
                          {order.address}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Controls Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900">
                    {order.isPartialAdvanceCod ? (
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">
                          Total Due at Doorstep (80%): <span className="font-mono text-base text-rose-700">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          ✓ 20% Advance (₹{order.advancePaidAmount}) Paid Online • Delivery Agent Collects ₹{order.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-900">
                        Total Paid: <span className="font-mono text-base text-[#0A3A1E]">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Live Tracking Button */}
                    {onOpenTrackingModal && (
                      <button
                        onClick={() => onOpenTrackingModal(order)}
                        className="bg-[#2874F0] hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        id={`btn-track-${order.id}`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Live</span>
                      </button>
                    )}

                    {/* View GST Invoice */}
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      id={`btn-invoice-${order.id}`}
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Invoice</span>
                    </button>

                    {/* Need Help / Support */}
                    {onOpenSupport && (
                      <button
                        onClick={() => onOpenSupport(order.id)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        id={`btn-help-${order.id}`}
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Need Help?</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal Preview */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tax Invoice / Order Receipt</h3>
                <p className="text-xs text-slate-500">Order ID: {selectedInvoiceOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Seller</span>
                <span className="font-bold text-slate-900">AK Selling Drops (GSTIN: 06AAACK1234F1Z5)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Date</span>
                <span className="font-bold text-slate-900">{selectedInvoiceOrder.date}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-bold text-emerald-700">PAID via {selectedInvoiceOrder.paymentMethod || 'Razorpay 256-bit SSL'}</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-900 block">Ordered Items:</span>
                {selectedInvoiceOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span className="truncate max-w-[280px]">{i.product.title} (Size: {i.selectedSize} × {i.quantity})</span>
                    <span className="font-mono font-bold">₹{i.product.price * i.quantity}</span>
                  </div>
                ))}
              </div>
              {selectedInvoiceOrder.isPartialAdvanceCod ? (
                <div className="border-t pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Total Product Order Value:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{(selectedInvoiceOrder.originalOrderTotal || (selectedInvoiceOrder.totalAmount + (selectedInvoiceOrder.advancePaidAmount || 0))).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700 font-bold">
                    <span>Mandatory 20% Online Advance Token (PAID):</span>
                    <span className="font-mono">- ₹{(selectedInvoiceOrder.advancePaidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed pt-1.5 text-sm font-black text-rose-700">
                    <span>Remaining 80% Balance Due at Doorstep:</span>
                    <span className="font-mono text-base">₹{selectedInvoiceOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    * Delivery executive is instructed to collect exactly ₹{selectedInvoiceOrder.totalAmount.toLocaleString()} in cash or doorstep UPI.
                  </p>
                </div>
              ) : (
                <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-[#0A3A1E]">₹{selectedInvoiceOrder.totalAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-[#0A3A1E] text-[#FFC107] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#052610] transition-colors"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
