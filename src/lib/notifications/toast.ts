/**
 * Axivon Technologies - Centralized Notification & Toast Dispatcher
 * 
 * Supports imperative triggering anywhere:
 * toast.success("Changes saved successfully");
 * toast.error("Could not reach the server");
 * toast.warning("Session expires soon");
 * toast.info("New update available");
 */

import { getErrorMessage } from "@/lib/errors/client";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  id?: string;
  duration?: number; // In milliseconds. Default: 7000ms for error, 5000ms for others.
  title?: string;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private maxVisible = 3;

  private notify() {
    for (const listener of this.listeners) {
      listener([...this.toasts]);
    }
  }

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getToasts(): ToastItem[] {
    return [...this.toasts];
  }

  public add(type: ToastType, rawMessage: unknown, options: ToastOptions = {}): string {
    const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const message = type === "error" ? getErrorMessage(rawMessage) : String(rawMessage || "");

    const defaultDuration = type === "error" ? 7000 : 5000;
    const duration = options.duration !== undefined ? options.duration : defaultDuration;

    const newItem: ToastItem = {
      id,
      type,
      message,
      title: options.title,
      duration,
      createdAt: Date.now(),
    };

    // Stacking: maximum 3 visible. If at capacity, drop oldest.
    if (this.toasts.length >= this.maxVisible) {
      this.toasts = [...this.toasts.slice(this.toasts.length - this.maxVisible + 1), newItem];
    } else {
      this.toasts = [...this.toasts, newItem];
    }

    this.notify();
    return id;
  }

  public dismiss(id: string): void {
    const beforeCount = this.toasts.length;
    this.toasts = this.toasts.filter((t) => t.id !== id);
    if (this.toasts.length !== beforeCount) {
      this.notify();
    }
  }

  public clear(): void {
    if (this.toasts.length > 0) {
      this.toasts = [];
      this.notify();
    }
  }
}

export const toastManager = new ToastManager();

export const toast = {
  success: (message: string, options?: ToastOptions) => toastManager.add("success", message, options),
  error: (error: unknown, options?: ToastOptions) => toastManager.add("error", error, options),
  warning: (message: string, options?: ToastOptions) => toastManager.add("warning", message, options),
  info: (message: string, options?: ToastOptions) => toastManager.add("info", message, options),
  dismiss: (id: string) => toastManager.dismiss(id),
  clear: () => toastManager.clear(),
};
