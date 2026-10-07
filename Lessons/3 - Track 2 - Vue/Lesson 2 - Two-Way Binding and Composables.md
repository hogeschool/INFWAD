# Vue with TypeScript
## Two-Way Binding and Composables

In Lesson 1, you built a product catalog that can display and delete products. Now we'll complete the CRUD functionality by adding the ability to **Create** and **Update** products. Along the way, you'll learn about two-way data binding, computed properties, and composables - patterns you'll use in every Vue application.

---

## Understanding What Happens Under the Hood

Before we dive in, let's take a quick look at what's actually happening when you run your Vue application.

👉 **Exercise 0: Inspect the browser source**\
Open your product catalog from Lesson 1 in the browser. Make sure the dev server is running (`npm run dev`). Now:

1. **Right-click** on the page and select **"View Page Source"** (or press `Ctrl+U` / `Cmd+U`)
2. Look at the HTML - it's just your `index.html` with a div and a script tag. No product cards, no Vue components!
3. Notice the `<script type="module" src="/src/main.ts"></script>` tag

Now let's see what JavaScript is actually running:

4. **Open DevTools** (`F12` or right-click → Inspect)
5. Go to the **Sources** tab (or **Debugger** in Firefox)
6. Look at the files loaded - you'll see your Vue files, but also notice how Vite serves them

**What's happening?**
- Vite **compiles** your `.vue` files and TypeScript into JavaScript
- The JavaScript is **bundled** together (combined into fewer files)
- In development, code is readable for debugging
- When you build for production (`npm run build`), the code is **minified** - all whitespace removed, variables renamed to single letters, comments stripped. This makes files much smaller for faster loading.

Try running `npm run build` in your terminal (you can cancel the dev server with `Ctrl+C` first). After it finishes, look in the new `dist/` folder. Open one of the `.js` files - that's minified production code! It's unreadable to humans but much faster to download.

This is what modern build tools do: they transform your developer-friendly code into browser-optimized code.

**If you stopped your dev server, start it again:**
```bash
npm run dev
```

---

## Two-Way Binding with v-model

So far, you've worked with **one-way data flow**: data flows from your refs to the template via interpolation (`{{ }}`), and events flow back up with `@click`. But forms need something different: **two-way binding**.

### The Problem: Keeping Forms in Sync

Think about a text input. You need to:
1. Display the current value in the input
2. Update your data when the user types
3. Keep them perfectly synchronized

In plain JavaScript, this is tedious:

```js
let productName = '';

const input = document.getElementById('nameInput');

// Update data when user types (input → data)
input.addEventListener('input', (e) => {
  productName = e.target.value;
});

// Update input when data changes (data → input)
input.value = productName;
```

You have to manually sync both directions. In a form with many fields, this becomes repetitive and error-prone.

### Vue's v-model: Automatic Two-Way Sync

Vue (and other modern frameworks) solve this with **two-way binding**. In Vue, the `v-model` directive automatically syncs an input with a reactive variable:

```vue
<input v-model="productName" type="text">
```

Behind the scenes, this is shorthand for:

```vue
<input 
  :value="productName" 
  @input="productName = $event.target.value"
>
```

- `:value="productName"` - binds the input's value to your ref (data → input)
- `@input="..."` - updates your ref when user types (input → data)

Both directions happen automatically! When the user types, `productName` updates. If you change `productName` in code, the input updates.

**Why is this universal?**
Every framework needs two-way binding for forms:
- **React**: Uses `value` + `onChange` (manual two-way binding)
- **Angular**: Uses `[(ngModel)]` (two-way binding syntax)
- **Svelte**: Uses `bind:value` (two-way binding)

The syntax differs, but the concept is the same: form inputs need data to flow both ways.

👉 **Exercise 1: Test two-way binding**\
Open your `App.vue` from Lesson 1. Add a new ref: `const testInput = ref<string>('')`. In your template, add an input with `v-model="testInput"` and a paragraph that displays `{{ testInput }}`. Type in the input and watch the paragraph update in real-time. This is two-way binding in action!

---

## Building a Create Form

Let's add the ability to create new products. We'll start simple, then build it up step by step.

### Step 1: Add form state

In your `App.vue` script section, add refs for the new product fields:

```ts
const newProductName = ref<string>('')
const newProductPrice = ref<number>(0)
```

These will store what the user types in the form.

### Step 2: Create the add function

Add a function to create a new product:

```ts
function addProduct() {
  // Validate the input
  if (newProductName.value.trim() === '' || newProductPrice.value <= 0) {
    alert('Please enter a valid name and price')
    return
  }
  
  // Create the new product
  const newProduct: Product = {
    id: Date.now(), // Simple temporary ID - in real apps, the backend generates this
    name: newProductName.value,
    price: newProductPrice.value,
  }
  
  // Add to the array
  products.value.push(newProduct)
  
  // Reset the form
  newProductName.value = ''
  newProductPrice.value = 0
}
```

**What's happening?**
- We validate the input (don't create invalid products)
- We use `Date.now()` for a simple ID (just a timestamp - fine for learning, but backends should generate IDs)
- We push the new product to the array
- We reset the form so it's ready for the next product

### Step 3: Build the form template

In your template, add the form above the product list:

```vue
<form @submit.prevent="addProduct">
  <h2>Add New Product</h2>
  
  <label>
    Product Name
    <input v-model="newProductName" type="text">
  </label>
  
  <label>
    Price
    <input v-model.number="newProductPrice" type="number">
  </label>
  
  <button type="submit">Add Product</button>
</form>
```

**Notice:** The shared `base.css` styles these semantic form elements. The form markup remains plain HTML, while the stylesheet supplies the inputs and button with consistent spacing, borders, and focus states.

**Vue binding modifiers**
A quick introduction to modifiers. Notice the `.prevent` at `@submit`. This adds the vanilla JavaScript `preventDefault()` method to the submit event. Also notice the `.number` and the v-model for the price. This converts the input to a number automatically. There are many more modifiers, we will encounter more during the rest of the course. 

*Quick reminder! We copied the homemade `base.css` into the project in the first lesson. It provides the shared form and button styles; no CSS library is required.*

Save and test! You should now be able to add products. Type in the form fields and click "Add Product" - the new product appears in the list instantly.

👉 **Exercise 2: Add form validation feedback**\
Instead of using `alert()`, create a `formError` ref. Display an error message below the form if validation fails. Clear the error when the user successfully adds a product. Style the error message with red text.

---

## Building an Update Form

Now let's add the ability to edit existing products. This is trickier because we need to know which product we're editing. Pre-fill the form with the current values. Save the changes back to the array.

### The Strategy

Instead of building a separate editing interface, we'll **reuse the same form** for both creating and editing products. When you click "Edit" on a product, the form will populate with that product's data. This way we don't need to write the form code again.

### Step 1: Track which product is being edited

Add a ref to track the editing state:

```ts
const editingId = ref<number | null>(null)
```

When this is `null`, we're in "create mode". When it contains an ID, we're in "edit mode".

### Step 2: Modify the form to handle both create and edit

We can use this `ref` in our `template` code to decide what should be displayed.

```vue
<form @submit.prevent="handleSubmit">
  <h2>{{ editingId ? 'Edit Product' : 'Add New Product' }}</h2>
  
  <label>
    Product Name
    <input v-model="newProductName" type="text">
  </label>
  
  <label>
    Price
    <input v-model.number="newProductPrice" type="number">
  </label>
  
  <button type="submit">
    {{ editingId ? 'Update Product' : 'Add Product' }}
  </button>

</form>
```

**What changed?**
- Title changes based on mode: "Add New Product" vs "Edit Product"
- Button text changes: "Add Product" vs "Update Product"

### Step 3: Add an update function

Add a new function to update existing products:

```ts
function updateProduct() {
  // Validate
  if (newProductName.value.trim() === '' || newProductPrice.value <= 0) {
    alert('Please enter a valid name and price')
    return
  }
  
  // Find and update the product
  const product = products.value.find(p => p.id === editingId.value)
  if (product) {
    product.name = newProductName.value
    product.price = newProductPrice.value
  }
  
  // Reset form and exit edit mode
  editingId.value = null
  newProductName.value = ''
  newProductPrice.value = 0
}
```

Now update your form to call the right function based on the mode:

```vue
<form @submit.prevent="editingId ? updateProduct() : addProduct()">
  <h2>{{ editingId ? 'Edit Product' : 'Add New Product' }}</h2>
  
  <label>
    Product Name
    <input v-model="newProductName" type="text">
  </label>
  
  <label>
    Price
    <input v-model.number="newProductPrice" type="number">
  </label>
  
  <button type="submit">
    {{ editingId ? 'Update Product' : 'Add Product' }}
  </button>
</form>
```

### Step 4: Add Edit button to ProductCard

In `ProductCard.vue`, add an Edit button and emit event. Update the emits:

```ts
const emit = defineEmits<{
  delete: [id: number]
  edit: [id: number]
}>()
```

Add the Edit button in your template:

```vue
<template>
  <div class="product-card">
    <h3>{{ name }}</h3>
    <p>${{ price.toFixed(2) }}</p>
    
      <button @click="emit('edit', id)">Edit</button>
      <button @click="emit('delete', id)" class="secondary">Delete</button>

  </div>
</template>
```


### Step 5: Handle the edit event in App.vue

Add a function to load a product into the form:

```ts
function startEditing(product: Product) {
  editingId.value = product.id
  newProductName.value = product.name
  newProductPrice.value = product.price
}
```

Update your ProductCard usage to listen for the edit event:

```vue
<ProductCard
  v-for="product in products"
  :key="product.id"
  :id="product.id"
  :name="product.name"
  :price="product.price"
  @edit="startEditing(product)"
  @delete="deleteProduct"
/>
```

**Notice:** No more `isEditing` prop needed! ProductCard is now much simpler.

Now test it! Click "Edit" on a product - the form at the top should populate with that product's data. Make changes and click "Update Product".


---

## Computed Properties - Efficient Derived State

You now have full CRUD functionality! But let's add some useful features that demonstrate **computed properties** - one of Vue's most powerful features.

### The Problem with Regular Functions

Imagine you want to display stats about your products:

```ts
function getTotalValue() {
  return products.value.reduce((sum, p) => sum + p.price, 0)
}

```

In your template:
```vue
<p>Total: ${{ getTotalValue() }}</p>
```

**The problem:** These functions run **every time Vue re-renders**, even if `products` hasn't changed. If you type in a form input, Vue re-renders. If you hover over a button with CSS that changes, Vue might re-render. These functions recalculate every time, even though the result is the same.

In a complex app, this wastes performance.

### Computed Properties: Smart Caching

**Computed properties** are like functions, but Vue caches their results and only recalculates when their dependencies change.

Import `computed`:

```ts
import { ref, computed } from 'vue'
```

Create computed properties:

```ts
const productCount = computed(() => {
  return products.value.length
})

const totalValue = computed(() => {
  return products.value.reduce((sum, p) => sum + p.price, 0)
})

```

Use them in your template like regular variables:

```vue
<div class="stats">
  <div class="stat">
    <strong>Products:</strong> {{ productCount }}
  </div>
  <div class="stat">
    <strong>Total Value:</strong> ${{ totalValue.toFixed(2) }}
  </div>
</div>
```

Add styles:

```css
.stat {
  margin: 1rem;
}
```

**Understanding scoped CSS:**
We only wrote CSS for the spacing. The shared `base.css` provides the global typography and colors, while scoped CSS handles layout that is specific to this component. This keeps the styling easy to inspect and change.

**How computed properties work:**
1. Vue tracks which refs are accessed inside the computed function
2. When any of those refs change, Vue marks the computed as "stale"
3. Next time the computed is accessed, Vue recalculates it
4. If the dependencies haven't changed, Vue returns the cached value

**When to use computed:**
- Deriving values from reactive data (like totals, averages)
- Filtering or transforming arrays
- Complex calculations you don't want to repeat
- Any value that depends on other reactive values

**When to use functions:**
- You need to pass parameters
- You explicitly want it to run every time

👉 **Exercise 3: Add more computed properties**\
Create a computed property `averageProductPrice` and display it with the other stats.

---

## Composables - Reusable Logic

Your `App.vue` is getting crowded with product logic. What if another component needs to work with products? You'd have to copy-paste all the functions. That's a maintenance nightmare.

**Composables** solve this problem.

### What is a Composable?

A **composable** is just a function that contains reactive logic (refs, computed, etc.) and returns it so multiple components can reuse it.

**Simple example (just for understanding):**

Imagine you have a counter that multiple components need to use:

```ts
// composables/useCounter.ts
import { ref } from 'vue'

export function useCounter() {
  const count = ref<number>(0)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return { count, increment, decrement }
}
```

Now ANY component can use this counter:

```vue
<!-- Component A -->
<script setup>
import { useCounter } from './composables/useCounter'
const { count, increment } = useCounter()
</script>
<template>
  <button @click="increment">{{ count }}</button>
</template>
```

**Key insight:** Each component gets its **own instance** of the counter. They don't share the same count - each has separate reactive state.

### Composable Structure

Every composable follows the same pattern:

1. **Import Vue's reactivity tools** (`ref`, `computed`, etc.)
2. **Create reactive state** (refs, computed properties)
3. **Create functions** that work with that state
4. **Return everything** components need (state + functions)

That's it! Now let's apply this to our products.

### Creating useProducts Composable

Create a new folder and file: `src/composables/useProducts.ts`

**Step 1: Import and setup**

```ts
import { ref, computed } from 'vue'

export interface Product {
  id: number
  name: string
  price: number
}

export function useProducts() {
  // Everything goes here
}
```

**Step 2: Add state (refs)**

Copy your products array and editingId from App.vue:

```ts
export function useProducts() {
  const products = ref<Product[]>([
    { id: 1, name: "Laptop", price: 999.99 },
    { id: 2, name: "Mouse", price: 29.99 },
    { id: 3, name: "Keyboard", price: 79.99 },
  ])
  
  const editingId = ref<number | null>(null)
```

**Step 3: Add computed properties**

Copy `productCount` and `totalValue` from App.vue (just copy-paste them here).

**Step 4: Add functions**

Here's the important part: **Only move the data logic, not the UI logic.**

From your App.vue `addProduct` function, extract just the data part:

```ts
  function addProduct(name: string, price: number) {
    const newProduct: Product = {
      id: Date.now(),
      name,
      price
    }
    products.value.push(newProduct)
  }
```

Notice what's MISSING:
- No validation (that's UI concern)
- No form reset (that's UI concern)
- Just creates and adds the product (data logic)

Do the same for `updateProduct` and `deleteProduct` - only the data operations.

**Step 5: Return everything**

```ts
  return {
    products,
    editingId,
    productCount,
    totalValue,
    addProduct,
    updateProduct,
    deleteProduct
  }
}
```

**That's a composable!** Just a function that bundles related reactive logic together.

### Using the Composable

Now update your `App.vue` to use it
At the top of your `<script setup>`:

```ts
import { useProducts } from './composables/useProducts'

const {
  products,
  editingId,
  productCount,
  totalValue,
  addProduct: addToProducts,
  updateProduct: updateInProducts,
  deleteProduct
} = useProducts()
```

**Why the renaming?** We rename `addProduct: addToProducts` because we'll create our own `addProduct()` function that adds validation and form reset.

**Step 2: Update your functions**

Change your `addProduct` function from this:

```ts
function addProduct() {
  // validation
  const newProduct: Product = { /*...*/ }
  products.value.push(newProduct)  // ❌ Direct manipulation
  // form reset
}
```

To this:

```ts
function addProduct() {
  // validation (keep this)
 
  // Call composable to handle adding logic
  addToProducts(newProductName.value, newProductPrice.value)  
  
  // form reset (keep this)

}
```

Do the same for `updateProduct` - keep validation and form reset, call `updateInProducts()` for the data logic.

**That's it!** Your code is now cleaner and reusable.

**What you've learned:**
- Composables = reusable reactive logic
- Components = UI logic (validation, user feedback)
- Separation of concerns = easier to maintain and test

Every modern framework has this pattern (React hooks, Angular services). You're learning universal concepts, not just Vue. We'll create more composables later to handle other logic.


---


## Summary

You've completed the first two lessons with full CRUD functionality! Here's what you've learned:

**Two-Way Binding** - Forms need data to flow both ways. `v-model` handles this automatically, making form development simple and declarative.

**Computed Properties** - Cache derived values and only recalculate when dependencies change. Essential for performance and clean code.

**Composables** - Extract reusable logic into functions that can be shared across components. This is how you build maintainable Vue applications.

**Complete CRUD** - You can now Create, Read, Update, and Delete products. This is the foundation of almost every web application.

**Universal Patterns** - These aren't Vue-specific tricks:
- React has custom hooks (same as composables)
- Angular has services and RxJS
- All frameworks need two-way binding for forms
- Computed/memoized values exist everywhere

You're learning how to structure modern web applications, not just Vue syntax.

## Practical Exercises

👉 **Exercise 4: Add a "Clear All" button**\
Add a button that clears all products from the list. Put this function in your composable.

## Thought Questions

💡 **Conceptual Understanding**

- Why does Vue need to know when to recalculate computed properties? What would happen if they always recalculated on every render?

- When would you use a composable vs keeping logic in a component? What are the tradeoffs?

- How does v-model demonstrate two-way binding? Could you implement it manually with :value and @input?

- Why do we pass the full Product object to `startEditing` in App.vue instead of just the ID?

- What's the difference between a ref and a computed property? When should you use each?

---

**Next Lesson:** Lifecycle Hooks and Watchers - We'll learn how to run code when components mount, watch for specific changes, and clean up resources when components are destroyed!
