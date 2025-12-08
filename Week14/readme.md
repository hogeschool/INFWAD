# Lecture notes: Week 14 - MiniToDo Full Stack Project

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## Introduction
Let's build a complete *React TypeScript Front-end (ClientApp) + ASP.NET Core Minimal API Back-end (API)* today!

This is a combination of everything that came before, but to do this within one lesson, I'm not going to get into all the details everywhere. You still have to study the details of each step in the previous readers, but this should give a good overview of the whole.

## 1. Getting started
This will be an iterative development guide with complete folder structure and running instructions.

We will build a MiniToDo App consisting of two completely separate applications:

- **ClientApp (Front-end)**: 
React + TypeScript
- **API (Back-end)**: 
ASP.NET Core, minimal REST API

**Folder Structure**:
```
MiniToDo/
  ├── ClientApp/ 
  └── API/
```

### 1.1 Prerequisites

Ok, lets first check some prerequisites.

#### Do I have dotnet installed?

We're going to start with the front-end but soon we'll need dotnet as well, so let's see.

Open a terminal.

```bash
dotnet ---list-sdks
```

Ok I have dotnet 10 already. That's good. Some of the other command line stuff will fail if we only have 9.0 installed (EFCore installation will give you an error if you dont specify you want to install an older version).

(If you don't have it installed, go here: https://dotnet.microsoft.com/en-us/download/dotnet)

What else?

#### Node.js and NPM for the front-end.

I'm sticking with NPM only. No Yarn, pnpm, etc. NPM is still the default today and it's pretty good. Feel free to explore the alternatives!

Let's pretend I don't have it yet so I can show you how I would install it. We'll check first:

```bash
node -v
npm -v
```

This is straight from one of the previous readers, by the way. Let's go here:
https://nodejs.org/en/download/current

(Select `nvm + npm`, or `Volta + npm` if you're on Windows)

I've seen some students click those green buttons for the prebuilt installers, but what we suggest is using the dropdowns above, which generate some commands to copy paste into your terminal. For example, since I am on macOS, I'll choose nvm (to be able to switch versions quickly) and npm of course, for package management.

It gives me these commands:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

```bash
\. "$HOME/.nvm/nvm.sh"
```

```bash
nvm install 25
```

```bash
node -v # Should print "v25.2.1".
```

```bash
npm -v # Should print "11.6.2".

```

Let's run them. Now we have the prerequisites covered.

#### Create a nice folder structure to start with:

We'll create a folder for the project:

```
MiniToDo/
```

## 2. Front-end

### 2.1 Generating a new React project

Let's start by creating a project from a React/TypeScript template. I'm choosing Vite for now:

```
npm create vite@latest ClientApp -- --template react-ts
```
Now I need to type a name for the project, otherwise it won't work.

Ok, let's see what the output of that was, and check the files.

> *(Click around and explore the new folders and files in VSCode)*

Normally I might change some of the settings right away (check the `tsconfig.app.json` settings for example), or change the readme, but for now let's leave everything as it is by default.

Does it work?
```bash
npm run dev
```
It does! Great!

### 2.2 Adding pages

I'll add React Router first:

```bash
npm install react-router-dom
```

This also added it to our `package.json` file, so if someone else starts working on our code, they can just run `npm install` and everything they need to get it running will be installed. That's what the `package.json` is for. (it installs the dependencies into the `./node_modules` folder, which you don't commit to git because it contains a *lot* of files. See the `.gitignore` file that has been created for us by default!)

I will now open my main entry file and change the generated contents to add React Router:

> Modify `ClientApp/src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </StrictMode>
)
```

Now, let's create some first components for our small app.

First, I'll create a folder for them so things don't become too messy: `./components`

> Create `ClientApp/src/components/login/login.tsx`:
```tsx
export default function Login() {
  return (
    <div>
      <h1>Login</h1>

      <label>Email: </label>
      <input type="email" required />

      <label>Password: </label>
      <input type="password" required />

      <button type="submit">Login</button>
    </div>
  )
}
```

> Create `ClientApp/src/components/todo/todo-list.tsx`:
```tsx
export default function TodoList() {
  return (
    <div>
      <h1>Todo list</h1>

      <ul>
        <li>Go to old library in Minas Tirith</li>
        <li>Check on Frodo and the Ring</li>
        <li>Convince Aragorn to go on another hunt for Gollum</li>
        <li>Talk to Saruman?</li>
      </ul>
    </div>
  )
}
```
> Create `ClientApp/src/components/not-found/not-found.tsx`:

```tsx
export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  )
}
```

And we'll change the generated contents of `App.tsx` to have some declarative routing in it:

> Modify `ClientApp/src/App.tsx`:
```tsx
import { Routes, Route } from 'react-router-dom';
import Login from './components/login/login';
import TodoList from './components/todo/todo-list';
import NotFound from './components/not-found/not-found';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/todo" element={<TodoList />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

Notice that whenever I'm translating between a class or function name like 'TodoList' and its filename or URL name, I'm using lowercase and dashes, to prevent mistakes. At least for front-end code, it's still a good practice to keep URLs and filenames simple. For filenames it can be confusing when you have people in your team working with different operating systems. Case sensitivity can vary between systems, so it's good to prevent that. Remember that I also said the same thing for CSS class names.

It should at least be functional now. Let's take a look:

```bash
npm run dev
```

>Open: http://localhost:5173

>Open: http://localhost:5173/todo

Well, the routing is working, but it doesn't look great. Let's add some styling.

### 2.3 Making the login page look better

First, we need to add some more structure to our HTML for that:

> Modify `ClientApp/src/components/login/login.tsx`:
```tsx
export default function Login() {
  return (
    <div>
      <h1>Login</h1>

      <div>
        <label>Email:</label>
        <input type="email" required />
      </div>

      <div>
        <label>Password:</label>
        <input type="password" required />
      </div>

      <div>
        <button type="submit">Login</button>
      </div>
    </div>
  )
}
```

It already looks better. Now we can add some classes:

> Modify `ClientApp/src/components/login/login.tsx`:
```tsx
import styles from './login.module.css';

export default function Login() {
  return (
    <div className={styles.loginpage}>
      <h1>Login</h1>

      <div className={styles['loginpage-field']}>
        <label>Email:</label>
        <input type="email" required className={styles['loginpage-field-input']} />
      </div>

      <div className={styles['loginpage-field']}>
        <label>Password:</label>
        <input type="password" required className={styles['loginpage-field-input']} />
      </div>

      <div className={styles['loginpage-button']}>
        <button type="submit">Login</button>
      </div>
    </div>
  )
}
```

Because of my preference for using dashes in CSS class names I have to use this notation for className in TSX: `className={styles["loginpage-field-input"]}`

We can add a css file for the component now. If you use `.module` in the filename it will automatically make sure the styling is scoped to only this component:

> Create `ClientApp/src/components/login/login.module.css`:
```css
.loginpage {
    padding: 0 40px 20px 40px;
    border: 1px solid #777;
    border-radius: 5px;
}

.loginpage-field {
    display: flex;
    justify-content: flex-end;
    margin: 10px 0;
}

.loginpage-field-input {
    flex: 0 1 auto;
    width: 200px;
    margin-left: 10px;
}

.loginpage-button {
    padding: 10px 20px;
}
```

### 2.4 Making the todo page look better

We'll do the same thing for the todo list. We can also add a checkbox input to each line.

An easy way to link a checkbox input and its label together without having to use attributes and id's, is just wrapping the `<label>` element around the `<input>`.

> Modify `ClientApp/src/components/todo/todo-list.tsx`:
```tsx
import styles from './todo.module.css';

export default function TodoList() {
  return (
    <div className={styles.todopage}>
      <h1>Todo list</h1>

      <ul className={styles['todopage-list']}>
        <li>
          <label><input type="checkbox" />Go to old library in Minas Tirith</label>
        </li>
        <li>
          <label><input type="checkbox" />Check on Frodo and the Ring</label>
        </li>
        <li>
          <label><input type="checkbox" />Convince Aragorn to go on another hunt for Gollum</label>
        </li>
        <li>
          <label><input type="checkbox" />Talk to Saruman?</label>
        </li>
      </ul>
    </div>
  )
}
```

> Create `ClientApp/src/components/todo/todo.module.css`:
```css
.todopage {
    padding: 0 40px 20px 40px;
    border: 1px solid #777;
    border-radius: 5px;
}

.todopage-list {
    display: flex;
    flex-direction: column;
    padding: 0;
    list-style-type: none;
}

.todopage-list li input[type="checkbox"] {
    margin-right: 10px;
}

.todopage-list li label {
    display: flex;
    align-items: center;
}
```

These kinds of elements can be hard to visually align, but if we use flexbox on the list itself and on the label, we can do it with very little code!

- The flexbox layout on the list is telling the list items to align as a column (under each other)
- The flexbox on the label is aligning its children (the checkbox and the text) horizontally (that's the default so we don't have to specify `flex-direction`there. The `align-items: center` makes sure the checkbox and the text align well)

> Check out the difference if I disable those lines off CSS in the web inspector.

It's looking a bit better. We can continue.

### 2.5 Putting React to good use

We can do a bit better. Let's make the contents of the list dynamic.

> Modify `ClientApp/src/components/todo/todo-list.tsx`:
```tsx
import { useState } from 'react';
import styles from './todo.module.css';

export default function TodoList() {
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
```

A small update to the styling. I'll use the same trick for aligning the input field and the add and delete buttons, and add some space between the field and the buttons:

> Modify `ClientApp/src/components/todo/todo.module.css`:
```css
.todopage {
    padding: 0 40px 20px 40px;
    border: 1px solid #777;
    border-radius: 5px;
}

.todopage-list {
    display: flex;
    flex-direction: column;
    padding: 0;
    list-style-type: none;
}

.todopage-list li input[type="checkbox"] {
    margin-right: 10px;
}

.todopage-list li label,
.todopage-edit {
    display: flex;
    align-items: center;
}

.todopage-edit-field {
    margin-right: 10px;
}
```

That's already looking great!

Let's set up the back-end now.


## 3. Back-end (API)

### 3.1 Create asp.net minimal web app

In the terminal, let's go to the root folder `MiniToDo/`, and create a new dotnet project from the basic `web` template:

```bash
dotnet new web -o API
cd API

dotnet build # to build
dotnet run # to run if and when required
#should be able to run minimal api with Hello World! as output in browser
``` 
- Add the required packages:
```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
``` 
For other database providers please refer to https://learn.microsoft.com/en-us/ef/core/providers/?tabs=dotnet-core-cli

(Like I said above, if you have an older version of the .NET SDK, you may need to adjust the version like this: 
`dotnet add package Microsoft.EntityFrameworkCore --version 8.0.0`, but we're good since we have the latest)

### 3.2 Database

> Create `/API/Model/Todo.cs`:
```cs
public class Todo
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public bool IsDone { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

> Create `/API/Data/AppDbContext.cs`:
```cs
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Todo> Todos {get;set;}
}
```

### 3.3 Configuration

Let's future proof the `appsettings.json` by adding the following:

- connection string for the database
- api http and https url
- and urls for the front-end to enable CORS.

```json
{
  "BackendUrls": {
    "Http": "http://localhost:5050",
    "Https": "https://localhost:5151"
  },
  "ConnectionStrings": {
    "Default": "Data Source=Todo.db"
  },
  "Frontend": {
    "Url": "http://localhost:5173"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Now let's use these new additions in **Program.cs**.

> Modify `/API/Program.cs`:
```cs
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Add CORS
var frontendUrl = builder.Configuration["Frontend:Url"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(frontendUrl!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// Use CORS
app.UseCors("FrontendPolicy");

// IMPORTANT: Set URLs from config
var httpUrl = builder.Configuration["BackendUrls:Http"];
if (!string.IsNullOrEmpty(httpUrl))
    app.Urls.Add(httpUrl);

app.Run();
```

Now we can let Entity Framework do the hard work for us:

**Run Migrations**:
```bash
dotnet ef migrations add m1
dotnet ef database update
```

> Use Ctrl+Shift+P to open the Command Pallete (VSCode)

> SQLite:Open Database (select the db file)

> Open SQL Explorer to view the schema (provided you have appropriate SQLite Extension by alexvzz)

Look at that! Fantastic! We're making good progress!

### 3.4 Repository

Let's make use of our previous work and add the Repository code...

> Create `API/Data/IRepository.cs`:
```cs
public interface IRepository<T> where T : class
{
    Task<List<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);

    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task SaveAsync();
}
```

...implement the interface...

> Create `API/Data/Repository.cs`:
```cs
using Microsoft.EntityFrameworkCore;

public class Repository<T> : IRepository<T> where T : class
{
    private readonly AppDbContext _db;
    public Repository(AppDbContext db) => _db = db;

    public Task<List<T>> GetAllAsync() => _db.Set<T>().ToListAsync();
    public Task<T?> GetByIdAsync(int id) => _db.Set<T>().FindAsync(id).AsTask();

    public async Task AddAsync(T entity)
    {
        await _db.Set<T>().AddAsync(entity);
    }

    public Task UpdateAsync(T entity)
    {
        _db.Set<T>().Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(T entity)
    {
        _db.Set<T>().Remove(entity);
        return Task.CompletedTask;
    }

    public async Task SaveAsync() => await _db.SaveChangesAsync();
}
```

...and **register** the repository:

> Modify `API/Program.cs`: (Add this just before `var app = builder.Build();` )
```cs
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
```
### 3.5 Service

Now let's write some CRUD logic for our todo list in a service:

> Create `API/Services/ITodoService.cs`:
```cs
public interface ITodoService
{
    Task<List<Todo>> GetAll();
    Task<Todo?> Get(int id);
    Task<Todo> Create(string title);
    Task<Todo?> Update(int id, string title, bool isDone);
    Task<bool> Delete(int id);
}
```

Implement the service...

> Create `API/Services/TodoService.cs`:
```cs
public class TodoService : ITodoService
{
    private readonly IRepository<Todo> _repo;

    public TodoService(IRepository<Todo> repo) => _repo = repo;

    public Task<List<Todo>> GetAll() => _repo.GetAllAsync();

    public Task<Todo?> Get(int id) => _repo.GetByIdAsync(id);

    public async Task<Todo> Create(string title)
    {
        var t = new Todo { Title = title };
        await _repo.AddAsync(t);
        await _repo.SaveAsync();
        return t;
    }

    public async Task<Todo?> Update(int id, string title, bool isDone)
    {
        var todo = await _repo.GetByIdAsync(id);
        if (todo == null) return null;

        todo.Title = title;
        todo.IsDone = isDone;

        await _repo.UpdateAsync(todo);
        await _repo.SaveAsync();
        return todo;
    }

    public async Task<bool> Delete(int id)
    {
        var todo = await _repo.GetByIdAsync(id);
        if (todo == null) return false;

        await _repo.DeleteAsync(todo);
        await _repo.SaveAsync();
        return true;
    }
}
```

...**register** the service...

> Modify `API/Program.cs`: (add this below the other Service DI)
```cs
builder.Services.AddScoped<ITodoService, TodoService>();
```

### 3.6 API Endpoints

We should create some DTO classes to use for transferring our Todo data.

Look at the code of the service we created. As you see we transmit a *Title* and a *isDone*.

For creating a new Todo, we will only send a Title:

> Create `API/DTOs/CreateTodoDto.cs`:
```cs
public class CreateTodoDto
{
    public string Title { get; set; } = null!;
}
```

For updating a Todo, we also want to send the boolean that marks the Todo as 'done' or not:

> Create `API/DTOs/UpdateTodoDto.cs`:
```cs
public class UpdateTodoDto
{
    public string Title { get; set; } = null!;
    public bool IsDone { get; set; } = false;
}
```

And now we can add a controller for our endpoint, that uses everything we just wrote...

> Create `API/Controllers/TodoController.cs`:
```cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/todo")]
public class TodoController : ControllerBase
{
    private readonly ITodoService _service;
    public TodoController(ITodoService s) => _service = s;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAll());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
        => (await _service.Get(id)) is { } t ? Ok(t) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoDto dto)
    {
        var t = await _service.Create(dto.Title);
        return Created($"/api/todo/{t.Id}", t);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateTodoDto dto)
        => (await _service.Update(id, dto.Title, dto.IsDone)) is { } t ? Ok(t) : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.Delete(id) ? NoContent() : NotFound();
}
```
And to finish all that, we add the following lines in **Program.cs** at the appropriate locations:

```cs
// Registers the MVC controller framework into the DI container
builder.Services.AddControllers();
```
```cs
// Controller endpoint mapping
app.MapControllers();
```

This is the final result for ***Program.cs***:

```cs
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Add CORS
var frontendUrl = builder.Configuration["Frontend:Url"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(frontendUrl!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Dependency Injection
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ITodoService, TodoService>();

// Registers the MVC controller framework into the DI container
builder.Services.AddControllers();

var app = builder.Build();

// Use CORS
app.UseCors("FrontendPolicy");

// IMPORTANT: Set URLs from config
var httpUrl = builder.Configuration["BackendUrls:Http"];
if (!string.IsNullOrEmpty(httpUrl))
    app.Urls.Add(httpUrl);

// Controller endpoint mapping
app.MapControllers();

app.Run();
```

### 3.7 Testing our back-end

Now it's time to **test the controller**!

First check if you have the VSCode extension installed (REST Client Extension by Huachao Mao, or use PostMan).

> Create `API/.rest`:

```cs
@baseUrl = http://localhost:5050

###

// Gets all todos (will be empty until we have added some)
GET {{baseUrl}}/api/todo

###

// Creates a todo item with given title
POST {{baseUrl}}/api/todo
Content-Type: application/json

{
  "title": "Call Gwaihir"
}

###

// Gets by id (existing) - replace 1 with created id
GET {{baseUrl}}/api/todo/1

### 

// Update todo (valid) - replace id as needed
PUT {{baseUrl}}/api/todo/1
Content-Type: application/json

{
  "title": "Backend Done",
  "isDone": true
}

###

// Deletes todo (existing)
DELETE {{baseUrl}}/api/todo/1

###

```

> Try the endpoints by clicking on the requests.

Yay! It works!

> Now if we open ***SQLite Explorer***, we can see the new rows in the database.

Pretty cool.

### 3.8 Adding a bit of **SWAGger**

Let's also add Swagger to our project.
```bash
dotnet add package Swashbuckle.AspNetCore`
```

We have to register it in our `Program.cs` as well. Add this to the list of Services:

```cs
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
```

And this near the end:

```cs
app.UseSwagger();   
app.UseSwaggerUI();
```

The ***Program.cs*** file now looks like this:

```cs
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Add CORS
var frontendUrl = builder.Configuration["Frontend:Url"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(frontendUrl!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Dependency Injection
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ITodoService, TodoService>();

// Registers the MVC controller framework into the DI container
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use CORS
app.UseCors("FrontendPolicy");

// IMPORTANT: Set URLs from config
var httpUrl = builder.Configuration["BackendUrls:Http"];
if (!string.IsNullOrEmpty(httpUrl))
    app.Urls.Add(httpUrl);

// Controller endpoint mapping
app.MapControllers();

app.UseSwagger();   
app.UseSwaggerUI();

app.Run();
```

Now we can use Swagger to play around with our endpoints:

> Open http://localhost:5050/swagger/index.html

> And again, verify the database updates in ***SQLite Explorer***

## 4. Tying front-end and back-end together

The final step in our little full-stack adventure is tying the front-end and the back-end together. We already added the CORS policies to make sure they can talk to each other. That's important because they are both running (/being served) on different ports, and normally, those would not be allowed to connect.

We can leave the back-end running. Let's do some work on our front-end again.

### 4.1 Make the Todo component dynamic

We will first work on getting the Todo list to work. The login can wait. 

Let's first add a type definition for Todo:

> Create `ClientApp/src/components/todo/todo.type.ts`:
```ts
export type Todo = {
    id: number,
    title: string,
    isDone: boolean
}
```

After some refactoring, we have split up the items in the list into separate components. Also, we have implemented `fetch`, and added some logic to make the list items dynamic...

> Modify `ClientApp/src/components/todo/todo-list.tsx`:
```tsx
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
```

The `TodoItem` component now contains everything to update the Todo in the database when the user clicks the checkbox. For both components, we have added a `status` state variable, so we can update the UI when things are in progress. In this one, we also disable the checkbox input until the API has responded with a thumbs up that the update was done. This prevents sending too many requests at once to the server:

> Create `ClientApp/src/components/todo/todo-item.tsx`:
```tsx
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
```

Lastly, adding a new Todo was a bit more complicated, because it has to be sent to the database, but also we should add the new todo to the client, without reloading the whole list component. To do this, we have added a function that is passed as a prop to the child component (`TodoAdd`), so that it can call this function when the new Todo has been added to the DB. Check it out:

> Create `ClientApp/src/components/todo/todo-add.tsx`:
```tsx
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

```

Let's try it in the browser...

It's working!

### 4.2 To be continued?

Now that we know what we're capable of, we can expand the functionality of this first version, like:

- Front-end: Add a fetch request on the login page, and making the `todo` route protected, so you only see it when you are logged in.
- Back-end: Add some a DB table and logic for user data.

Of course it would also be nice to able to delete todo items as well. The back-end is ready for that, but we will need to create the front-end part.

Some code can be made re-usable and cleaned up further, but I wanted to keep the use of fetch as clear as possible for this lesson.

Have fun going over the code, and feel free to share your ideas and improvements with use!