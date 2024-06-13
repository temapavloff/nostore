import { useSyncExternalStore } from 'react';
import { deleteTodo, todosView, toggleAll, toggleTodo } from '../stores/todos';

const Todos = () => {
  const todos = useSyncExternalStore(todosView.subscribe, todosView.get);

  return (
    <>
      <input id="toggle-all" className="toggle-all" type="checkbox" onChange={toggleAll} />
      <label htmlFor="toggle-all">Mark all as complete</label>
      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li className={todo.completed ? 'completed' : ''} key={todo.title}>
            <div className="view">
              <input className="toggle" type="checkbox" checked={todo.completed} onChange={(e) => toggleTodo(index, e.currentTarget.checked)} />
              <label>{todo.title}</label>
              <button className="destroy" onClick={() => deleteTodo(index)}></button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Todos;
