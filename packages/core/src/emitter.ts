const createEmitter = <A extends any[]>() => {
  const listeners = new Set<(...value: A) => void>();

  return {
    emit: (...value: A) => {
      listeners.forEach(l => l(...value));
    },
    subscribe: (cb: (...value: A) => void): () => void => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    unsubscribeAll: () => {
      listeners.forEach(l => listeners.delete(l));
    },
  };
};

export { createEmitter };
