import type { ReactNode } from 'react';

/** The semantic kind of a toast. Drives default duration and ARIA urgency. */
export type ToastType = 'default' | 'success' | 'error' | 'loading';

/**
 * A single toast in the store. This is the data you render — `headless-toast`
 * never renders anything itself, so the shape is intentionally style-free.
 */
export interface Toast {
  /** Stable id. Pass your own via `options.id` to update a toast in place. */
  id: string;
  /** Semantic kind. */
  type: ToastType;
  /** Whatever you want to show — a string or any React node. */
  message: ReactNode;
  /** Auto-dismiss delay in ms. `Infinity` means it sticks until dismissed. */
  duration: number;
  /**
   * When `true` the toast is announced assertively (`role="alert"`), otherwise
   * politely (`role="status"`). Defaults to `true` for `error` toasts.
   */
  important: boolean;
  /** `false` once dismissed — use it to drive your exit transition. */
  visible: boolean;
  /** Epoch ms when the toast was first created. */
  createdAt: number;
  /** Arbitrary metadata you attach and read back when rendering. */
  data: Record<string, unknown>;
}

/** Per-toast options accepted by the imperative API. */
export interface ToastOptions {
  /** Reuse an id to update an existing toast instead of creating a new one. */
  id?: string;
  /** Override the auto-dismiss delay (ms). Use `Infinity` to make it sticky. */
  duration?: number;
  /** Force assertive (`true`) or polite (`false`) announcement. */
  important?: boolean;
  /** Arbitrary metadata carried on the toast. */
  data?: Record<string, unknown>;
}

/** The full payload used to create/update a toast inside the store. */
export interface ToastInput extends ToastOptions {
  type?: ToastType;
  message: ReactNode;
}

/** Options for a toaster instance (defaults shared by every toast it owns). */
export interface ToasterOptions {
  /** Default auto-dismiss delay (ms) for non-loading toasts. Default `4000`. */
  duration?: number;
  /**
   * How long a dismissed toast lingers in the list before removal (ms), giving
   * you time to animate it out. `Infinity` keeps it until you call `remove`.
   * Default `1000`.
   */
  removeDelay?: number;
  /** Maximum simultaneous toasts; oldest are evicted past this. `0` = no cap. */
  max?: number;
  /** `aria-label` for the live region. Default `"Notifications"`. */
  label?: string;
}
