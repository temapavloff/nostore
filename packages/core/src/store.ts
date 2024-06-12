import { createEmitter } from './emitter';
import { toReadonly } from './readonly';
import { createScheduler } from './scheduler';

const createStore = <T>(initialState: T) => {
  let currentState = initialState;
  const emitter = createEmitter<[T]>();

  const emit = createScheduler(() => emitter.emit(currentState));

  return {
    get() {
      return currentState;
    },

    set(nextState: T) {
      if (currentState !== nextState) {
        currentState = nextState;
        emit();
        return true;
      }

      return false;
    },

    subscribe(l: (nextValue: T) => void, sync = false) {
      if (sync) {
        l(currentState);
      }

      return emitter.subscribe(l);
    },

    unsubscribeAll: emitter.unsubscribeAll,
  };
};

export type Store<T> = ReturnType<typeof createStore<T>>;

export type ReadonlyStore<T> = Omit<Store<T>, 'set' | 'unsubscribeAll' | 'transact'>;

const toReadonlyStore = <T>(store: Store<T>): ReadonlyStore<T> => {
  return toReadonly(store, ['get', 'subscribe']);
};

export { createStore, toReadonlyStore };
