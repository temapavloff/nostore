import test from 'node:test';
import * as assert from 'node:assert';
import { toReadonly } from '../src/index';

test('should pick only given keys from the given object', () => {
  const picked = toReadonly({ key1: 1, key2: 2, key3: 3 }, ['key1', 'key2']);

  assert.deepEqual(picked, { key1: 1, key2: 2 });
});

test('should cache objects', () => {
  const obj = { key1: 1, key2: 2, key3: 3 };
  const picked1 = toReadonly(obj, ['key1', 'key2']);
  const picked2 = toReadonly(obj, ['key1', 'key2']);

  assert.strictEqual(picked1, picked2);
});
