import { toast, type ToastType } from 'headless-toast';
import { Toaster } from './Toaster';

const SUCCESS_LINES = ['Saved to drafts', 'Copied to clipboard', 'Profile updated', 'Invite sent'];
const ERROR_LINES = ['Upload failed — retrying', 'Network unreachable', 'Could not save changes'];
const DEFAULT_LINES = ['New comment on your post', 'Build finished in 4.2s', 'Synced 12 files'];

const pick = (lines: string[], i: number) => lines[i % lines.length];

let nudge = 0;

function App() {
  const fireDefault = () => toast(pick(DEFAULT_LINES, nudge++));
  const fireSuccess = () => toast.success(pick(SUCCESS_LINES, nudge++));
  const fireError = () => toast.error(pick(ERROR_LINES, nudge++));
  const fireLoading = () => toast.loading('Crunching numbers…');

  const fireSaveFlow = () => {
    const id = toast.loading('Saving changes…');
    window.setTimeout(() => toast.success('All changes saved', { id }), 1600);
  };

  const fireStack = () => {
    for (let i = 0; i < 4; i += 1) {
      window.setTimeout(() => toast(pick(DEFAULT_LINES, i), { duration: 6000 }), i * 180);
    }
  };

  return (
    <>
      <Toaster />

      <header className="hero">
        <p className="eyebrow">React · headless · accessibility-first</p>
        <h1 className="title">headless&#8203;-toast</h1>
        <p className="tagline">
          A tiny, fully-accessible toast primitive for React. It owns the state, the timers,
          pause-on-hover and the ARIA wiring — <strong>you</strong> own every pixel.
        </p>

        <div className="install">
          <code>pnpm add headless-toast</code>
        </div>

        <div className="hero-actions">
          <button className="btn btn--primary" type="button" onClick={fireSuccess}>
            Toast me ✓
          </button>
          <button className="btn btn--ghost" type="button" onClick={fireError}>
            Show an error
          </button>
          <a className="btn btn--ghost" href="https://github.com/kea0811/headless-toast">
            View source ↗
          </a>
        </div>

        <p className="hero-hint">~1.8&nbsp;kB gzipped · zero dependencies · React 18 &amp; 19</p>
      </header>

      <main>
        <section className="section">
          <h2 className="section__title">Try it</h2>
          <p className="section__lead">
            Every button below calls the imperative API and drops a real toast into the live region
            (bottom-right). <strong>Hover a toast</strong> to pause its timer; move away to resume.
          </p>

          <div className="playground">
            <button className="trigger" type="button" onClick={fireDefault}>
              <span className="trigger__dot trigger__dot--default" />
              <span>
                <code>toast()</code>
                <em>neutral message</em>
              </span>
            </button>
            <button className="trigger" type="button" onClick={fireSuccess}>
              <span className="trigger__dot trigger__dot--success" />
              <span>
                <code>toast.success()</code>
                <em>polite, auto-dismiss</em>
              </span>
            </button>
            <button className="trigger" type="button" onClick={fireError}>
              <span className="trigger__dot trigger__dot--error" />
              <span>
                <code>toast.error()</code>
                <em>assertive alert</em>
              </span>
            </button>
            <button className="trigger" type="button" onClick={fireLoading}>
              <span className="trigger__dot trigger__dot--loading" />
              <span>
                <code>toast.loading()</code>
                <em>sticky until swapped</em>
              </span>
            </button>
            <button className="trigger" type="button" onClick={fireSaveFlow}>
              <span className="trigger__dot trigger__dot--loading" />
              <span>
                <code>loading → success</code>
                <em>update in place by id</em>
              </span>
            </button>
            <button className="trigger" type="button" onClick={fireStack}>
              <span className="trigger__dot trigger__dot--default" />
              <span>
                <code>stack a few</code>
                <em>watch them queue</em>
              </span>
            </button>
          </div>

          <div className="playground__footer">
            <button className="btn btn--ghost btn--sm" type="button" onClick={() => toast.dismiss()}>
              Dismiss all
            </button>
          </div>
        </section>

        <section className="section">
          <h2 className="section__title">Four flavours, one primitive</h2>
          <p className="section__lead">
            The <code>type</code> only changes the default duration and the ARIA urgency. The look is
            100% yours — here's the reference styling shipped with this demo.
          </p>

          <div className="gallery">
            {(['default', 'success', 'error', 'loading'] as ToastType[]).map((type) => (
              <article key={type} className="tile">
                <div className="tile__toast" data-type={type}>
                  <span className={`ht-icon ht-icon--${type}`} aria-hidden="true">
                    {type === 'success' ? '✓' : type === 'error' ? '!' : type === 'loading' ? '◍' : '○'}
                  </span>
                  <span className="ht-msg">
                    {type === 'success'
                      ? 'Profile updated'
                      : type === 'error'
                        ? 'Could not save changes'
                        : type === 'loading'
                          ? 'Uploading…'
                          : 'New comment on your post'}
                  </span>
                </div>
                <div className="tile__meta">
                  <code>toast{type === 'default' ? '' : `.${type}`}(…)</code>
                  <span className="tile__role">
                    {type === 'error' ? 'role="alert"' : 'role="status"'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section__title">Why it's nice to live with</h2>
          <div className="features">
            <article className="feature">
              <h3>Accessible out of the box</h3>
              <p>
                Each toast gets <code>role="status"</code> (or <code>role="alert"</code> for errors),
                the right <code>aria-live</code> politeness and <code>aria-atomic</code>. Screen
                readers announce it; you don't think about it.
              </p>
            </article>
            <article className="feature">
              <h3>Pause on hover &amp; focus</h3>
              <p>
                The region's prop getter wires hover, focus and blur to pause and resume the
                auto-dismiss timer — remaining time is preserved, never reset.
              </p>
            </article>
            <article className="feature">
              <h3>Update in place</h3>
              <p>
                Reuse an <code>id</code> and the toast morphs instead of stacking. Perfect for a
                <code>loading → success</code> flow without juggling refs.
              </p>
            </article>
            <article className="feature">
              <h3>Respects reduced motion</h3>
              <p>
                <code>useToaster()</code> returns <code>prefersReducedMotion</code> so you can skip
                your enter/exit transitions when the OS asks for calm.
              </p>
            </article>
            <article className="feature">
              <h3>Truly headless</h3>
              <p>
                No portal, no CSS, no opinions. You map over <code>toasts</code> and render whatever
                markup your design system already uses.
              </p>
            </article>
            <article className="feature">
              <h3>Tiny &amp; dependency-free</h3>
              <p>
                One small store, one hook, full TypeScript types. ESM + CJS, peer-deps on React only.
              </p>
            </article>
          </div>
        </section>

        <section className="section">
          <h2 className="section__title">The five-second integration</h2>
          <p className="section__lead">
            Render a <code>&lt;Toaster /&gt;</code> once near the root, then call <code>toast()</code>
            from anywhere.
          </p>

          <pre className="code">
            <code>{`import { toast, useToaster } from 'headless-toast';

function Toaster() {
  const { toasts, getRegionProps, getToastProps, dismiss } = useToaster();
  return (
    <div {...getRegionProps()} className="toaster">
      {toasts.map((t) => (
        <div key={t.id} {...getToastProps(t)} className="toast">
          {t.message}
          <button onClick={() => dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

// anywhere in your app:
toast.success('Saved!');
toast.error('Something broke');

// loading → success, same toast:
const id = toast.loading('Saving…');
await save();
toast.success('Saved!', { id });`}</code>
          </pre>

          <div className="install install--block">
            <span className="install__label">Install</span>
            <code>pnpm add github:kea0811/headless-toast</code>
            <code>pnpm add headless-toast</code>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          <a href="https://github.com/kea0811/headless-toast">GitHub</a>
          <span aria-hidden="true"> · </span>
          MIT licensed
          <span aria-hidden="true"> · </span>
          built with <code>headless-toast</code>
        </p>
      </footer>
    </>
  );
}

export { App };
