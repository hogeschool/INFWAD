import { useState, useEffect } from 'react';
import TodoItem from './todo-item';
import TodoAdd from './todo-add';
import type { Todo } from './todo.type'
import styles from './todo.module.css';

export default function TodoList() {
  const [status, setStatus] = useState<string>('idle');
  const [tasks, setTasks] = useState<Todo[]>([]);

  function onAddTask(newTask: Todo) {
    setTasks([...tasks, newTask]);
  }

  useEffect(() => {
    async function getTasks() {
      setStatus('loading');

      try {
        const response = await fetch(`http://localhost:5050/api/todo/`, {method: 'GET'});
        const data = await response.json();
        setTasks(data);

      } catch(error) {
        console.log('Failed to load todo items: ', error);
      } finally {
        setStatus('idle');
      }
    }

    getTasks();
  }, []);

  return (
    <div className={styles.todopage}>
      <h1>Todo list</h1>

      { status === 'loading' && <p>Loading...</p> }

      <ul className={styles['todopage-list']}>
        { tasks?.map((task) => (
          <TodoItem
            key={task.id}
            todo={task}
          />
        )) }
      </ul>

      <TodoAdd onAddTask={onAddTask} />
    </div>
  )
}
