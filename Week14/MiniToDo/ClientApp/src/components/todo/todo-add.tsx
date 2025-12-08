import { useState } from 'react';
import type { Todo } from './todo.type';
import styles from './todo.module.css';

export default function TodoAdd({ onAddTask = (task: Todo) => {} }) {
  const [status, setStatus] = useState<string>('idle');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newTaskTitle) {
      setStatus('updating');
      
      try {
        const response = await fetch(`http://localhost:5050/api/todo/`, {
          method: 'POST',
          body: JSON.stringify({
            title: newTaskTitle,
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        onAddTask({
            id: data.id,
            title: data.title,
            isDone: data.isDone
        });

      } catch(error) {
        console.log('Failed to add todo item: ', error);
      } finally {
        setNewTaskTitle('');
        setStatus('idle');
      }
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNewTaskTitle(event.currentTarget.value);
  }

  return (
    <div className={styles['todopage-add']}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={handleInputChange}
          className={styles['todopage-add-field']} />
        
        <input type="submit" value="Add" disabled={status === 'updating'} />
      </form>
    </div>
  )
}
