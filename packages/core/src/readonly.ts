const weakCache = new WeakMap<any>();

const copyKeys = <T, K extends keyof T>(
  target: Partial<T>,
  value: T,
  pickKeys: K[],
): target is T => {
  for (const k of pickKeys) {
    target[k] = value[k];
  }
  return true;
};

const toReadonly = <T, K extends keyof T>(
  store: T,
  pickKeys: K[],
): Pick<T, K> => {

  if (weakCache.has(store)) {
    return weakCache.get(store);
  }

  const target: Partial<T> = {};
  if (!copyKeys(target, store, pickKeys)) {
    throw new Error();
  }

  weakCache.set(store, target);
  return target;
};

export { toReadonly };
