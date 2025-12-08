import { Routes, Route } from 'react-router-dom';
import Login from './components/login/login';
import TodoList from './components/todo/todo-list';
import TodoListClientside from './components/todo/todo-list-clientside';
import NotFound from './components/not-found/not-found';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/todo" element={<TodoList />} />
      <Route path="/todo-clientside" element={<TodoListClientside />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
