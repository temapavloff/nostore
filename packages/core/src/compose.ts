import { ReadonlyStore, createStore, toReadonlyStore } from './store';

type MinimalStore<T> = {
  get(): T,
  subscribe(l: (value: T) => void, sync?: boolean): () => void,
};

type StoreValue<S> = S extends MinimalStore<infer T> ? T : never;

const compose = <R, S extends MinimalStore<any>[]>(
  stores: [...S],
  composer: (...args: { [Index in keyof S]: StoreValue<S[Index]> }) => R,
): ReadonlyStore<R> => {
  const initialValue = composer(...stores.map(s => s.get()) as { [Index in keyof S]: StoreValue<S[Index]> });
  const store = createStore(initialValue);

  const listener = () => {
    store.set(composer(...stores.map(s => s.get()) as { [Index in keyof S]: StoreValue<S[Index]> }));
  };

  stores.forEach(s => {
    s.subscribe(listener);
  });

  return toReadonlyStore(store);
};

export { compose };
