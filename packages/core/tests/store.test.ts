import test from 'node:test';
import assert from 'node:assert';
import { createStore, toReadonlyStore } from '../src/index';

test('should create a new store', () => {
  const numberStore = createStore(1);

  assert.equal(typeof numberStore, 'object');
});

test('should be able to change stores\' value', () => {
  const numberStore = createStore(1);

  assert.equal(numberStore.get(), 1);
  assert.equal(numberStore.set(2), true);
  assert.equal(numberStore.get(), 2);
});

test('should be able to subscribe to stores\' value change', (t) => {
  t.mock.fn();
  const numberStore = createStore(1);
  const listener = t.mock.fn();
  numberStore.subscribe(listener);

  assert.equal(listener.mock.callCount(), 0);
  numberStore.set(2);
  assert.equal(listener.mock.callCount(), 1);
  assert.equal(listener.mock.calls[0].arguments[0], 2);
});

test('should not call listener if stores\' value does not change', (t) => {
  const numberStore = createStore(1);
  const listener = t.mock.fn();

  numberStore.subscribe(listener);

  assert.equal(listener.mock.callCount(), 0);
  assert.equal(numberStore.set(2), true);
  assert.equal(listener.mock.callCount(), 1);
  assert.equal(numberStore.set(2), false);
  assert.equal(listener.mock.callCount(), 1);
});

test('should be able to unsubscribe from stores\' value change', (t) => {
  const numberStore = createStore(1);
  const listener = t.mock.fn();

  const unsubscribe = numberStore.subscribe(listener);

  assert.equal(listener.mock.callCount(), 0);
  numberStore.set(2);
  assert.equal(listener.mock.callCount(), 1);
  assert.equal(listener.mock.calls[0].arguments[0], 2);
  unsubscribe();
  numberStore.set(3);
  assert.equal(listener.mock.callCount(), 1);
});

test('should subscribe each listener only once', (t) => {
  const numberStore = createStore(1);
  const listener = t.mock.fn();

  numberStore.subscribe(listener);
  numberStore.subscribe(listener);

  assert.equal(listener.mock.callCount(), 0);
  numberStore.set(2);
  assert.equal(listener.mock.callCount(), 1);
  assert.equal(listener.mock.calls[0].arguments[0], 2);
});

test('should be able to have more the one listener', (t) => {
  const numberStore = createStore(1);
  const listener1 = t.mock.fn();
  const listener2 = t.mock.fn();

  numberStore.subscribe(listener1);
  numberStore.subscribe(listener2);

  assert.equal(listener1.mock.callCount(), 0);
  assert.equal(listener2.mock.callCount(), 0);

  numberStore.set(2);

  assert.equal(listener1.mock.callCount(), 1);
  assert.equal(listener1.mock.calls[0].arguments[0], 2);
  assert.equal(listener2.mock.callCount(), 1);
  assert.equal(listener2.mock.calls[0].arguments[0], 2);

});

test('should be able to use readonly stores', (t) => {
  const store = createStore(1);
  const readonlyStore = toReadonlyStore(store);
  const wrap = t.mock.fn();

  readonlyStore.subscribe(wrap);

  store.set(2);

  assert.equal(readonlyStore.get(), 2);
  assert.equal(wrap.mock.calls[0].arguments[0], 2);
  assert.equal(wrap.mock.calls[0].result, undefined);
});
