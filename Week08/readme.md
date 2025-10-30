# Lecture notes: 1.8 - React part 3
The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

# React Router

## Learning Goals

After studying this reader, you will be able to:

- Understand what React Router is and why it is used.
- Use the main navigation components: `<Link>`, `<NavLink>`, and `useNavigate()`.
- Create and handle dynamic routes using `useParams()` and `useSearchParams()`.
- Implement nested and protected routes.
- Understand route redirection.
- Use additional hooks like `useQuery`, `useContext`, `useMemo`, and `useCallback` to enhance your React applications.

---

## Introduction to React Router

React Router is a **standard library for routing in React applications**.  
It allows developers to handle navigation and rendering of components based on the current URL — without reloading the entire page.

To install React Router:

```bash
npm install react-router-dom
```

To get started with React Router, wrap your app with a router in your main entry file (usually main.tsx or index.tsx):

```js
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

## Ways to Use React Router

React Router can be used in different ways depending on the project type and what you want:
- Declarative
- Data Routers
- Framework Routers

You could read further about the syntactic and functional differences [here](https://reactrouter.com/start/modes)

Example (Declarative routing):
```js
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

## Navigation in React Router
React Router provides components and hooks for navigating between pages.

### `<Link>` and `<NavLink>`
```js
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <NavLink 
        to="/about"
        className={({ isActive }) => (isActive ? 'active' : '')}
      >
        About
      </NavLink>
    </nav>
  )
}
```
`<Link>` is used for basic navigation.
`<NavLink>` is similar, but can style links differently when active for instance.

### Difference between `<Link>` and `<a>`
`<a>` triggers a full page reload.
`<Link>` changes the URL using the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API), keeping the app as a Single Page Application (SPA).

### Programmatic Navigation
Use the `useNavigate()` hook for navigation in TS/JS.

```js
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const goToDashboard = () => {
    navigate('/dashboard')
  }

  return <button onClick={goToDashboard}>Go to Dashboard</button>
}
```

## Handling Unknown Routes
When a user visits a path that doesn’t exist, React Router matches it with a wildcard route:
```js
<Route path="*" element={<NotFound />} />
```
This ensures that unknown URLs show a 404-style page instead of a blank screen.
Example NotFound page:

```js
export default function NotFound() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  )
}
```

## Dynamic Routes
Dynamic routes allow you to create paths that contain parameters.

Example:
```js
<Route path="/dashboard/:id" element={<DashboardItem />} />
```
Then use the `useParams()` hook to access the parameter value:
```js
import { useParams } from 'react-router-dom'

const DashboardItem = () => {
  const { id } = useParams();
  return <h2>Dashboard ID: {id}</h2>
}
```
You can also use:
- useSearchParams() for query strings.
- useLocation() for accessing the current URL and state.

A weird example with user credentials as search parameters for the url `http://localhost:3000/login?username=name&password=pass`:

```js
import { useSearchParams } from 'react-router-dom'

const LoginPage = () => {
  const [searchParams] = useSearchParams()
  const username = searchParams.get('username'); // user
  const password = searchParams.get('password'); // pass
  return <p>Search results for username and password: {username}, {password}</p>
}
```

## Nested Routes
Nested routes allow you to structure components hierarchically.

Example:
```js
<Route path="/dashboard" element={<Dashboard />}>
  <Route path="stats" element={<Stats />} />
  <Route path="settings" element={<Settings />} />
  <Route path="security" element={<Security />} />
</Route>
```

Inside `Dashboard.tsx`:
```js
import { Outlet, Link } from 'react-router-dom'

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <nav>
        <Link to="stats">Stats</Link>
        <Link to="settings">Settings</Link>
        <Link to="security">Security</Link>
      </nav>
      <Outlet /> {/* Nested routes render here */}
    </div>
  )
}
```

## Protected Routes
Sometimes you need to restrict certain routes to authenticated users only.

Example:
```js
import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'

type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { children } = props;
  const isAuthenticated = localStorage.getItem('token')
  return isAuthenticated ? children : <Navigate to="/login" />
}
```

Usage:
```js
<Route 
	path="/dashboard" 
	element={
		<ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
	}
/>
```
This ensures only logged-in users can access /dashboard.

##  Redirecting Routes
To map one route to another, use the `<Navigate />` component:
```js
<Route path="/" element={<Navigate to="/home" replace />} />
```
This will automatically redirect from `/` to `/home`.

## Additional React Hooks

### useQuery (from TanStack)
```bash
npm install @tanstack/react-query
```
React Query helps manage server state, including fetching, caching, and error handling.

Example:
```js
import { useQuery } from '@tanstack/react-query'

const Users = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error loading users</p>

  return (
    <ul>
      {data.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}
```

### useContext
Share data globally across components.

Example:
```js
const ThemeContext = React.createContext('light')

const App = () => {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  )
}

const Toolbar = () => {
  return (
    <div>
      <ThemeButton />
    </div>
  )
}

const ThemeButton = () => {
  const theme = React.useContext(ThemeContext)
  return <button>Theme: {theme}</button>
}
```

### useMemo & useCallback
These hooks optimize performance by memoizing values and functions.

```js
const expensiveValue = useMemo(() => computeValue(data), [data])
const memoizedHandler = useCallback(() => handleAction(data), [data])
```
In React 19+, these may become less necessary due to compiler optimizations.
Read more: [Goodbye useMemo & useCallback in React 19](https://javascript.plainenglish.io/goodbye-memo-usememo-usecallback-in-react-19-9a41587abf4f)

--- 

## References:
- [React Router](https://reactrouter.com/start/)
- [React Router - Picking a Mode](https://reactrouter.com/start/modes)
- [React Router - Declarative](https://reactrouter.com/start/declarative/routing)
- [useQuery](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery)
- [useContext](https://react.dev/reference/react/useContext)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)
