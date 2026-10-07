# Vue with TypeScript
## Lesson 6: Fetching Data from APIs

Your app has come a long way. It has components, pages, routing, and thanks to Lesson 3 it even remembers your products after a refresh. But there is one thing all of that data has in common: you typed it in yourself. Real applications get their data from a server somewhere on the internet.

In this lesson you will load a list of products from **FakeStoreAPI**, a free public API that returns realistic product data including names, prices, and images. The fetched products go into the same `products` ref you already have. That means everything you built so far keeps working: editing, deleting, the detail page, and the automatic saving to localStorage.

Along the way you'll learn how asynchronous code works in JavaScript, how to use the browser's built-in `fetch` function, and how to show loading and error states while a request is in progress.

By the end, your app will start with real products from the internet, display their images, and still remember every edit you make.

👉 **Exercise 0: Confirm your baseline**\
Run `npm run dev` and verify that navigation works, you can add, edit and delete products, your changes survive a refresh, and clicking a product takes you to its detail page. Fix any issues before continuing.

---

## Looking at the Data First

Before writing any code, let's look at what we're going to fetch. An API is just a URL that returns data instead of a web page.

👉 **Exercise 1: Explore FakeStoreAPI in your browser**\
Open `https://fakestoreapi.com/products/1` in your browser. You'll see a JSON object representing a single product. Look at the field names: `id`, `title`, `price`, `description`, `category`, `image` and `rating`. Then open `https://fakestoreapi.com/products` to see the full list of products.

Notice something important: the product name is called **`title`**, not `name`. Your `Product` interface uses `name`. We'll deal with that gap in a moment. Also notice that this API gives us an `image` URL, something our products didn't have until now.

> **Backup API:** FakeStoreAPI is a free public service and is sometimes down. If it doesn't respond, use `https://kevinkrul.nl/api/products` (and `https://kevinkrul.nl/api/products/1` for a single product) instead. It returns the same fields in the same shape, so everything in this lesson works the same. Just replace `https://fakestoreapi.com/products` with `https://kevinkrul.nl/api/products` wherever it appears.

---

## Why Fetching Is Different

All the code you've written so far is **synchronous**. Each line runs, finishes, and then the next line runs:

```ts
const name = "Laptop"
const price = 999.99
console.log(name) // runs right after the line above finishes
```

Getting data from the internet is different. A network request can take a few milliseconds or several seconds. If JavaScript waited for the response before running the next line, the entire page would freeze. No scrolling, no clicking, nothing, until the server answers.

JavaScript solves this with **asynchronous operations**. Instead of waiting, you start the task and say: "when this finishes, continue here". The browser keeps handling clicks and animations in the meantime.

Think of ordering food at a restaurant. Synchronous would be standing at the kitchen window, frozen, until your dish is ready. Asynchronous is sitting at your table, continuing your conversation, while the waiter brings the food when it's done.

This isn't unique to JavaScript. C# has `Task` and `async/await`, Python has `asyncio`, Kotlin has coroutines. The syntax differs, the idea is identical: start a slow operation, don't block, handle the result later.

### Promises

In JavaScript, every network request returns a **Promise**: an object that represents a value that doesn't exist yet. A Promise is in one of three states:

- **Pending**: still running
- **Fulfilled**: finished successfully and produced a value
- **Rejected**: failed with an error

You can handle a Promise with `.then()` and `.catch()`:

```ts
fetch('https://fakestoreapi.com/products/1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error))
```

This works, but every step adds another level of chaining and it gets hard to read quickly. That's why modern code almost always uses `async/await` instead.

### async/await

`async/await` is syntax on top of Promises that lets asynchronous code *look* synchronous:

```ts
async function fetchProduct() {
  const response = await fetch('https://fakestoreapi.com/products/1')
  const data = await response.json()
  console.log(data)
}
```

Two keywords, two rules:

- `await` pauses *this function* until the Promise resolves and hands you the actual value. You can only use `await` inside an `async` function.
- `async` marks a function as asynchronous. Such a function automatically returns a Promise itself.

When JavaScript hits an `await`, the browser doesn't freeze. Only that one function waits. Everything else keeps running, and when the Promise resolves the function continues right where it left off.

---

## Your First Fetch

Let's add a fetch to the composable you already have. Open `src/composables/useProducts.ts` and add this function inside `useProducts()`, next to your other functions:

```ts
async function fetchProducts() {
  const response = await fetch('https://fakestoreapi.com/products')
  const data = await response.json()
  console.log(data)
}
```

`fetch()` sends a GET request and gives you a `Response` object, containing the status code, headers and body. Reading the body as JSON with `.json()` is also asynchronous, which is why it needs its own `await`.

Add `fetchProducts` to the return object of the composable. Then call it when the products page loads. Open `src/pages/ProductManagementPage.vue`. You used `onMounted` in Lesson 3 to run code when a component is added to the page, and loading data is exactly what it's made for. Add `fetchProducts` to your destructuring and call it in `onMounted`:

```ts
import { ref, onMounted } from 'vue'

const { products, fetchProducts, /* ...your other values */ } = useProducts()

onMounted(() => {
  fetchProducts()
})
```

You don't need `await` here. `fetchProducts` is asynchronous, but we don't need to wait for its result, we just want it started.

Why the products page? It is the page that needs the products, so it is the page that asks for them. Home and About don't depend on the data, so they shouldn't wait for it or break when the API is down. Because `products` is shared state (you moved it outside `useProducts()` in Lesson 3), the data stays available when you navigate to other pages.

👉 **Exercise 2: Look at the response**\
Run the app, open the Products page and open your browser's DevTools. In the **Console** tab you should see an array of product objects. In the **Network** tab, find the request to `fakestoreapi.com/products` and click on it to see the status code and the response. Expand a few objects in the console and compare them to your `Product` interface.

### Checking for errors

Here is a detail that trips up many developers: **`fetch()` does NOT throw an error for HTTP error codes.** If the server answers with a 404 (Not Found) or a 500 (Server Error), `fetch` still considers that a success. The server did respond, just with bad news.

You have to check `response.ok` yourself. It is `true` for status codes 200 to 299 and `false` for everything else:

```ts
async function fetchProducts() {
  const response = await fetch('https://fakestoreapi.com/products')

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const data = await response.json()
  console.log(data)
}
```

Other HTTP libraries like Axios throw automatically on non-2xx codes. With `fetch` it's your job.

---

## Using the Data

Now let's put the data in our `products` list. This is where the `title` vs `name` gap from Exercise 1 matters.

### Describing the API's shape

TypeScript can help us here. First, tell it what we expect the API to return. Add this interface at the top of `useProducts.ts`, below the imports:

```ts
interface FakeStoreProduct {
  id: number
  title: string
  price: number
  image: string
  description: string
  category: string
  rating: { rate: number; count: number }
}
```

Then give `data` that type. If you mistype a field name later, TypeScript will now tell you:

```ts
const data: FakeStoreProduct[] = await response.json()
```

### Adding an image to Product

The API gives us an image for every product. Open `src/types/Product.ts` and add an optional `image` property:

```ts
export interface Product {
  id: number
  name: string
  price: number
  image?: string
}
```

The `?` makes it an **optional property**. A product *can* have an image but doesn't have to. Products you created by hand (without an image) stay valid. If `image` were required, TypeScript would flag every place in your app that creates a product.

### The mapping step

Replace the `console.log(data)` line with this:

```ts
products.value = data.map(item => ({
  id: item.id,
  name: item.title,
  price: item.price,
  image: item.image
}))
```

External APIs almost never match your app's own types. The standard practice is to transform the response into your own shape right at the boundary of your system, here inside `fetchProducts`. The rest of your app only ever sees `Product` objects and never needs to know the API calls it `title`.

👉 **Exercise 3: Clear your old data and see the result**\
Your browser still has the test products you created in earlier lessons, saved in localStorage. Open DevTools, go to **Application → Local Storage**, and delete the `products` key (or use "Clear all"). Go to the products page and refresh it. You should now see all the fetched products, each with a real name and price.

Now check Local Storage again. The `products` key is back, filled with the fetched data. You didn't write any code for that. The watcher from Lesson 3 noticed that `products` changed and saved it. This is the payoff of using a watcher instead of calling a save function by hand.

---

## The Refresh Problem

Try this: edit the name of a product and delete another one. Everything works, because those functions only change the `products` list. Now refresh the page.

Your edits are gone. Every refresh fetches all the original products again and overwrites everything, including the changes that were saved in localStorage.

We don't want to fetch every time. We only want to fetch when there is nothing yet. The simplest check is whether the `products` key exists in localStorage. On the very first visit it doesn't. After that, the watcher has created it. Add a new function to the composable, below `fetchProducts`:

```ts
async function initProducts() {
  if (localStorage.getItem('products') === null) {
    await fetchProducts()
  }
}
```

Why check for `null` and not for an empty list? If a user deletes all their products, an empty list is a valid choice and should be remembered. Only a missing key means "never fetched".

Add `initProducts` to the return object, and in `ProductManagementPage.vue` call `initProducts()` instead of `fetchProducts()`.

👉 **Exercise 4: Edits survive again**\
Edit a product and delete another one, then refresh. Your changes should still be there. Check the Network tab to confirm no new request to FakeStoreAPI was made. Then clear the `products` key in Local Storage and refresh to confirm the fetch happens again.

👉 **Exercise 5: Add a "Reset products" button**\
Sometimes users want the original data back. Add a button to the products page that calls `fetchProducts()` directly. Because `fetchProducts` replaces the whole list, it works as a reset, and the watcher saves the result. Why does this button call `fetchProducts` and not `initProducts`?

A note about what we're doing here: we only ever *read* from FakeStoreAPI. It is a demo API, so its update and delete endpoints don't actually change anything. Using it as starter data and keeping our changes in localStorage is a good fit for now. When you build your own Express backend, the server will hold the data and localStorage won't be needed anymore.

---

## Loading and Error State

Right now the user sees an empty page while the request is running, and nothing at all if it fails. Both are bad experiences. We need to keep track of two extra things: is a request running, and did it fail?

Just like `products`, these should be shared state. Add them directly below your `products` ref, outside of `useProducts()`:

```ts
const loading = ref(false)
const error = ref<string | null>(null)
```

Now update `fetchProducts` to use them. This is also where we make the function safe against failures, using `try/catch/finally`:

```ts
async function fetchProducts() {
  if (loading.value) return

  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://fakestoreapi.com/products')

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data: FakeStoreProduct[] = await response.json()

    products.value = data.map(item => ({
      id: item.id,
      name: item.title,
      price: item.price,
      image: item.image
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred'
  } finally {
    loading.value = false
  }
}
```

Network requests can fail: the server might be down, the user might lose their connection, the URL might be wrong. `try/catch` is how you handle that. Anything in the `try` block that throws, including our own `throw new Error(...)` for a bad status code, jumps straight to `catch`. That means one `catch` handles both network failures and HTTP errors.

The `finally` block runs no matter what, success or failure. That's exactly where `loading.value = false` belongs. If you put it at the end of the `try` block instead, a failed request would leave the loading message on screen forever.

**Why `err instanceof Error`?** In JavaScript, a `catch` block receives a value of type `unknown`. Anyone could `throw "oops"` or `throw 42`. The `instanceof Error` check only reads `.message` when the caught value really is an `Error`, and falls back to a generic message otherwise. It keeps TypeScript happy and your code robust.

Add `loading` and `error` to the return object of `useProducts`.

The first line of `fetchProducts` stops a second request from starting while one is already running. It matters later in this lesson, when more than one page can ask for the data.

---

## Showing the Three States

The products page is the one that starts the request, so it is also the page that has to show what is happening. `loading` and `error` are shared state, just like `products`, so the page can simply read them.

Open `src/pages/ProductManagementPage.vue` and add the new values to your destructuring:

```ts
const { products, loading, error, /* ...your other values */ } = useProducts()
```

Now wrap your existing form and list in a `v-else`, and put the loading and error messages in front of it:

```vue
<template>
  <div>
    <h1>Products</h1>

    <div v-if="loading">Loading products...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <ProductForm
        :editing-product="editingProduct"
        @submit="handleSubmit"
        @cancel="editingProduct = null"
      />
      <ProductList
        :products="products"
        @edit="editingProduct = $event"
        @delete="deleteProduct"
      />
    </div>
  </div>
</template>
```

Your template may have a few more elements than this example, such as the "last saved" indicator. Keep them inside the `v-else` block.

The `v-if` / `v-else-if` / `v-else` chain guarantees that exactly one of three states is visible:

1. **Loading**: the request is running.
2. **Error**: the request failed. Show what went wrong.
3. **Success**: show the form and the list.

You will use this three-state pattern for every async operation in every frontend app you write. React, Angular and Svelte all do the same thing, just with different syntax. The `.error` class is already in your `base.css` from the first lesson.

👉 **Exercise 6: Test the loading and error states**\
Clear the `products` key in Local Storage and refresh the products page. You should see "Loading products..." briefly before the products appear. To slow things down, open the DevTools Network tab and set throttling to "Slow 4G".

To test the error state, temporarily change the URL in `fetchProducts` to `https://fakestoreapi.com/BROKEN`, clear Local Storage again and refresh. The error message should replace the list. Change the URL back when you're done.

---

## Showing Images

Your fetched products have an `image` field, but your components don't show it yet.

👉 **Exercise 7: Display images in ProductDetailPage**\
Open `src/components/ProductDetailPage.vue` and add an `<img>` that shows the product's image. Use `v-if="product.image"` so the tag only renders when there is a URL. Bind `src` to the image and `alt` to the product name. 


👉 **Exercise 8: Add an image URL to the form**\
Add an optional image URL input to `ProductForm.vue`. When the field is empty, the emitted product should not contain an `image` at all, so it stays a valid `Product`. You should be able to add a product with and without an image.

### Opening a detail page directly

Try this: clear Local Storage, then type `http://localhost:5173/products/1` straight into the address bar. The detail page shows "Product Not Found", even though product 1 exists.

The fetch lives in `ProductManagementPage`, and you never visited it. The detail page was the first page to be created, nothing asked for the products, and it looked in an empty list. (This only happens when Local Storage has no `products` key yet. Once the key exists, `products` is filled from Local Storage when the app starts, and the detail page works.)

There is a second problem hiding behind the first. In `ProductDetailPage` the product is looked up once, when the page is created:

```ts
const product = getProduct(productId)
```

That line never runs again, so even if the data arrives a moment later, the page never notices. The general rule: **every page that depends on async data has to make sure that data is loading, and has to handle the three states itself.** You can't assume another page already did it, because users can enter your app on any URL.

👉 **Exercise 9: Make ProductDetailPage work on a direct URL**\
Update `src/pages/ProductDetailPage.vue` so it works when opened directly:

1. Call `initProducts()` in `onMounted`, just like the products page does. Thanks to the guard in `fetchProducts` and the Local Storage check in `initProducts`, this never fetches twice and never overwrites your edits.
2. Show the loading and error states, in front of your existing product and "not found" markup. The chain is: loading, error, product found, product not found.
3. Make the lookup reactive so it updates when `products` changes. Hint: a computed property (Lesson 2), `computed(() => getProduct(productId))`. Why? Fetching the products is async. When loading the getProduct is called directly, our async fetch might not be finished yet. So, we need to get the product again when the fetching is complete. 

Test it: clear Local Storage and open `/products/1` directly. You should see "Loading..." and then the product. Then open `/products/99999`. After loading you should see "Product Not Found".

---

## Common Mistakes and How to Fix Them

**Using `await` outside an `async` function:** `await` only works inside a function marked `async`. If an `onMounted` callback uses `await`, it must be written as `async () => { ... }`.

**Not checking `response.ok`:** `fetch` succeeds even when the server returns a 404 or 500. Skip the check and you'll try to parse an error response as product data and get confusing results without any error message.

**Forgetting `finally` for the loading state:** If `loading.value = false` is only at the end of `try`, one failed request leaves the loading message on screen forever.

**Seeing your old products instead of the API's:** localStorage still contains the test data from earlier lessons, so `initProducts` sees the `products` key and skips the fetch. Delete the key in DevTools to start fresh.

**The `title`/`name` mismatch:** If you forget the mapping, TypeScript catches it, because `Product` has `name` and not `title`. The fix is to map the API's shape to your own interface, not to rename your interface.

**Detail page says "Not Found" on direct URL:** Nothing started the fetch, because you never visited the products page. Call `initProducts()` in `onMounted` of the detail page too, use a `computed` for the lookup, and show a loading state.

**CORS errors:** Some APIs block requests from browser JavaScript, and you'll see "blocked by CORS policy" in the console. FakeStoreAPI allows cross-origin requests, so it works here. If you hit CORS errors with other APIs, that's a server-side restriction you can't fix from frontend code.

---

## Summary

Your app now starts with real data from the internet, and everything from the earlier lessons still works on top of it. Adding the API took one new function, a few refs and some template changes.

**Asynchronous code** lets JavaScript start slow operations without freezing the page. The browser keeps running while the request is in progress, and your code continues when the result arrives.

**async/await** makes asynchronous code read like synchronous code. `async` marks a function as asynchronous, `await` pauses that function until a Promise resolves. Together with `try/catch/finally` they give you clean, readable request logic.

**The Fetch API** is the browser's built-in HTTP client. Always check `response.ok`, because `fetch` succeeds even on 404 and 500.

**Data transformation at the boundary** is the pattern for APIs that don't match your types. FakeStoreAPI calls it `title`, your app calls it `name`. You transform once inside `fetchProducts`, and the rest of your app never sees the difference.

**Seeding** means using an external source for the initial data only. Because the Lesson 3 watcher saves every change, the fetched products behave exactly like products you typed in yourself.

**Three UI states** (loading, error, success) are the universal pattern for displaying async data. Every page that depends on async data should make sure it is loading and handle all three.

The structure you built here, shared `products`/`loading`/`error` refs and a `fetchProducts` function that follows `try/catch/finally`, stays the same when you connect your own Express backend. Only the URLs change, and localStorage gets replaced by the server as the place where data lives.

---

## Practical Exercises

👉 **Easy: Show a loading skeleton instead of text**\
Replace the "Loading products..." text with a grid of grey boxes the same size as product cards. Use a CSS animation (`animation: pulse 1.5s infinite`) to make them fade in and out. This is closer to how real apps signal loading.

👉 **Medium: Add a "Try again" button for errors**\
When the error state is shown, add a button that calls `fetchProducts()` again. Make sure clicking it clears the error and shows the loading state first.

👉 **Hard: Fetch a single product**\
FakeStoreAPI also has `https://fakestoreapi.com/products/:id`. Make `ProductDetailPage` fetch a single product when it is not in the local list (for example because a user deleted it, or because it's a new ID). Think about where this function belongs, how to reuse the mapping step, and what the page should show when the API returns nothing.

---

## Thought Questions

💡 **Conceptual Understanding**

- Why does `fetch()` not throw on HTTP 404 or 500? What does this tell you about the difference between a *network* failure and an *application* failure?

- Why is `loading.value = false` placed in `finally` instead of at the end of `try`? What would break if you put it only inside `try`?

- FakeStoreAPI returns a field called `title` and your interface uses `name`. Why is it better to transform the data inside `fetchProducts` than to rename the field in your `Product` interface to match the API?

- Why did we check for a missing `products` key in localStorage instead of checking whether the list is empty?

- Why does `ProductDetailPage` need to start the loading itself when the products page already does? In which situation would it work without that?

- When you build your own backend, which parts of this lesson stay the same, and which part gets replaced?

---
