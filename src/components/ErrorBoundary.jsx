import React from 'react';
import { createPageUrl } from '@/utils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      countdown: 5
    };
    this.redirectTimer = null;
    this.countdownInterval = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Filter out navigation errors in iframes (these are expected in preview)
    const isNavigationError = error.message && (
      error.message.includes('Failed to set a named property') ||
      error.message.includes('does not have permission to navigate')
    );
    
    if (isNavigationError) {
      // Don't show error boundary for navigation issues
      console.warn('[Security] Navigation blocked by iframe security - this is expected in preview mode');
      this.setState({ hasError: false });
      return;
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ 
      error, 
      errorInfo,
      countdown: 5 
    });

    // Start countdown
    this.countdownInterval = setInterval(() => {
      this.setState(prevState => {
        if (prevState.countdown <= 1) {
          clearInterval(this.countdownInterval);
          return { countdown: 0 };
        }
        return { countdown: prevState.countdown - 1 };
      });
    }, 1000);

    // Redirect to home after 5 seconds
    this.redirectTimer = setTimeout(() => {
      window.location.href = createPageUrl('Home');
    }, 5000);
  }

  componentWillUnmount() {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  handleImmediateRedirect = () => {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    window.location.href = createPageUrl('Home');
  };

  render() {
    if (this.state.hasError) {
      // Check if we're in development mode safely
      const isDevelopment = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('dev'));

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-600 mb-4">
                This page encountered an error and isn't available right now.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Don't worry! We're redirecting you to the homepage in{' '}
                  <span className="font-bold text-red-600 text-lg">{this.state.countdown}</span>{' '}
                  seconds...
                </p>
              </div>
            </div>

            <button
              onClick={this.handleImmediateRedirect}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Take Me Home Now
            </button>

            {isDevelopment && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;