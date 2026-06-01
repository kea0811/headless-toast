import { createToaster } from './createToaster';

/**
 * The shared default toaster. Import these for the common single-region case:
 *
 * ```ts
 * import { toast, useToaster } from 'headless-toast';
 * ```
 */
const defaultToaster = createToaster();

export const toast = defaultToaster.toast;
export const useToaster = defaultToaster.useToaster;
export const store = defaultToaster.store;

export { createToaster } from './createToaster';
export type { Toaster } from './createToaster';
export { usePrefersReducedMotion } from './usePrefersReducedMotion';
export type { ToastApi } from './toast';
export type { ToastStore } from './store';
export type {
  UseToaster,
  UseToasterOptions,
  ToasterView,
  RegionProps,
  ToastItemProps,
} from './useToaster';
export type {
  Toast,
  ToastType,
  ToastOptions,
  ToastInput,
  ToasterOptions,
} from './types';
