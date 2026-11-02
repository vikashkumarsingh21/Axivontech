"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary wrapping the Daily Download Popup.
 * Ensures that any unexpected failure in popup rendering can NEVER break a portal page.
 */
export class DownloadPopupErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[AppMode] DailyDownloadPopup encountered an error and was safely suppressed:", error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
