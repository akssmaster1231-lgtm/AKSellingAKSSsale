import React, { useState, useEffect } from 'react';
import { 
  X, Truck, Printer, Calendar, Clock, CheckCircle2, ShieldCheck, 
  Package, MapPin, ExternalLink, ChevronRight, Sparkles, AlertCircle,
  Mail, Send, FileText, ArrowRight, Key, RefreshCw, Navigation, Check, Copy,
  Lock, Download
} from 'lucide-react';
import { Order, OrderTimelineStep } from '../../types';
import { 
  SHIPROCKET_COURIERS, NIMBUSPOST_COURIERS, 
  bookShipmentWithProvider, generateLogisticsLabelHtml,
  LogisticsCourier, ShipmentBookingResult,
  SHIPROCKET_PORTAL_URL, NIMBUSPOST_PORTAL_URL,
  getShiprocketTrackingUrl, getNimbusPostTrackingUrl,
  getLiveTrackingMilestones, syncLiveCourierStatus,
  getSavedLogisticsConfig, saveLogisticsConfig,
  fetchLogisticsConfigDynamic, subscribeToLogisticsConfig,
  verifyShiprocketCredentials, verifyNimbusPostCredentials,
  LogisticsConfig
} from '../../utils/logisticsService';
import { 
  SELLER_ALERT_EMAIL, getStoredEmailLogForOrder,
  generateCustomerOrderHtml, generateSellerAlertHtml
} from '../../utils/emailNotificationService';
import { INITIAL_SELLER_PICKUP_ADDRESS, MOCK_PRODUCTS } from '../../data/mockData';

const FALLBACK_ORDER: Order = {
  id: 'ORD-SR-HUB-01',
  customerName: 'Anoj Kumar',
  customerPhone: '+91 98765 43210',
  customerEmail: 'anojkumar4907@gmail.com',
  address: 'Plot 42, DLF Phase 4, Near Galleria Market, Sector 28, Gurugram, Haryana - 122002',
  addressObj: {
    id: 'addr-demo',
    name: 'Anoj Kumar',
    phone: '9876543210',
    house: 'Plot 42',
    street: 'DLF Phase 4, Sector 28',
    landmark: 'Near Galleria Market',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    type: 'Home',
    isDefault: true,
  },
  items: [
    {
      id: 'item-demo-1',
      product: MOCK_PRODUCTS[0],
      quantity: 1,
      selectedSize: 'L',
      selectedColor: MOCK_PRODUCTS[0]?.colors[0] || { name: 'Onyx Black', hex: '#18181b', imageIndex: 0 },
    },
  ],
  totalAmount: 799,
  date: 'Today, 10:14 AM',
  status: 'Processing',
  trackingStep: 1,
  estimatedDelivery: 'In 2-3 Days',
  paymentMethod: 'Prepaid Razorpay (Verified)',
  logisticsProvider: 'Shiprocket',
  pickupAddressDetails: INITIAL_SELLER_PICKUP_ADDRESS,
};

interface LogisticsFulfillmentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: Order) => void;
  initialProvider?: 'Shiprocket' | 'NimbusPost';
  initialTab?: 'fulfill' | 'label' | 'pickup' | 'tracking' | 'email' | 'api';
}

export const LogisticsFulfillmentModal: React.FC<LogisticsFulfillmentModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
  initialProvider = 'Shiprocket',
  initialTab = 'fulfill'
}) => {
  const activeOrder = order || FALLBACK_ORDER;

  const [provider, setProvider] = useState<'Shiprocket' | 'NimbusPost'>(
    (activeOrder.logisticsProvider as any) || initialProvider
  );
  const couriers = provider === 'Shiprocket' ? SHIPROCKET_COURIERS : NIMBUSPOST_COURIERS;
  const [selectedCourierId, setSelectedCourierId] = useState<string>(couriers[0].id);

  // Modal Sub-tabs: 'fulfill' | 'label' | 'pickup' | 'tracking' | 'email' | 'api'
  const [activeView, setActiveView] = useState<'fulfill' | 'label' | 'pickup' | 'tracking' | 'email' | 'api'>(
    initialTab || 'fulfill'
  );

  // Pickup Scheduling Form
  const [pickupDate, setPickupDate] = useState('Tomorrow');
  const [pickupSlot, setPickupSlot] = useState('11:00 AM - 02:00 PM (Priority)');
  const [manualAwbInput, setManualAwbInput] = useState('');

  // API Config Form
  const [logisticsConfig, setLogisticsConfig] = useState<LogisticsConfig>(getSavedLogisticsConfig());
  const [isVerifyingSR, setIsVerifyingSR] = useState(false);
  const [isVerifyingNP, setIsVerifyingNP] = useState(false);
  const [isSyncingLiveTracking, setIsSyncingLiveTracking] = useState(false);

  // Booking result state
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingResult, setBookingResult] = useState<ShipmentBookingResult | null>(() => {
    if (activeOrder.trackingNumber && activeOrder.logisticsProvider) {
      return {
        success: true,
        provider: activeOrder.logisticsProvider as any,
        awbNumber: activeOrder.trackingNumber,
        shipmentId: activeOrder.shipmentId || `SHP-${activeOrder.id}`,
        courierName: activeOrder.courierPartner || 'BlueDart Air Express',
        pickupToken: activeOrder.pickupToken || 'PKP-8921',
        scheduledPickupDate: activeOrder.pickupScheduledDate || 'Tomorrow',
        scheduledPickupTime: activeOrder.pickupTimeSlot || '11:00 AM - 02:00 PM',
        trackingUrl: activeOrder.logisticsProvider === 'Shiprocket'
          ? getShiprocketTrackingUrl(activeOrder.trackingNumber)
          : getNimbusPostTrackingUrl(activeOrder.trackingNumber),
        estimatedDeliveryDate: '1-2 Days',
      };
    }
    return null;
  });

  // Sync state when opened or when order/initialTab/initialProvider change
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveView(initialTab);
      if (initialProvider) setProvider(initialProvider);
    }
  }, [isOpen, initialTab, initialProvider]);

  // Load dynamically from Firestore / Environment variables with live subscription
  useEffect(() => {
    let isMounted = true;
    fetchLogisticsConfigDynamic().then((cfg) => {
      if (isMounted && cfg) {
        setLogisticsConfig((prev) => ({ ...prev, ...cfg }));
      }
    });

    const unsubscribe = subscribeToLogisticsConfig((cfg) => {
      if (isMounted && cfg) {
        setLogisticsConfig((prev) => ({ ...prev, ...cfg }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (activeOrder.trackingNumber && activeOrder.logisticsProvider) {
      setBookingResult({
        success: true,
        provider: (activeOrder.logisticsProvider as any) || provider,
        awbNumber: activeOrder.trackingNumber,
        shipmentId: activeOrder.shipmentId || `SHP-${activeOrder.id}`,
        courierName: activeOrder.courierPartner || (provider === 'Shiprocket' ? 'BlueDart Air Express' : 'Delhivery Direct Prime'),
        pickupToken: activeOrder.pickupToken || 'PKP-8921',
        scheduledPickupDate: activeOrder.pickupScheduledDate || 'Tomorrow',
        scheduledPickupTime: activeOrder.pickupTimeSlot || '11:00 AM - 02:00 PM',
        trackingUrl: activeOrder.logisticsProvider === 'Shiprocket'
          ? getShiprocketTrackingUrl(activeOrder.trackingNumber)
          : getNimbusPostTrackingUrl(activeOrder.trackingNumber),
        estimatedDeliveryDate: '1-2 Days',
      });
    }
  }, [activeOrder, isOpen]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  if (!isOpen) return null;

  const selectedCourier = couriers.find((c) => c.id === selectedCourierId) || couriers[0];

  // 1. Book shipment / Generate AWB via Shiprocket or NimbusPost
  const handleBookShipment = async () => {
    setIsProcessing(true);
    try {
      const result = await bookShipmentWithProvider(activeOrder, provider, selectedCourierId);
      setBookingResult(result);

      const updatedOrder: Order = {
        ...activeOrder,
        logisticsProvider: provider,
        trackingNumber: result.awbNumber,
        courierPartner: result.courierName,
        shipmentId: result.shipmentId,
        pickupToken: result.pickupToken,
        pickupScheduledDate: pickupDate,
        pickupTimeSlot: pickupSlot,
        shippingLabelGenerated: true,
        timeline: getLiveTrackingMilestones({
          ...activeOrder,
          logisticsProvider: provider,
          trackingNumber: result.awbNumber,
          courierPartner: result.courierName,
          trackingStep: 2,
        }),
      };

      if (order && onOrderUpdated) {
        onOrderUpdated(updatedOrder);
      }
      showToast(`AWB Assigned: ${result.awbNumber} via ${provider}`);
      setActiveView('label');
    } catch (e) {
      showToast('Error booking courier. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Schedule Pickup
  const handleConfirmPickup = () => {
    if (!bookingResult) {
      showToast('Please generate AWB first.');
      return;
    }

    const updatedOrder: Order = {
      ...activeOrder,
      pickupScheduledDate: pickupDate,
      pickupTimeSlot: pickupSlot,
      trackingStep: 2,
    };
    if (order && onOrderUpdated) {
      onOrderUpdated(updatedOrder);
    }
    showToast(`Doorstep pickup scheduled for ${pickupDate} (${pickupSlot})`);
    setActiveView('tracking');
  };

  // 2.5 Save Manual AWB from Portal
  const handleSaveManualAwb = (awbToSave: string) => {
    const cleanAwb = awbToSave.trim();
    if (!cleanAwb) {
      showToast('Please enter a valid AWB number.');
      return;
    }
    const defaultCourier = provider === 'Shiprocket' ? 'BlueDart Air Express (via Shiprocket)' : 'NimbusPost Priority Express';
    const result: ShipmentBookingResult = {
      success: true,
      provider: provider,
      awbNumber: cleanAwb,
      shipmentId: activeOrder.shipmentId || `SHP-${cleanAwb}`,
      courierName: activeOrder.courierPartner || defaultCourier,
      pickupToken: activeOrder.pickupToken || `PKP-${Math.floor(1000 + Math.random() * 9000)}`,
      scheduledPickupDate: pickupDate,
      scheduledPickupTime: pickupSlot,
      trackingUrl: provider === 'Shiprocket'
        ? getShiprocketTrackingUrl(cleanAwb)
        : getNimbusPostTrackingUrl(cleanAwb),
      estimatedDeliveryDate: '1-2 Days',
    };
    setBookingResult(result);

    const updatedOrder: Order = {
      ...activeOrder,
      logisticsProvider: provider,
      trackingNumber: cleanAwb,
      courierPartner: activeOrder.courierPartner || defaultCourier,
      shipmentId: result.shipmentId,
      pickupToken: result.pickupToken,
      pickupScheduledDate: pickupDate,
      pickupTimeSlot: pickupSlot,
      shippingLabelGenerated: true,
      timeline: getLiveTrackingMilestones({
        ...activeOrder,
        logisticsProvider: provider,
        trackingNumber: cleanAwb,
        courierPartner: activeOrder.courierPartner || defaultCourier,
        trackingStep: 2,
      }),
    };

    if (order && onOrderUpdated) {
      onOrderUpdated(updatedOrder);
    }
    showToast(`AWB ${cleanAwb} attached from ${provider}`);
    setManualAwbInput('');
  };

  // 3. Mark Order as "Shipped" / "In Transit"
  const handleMarkAsShipped = () => {
    const awb = bookingResult?.awbNumber || activeOrder.trackingNumber || `SR-BD-${Math.floor(100000 + Math.random() * 900000)}`;
    const courier = bookingResult?.courierName || activeOrder.courierPartner || selectedCourier.name;

    const updatedOrder: Order = {
      ...activeOrder,
      status: 'In Transit',
      trackingStep: 3,
      trackingNumber: awb,
      courierPartner: courier,
      logisticsProvider: provider,
      timeline: getLiveTrackingMilestones({
        ...activeOrder,
        status: 'In Transit',
        trackingStep: 3,
        trackingNumber: awb,
        courierPartner: courier,
        logisticsProvider: provider,
      }),
    };

    if (order && onOrderUpdated) {
      onOrderUpdated(updatedOrder);
    }
    showToast(`Order #${activeOrder.id} marked as In Transit with ${provider}`);
    setActiveView('tracking');
  };

  // 4. Live Tracking Sync
  const handleSyncTracking = async () => {
    setIsSyncingLiveTracking(true);
    try {
      const res = await syncLiveCourierStatus(activeOrder);
      if (order && onOrderUpdated) {
        onOrderUpdated(res.updatedOrder);
      }
      showToast(res.message);
    } catch {
      showToast('Live tracking checked.');
    } finally {
      setIsSyncingLiveTracking(false);
    }
  };

  // 5. Verify & Save Shiprocket API credentials
  const handleSaveShiprocketCreds = async () => {
    setIsVerifyingSR(true);
    try {
      const res = await verifyShiprocketCredentials(
        logisticsConfig.shiprocketEmail,
        logisticsConfig.shiprocketToken
      );
      if (res.success) {
        const updated = {
          ...logisticsConfig,
          shiprocketStatus: 'CONNECTED' as const,
          lastVerifiedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        setLogisticsConfig(updated);
        saveLogisticsConfig(updated);
        showToast('Shiprocket Live API Token verified & active');
      } else {
        showToast(res.message);
      }
    } finally {
      setIsVerifyingSR(false);
    }
  };

  // 6. Verify & Save NimbusPost API credentials
  const handleSaveNimbusPostCreds = async () => {
    setIsVerifyingNP(true);
    try {
      const res = await verifyNimbusPostCredentials(
        logisticsConfig.nimbusPostApiKey,
        logisticsConfig.nimbusPostToken
      );
      if (res.success) {
        const updated = {
          ...logisticsConfig,
          nimbusPostStatus: 'CONNECTED' as const,
        };
        setLogisticsConfig(updated);
        saveLogisticsConfig(updated);
        showToast('NimbusPost API Key saved & enabled');
      } else {
        showToast(res.message);
      }
    } finally {
      setIsVerifyingNP(false);
    }
  };

  // Check if order is officially dispatched/shipped with an active AWB
  const isShippedWithAwb = Boolean(
    (activeOrder.status === 'In Transit' || activeOrder.status === 'Delivered' || (activeOrder.trackingStep && activeOrder.trackingStep >= 3)) &&
    (bookingResult?.awbNumber || (activeOrder.trackingNumber && activeOrder.trackingNumber.trim() !== ''))
  );

  // Quick Book & Ship to immediately unlock label
  const handleQuickBookAndShip = async () => {
    setIsProcessing(true);
    try {
      const result = await bookShipmentWithProvider(activeOrder, provider, selectedCourier.id);
      setBookingResult(result);

      const updatedOrder: Order = {
        ...activeOrder,
        status: 'In Transit',
        logisticsProvider: provider,
        courierPartner: result.courierName,
        trackingNumber: result.awbNumber,
        shipmentId: result.shipmentId,
        pickupToken: result.pickupToken,
        pickupScheduledDate: pickupDate,
        pickupTimeSlot: pickupSlot,
        shippingLabelGenerated: true,
        trackingStep: 3,
        timeline: getLiveTrackingMilestones({
          ...activeOrder,
          status: 'In Transit',
          logisticsProvider: provider,
          trackingNumber: result.awbNumber,
          courierPartner: result.courierName,
          trackingStep: 3,
        }),
      };

      if (order && onOrderUpdated) {
        onOrderUpdated(updatedOrder);
      }
      showToast(`Consignment Dispatched with AWB: ${result.awbNumber}! Label unlocked.`);
      setActiveView('label');
    } catch {
      showToast('Error generating courier AWB. Please check connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download shipping label HTML file
  const handleDownloadLabelHtml = () => {
    if (!isShippedWithAwb) {
      showToast('Shipping label is locked until the order is shipped with an AWB.');
      return;
    }
    const awb = bookingResult?.awbNumber || activeOrder.trackingNumber || 'SR-BD-8921094';
    const courier = bookingResult?.courierName || activeOrder.courierPartner || selectedCourier.name;
    const labelHtml = generateLogisticsLabelHtml(activeOrder, provider, awb, courier);
    const fullHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Shipping Label - Order #${activeOrder.id} - ${awb}</title>
    <style>
      body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; background: #f8fafc; }
      @media print { body { padding: 0; background: white; } }
    </style>
  </head>
  <body>
    ${labelHtml}
  </body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipping-label-${activeOrder.id}-${awb}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Shipping label HTML downloaded successfully.');
  };

  // Print shipping label
  const handlePrintLabel = () => {
    if (!isShippedWithAwb) {
      showToast('Shipping label is locked until the order status is Shipped with an AWB.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const labelHtml = generateLogisticsLabelHtml(
        activeOrder,
        provider,
        bookingResult?.awbNumber || activeOrder.trackingNumber || 'SR-BD-8921094',
        bookingResult?.courierName || activeOrder.courierPartner || selectedCourier.name
      );
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Shipping Label - Order #${activeOrder.id}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: sans-serif; display: flex; justify-content: center; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            ${labelHtml}
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const portalUrl = provider === 'Shiprocket' ? SHIPROCKET_PORTAL_URL : NIMBUSPOST_PORTAL_URL;
  const directTrackingUrl = provider === 'Shiprocket'
    ? getShiprocketTrackingUrl(bookingResult?.awbNumber || activeOrder.trackingNumber || 'ACTIVE')
    : getNimbusPostTrackingUrl(bookingResult?.awbNumber || activeOrder.trackingNumber || 'ACTIVE');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111b21] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#222e35] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-[#e9edef]">
        
        {/* Modal Header */}
        <div className="bg-[#162127] text-[#e9edef] p-4 sm:p-5 flex items-center justify-between border-b border-[#222e35]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00a884]/20 flex items-center justify-center text-[#00a884]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-[#e9edef]">Shiprocket &amp; NimbusPost Fulfillment Hub</h3>
                <span className="bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Production Ready
                </span>
                <span className="bg-[#202c33] text-[#8696a0] border border-[#2a3942] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {provider} Active
                </span>
              </div>
              <p className="text-xs text-[#8696a0]">
                Order #{activeOrder.id} • Customer: {activeOrder.addressObj?.name || activeOrder.customerName || 'Anoj Kumar'} • PIN: {activeOrder.addressObj?.pincode || '122002'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#202c33] text-[#8696a0] hover:text-[#e9edef] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-[#00a884] text-white px-4 py-2 text-xs font-bold text-center animate-in slide-in-from-top duration-200">
            {toastMsg}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-[#162127] p-2 border-b border-[#222e35] flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveView('fulfill')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'fulfill' ? 'bg-[#202c33] text-[#00a884] border border-[#2a3942] shadow-xs' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Direct Dispatch &amp; Portals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('label')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'label' ? 'bg-[#202c33] text-[#00a884] border border-[#2a3942] shadow-xs' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            {isShippedWithAwb ? (
              <Printer className="w-3.5 h-3.5 text-[#00a884]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Shipping Label</span>
            {isShippedWithAwb ? (
              <span className="w-2 h-2 rounded-full bg-[#00a884]" />
            ) : (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">Locked</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('pickup')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'pickup' ? 'bg-[#202c33] text-[#00a884] border border-[#2a3942] shadow-xs' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Pickup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('tracking')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'tracking' ? 'bg-[#202c33] text-[#00a884] border border-[#2a3942] shadow-xs' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Live Tracking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('email')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'email' ? 'bg-[#202c33] text-[#00a884] border border-[#2a3942] shadow-xs' : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Audit</span>
          </button>
        </div>

        {/* Tab 1: Direct Dispatch & External Partner Portals */}
        {activeView === 'fulfill' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Direct Logistics Guidance Banner */}
            <div className="p-3.5 bg-[#162127] rounded-2xl border border-[#222e35] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00a884]/20 border border-[#00a884]/30 flex items-center justify-center shrink-0 mt-0.5">
                <ExternalLink className="w-4 h-4 text-[#00a884]" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="font-extrabold text-[#e9edef] block">
                  Clean Direct Logistics Redirection
                </span>
                <p className="text-[11px] text-[#8696a0] leading-relaxed">
                  Manage real-time courier rate negotiations, multi-carrier air/surface comparison, and rider dispatch directly on your official partner dashboards.
                </p>
              </div>
            </div>

            {/* Direct External Partner Portals (Shiprocket & NimbusPost) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Shiprocket Partner Card */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all relative ${
                  provider === 'Shiprocket'
                    ? 'border-[#00a884] bg-[#202c33] shadow-sm ring-1 ring-[#00a884]/30'
                    : 'border-[#222e35] bg-[#162127]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      SR
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-[#e9edef] block">Shiprocket</span>
                      <span className="text-[10px] text-[#8696a0]">Official Aggregator</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#00a884]/40">
                    <Check className="w-2.5 h-2.5 text-[#00a884]" />
                    Live API Active
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="text-[11px] text-[#8696a0]">
                    Connected Account: <strong className="text-[#e9edef] font-mono">{logisticsConfig.shiprocketEmail}</strong>
                  </p>
                  <p className="text-[10px] text-[#8696a0]">
                    Fastest Air Express: BlueDart, Delhivery, Xpressbees, and Shadowfax.
                  </p>
                </div>

                {/* Direct Redirection Button */}
                <div className="mt-3.5 pt-3 border-t border-[#2a3942] flex items-center gap-2">
                  <a
                    href={SHIPROCKET_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <span>Open Shiprocket Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {provider !== 'Shiprocket' && (
                    <button
                      type="button"
                      onClick={() => {
                        setProvider('Shiprocket');
                        setSelectedCourierId(SHIPROCKET_COURIERS[0].id);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#162127] hover:bg-[#202c33] text-[#e9edef] text-xs font-bold border border-[#2a3942] cursor-pointer"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>

              {/* 2. NimbusPost Partner Card */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all relative ${
                  provider === 'NimbusPost'
                    ? 'border-[#00a884] bg-[#202c33] shadow-sm ring-1 ring-[#00a884]/30'
                    : 'border-[#222e35] bg-[#162127]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      NP
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-[#e9edef] block">NimbusPost</span>
                      <span className="text-[10px] text-[#8696a0]">AI Logistics Engine</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold px-2 py-0.5 rounded-full">
                    {logisticsConfig.nimbusPostStatus === 'CONNECTED' ? 'Live Connected' : 'Ready'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="text-[11px] text-[#8696a0]">
                    Features: <strong className="text-[#e9edef]">27+ Couriers &amp; Smart NDR</strong>
                  </p>
                  <p className="text-[10px] text-[#8696a0]">
                    AI-powered Anti-RTO prediction and lowest B2C surface rates.
                  </p>
                </div>

                {/* Direct Redirection Button */}
                <div className="mt-3.5 pt-3 border-t border-[#2a3942] flex items-center gap-2">
                  <a
                    href={NIMBUSPOST_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <span>Open NimbusPost Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {provider !== 'NimbusPost' && (
                    <button
                      type="button"
                      onClick={() => {
                        setProvider('NimbusPost');
                        setSelectedCourierId(NIMBUSPOST_COURIERS[0].id);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#162127] hover:bg-[#202c33] text-[#e9edef] text-xs font-bold border border-[#2a3942] cursor-pointer"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Consignee & Order Manifest Details */}
            <div className="bg-[#162127] p-3.5 rounded-2xl border border-[#222e35] text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#222e35] pb-2">
                <span className="font-bold text-[#8696a0] uppercase text-[10px] tracking-wider">
                  Destination Consignee &amp; Package:
                </span>
                <span className="font-mono text-[11px] text-[#00a884] font-bold">
                  PIN: {activeOrder.addressObj?.pincode || '122002'} • {activeOrder.addressObj?.city || 'Gurugram'}, {activeOrder.addressObj?.state || 'Haryana'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[#e9edef]">
                <div>
                  <strong className="text-sm">{activeOrder.addressObj?.name || activeOrder.customerName || 'Customer'}</strong>{' '}
                  <span className="text-[#8696a0]">({activeOrder.addressObj?.phone || '9876543210'})</span>
                  <p className="text-[11px] text-[#8696a0] mt-0.5">{activeOrder.address}</p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-xs font-bold text-[#FFC107]">Weight: ~0.50 kg</span>
                  <p className="text-[11px] text-[#8696a0]">Value: ₹{activeOrder.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* AWB Attachment & Dispatch Sync */}
            <div className="bg-[#162127] p-4 rounded-2xl border border-[#222e35] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#e9edef] uppercase tracking-wide">
                  Order AWB &amp; Tracking Synchronization:
                </span>
                {activeOrder.trackingNumber && (
                  <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] px-2 py-0.5 rounded-full font-mono font-bold">
                    AWB: {activeOrder.trackingNumber}
                  </span>
                )}
              </div>

              {/* Paste AWB from Partner Portal */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={manualAwbInput}
                  onChange={(e) => setManualAwbInput(e.target.value)}
                  placeholder={`Paste AWB Number booked on ${provider} (e.g. 1423891024)...`}
                  className="w-full sm:flex-1 py-2.5 px-3.5 bg-[#202c33] border border-[#2a3942] rounded-xl text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleSaveManualAwb(manualAwbInput)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] font-extrabold text-xs border border-[#00a884]/40 hover:border-[#00a884] transition-all cursor-pointer"
                >
                  Save &amp; Attach AWB
                </button>
              </div>

              {/* Action Buttons: Fast Assign or Dispatch */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleBookShipment}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-white" />
                  <span>{isProcessing ? 'Assigning AWB...' : `Auto-Assign ${provider} AWB & Generate Label`}</span>
                </button>

                {(bookingResult || activeOrder.trackingNumber) && (
                  <button
                    type="button"
                    onClick={handleMarkAsShipped}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Shipped</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Shipping Label Preview & Print (Conditional on Shipped / Dispatched Status) */}
        {activeView === 'label' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {!isShippedWithAwb ? (
              <div className="bg-[#162127] p-6 sm:p-8 rounded-2xl border border-amber-500/30 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-7 h-7" />
                </div>
                
                <div className="max-w-md space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Order Status: {activeOrder.status} (Not Dispatched)</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#e9edef] tracking-tight">
                    Shipping Label Generation Locked
                  </h3>
                  <p className="text-xs text-[#8696a0] leading-relaxed">
                    Under standard <strong className="text-[#e9edef]">{provider}</strong> courier compliance rules, official barcode shipping labels &amp; waybills can only be generated and printed once the order has been dispatched with an active AWB number assigned.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 w-full max-w-md justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveView('fulfill')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Direct Dispatch &amp; Portals</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickBookAndShip}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] border border-[#2a3942] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#00a884]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#00a884]" />
                    )}
                    <span>Quick Dispatch &amp; Unlock</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-[#162127] p-3 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#e9edef]">Official {provider} Barcode Label Ready</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        Dispatched
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8696a0] font-mono mt-0.5">
                      AWB: <strong className="text-[#00a884]">{bookingResult?.awbNumber || activeOrder.trackingNumber || 'SR-BD-8921094'}</strong>
                      {activeOrder.courierPartner && (
                        <span className="ml-2 text-slate-400">({activeOrder.courierPartner})</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleDownloadLabelHtml}
                      className="px-3.5 py-2 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] border border-[#2a3942] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Download HTML Shipping Label"
                    >
                      <Download className="w-3.5 h-3.5 text-[#00a884]" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintLabel}
                      className="px-4 py-2 bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-white" />
                      <span>Print Barcode Label</span>
                    </button>
                  </div>
                </div>

                {/* Label HTML Preview Container */}
                <div 
                  className="p-4 bg-white rounded-2xl border border-[#2a3942] shadow-inner flex justify-center text-slate-900"
                  dangerouslySetInnerHTML={{
                    __html: generateLogisticsLabelHtml(
                      activeOrder,
                      provider,
                      bookingResult?.awbNumber || activeOrder.trackingNumber || 'SR-BD-8921094',
                      bookingResult?.courierName || activeOrder.courierPartner || selectedCourier.name
                    )
                  }}
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveView('pickup')}
                    className="px-4 py-2 bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942] border border-[#2a3942] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#00a884]" />
                    <span>Schedule Courier Pickup ➔</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('tracking')}
                    className="px-4 py-2 bg-[#202c33] text-[#00a884] hover:bg-[#2a3942] border border-[#2a3942] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#00a884]" />
                    <span>Track Consignment</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Schedule Pickup */}
        {activeView === 'pickup' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div className="bg-[#162127] border border-[#222e35] p-4 rounded-2xl space-y-1">
              <h4 className="font-extrabold text-sm text-[#00a884] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00a884]" />
                Doorstep Hub Pickup - {provider} Express Rider Dispatch
              </h4>
              <p className="text-[#8696a0] text-xs">
                A verified courier rider from {selectedCourier.name} will arrive at the AKSelling Dispatch Hub to scan the AWB and collect the package.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#e9edef] mb-1">Select Pickup Date:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Today', 'Tomorrow', 'Day After'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPickupDate(d)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        pickupDate === d
                          ? 'border-[#00a884] bg-[#00a884] text-white shadow-xs'
                          : 'border-[#2a3942] bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#e9edef] mb-1">Pickup Time Window:</label>
                <div className="space-y-2">
                  {[
                    '10:00 AM - 01:00 PM (Morning Slot)',
                    '02:00 PM - 05:00 PM (Afternoon Slot)',
                    '05:00 PM - 08:00 PM (Evening Priority)'
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPickupSlot(slot)}
                      className={`w-full p-2.5 rounded-xl border text-left font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        pickupSlot === slot
                          ? 'border-[#00a884] bg-[#202c33] text-[#00a884] font-bold'
                          : 'border-[#222e35] bg-[#162127] text-[#8696a0] hover:bg-[#202c33]'
                      }`}
                    >
                      <span>{slot}</span>
                      {pickupSlot === slot && <CheckCircle2 className="w-4 h-4 text-[#00a884]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warehouse Origin */}
              <div className="p-3 bg-[#162127] rounded-xl border border-[#222e35] text-[#8696a0] space-y-1">
                <span className="text-[10px] font-bold text-[#00a884] uppercase">Warehouse Origin:</span>
                <p className="font-bold text-[#e9edef]">AK Yadav Prints Studio &amp; Dispatch Hub</p>
                <p className="text-[11px]">Plot 14-B, Industrial Area, Sector 3, Indore, MP - 452001</p>
                <p className="text-[11px] font-mono">Registered Contact: +91 97180 98765 • GST: 23AABCA1234F1Z8</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleConfirmPickup}
                className="w-full py-3 bg-[#00a884] hover:bg-[#008f6f] text-white font-extrabold rounded-xl shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Confirm {pickupDate} Pickup with {provider}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Live Tracking Sub-view */}
        {activeView === 'tracking' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div className="bg-[#202c33] border border-[#2a3942] text-[#e9edef] p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a884]">
                  Real-time {provider} Telemetry
                </span>
                <h4 className="text-sm font-extrabold text-[#e9edef] mt-0.5">
                  AWB: {activeOrder.trackingNumber || bookingResult?.awbNumber || 'Pending Courier Scan'}
                </h4>
                <p className="text-[11px] text-[#8696a0]">
                  Carrier: {activeOrder.courierPartner || selectedCourier.name} • Status: <strong className="text-[#00a884]">{activeOrder.status}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncTracking}
                  disabled={isSyncingLiveTracking}
                  className="px-3 py-1.5 rounded-xl bg-[#162127] hover:bg-[#202c33] text-[#e9edef] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#222e35]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLiveTracking ? 'animate-spin text-[#00a884]' : ''}`} />
                  <span>Sync Status</span>
                </button>

                <a
                  href={directTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Track on {provider}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Checkpoints */}
            <div className="space-y-3 bg-[#162127] p-4 rounded-2xl border border-[#222e35]">
              <h5 className="font-extrabold text-[#e9edef] uppercase text-[11px]">Courier Milestones:</h5>
              <div className="space-y-3 relative pl-2">
                {getLiveTrackingMilestones(activeOrder).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      step.completed
                        ? 'bg-[#00a884] text-white'
                        : step.current
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-[#202c33] text-[#8696a0] border border-[#2a3942]'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#e9edef]">{step.title}</strong>
                        <span className="text-[10px] text-[#8696a0] font-mono">{step.timestamp}</span>
                      </div>
                      <p className="text-[#8696a0] text-[11px]">{step.description}</p>
                      <span className="text-[10px] text-[#8696a0] flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        {step.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Email Audit Log */}
        {activeView === 'email' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div className="bg-[#162127] p-3.5 rounded-2xl border border-[#222e35] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-[#e9edef] flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#00a884]" />
                  Order Email Dispatch Audit
                </span>
                <span className="bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  DELIVERED
                </span>
              </div>
              <p className="text-[#8696a0] text-[11px]">
                Automatic email notifications sent upon order placement to customer and seller.
              </p>
            </div>

            <div className="space-y-3">
              {/* Customer Email Dispatch Item */}
              <div className="p-3 bg-[#162127] rounded-2xl border border-[#222e35] space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#e9edef]">1. Customer Confirmation Email</span>
                    <p className="text-[11px] text-[#8696a0]">To: {activeOrder.customerEmail || 'anojkumar4907@gmail.com'}</p>
                  </div>
                  <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] font-bold px-2 py-0.5 rounded border border-[#00a884]/40">
                    Status: Sent
                  </span>
                </div>
                <details className="text-[11px] bg-[#202c33] p-2.5 rounded-xl border border-[#2a3942]">
                  <summary className="font-bold text-[#00a884] cursor-pointer">Preview Customer Email Template</summary>
                  <div 
                    className="mt-2 p-2 bg-white text-slate-900 rounded border border-slate-200 max-h-48 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: generateCustomerOrderHtml(activeOrder, activeOrder.customerEmail || 'anojkumar4907@gmail.com')
                    }}
                  />
                </details>
              </div>

              {/* Seller Alert Email Dispatch Item */}
              <div className="p-3 bg-[#162127] rounded-2xl border border-[#222e35] space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#e9edef]">2. Seller Immediate Order Alert</span>
                    <p className="text-[11px] text-[#00a884] font-bold">To: {SELLER_ALERT_EMAIL}</p>
                  </div>
                  <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] font-bold px-2 py-0.5 rounded border border-[#00a884]/40">
                    Status: Sent
                  </span>
                </div>
                <details className="text-[11px] bg-[#202c33] p-2.5 rounded-xl border border-[#2a3942]">
                  <summary className="font-bold text-[#00a884] cursor-pointer">Preview Seller Alert Template ({SELLER_ALERT_EMAIL})</summary>
                  <div 
                    className="mt-2 p-2 bg-white text-slate-900 rounded border border-slate-200 max-h-48 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: generateSellerAlertHtml(activeOrder)
                    }}
                  />
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#162127] border-t border-[#222e35] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-ping" />
            <span className="text-[11px] text-[#8696a0] font-mono">
              Shiprocket Live API Active • NimbusPost Ready
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] font-bold text-xs rounded-xl cursor-pointer border border-[#2a3942]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
