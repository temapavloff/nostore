import test from 'node:test';
import assert from 'node:assert';
import { createStore, transact } from '../src/index';

test('should call listeners only once if the transaction is used', (t) => {
  const numberStore = createStore(0);
  const incr = () => numberStore.set(numberStore.get() + 1);
  const l = t.mock.fn();
  numberStore.subscribe(l);

  transact(() => {
    incr();
    incr();
    incr();
  });

  assert.equal(numberStore.get(), 3);
  assert.equal(l.mock.callCount(), 1);
  assert.equal(l.mock.calls[0].arguments[0], 3);
});
