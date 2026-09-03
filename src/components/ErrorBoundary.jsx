import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-[#101828]">
          <div className="bg-white max-w-lg w-full rounded-[22px] border border-red-100 p-8 shadow-anvay-card text-center space-y-5">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-[#101828]">Something went wrong</h2>
              <p className="text-xs text-[#667085]">
                An unexpected interface error occurred while rendering this page.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px] text-[11px] font-mono text-left text-slate-700 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white text-xs font-bold rounded-[9px] transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>
              <a
                href="/"
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-[9px] transition flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
