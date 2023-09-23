import { createEmitter } from './emitter';
import { toReadonly } from './readonly';
import { Store, createStore, toReadonlyStore } from './store';
import { isLocked, onUnlock, transact } from './transactions';

type Entries<T, K extends keyof T> = {
  [P in K]: [P, T[P]];
}[K][];

type StoresMap<T, K extends keyof T> = { [P in K]: Store<T[P]> };

const createRecord = <T extends object, K extends keyof T = keyof T>(initialState: T) => {
  const emitter = createEmitter<[T, K[]]>();
  const storesMap: StoresMap<T, K> = Object.entries(initialState).reduce((m, [k, v]) => ({
    ...m,
    [k]: createStore(v),
  }), {} as StoresMap<T, K>);

  const getOrCreateStore = <P extends K>(key: P): Store<T[P]> => {
    let store = storesMap[key];

    if (!store) {
      // In this case the default value of the store is undefined
      store = createStore(undefined as T[P]);
      storesMap[key] = store;
    }

    return store;
  };

  const getCurrentState = () => (Object.entries(storesMap) as Entries<StoresMap<T, K>, K>).reduce((m, [k, v]) => ({
    ...m,
    [k]: v?.get(),
  }), {} as T);

  return {
    get() {
      return getCurrentState();
    },

    set(nextState: T) {
      const changedKeys: K[] = [];
      transact(() => {
        (Object.entries(nextState) as Entries<T, K>).forEach(([k, v]) => {
          const store = getOrCreateStore(k);
          if (store.set(v)) {
            changedKeys.push(k);
          }
        });
      });

      if (changedKeys.length > 0) {
        if (isLocked()) {
          onUnlock(emitter, () => {
            const currentState = getCurrentState();
            emitter.emit(currentState, Object.keys(currentState) as K[]);
          });
        } else {
          emitter.emit(getCurrentState(), changedKeys);
        }
      }

      return changedKeys;
    },

    setKey<P extends K>(key: P, value: T[P]) {
      const store = getOrCreateStore(key);
      if (store.set(value)) {
        emitter.emit(getCurrentState(), [key]);
        return true;
      }

      return false;
    },

    subscribeOnKey<P extends K = K>(
      key: P,
      listener: (value: T[P]) => void,
      sync = false,
    ) {
      const store = getOrCreateStore(key);
      return store.subscribe(listener, sync);
    },

    subscribe(
      l: (nextState: T, changedKeys: K[]) => void,
      sync = false,
    ) {
      if (sync) {
        const currentState = getCurrentState();
        l(currentState, Object.keys(currentState) as K[]);
      }

      return emitter.subscribe(l);
    },

    unsubscribeAll: emitter.unsubscribeAll,

    getStoreForKey(key: K) {
      return toReadonlyStore(getOrCreateStore(key));
    },
  };
};

export type RecordStore<T extends object, K extends keyof T> = ReturnType<typeof createRecord<T, K>>;

export type ReadonlyRecord<T extends object, K extends keyof T> = Omit<RecordStore<T, K>, 'set' | 'setKey' | 'unsubscribeAll'>;

const toReadonlyRecord = <T extends object, K extends keyof T>(store: RecordStore<T, K>): ReadonlyRecord<T, K> => {
  return toReadonly(store, ['get', 'subscribe', 'subscribeOnKey', 'getStoreForKey']);
};

export { createRecord, toReadonlyRecord };
