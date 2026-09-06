import React from 'react';
import { Order, SellerPickupAddress } from '../../types';
import { 
  X, Printer, Download, ShieldCheck, Truck, 
  QrCode, CheckCircle2, MapPin, Building
} from 'lucide-react';
import { INITIAL_SELLER_PICKUP_ADDRESS } from '../../data/mockData';

interface WaybillModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  sellerPickup?: SellerPickupAddress;
}

export const WaybillModal: React.FC<WaybillModalProps> = ({
  order,
  isOpen,
  onClose,
  sellerPickup = INITIAL_SELLER_PICKUP_ADDRESS,
}) => {
  if (!isOpen || !order) return null;

  const firstItem = order.items[0];
  const awbNumber = order.trackingNumber || 'BD-982348102IN';
  const pickup = order.pickupAddressDetails || sellerPickup;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0A3A1E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#FFC107]" />
            <div>
              <h3 className="text-sm font-extrabold">Shipping Label &amp; Courier Manifest</h3>
              <p className="text-[10px] text-[#FFC107]">Official BlueDart / Delhivery Standard Format</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Canvas */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto bg-slate-100">
          <div
            id="printable-shipping-label"
            className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-400 space-y-3 text-xs text-slate-900 font-sans shadow-sm"
          >
            {/* Top Bar: Courier & Mode */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-[#0A3A1E] tracking-tight">
                  BLUEDART EXPRESS
                </span>
                <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  AIR PRIORITY
                </span>
              </div>
              <span className="font-black text-xs sm:text-sm text-slate-800 uppercase">
                {order.isPartialAdvanceCod
                  ? `COD : COLLECT ₹${order.balanceDueOnDelivery ?? (order.totalAmount - (order.advancePaidAmount ?? 0))} (₹${order.advancePaidAmount} ADV PAID)`
                  : order.paymentMethod?.includes('COD')
                  ? 'COD : COLLECT ₹' + order.totalAmount
                  : 'PREPAID / ZERO-COLLECT'}
              </span>
            </div>

            {/* AWB & Barcode Mock */}
            <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-mono text-base font-black tracking-widest">{awbNumber}</span>
              {/* CSS Barcode lines */}
              <div className="flex justify-center items-center gap-0.5 h-10 px-4">
                {[2, 4, 1, 3, 5, 2, 1, 4, 2, 3, 1, 4, 5, 2, 3, 1, 4, 2, 5, 3, 1, 4, 2, 3, 5, 2].map((w, i) => (
                  <div
                    key={i}
                    style={{ width: `${w}px` }}
                    className="h-full bg-slate-950"
                  />
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-500">Order ID: {order.id}</p>
            </div>

            {/* Ship To Consignee */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">SHIP TO (CONSIGNEE):</p>
              <p className="font-extrabold text-slate-900 text-sm">
                {order.addressObj?.name || 'Anoj Yadav'}
              </p>
              <p className="text-slate-700 leading-snug">
                {order.address || 'Plot 42, Sector 18, Udyog Vihar, Gurugram, Haryana'}
              </p>
              <p className="font-bold text-slate-900">
                Phone: {order.addressObj?.phone || '+91 98765 43210'}
              </p>
            </div>

            {/* Product & SKU Details */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">ITEM MANIFEST:</p>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{firstItem?.product?.title}</p>
                  <p className="text-slate-600 font-mono text-[11px]">
                    SKU: {firstItem?.product?.id} • Size: {firstItem?.selectedSize || 'L'} • Qty: {firstItem?.quantity || 1}
                  </p>
                </div>
                <span className="font-black text-slate-900">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Return / Sold By (Seller Pickup Hub) */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-800">RETURN / SOLD BY (DISPATCH HUB):</p>
              <p className="font-bold text-slate-900">{pickup.storeName || 'AKSelling Apparel Studio (Indore Hub)'}</p>
              <p>{pickup.houseOrBuilding}, {pickup.streetArea}, {pickup.landmark ? `Near ${pickup.landmark}, ` : ''}{pickup.city}, {pickup.state} - {pickup.pincode}</p>
              <p className="font-mono">Contact: {pickup.contactPerson} ({pickup.phone}) • GSTIN: 23AABCA1234F1Z8</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#052610]" />
              <span>Print Label (A4/Thermal)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
