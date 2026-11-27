import { createMemoryStorage, type KeyValueStorage } from './key-value-storage';

export type { KeyValueStorage } from './key-value-storage';

const PREFIX = 'lbl:';

/** localStorage can be missing or throw (private windows, blocked site data); fall back to memory. */
export function createWebStorage(area: () => Storage | undefined): KeyValueStorage {
  const fallback = createMemoryStorage();

  function safe<T>(read: (s: Storage) => T, otherwise: () => T): T {
    try {
      const s = area();
      return s ? read(s) : otherwise();
    } catch {
      return otherwise();
    }
  }

  return {
    getString: (key) =>
      safe(
        (s) => s.getItem(PREFIX + key) ?? undefined,
        () => fallback.getString(key),
      ),
    set: (key, value) =>
      safe(
        (s) => s.setItem(PREFIX + key, value),
        () => fallback.set(key, value),
      ),
    remove: (key) =>
      safe(
        (s) => s.removeItem(PREFIX + key),
        () => fallback.remove(key),
      ),
    clearAll: () =>
      safe(
        (s) => {
          Object.keys(s)
            .filter((k) => k.startsWith(PREFIX))
            .forEach((k) => s.removeItem(k));
        },
        () => fallback.clearAll(),
      ),
  };
}

export const storage: KeyValueStorage = createWebStorage(() =>
  typeof localStorage === 'undefined' ? undefined : localStorage,
);
