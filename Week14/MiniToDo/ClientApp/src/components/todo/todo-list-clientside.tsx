import { useState } from 'react';
import styles from './todo.module.css';

export default function TodoListClientside() {
  const [todoList, setTodoList] = useState([
      'Go to old library in Minas Tirith',
      'Check on Frodo and the Ring',
      'Convince Aragorn to go on another hunt for Gollu',
      'Talk to Saruman?'
  ]);
  const [newTask, setNewTask] = useState('');

  return (
    <div className={styles.todopage}>
      <h1>Todo list</h1>

      <ul className={styles['todopage-list']}>
        { todoList.map((task, index) =>
          <li key={index}>
            <label>
              <input type="checkbox" /> {task}
            </label>
          </li>
        )}
      </ul>

      <div className={styles['todopage-edit']}>
        <input
          type="text"
          className={styles['todopage-edit-field']}
          onChange={(e) => setNewTask(e.target.value)}
          value={newTask} />
        
        <input type="button" onClick={() => {
            if (newTask.trim() !== '') {
                setTodoList([...todoList, newTask]);
                setNewTask('');
            }
        }} value="Add" />
        
        <input type="button" onClick={() => setTodoList(todoList.slice(0, -1))} value="Remove" />
      </div>
    </div>
  )
}