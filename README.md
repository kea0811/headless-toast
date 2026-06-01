# headless-toast

> A tiny, fully-accessible **headless** toast primitive for React. You bring the markup and styles; it handles state, timers, pause-on-hover and ARIA.

![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)
![npm version](https://img.shields.io/npm/v/headless-toast.svg)
![npm downloads](https://img.shields.io/npm/dm/headless-toast.svg)
![bundle size](https://img.shields.io/bundlephobia/minzip/headless-toast?label=gzip)

**🌐 [Live demo →](https://headless-toast.vercel.app)**

Most toast libraries ship a renderer, a portal, a theme and a pile of CSS you end up
fighting. `headless-toast` ships none of that. It gives you the **state machine** — a toast
store, auto-dismiss timers that pause on hover, in-place updates, and the correct ARIA
attributes — and lets you render every pixel with your own components.

- 🪶 **Tiny** — one small store, one hook, ~1.8&nbsp;kB gzipped, zero dependencies.
- ♿ **Accessible by default** — `role="status"`/`"alert"`, `aria-live`, `aria-atomic`, all wired for you.
- ⏯️ **Pause on hover & focus** — remaining time is preserved, never reset.
- 🔁 **Update in place** — reuse an `id` to morph a `loading` toast into `success`.
- 🎛️ **Truly headless** — no portal, no CSS, no opinions about how it looks.
- 🔡 **Fully typed** — written in strict TypeScript, ships ESM + CJS + types.

## Install

From GitHub (always works):

```bash
pnpm add github:kea0811/headless-toast
```

From npm (_when published to npm_):

```bash
pnpm add headless-toast
```

> Using npm or yarn? Swap in `npm install` / `yarn add` — the package works the same.

`react` and `react-dom` (v18 or v19) are peer dependencies.

## Quick start

Render a `<Toaster>` once near the root of your app, then call `toast()` from anywhere.

```tsx
import { toast, useToaster } from 'headless-toast';

function Toaster() {
  const { toasts, getRegionProps, getToastProps, dismiss } = useToaster();

  return (
    <div {...getRegionProps()} className="toaster">
      {toasts.map((t) => (
        <div key={t.id} {...getToastProps(t)} className={`toast toast--${t.type}`}>
          <span>{t.message}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <>
      <YourApp />
      <Toaster />
    </>
  );
}

// …then anywhere in your app:
toast.success('Saved!');
toast.error('Could not connect');
```

That's the whole integration. The library never renders anything — `getRegionProps()` and
`getToastProps()` just hand you the right attributes and event handlers to spread.

## A `loading → success` flow

Reuse an `id` and the toast updates in place instead of stacking — perfect for async work:

```tsx
async function save() {
  const id = toast.loading('Saving changes…');
  try {
    await api.save();
    toast.success('All changes saved', { id });
  } catch {
    toast.error('Save failed', { id });
  }
}
```

## API

### `toast`

The imperative API. Every creator returns the toast's `id`.

```ts
toast(message, options?)          // a neutral toast (role="status")
toast.success(message, options?)  // polite success
toast.error(message, options?)    // assertive alert (role="alert")
toast.loading(message, options?)  // sticky until you swap or dismiss it

toast.dismiss(id?)  // hide one (or all) — fires your exit transition, then removes
toast.remove(id?)   // remove one (or all) immediately
toast.pause(id?)    // pause the auto-dismiss timer for one (or all)
toast.resume(id?)   // resume one (or all)
```

`message` is any `ReactNode`, so a string, JSX, or your own component all work.

**`ToastOptions`**

| Option      | Type                        | Description                                                            |
| ----------- | --------------------------- | --------------------------------------------------------------------- |
| `id`        | `string`                    | Reuse an id to **update** an existing toast instead of creating a new one. |
| `duration`  | `number`                    | Auto-dismiss delay in ms. Use `Infinity` to make it sticky.           |
| `important` | `boolean`                   | Force assertive (`true`) or polite (`false`) announcement.            |
| `data`      | `Record<string, unknown>`   | Arbitrary metadata carried on the toast and read back when rendering. |

### `useToaster(options?)`

The hook that subscribes to the store and returns everything you need to render:

```ts
const {
  toasts,               // readonly Toast[] — includes toasts animating out (visible === false)
  prefersReducedMotion, // boolean — skip your transitions when true
  getRegionProps,       // () => props for the container (role, aria-label, hover/focus handlers)
  getToastProps,        // (toast) => props for one toast (role, aria-live, aria-atomic, data-*)
  dismiss, remove, pause, resume, // same helpers as on `toast`
} = useToaster({ label: 'Notifications' });
```

`getToastProps(toast)` returns `data-type` and `data-visible` attributes, so you can style by
type (`[data-type="error"]`) and drive exit transitions (`[data-visible="false"]`) in pure CSS.

### `createToaster(options?)`

Need more than one independent toast region, or want to avoid the shared default instance?
Create your own:

```ts
import { createToaster } from 'headless-toast';

const { toast, useToaster, store } = createToaster({
  duration: 4000,    // default auto-dismiss for non-loading toasts
  removeDelay: 1000, // how long a dismissed toast lingers before removal (for exit anim)
  max: 3,            // cap simultaneous toasts; oldest are evicted (0 = no cap)
  label: 'Alerts',   // default aria-label for the live region
});
```

The default `toast` / `useToaster` exports are simply a `createToaster()` instance with the
defaults above.

### A note on accessibility

Toasts are announced via a live region. `getToastProps` gives **success/default** toasts
`role="status"` + `aria-live="polite"`, and **error/important** toasts `role="alert"` +
`aria-live="assertive"`, plus `aria-atomic="true"` so the whole message is read. Hover, focus
and blur on the region pause and resume the timers, so a toast never vanishes while it's being
read. You stay in control of focus order and visuals.

## Contributing

Issues and PRs are welcome. To run the project locally:

```bash
pnpm install        # install deps (root + demo workspace)
pnpm test           # run the test suite
pnpm test:coverage  # run with coverage (100% across the board)
pnpm build          # build ESM + CJS + types
pnpm demo:dev       # run the demo app
```

## License

[MIT](./LICENSE) © kea0811
