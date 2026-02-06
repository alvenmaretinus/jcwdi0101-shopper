import { LRUCache } from "lru-cache";

const mb = 1024 * 1024;
const cache = new LRUCache<string, any>({
  maxSize: 10 * mb, // 10MB
});

export const cacheClient = {
  get<T>(key: any): T {
    return cache.get(key) as T;
  },
  set<T>(key: any, value: T) {
    cache.set(key, value);
  },
  del(key: any) {
    return cache.delete(key);
  },
};
