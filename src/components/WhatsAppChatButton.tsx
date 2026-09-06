import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Phone, ExternalLink, ShieldCheck, 
  Sparkles, CheckCircle2, ChevronRight, Package, Clock, 
  HelpCircle, RefreshCw, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { Order, InAppChatMessage, InAppChatSession } from '../types';
import { saveInAppChatMessageToFirestore, fetchInAppChatSession } from '../lib/firebase';

interface WhatsAppChatButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
  orders?: Order[];
  userName?: string;
  userEmail?: string;
  onOpenTrackingModal?: (order: Order) => void;
  onOpenSupportPage?: () => void;
}

const QUICK_PROMPTS = [
  { id: 'track', label: '📦 Track My Order', query: 'I want to track my latest order status and delivery date.' },
  { id: 'cod', label: '⚡ 20% COD Advance Help', query: 'How does the 20% COD advance token payment work?' },
  { id: 'dispatch', label: '🚚 Delivery & Dispatch Time', query: 'When will my order be dispatched and delivered?' },
  { id: 'size', label: '📏 Size & Fit Guide', query: 'What is the fabric GSM and sizing guide for oversized tees?' },
  { id: 'call', label: '📞 Talk to Human Agent', query: 'Can I speak directly with AKSelling support executive?' },
];

export const WhatsAppChatButton: React.FC<WhatsAppChatButtonProps> = ({
  phoneNumber = '919893598920',
  defaultMessage = 'Hello AK Selling, I need help with an order / product inquiry.',
  orders = [],
  userName = 'Customer',
  userEmail = '',
  onOpenTrackingModal,
  onOpenSupportPage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persistent Session ID for guest or logged-in user
  const [sessionId] = useState<string>(() => {
    const existing = localStorage.getItem('akselling_chat_session_id');
    if (existing) return existing;
    const newId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('akselling_chat_session_id', newId);
    return newId;
  });

  // Initial welcome message
  const [messages, setMessages] = useState<InAppChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'support',
      text: 'Namaste! Welcome to AKSelling Official Live Support. How can we assist you today?',
      timestamp: 'Just now',
    },
    {
      id: 'welcome-2',
      sender: 'support',
      text: 'You can track active BlueDart orders, verify 20% COD advance policies, or ask about size & fabric specs below.',
      timestamp: 'Just now',
    },
  ]);

  // Load any previously persisted chat messages from Firestore / LocalStorage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const remoteSession = await fetchInAppChatSession(sessionId);
        if (remoteSession && Array.isArray(remoteSession.messages) && remoteSession.messages.length > 0) {
          setMessages(remoteSession.messages);
        } else {
          const localSaved = localStorage.getItem(`akselling_chat_msgs_${sessionId}`);
          if (localSaved) {
            setMessages(JSON.parse(localSaved));
          }
        }
      } catch (err) {
        console.warn('Notice loading support chat history:', err);
      }
    };
    loadSession();
  }, [sessionId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Handle external WhatsApp fallback option
  const handleOpenExternalWhatsApp = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Generate automated smart responses based on user query
  const generateSupportResponse = (userText: string): InAppChatMessage => {
    const lower = userText.toLowerCase();
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (lower.includes('track') || lower.includes('order') || lower.includes('status') || lower.includes('where is my')) {
      const latestOrder = orders.length > 0 ? orders[0] : null;
      if (latestOrder) {
        return {
          id: `resp-${Date.now()}`,
          sender: 'support',
          text: `Found your latest order #${latestOrder.id}! Status: "${latestOrder.status}" with estimated delivery: ${latestOrder.estimatedDelivery || 'In 3-5 business days'}.`,
          timestamp: timeStr,
          orderId: latestOrder.id,
          actionButton: onOpenTrackingModal ? {
            label: 'View Live BlueDart Tracking',
            actionType: 'track_order',
            data: latestOrder,
          } : undefined,
        };
      }
      return {
        id: `resp-${Date.now()}`,
        sender: 'support',
        text: 'To track your shipment, you can check the "Orders" tab in your account or enter your Order ID / AWB number here. Our express logistics partner BlueDart delivers in 3-5 business days.',
        timestamp: timeStr,
      };
    }

    if (lower.includes('cod') || lower.includes('advance') || lower.includes('20%') || lower.includes('token')) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'support',
        text: 'Under AKSelling anti-RTO policy, paying a 20% advance token via UPI/Cards reserves your parcel for priority BlueDart dispatch. The remaining 80% balance is collected in cash upon doorstep delivery.',
        timestamp: timeStr,
      };
    }

    if (lower.includes('size') || lower.includes('fit') || lower.includes('gsm') || lower.includes('fabric')) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'support',
        text: 'All AKSelling tees are crafted with 240+ GSM Heavyweight Combed Cotton with a drop-shoulder boxy fit. If you prefer a regular tailored fit, order true to size. For an oversized streetwear aesthetic, order one size up.',
        timestamp: timeStr,
      };
    }

    if (lower.includes('delivery') || lower.includes('dispatch') || lower.includes('time') || lower.includes('courier')) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'support',
        text: 'All orders are quality-checked and dispatched within 24-48 hours via BlueDart Air Express or Delhivery. Standard transit time is 3-5 business days with live SMS and WhatsApp tracking updates.',
        timestamp: timeStr,
      };
    }

    if (lower.includes('call') || lower.includes('agent') || lower.includes('human') || lower.includes('phone') || lower.includes('contact')) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'support',
        text: 'You can connect directly with our founder Anoj Kumar & support team at +91 9893598920 (Operating hours: 9:00 AM – 9:00 PM IST, Monday to Sunday).',
        timestamp: timeStr,
        actionButton: {
          label: 'Call +91 9893598920 Now',
          actionType: 'call_support',
        },
      };
    }

    // Default polite acknowledgement
    return {
      id: `resp-${Date.now()}`,
      sender: 'support',
      text: 'Thank you for messaging AKSelling support! Your inquiry has been logged with our team. An agent will assist you immediately, or you can call +91 9893598920 for urgent inquiries.',
      timestamp: timeStr,
    };
  };

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: InAppChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    localStorage.setItem(`akselling_chat_msgs_${sessionId}`, JSON.stringify(newMessages));

    // Save user message to Firestore
    saveInAppChatMessageToFirestore(sessionId, userMsg, {
      userName,
      userPhone: phoneNumber,
      userEmail,
    }).catch((e) => console.warn('Chat user message sync:', e));

    // Simulate real-time assistant response
    setIsTyping(true);
    setTimeout(() => {
      const responseMsg = generateSupportResponse(text);
      setMessages((prev) => {
        const updated = [...prev, responseMsg];
        localStorage.setItem(`akselling_chat_msgs_${sessionId}`, JSON.stringify(updated));
        return updated;
      });
      setIsTyping(false);

      // Save support response to Firestore
      saveInAppChatMessageToFirestore(sessionId, responseMsg, {
        userName,
        userPhone: phoneNumber,
        userEmail,
      }).catch((e) => console.warn('Chat response sync:', e));
    }, 700);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* 1. FLOATING ACTION TRIGGER BUTTON */}
      <div
        className="fixed bottom-20 md:bottom-8 right-4 md:right-7 z-40 flex items-center gap-2 select-none"
        id="floating-whatsapp-chat-widget"
      >
        {/* Floating Tooltip Pill */}
        {showTooltip && !isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-[#0A3A1E] text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-2xl border border-[#FFC107]/40 cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <span className="w-2 h-2 rounded-full bg-[#FFC107] animate-ping" />
            <span className="text-[#FFC107]">Need Help?</span>
            <span>Live Chat Support</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-white ml-1 p-0.5"
              aria-label="Close message"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative group w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#FFC107]/40 ${
            isOpen 
              ? 'bg-rose-600 hover:bg-rose-700 text-white' 
              : 'bg-[#25D366] hover:bg-[#20bd5a] text-white'
          }`}
          title="AKSelling In-App Live Support"
          aria-label="Open In-App Support Chat"
          id="btn-whatsapp-floating"
        >
          {isOpen ? (
            <X className="w-6 h-6 animate-in spin-in-90 duration-200" />
          ) : (
            <>
              {/* Pulse Ripple Rings */}
              <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping -z-10" />
              
              {/* WhatsApp Vector Icon */}
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm"
                viewBox="0 0 24 24"
              >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.186 8.186 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z" />
              </svg>

              {/* Live Support Indicator Dot */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#052610] rounded-full" />
            </>
          )}
        </button>
      </div>

      {/* 2. EMBEDDED IN-APP LIVE CHAT MODAL / POPUP (ZERO REDIRECTION) */}
      {isOpen && (
        <div
          className="fixed bottom-24 md:bottom-24 right-3 md:right-7 z-50 w-[calc(100vw-24px)] sm:w-[390px] h-[540px] max-h-[calc(100vh-120px)] bg-[#072413] border border-[#FFC107]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 selection:bg-[#FFC107] selection:text-[#052610]"
          id="in-app-live-chat-window"
        >
          {/* A. Royal Dark Forest Green & Gold Header */}
          <div className="bg-gradient-to-r from-[#0A3A1E] via-[#0D4B27] to-[#0A3A1E] p-4 border-b border-[#FFC107]/30 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#FFA000] text-[#052610] font-black flex items-center justify-center text-sm shadow-md">
                  AK
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0A3A1E] rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white tracking-wide">AKSelling Live Support</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFC107]" />
                </div>
                <p className="text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Direct Desk: +91 9893598920
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Optional WhatsApp App Launcher Tooltip */}
              <button
                onClick={handleOpenExternalWhatsApp}
                title="Open WhatsApp App"
                aria-label="Switch to external WhatsApp"
                className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800/40 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              {/* Close In-App Chat */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close Support Desk"
                aria-label="Close Chat"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* B. Live Notice Sub-Banner */}
          <div className="bg-[#051c0d] px-3.5 py-1.5 border-b border-emerald-950 flex items-center justify-between text-[10px] text-slate-300 shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#FFC107]" />
              Replies typically in under 2 minutes
            </span>
            <a 
              href="tel:+919893598920" 
              className="text-[#FFC107] font-semibold hover:underline flex items-center gap-1"
            >
              <Phone className="w-2.5 h-2.5" />
              +91 9893598920
            </a>
          </div>

          {/* C. Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#051e0e]/95">
            {/* Encryption & Security Pill */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[10px] text-emerald-300 font-medium">
                🔒 256-bit SSL In-App Live Support Session
              </span>
            </div>

            {/* Message Bubbles */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} text-xs`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                      : 'bg-[#0A3A1E] text-slate-100 border border-[#FFC107]/20 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Action Button inside message if available */}
                  {msg.actionButton && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      {msg.actionButton.actionType === 'track_order' && msg.actionButton.data && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            if (onOpenTrackingModal) {
                              onOpenTrackingModal(msg.actionButton.data);
                            }
                          }}
                          className="w-full bg-[#FFC107] hover:bg-[#ffca28] text-[#052610] font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[11px] shadow-sm transition-all"
                        >
                          <Package className="w-3.5 h-3.5" />
                          {msg.actionButton.label}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      {msg.actionButton.actionType === 'call_support' && (
                        <a
                          href="tel:+919893598920"
                          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[11px] shadow-sm transition-all text-center"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Support Executive
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Live Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-[#0A3A1E] border border-[#FFC107]/20 text-slate-300 rounded-2xl rounded-tl-none px-3 py-2 w-20 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107] animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* D. Quick Action Questions Pills */}
          <div className="p-2.5 bg-[#072413] border-t border-emerald-950 overflow-x-auto shrink-0 flex items-center gap-1.5 no-scrollbar">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handleSendMessage(prompt.query)}
                className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full bg-[#0A3A1E] hover:bg-[#0f4d29] border border-emerald-800 text-[10px] text-emerald-200 font-medium hover:border-[#FFC107]/50 transition-all"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* E. In-App Live Text Input Bar */}
          <div className="p-3 bg-[#051c0d] border-t border-[#FFC107]/20 flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about orders, delivery, sizing..."
              className="flex-1 bg-[#0A3A1E] text-white text-xs px-3.5 py-2.5 rounded-2xl border border-emerald-800 focus:outline-none focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] placeholder:text-slate-400"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                inputText.trim()
                  ? 'bg-[#FFC107] hover:bg-[#ffca28] text-[#052610] shadow-md cursor-pointer active:scale-95'
                  : 'bg-emerald-950 text-emerald-800 cursor-not-allowed'
              }`}
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
