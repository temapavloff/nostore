import { compose, createArray } from '@nostore/core';
import { filters } from './filters';
import { createStore } from '@nostore/core';

export type Todo = {
  title: string,
  completed: boolean,
};

export const todos = createArray<Todo>(JSON.parse(localStorage.getItem('todos') ?? '[]') as Todo[]);

todos.subscribe(v => {
  localStorage.setItem('todos', JSON.stringify(v));
});

export const todosView = compose([filters, todos], (newFilter, newTodos) => {
  if (newFilter.completion === 'all') {
    return newTodos
  }

  return newTodos.filter(t => {
    if (newFilter.completion === 'completed') {
      return t.completed;
    }
    return !t.completed;
  });
});

export const editor = createStore('');

export const addTodo = () => {
  const title = editor.get().trim();
  if (title) {
    todos.shift({ title, completed: false });
    editor.set('');
  }
};

export const toggleTodo = (index: number, completed: boolean) => {
  const current = todos.get()[index];
  if (current) {
    todos.replace(index, { ...current, completed })
  }
};

export const toggleAll = () => {
  const complete = todos.get().find(t => !t.completed) !== undefined;
  todos.set(todos.get().map(t => ({ ...t, completed: complete })));
};

export const deleteTodo = (index: number) => {
  todos.delete(index);
};

export const clearCompleted = () => {
  todos.set(todos.get().filter(t => !t.completed));
};
