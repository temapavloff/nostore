import test from 'node:test';
import assert from 'node:assert';
import { createRecord, toReadonlyRecord } from '../src/index';

test('should create a new record store', () => {
  const recordStore = createRecord({});

  assert.equal(typeof recordStore, 'object');
});

test('should be able to change record stores\' value', () => {
  const recordStore = createRecord({ key: 1 });

  assert.deepEqual(recordStore.get(), { key: 1 });
  assert.deepEqual(recordStore.set({ key: 2 }), ['key']);
  assert.deepEqual(recordStore.get(), { key: 2 });
});

test('should be able to have optional keys in record stores', () => {
  const recordStore = createRecord<{ key: number, optionalKey?: number }>({ key: 1 });

  assert.deepEqual(recordStore.get(), { key: 1 });
  assert.deepEqual(recordStore.set({ key: 2, optionalKey: 2 }), ['key', 'optionalKey']);
  assert.deepEqual(recordStore.get(), { key: 2, optionalKey: 2 });
  assert.deepEqual(recordStore.set({ key: 2, optionalKey: undefined }), ['optionalKey']);
  recordStore.set({ key: 2 });
});

test('should be able to independently change record stores\' keys', () => {
  const recordStore = createRecord<{ key: number, optionalKey?: number }>({ key: 1 });

  assert.deepEqual(recordStore.get(), { key: 1 });

  assert.equal(recordStore.setKey('key', 2), true);
  assert.equal(recordStore.get().key, 2);

  assert.equal(recordStore.setKey('optionalKey', 2), true);
  assert.equal(recordStore.get().optionalKey, 2);
});

test('should be able to subscribe to record stores\' value change', (t) => {
  const recordStore = createRecord<{ key: number, optionalKey?: number }>({ key: 1 });
  const listener = t.mock.fn()

  recordStore.subscribeOnKey('key', listener);

  assert.equal(listener.mock.callCount(), 0);
  recordStore.setKey('key', 2);
  assert.equal(listener.mock.callCount(), 1);
  assert.equal(listener.mock.calls[0].arguments[0], 2);
});

test('should be able to unsubscribe from record stores\' value change', (t) => {
  const recordStore = createRecord<{ key: number, optionalKey?: number }>({ key: 1 });
  const listener = t.mock.fn()

  const unsubscribe = recordStore.subscribeOnKey('key', listener);

  assert.equal(listener.mock.callCount(), 0);
  recordStore.setKey('key', 2);
  assert.equal(listener.mock.callCount(), 1);
  unsubscribe();
  recordStore.setKey('key', 3);
  assert.equal(listener.mock.callCount(), 1);
});

test('should call listener only for changed record stores\' keys', (t) => {
  const recordStore = createRecord<{ key: number, optionalKey?: number }>({ key: 1 });
  const listenerKey = t.mock.fn();
  const listenerOptional = t.mock.fn()

  recordStore.subscribeOnKey('key', listenerKey);
  recordStore.subscribeOnKey('optionalKey', listenerOptional);

  assert.equal(listenerKey.mock.callCount(), 0);
  assert.equal(listenerOptional.mock.callCount(), 0);

  recordStore.set({ key: 2 });
  assert.equal(listenerKey.mock.callCount(), 1);
  assert.equal(listenerOptional.mock.callCount(), 0);

  recordStore.set({ key: 2, optionalKey: 2 });
  assert.equal(listenerKey.mock.callCount(), 1);
  assert.equal(listenerOptional.mock.callCount(), 1);

  recordStore.set({ key: 3, optionalKey: 3 });
  assert.equal(listenerKey.mock.callCount(), 2);
  assert.equal(listenerOptional.mock.callCount(), 2);
});

test('should call wildcard listener on any changes', (t) => {
  const recordStore = createRecord<{ key: number, optionalKey?: number }>({ key: 1 });
  const listener = t.mock.fn();

  recordStore.subscribe(listener);

  recordStore.setKey('key', 2);
  assert.equal(listener.mock.callCount(), 1);
  assert.deepEqual(listener.mock.calls[0].arguments[0], { key: 2 });
  assert.deepEqual(listener.mock.calls[0].arguments[1], ['key']);

  recordStore.set({ key: 3 });
  assert.equal(listener.mock.callCount(), 2);
  assert.deepEqual(listener.mock.calls[1].arguments[0], { key: 3 });
  assert.deepEqual(listener.mock.calls[1].arguments[1], ['key']);


  recordStore.set({ key: 4, optionalKey: 4 });
  assert.equal(listener.mock.callCount(), 3);

  assert.deepEqual(listener.mock.calls[2].arguments[0], { key: 4, optionalKey: 4 });
  assert.deepEqual(listener.mock.calls[2].arguments[1], ['key', 'optionalKey']);

});


test('should be able to use readonly records', (t) => {
  const store = createRecord({ key: 1 });
  const readonlyStore = toReadonlyRecord(store);
  const wrap = t.mock.fn();

  readonlyStore.subscribeOnKey('key', wrap);

  store.setKey('key', 2);

  assert.deepEqual(readonlyStore.get(), { key: 2 });
  assert.equal(wrap.mock.calls[0].arguments[0], 2);
  assert.equal(wrap.mock.calls[0].result, undefined);
});
