import { MinimalStore, compose, createRecord, toReadonlyRecord, transact } from '@nostore/core';

export type CacheEngine<T> = {
  setKey(key: string, value: T): void,
  getKey(key: string): T | undefined,
  dropKey(key: string): void,
  flush(): void,
};

const createEvergreenCache = <T>(): CacheEngine<T> => {
  let storage = new Map<string, T>();

  return {
    setKey(key, value) {
      storage.set(key, value);
    },

    getKey(key) {
      return storage.get(key);
    },

    dropKey(key) {
      storage.delete(key);
    },

    flush() {
      storage = new Map<string, T>();
    },
  }
};

type MaybePromise<T> = T | Promise<T>;

type PrimitiveKeyPart = string | number;

type KeyPart = PrimitiveKeyPart | MinimalStore<PrimitiveKeyPart>;

const isPromise = <T>(value: MaybePromise<T>): value is Promise<T> => {
  return value instanceof Promise;
}

const serializeKey = (parts: PrimitiveKeyPart[]) => parts.join();

const createRemote = <T>(
  key: KeyPart[],
  sync: (...args: PrimitiveKeyPart[]) => MaybePromise<T>,
  { initialValue = null, cache = createEvergreenCache() }: { initialValue?: T | null, cache: CacheEngine<T> },
) => {
  const keyStore = compose(key, (...args) => args);
  const stateStore = createRecord<{
    loading: boolean,
    updaing: boolean,
    error: Error | null,
    data: T | null,
  }>({ loading: false, updaing: false, error: null, data: initialValue });

  if (initialValue) {
    cache.setKey(serializeKey(keyStore.get()), initialValue);
  }

  const runSync = async (key: PrimitiveKeyPart[]) => {
    const keyString = serializeKey(key);
    try {
      transact(() => {
        const oldValue = cache.getKey(keyString);
        if (oldValue) {
          stateStore.setKey('data', oldValue);
          stateStore.setKey('updaing', true);
        } else {
          stateStore.setKey('data', null);
          stateStore.setKey('loading', true);
        }
      });

      let maybeResult = sync(...key);
      let result: T | null = null;
      if (isPromise(maybeResult)) {
        result = await maybeResult;
      }

      stateStore.setKey('data', result);
      transact(() => {
        stateStore.setKey('data', result);
        stateStore.setKey('error', null);
      });

    } catch (e) {
      stateStore.setKey('error', e instanceof Error ? e : new Error(String(e)));
    } finally {
      transact(() => {
        stateStore.setKey('loading', false);
        stateStore.setKey('updaing', false);
      });
    }
  };

  const dropKey = (cachedKey: string) => {
    cache.dropKey(cachedKey);
    if (cachedKey === serializeKey(keyStore.get())) {
      runSync(keyStore.get());
    }
  };

  const updateKey = (cachedKey: string, value: T) => {
    cache.setKey(cachedKey, value);
    if (cachedKey === serializeKey(keyStore.get())) {
      stateStore.setKey('data', value);
    }
  };

  const flush = () => {
    cache.flush();
    runSync(keyStore.get());
  }

  keyStore.subscribe(runSync, true);

  return {
    store: toReadonlyRecord(stateStore),

    createMutator<M>(mutator: (
      data: M,
      controls: {
        updateKey: typeof updateKey,
        dropKey: typeof dropKey,
        flush: typeof flush,
      }
    ) => Promise<any>) {
      let tmpUpdates: [string, T][] = [];
      const wrappedKeyUpdate = (key: string, value: T) => {
        tmpUpdates.push([key, value]);
        updateKey(key, value);
      };
      return async (data: M) => {
        try {
          await mutator(data, { updateKey: wrappedKeyUpdate, dropKey, flush });
        } catch (e) {
          tmpUpdates.forEach(([key, value]) => {
            updateKey(key, value);
          });
          throw e;
        } finally {
          tmpUpdates = [];
        }
      };
    },

    refresh() {
      dropKey(serializeKey(keyStore.get()));
    },
  }
};

export { createRemote };
