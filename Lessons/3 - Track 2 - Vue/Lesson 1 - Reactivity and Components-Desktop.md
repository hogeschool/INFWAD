# Vue with TypeScript
## Reactivity and Components

## Why Modern Front-End Frameworks?

Think back to when you built websites with plain HTML, CSS, and JavaScript. To display a list of products, you probably wrote something like this:

```js
// Plain JavaScript - The old way
const products = [
  { name: "Book", price: 12.99 },
  { name: "Pen", price: 2.99 }
];

const container = document.getElementById('product-list');
products.forEach(product => {
  const div = document.createElement('div');
  div.innerHTML = `<h3>${product.name}</h3><p>$${product.price}</p>`;
  container.appendChild(div);
});
```

This works fine for displaying data once. But what if a user adds a new product? Or filters the list? Or sorts it? You'd have to:
1. Manually clear the old HTML
2. Regenerate all the HTML from scratch
3. Insert it back into the DOM

Every time the data changes, you write imperative code that tells the browser exactly how to manipulate the DOM. This gets messy fast in real applications.

**Modern frameworks solve this problem with declarative programming and reactivity.**

Instead of telling the browser "how" to update the DOM step-by-step, you declare "what" the UI should look like based on the current data. When the data changes, the framework automatically updates the UI to match. You write the template once, and the framework handles all the DOM manipulation for you.

This is the core philosophy behind React, Vue, Angular, Svelte, and other modern frameworks. They differ in syntax and implementation, but they all share this reactive, declarative approach.

### The Three Pillars of Modern Front-End Frameworks

**1. Reactivity**
Data and UI are connected. Change the data, the UI updates automatically. Think of it like a spreadsheet: when you change a cell, formulas that reference it update instantly. Modern frameworks do this for your web page.

**2. Component-Based Architecture**
Break your UI into small, reusable pieces (components). Each component manages its own data and logic. This makes complex applications manageable because you think in small, isolated pieces instead of one giant codebase.

**3. Virtual DOM / Efficient Updates**
Most frameworks don't directly manipulate the real DOM (which is slow). They create a lightweight copy in memory, figure out what changed, then make the minimal necessary updates to the real DOM. This makes updates fast even for complex pages.

### Why Vue?

We're using **Vue** because it's one of the most approachable frameworks while still being powerful enough for production applications. It's being used by big websites like Gitlab, Trivago, TrustPilot and even CodeGrade.
Vue has:
- Clear, readable syntax
- Excellent TypeScript support
- Great documentation
- A gentle learning curve (compared to React or Angular)

The concepts you learn (reactivity, components, props, events) apply to all modern frameworks. Once you understand these patterns, switching to React or Angular is just learning different syntax for the same ideas.

### Why TypeScript?

TypeScript catches errors before they reach the browser. In a front-end application with components passing data to each other, TypeScript ensures you're passing the right types. Without it, you might pass a string where a number was expected and only discover the bug when testing in the browser.

---

## Installation and Project Setup

We're going to create a Vue project with TypeScript using **Vite**, a modern build tool that's fast and simple.

### Prerequisites

Make sure you have Node.js installed (version 18 or higher). You can check by running:

```bash
node --version
npm --version
```

If you don't have Node.js, download and install it from [nodejs.org](https://nodejs.org/).

### What is npm and why do we need it?

**npm (Node Package Manager)** is JavaScript's package manager, similar to what you might have used in other ecosystems (like NuGet for C# or pip for Python). It does three main things:

1. **Installs dependencies** - Instead of downloading libraries manually, npm downloads them and their dependencies automatically.
2. **Manages versions** - Ensures everyone on your team uses the same library versions.
3. **Runs scripts** - Provides commands to start your dev server, build for production, run tests, etc.

When you create a Vue project, you're not just downloading Vue. You're also getting:
- **Vite** - The build tool and development server
- **TypeScript** - The type checker
- **Vue Router** (later) - For navigation between pages
- Dozens of smaller dependencies these tools need

Without a package manager, you'd have to manually download, update, and configure all of these. npm does it automatically.

### Creating a Vue Project

Open your terminal and navigate to where you want to create your project. Then run:

```bash
npm create vue@latest
```

This command uses Vue's official project scaffolding tool. You'll be asked several questions. For this first lesson, answer like this:

```
✔ Project name: product-catalog
✔ Add TypeScript? … Yes

Now a checklist shows up. 
Mark these accordingly using your arrow keys and space bar. Enter to confirm.
│  ◻ JSX Support
│  ◻ Router (SPA development)
│  ◻ Pinia (state management)
│  ◻ Vitest (unit testing)
│  ◻ End-to-End Testing
│  ✔ Linter (error prevention)
│  ◻ Prettier (code formatting)

Select experimental features to include in your project:
│  ✔ Replace Prettier with Oxfmt
│  ◻ Vue 3.6 (Release Candidate)
│  ◻ Replace TypeScript with typescript-native-bridge (tsgo)

Skip all example code and start with a blank Vue project?
- No
```

After answering the questions, navigate into your project folder and install dependencies:

```bash
cd product-catalog
npm install
```

This downloads all the packages listed in `package.json` into a `node_modules` folder. This will take a few seconds.


**What's node_modules?** This folder contains all the code from libraries your project depends on. It can get very large (hundreds of megabytes) because modern tools have many dependencies. Never commit this folder to version control - that's what `package.json` is for. Anyone can recreate `node_modules` by running `npm install`.

Install the `Oxc` extention in Visual Studio Code. This will help us spot errors and formatting our files. Now restart Visual Studio Code and Open Folder into the `product-catalog` folder. When having an .vue file open, you should see the oxc with two checkmarks in the bottom right corner. 

👉 **Exercise 1: Create your project**\
Follow the steps above to create your Vue project. Make sure you answer the questions exactly as shown. After `npm install` finishes, open the folder in VS Code and explore the files that were created. You don't need to understand everything yet - just get familiar with the structure.

> Note: We'll add the Router manually later. 
---

## Understanding the Project Structure

Open your project in VS Code. Let's understand the key files:

**package.json** - The project configuration
This file lists all dependencies and npm scripts. Open it and find the `"scripts"` section:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

These are shortcuts. When you run `npm run dev`, it actually runs the `vite` command which starts the development server. Your actual json may look different as they like to change these settings a lot. Nothing to worry about now.

**index.html** - The single HTML file
Open `index.html`. Notice it's very minimal:

```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

This is the entry point. The `<div id="app">` is where Vue will mount your application. The script loads the TypeScript entry file.

**src/main.ts** - Application bootstrapping
This file creates and mounts the Vue application. Don't modify this yet - just understand what it does.

**src/App.vue** - The root component
This is your first Vue component. We'll clean this up in a moment.

**src/components/** - Reusable components
This is where you'll create smaller, reusable pieces of UI.


## Adding our base.css

We want the app to look a bit more polished before we start building components. By default, the Vue starter app is very plain. In the project root, open `src/assets/base.css`, replace the content with the content from the base.css we provide. 

This file contains a few global styles, such as color variables, typography, and a neutral page background. We are doing this because we want a consistent starting point for styling without having to write all the basic CSS from scratch. It helps us focus on Vue concepts instead of spending too much time on visual setup.

👉 **Exercise 2: Explore the structure**\
Open the components files and read through them. You don't need to understand everything, but get a sense of what's there. Notice how they have three sections: `<script>`, `<template>`, and `<style>`.

---

## Running the Development Server

Now let's see our app in action. In your terminal, run:

```bash
npm run dev
```

This starts **Vite's development server**. You'll see output like:

```
VITE vx.x.x  ready in 300 ms

➜  Local:   http://localhost:5173/
```

### What just happened?

Vite is running a local web server on your computer. It:
1. **Compiles** your TypeScript and Vue files into JavaScript
2. **Serves** them through a local web server
3. **Watches** for file changes
4. **Hot reloads** the browser when you save changes

Vite uses **Hot Module Replacement (HMR)** to inject changes instantly without refreshing the page or losing your application state. This means you can edit code and see results immediately while keeping your app's current state (like form inputs or navigation position).

Open your browser and go to `http://localhost:5173/` or ctrl-click it in the terminal. You should see Vue's welcome page!

Keep the dev server running. In a new terminal window (or VS Code's integrated terminal), you can still run other commands.

To stop the server later, press `Ctrl+C` in the terminal.

👉 **Exercise 3: Test hot reload**\
With the dev server running and the browser open, go to `src/App.vue`. Add a text somewhere within the `template` tags. Save it and watch the browser - it updates instantly without a full page refresh! This is HMR in action.

---

## Single File Components (SFCs)

Vue uses `.vue` files, called **Single File Components**. This might seem unusual if you're used to separating HTML, CSS, and JavaScript into different files. But there's a good reason for this architecture.

### The Component Philosophy

In traditional web development, we separated by technology:
- All HTML in one place
- All CSS in another
- All JavaScript in a third place

Modern frameworks separate by **feature** instead:
- Each component contains its own HTML, CSS, and JavaScript
- The component is self-contained and reusable
- If you delete the component file, you delete everything related to that feature

This is called **colocation** - keeping related code together. It makes it easier to:
- Understand what a component does (everything is in one file)
- Reuse components (import them wherever needed)
- Delete features (just delete the file)
- Avoid CSS conflicts (styles are scoped to the component)

### Anatomy of a .vue File

Every `.vue` file has up to three sections:

```vue
<script setup lang="ts">
// TypeScript logic goes here
// This runs when the component is created
</script>

<template>
  <!-- HTML template goes here -->
  <!-- This is what gets rendered on the page -->
</template>

<style scoped>
/* CSS styling goes here */
/* The "scoped" attribute means styles only affect this component */
</style>
```

**Why `<script setup>`?**
The word `setup` here indicates we're using the modern Vue syntax called `composition API`. 

**Why `lang="ts"`?**
This tells Vue that the script section contains TypeScript, not plain JavaScript.

**Why `scoped` in styles?**
Without `scoped`, CSS in one component could accidentally affect other components. Vue adds unique attributes to elements and CSS selectors to ensure styles only apply to this component.

---

## Creating Your First Component

Now let's build something from scratch. We're going to clean up the example code and create a simple component.

Open `src/App.vue` and **delete everything**. We're starting fresh.

### Step 1: Add the script section

First, add the script section at the top:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const message = ref<string>('Welcome to Vue with TypeScript!')
</script>
```

**What's happening here?**
- We import `ref` from Vue - this creates reactive variables
- We create a reactive variable called `message` with an initial value
- The `<string>` tells TypeScript this variable holds a string

### Step 2: Add the template

Below the script, add the template:

```vue
<template>
  <div>
    <h1>{{ message }}</h1>
    <p>This is our first Vue component</p>
  </div>
</template>
```

**New syntax: {{ }}**
The double curly braces are called **interpolation**. They insert the value of a variable into the HTML. When you write `{{ message }}`, Vue replaces it with the actual value of the message variable.

### Step 3: Add the styles

Finally, add styles at the bottom:

```vue
<style scoped>
h1 {
  color: #42b983;
}
</style>
```

Save the file. Your browser should show a colored heading with your message!

**Notice:** The shared `base.css` file gives the page its basic styling. Vue handles the reactivity, and the stylesheet gives the HTML elements a clear, readable default appearance.

👉 **Exercise 4: Add more content**\
Add a second reactive variable called `subtitle` with any text you want. Display it in the `<p>` tag below the h1.
---

## Reactivity - The Core Concept

Let's understand what makes `ref()` special and why it's a fundamental concept in modern frameworks.

### The Problem with Plain JavaScript

Try this thought experiment. In plain JavaScript, if you wanted to display a counter:

```js
let count = 0;
document.getElementById('display').textContent = count;

// Later, when user clicks a button:
count = count + 1;
// The HTML still shows 0! We'd have to manually update it:
document.getElementById('display').textContent = count;
```

Every time the data changes, you must manually update the DOM. In a complex application with lots of data and lots of places where it's displayed, this becomes unmanageable. You'd be writing DOM manipulation code constantly.

### The Framework Solution: Reactivity Systems

Modern frameworks solve this with **reactivity**. You tell the framework "this variable is reactive," and it automatically:
1. Tracks where that variable is used in the template
2. Watches for changes to that variable
3. Re-renders the affected parts of the UI when it changes

Different frameworks implement this differently:
- **Vue 3** uses JavaScript Proxies with `ref()` and `reactive()`
- **React** uses hooks like `useState()`
- **Angular** uses RxJS Observables and signals
- **Svelte 5** uses a singal variable with `$state`

The syntax differs, but the concept is the same: **data changes should automatically update the UI**.

### Vue's ref()

In Vue, `ref()` creates a reactive reference to a value:

```ts
import { ref } from 'vue'

const count = ref<number>(0)
```

Behind the scenes, Vue wraps your value in an object with a getter and setter. When you change the value, Vue knows about it and can trigger updates.

**Important: The .value property**

In your script code, you access and modify a ref through `.value`:

```ts
const count = ref<number>(0)

console.log(count.value)  // Read: 0
count.value = 5           // Write: 5
```

But in the template, Vue automatically "unwraps" refs, so you don't need `.value`:

```vue
<template>
  <p>{{ count }}</p>  <!-- No .value needed here -->
</template>
```

This might seem inconsistent, but it makes templates cleaner to read.

👉 **Exercise 5: Create an interactive counter**\
In your `App.vue`, below your existing variables, add:
```ts
const count = ref<number>(0)
```

In your template, add a paragraph that displays the count. Then add this below it:
```vue
<button @click="count++">Increment</button>
```

Test it! Clicking the button should increase the count, and the display updates automatically. You didn't write any DOM manipulation code - Vue did it for you.

**Note:** We'll explain `@click` properly in the next section. For now, just know it runs code when the button is clicked.

---

## Event Handling - Making Components Interactive

You've just created a button with `@click="count++"`. Let's properly understand event handling in Vue and modern frameworks.

### Declarative Event Handling

In plain JavaScript, you'd add event listeners imperatively:

```js
const button = document.getElementById('myButton');
button.addEventListener('click', function() {
  count = count + 1;
  // Then manually update the DOM
});
```

Modern frameworks use **declarative event handling**. Instead of imperative code that says "find this button and attach this listener," you declare in the template "when this button is clicked, do this":

```vue
<button @click="count.value++">Increment</button>
```

### The @ Shorthand


The @ symbol is a shorthand for the `v-on:` directive, which is Vue’s original syntax for attaching event listeners to HTML elements. While `v-on:` is still useful for advanced cases, the @ shorthand is the modern standard.

These are equivalent:

```vue
<button v-on:click="increment">Click me</button>
<button @click="increment">Click me</button>
```

You can listen to any DOM event:
- `@click` - mouse clicks
- `@input` - input changes (typing in a text field)
- `@submit` - form submissions
- `@keyup` - key releases
- `@mouseenter`, `@mouseleave` - hover events
- And many more...

### Inline vs Method Handlers

You can write code directly inline:

```vue
<button @click="count.value++">Increment</button>
```

Or call a function:

```vue
<script setup lang="ts">
const count = ref<number>(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">Increment</button>
</template>
```

For simple operations, inline is fine. For complex logic, use functions to keep your template clean.

👉 **Exercise 6: Build a complete counter**\
In your `App.vue`, create three functions: `increment()`, `decrement()`, and `reset()`. Each should modify the count appropriately. Then create three buttons that call these functions. Add a conditional message: if count equals 0, show "Start counting!", if positive show "Positive", if negative show "Negative". Use `v-if`, `v-else-if`, and `v-else` like this:

```vue
<p v-if="count === 0">Start counting!</p>
<p v-else-if="count > 0">Positive</p>
<p v-else>Negative</p>
```

---

## Conditional Rendering - Showing and Hiding UI

You just used `v-if` in the exercise. Let's understand conditional rendering conceptually.

### Imperative vs Declarative UI

In plain JavaScript, showing/hiding elements is imperative:

```js
if (count === 0) {
  messageElement.style.display = 'block';
} else {
  messageElement.style.display = 'none';
}
```

You tell the browser step-by-step how to manipulate the DOM.

Modern frameworks use **declarative conditional rendering**. You declare the conditions under which each element should exist:

```vue
<p v-if="count === 0">Start counting!</p>
<p v-else-if="count > 0">Positive</p>
<p v-else>Negative</p>
```

Vue handles the DOM manipulation. If count changes from 0 to 1, Vue:
1. Detects the change
2. Evaluates the conditions
3. Removes the "Start counting!" paragraph
4. Creates and inserts the "Positive" paragraph

All automatically. You just declare what should exist under what conditions.

### v-if vs v-show

Vue has two directives for conditional display:

**v-if** - Completely adds/removes elements from the DOM:
```vue
<p v-if="showMessage">This element is removed from the DOM when false</p>
```

**v-show** - Always renders, but toggles CSS `display: none`.
This does't support `else` options. 
```vue
<p v-show="showMessage">This element stays in DOM, just hidden</p>
```

**When to use which?**
Given `v-show` keeps the hidden elements in the DOM this would only be used for big UI elements like switching tabs. Smaller elements like this `p` would default to using `v-if`. 


👉 **Exercise 7: Add a warning message**\
Add a warning that only shows when count is greater than 10 or less than -10. Use `v-if` with a logical OR (`||`) condition. Style it with a red color using a CSS class.

---

## List Rendering - Working with Arrays

Most applications need to display lists of data. Let's understand how modern frameworks handle this.

### The Imperative Approach (Old Way)

In plain JavaScript, rendering a list requires manual DOM manipulation:

```js
const products = [
  { id: 1, name: 'Book', price: 12.99 },
  { id: 2, name: 'Pen', price: 2.99 }
];

const container = document.getElementById('list');
container.innerHTML = ''; // Clear existing

products.forEach(product => {
  const div = document.createElement('div');
  div.innerHTML = `<h3>${product.name}</h3><p>$${product.price}</p>`;
  container.appendChild(div);
});
```

Every time the list changes (add, remove, reorder), you rewrite this logic. It's error-prone and tedious.

### The Declarative Approach (Modern Frameworks)

Modern frameworks use **list directives** to declaratively map arrays to DOM elements. You declare "for each item in this array, render this template," and the framework handles everything:

```vue
<div v-for="product in products" :key="product.id">
  <h3>{{ product.name }}</h3>
  <p>${{ product.price }}</p>
</div>
```

When the array changes, the framework efficiently updates only what changed in the DOM.

### Vue's v-for Directive

The `v-for` directive loops over an array and renders the template for each item:

```vue
<div v-for="item in items" :key="item.id">
  {{ item.name }}
</div>
```

**The :key attribute is critical.** Modern frameworks need to track which items are which when the list changes. Without unique keys, the framework might:
- Re-render the entire list instead of just what changed
- Lose component state (like input values) when items shift
- Update the wrong elements when items are reordered

Always use a unique, stable identifier (like a database ID) as the key. Never use the array index as the key if the list can be reordered or items removed from the middle.

### Understanding :key

The `:` is short for `v-bind:`, which binds the attribute to a JavaScript expression instead of a static string:

```vue
<!-- Static string - wrong! -->
<div key="product.id">

<!-- JavaScript expression - correct! -->
<div :key="product.id">
```

Without the `:`, you're literally passing the string "product.id", not the value.

Now let's build a product list.

### Step 1: Define the data structure

First, we need TypeScript to know what a Product is. Add this interface in your script section:

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  price: number
}
</script>
```

This defines the structure. Every Product must have an id (number), name (string), and price (number).

### Step 2: Create the reactive array

Below the interface, create the products array:

```ts
const products = ref<Product[]>([
  { id: 1, name: "Pen", price: 12.99 },
  { id: 2, name: "Book", price: 16.99 },
  { id: 3, name: "Mug", price: 7.99 },
])
```

The `<Product[]>` tells TypeScript this ref contains an array of Product objects. If you try to add an object missing a field, TypeScript will error.

### Step 3: Render the list

In your template, add:

```vue
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product-card">
      <h3>{{ product.name }}</h3>
      <p>{{ product.price }}</p>
    </div>
  </div>
```

### Step 4: Add layout styles

We'll use scoped CSS just for layout - the grid that arranges our product cards. In your style section, add:

```css
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.product-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1rem;
}
```

**Understanding scoped styles:**
The `scoped` attribute means these styles only apply to this component. The `.product-list` grid layout is specific to how we want products arranged, so we add it here. The border and radius use variables from the shared `base.css` file.

Save and check your browser! You should see three product cards in a responsive grid.

👉 **Exercise 8: Add more products**\
Add two more products to the array with different names and prices. Notice how Vue automatically renders them - you didn't have to change the template at all.

---

## Component Architecture - Breaking Down the UI

Right now, all our code is in `App.vue`. We have a product list, but each product card is defined inline in the v-for. Let's understand why extracting this into a component is important.

### The Problem with Monolithic UIs

Even in our small example, you can see the template getting crowded. Imagine if we add more features:
- Edit buttons for each product
- Product images
- Star ratings
- Stock indicators
- Multiple views (grid vs list)

If everything stays in `App.vue`:
- The file becomes hundreds of lines long
- The template becomes hard to read
- You can't reuse the product card design elsewhere
- Testing individual pieces is difficult

### Component-Based Architecture

Modern frameworks solve this by breaking the UI into **components** - small, self-contained, reusable pieces. Think of components like LEGO blocks:
- Each block has a specific purpose
- Blocks can be combined to build complex structures
- You can use the same block in multiple places
- If a block breaks, you replace just that one piece

In web development, components:
- Manage their own state and logic
- Receive data from parents via **props**
- Communicate with parents via **events**
- Can be reused throughout the application

This is a universal pattern. React calls them components, Angular calls them components, even web standards have Web Components. The concept is the same: build small, reusable UI pieces.

### Creating a Reusable Component

Let's extract the product card into its own component. This way, we can reuse it anywhere we need to display a product.

Create a new file: `src/components/ProductCard.vue`

Add the script section:

```vue
<script setup lang="ts">
interface Props {
  name: string
  price: number
}

defineProps<Props>()
</script>
```

**What's happening?**
- We define a `Props` interface - this is the contract for what data this component expects to receive
- `defineProps<Props>()` tells Vue this component accepts these props
- TypeScript will error if a parent tries to pass the wrong types

Add the template:

```vue
<template>
    <div class="product-card">
        <h3>{{ name }}</h3>
        <p>{{ price }}</p>
    </div>
</template>
```

Notice we can use `name` and `price` directly - defineProps makes them available in the template.

Add the styles (just copy the `.product-card` style from App.vue):

```css
.product-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1rem;
}
```

Now update `App.vue`. At the top of your script section, import the component:

```ts
import ProductCard from './components/ProductCard.vue'
```

Before we're gonna adjust our v-for. Let's first see how to load a component and pass the props. In this example we can use the first item from the products list.
In your template just before the product-list, add
```vue
<ProductCard :name="products[0].name" :price="products[0].price" />
```
Ignore the TS errors for now.
We load the component by calling it as we would with a HTML tag. We pass the props named with a `:` to bind them. Save your file and notice the first product appears twice on your page now.

Now we've seen this we can implement the v-for on loading the component. Remove the component call and adjust the div inside the list to be the component. Also remove the `product-card` style from App.vue now.

```vue
<div class="product-list">
  <ProductCard
    v-for="product in products"
    :key="product.id"
    :name="product.name"
    :price="product.price"
  />
</div>
```



Save and test! Everything should work the same, but now the code is organized into reusable pieces.

### Understanding Props

**Props** are how parent components pass data to children. Think of them like function parameters:

```ts
// Function parameters
function greet(name: string, age: number) { }

// Component props (similar concept!)
interface Props {
  name: string
  age: number
}
```

The parent passes props like this:

```vue
<ProductCard :name="product.name" :price="product.price" />
```

The `:` binds the attribute to a JavaScript expression. Without it, you'd pass the literal string "product.name" instead of the value.

**Props are read-only** in the child component. The child cannot modify props - data flows one way (parent to child). If the child needs to change something, it emits an event to notify the parent, and the parent updates its data.

This is called **one-way data flow** and is a core principle of modern frameworks. It makes it easier to understand where changes come from and debug data issues.

👉 **Exercise 9: Add the id prop**\
Update the Props interface in ProductCard to include `id: number`. Update App.vue to pass the id prop. We'll use this in the next section.

---

## Component Communication - Events

Props flow down (parent to child). But how does data flow up? Through **custom events**.

Let's add a delete button to each product card and teach the child component to notify its parent.

### Emitting Events

Open `ProductCard.vue`. Your Props interface should now include the id (from Exercise 9).

Below `defineProps`, add:

```ts
const emit = defineEmits<{
  delete: [id: number]
}>()
```

This defines that our component can emit a `delete` event that carries a number (the product id). When a child component "emits" an event, it isn't actually changing any data itself. It is simply tapping the parent on the shoulder and saying: "Hey! Something happened! Here is the ID of the item involved."

In your template, add a delete button:

```vue
<template>
  <div class="product-card">
    <h3>{{ name }}</h3>
    <p>${{ price.toFixed(2) }}</p>
    <button @click="emit('delete', id)" class="secondary">
      Delete
    </button>
  </div>
</template>
```

**Notice:** The local `secondary` class from `base.css` gives the delete button a quieter style. This keeps the styling transparent and avoids a hidden framework dependency.

Now the child can emit events, but the parent needs to listen. 

### Listening to Events

Open `App.vue`. Create a delete function:

```ts
function deleteProduct(id: number) {
  products.value = products.value.filter(p => p.id !== id)
}
```

In your template, listen to the delete event:

```vue
<ProductCard
  v-for="product in products"
  :key="product.id"
  :id="product.id"
  :name="product.name"
  :price="product.price"
  @delete="deleteProduct"
/>
```

The `@delete` listens for the delete event. When the child emits it, `deleteProduct` is called with the id that was emitted.

Test it! Click delete on a product and it disappears.

### Understanding Component Communication

This two-way communication pattern is fundamental:

**Props (down):** Parent passes data to child
```
Parent → [props] → Child
```

**Events (up):** Child notifies parent of actions
```
Child → [emit event] → Parent
```

This keeps components loosely coupled. The child doesn't know who its parent is or what the parent will do with the event. It just says "hey, delete was clicked on product 5." The parent decides what to do.

This architecture scales to complex applications because each component is independent and testable.

👉 **Exercise 10: Add a description field**\
Add a `description: string` field to the Product interface in App.vue. Add some sample descriptions to your products array. Update ProductCard's Props interface to accept description, and display it below the price. Update App.vue to pass the description prop.

---

## Summary

You've learned the core concepts of modern front-end frameworks:

**Reactivity** - Data and UI are automatically synced. Change the data, the UI updates. This is the foundation of modern frameworks.

**Declarative Programming** - You declare what the UI should look like based on data, not how to manipulate the DOM. The framework handles the "how."

**Component Architecture** - Break UIs into small, reusable pieces. Each component manages its own logic and state.

**One-Way Data Flow** - Props flow down (parent to child), events flow up (child to parent). This makes data changes predictable and debuggable.

**List Rendering** - The v-for directive makes it easy to render arrays declaratively, and Vue efficiently updates only what changed.

These concepts apply to **all** modern frameworks:
- React uses `useState` instead of `ref`, but the reactivity concept is the same
- Angular uses templates with different syntax, but component architecture is the same
- Svelte compiles away the framework, but the declarative approach is the same

You're not just learning Vue syntax - you're learning how to think in modern front-end development.

## Practical Exercises

👉 **Exercise 11: Add product stock**\
Add a `stock: number` field to the Product interface. Add stock values to your existing products. Display the stock in ProductCard. Add a visual indicator: if stock is 0, show "Out of Stock" in red; if stock is less than 5, show "Low Stock" in orange.

👉 **Exercise 12: Add a category field**\
Add a `category: string` field to the Product interface (like "Books", "Electronics", "Clothing"). Add sample categories to your products. Display the category in ProductCard with a small badge or label.

👉 **Exercise 13: Expand ProductCard functionality**\
Add an "Edit" button to ProductCard that emits an `edit` event with the product id. In App.vue, create a function that handles this event by showing an alert with the product id. We'll implement actual editing in the next lesson!

## Thought Questions

💡 **Conceptual Understanding**

- Why do modern frameworks use reactivity instead of manual DOM manipulation? What problems does it solve?

- Why is component-based architecture better than putting all code in one file? How does it help in large applications?

- Why do props flow down and events flow up? Why can't a child component directly modify a prop it receives?

- Why is the `:key` attribute critical in v-for? What happens if you use the array index as the key when items can be deleted?

- When would you use a computed property vs a regular function? Give a real-world example.

- How does Vue know when to re-render a component? What triggers a re-render?

---

**Next Lesson:** Two-Way Binding and Composables - We'll complete the CRUD functionality by adding Create and Update features with forms and v-model, learn about computed properties for efficient derived state, and extract our product logic into reusable composables!
