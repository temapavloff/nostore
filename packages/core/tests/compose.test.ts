import test from 'node:test';
import assert from 'node:assert';
import { createArray, createStore, compose } from '../src/index';

const TODOS = [
  { id: 1, text: 'make things done', completed: false },
  { id: 2, text: 'pay bills', completed: true },
  { id: 3, text: 'buy food', completed: false },
  { id: 4, text: 'paint it black', completed: true },
  { id: 5, text: 'relax', completed: false },
];

test('should create a new store', () => {
  const todosStore = createArray([...TODOS]);
  const completedStore = createStore(false);
  const filteredTodosStore = compose([todosStore, completedStore], (todos, completed) => {
    return todos.filter(i => i.completed === completed);
  });

  assert.equal(typeof filteredTodosStore, 'object');
  assert.deepEqual(filteredTodosStore.get(), [
    TODOS[0], TODOS[2], TODOS[4],
  ]);

  completedStore.set(true);
  assert.deepEqual(filteredTodosStore.get(), [
    TODOS[1], TODOS[3],
  ]);

  todosStore.replace(0, { ...TODOS[0], completed: true });
  assert.deepEqual(filteredTodosStore.get(), [
    { ...TODOS[0], completed: true }, TODOS[1], TODOS[3],
  ]);
});
