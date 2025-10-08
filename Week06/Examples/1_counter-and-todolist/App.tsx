import React from 'react';
import { Counter } from './Counter'
import TodoList from './TodoList';

const App: React.FC<{}> = () => {
  return (
    <div className="App">
      <header className="App-header">
        Hello to React
      </header>
      <Counter name={"mycounter1"}/>
      <Counter name={"mycounter2"}/>
      <Counter name={"mycounter3"}/>
      <TodoList />
    </div>
  );
}

export default App;