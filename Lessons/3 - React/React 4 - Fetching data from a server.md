# React 4: Fetching data from a server

Ok, our products feature from the previous lesson works, and the code looks good. But we still only have those three products we typed into `useState` by hand. Laptop, Phone, Headphones, baked into the source. Real apps do not work that way. They ask a server for their data, and it answers a moment later, across a network that takes time and now and then fails. We should swap the made-up array for a real request and learn what to show on screen when the data has not turned up yet.

Today, we'll replace the hardcoded array with a request to a server, handle the wait and the failure while we are at it, and the add, edit, and delete we already wrote keep working on whatever comes back. Almost all of the change happens inside the one page. No new components today. What's new is a way of thinking about code that does not finish on the line you wrote it.

## Your data lives somewhere else now

> 🎓 Your data will come from a server. Let's create a file for it. Vite will serve whatever files we put in `public/`.
>
> Create a file called `products.json` in the `public/` folder, and copy this into it:

```json
[
  { "id": 1, "title": "Laptop", "price": 1200 },
  { "id": 2, "title": "Phone", "price": 800 },
  { "id": 3, "title": "Headphones", "price": 150 }
]
```

When a page wants its data, it sends a request out across the network to a server, and the server sends a response back. Two separate programs, often on two different machines, talking over HTTP, the same protocol your browser uses when loading a page. You will build that server yourself, later in the course. For now we work with a stand-in.

The challenges lie in the middle of this process: the request goes out, and the answer comes back a moment later. Ten milliseconds on a good connection, two seconds on a train, never at all if the server is down or the wifi drops. Your code cannot just stop on that line and wait for the answer, because while it waits, the whole page waits with it: no scrolling, no clicking, nothing until the answer comes. A frozen tab. So the request has to happen in a way that lets everything else keep running while the answer is on its way. That is what _asynchronous_ means, and it is the thing we should focus on first.

## Code that cannot stop and wait

JavaScript does one thing at a time. One line of your code runs, finishes, and the next one runs. (Just like a C# console program, a `Main` that runs top to bottom.) That is fine until a line needs to wait for something slow, like a server. If JavaScript sat on that line until the server answered, it would be sitting there doing nothing, and nothing else could run, and the page would lock up.

That would be bad, so let's not do that. When you start something slow, JavaScript can hand the slow part off, to the browser, and carry straight on to the next line. The slow thing finishes in its own time, off to the side, and when it is done, its result comes back to your code to be dealt with then.

The easiest way to see this is with a timer. `setTimeout` runs a function after a delay:

```js
console.log("Start");

setTimeout(() => {
  console.log("Two seconds later");
}, 2000);

setTimeout(() => {
  console.log("One second later");
}, 1000);

console.log("End");
```

> 🎓 Open your browser's DevTools and copy that into the console. (You might have to enable pasting first, after the console's security warning.)

The order of the output might seem surprising:

```
Start
End
One second later
Two seconds later
```

`Start` and `End` print first, immediately, one after the other. The two `setTimeout` calls did not block anything. Each one handed a function and a delay to the browser and returned at once, so the code ran straight through to `End`. Then, later, the browser fires the functions as their timers come due, the one-second one before the two-second one (1000 and 2000 milliseconds). The slow work happened in the background, and the result, the `console.log`s, came back when it was ready. A network request works the same way. You ask, your code carries on, and the answer arrives later.

## Promises and async/await

So a request hands its result back "later." If you've never written asynchronous code before, it might be confusing at first. What is returned on that line of code, at first, immediately, is not the data, it is a stand-in for the data: an object that means "not here yet, but I will let you know how this turns out." That object is a `Promise`. The name makes sense. A promise is pending while the work runs, then it either resolves with a value (the data arrived) or rejects with an error (it went wrong).

You can use a promise directly. We'll use `fetch` as an example because it returns a promise. (More about fetch in a moment!) Because it's a promise, you can use `.then` and `.catch` to give it functions to run when the value arrives or if it fails:

```tsx
fetch("/products.json")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

> 🎓 Try it. With `npm run dev` running, open the console in the browser's DevTools (on your app's own tab) and paste it in. A moment later the three products print, straight out of the file you made at the start.

This works. As you can see you can stack them: a `.then` for every step. But some people find it hard to read. There's another way that does the same thing. It's what most people will use now.

`async` and `await` let you write code that waits, but reads top to bottom like ordinary code:

```tsx
async function fetchProducts() {
  const response = await fetch("/products.json");
  const data = await response.json();
  console.log(data);
}
```

`await` pauses the function it is in until the promise settles, then gives you the value, the resolved data, as if it had been there all along. The important words are _the function it is in_. `await` does not freeze the page. It pauses only this one function and lets everything else carry on, the same off-to-the-side behaviour as the timer. And `await` only works inside a function marked `async`. Mark a function `async` and you are allowed to `await` inside it. (If this sounds like C# to you, you're right. Same two keywords, same idea.)

Things can go wrong, so you wrap the awaiting in `try`/`catch`, with an optional `finally` that runs whatever happens:

```tsx
async function fetchProducts() {
  try {
    const response = await fetch("/products.json");
    const data = await response.json();
  } catch (error) {
    console.error(error);
  } finally {
    console.log("done, success or not");
  }
}
```

`try` contains the code that might fail. `catch` runs if anything in the `try` throws. `finally` runs no matter what, which is handy if you want to turn off your loading indicator, for example.

## Asking for data with fetch

`fetch` is built into the browser. Nothing to install. You give it a URL, it sends a request, and it hands you back a promise that resolves to a `Response`:

```tsx
const response = await fetch("/products.json");
```

The `Response` is not the data yet. It is the reply, with its HTTP status code and headers, and the body sitting inside it waiting to be read. To get the body as JSON you call `.json()`, which is itself an async function (parsing a big body can take some time), so it gets an `await` too:

```tsx
const data = await response.json();
```

But `fetch` does not do everything for you. It does not throw when the server returns an error. Ask `fetch` to get a page that does not exist and the server answers 404, ask for one that breaks and it answers 500, and as far as `fetch` is concerned both of those are a complete success. The request went out, an answer came back. The answer is just bad news, but `fetch` doesn't care. `fetch` hands you the 404 with a cheerful thumbs up and doesn't stop you from trying to read products out of an error page.

So you check it yourself. `response.ok` is true for the success status codes (200 to 299) and false for everything else:

```tsx
async function fetchProducts() {
  try {
    const response = await fetch("/products.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
  } catch (error) {
    console.error(error);
  } finally {
    console.log("done, success or not");
  }
}
```

Because we `throw`, an HTTP error will land in the same `catch` as a dropped connection, and you handle both failures in one place instead of two.

## Running the fetch when the page first appears

We now have the pieces to get the data. The only question left is where in the component the call goes.

"Can I not just call `fetch` at the top of the component, the way I would call any other function?"

You can try it, but it will not behave like you want. A component function (like `ProductsPage()` below) runs again every single time the component renders. So a `fetch` sitting in the body, setting state when it returns, causes a render, which runs the body again, which fetches again, which sets state again. Around and around, until the end of the universe (or sooner, if you don't have enough RAM):

```tsx
export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  // Don't do this, seriously. I'm not warning you again! Ok, you know what? See for yourself.
  fetch("/products.json")
    .then((response) => response.json())
    .then((data) => setProducts(data));

  // ...
}
```

> 🎓 Don't say I didn't warn you. Put those three `fetch` lines at the top of your `ProductsPage`, like above, save, and open the Network tab in DevTools to see what happens. (Don't forget to remove them again after this!)

Look at that network tab filling up with the same request. Beautiful chaos. Oh no, we broke the browser. Oops.

What you really want is for the fetch to run once, after the component first appears, and then be left alone. React has a tool for this exact situation: code that reaches outside React to deal with the world, a server, a timer, the page itself, etc. It's called an effect, and you set one up with `useEffect`:

```tsx
import { useEffect } from "react";

useEffect(() => {
  // runs after the component renders
}, []);
```

`useEffect` takes two arguments, a function to run and an array. The array is the 'trigger', the part that decides when the function runs again. In it, you put the values the effect depends on, and React will re-run the effect whenever one of them changes. An empty array, `[]`, is also very useful: there is nothing that can change, so the effect runs once, after the first render, and never again. (Later, when we want a page to react to something changing, we put that thing in the array.)

One last thing. The function you pass to `useEffect()` cannot be `async`. So we wrap the whole thing in a function `() => {}`:

```tsx
useEffect(() => {
  async function loadProducts() {
    const response = await fetch("/products.json");
    const data = await response.json();
    setProducts(data);
  }
  loadProducts();
}, []);
```

That's how you'll be using it. An async function defined inside the effect, called right away, and an empty array underneath so it only runs when the component mounts.

## Three states, one screen

A screen waiting on a server is in one of three states at any moment. It is loading, the request is out and the answer is not back. Or it failed, and there is an error to show instead of data. Or it succeeded, and there is data to draw. You need a piece of state for each of the first two, alongside the products.

> 🎓 In `ProductsPage.tsx`, replace the `products` state, the one with the three hardcoded products in it, with these three lines:

```tsx
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

`products` starts empty, because we have not fetched anything yet. `loading` starts `true`, because the very first render happens before the effect has even begun, so the honest answer at that moment is "still loading." `error` starts as `null`, no error yet, and holds a message if one shows up.

> 🎓 Now the effect. Add `useEffect` to the `react` import at the top of the file, and put this under the state lines: the full request, the three states wired through it, and the `try`/`catch`/`finally` from earlier doing real work:

```tsx
useEffect(() => {
  async function loadProducts() {
    try {
      const response = await fetch("/products.json");
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  }
  loadProducts();
}, []);
```

Read through the code. The request goes out. If `response.ok` is false we throw, and we land in `catch`. If the connection drops we also land in `catch`. Either way we log the real error for ourselves (the console is for you, not the user) and put a short, readable message into `error` for the screen. And whatever happened, success or failure, `finally` sets `loading` to false, because the wait is over either way. That is why the loading flag goes off in `finally` and not at the end of the `try`: park it in the `try` and a failed request leaves the spinner turning forever.

The component reads those three pieces of state and shows the matching thing. The cleanest way to do that in React is to handle the two unfinished cases first and return early.

> 🎓 Put these two `if`s just above the `return` in `ProductsPage`. The `return` itself stays exactly as it was:

```tsx
if (loading) {
  return <p>Loading products...</p>;
}

if (error) {
  return <p>{error}</p>;
}

return (
  <div>
    <h1>Products</h1>
    <ProductForm
      key={editingProduct?.id ?? "new"}
      editingProduct={editingProduct}
      onAdd={addProduct}
      onUpdate={updateProduct}
      onCancel={cancelEdit}
    />
    <ProductList
      products={products}
      onEdit={startEditing}
      onDelete={deleteProduct}
    />
  </div>
);
```

If we are loading, show that and stop. If there was an error, show it and stop. Past both of those, the data is here, so we draw the real page, the same form and list as last lesson.

> 🎓 Save and reload the page in the browser. It shows "Loading products..." for a split second, then three cards arrive from the fetch, with the right prices. And no names. Hold that thought, we get to it in a moment. Adding, editing, and deleting still work on the cards just as they did last lesson: they change the `products` state in memory, and the screen updates.

You've really only checked the success state. Loading flashed past, and the error state has not been triggered yet at all. Both are worth checking, since you wrote the code for them.

> 🎓 Open DevTools, switch to the Network tab, and set throttling to Slow 3G. Reload, and watch "Loading products..." sit on the screen for a second or two before the products arrive. Put throttling back to No throttling afterwards. This is also very helpful when you're styling your loading state.

While you have the Network tab open: `products.json` shows up twice on every reload. That's not your fault. In development React mounts every component, unmounts it, and mounts it again on purpose, running the effect both times, to flush out effects that don't clean up after themselves (something we get to in React lesson 6). The `<StrictMode>` wrapper around `<App>` in `main.tsx` is what turns that on. A production build mounts once and fetches once.

> 🎓 Now the error. In `loadProducts`, point the fetch at a path that does not exist (`fetch("/nope.json")`) and reload. It goes straight into `catch`, and the browser shows "Could not load products." instead of the list. Put the path back when you've checked the error state.

## The server's `Product` is not your `Product`

There is one more thing between the response and your `Product`, and it is true of almost every real API. The server has its own names for things, and they might not be the names you want.

Let's take a closer look at our `/products.json`:

```json
[
  { "id": 1, "title": "Laptop", "price": 1200 },
  { "id": 2, "title": "Phone", "price": 800 },
  { "id": 3, "title": "Headphones", "price": 150 }
]
```

It may look like our `Product`, but it's not the same. The server calls the name field `title`. Your app calls it `name`, all the way through, in the type, in the components, everywhere. Which is why the cards came up blank: `product.name` was never there. (TypeScript didn't catch it either, because `response.json()` hands back `any`, and `any` switches the checking off.) You have two options when the shapes disagree. You could rename your own field to `title` to match the server, and let the server's naming leak into every component that touches a product. Not the best choice. The server is not always yours to control, and the day you point at a different server with a different name, you would be renaming fields across your whole app again. (Sometimes, the people working on the backend can have different reasons for choosing a certain name than you have. For example: when the data is being used by multiple applications, or the field has some relation to the underlying systems or hardware.)

The other option, the right one, is to fix it once, the moment the data arrives, and let nothing past that point ever see `title`. Describe the server's shape with its own type, separate from `Product`.

> 🎓 In `ProductsPage.tsx`, above the component function, add:

```tsx
type ProductResponse = {
  id: number;
  title: string;
  price: number;
};
```

That type lives here in the page, next to the fetch, because right now, this is the only code that deals with the raw server data. Your `Product` type stays where it is, in `types/`, shared.

> 🎓 Now map the response into `Product` objects as it comes in. In `loadProducts`, replace the two lines that read the body and store it (`const data = ...` and `setProducts(data)`) with:

```tsx
const data: ProductResponse[] = await response.json();
setProducts(
  data.map((item) => ({
    id: item.id,
    name: item.title,
    price: item.price,
  })),
);
```

On the way in, the data is a `ProductResponse`, with a `title`. On its way out, through `map`, it is a `Product`, with a `name`. Past this one line, nothing in your app knows or cares what the server called anything. The translation happens in exactly one place, and the rest of the code stays clean. You will do a similar thing within your own backend, later in the course.

> 🎓 Ok, here is the whole `ProductsPage` with all of it in place. Compare it with yours and make sure they match:

```tsx
import { useState, useEffect } from "react";
import type { Product } from "../../types/Product";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/products.json");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data: ProductResponse[] = await response.json();
        setProducts(
          data.map((item) => ({
            id: item.id,
            name: item.title,
            price: item.price,
          })),
        );
      } catch (err) {
        console.error(err);
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  function addProduct(name: string, price: number) {
    const newProduct: Product = { id: Date.now(), name, price };
    setProducts([...products, newProduct]);
  }

  function updateProduct(updated: Product) {
    setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProduct(null);
  }

  function deleteProduct(id: number) {
    setProducts(products.filter((p) => p.id !== id));
  }

  function startEditing(product: Product) {
    setEditingProduct(product);
  }

  function cancelEdit() {
    setEditingProduct(null);
  }

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Products</h1>
      <ProductForm
        key={editingProduct?.id ?? "new"}
        editingProduct={editingProduct}
        onAdd={addProduct}
        onUpdate={updateProduct}
        onCancel={cancelEdit}
      />
      <ProductList
        products={products}
        onEdit={startEditing}
        onDelete={deleteProduct}
      />
    </div>
  );
}
```

> 🎓 Save and reload. The names are back: Laptop, Phone, Headphones, with their prices, and add, edit, and delete work on them just as they did last lesson. Nice!

We didn't have to touch the card, list, and form components at all! The page is the only file that changed.

> 🎓 Now practice this in a realistic scenario. Let's say the evil backend people rename the `price` field too, and suddenly start sending the amount in cents: `price` has become `priceInCents`, so 1200 turns into 120000. How dare they! They didn't even tell us!
>
> Change your `public/products.json` to this, so we can practice how to handle this challenge:

```json
[
  { "id": 1, "title": "Laptop", "priceInCents": 120000 },
  { "id": 2, "title": "Phone", "priceInCents": 80000 },
  { "id": 3, "title": "Headphones", "priceInCents": 15000 }
]
```

> 🎓 Your app still expects `price`. But luckily, we can fix it in `ProductResponse`, just like we did for `title`, without touching any component. Update it so it describes what the server now sends. (Also the mapping, so `price` still comes out correctly. You will have to divide by 100, since the server now sends it in cents.)
>
> Reload, and the prices should read exactly as before, because nothing past that one line of code ever finds out that the server changed. If we didn't work like this, we would have had to change a lot more code. We might even get into a fight with the evil backend people who caused this nightmare!
>
> But we were prepared! Hah! Crisis averted.
>
> Oh, and after you're done, revert the changes, because the rest of the examples will use the old `price` again.

## Add, edit, and delete still only live in the browser

Modifying the products now works in the UI, but if you refresh the page, whatever you added or changed is gone, and you are back to the original three products.

That makes sense, because we're not really saving our changes yet. A refresh reloads the app from scratch, the state resets, and the effect runs the fetch again. The only difference now is where that starting list comes from: before, it was three products hardcoded into the source, now it is whatever the server sends (whatever is in that JSON file). Your local changes were never written down anywhere that survives a reload. The add, edit, and delete update state in the browser, but nothing else.

Making a change stick means sending it back to the server to be saved, a POST to add, a PUT to edit, a DELETE to remove, so that the next request will get the updated list. That needs a server that can save things, and right now you are fetching from a static stand-in that cannot save anything. The real server, with real saving, is the backend half of this course. After we add that, these same add, edit, and delete functions will need a `fetch` of their own, and then your changes start surviving refreshes, and even show up for other people. For now, reading the list from a server is good enough to continue with your frontend.

## What's next

You now have a page that fetches its own data, waits for it without freezing the browser, can handle it when the request fails, and translates the server's data into what you want it to be. That is the whole core of talking to a server, and you will use it for every screen that loads anything for the rest of your time as a developer.

What you do not have yet is more than one screen. Everything is on a single page. Most apps have more than one, an address bar that changes as you move between them, links that take you from a list to the details of one item and back, etc. The product feature could use a page that lists the products and a separate page for a single product, each at its own URL. That is routing, and we'll introduce it in the next lesson.

Bye! See you next lesson!

Wait... Are you still here? Hmmm... Ah! I see you're thinking (I hope so!)... That the fetch we just wrote, the effect, the loading flag, the error flag, the try and catch and finally, is a lot of stuff to have in one component. Shouldn't we refactor that? The moment a second screen needs to fetch something, you would be copying all of it. You're absolutely right! Good catch! But we'll let that sit for now and tidy it up once there is a second place that needs it. One thing at a time.

## Resources

- React docs, "Synchronizing with Effects". What `useEffect` is for, and the mount-only `[]` case, from the source. https://react.dev/learn/synchronizing-with-effects
- React docs, "You Might Not Need an Effect". Worth a read once you are comfortable, for the cases where an effect is the wrong tool. https://react.dev/learn/you-might-not-need-an-effect
- MDN, "Using the Fetch API". The reference for `fetch`, `Response`, and reading bodies. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN, "Using promises". A clear walk through promises, `.then`, and `async`/`await` if the idea needs another pass. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
- Lydia Hallie, "JavaScript Visualized: the Event Loop". A good animation of how the background work actually happens, if you want to go deeper than we did here. https://www.lydiahallie.com/blog/event-loop

## Applying this to your project

Your module's data leaves the source code. Put it in a JSON file in `public/`, one file per list, fetched when the page appears, with the three states: loading, error, and the list. That file is the start of your seed data, so make it more realistic now: at least twenty to thirty rows, different values in the fields you'll filter and search on, and the awkward rows the case rules ask for (a very long title, an empty optional field, a date in the past). A list of three rows isn't good enough. It hides layout problems you might have!

Give the file a shape of its own and map it at the boundary, the way `ProductResponse` becomes `Product`. It will become handy once we start working on the backend.

Throttle the network and look at your loading state for a while. A bare "Loading..." on an otherwise empty page is what most teams end up shipping, but you can do better. Try to look at examples online on good loading states for UI.