import { ReadonlyStore, createStore, toReadonlyStore } from './store';
import { type MinimalStore } from './types';
import { isStore } from './utils';

const getValue = (storeOrValue: any | MinimalStore<any>): StoreValue<typeof storeOrValue> => {
  return isStore(storeOrValue) ? storeOrValue.get() : storeOrValue;
};

type StoreValue<S> = S extends MinimalStore<infer T> ? T : S;

const compose = <R, S extends Array<any | MinimalStore<any>>>(
  stores: [...S],
  composer: (...args: { [Index in keyof S]: StoreValue<S[Index]> }) => R,
): ReadonlyStore<R> => {
  const initialValue = composer(...stores.map(s => getValue(s)) as { [Index in keyof S]: StoreValue<S[Index]> });
  const store = createStore(initialValue);

  const listener = () => {
    store.set(composer(...stores.map(s => getValue(s)) as { [Index in keyof S]: StoreValue<S[Index]> }));
  };

  stores.forEach(s => {
    if (isStore(s)) {
      s.subscribe(listener);
    }
  });

  return toReadonlyStore(store);
};

export { compose };
