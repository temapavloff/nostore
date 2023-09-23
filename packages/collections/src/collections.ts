import { createArray, toReadonly, transact } from '@nostore/core';

const createIdentityFunction = <T extends object, K extends keyof T>(
  idKey: K | ((identity: T) => string)
) => {
  if (typeof idKey === 'function') {
    return idKey;
  }

  return (item: T) => item[idKey];
}

type IdentityFunction<T extends object, K extends keyof T> = ReturnType<typeof createIdentityFunction<T, K>>;

const initializeIndex = <T extends object, K extends keyof T>(initialValue: T[], identityFunction: IdentityFunction<T, K>) => {
  return new Map(
    initialValue.map((item, index) => [identityFunction(item), index]),
  );
};

const createCollection = <T extends object, K extends keyof T>(
  initialValue: T[],
  idKey: K | ((item: T) => string),
) => {
  const identityFunction = createIdentityFunction(idKey);
  const store = createArray(initialValue);
  let index = initializeIndex(initialValue, identityFunction);

  const isInIndex = (item: T): boolean => {
    return index.has(identityFunction(item));
  };

  const getIndexByItem = (item: T): number | undefined => {
    return index.get(identityFunction(item));
  }

  const insert = (...items: T[]) => {
    const duplicate = items.find(isInIndex);
    if (duplicate !== undefined) {
      throw new Error(`Duplicate found: ${JSON.stringify(duplicate)}. Use the CollectionStore.upsert method if you need to insert and update at the same time`);
    }

    const pushed = store.push(...items);
    if (pushed) {
      const offset = store.get().length - items.length;
      items.forEach((item, i) => index.set(identityFunction(item), i + offset));
    }

    return pushed;
  };

  return {
    get: store.get,
    subscribe: store.subscribe,
    unsubscribeAll: store.unsubscribeAll,

    getItem(id: ReturnType<typeof identityFunction>) {
      const idx = index.get(id);
      if (!idx) {
        return null;
      }

      return store.get()[idx] ?? null;
    },

    set(newValue: T[]) {
      const result = store.set(newValue);
      if (result) {
        index = initializeIndex(newValue, identityFunction);
      }

      return result;
    },

    insert: insert,

    upsert(...items: T[]) {
      return transact(() => {
        const itemsToInsert: T[] = [];
        for (const i of items) {
          const idx = getIndexByItem(i);
          if (idx === undefined) {
            itemsToInsert.push(i);
          } else {
            store.replace(idx, i);
          }
        }
        insert(...itemsToInsert);
      });
    },

    update(id: ReturnType<typeof identityFunction>, nextItem: Partial<T>) {
      const idx = index.get(id);
      if (idx === undefined) {
        return false;
      }

      const prevItem = store.get()[idx];
      if (!prevItem) {
        return false;
      }

      const mergedItem = { ...prevItem, ...nextItem };
      const newIdentity = identityFunction(mergedItem);
      if (newIdentity !== id) {
        throw new Error(`Identity mismatch: ${id} != ${newIdentity}.`);
      }

      return store.replace(idx, mergedItem);
    },

    delete(id: ReturnType<typeof identityFunction>) {
      const idx = index.get(id);
      if (idx !== undefined) {
        const deleted = store.delete(idx);
        if (deleted) {
          index.delete(id);
        }
        return deleted;
      }

      return false;
    },
  }
};

export type CollectionStore<T extends object, K extends keyof T> = ReturnType<typeof createCollection<T, K>>;

const toReadonlyCollection = <T extends object, K extends keyof T>(store: CollectionStore<T, K>) => {
  return toReadonly(store, ['get', 'getItem', 'subscribe']);
};

export { createCollection, toReadonlyCollection };
