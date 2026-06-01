import { useToaster, type ToastType } from 'headless-toast';

/**
 * A small reference toaster, built entirely on `useToaster()`. Everything you
 * see — layout, colours, icons, the enter/exit transition — is demo code. The
 * library only hands us the toast list, the ARIA wiring and the prop getters.
 */

const ICON: Record<ToastType, string> = {
  default: '○',
  success: '✓',
  error: '!',
  loading: '◍',
};

export function Toaster() {
  const { toasts, getRegionProps, getToastProps, prefersReducedMotion, dismiss } = useToaster();

  return (
    <div className="ht-region" {...getRegionProps()}>
      {toasts.map((t) => (
        <div
          key={t.id}
          {...getToastProps(t)}
          className="ht-toast"
          data-reduced={prefersReducedMotion}
        >
          <span className={`ht-icon ht-icon--${t.type}`} aria-hidden="true">
            {ICON[t.type]}
          </span>
          <span className="ht-msg">{t.message}</span>
          <button className="ht-close" type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
