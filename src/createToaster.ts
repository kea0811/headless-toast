import { createStore, type ToastStore } from './store';
import { createToastApi, type ToastApi } from './toast';
import { createUseToaster, type UseToaster } from './useToaster';
import type { ToasterOptions } from './types';

/** An isolated toaster instance: an imperative API plus its React hook. */
export interface Toaster {
  /** Imperative API — `toast(...)`, `toast.success(...)`, etc. */
  toast: ToastApi;
  /** React hook returning the data + prop getters to render the toaster. */
  useToaster: UseToaster;
  /** The underlying store, for advanced integrations. */
  store: ToastStore;
}

/**
 * Create a self-contained toaster. Useful when you want more than one
 * independent toast region (e.g. scoped to a sub-tree) or want to avoid the
 * shared default instance. Most apps can just import `toast` / `useToaster`.
 */
export function createToaster(options: ToasterOptions = {}): Toaster {
  const store = createStore(options);
  const toast = createToastApi(store);
  const useToaster = createUseToaster(store, options);
  return { toast, useToaster, store };
}
