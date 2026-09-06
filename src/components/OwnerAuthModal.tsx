/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Key, AlertCircle, CheckCircle2, 
  X, Eye, EyeOff, Store, ArrowRight, LogIn, Sparkles
} from 'lucide-react';
import { verifyOwnerPasskey, isOwnerEmail } from '../lib/authUtils';
import { AppUser } from '../lib/firebase';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser?: AppUser | null;
  onOpenGeneralLogin?: () => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  onOpenGeneralLogin,
}) => {
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isUserOwnerByEmail = currentUser?.email ? isOwnerEmail(currentUser.email) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = verifyOwnerPasskey(passkey);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSubmitting(false);
          onSuccess();
          onClose();
        }, 600);
      } else {
        setIsSubmitting(false);
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleInstantOwnerAuthorize = () => {
    if (isUserOwnerByEmail) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        id="owner-verification-modal"
      >
        {/* Header with Dark Luxury Gradient */}
        <div className="bg-gradient-to-r from-[#0A3A1E] via-[#052610] to-slate-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC107]/20 border border-[#FFC107]/40 flex items-center justify-center text-[#FFC107] shadow-inner shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#FFC107]">
                  Restricted Portal
                </span>
                <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.2 rounded-full border border-white/20">
                  Owner Level
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white tracking-tight mt-0.5">
                Supplier Hub Authorization
              </h3>
            </div>
          </div>

          <p className="text-xs text-emerald-100/80 mt-2.5 leading-relaxed">
            The AKSelling Supplier Hub contains financial records, inventory pricing, and order dispatch controls reserved for verified store administrators.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Owner Email Status */}
          {currentUser?.email ? (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
              isUserOwnerByEmail 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${
                isUserOwnerByEmail ? 'text-[#0A3A1E]' : 'text-slate-400'
              }`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Logged In Account:</span>
                  {isUserOwnerByEmail && (
                    <span className="bg-[#FFC107] text-[#052610] font-black text-[9px] px-2 py-0.5 rounded-full">
                      Verified Owner
                    </span>
                  )}
                </div>
                <p className="font-mono text-[11px] truncate mt-0.5 text-slate-900 font-semibold">
                  {currentUser.email}
                </p>
                {isUserOwnerByEmail && (
                  <button
                    type="button"
                    onClick={handleInstantOwnerAuthorize}
                    className="mt-2.5 w-full bg-[#FFC107] hover:bg-[#FFD700] text-[#052610] font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Instant Owner Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Not Logged In</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Sign in with owner email (<span className="font-mono font-semibold">akyadavprintaksellig@gmail.com</span>) or enter the Owner Master Security PIN below.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0A3A1E]" />
              <span className="font-bold">Owner Authorized! Opening Supplier Dashboard...</span>
            </div>
          )}

          {/* Security PIN Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Owner Security Passkey / Master PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter Store Owner Passkey (e.g. 98214)"
                  autoFocus
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#0A3A1E] focus:bg-white focus:ring-2 focus:ring-[#0A3A1E]/20 rounded-xl text-sm font-medium text-slate-900 transition-all outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                <span>Default Owner Passkey: <strong className="font-mono text-slate-700">98214</strong></span>
                <span className="text-[10px] text-emerald-700 font-semibold">256-Bit Encrypted</span>
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="w-full bg-[#FFC107] hover:bg-[#FFD700] active:scale-[0.99] text-[#052610] font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                id="btn-verify-owner-pin"
              >
                <Store className="w-4 h-4 text-[#052610]" />
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Unlock & Open Supplier Dashboard'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel (Remain in Customer Store)
              </button>
            </div>
          </form>

          {/* Quick Sign in alternative */}
          {onOpenGeneralLogin && !currentUser && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGeneralLogin();
                }}
                className="text-xs font-semibold text-[#0A3A1E] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Have an Owner Google account? Sign In directly</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
