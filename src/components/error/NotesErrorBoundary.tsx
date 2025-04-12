'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class NotesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8 px-4">
          <h3 className="text-lg font-medium text-text mb-2">
            Something went wrong displaying the notes
          </h3>
          <p className="text-sm text-text-muted">
            Please try refreshing the page or selecting a different subject
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}