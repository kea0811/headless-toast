import { useCallback, useSyncExternalStore } from 'react';
import type { ToastStore } from './store';
import type { Toast, ToasterOptions } from './types';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Props for the toast container. Spread onto the element that wraps toasts. */
export interface RegionProps {
  role: 'region';
  'aria-label': string;
  tabIndex: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

/** Props for a single toast element. Spread onto each rendered toast. */
export interface ToastItemProps {
  role: 'status' | 'alert';
  'aria-live': 'polite' | 'assertive';
  'aria-atomic': boolean;
  'data-type': string;
  'data-visible': string;
}

/** Everything you need to render an accessible toaster, fully unstyled. */
export interface ToasterView {
  /** The current toasts, including ones animating out (`visible === false`). */
  toasts: readonly Toast[];
  /** `true` when the user asked for reduced motion — skip your transitions. */
  prefersReducedMotion: boolean;
  /** ARIA + hover/focus handlers for the container element. */
  getRegionProps: () => RegionProps;
  /** ARIA + data attributes for a single toast element. */
  getToastProps: (toast: Toast) => ToastItemProps;
  /** Dismiss a toast (or all) — marks it not visible, then removes it. */
  dismiss: (id?: string) => void;
  /** Remove a toast (or all) immediately. */
  remove: (id?: string) => void;
  /** Pause a toast's timer (or all). */
  pause: (id?: string) => void;
  /** Resume a toast's timer (or all). */
  resume: (id?: string) => void;
}

/** Per-call overrides for {@link ToasterView}. */
export interface UseToasterOptions {
  /** `aria-label` for the live region, overriding the toaster default. */
  label?: string;
}

export type UseToaster = (options?: UseToasterOptions) => ToasterView;

export function createUseToaster(store: ToastStore, base: ToasterOptions = {}): UseToaster {
  return function useToaster(options: UseToasterOptions = {}): ToasterView {
    const toasts = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    const prefersReducedMotion = usePrefersReducedMotion();
    const label = options.label ?? base.label ?? 'Notifications';

    const getRegionProps = useCallback(
      (): RegionProps => ({
        role: 'region',
        'aria-label': label,
        tabIndex: -1,
        // Pause auto-dismiss while the user is reading or interacting.
        onMouseEnter: () => store.pause(),
        onMouseLeave: () => store.resume(),
        onFocus: () => store.pause(),
        onBlur: () => store.resume(),
      }),
      [label],
    );

    const getToastProps = useCallback(
      (toast: Toast): ToastItemProps => ({
        role: toast.important ? 'alert' : 'status',
        'aria-live': toast.important ? 'assertive' : 'polite',
        'aria-atomic': true,
        'data-type': toast.type,
        'data-visible': String(toast.visible),
      }),
      [],
    );

    return {
      toasts,
      prefersReducedMotion,
      getRegionProps,
      getToastProps,
      dismiss: store.dismiss,
      remove: store.remove,
      pause: store.pause,
      resume: store.resume,
    };
  };
}
