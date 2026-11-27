import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

import { storage } from './storage';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Bump when a persisted query shape changes so old caches are dropped instead of misread. */
export const QUERY_CACHE_BUSTER = '1';
export const QUERY_CACHE_KEY = 'query-cache';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // gcTime must be at least the persister maxAge or restored data is garbage collected.
        gcTime: DAY_MS,
        staleTime: 30_000,
        retry: 1,
        networkMode: 'offlineFirst',
      },
    },
  });
}

export const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.remove(key),
  },
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});

export const persistOptions = {
  persister: queryPersister,
  maxAge: DAY_MS,
  buster: QUERY_CACHE_BUSTER,
};
