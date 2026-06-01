import type { Toast, ToastInput, ToasterOptions, ToastType } from './types';

/**
 * Bookkeeping for a single toast's auto-dismiss timer. We track the wall-clock
 * `startedAt` and the `remaining` time so the timer can be paused (on hover /
 * focus / tab-blur) and resumed without losing or resetting its countdown.
 */
interface TimerEntry {
  handle: ReturnType<typeof setTimeout>;
  remaining: number;
  startedAt: number;
  paused: boolean;
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  default: 4000,
  success: 4000,
  error: 5000,
  loading: Infinity,
};

/**
 * The framework-agnostic engine behind `headless-toast`. It owns the toast
 * list, the auto-dismiss timers and the pause/resume logic, and exposes a
 * `useSyncExternalStore`-compatible `subscribe`/`getSnapshot` pair.
 */
export interface ToastStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): readonly Toast[];
  /** Create a toast (or update one in place when its `id` already exists). */
  add(input: ToastInput): string;
  /** Mark a toast (or all) not visible and schedule its removal. */
  dismiss(id?: string): void;
  /** Remove a toast (or all) immediately. */
  remove(id?: string): void;
  /** Pause the auto-dismiss timer for a toast (or all). */
  pause(id?: string): void;
  /** Resume a paused auto-dismiss timer for a toast (or all). */
  resume(id?: string): void;
}

export function createStore(options: ToasterOptions = {}): ToastStore {
  const removeDelay = options.removeDelay ?? 1000;
  const max = options.max ?? 0;

  const listeners = new Set<() => void>();
  const timers = new Map<string, TimerEntry>();
  let toasts: Toast[] = [];
  let counter = 0;

  const emit = (): void => {
    for (const listener of listeners) listener();
  };

  const commit = (next: Toast[]): void => {
    toasts = next;
    emit();
  };

  const clearTimer = (id: string): void => {
    const entry = timers.get(id);
    if (!entry) return;
    clearTimeout(entry.handle);
    timers.delete(id);
  };

  const startTimer = (id: string, duration: number): void => {
    if (!Number.isFinite(duration) || duration <= 0) return;
    clearTimer(id);
    const handle = setTimeout(() => dismiss(id), duration);
    timers.set(id, { handle, remaining: duration, startedAt: Date.now(), paused: false });
  };

  const defaultDuration = (type: ToastType): number => {
    if (type === 'loading') return Infinity;
    return options.duration ?? DEFAULT_DURATIONS[type];
  };

  const add = (input: ToastInput): string => {
    const id = input.id ?? `t${(counter += 1)}`;
    const type = input.type ?? 'default';
    const duration = input.duration ?? defaultDuration(type);
    const existing = toasts.find((t) => t.id === id);

    const toast: Toast = {
      id,
      type,
      message: input.message,
      duration,
      important: input.important ?? type === 'error',
      visible: true,
      createdAt: existing ? existing.createdAt : Date.now(),
      data: input.data ?? {},
    };

    if (existing) {
      commit(toasts.map((t) => (t.id === id ? toast : t)));
    } else {
      let queue = [...toasts, toast];
      if (max > 0 && queue.length > max) {
        const overflow = queue.slice(0, queue.length - max);
        for (const dropped of overflow) clearTimer(dropped.id);
        queue = queue.slice(queue.length - max);
      }
      commit(queue);
    }

    startTimer(id, duration);
    return id;
  };

  const scheduleRemoval = (id: string): void => {
    if (!Number.isFinite(removeDelay)) return;
    setTimeout(() => remove(id), removeDelay);
  };

  const dismiss = (id?: string): void => {
    const ids = id === undefined ? toasts.map((t) => t.id) : [id];
    for (const target of ids) clearTimer(target);
    commit(toasts.map((t) => (ids.includes(t.id) ? { ...t, visible: false } : t)));
    for (const target of ids) scheduleRemoval(target);
  };

  const remove = (id?: string): void => {
    if (id === undefined) {
      for (const entry of timers.values()) clearTimeout(entry.handle);
      timers.clear();
      commit([]);
      return;
    }
    clearTimer(id);
    commit(toasts.filter((t) => t.id !== id));
  };

  const pauseOne = (id: string): void => {
    const entry = timers.get(id);
    if (!entry || entry.paused) return;
    clearTimeout(entry.handle);
    entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.startedAt));
    entry.paused = true;
  };

  const resumeOne = (id: string): void => {
    const entry = timers.get(id);
    if (!entry || !entry.paused) return;
    entry.paused = false;
    entry.startedAt = Date.now();
    entry.handle = setTimeout(() => dismiss(id), entry.remaining);
  };

  const pause = (id?: string): void => {
    if (id === undefined) {
      for (const key of timers.keys()) pauseOne(key);
    } else {
      pauseOne(id);
    }
  };

  const resume = (id?: string): void => {
    if (id === undefined) {
      for (const key of timers.keys()) resumeOne(key);
    } else {
      resumeOne(id);
    }
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const getSnapshot = (): readonly Toast[] => toasts;

  return { subscribe, getSnapshot, add, dismiss, remove, pause, resume };
}
