import type { ReactNode } from 'react';
import type { ToastStore } from './store';
import type { ToastOptions, ToastType } from './types';

/**
 * The imperative toast API. Call it directly to show a default toast, or use
 * one of the typed helpers. Every creator returns the toast's id so you can
 * update or dismiss it later.
 */
export interface ToastApi {
  (message: ReactNode, options?: ToastOptions): string;
  /** Show a success toast (polite by default). */
  success: (message: ReactNode, options?: ToastOptions) => string;
  /** Show an error toast (assertive by default). */
  error: (message: ReactNode, options?: ToastOptions) => string;
  /** Show a sticky loading toast — swap it later with the same `id`. */
  loading: (message: ReactNode, options?: ToastOptions) => string;
  /** Dismiss a toast by id, or all toasts when called with no argument. */
  dismiss: (id?: string) => void;
  /** Remove a toast by id immediately, or all toasts when called bare. */
  remove: (id?: string) => void;
  /** Pause a toast's timer by id, or all timers when called bare. */
  pause: (id?: string) => void;
  /** Resume a toast's timer by id, or all timers when called bare. */
  resume: (id?: string) => void;
}

export function createToastApi(store: ToastStore): ToastApi {
  const make =
    (type: ToastType) =>
    (message: ReactNode, options: ToastOptions = {}): string =>
      store.add({ ...options, type, message });

  const toast = make('default') as ToastApi;
  toast.success = make('success');
  toast.error = make('error');
  toast.loading = make('loading');
  toast.dismiss = (id) => store.dismiss(id);
  toast.remove = (id) => store.remove(id);
  toast.pause = (id) => store.pause(id);
  toast.resume = (id) => store.resume(id);
  return toast;
}
