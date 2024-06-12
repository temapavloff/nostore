import { Todo, deleteTodo, todosView, toggleAll, toggleTodo } from '../stores/todos';

const renderOne = (todo: Todo, index: number) => {
  return `<li class="${todo.completed ? 'completed' : ''}">
            <div class="view">
              <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''} data-index=${index}>
              <label>${todo.title}</label>
              <button class="destroy" data-index=${index}></button>
            </div>
          </li>`;
}

// TODO: edit
// <!-- These are here just to show the structure of the list items -->
// <!-- List items should get the class `editing` when editing and `completed` when marked as completed -->
// <input class="edit" value="Create a TodoMVC template">

const handleToggle = (e: HTMLElement) => {
  if (e.tagName === 'INPUT' && e.classList.contains('toggle')) {
    toggleTodo(Number(e.dataset.index), (e as HTMLInputElement).checked);
  }
};

const handleDelete = (e: HTMLElement) => {
  if (e.tagName === 'BUTTON' && e.classList.contains('destroy')) {
    deleteTodo(Number(e.dataset.index));
  }
};
const handleToggleAll = (e: HTMLElement) => {
  if (e.tagName === 'INPUT' && e.classList.contains('toggle-all')) {
    toggleAll();
  }
};

export const renderTodos = (to: Element) => {
  todosView.subscribe(newValue => {
    if (newValue.length === 0) {
      to.innerHTML = '';
      return;
    }
    const template = `<input id="toggle-all" class="toggle-all" type="checkbox">
        <label for="toggle-all">Mark all as complete</label>
        <ul class="todo-list">
          ${newValue.map(renderOne).join('\n')}
        </ul>`
    to.innerHTML = template;
  }, true);

  to.addEventListener('change', (e) => {
    handleToggle(e.target as HTMLElement);
    handleToggleAll(e.target as HTMLElement);
  });

  to.addEventListener('click', (e) => {
    handleDelete(e.target as HTMLElement);
  });
};
