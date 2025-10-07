# Lecture notes: 1.6 - React

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## 1. Introduction to React

[React](https://react.dev/) is a free and open-source front-end JavaScript library for building *component-based* user interfaces. It is maintained by [Meta](https://opensource.fb.com/projects/react/) and a community of [individual developers](https://react.dev/community/team) and companies. To get started with React, jump to section the [Getting Started](#getting-started) below.

React is used to build **Single-Page Applications** (SPAs). A SPA is a website or application that loads a single HTML page and dynamically updates content using JavaScript, providing a smooth, app-like experience without constant full page reloads, unlike traditional websites.

A packager, such as Webpack, collects all your code for the SPA (JavaScript modules, CSS, images, etc.) from different files, then combines then into optimized bundles to send to the browser.

## 2. Characteristics of React

### 2.1 Declarative
React is declarative, meaning that you describe what you want and React takes care of the details under the hood. 
Declarative programming focuses on what result is desired, letting the system, which is React in our case, figure out the implementation details. Imperative programming focuses on how to achieve a result by providing step-by-step instructions. For instance, imagine that you have hired two people to work in your kitchen: someone with no cooking experience, and an experienced Chef. One knows how to make a chicken dinner and the other doesn’t. If you declaratively say to the experienced chef (JS using React library), make me a chicken dinner. That’ll do the trick. No need to give the details line by line. On the other hand, if you want a chicken dinner from the new chef (only using JS), you have to give the instructions line by line. First cut the chicken in little pieces, heat-up the pan, etc.

Therefore, with React, design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes for you. Declarative views make your code more predictable, simpler to understand, and easier to debug.

### 2.2 Component-Based
User Interfaces are represented with reusable components in React. 
If we use React with JavaScript (for this introduction), we use not just plain JavaScript syntax but we use JavaScript XML (**JSX**), which enables each component to return HTML tags. So in JSX things like:

`const element = <h1>Hello!</h1>`

are allowed. Plain JS doesn't allow these. 
A simple example App component: 
```ts
class App extends React.Component {
    constructor() {}
    render() {
        return <h1>Hello World!</h1>
    }
}
```
Components are re-usable.
```ts
class MyComponent extends React.Component {
   constructor() {}
    render() {
        return <h1>Hello to My Component!</h1>
    }
}
class App extends React.Component {
    constructor() {}
    render() {
        return (
            <div>
                <h1>Hello World!</h1>
                <MyComponent />
            </div>
        );
    }
}
```


### 2.3 VirtualDOM
A virtual DOM is a programming concept where a web framework maintains its own lightweight, in-memory JavaScript representation of the actual DOM. When a component's state changes, the framework updates this virtual representation, then compares it to the previous version to find the minimal differences. This difference is then used to update only the necessary parts of the real DOM, a process called reconciliation, which significantly speeds up UI updates by avoiding as many costly direct DOM manipulations as it can. 

### 2.4 ReactDOM
The ReactDOM package within the library is used to change the DOM in the way we just described above.  
```ts
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```
Reconciliation is the process React uses to figure out how to efficiently update the DOM (Document Object Model) when changes occur in the UI. React's goal is to update the page as efficiently as possible, without unnecessary re-rendering or slow performance.

### 2.5 State
In React, a component's state represents information it stores about itself.

Components often need to change what’s on the screen as a result of an interaction. Typing into the form should update the input field, clicking “next” on an image carousel should change which image is displayed, clicking “buy” should put a product in the shopping cart. Components need to “remember” things: the current input value, the current image, the shopping cart. In React, this kind of component-specific memory is called state.

State is one of the ways to alter the view of your component without refreshing the page. If you have a variable or data that is prone to change, it should be defined as a state variable, so information is retained between renders.

```ts
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            counter: 0
        }
    }
    render() {
        return (
            <h1>Welcome to my Counter!</h1>
        )
    }
}
```
and the way to update state before React 16 was:
```ts
this.setState(state => ({ counter: state.counter - 1 }))
```

## 3. React 16+ and Functional Components

With the release of **React 16.8**, the React team introduced **Hooks**, allowing developers to use **state** and other React features without writing class components. This led to a cleaner, more functional style of building UI.

### 3.1 Functional Components
Functional components are simpler JavaScript (or TypeScript) functions that return JSX.  
Unlike class components, they don’t need a constructor or lifecycle methods — everything can be managed through hooks.

Example:
```ts
function App() {
  return <h1>Hello World!</h1>;
}
export default App;
```
or 
```ts
const App: React.FC<{}> = () => {
    return <h1>Hello World!</h1>;
}
export default App;
```

Functional components can also accept props (short for properties), which are used to pass data from parent to child components. 
```ts
type GreetingProps = {
  name: string;
};

const Greeting: React.FC<GreetingProps> = (props) => {
    const { name } = props;
    return <h1>Hello, {name}!</h1>;
}

const App: React.FC<> = () => {
  return <Greeting name="Alice" />;
}
```
Props are **read-only** — they cannot be modified by the component receiving them.

### 3.2 React Hooks
There are [React Hooks](https://react.dev/reference/react/hooks$0) to manage the state, context, and many other things.
For instance, if you want to manage the state, you can use the `setState<>()` hook.

#### useState
The **useState** hook allows components to have their own internal state — data that changes over time and influences what’s rendered on the screen. An example from the `Counter.tsx` component
```ts
import { useState } from 'react';

export default const Counter: React.FC<{}> = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}
```
Short (imperative) explanation of the code is:
- `useState(0)` initializes a state variable count with the value 0.
- It returns an array with two elements:
    1.	The current state value (`count`)
    2.	A function to update it (`setCount`)
- When setCount is called, React re-renders the component with the new value.

Every time the state changes, React updates the Virtual DOM, compares it with the previous one, and efficiently updates only the parts that changed on the real DOM.

Example of a todo list component:
```ts
const TodoList: React.FC<{}> = () => {
    const [tasks, setTasks] = useState(["task 1", "task 2"]);
    const [taskInput, setTaskInput] = useState("");

    return (
        <div>
            <h1>Todo list</h1>
            <ul>
                {
                    tasks.map(
                        item => <li>{item}</li> 
                    )
                }
            </ul>
            <input type="text" value={taskInput} onChange={(event) => setTaskInput(event.target.value)}/>
            <input type="button" value="submit" onClick={() => {
                if (taskInput.trim().length > 0) {
                    setTasks([...tasks, taskInput])
                    setTaskInput("");
                }
            }}/>
            <input type="button" value="remove" onClick={() => {
                setTasks(tasks.slice(0, -1))
            }}/>
        </div>
    )
}
```

#### useEffect
The useEffect hook is used to handle side effects — operations that affect something outside the component’s rendering process.
Examples of side effects include:
- Fetching data from an API
- Setting up event listeners
- Managing timers or intervals
- Logging or interacting with the browser’s DOM manually
An example of a component staying connected to a server:
```ts
const ChatRoom: React.FC<{roomId: string}> = ({ roomId }) => {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
  	const connection = createConnection(serverUrl, roomId);
    connection.connect();
  	return () => {
      connection.disconnect();
  	};
  }, [serverUrl, roomId]);
  // ...
}
```
In the code above, the code inside `useEffect` runs once and only runs again if the `serverUrl` or `roomId` change. This means that, in a perfect world, we are always going to stay connected to the server that we specified.

The example we had in our Counter component was a bit different and maybe out-of-context.
```ts
const Counter: React.FC = () => {
    // If counter key exists return that, else init counter to zero
    const [counter, setCounter] = useState<number>(() => {
        const count = localStorage.getItem("counter");
        return count ? Number(count) : 0;
    });

    // Runs everytime counter changes
    useEffect(() => {
        localStorage.setItem('counter', counter.toString());
    }, [counter]);

    useEffect(() => {console.log("Runs just once")}, [])

    return (
        <div>
            <h1>Counter</h1>
            Counter: {counter}
            <input value="increment" type="button" onClick={ () => setCounter(counter + 1) }/>
            <input value="decrement" type="button" onClick={ () => setCounter(counter - 1) }/>
        </div>
    )
}
```
In the code above, `localStorage.setItem('counter', counter.toString());` only runs when the counter changes, meaning that the `counter` key is set to a new value everytime the user updates the counter via the increment or decrement button. 

## 4. Getting Started: Quick start
if you want to dive into React real quick, just copy paste the code below into an html file and open it up in a browser to see your changes.
```html
<!DOCTYPE html>
<html>
    <head>
        <title>React Without Build Tools</title>

        <!-- React and ReactDOM (development builds) -->
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>

        <!-- Babel (to allow JSX in browser) -->
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    </head>

    <body>
        <div id="root"></div>

        <!-- Your React code -->
        <script type="text/babel">
            class SimpleComponent extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = {
                        counter: 0
                    }
                }

                render() { 
                    return <div>Hello from {this.props.name}</div> 
                }
            }
            class App extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = {}
                }

                render() {
                    return (
                        <div>
                            <h1>Practice React</h1>
                            <SimpleComponent name="my simple component!" />
                        </div>
                    );
                }
            }
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
        </script>
    </body>
</html>
```

## 5. Getting started: React Templates with TypeScript

There are a lot of options for getting started with React. We encourage you to form your own opinions, though it can be hard not to get overwhelmed.

Here are a two options we suggest you try first. Make a new project folder and try these, then decide what you like, or discuss with your team.

(First of all, you should follow the instructions for installing **npm** [here](../Week1.4/readme.md), if you don't have npm yet)


### 1. Parcel: Ideal for getting started quickly

We like Parcel as it's one of the simplest ways to get started.

```
npm create parcel react-client my-react-app
cd my-react-app
npm start
```

Read more: https://parceljs.org/recipes/react/

### 2. Vite: Better for larger, complex projects

We like Vite because it powerful and widely used.

```
npm create vite@latest my-app -- --template react-ts
```

Read more: https://vite.dev/guide/

