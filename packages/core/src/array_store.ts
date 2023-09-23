import { toReadonly } from './readonly';
import { createStore } from './store';

const createArray = <T>(initialState: T[]) => {
  const store = createStore(initialState);

  const checkBounds = (index: number, fn: () => boolean): boolean => {
    if (index < 0 || index >= store.get().length) {
      return false;
    }

    return fn();
  }

  return {
    ...store,

    push(...newItems: T[]) {
      const state = store.get();
      return store.set(
        state.toSpliced(state.length, 0, ...newItems),
      );
    },

    pop() {
      const state = store.get();
      if (state.length === 0) {
        return false;
      }

      return store.set(
        state.toSpliced(state.length - 1, 1),
      );
    },

    shift(...newItems: T[]) {
      return store.set(
        store.get().toSpliced(0, 0, ...newItems),
      );
    },

    unshift() {
      const state = store.get();
      if (state.length === 0) {
        return false;
      }

      return store.set(
        state.toSpliced(0, 1),
      );
    },

    replace: (index: number, newItem: T) => {
      return checkBounds(index, () => {
        const state = store.get();
        if (state[index] === newItem) {
          return false;
        }

        return store.set(
          state.with(index, newItem),
        );
      });
    },

    insertInto: (index: number, ...newItems: T[]) => {
      return checkBounds(index, () => {
        return store.set(
          store.get().toSpliced(index, 0, ...newItems),
        );
      });
    },

    delete: (index: number) => {
      return checkBounds(index, () => {
        return store.set(
          store.get().toSpliced(index, 1),
        );
      });
    },
  }
};

export type ArrayStore<T> = ReturnType<typeof createArray<T>>;

const toReadonlyArray = <T>(store: ArrayStore<T>) => {
  return toReadonly(store, ['get', 'subscribe']);
};

export type ReadonlyArray<T> = ReturnType<typeof toReadonlyArray<T>>;

export { createArray, toReadonlyArray };
