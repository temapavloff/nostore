import { useSyncExternalStore } from 'react';
import { filtersView } from '../stores/filtersView';
import { updateFilters } from '../stores/filters';
import { clearCompleted } from '../stores/todos';

const Filters = () => {
  const { filter, left } = useSyncExternalStore(filtersView.subscribe, filtersView.get);

  return (
    <>
      <span className="todo-count"><strong>{left}</strong> item{left > 1 ? 's' : ''} left</span>
      <ul className="filters">
        <li>
          <a
            className={filter === 'all' ? 'selected' : ''}
            href="/?completion=all"
            onClick={(e) => {
              e.preventDefault();
              updateFilters({ completion: 'all' });
            }}
          >All</a>
        </li>
        <li>
          <a
            className={filter === 'active' ? 'selected' : ''}
            href="/?completion=active"
            onClick={(e) => {
              e.preventDefault();
              updateFilters({ completion: 'active' });
            }}
          >Active</a>
        </li>
        <li>
          <a
            className={filter === 'completed' ? 'selected' : ''}
            href="/?completion=completed"
            onClick={(e) => {
              e.preventDefault();
              updateFilters({ completion: 'completed' });
            }}
          >Completed</a>
        </li>
      </ul>
      <button className="clear-completed" onClick={clearCompleted}>Clear completed</button>
    </>
  );
};

export default Filters;
