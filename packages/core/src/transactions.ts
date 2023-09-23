import { createEmitter } from './emitter';

let locked = false;
const storesSet = new Set<any>();

const isLocked = () => locked;

const unlockEmitter = createEmitter<never[]>();

const onUnlock = (key: any, cb: () => void) => {
  if (!isLocked()) {
    cb();
    return;
  }
  if (storesSet.has(key)) {
    return;
  }
  storesSet.add(key);
  unlockEmitter.subscribe(cb);
};

const transact = (fn: () => void) => {
  locked = true;
  fn();
  unlockEmitter.emit();
  unlockEmitter.unsubscribeAll();
  locked = false;
  const hasChanged = storesSet.size > 0;
  storesSet.clear();
  return hasChanged;
};

export { isLocked, transact, onUnlock };
