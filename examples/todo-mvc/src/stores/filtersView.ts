import { compose } from '@nostore/core';
import { todos } from './todos';
import { filters } from './filters';

export const filtersView = compose([todos, filters], (todos, filters) => {
  return {
    left: todos.filter(f => !f.completed).length,
    filter: filters.completion,
  }
});
