export type MinimalStore<T> = {
  get(): T,
  subscribe(l: (value: T) => void, sync?: boolean): () => void,
};
