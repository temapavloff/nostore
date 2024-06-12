import './style.css'
import { renderEditor } from './views/editor';
import { renderFilters } from './views/filters';
import { renderTodos } from './views/todos';

renderEditor(document.querySelector('#editor')!);
renderTodos(document.querySelector('#todos')!);
renderFilters(document.querySelector('#filters')!);
