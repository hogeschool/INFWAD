# Lesson 3: Lifecycle Hooks and Watchers


## What You'll Learn

Right now, your products app works perfectly, until you refresh the page. Everything disappears because the data only lives in memory. In this lesson, you'll learn how to persist data using localStorage and automatically save changes as users work.

To do this, you need to understand two new concepts: **lifecycle hooks** (running code when components mount or unmount) and **watchers** (reacting to specific data changes). These are essential tools in every frontend framework, not just Vue.

By the end, your products will survive page refreshes, and you'll understand how components "live" in your application.

---

## The Component Lifecycle

When you load your Vue app, something happens behind the scenes. Vue creates your component, sets up all the reactive data, renders the HTML to the page, and eventually destroys it when you navigate away or close the tab. This is the **component lifecycle**.

Think of it like a person's life: birth (component created), life (component exists on page), and death (component removed). Vue gives you hooks to run code at these specific moments. The most important ones are `onMounted` (runs when component is added to the page) and `onUnmounted` (runs when component is removed).

Why would you need this? Consider what happens when your app loads. Your component is created, Vue sets up all your refs and computed properties, but the HTML isn't on the page yet. If you try to access DOM elements or load data immediately, it might fail. That's where `onMounted` comes in, it guarantees the component is fully ready.

Similarly, if you start a timer or subscribe to events, you need to clean them up when the component is destroyed. Otherwise, you create memory leaks. That's where `onUnmounted` saves you.

Let's see this in action.

### Observe Component Mounting

Open your `App.vue` and import `onMounted` at the top of your script:

```ts
import { onMounted } from 'vue'
```

Now add this code right after your `useProducts()` destructuring:

```ts
onMounted(() => {
  console.log('App component has mounted!')
  console.log('Number of products:', products.value.length)
})
```

Save the file and open your browser console. You should see the log messages appear once when the page loads. This code runs **after** Vue has rendered your component to the page.

Try adding another `console.log` outside the `onMounted` hook (just a normal line in your script). You'll see it runs **before** the mounted message. That's because code in `<script setup>` runs immediately when the component is created, but `onMounted` waits until everything is rendered.

---

## Persisting Data with LocalStorage

Now that you have seen lifecycle hooks, let's solve the persistence problem. Browsers provide a simple key-value storage system called **localStorage**. It stores strings that survive page refreshes and browser restarts. Perfect for saving user data.

The API is simple:
- `localStorage.setItem('key', 'value')` - Save data
- `localStorage.getItem('key')` - Retrieve data
- `localStorage.removeItem('key')` - Delete data

Since localStorage only stores strings, you need to convert your products array to JSON when saving and parse it back when loading. JavaScript provides `JSON.stringify()` and `JSON.parse()` for this.

### Loading Products

Let's start with moving the `ref()` of products above the `useProducts` method. We don't need to return this list anymore as we're going to create seperate methods for accesing the list. By moving it above the method it also get's intiliazed only once, making it shared when we have different pages in the future (lesson 4, routing). 

We're going to remove the three default products from that list and let it load the products from LocalStorage instead. If there is no `products` key in your LocalStorage, use an empty array. Your products `ref()` will now look like this. 

```ts
const products = ref<Product[]>(JSON.parse(localStorage.getItem('products') || '[]'))
```

### Add an save function?

Once a product get's modified or added we need to save it to LocalStorage again. We could create a `saveProducts()` method and call this from the other methods. But there's a problem with this approach. Every time you add a new function that modifies products, you have to remember to call `saveProducts()`. It's easy to forget and repetitive. This is where **watchers** come in.

---

## Watchers - Automatic Reactions to Changes

Computed properties are great when you need to **derive a value** from other data. But what if you need to **perform an action** when data changes? That's what watchers are for.

A watcher observes a piece of reactive data and runs a function whenever it changes. Unlike computed properties, watchers don't return a value, they trigger side effects like saving to localStorage, making API calls, or updating other data.

Here's the key difference:
- **Computed properties** → derive new values (pure functions, no side effects)
- **Watchers** → trigger actions (side effects like saving, logging, API calls)

The `watch()` function takes two arguments: the data to watch and a callback function that runs when it changes.

### Automatic Saving with Watch
In your `composables/useProducts.ts`, import `watch`:

```ts
import { ref, computed, watch } from 'vue'
```

Directly underneath the `products` `ref()` we're going to create the watcher. When something in `products` changed, our arrow function receives the latest version of it, and saves that to the localstorage. 

```ts
watch(products, (latest) => {
    localStorage.setItem('products', JSON.stringify(latest))
}, { deep: true })
```

The `{ deep: true }` option is important. By default, Vue only watches if you replace the entire array (like `products.value = newArray`). But you're pushing to the array and modifying objects inside it. Deep watching tells Vue to track changes inside the array too.

Now test it: add a product, edit a product, delete a product. Check your browser's Application/Storage tab → Local Storage. You should see the products key updating automatically.

### Add a "Last Saved" Indicator

Users like to know when their data is saved. Let's add a timestamp that updates whenever products are saved.

In your `composables/useProducts.ts`, add a new ref:

```ts
  const lastSaved = ref<string | null>(null)
```

Update your watcher to set the timestamp:

```ts
watch(products, (latest) => {
    localStorage.setItem('products', JSON.stringify(latest))
    lastSaved.value = new Date().toLocaleTimeString()
}, { deep: true })
```

Add `lastSaved` to your return statement. Then in `App.vue`, display it in your template (maybe below your product stats):

```vue
<div v-if="lastSaved">Last saved: {{ lastSaved }}</div>
```

Now every time you modify products, you'll see the timestamp update. This is the power of watchers, they let you perform actions in response to changes without cluttering your logic functions.

---

## Lifecycle hooks

Your app now saves automatically whenever products change. But there's a usability problem: when you're editing a product, there's no way to cancel and go back to the add form. Let's add a keyboard shortcut, pressing `Escape` cancels editing mode.

This introduces a new challenge: keyboard shortcuts require adding event listeners to the document. These listeners stay active forever unless you clean them up. When a component is destroyed but its listeners remain active, you create a **memory leak**. The browser keeps running code for a component that no longer exists, wasting resources and potentially causing bugs.

The solution is `lifecycle hooks`. These are methods that trigger on the lifecycle events or the component they are in. Like we have seen earlier in this lesson.

### Add Escape to Cancel Editing

First, you need a function to cancel editing. In your `App.vue`, add this function with your other functions:

```ts
function cancelEdit() {
  editingId.value = null // or 0, depending on how you typed the ref()
  newProductName.value = ''
  newProductPrice.value = 0
}
```

This resets the editing state and clears the form, just like after adding a product.

Now add a keyboard listener. Import `onMounted` and `onUnmounted` at the top of your script if you haven't already:

```ts
import { ref, onMounted, onUnmounted } from 'vue'
```

Add this code in your `App.vue` after your functions:

```ts
function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Escape' && editingId.value !== null) {
    cancelEdit()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  console.log('Cleaned up keyboard listener')
})
```

Test it: click Edit on a product, then press `Escape`. The form should clear and switch back to "Add Product" mode. This is how professional apps work, keyboard shortcuts make them feel polished.

**About the cleanup:** You won't actually see the cleanup console.log in this case. Your App component is the root component, it only unmounts when you close the browser tab, and at that point the browser destroys everything anyway (including all event listeners). So technically, the cleanup is redundant here.

However, we're teaching this pattern now because in the next lesson, we'll extract this form into a `ProductForm` component. When that component is a child that can be shown and hidden, the cleanup becomes essential. Without `onUnmounted`, the event listener would keep running even after the component is removed from the page, creating a memory leak. The component is gone, but the listener still fires on every keypress, trying to access data that no longer exists.

The pattern is important: **every resource you allocate, you should clean up**. This includes:
- Event listeners → remove with `removeEventListener`
- Timers (`setInterval`, `setTimeout`) → clear with `clearInterval`/`clearTimeout`
- WebSocket connections → close the socket
- API request cancellations → abort ongoing requests

---

👉 **Exercise:** Add a 'Cancel edit' button to the form that uses the same `cancelEdit()` function to cancel the editing. Make sure the button is in the form, below the submit button and it only shows up when actually editing a product.

## Advanced Watchers

Watchers are more flexible than you've seen so far. You can watch specific properties, run the watcher immediately on mount, and access both old and new values.

### Watching Specific Properties

Sometimes you don't want to watch the entire object, just one property. For example, watch when a specific product's price goes above $1000.

You can't watch `products.value[0].price` directly because the product at index 0 might change. Instead, use a function that returns what you want to watch:

```ts
watch(
  () => products.value.find(p => p.price > 1000),
  (expensiveProduct) => {
    if (expensiveProduct) {
      console.log('Expensive product detected:', expensiveProduct.name)
    }
  }
)
```

This watches for any product going over $1000 and logs it. The watcher runs whenever the result of the function changes.

👉 **Exercise:** Modify the code above (and other needed code) to display a warning message on the page (in red text) instead of using console.log. The warning should appear when an expensive product exists and disappear when all products are under $1000.

**💡 Thought exercise**\
Could this warning message also be done by using a computed value instead of a watcher? Which solution would be more optimal? Make the change if needed.

### Immediate Option

By default, watchers only run when the data changes, not on initial mount. If you want it to run immediately, use the `immediate` option:

```ts
watch(products, () => {
    // do something here
}, { deep: true, immediate: true })
```

Now the callback runs once on mount (with initial data) and then every time products change.


## Summary

You've now completed three essential lessons. Your product app has full CRUD functionality, automatic persistence, and responds to data changes intelligently. Here's what you learned today:

**Lifecycle Hooks** are functions that run at specific moments in a component's life. `onMounted` runs when the component is added to the page (perfect for loading data or accessing the DOM). `onUnmounted` runs when the component is removed (essential for cleanup to prevent memory leaks). Every framework has these concepts, React has `useEffect`, Angular has lifecycle methods. The pattern is universal.

**Watchers** let you perform side effects when data changes. Unlike computed properties (which derive values), watchers trigger actions like saving to localStorage or making API calls. Use `watch()` with the `deep` option to track changes inside objects and arrays. Always consider whether a computed property would work first, watchers are more powerful but harder to reason about. Remember the rule: **prefer computed properties when deriving values, use watchers only when you need side effects** (saving, API calls, logging, etc.).

**LocalStorage** provides simple key-value persistence in the browser. Perfect for saving user data between sessions. Always use `JSON.stringify()` to save and `JSON.parse()` to load because localStorage only stores strings.

**Cleanup** prevents memory leaks. Every timer, event listener, or resource you create should be cleaned up in `onUnmounted`. This is critical for child components that mount and unmount frequently.

The pattern you learned today, load on mount, save on change, cleanup on unmount, applies to almost every data persistence scenario. Whether you're working with localStorage, a database, or a real-time API, the structure remains the same.

---

## Practical Exercises
👉 **Exercise: Add a Stats Watcher**\
Watch the `totalValue` computed property and console.log a message when it exceeds $5000. This shows you can watch computed properties, not just refs. (Hint: use a function in the watcher: `() => totalValue.value`)

👉 **Exercise: Add an "Unsaved Changes" Warning**\
Add a "Save All" button. Use a watcher to detect unsaved changes and show a warning (like "You have unsaved changes" in red text). Clear the warning when they click Save All.

---

## Thought Questions

💡 **Conceptual Understanding**

- Why can't you access DOM elements directly in `<script setup>` but you can inside `onMounted`? What's the difference?

- When would you use a watcher instead of a computed property? Can you think of a case where using a computed property would be wrong?

- What happens if you forget to remove an event listener in `onUnmounted`? How would you debug a memory leak caused by this?

- The `deep: true` option makes watchers slower because Vue has to check every nested property. When might you avoid deep watching and manually trigger saves instead?

- If you watch `products` and `products` is also watched by another watcher, what order do they run in? Does it matter?

- Why do we save products as JSON strings instead of JavaScript objects? What would happen if localStorage accepted objects directly?

---

**Next Lesson:** Component Communication - Props and Events - We'll learn how to break your growing app into multiple components and have them communicate with each other!
