import { cacheClient } from "..";
import { Store, User } from "../../../../prisma/generated/client";

type _StoresWithEmployeeCount = Store & { employeeCount: number };

const storeCacheKeys = {
  all: () => "store:all",
  byId: (id: string) => `store:id:${id}`,
  withEmployees: (id: string) => `store:emp:${id}`,
  default: () => "store:default",
};

export const storeCache = {
  getAllStores: (): Store[] => cacheClient.get(storeCacheKeys.all()),
  setAllStores: (stores: Store[]) =>
    cacheClient.set(storeCacheKeys.all(), stores),
  clearAllStores: () => cacheClient.del(storeCacheKeys.all()),

  getDefaultStore: (): Store => cacheClient.get(storeCacheKeys.default()),
  setDefaultStore: (store: Store) =>
    cacheClient.set(storeCacheKeys.default(), store),
  clearDefaultStore: () => cacheClient.del(storeCacheKeys.default()),

  getStoreById: (id: string): Store => cacheClient.get(storeCacheKeys.byId(id)),
  setStoreById: (store: Store) =>
    cacheClient.set(storeCacheKeys.byId(store.id), store),
  clearStoreId: (id: string) => cacheClient.del(storeCacheKeys.byId(id)),

  getStoreByIdWithEmployee: (id: string): Store & { employees: User[] } =>
    cacheClient.get(storeCacheKeys.withEmployees(id)),
  setStoreByIdWithEmployee: (store: Store & { employees: User[] }) =>
    cacheClient.set(storeCacheKeys.withEmployees(store.id), store),
  clearStoreIdWithEmployee: (id: string) =>
    cacheClient.del(storeCacheKeys.withEmployees(id)),
};
