import React, { useState } from 'react';
import { 
  MessageCircle, Phone, Mail, HelpCircle, ArrowLeft, Send, 
  CheckCircle2, AlertCircle, Package, Clock, ShieldCheck, 
  ChevronDown, ChevronUp, Sparkles, ExternalLink
} from 'lucide-react';
import { Order, SupportTicket } from '../types';
import { saveSupportTicketToFirestore } from '../lib/firebase';

interface SupportPageViewProps {
  orders: Order[];
  onBack: () => void;
  onOpenTrackingModal?: (order: Order) => void;
  userEmail?: string;
  userName?: string;
}

export const SupportPageView: React.FC<SupportPageViewProps> = ({
  orders,
  onBack,
  onOpenTrackingModal,
  userEmail = '',
  userName = '',
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [category, setCategory] = useState<SupportTicket['category']>('Order Status');
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const WHATSAPP_PHONE = '919893598920';

  const handleOpenWhatsApp = (customText?: string) => {
    const text = customText || 'Hello AK Selling Support, I need assistance with my order/query.';
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !description.trim()) {
      alert('Please fill in all required contact details and your complaint description.');
      return;
    }

    setIsSubmitting(true);
    const newTicketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticket: SupportTicket = {
      id: newTicketId,
      orderId: selectedOrderId || undefined,
      category,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim() || `${category} - ${selectedOrderId ? `Order ${selectedOrderId}` : 'Customer Query'}`,
      description: description.trim(),
      status: 'Open',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveSupportTicketToFirestore(ticket);
      setSubmittedTicket(ticket);
      setDescription('');
      setSubject('');
    } catch (err) {
      console.error('Failed to submit support ticket:', err);
      // Still show confirmed ticket state with local ticket ID
      setSubmittedTicket(ticket);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How do I track my active order?',
      a: 'Navigate to "My Orders" in the menu and click "Track Live" on your order card. You will see real-time BlueDart / Delhivery tracking stages and the delivery agent contact.',
    },
    {
      q: 'What is the doorstep exchange & replacement process?',
      a: 'We provide an easy 7-day doorstep size replacement. Simply submit the exchange form above or message us on WhatsApp (+91 98935 98920). Our courier partner will pick up the item and deliver your replacement.',
    },
    {
      q: 'What should I do if I received a damaged or incorrect item?',
      a: 'Select "Damaged Item" in the form above and include photos or details. Our priority escalation team will initiate an instant re-dispatch or full refund to your original payment method.',
    },
    {
      q: 'How long do refunds take to reflect in my bank account?',
      a: 'UPI and Card refunds processed via Razorpay reflect within 2 to 4 hours. Net banking refunds may take up to 24 to 48 business hours.',
    },
    {
      q: 'Are all T-Shirts genuine 240+ GSM French Terry Cotton?',
      a: 'Yes! Every AKSelling t-shirt is made from 100% Super-Combed French Terry Cotton with bio-wash treatment and crack-resistant high-density screenprints.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 pb-24 space-y-6" id="buyer-support-page">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0A3A1E] transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100"
          id="btn-back-to-store"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-800">Support Desk Online</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A3A1E] to-[#145a32] text-white rounded-2xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="bg-[#FFC107] text-[#0A3A1E] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
            Customer Help Center
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Submit order complaints, request size replacements, or chat directly with our customer desk. We resolve all inquiries within 2 hours.
          </p>
        </div>

        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3 Instant Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* WhatsApp Channel */}
        <div
          onClick={() => handleOpenWhatsApp()}
          className="bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-sm group flex flex-col justify-between"
          id="channel-whatsapp"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Live Desk</h3>
              <p className="text-xs text-slate-600 mt-0.5">+91 98935 98920</p>
            </div>
          </div>
          <div className="pt-3 border-t border-emerald-200/60 mt-3 flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Instant Chat</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Direct Call Channel */}
        <a
          href="tel:+919893598920"
          className="bg-blue-50/70 border border-blue-200 hover:border-blue-400 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-sm group flex flex-col justify-between"
          id="channel-phone"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#2874F0] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Phone Assistance</h3>
              <p className="text-xs text-slate-600 mt-0.5">Mon-Sat, 9am - 8pm IST</p>
            </div>
          </div>
          <div className="pt-3 border-t border-blue-200/60 mt-3 flex items-center justify-between text-xs font-bold text-blue-800">
            <span>Call +91 98935 98920</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        {/* Email Channel */}
        <a
          href="mailto:akyadavprintaksellig@gmail.com?subject=AK%20Selling%20Customer%20Support"
          className="bg-amber-50/70 border border-amber-200 hover:border-amber-400 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-sm group flex flex-col justify-between"
          id="channel-email"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Email Helpdesk</h3>
              <p className="text-xs text-slate-600 mt-0.5 truncate">akyadavprintaksellig@gmail.com</p>
            </div>
          </div>
          <div className="pt-3 border-t border-amber-200/60 mt-3 flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Write Email</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>
      </div>

      {/* Ticket Success Confirmation */}
      {submittedTicket && (
        <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950">
                Support Ticket Submitted Successfully!
              </h3>
              <p className="text-xs text-emerald-800">
                Ticket Reference: <span className="font-mono font-bold">{submittedTicket.id}</span>
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
            Thank you, <span className="font-bold">{submittedTicket.name}</span>. Our customer resolution team has logged your complaint and will update you via email (<span className="font-bold">{submittedTicket.email}</span>) and WhatsApp within 2 hours.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => handleOpenWhatsApp(`Regarding Support Ticket ${submittedTicket.id}: `)}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Follow up on WhatsApp</span>
            </button>
            <button
              onClick={() => setSubmittedTicket(null)}
              className="bg-white border border-emerald-300 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Submit Another Query
            </button>
          </div>
        </div>
      )}

      {/* Main Support Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0A3A1E]" />
            <span>Submit a Support Request</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly for customer orders, tracking assistance, and product queries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Inquiry Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0A3A1E]"
                id="support-select-category"
              >
                <option value="Order Status">Order Status &amp; Delivery Delay</option>
                <option value="Size Exchange">Size Exchange / Replacement</option>
                <option value="Damaged Item">Damaged / Defective Item Received</option>
                <option value="Refund/Cancellation">Return &amp; Refund Request</option>
                <option value="Payment Issue">Payment / Razorpay Transaction Issue</option>
                <option value="General Query">General Product / Fabric Inquiry</option>
              </select>
            </div>

            {/* Link to Existing Order */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Related Order (Optional)
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0A3A1E]"
                id="support-select-order"
              >
                <option value="">-- No specific order / General Query --</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} • ₹{o.totalAmount} ({o.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0A3A1E]"
                id="support-input-name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0A3A1E]"
                id="support-input-email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0A3A1E]"
                id="support-input-phone"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your inquiry (e.g. Need XL size exchange for Order OD-8912)"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0A3A1E]"
              id="support-input-subject"
            />
          </div>

          {/* Detailed Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Describe your issue or request *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide full details so we can resolve your issue immediately..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0A3A1E] resize-none"
              id="support-input-description"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct ticket sync to Google Cloud Firestore</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0A3A1E] hover:bg-[#052610] text-[#FFC107] font-black text-xs py-3 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="btn-submit-support-ticket"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Customer FAQs Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, index) => {
            const isOpen = activeFaqIndex === index;
            return (
              <div key={index} className="py-2.5">
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-[#0A3A1E] transition-colors py-1"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-1 animate-fadeIn">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
