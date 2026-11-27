// Key-value storage behind one interface. Metro picks storage.native.ts (MMKV) or storage.web.ts
// (localStorage) at bundle time; this file is the in-memory fallback that Node tooling and
// TypeScript resolve to.
import { createMemoryStorage, type KeyValueStorage } from './key-value-storage';

export type { KeyValueStorage } from './key-value-storage';

export const storage: KeyValueStorage = createMemoryStorage();
