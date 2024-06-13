import Editor from './components/Editor';
import Todos from './components/Todos';
import Filters from './components/Filters';

const App = () => (
  <div id="app">
    <section className="todoapp">
      <header className="header" id="editor">
        <Editor />
      </header>
      <section className="main" id="todos">
        <Todos />
      </section>
      <footer className="footer" id="filters">
        <Filters />
      </footer>
    </section>
    <footer className="info">
      <p>Double-click to edit a todo</p>
      <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
      <p>Created by <a href="http://todomvc.com">you</a></p>
      <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
    </footer>
  </div>
);

export default App
