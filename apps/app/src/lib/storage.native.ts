import { createMMKV } from 'react-native-mmkv';

import type { KeyValueStorage } from './key-value-storage';

export type { KeyValueStorage } from './key-value-storage';

const mmkv = createMMKV({ id: 'lbl' });

export const storage: KeyValueStorage = {
  getString: (key) => mmkv.getString(key),
  set: (key, value) => mmkv.set(key, value),
  remove: (key) => {
    mmkv.remove(key);
  },
  clearAll: () => mmkv.clearAll(),
};
