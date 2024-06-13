import { useSyncExternalStore } from 'react';
import { addTodo, editor } from '../stores/todos';

const Editor = () => {
  const value = useSyncExternalStore(editor.subscribe, editor.get);

  return (
    <>
      <h1>todos</h1>
      <input
        value={value}
        id="new-todo"
        className="new-todo"
        placeholder="What needs to be done?"
        onInput={e => editor.set(e.currentTarget.value)}
        onKeyDown={e => e.key === 'Enter' && addTodo()}
        autoFocus
      />
    </>
  );
};

export default Editor;
