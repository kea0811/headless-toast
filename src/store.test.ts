import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStore, type ToastStore } from './store';

const ids = (s: ToastStore): string[] => s.getSnapshot().map((t) => t.id);

describe('createStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a toast with a generated id and sensible defaults', () => {
    const store = createStore();
    const id = store.add({ message: 'hi' });
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0]).toMatchObject({
      id,
      type: 'default',
      message: 'hi',
      visible: true,
      important: false,
      data: {},
    });
    expect(snap[0].duration).toBe(4000);
    expect(snap[0].createdAt).toBeTypeOf('number');
  });

  it('carries arbitrary data through', () => {
    const store = createStore();
    store.add({ message: 'with data', data: { jobId: 7 } });
    expect(store.getSnapshot()[0].data).toEqual({ jobId: 7 });
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const store = createStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    store.add({ message: 'a' });
    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
    store.add({ message: 'b' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps a stable snapshot reference until something changes', () => {
    const store = createStore();
    const before = store.getSnapshot();
    expect(store.getSnapshot()).toBe(before);
    store.add({ message: 'x' });
    expect(store.getSnapshot()).not.toBe(before);
  });

  it('marks error toasts important by default, and honours an explicit flag', () => {
    const store = createStore();
    store.add({ type: 'error', message: 'boom' });
    store.add({ type: 'default', message: 'meh', important: true });
    const [err, meh] = store.getSnapshot();
    expect(err.important).toBe(true);
    expect(meh.important).toBe(true);
  });

  it('applies per-type and custom default durations', () => {
    const store = createStore();
    store.add({ type: 'error', message: 'e' });
    store.add({ type: 'success', message: 's' });
    const [err, ok] = store.getSnapshot();
    expect(err.duration).toBe(5000);
    expect(ok.duration).toBe(4000);

    const custom = createStore({ duration: 1500 });
    custom.add({ message: 'c' });
    expect(custom.getSnapshot()[0].duration).toBe(1500);
  });

  it('treats loading toasts as sticky and never schedules a timer', () => {
    const store = createStore();
    store.add({ type: 'loading', message: 'load' });
    expect(store.getSnapshot()[0].duration).toBe(Infinity);
    vi.advanceTimersByTime(100_000);
    expect(store.getSnapshot()[0].visible).toBe(true);
  });

  it('treats a non-positive duration as sticky', () => {
    const store = createStore();
    store.add({ message: 'zero', duration: 0 });
    vi.advanceTimersByTime(100_000);
    expect(store.getSnapshot()[0].visible).toBe(true);
  });

  it('auto-dismisses after the duration, then removes after removeDelay', () => {
    const store = createStore({ removeDelay: 1000 });
    store.add({ message: 'bye', duration: 2000 });
    vi.advanceTimersByTime(1999);
    expect(store.getSnapshot()[0].visible).toBe(true);
    vi.advanceTimersByTime(1);
    expect(store.getSnapshot()[0].visible).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('updates a toast in place when reusing an id, preserving createdAt', () => {
    const store = createStore();
    store.add({ message: 'sibling', id: 'other', duration: Infinity });
    const id = store.add({ type: 'loading', message: 'loading…', id: 'job' });
    const createdAt = store.getSnapshot().find((t) => t.id === 'job')!.createdAt;
    vi.advanceTimersByTime(5000);
    store.add({ type: 'success', message: 'done', id: 'job', duration: 1000 });
    const snap = store.getSnapshot();
    expect(id).toBe('job');
    expect(snap.map((t) => t.id)).toEqual(['other', 'job']);
    const job = snap.find((t) => t.id === 'job')!;
    expect(job).toMatchObject({ type: 'success', message: 'done', important: false });
    expect(job.createdAt).toBe(createdAt);
    vi.advanceTimersByTime(1000);
    expect(store.getSnapshot().find((t) => t.id === 'job')!.visible).toBe(false);
  });

  it('caps the list at `max`, evicting the oldest toasts', () => {
    const store = createStore({ max: 2 });
    store.add({ message: 'a', id: 'a' });
    store.add({ message: 'b', id: 'b' });
    expect(ids(store)).toEqual(['a', 'b']);
    store.add({ message: 'c', id: 'c' });
    expect(ids(store)).toEqual(['b', 'c']);
  });

  it('dismiss(id) hides one toast; dismiss() hides all', () => {
    const store = createStore();
    store.add({ message: 'a', id: 'a', duration: Infinity });
    store.add({ message: 'b', id: 'b', duration: Infinity });
    store.dismiss('a');
    expect(store.getSnapshot().map((t) => t.visible)).toEqual([false, true]);
    store.dismiss();
    expect(store.getSnapshot().map((t) => t.visible)).toEqual([false, false]);
  });

  it('remove(id) deletes one; remove() clears all and their timers', () => {
    const store = createStore();
    store.add({ message: 'a', id: 'a', duration: 5000 });
    store.add({ message: 'b', id: 'b', duration: 5000 });
    store.remove('a');
    expect(ids(store)).toEqual(['b']);
    store.remove();
    expect(ids(store)).toEqual([]);
    vi.advanceTimersByTime(10_000);
    expect(ids(store)).toEqual([]);
  });

  it('never auto-removes a dismissed toast when removeDelay is Infinity', () => {
    const store = createStore({ removeDelay: Infinity });
    store.add({ message: 'a', id: 'a', duration: 1000 });
    vi.advanceTimersByTime(1000);
    expect(store.getSnapshot()[0].visible).toBe(false);
    vi.advanceTimersByTime(100_000);
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it('preserves the remaining time across pause and resume', () => {
    const store = createStore();
    store.add({ message: 'a', id: 'a', duration: 3000 });
    vi.advanceTimersByTime(1000);
    store.pause('a');
    vi.advanceTimersByTime(10_000);
    expect(store.getSnapshot()[0].visible).toBe(true);
    store.resume('a');
    vi.advanceTimersByTime(1999);
    expect(store.getSnapshot()[0].visible).toBe(true);
    vi.advanceTimersByTime(1);
    expect(store.getSnapshot()[0].visible).toBe(false);
  });

  it('pause() and resume() act on every active timer', () => {
    const store = createStore();
    store.add({ message: 'a', id: 'a', duration: 2000 });
    store.add({ message: 'b', id: 'b', duration: 2000 });
    store.pause();
    vi.advanceTimersByTime(5000);
    expect(store.getSnapshot().every((t) => t.visible)).toBe(true);
    store.resume();
    vi.advanceTimersByTime(2000);
    expect(store.getSnapshot().every((t) => !t.visible)).toBe(true);
  });

  it('is a no-op for unknown ids and repeated pause/resume', () => {
    const store = createStore();
    store.add({ message: 'a', id: 'a', duration: 2000 });
    expect(() => store.pause('nope')).not.toThrow();
    expect(() => store.resume('nope')).not.toThrow();
    store.resume('a'); // not paused yet → ignored
    store.pause('a');
    store.pause('a'); // already paused → ignored
    vi.advanceTimersByTime(5000);
    expect(store.getSnapshot()[0].visible).toBe(true);
  });

  it('removes a paused toast without error (timer already cleared)', () => {
    const store = createStore();
    store.add({ message: 'a', id: 'a', duration: 2000 });
    store.pause('a');
    expect(() => store.remove('a')).not.toThrow();
    expect(store.getSnapshot()).toHaveLength(0);
  });
});
