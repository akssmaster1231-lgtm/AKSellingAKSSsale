import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShoppingBag } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          id="error-boundary-fallback" 
          className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Temporary Sync Notice
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                A component encountered a network or render hiccup. Your offline Firestore cache has preserved all products, orders, and storefront settings safely.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-xl text-left overflow-x-auto text-[11px] font-mono text-slate-700 max-h-24">
                {this.state.error.message || 'Unknown network error'}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="error-boundary-retry-btn"
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#0A3A1E] hover:bg-[#052610] text-white font-black text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FFC107]" />
                <span>Reload & Sync</span>
              </button>

              <button
                id="error-boundary-home-btn"
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.href = '/';
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                <span>Storefront</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
