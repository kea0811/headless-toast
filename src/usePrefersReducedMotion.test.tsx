import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function Probe() {
  const reduced = usePrefersReducedMotion();
  return <span data-testid="rm">{reduced ? 'yes' : 'no'}</span>;
}

interface MockMql {
  matches: boolean;
  addEventListener?: (type: string, listener: (e: MediaQueryListEvent) => void) => void;
  removeEventListener?: (type: string, listener: (e: MediaQueryListEvent) => void) => void;
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
}

function installMatchMedia(mql: MockMql): void {
  vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when matchMedia reports no preference', () => {
    installMatchMedia({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    render(<Probe />);
    expect(screen.getByTestId('rm')).toHaveTextContent('no');
  });

  it('returns true when matchMedia reports a reduced-motion preference', () => {
    installMatchMedia({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    render(<Probe />);
    expect(screen.getByTestId('rm')).toHaveTextContent('yes');
  });

  it('updates live when the media query changes (addEventListener)', () => {
    let listener: ((e: MediaQueryListEvent) => void) | undefined;
    installMatchMedia({
      matches: false,
      addEventListener: (_type, cb) => {
        listener = cb;
      },
      removeEventListener: vi.fn(),
    });

    render(<Probe />);
    expect(screen.getByTestId('rm')).toHaveTextContent('no');

    act(() => listener?.({ matches: true } as MediaQueryListEvent));
    expect(screen.getByTestId('rm')).toHaveTextContent('yes');
  });

  it('falls back to addListener/removeListener on legacy browsers', () => {
    let listener: ((e: MediaQueryListEvent) => void) | undefined;
    const addListener = vi.fn((cb: (e: MediaQueryListEvent) => void) => {
      listener = cb;
    });
    const removeListener = vi.fn();
    installMatchMedia({ matches: false, addListener, removeListener });

    const { unmount } = render(<Probe />);
    expect(addListener).toHaveBeenCalledTimes(1);

    act(() => listener?.({ matches: true } as MediaQueryListEvent));
    expect(screen.getByTestId('rm')).toHaveTextContent('yes');

    unmount();
    expect(removeListener).toHaveBeenCalledTimes(1);
  });

  it('cleans up the modern listener on unmount', () => {
    const removeEventListener = vi.fn();
    installMatchMedia({ matches: false, addEventListener: vi.fn(), removeEventListener });
    const { unmount } = render(<Probe />);
    unmount();
    expect(removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('returns false when matchMedia is unavailable (SSR-like)', () => {
    const original = window.matchMedia;
    // @ts-expect-error — force the no-matchMedia path
    delete window.matchMedia;
    try {
      render(<Probe />);
      expect(screen.getByTestId('rm')).toHaveTextContent('no');
    } finally {
      window.matchMedia = original;
    }
  });
});
