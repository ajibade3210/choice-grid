import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-xl text-center space-y-5">
            <div className="inline-flex p-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 mb-1">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Something went wrong
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Choice Grid encountered an unexpected error. Your saved daily logs and streaks in MongoDB remain secure.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-left overflow-x-auto">
                <code className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 block truncate">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReload}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Choice Grid</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
