import { useState } from 'react';
import type { Todo } from './todo.type'

export default function TodoItem(props: {todo: Todo}) {
  const [checked, setChecked] = useState<boolean>(props.todo.isDone);
  const [status, setStatus] = useState<string>('idle');

  async function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    setStatus('updating');

    const newValue = event.currentTarget.checked;

    fetch(`http://localhost:5050/api/todo/${props.todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: props.todo.title,
          isDone: newValue,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
      }).then((response ) => {
        if (!response.ok) {
          throw new Error('Failed to update todo item');
        } else {
          setStatus('idle');
          setChecked(newValue);
        }
      }).catch((error) => {
        console.error(error);
      });
  }

  return (
    <li>
      <label>
        <input
          type='checkbox'
          defaultChecked={checked}
          onChange={handleCheckboxChange}
          disabled={status === 'updating'}
        />
        {props.todo.title}
      </label>
    </li>
  );
}
