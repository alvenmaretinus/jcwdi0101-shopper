import { LRUCache } from "lru-cache";

const mb = 1024 * 1024;
const cache = new LRUCache<string, any>({
  maxSize: 10 * mb, // 10MB total
  sizeCalculation: (value, key) => {
    // Rough estimate: key bytes + value bytes + overhead
    const keyBytes = Buffer.byteLength(key, "utf8");
    const valueStr = JSON.stringify(value);
    const valueBytes = Buffer.byteLength(valueStr, "utf8");
    return keyBytes + valueBytes + 64; // +64 bytes overhead per entry
  },
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
