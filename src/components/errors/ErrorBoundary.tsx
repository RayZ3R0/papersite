'use client';

import React from 'react';
import { captureError } from '@/lib/errorUtils';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    componentStack: string;
    deviceInfo: {
      userAgent: string;
      platform: string;
      vendor: string;
    };
  } | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capture device information
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor
    };

    // Set error state with device info
    this.setState({
      errorInfo: {
        componentStack: errorInfo.componentStack,
        deviceInfo
      }
    });

    // Report error to server
    captureError({
      error,
      componentStack: errorInfo.componentStack,
      deviceInfo,
      location: window.location.toString(),
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20">
          <h2 className="text-lg font-semibold text-error mb-2">
            Something went wrong
          </h2>
          <div className="text-sm text-error/80 space-y-1">
            <p>We encountered an error while displaying this content.</p>
            <p>Our team has been notified and is working to fix the issue.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Try reloading
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}