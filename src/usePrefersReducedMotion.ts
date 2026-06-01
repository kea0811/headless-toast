import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the user's `prefers-reduced-motion` setting and updates if it changes
 * while the page is open.
 *
 * Returns `false` during SSR and in environments without `matchMedia`, so your
 * toasts animate by default and only fall back to instant when a real reduced
 * preference is detected. Use it to skip enter/exit transitions accordingly.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent | MediaQueryList): void => {
      setPrefersReduced(event.matches);
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Legacy Safari < 14 fallback
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return prefersReduced;
}
