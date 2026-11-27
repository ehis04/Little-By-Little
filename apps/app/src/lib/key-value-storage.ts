// The storage contract and an in-memory implementation, shared by every platform file.

export type KeyValueStorage = {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
  clearAll(): void;
};

export function createMemoryStorage(): KeyValueStorage {
  const data = new Map<string, string>();
  return {
    getString: (key) => data.get(key),
    set: (key, value) => {
      data.set(key, value);
    },
    remove: (key) => {
      data.delete(key);
    },
    clearAll: () => {
      data.clear();
    },
  };
}

