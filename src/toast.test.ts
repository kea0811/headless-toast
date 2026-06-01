import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStore } from './store';
import { createToastApi } from './toast';

function setup() {
  const store = createStore();
  return { store, toast: createToastApi(store) };
}

describe('createToastApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a default toast when called directly (no options)', () => {
    const { store, toast } = setup();
    const id = toast('hello');
    expect(store.getSnapshot()[0]).toMatchObject({ id, type: 'default', message: 'hello' });
  });

  it('creates success / error / loading toasts and forwards options', () => {
    const { store, toast } = setup();
    toast.success('yay', { duration: 1000 });
    toast.error('nope');
    toast.loading('wait', { id: 'job' });
    const [ok, err, loading] = store.getSnapshot();
    expect(ok).toMatchObject({ type: 'success', duration: 1000, important: false });
    expect(err).toMatchObject({ type: 'error', important: true });
    expect(loading).toMatchObject({ type: 'loading', id: 'job', duration: Infinity });
  });

  it('forwards dismiss / remove / pause / resume to the store', () => {
    const { store, toast } = setup();
    const dismiss = vi.spyOn(store, 'dismiss');
    const remove = vi.spyOn(store, 'remove');
    const pause = vi.spyOn(store, 'pause');
    const resume = vi.spyOn(store, 'resume');

    toast.dismiss('a');
    toast.remove('b');
    toast.pause('c');
    toast.resume('d');
    toast.dismiss();

    expect(dismiss).toHaveBeenNthCalledWith(1, 'a');
    expect(dismiss).toHaveBeenNthCalledWith(2, undefined);
    expect(remove).toHaveBeenCalledWith('b');
    expect(pause).toHaveBeenCalledWith('c');
    expect(resume).toHaveBeenCalledWith('d');
  });
});
