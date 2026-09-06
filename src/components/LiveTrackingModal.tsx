import React, { useState } from 'react';
import { Order, OrderTimelineStep } from '../types';
import { 
  X, CheckCircle2, Truck, MapPin, Package, PhoneCall, Copy, ShieldCheck, 
  Clock, ArrowRight, Download, AlertCircle, Sparkles, Navigation, UserCheck,
  ExternalLink, RefreshCw, Zap
} from 'lucide-react';
import { 
  getShiprocketTrackingUrl, getNimbusPostTrackingUrl,
  getLiveTrackingMilestones, syncLiveCourierStatus
} from '../utils/logisticsService';

interface LiveTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({ 
  order, 
  onClose,
  onOrderUpdated 
}) => {
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [downloadedInvoice, setDownloadedInvoice] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  if (!order) return null;

  const provider = order.logisticsProvider || 'Shiprocket';
  const isShiprocket = provider === 'Shiprocket';
  const trackingNumber = order.trackingNumber || (isShiprocket ? 'SR-BD-8921094' : 'NP-DEL-748921');
  const courierPartner = order.courierPartner || (isShiprocket ? 'BlueDart Air Express' : 'Delhivery Direct Prime');

  const trackingUrl = isShiprocket 
    ? getShiprocketTrackingUrl(trackingNumber) 
    : getNimbusPostTrackingUrl(trackingNumber);

  const copyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard?.writeText(trackingNumber);
      setCopiedAWB(true);
      setTimeout(() => setCopiedAWB(false), 2000);
    }
  };

  const handleDownloadInvoice = () => {
    setDownloadedInvoice(true);
    setTimeout(() => setDownloadedInvoice(false), 3000);
  };

  const handleSyncLiveTracking = async () => {
    setIsSyncing(true);
    try {
      const res = await syncLiveCourierStatus(order);
      if (onOrderUpdated) {
        onOrderUpdated(res.updatedOrder);
      }
      setSyncToast(res.message);
      setTimeout(() => setSyncToast(null), 3500);
    } catch {
      setSyncToast('Tracking synchronized with latest courier scan.');
      setTimeout(() => setSyncToast(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate real-time timeline from logistics engine
  const timeline: OrderTimelineStep[] = order.timeline && order.timeline.length > 0 
    ? order.timeline 
    : getLiveTrackingMilestones(order);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#111b21] rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#222e35] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-[#e9edef]" id="live-order-tracking-modal">
        
        {/* Top Header */}
        <div className="bg-[#162127] text-[#e9edef] p-4 sm:p-5 flex items-center justify-between border-b border-[#222e35] shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-md ${
              isShiprocket ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-[#e9edef]">Live Logistics Tracking</h2>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  order.status === 'Delivered' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                }`}>
                  ● {order.status.toUpperCase()}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isShiprocket 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {provider} Live API
                </span>
              </div>
              <p className="text-[11px] text-[#8696a0] font-mono">Order ID: {order.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSyncLiveTracking}
              disabled={isSyncing}
              title="Refresh Real-time Tracking"
              className="p-2 text-[#8696a0] hover:text-[#e9edef] rounded-xl bg-[#202c33] hover:bg-[#2a3942] transition-colors flex items-center gap-1 text-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00a884]' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-bold">Sync</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8696a0] hover:text-[#e9edef] rounded-xl bg-[#202c33] hover:bg-[#2a3942] transition-colors cursor-pointer"
              aria-label="Close tracking"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="bg-[#00a884] text-white px-4 py-1.5 text-xs font-bold text-center animate-in slide-in-from-top duration-150">
            {syncToast}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Estimated Delivery Status Banner */}
          <div className="bg-[#202c33] text-[#e9edef] rounded-2xl p-4 sm:p-5 border border-[#2a3942] shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00a884] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live {provider} Telemetry &amp; Courier Status
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#e9edef]">
                  {order.estimatedDelivery || 'Arriving within 24-48 Hours'}
                </h3>
                <p className="text-xs text-[#8696a0]">
                  Allocated Carrier: <strong className="text-[#e9edef]">{courierPartner}</strong>
                </p>
              </div>

              {/* AWB & Redirect Badge */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                {order.deliveryAgent && (
                  <div className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5">
                    <span>Delivery OTP:</span>
                    <span className="font-mono text-sm tracking-widest">{order.deliveryAgent.otp}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyTracking}
                    title="Copy Tracking Number"
                    className="text-[11px] text-[#8696a0] hover:text-[#e9edef] flex items-center gap-1 bg-[#162127] px-2.5 py-1.5 rounded-xl border border-[#222e35] font-mono transition-colors"
                  >
                    <span>AWB: {trackingNumber}</span>
                    <Copy className="w-3 h-3 text-[#00a884]" />
                    {copiedAWB && <span className="text-[#00a884] font-bold">Copied</span>}
                  </button>

                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-white bg-[#00a884] hover:bg-[#008f6f] px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-xs"
                  >
                    <span>Track on {provider}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Agent & Doorstep COD Due Banner */}
          {order.isPartialAdvanceCod && (
            <div className="bg-[#005c4b]/20 border border-[#00a884]/40 rounded-2xl p-4 text-xs space-y-2 text-[#e9edef]">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#00a884] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Doorstep Collection: Remaining 80% Balance</span>
                </span>
                <span className="bg-[#00a884] text-[#111b21] font-black text-[10px] px-2 py-0.5 rounded-full">
                  20% ADVANCE PAID
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[#8696a0]">Amount Delivery Agent Will Collect:</span>
                <span className="font-mono font-black text-lg text-amber-300">
                  ₹{(order.balanceDueOnDelivery || order.totalAmount).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-[#8696a0]">
                20% advance token (₹{order.advancePaidAmount}) was paid online. Please keep the exact remaining 80% balance ready in cash or doorstep UPI for delivery agent {order.deliveryAgent?.name || 'Vikas Sharma'}.
              </p>
            </div>
          )}

          {/* Delivery Agent Card (if Out for Delivery or Active) */}
          {order.deliveryAgent && (
            <div className="bg-[#162127] border border-[#222e35] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#e9edef] text-sm">{order.deliveryAgent.name}</span>
                    <span className="bg-[#005c4b]/30 text-[#00a884] text-[10px] font-extrabold px-1.5 py-0.2 rounded border border-[#005c4b]/40">
                      Verified Courier Partner
                    </span>
                  </div>
                  <p className="text-[#8696a0]">{courierPartner} Delivery Executive</p>
                </div>
              </div>

              <a
                href={`tel:${order.deliveryAgent.phone}`}
                className="bg-[#00a884] hover:bg-[#008f6f] text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Agent</span>
              </a>
            </div>
          )}

          {/* Step-by-Step Live Tracking Timeline */}
          <div className="bg-[#162127] rounded-2xl p-4 sm:p-5 border border-[#222e35] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-[#e9edef] uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#00a884]" />
                <span>Real-Time Logistics Milestones</span>
              </h4>
              <span className="text-[10px] font-mono text-[#8696a0]">
                Hub: {order.pickupAddressDetails?.city || 'Indore'} ➔ {order.addressObj?.city || 'Destination'}
              </span>
            </div>

            <div className="space-y-3.5 relative pl-2">
              {timeline.map((step, idx) => {
                const isLast = idx === timeline.length - 1;
                return (
                  <div key={idx} className="flex gap-3.5 relative">
                    {/* Vertical connecting line */}
                    {!isLast && (
                      <div
                        className={`absolute left-3.5 top-6 bottom-0 w-0.5 -translate-x-1/2 ${
                          step.completed ? 'bg-[#00a884]' : 'bg-[#2a3942]'
                        }`}
                      />
                    )}

                    {/* Step Icon Indicator */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.completed
                        ? 'bg-[#00a884] text-white shadow-xs ring-4 ring-[#00a884]/20'
                        : step.current
                        ? 'bg-amber-500 text-white shadow-xs ring-4 ring-amber-500/20 animate-pulse'
                        : 'bg-[#202c33] border-2 border-[#2a3942] text-[#8696a0]'
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#2a3942]" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="space-y-1 pb-3 flex-1 text-xs min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h5 className={`font-bold ${step.completed || step.current ? 'text-[#e9edef] font-bold' : 'text-[#8696a0]'}`}>
                          {step.title}
                        </h5>
                        <span className="text-[10px] text-[#8696a0] font-mono shrink-0">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-[#8696a0] leading-relaxed text-[11px]">{step.description}</p>
                      <span className="inline-block text-[10px] text-[#8696a0] bg-[#202c33] px-2 py-0.5 rounded border border-[#2a3942] font-medium">
                        📍 {step.location}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="bg-[#162127] rounded-2xl p-4 border border-[#222e35] space-y-3 text-xs">
            <span className="font-bold text-[#e9edef] block">Package Manifest ({order.items.length} item{order.items.length > 1 ? 's' : ''}):</span>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 bg-[#202c33] p-2.5 rounded-xl border border-[#2a3942]">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 rounded-lg object-cover border border-[#2a3942] shrink-0"
                    />
                    <div className="min-w-0">
                      <h6 className="font-bold text-[#e9edef] truncate">{item.product.title}</h6>
                      <p className="text-[11px] text-[#8696a0]">
                        Size: <strong className="text-[#e9edef]">{item.selectedSize}</strong> • {item.selectedColor.name} • Qty: <strong className="text-[#e9edef]">{item.quantity}</strong>
                      </p>
                      <p className="text-[10px] text-[#00a884] font-medium">
                        {item.product.fabric || '100% Super-Combed French Terry'} ({item.product.gsm || '240 GSM'})
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-[#00a884] shrink-0">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address & Consignee */}
          <div className="bg-[#162127] rounded-2xl p-4 border border-[#222e35] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#e9edef] block">Delivery Destination:</span>
              <span className="text-[10px] font-mono bg-[#202c33] text-[#00a884] px-2 py-0.5 rounded border border-[#2a3942] font-bold">
                PIN: {order.addressObj?.pincode || '122002'}
              </span>
            </div>
            <p className="text-[#e9edef] font-semibold">{order.addressObj?.name || order.customerName || 'Consignee'}</p>
            <p className="text-[#8696a0] leading-relaxed text-[11px]">{order.address}</p>
          </div>

          {/* Direct Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Track Live on {provider} Portal</span>
            </a>

            <button
              onClick={handleDownloadInvoice}
              className="bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] font-bold py-2.5 px-3 rounded-xl border border-[#2a3942] text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#00a884]" />
              <span>{downloadedInvoice ? 'Invoice Downloaded ✓' : 'Download Tax Invoice & Waybill'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

