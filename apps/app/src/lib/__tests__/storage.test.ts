import { createMemoryStorage } from '../key-value-storage';
import { createWebStorage } from '../storage.web';

describe('memory storage', () => {
  it('stores, reads, removes and clears', () => {
    const s = createMemoryStorage();
    s.set('a', '1');
    expect(s.getString('a')).toBe('1');
    s.remove('a');
    expect(s.getString('a')).toBeUndefined();
    s.set('b', '2');
    s.clearAll();
    expect(s.getString('b')).toBeUndefined();
  });
});

describe('web storage', () => {
  it('prefixes keys and clears only its own', () => {
    const area = new Map<string, string>([['other', 'keep']]);
    const fake = {
      getItem: (k: string) => area.get(k) ?? null,
      setItem: (k: string, v: string) => void area.set(k, v),
      removeItem: (k: string) => void area.delete(k),
      key: () => null,
      length: 0,
    };
    const store = createWebStorage(() =>
      new Proxy(fake, {
        ownKeys: () => [...area.keys()],
        getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
      }) as unknown as Storage,
    );
    store.set('x', '1');
    expect(area.get('lbl:x')).toBe('1');
    expect(store.getString('x')).toBe('1');
    store.clearAll();
    expect(area.has('lbl:x')).toBe(false);
    expect(area.get('other')).toBe('keep');
  });

  it('falls back to memory when storage throws', () => {
    const store = createWebStorage(() => {
      throw new Error('blocked');
    });
    store.set('x', '1');
    expect(store.getString('x')).toBe('1');
  });

  it('falls back to memory when storage is missing', () => {
    const store = createWebStorage(() => undefined);
    store.set('y', '2');
    expect(store.getString('y')).toBe('2');
  });
});
