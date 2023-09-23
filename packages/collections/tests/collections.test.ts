import test from 'node:test';
import * as assert from 'node:assert';
import posts1 from './mocks/posts1.json';
import posts2 from './mocks/posts2.json';
import { createCollection } from '../src/index';

let mockPosts1 = structuredClone(posts1);
let mockPosts2 = structuredClone(posts2);

test.beforeEach(() => {
  mockPosts1 = structuredClone(posts1);
  mockPosts2 = structuredClone(posts2);
});

test('should create a collection', () => {
  const postsStore = createCollection(mockPosts1, 'id');

  assert.equal(typeof postsStore, 'object');
});

test('should be possible to get an item by id', () => {
  const postsStore = createCollection(mockPosts1, 'id');

  assert.equal(postsStore.getItem(2), mockPosts1[1]);
});

test('should be possible to push new data into collection', () => {
  const postsStore = createCollection(mockPosts1, 'id');

  postsStore.insert(...mockPosts2);
  assert.deepEqual(postsStore.get(), [...mockPosts1, ...mockPosts2]);
});

test('should not be possible to insert duplicates', () => {
  const postsStore = createCollection(mockPosts1, 'id');

  assert.throws(() => postsStore.insert(...mockPosts1));
});

test('should be possible to upsert items', () => {
  const postsStore = createCollection(mockPosts1, 'id');

  postsStore.upsert(
    { ...mockPosts1[0], title: 'new title', body: 'new body' },
    { ...mockPosts2[0] },
  );

  const [_, ...rest] = mockPosts1;
  assert.deepEqual(
    postsStore.get(),
    [
      { ...mockPosts1[0], title: 'new title', body: 'new body' },
      ...rest,
      { ...mockPosts2[0] },
    ],
  );
});

test('should call listeners on upsert exaclty once', (t) => {
  const postsStore = createCollection(mockPosts1, 'id');
  const l = t.mock.fn();

  postsStore.subscribe(l);
  postsStore.upsert(
    { ...mockPosts1[0], title: 'new title', body: 'new body' },
    { ...mockPosts2[0] },
  );

  assert.equal(l.mock.callCount(), 1);
  const [_, ...rest] = mockPosts1;
  assert.deepEqual(
    l.mock.calls[0].arguments[0],
    [
      { ...mockPosts1[0], title: 'new title', body: 'new body' },
      ...rest,
      { ...mockPosts2[0] },
    ],
  );
});

test('should be possible to partially update existing record of the collection', () => {
  const postsStore = createCollection(mockPosts1, 'id');

  postsStore.update(2, { title: 'new title' });
  assert.deepEqual(postsStore.getItem(2), { ...mockPosts1[1], title: 'new title' });
});

test('should not be possible to update record with broken identity', () => {
  const postsStore = createCollection(mockPosts1, 'id');

  assert.throws(() => postsStore.update(2, { id: 3, title: 'new title' }));
});

test('should be possible to delete an item from the collecttion', () => {
  const postsStore = createCollection(mockPosts1, 'id');

  postsStore.delete(1);
  const [_, ...rest] = mockPosts1;
  assert.deepEqual(
    postsStore.get(),
    [...rest],
  );
});
