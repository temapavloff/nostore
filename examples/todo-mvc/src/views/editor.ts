import { addTodo, editor } from '../stores/todos';

export const renderEditor = (to: Element) => {
  const template = `<h1>todos</h1>
  <input id="new-todo" class="new-todo" placeholder="What needs to be done?" autofocus>`;
  to.innerHTML = template;

  const input = to.querySelector('#new-todo') as HTMLInputElement;
  input!.addEventListener('input', (e) => {
    editor.set((e.currentTarget as HTMLInputElement).value);
  });
  input!.addEventListener('keydown', e => e.key === 'Enter' && addTodo());

  editor.subscribe(v => input.value = v);
}
