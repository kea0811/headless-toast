import { describe, it, expect } from 'vitest';
import { createToaster } from './createToaster';

describe('createToaster', () => {
  it('wires an isolated store, toast api and hook (with options)', () => {
    const { toast, useToaster, store } = createToaster({ max: 1 });
    expect(typeof toast).toBe('function');
    expect(typeof useToaster).toBe('function');
    toast('a', { id: 'a', duration: Infinity });
    toast('b', { id: 'b', duration: Infinity });
    expect(store.getSnapshot().map((t) => t.id)).toEqual(['b']);
  });

  it('defaults its options when called with no arguments', () => {
    const { toast, store } = createToaster();
    toast('x', { duration: Infinity });
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it('produces independent instances', () => {
    const a = createToaster();
    const b = createToaster();
    a.toast('one', { duration: Infinity });
    expect(a.store.getSnapshot()).toHaveLength(1);
    expect(b.store.getSnapshot()).toHaveLength(0);
  });
});
