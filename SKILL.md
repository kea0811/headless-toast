---
name: headless-toast
description: Use when the user needs a toast / notification system in a React app and you want to control the look entirely. Provides the state machine (store, auto-dismiss timers, ARIA live region, promise integration) — you bring the markup. Zero deps, React 18 + 19, StrictMode-safe.
---

# headless-toast

A tiny, fully-accessible toast primitive for React. It manages the behaviour; you render however you like.

## When to reach for this

User wants:
- "add a toast system"
- "notification component" or "snackbar"
- "show a success/error message after an action"
- Something they can style with their own design system (NOT Sonner / NOT a pre-styled lib).

User does NOT want this when they ask for:
- ❌ A pre-styled toast (use `sonner` or `react-hot-toast` instead).
- ❌ A persistent in-app inbox.

## Install

```bash
pnpm add headless-toast
```

Peer deps: `react@^18 || ^19`. Zero runtime deps.

## Quick start

```tsx
import { ToastProvider, useToast } from 'headless-toast';

// 1. Wrap your app once
function App() {
  return (
    <ToastProvider>
      <Routes />
      <Toaster />     {/* your custom renderer */}
    </ToastProvider>
  );
}

// 2. Fire toasts from anywhere
function SaveButton() {
  const { toast } = useToast();
  return (
    <button onClick={async () => {
      const id = toast.loading('Saving…');
      try {
        await save();
        toast.success('Saved', { id });   // updates the same toast in place
      } catch {
        toast.error('Save failed', { id });
      }
    }}>Save</button>
  );
}

// 3. Render however you want
function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <ol aria-label="Notifications">
      {toasts.map((t) => (
        <li key={t.id} data-type={t.type}>
          {t.message}
          <button onClick={() => dismiss(t.id)}>×</button>
        </li>
      ))}
    </ol>
  );
}
```

## Promise integration

```ts
toast.promise(saveUser(), {
  loading: 'Saving…',
  success: (user) => `Saved ${user.name}`,
  error: (err) => `Failed: ${err.message}`,
});
```

Returns the same promise so you can `await` it.

## Defaults worth knowing

- **Auto-dismiss timers pause on hover AND focus** of any toast in the list (per WAI-ARIA APG).
- **Single shared `aria-live="polite"` region** mounted by the provider — your renderer doesn't have to handle ARIA itself.
- **In-place updates** when you pass the same `id` (loading → success without unmounting).
- **De-duplicates** if you pass `id` and a toast with that id is already visible (updates instead of stacking).

## Gotchas

1. **Pick ONE Toaster.** Mount your renderer exactly once. Mounting twice means duplicate visible lists, but the underlying store is still single (so it's only visual).
2. **The ARIA live region is mounted by `ToastProvider`** — don't add another `aria-live` to your renderer.
3. **Don't put the Toaster inside a portal that unmounts** — toasts come from the store, but if your renderer is unmounted you won't see them.

## API

| Export | What |
|---|---|
| `<ToastProvider duration? max? pauseOnHover? pauseOnFocus?>` | mounts the store + live region |
| `useToast()` | returns `{ toast, toasts, dismiss }` |
| `toast.success/error/info/warning/loading(msg, opts?)` | fire a toast |
| `toast.promise(p, msgs)` | success/error from a Promise |
| `toast.dismiss(id?)` | dismiss one or all |

## Links

- npm: https://www.npmjs.com/package/headless-toast
- demo: https://headless-toast.vercel.app
- repo: https://github.com/kea0811/headless-toast
