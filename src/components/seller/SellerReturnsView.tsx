import React, { useState, useMemo } from 'react';
import { ReturnRecord, ClaimRecord } from '../../types';
import { 
  RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2, Search,
  Filter, Plus, ExternalLink, FileText, ChevronRight, Clock,
  Truck, ArrowUpRight, DollarSign, Eye, AlertCircle, X
} from 'lucide-react';

interface SellerReturnsViewProps {
  returns: ReturnRecord[];
  claims: ClaimRecord[];
  onRaiseClaim: (claim: Partial<ClaimRecord>) => void;
  onRefresh?: () => void;
}

export const SellerReturnsView: React.FC<SellerReturnsViewProps> = ({
  returns,
  claims,
  onRaiseClaim,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'All' | 'Customer Return' | 'Courier RTO' | 'Claims'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturnForClaim, setSelectedReturnForClaim] = useState<ReturnRecord | null>(null);
  const [claimReason, setClaimReason] = useState('Wrong item returned by customer (Fraudulent Return)');
  const [claimAmountInput, setClaimAmountInput] = useState('699');
  const [claimNotesInput, setClaimNotesInput] = useState('');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Performance Metrics (Pure real-time computations)
  const totalReturnsCount = returns.length;
  const customerReturns = returns.filter((r) => r.returnType === 'Customer Return').length;
  const courierRtos = returns.filter((r) => r.returnType === 'Courier RTO').length;
  const customerReturnRate = totalReturnsCount > 0 ? Number(((customerReturns / totalReturnsCount) * 100).toFixed(1)) : 0;
  const courierRtoRate = totalReturnsCount > 0 ? Number(((courierRtos / totalReturnsCount) * 100).toFixed(1)) : 0;
  const inTransitReturnsCount = returns.filter((r) => r.status === 'In Transit' || r.status === 'Out for Delivery').length;
  const totalApprovedClaimsAmount = claims
    .filter((c) => c.status === 'Approved')
    .reduce((sum, c) => sum + c.claimAmount, 0);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      let matchesTab = true;
      if (activeSubTab === 'Customer Return') {
        matchesTab = r.returnType === 'Customer Return';
      } else if (activeSubTab === 'Courier RTO') {
        matchesTab = r.returnType === 'Courier RTO';
      } else if (activeSubTab === 'Claims') {
        matchesTab = r.status === 'Claim Raised' || r.status === 'Claim Approved' || r.status === 'Claim Rejected';
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchesSearch =
          r.id.toLowerCase().includes(q) ||
          r.orderId.toLowerCase().includes(q) ||
          r.productTitle.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.awbNumber.toLowerCase().includes(q);
      }

      return matchesTab && matchesSearch;
    });
  }, [returns, activeSubTab, searchQuery]);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnForClaim) return;

    onRaiseClaim({
      returnId: selectedReturnForClaim.id,
      sku: selectedReturnForClaim.sku,
      productTitle: selectedReturnForClaim.productTitle,
      reason: claimReason,
      claimAmount: Number(claimAmountInput) || selectedReturnForClaim.refundAmount,
      status: 'Pending',
      awbNumber: selectedReturnForClaim.awbNumber,
      notes: claimNotesInput || 'Unboxing parcel video proof submitted.',
    });

    setIsClaimModalOpen(false);
    setSelectedReturnForClaim(null);
    setClaimNotesInput('');
  };

  return (
    <div id="seller-returns-view" className="space-y-4 pb-24 px-3 sm:px-4 max-w-7xl mx-auto pt-3">
      {/* 1. RETURN & RTO METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Customer Return Rate */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-600">Customer Return Rate</span>
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {customerReturnRate}%
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              Healthy &lt;6%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Returns due to size/quality</p>
        </div>

        {/* Metric 2: Courier RTO Rate */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-600">Courier RTO Rate</span>
            <Truck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {courierRtoRate}%
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              Low RTO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Undelivered consignee parcels</p>
        </div>

        {/* Metric 3: Total Returns In Transit */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-600">Returns in Transit</span>
            <Clock className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-purple-700 tracking-tight">
              {inTransitReturnsCount}
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
              Active Hubs
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Returning to warehouse</p>
        </div>

        {/* Metric 4: Approved Claims */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold text-slate-600">Claims Compensation</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFC107]" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              ₹{totalApprovedClaimsAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              100% Protected
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Reimbursed for damaged returns</p>
        </div>
      </div>

      {/* 2. SEARCH & SUB-TABS (All, Customer Returns, Courier RTO, Claims) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="returns-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search return by SKU, Order ID, AWB number, or Customer..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3A1E] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: 'All' as const, label: 'All Returns', count: returns.length },
            {
              id: 'Customer Return' as const,
              label: 'Customer Returns',
              count: returns.filter((r) => r.returnType === 'Customer Return').length,
            },
            {
              id: 'Courier RTO' as const,
              label: 'Courier RTO',
              count: returns.filter((r) => r.returnType === 'Courier RTO').length,
            },
            {
              id: 'Claims' as const,
              label: 'Claims & Disputes',
              count: claims.length,
            },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`return-tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0A3A1E] text-[#FFC107] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CLAIMS LIST VIEW (When 'Claims' Tab Selected) */}
      {activeSubTab === 'Claims' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Supplier Compensation Claims Desk ({claims.length})
            </h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Zero Supplier Loss Guarantee
            </span>
          </div>

          <div className="space-y-2.5">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 font-mono">
                      {claim.id}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      AWB: {claim.awbNumber}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      claim.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : claim.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Claim {claim.status}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-900">{claim.productTitle}</h5>
                  <p className="text-xs text-rose-700 font-semibold mt-0.5">
                    Reason: {claim.reason}
                  </p>
                  {claim.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {claim.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500">
                    Raised Date: <strong className="text-slate-700 font-bold">{claim.raisedDate}</strong>
                  </span>
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px]">Reimbursement: </span>
                    <strong className="text-emerald-700 font-extrabold text-sm">
                      ₹{claim.claimAmount}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 4. RETURNS LIST STREAM */
        <div className="space-y-3">
          {filteredReturns.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
              <RotateCcw className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No returns found in this section</h4>
              <p className="text-xs text-slate-500">Great job! Your return rate is well below industry limits.</p>
            </div>
          ) : (
            filteredReturns.map((ret) => {
              const isClaimRaised = ret.status === 'Claim Raised' || ret.status === 'Claim Approved';

              return (
                <div
                  key={ret.id}
                  id={`return-card-${ret.id}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden hover:border-emerald-400 transition-all"
                >
                  {/* Top strip */}
                  <div className="bg-slate-50/90 px-4 py-2 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 font-mono">{ret.id}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 text-[11px]">Sub-Order: {ret.subOrderId}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ret.returnType === 'Customer Return'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ret.returnType}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={ret.productImage}
                        alt={ret.productTitle}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {ret.productTitle}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <span className="font-mono">SKU: {ret.sku}</span>
                          <span>•</span>
                          <span>Size: {ret.size}</span>
                          <span>•</span>
                          <span>Qty: {ret.quantity}</span>
                        </div>
                        <p className="text-xs text-rose-700 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{ret.reason}</span>
                        </p>
                      </div>
                    </div>

                    {/* Tracking details bar */}
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div>
                        <span className="text-slate-500">Customer: </span>
                        <strong className="text-slate-900">{ret.customerName}</strong> ({ret.customerCity})
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>{ret.courierPartner}</span>
                        <span>•</span>
                        <span>AWB: {ret.awbNumber}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-slate-500 text-[11px]">Value: </span>
                        <strong className="text-slate-900 font-bold text-xs">
                          ₹{ret.refundAmount}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isClaimRaised ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReturnForClaim(ret);
                              setClaimAmountInput(String(ret.refundAmount));
                              setIsClaimModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Raise Wrong Return Claim</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Claim Under Review</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. CLAIM FILING MODAL */}
      {isClaimModalOpen && selectedReturnForClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0A3A1E] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FFC107]" />
                <h3 className="text-sm font-extrabold">File Wrong Return Compensation Claim</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">{selectedReturnForClaim.productTitle}</p>
                <p className="text-slate-500 font-mono">
                  Return ID: {selectedReturnForClaim.id} • SKU: {selectedReturnForClaim.sku} • AWB: {selectedReturnForClaim.awbNumber}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Claim Dispute Reason</label>
                <select
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0A3A1E]"
                >
                  <option value="Wrong item returned by customer (Fraudulent Return)">Wrong item returned by customer (Fraudulent Return)</option>
                  <option value="Used / Worn / Stained garment returned">Used / Worn / Stained garment returned</option>
                  <option value="Item missing inside return package (Empty Box)">Item missing inside return package (Empty Box)</option>
                  <option value="Courier Transit Damaged (Torn & stained garment)">Courier Transit Damaged (Torn & stained garment)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Claim Compensation Amount (₹)</label>
                <input
                  type="number"
                  value={claimAmountInput}
                  onChange={(e) => setClaimAmountInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0A3A1E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Unboxing Proof Details &amp; Video Link</label>
                <textarea
                  rows={3}
                  value={claimNotesInput}
                  onChange={(e) => setClaimNotesInput(e.target.value)}
                  placeholder="Provide details of unboxing video showing shipping label and wrong item received..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-[#0A3A1E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#052610]" />
                  <span>Submit Claim for Reimbursement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
