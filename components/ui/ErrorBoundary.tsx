"use client";

import { Component, ReactNode } from "react";

type Props = {
  /** Rendered when the boundary catches. Falls back to a minimal message. */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Optional side-effect for logging/telemetry. */
  onError?: (error: Error, info: { componentStack?: string | null }) => void;
  children: ReactNode;
};

type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (typeof this.props.fallback === "function") {
      return this.props.fallback(error, this.reset);
    }
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-medium">Something went wrong loading this section.</p>
        <p className="mt-1 text-red-700/80">{error.message}</p>
        <button
          type="button"
          onClick={this.reset}
          className="mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }
}
