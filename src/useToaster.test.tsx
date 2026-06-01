import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createStore } from './store';
import { createToastApi } from './toast';
import { createUseToaster, type UseToaster, type UseToasterOptions } from './useToaster';

function Toaster({ hook, opts }: { hook: UseToaster; opts?: UseToasterOptions }) {
  const { toasts, getRegionProps, getToastProps, prefersReducedMotion, dismiss, remove, pause, resume } =
    hook(opts);
  return (
    <div data-testid="region" {...getRegionProps()}>
      <span data-testid="rm">{String(prefersReducedMotion)}</span>
      <button data-testid="dismiss-all" onClick={() => dismiss()} type="button">
        dismiss
      </button>
      <button data-testid="remove-all" onClick={() => remove()} type="button">
        remove
      </button>
      <button data-testid="pause-all" onClick={() => pause()} type="button">
        pause
      </button>
      <button data-testid="resume-all" onClick={() => resume()} type="button">
        resume
      </button>
      {toasts.map((t) => (
        <div key={t.id} data-testid={`toast-${t.id}`} {...getToastProps(t)}>
          {t.message as ReactNode}
        </div>
      ))}
    </div>
  );
}

describe('useToaster', () => {
  it('renders polite status toasts and the default region label', () => {
    const store = createStore();
    const toast = createToastApi(store);
    const useToaster = createUseToaster(store); // no base options → default param
    render(<Toaster hook={useToaster} />); // no opts → default param
    act(() => {
      toast('hi', { id: 'a', duration: Infinity });
    });

    const region = screen.getByTestId('region');
    expect(region).toHaveAttribute('role', 'region');
    expect(region).toHaveAttribute('aria-label', 'Notifications');
    expect(region).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('rm')).toHaveTextContent('false');

    const el = screen.getByTestId('toast-a');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveAttribute('aria-atomic', 'true');
    expect(el).toHaveAttribute('data-type', 'default');
    expect(el).toHaveAttribute('data-visible', 'true');
  });

  it('renders important toasts as assertive alerts', () => {
    const store = createStore();
    const toast = createToastApi(store);
    const useToaster = createUseToaster(store);
    render(<Toaster hook={useToaster} />);
    act(() => {
      toast.error('boom', { id: 'e', duration: Infinity });
    });

    const el = screen.getByTestId('toast-e');
    expect(el).toHaveAttribute('role', 'alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('prefers options.label, then the toaster base label', () => {
    const store = createStore();
    const useToaster = createUseToaster(store, { label: 'Base' });
    const { rerender } = render(<Toaster hook={useToaster} />);
    expect(screen.getByTestId('region')).toHaveAttribute('aria-label', 'Base');
    rerender(<Toaster hook={useToaster} opts={{ label: 'Override' }} />);
    expect(screen.getByTestId('region')).toHaveAttribute('aria-label', 'Override');
  });

  it('pauses the timer on mouse enter and resumes on mouse leave', () => {
    vi.useFakeTimers();
    try {
      const store = createStore();
      const toast = createToastApi(store);
      const useToaster = createUseToaster(store);
      render(<Toaster hook={useToaster} />);
      act(() => {
        toast('hi', { id: 'a', duration: 2000 });
      });
      const region = screen.getByTestId('region');

      fireEvent.mouseEnter(region);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByTestId('toast-a')).toHaveAttribute('data-visible', 'true');

      fireEvent.mouseLeave(region);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByTestId('toast-a')).toHaveAttribute('data-visible', 'false');
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it('pauses on focus and resumes on blur', () => {
    const store = createStore();
    const pause = vi.spyOn(store, 'pause');
    const resume = vi.spyOn(store, 'resume');
    const useToaster = createUseToaster(store);
    render(<Toaster hook={useToaster} />);
    const region = screen.getByTestId('region');

    fireEvent.focus(region);
    fireEvent.blur(region);
    expect(pause).toHaveBeenCalled();
    expect(resume).toHaveBeenCalled();
  });

  it('exposes dismiss / remove / pause / resume bound to the store', () => {
    const store = createStore({ removeDelay: Infinity });
    const toast = createToastApi(store);
    const useToaster = createUseToaster(store);
    render(<Toaster hook={useToaster} />);
    act(() => {
      toast('a', { id: 'a', duration: Infinity });
    });

    act(() => {
      fireEvent.click(screen.getByTestId('pause-all'));
      fireEvent.click(screen.getByTestId('resume-all'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('dismiss-all'));
    });
    expect(screen.getByTestId('toast-a')).toHaveAttribute('data-visible', 'false');

    act(() => {
      fireEvent.click(screen.getByTestId('remove-all'));
    });
    expect(screen.queryByTestId('toast-a')).toBeNull();
  });
});
