import React from "react";

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ERROR BOUNDARY CATCH]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.hash = "";
      window.location.pathname = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-stone-900 border border-stone-800 rounded-xl p-8 shadow-2xl text-center space-y-6">
            {/* Visual Icon */}
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-serif tracking-tight text-stone-100">
                {this.props.fallbackTitle || "Une interruption est survenue"}
              </h1>
              <p className="text-sm text-stone-400 max-w-md mx-auto">
                Le module de lecture ou l'interface a rencontré une erreur inattendue. L'application est restée sécurisée et isolée.
              </p>
            </div>

            {/* Error Details */}
            {this.state.error && (
              <div className="bg-black/50 border border-stone-800/80 rounded-lg p-4 text-left font-mono text-xs text-red-400 overflow-x-auto max-h-40">
                <p className="font-bold mb-1">Erreur : {this.state.error.toString()}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium text-sm rounded transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer"
              >
                Réinitialiser l'application
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm rounded transition-all cursor-pointer border border-stone-700"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
