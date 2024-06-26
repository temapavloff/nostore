import { updateFilters } from '../stores/filters'
import { filtersView } from '../stores/filtersView';
import { clearCompleted } from '../stores/todos';

const hanldeFilter = (e: HTMLElement) => {
  if (e.tagName === 'A') {
    const url = new URL((e as HTMLAnchorElement).href);
    updateFilters(url.searchParams);
  }
};
const hanldeClear = (e: HTMLElement) => {
  if (e.tagName === 'BUTTON') {
    clearCompleted();
  }
};

export const renderFilters = (to: Element) => {
  filtersView.subscribe(({ filter, left }) => {
    to.innerHTML = `<span class="todo-count"><strong>${left}</strong> item${left > 1 ? 's' : ''} left</span>
        <ul class="filters">
          <li>
            <a class="${filter === 'all' ? 'selected' : ''}" href="/?completion=all">All</a>
          </li>
          <li>
            <a class="${filter === 'active' ? 'selected' : ''}" href="/?completion=active">Active</a>
          </li>
          <li>
            <a class="${filter === 'completed' ? 'selected' : ''}" href="/?completion=completed">Completed</a>
          </li>
        </ul>
        <button class="clear-completed">Clear completed</button>`;
  }, true);

  to.addEventListener('click', (e) => {
    e.preventDefault();
    hanldeFilter(e.target as HTMLElement);
    hanldeClear(e.target as HTMLElement);
  });
}
