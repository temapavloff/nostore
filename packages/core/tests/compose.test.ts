import test from 'node:test';
import assert from 'node:assert';
import { createArray, createStore, compose } from '../src/index';
import { nextTick } from './utils/utils';

const TODOS = [
  { id: 1, text: 'make things done', completed: false },
  { id: 2, text: 'pay bills', completed: true },
  { id: 3, text: 'buy food', completed: false },
  { id: 4, text: 'paint it black', completed: true },
  { id: 5, text: 'relax', completed: false },
];

test('should create a new store', async () => {
  const todosStore = createArray([...TODOS]);
  const completedStore = createStore(false);
  const filteredTodosStore = compose([todosStore, completedStore], (todos, completed) => {
    return todos.filter(i => i.completed === completed);
  });

  await nextTick();
  assert.equal(typeof filteredTodosStore, 'object');
  assert.deepEqual(filteredTodosStore.get(), [
    TODOS[0], TODOS[2], TODOS[4],
  ]);

  completedStore.set(true);
  await nextTick();
  assert.deepEqual(filteredTodosStore.get(), [
    TODOS[1], TODOS[3],
  ]);

  todosStore.replace(0, { ...TODOS[0], completed: true });
  await nextTick();
  assert.deepEqual(filteredTodosStore.get(), [
    { ...TODOS[0], completed: true }, TODOS[1], TODOS[3],
  ]);
});

test('should be able to use regular values as compose arguments', () => {
  const userId = createStore(1);
  const postId = createStore(1);

  const pathStore = compose(['/users/', userId, '/posts/', postId], (...args) => {
    return args.join('');
  });

  assert.equal(pathStore.get(), '/users/1/posts/1');
});

test('should call listeners once during one event loop circle', async (t) => {
  const a = createStore(1);
  const b = createStore(1);

  const mult = compose([a, b], (a, b) => ({ a, b }));
  const l = t.mock.fn();
  mult.subscribe(l);

  assert.deepEqual(mult.get(), { a: 1, b: 1 });

  a.set(2);
  b.set(2);

  await nextTick();
  assert.deepEqual(mult.get(), { a: 2, b: 2 });
  assert.equal(l.mock.callCount(), 1);
});
