import test from 'node:test';
import assert from 'node:assert';
import { createArray, toReadonlyArray } from '../src/index';

test('should create a new store', () => {
  const numberStore = createArray([1]);

  assert.equal(typeof numberStore, 'object');
});

test('should be possible to use mutator methods', (t) => {
  const numberStore = createArray([1, 2, 3]);
  const l = t.mock.fn();
  numberStore.subscribe(l);

  numberStore.push(4);
  assert.equal(l.mock.callCount(), 1);
  assert.deepEqual(l.mock.calls[0].arguments[0], [1, 2, 3, 4]);

  numberStore.pop();
  assert.equal(l.mock.callCount(), 2);
  assert.deepEqual(l.mock.calls[1].arguments[0], [1, 2, 3]);

  numberStore.shift(0);
  assert.equal(l.mock.callCount(), 3);
  assert.deepEqual(l.mock.calls[2].arguments[0], [0, 1, 2, 3]);

  numberStore.unshift();
  assert.equal(l.mock.callCount(), 4);
  assert.deepEqual(l.mock.calls[3].arguments[0], [1, 2, 3]);

  numberStore.replace(1, 555);
  assert.equal(l.mock.callCount(), 5);
  assert.deepEqual(l.mock.calls[4].arguments[0], [1, 555, 3]);

  numberStore.insertInto(1, 4);
  assert.equal(l.mock.callCount(), 6);
  assert.deepEqual(l.mock.calls[5].arguments[0], [1, 4, 555, 3]);


  numberStore.delete(1);
  assert.equal(l.mock.callCount(), 7);
  assert.deepEqual(l.mock.calls[6].arguments[0], [1, 555, 3]);

});

test('should not call listeners after opopping/unshifting on empty collection', (t) => {
  const numberStore = createArray([]);
  const l = t.mock.fn();
  numberStore.subscribe(l);

  numberStore.pop();
  numberStore.unshift();

  assert.equal(l.mock.callCount(), 0);
});

test('should not call listener when trying to modify data out of collection boundaries', (t) => {
  const numberStore = createArray([1, 2, 3]);
  const l = t.mock.fn();
  numberStore.subscribe(l);

  numberStore.replace(-1, 555);
  numberStore.replace(100, 555);
  numberStore.insertInto(-1, 4);
  numberStore.insertInto(100, 4);
  numberStore.delete(-1);
  numberStore.delete(100);

  assert.equal(l.mock.callCount(), 0);
});

test('should not call listener when trying to modify not existing item', (t) => {
  const numberStore = createArray([1, 2, 3]);
  const l = t.mock.fn();
  numberStore.subscribe(l);

  numberStore.replace(555, 1);
  numberStore.insertInto(555, 1);
  numberStore.delete(555);

  assert.equal(l.mock.callCount(), 0);
});

test('should not call listener if replaced item is equal to the new item', (t) => {
  const numberStore = createArray([1, 2, 3]);
  const l = t.mock.fn();
  numberStore.subscribe(l);

  numberStore.replace(1, 2);

  assert.equal(l.mock.callCount(), 0);
});

test('should be able to use readonly collections', (t) => {
  const store = createArray([1, 2, 3]);
  const readonlyStore = toReadonlyArray(store);
  const wrap = t.mock.fn();

  readonlyStore.subscribe(wrap);

  store.set([2]);

  assert.deepEqual(readonlyStore.get(), [2]);
  assert.deepEqual(wrap.mock.calls[0].arguments[0], [2]);
  assert.equal(wrap.mock.calls[0].result, undefined);
});
