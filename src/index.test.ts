import { describe, it, expect } from 'vitest';
import { VERSION } from './index';

describe('headless-toast (scaffold)', () => {
  it('exposes a version string', () => {
    expect(VERSION).toBe('0.1.0');
  });
});
