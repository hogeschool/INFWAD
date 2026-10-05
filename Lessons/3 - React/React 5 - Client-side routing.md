# React 5: Client-side routing

Now we have a products page that fetches its own data, waits for it without freezing, and handles things when the request fails. One page. Everything sits at a single address, and that address never changes no matter where you click. Let's talk about adding other screens, an address bar that tracks where you are, and links that take you from a list to the details of one item and back. That's routing.

Today a single product gets its own page, at its own URL. We add navigation between the list and that page, and a not-found page for every address that means nothing. The fetching you already know from last lesson. The new part is the address bar.

Your project already has a version of this, from the shell setup. In this lesson we build it from scratch, and this time every line comes with its explanation. Then we add the parts the setup left out.

## One page, many screens

Remember that the whole app loads into one HTML file, `index.html`, with a single `<div id="root">` that everything renders into. That has not changed. Every component we've built (the page, the list, the cards, the form) renders into that one div, on that one page.

"So can I not just keep a piece of state for which screen is showing, and swap components based on it? I think I know how to do that now."

You can. But it causes problems as soon as someone uses it. The address bar never changes, so a user looking at a product cannot copy the URL and send it to a friend. The link their friend opens just shows the home screen, because the URL says nothing about where you were. Refresh the page and you are back to the start, whatever you were looking at is gone. The back button doesn't go back a screen either, because as far as the browser knows you never went anywhere: click it on the product detail page and the browser takes you to whatever website you visited before. The thing that records where you are in an app is the URL, and faking it with state makes you miss out on everything the URL mechanism gives you for free.

_Client-side routing_ connects URLs to components. Change the URL, and the screen changes. Share the URL, and the other person lands exactly where you were. And the back button works.

## How it changes the page without reloading it

A traditional website does this the slow way. You click a link, the browser asks the server for a whole new HTML page, throws away the page you were on, and renders the new one from scratch. A full reload on every click.

A single-page app loads its one HTML file and one bundle of JavaScript once, and after that handles navigation itself. You click a link, JavaScript catches the click before the browser can act on it, changes the URL using the browser's _History API_ (Remember the DOM? That's also an API built into the browser like this), and swaps the component on screen. No request to the server, no reload, nothing resets. The page you're on is still the same `index.html` it was when you arrived. It's just showing something different.

The piece that watches the URL and decides which component to show is a _router_. React's router is called (surprisingly) React Router.

## Setting up React Router

React Router is a separate package, not part of React itself, so we have to install it.

> 🎓 Open a terminal, make sure you're in your `ClientApp/` folder, then run:

```bash
npm install react-router@7
```

That adds it to your `package.json` file, so your teammates can just run `npm install`, and they'll get it as well. (The `@7` pins the major version, so the whole team gets the same one.)

> 🎓 Open your `package.json` file and check it out: `react-router` is under `dependencies` now. It's good to get used to checking this file every once in a while, to see if your project's dependencies and scripts are all up to date, for example when you want to migrate to the latest major React release. There are usually official instructions online you can follow for such an update.

Now let's wrap the whole app in a router, once, at the entry point.

> 🎓 Add `BrowserRouter` around `App` in `main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

`BrowserRouter` is the part that watches the address bar and keeps it up to date with what you're showing. It uses the History API, so your URLs look like clean paths (`https://my-app.com/products` instead of `https://my-app.com/#/products` or `https://my-app.com/?page=products`). Every component inside it can use routing.

## Routes and links

Now we tell the router which component is attached to which URL. That mapping is a _route table_, and it belongs in `App`, the shell of the whole app.

First we need somewhere to route to besides the products. A page is just a component that shows at a URL, so we make a normal component:

```tsx
export function HomePage() {
  return (
    <div>
      <h1>Welcome to the product catalog</h1>
      <p>Browse the products, or pick one to see its details.</p>
    </div>
  );
}
```

Where does that file go? The rule was that a component lives with whatever it's tied to. The products page lives in `features/products` because it's about products. A home page belongs to no feature, so pages like this one get their own top-level folder, `pages`.

> 🎓 Put the above code for `HomePage` in a new file: `pages/HomePage.tsx`.

Now the route table.

> 🎓 Update `App.tsx`:

```tsx
import { Routes, Route, Link } from "react-router";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./features/products/ProductsPage";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </div>
  );
}
```

`<Routes>` is the spot where the matched page will be rendered. Each `<Route>` inside it connects a path to an element: `/` shows the home page, `/products` shows the products page. Change the address in the browser, and `<Routes>` swaps out whatever is inside it for the page that matches.

The `<Link>`s are the navigation.

Perhaps you're now thinking "Why a special Link? A link is an `<a>` tag, I've been writing those since week two."

Because a normal `<a href="/products">` tells the browser to load `/products` from the server as a brand new page. That reloads your entire app, runs everything from scratch, and throws away all your state, which is the full reload we're trying to avoid. `<Link>` looks like a link and even ends up as an `<a>` in the page, but it catches the click, changes the URL through the History API, and lets the router swap the page with no reload. So inside the app you navigate with `<Link>`, not a bare `<a>`.

> 🎓 Try our updated app in the browser and click around. See? The URL updates, the content changes, there's no flash of a reloading page, and the back button takes you where you came from. That's single-page application navigation working, with no reload.

## A layout for the shell

It works, but I smell something... Look at what `App` is doing: the navigation and the route table, two jobs in one component. As the shell grows, we'll probably want a layout with a header, a footer, the nav, etc. You don't want all of that mixed in with the list of routes.

React Router has a nicer way to do this: a _layout route_. You make one component that holds everything that stays on screen across pages, and mark the spot where the page content itself goes with `<Outlet>`.

This is app-level UI, owned by no single feature, so it goes in `components`.

> 🎓 Put this code for `Layout` in a new file: `components/Layout.tsx`:

```tsx
import { Link, Outlet } from "react-router";

export function Layout() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

`<Outlet>` is a placeholder. Whichever child route matches renders right there, inside our `<main>` tag.

With the shell in `Layout`, `App` goes back to one job, the route table.

> 🎓 Update `App.tsx`:

```tsx
import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./features/products/ProductsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
      </Route>
    </Routes>
  );
}
```

It works like this:

- The outer `<Route path="/">` renders `Layout` for anything under `/`, which means every page.
- The routes nested inside it render into `Layout`'s `<Outlet>`.
- `index` marks the child that shows at the parent's own path, so `/` shows the home page.
- `path="products"` lost its leading slash, because nested paths are relative to the parent.

Now everything is clean again: App holds the routing, Layout holds the frame, each page holds itself.
> 🎓 Reload and click around again to check our work. Same pages, same nav, same URLs. Refactoring done!

## Dynamic routes

The routes so far are fixed paths. A detail page is different. You cannot write a separate route for every product (there could be thousands!), and you don't know their ids when you write the code. What you need is one route with a hole in it.

We do that with a fixed prefix and a variable segment:

```
/products/:id
```

`/products/1`, `/products/42`, `/products/anything` now all match, and the `:id` part captures whatever was in that segment and hands it to the component.

> 🎓 Let's add the route. Update `App.tsx`:

```tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="products/:id" element={<ProductDetailPage />} />
  </Route>
</Routes>
```

Your editor underlines `ProductDetailPage` in red, and the app won't render until that component exists. We'll create it in a moment. Let's keep going.

React Router matches the most specific route it can, so `/products/42` goes to this detail route and `/products` still goes to the list, whatever order the routes are in.

Bu nothing links to the detail page yet. Each card in our list should link to its product's page.

> 🎓 In `features/products/ProductCard.tsx`, add the import and turn the product's name in the `<h3>` into a link:

```tsx
import { Link } from "react-router";
```

```tsx
<h3>
  <Link to={`/products/${product.id}`}>{product.name}</Link>
</h3>
```

The `to` is built from the product's id with a template literal, so each card points at its own product. We don't have to change the edit and delete buttons.

## The detail page, fetching by id

`ProductDetailPage` needs to do two things: read the id out of the URL, and fetch that one product. For reading the id, we use the `useParams` hook:

```tsx
const { id } = useParams();
```

`useParams` gives you the values from the `:` segments of the current URL, so here you get `id`, like we specified in the route. (It's always a string, never a number, which is fine for us because it goes straight into a URL.)

The fetch is almost the same as the one we wrote last lesson. Two things differ: it fetches a single product instead of a list, and `useEffect`'s dependency array is no longer empty.

> 🎓 Put this code for `ProductDetailPage` in a new file: `features/products/ProductDetailPage.tsx`:

```tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import type { Product } from "../../types/Product";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/products/${id}.json`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data: ProductResponse = await response.json();
        setProduct({ id: data.id, name: data.title, price: data.price });
      } catch (err) {
        console.error(err);
        setError("Could not load this product.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error || !product) {
    return <p>{error ?? "Product not found."}</p>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>€{product.price}</p>
      <Link to="/products">Back to products</Link>
    </div>
  );
}
```

> 🎓 Add its import to `App.tsx`, next to the other page imports. The red underline goes away.

So let's talk about `useEffect`'s dependency array. Last lesson it was empty (`[]`), so the effect ran once when the page first appeared and never again. Here it has `id` in it, otherwise it will not work.

"But won't React load this component again when I click on another product?"

You'd expect that, but no. When you go from one product's page straight to another (from `/products/1` to `/products/2`, through a link to a related product, for example), React keeps the same `ProductDetailPage` on screen and just changes the id. With an empty array the effect would never run again, and you'd see product 1's data with `/products/2` in the address bar. Listing `id` tells React to run the effect again whenever `id` changes, so the right product loads.

The not-found case is easy. Open `/products/99999`, and the fetch asks the server for a product that doesn't exist. A real server answers 404, which fails the `response.ok` check, throws, and lands in the same error state as a dropped connection. So "there is no product with this id" is already handled, without a single line written specially for it. (We'll add the mock data for the fetch in a moment. Later, when the real backend exists, all the code above stays the same!)

> 🔍 A closer look at the Vite dev server: it answers any path it doesn't know with `index.html` and a 200, so the request passes `response.ok` and fails one line later, when `.json()` tries to read HTML as JSON. Different line, same `catch`.

Now look at the top of this component. The three `useState` calls, the `useEffect`, the `try` and `catch` and `finally`, the `response.ok` line, the transform. We wrote all of that last lesson in `ProductsPage`, and here it is again, almost word for word. A third screen that fetches would be a third copy. Do you smell something yet? We're going to let that sit one more time, but we'll fix it properly next lesson.

## Mock data

> 🎓 Let's create the data for `ProductDetailPage`, one file per product. (Remember: Vite serves whatever files we put in `public/`.)
>
> Create a new folder: `public/products/`
>
> Now add these three files:
>
> `1.json`:
>
> ```json
> { "id": 1, "title": "Laptop", "price": 1200 }
> ```
>
> `2.json`:
>
> ```json
> { "id": 2, "title": "Phone", "price": 800 }
> ```
>
> `3.json`:
>
> ```json
> { "id": 3, "title": "Headphones", "price": 150 }
> ```

## A not-found page, and navigating from code

An unknown URL right now renders nothing. Type `/settings` or `/nonsense` and `<Routes>` finds no match, the outlet stays empty, and the user gets a blank page under the nav. An app should show a 404 page instead.

We do this with a _catch-all route_. The path `*` matches any address that nothing else matched:

```tsx
<Route path="*" element={<NotFoundPage />} />
```

The page itself is just a regular component again:

```tsx
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div>
      <h1>404 - page not found</h1>
      <p>That page does not exist.</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}
```

> 🎓 Put it in `pages/NotFoundPage.tsx`, next to the home page.

Its route goes inside the `Layout` route, so the 404 page still shows the nav and gives the user a way out.

> 🎓 Update `App.tsx` one last time. Here's the whole route table with the detail page and the 404 in place:

```tsx
import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./features/products/ProductsPage";
import { ProductDetailPage } from "./features/products/ProductDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
```

> 🎓 Everything is built now, so try the whole thing. Go to Products and click a product's name: its own page, at its own URL, with the price and a link back. Take the link back and open another one. Now change the address bar to `/products/99999`: "Could not load this product." Then `/nonsense`: the 404 page, with the nav still there above it. Finally, press the back button a few times and watch the browser take you back through every page you visited. That's the whole point of a URL that means something.

One last thing. Links are for the user to click, but sometimes you need to move the user yourself, from code, after something happens. Like when they delete the product they were looking at: there's nothing left to show, so you send them back to the list. You can do that with `useNavigate`:

```tsx
import { useNavigate } from "react-router";

const navigate = useNavigate();

function handleDelete(id: number) {
  // delete the product, then:
  navigate("/products");
}
```

`useNavigate` gives you a function. We store it in `navigate`, call it later with a path, and the app goes there, the same as if the user had clicked a `Link`.

Another thing you can do with it: `navigate(-1)` goes back, like the browser's back button. You probably won't use it often, but now you know how.

Let's look at our files now:

```
src/
  App.tsx                      the route table
  main.tsx
  components/
    Layout.tsx                 the shell: nav and an Outlet for the page
  features/
    products/
      ProductCard.module.css
      ProductCard.tsx
      ProductList.tsx
      ProductForm.tsx
      ProductsPage.tsx
      ProductDetailPage.tsx    (new)
  pages/
    HomePage.tsx               (new)
    NotFoundPage.tsx           (new)
  types/
    Product.ts
```

> 🎓 Now let's practise! Add an About page yourself: the component in `pages/AboutPage.tsx`, a route for it in `App.tsx`, and a link to it in the nav in `Layout.tsx`. It's the same three steps we did for the home page. You can do this for any page you'll ever need.
>
> <details>
> <summary>👀 After you're done, click here to see the answer.</summary>
>
> `pages/AboutPage.tsx`:
>
> ```tsx
> export function AboutPage() {
>   return (
>     <div>
>       <h1>About</h1>
>       <p>A small product catalog, built in the React lessons.</p>
>     </div>
>   );
> }
> ```
>
> In `App.tsx`, the import, and a route inside the `Layout` route:
>
> ```tsx
> import { AboutPage } from "./pages/AboutPage";
> ```
>
> ```tsx
> <Route path="about" element={<AboutPage />} />
> ```
>
> In `Layout.tsx`, a link in the nav:
>
> ```tsx
> <Link to="/about">About</Link>
> ```
>
> </details>

## What's next

This is starting to look like a proper app! We have several pages now, an address bar that tracks where we are, links between them, a detail page that fetches its own product, and a 404 for the rest.

 But anyone can open any page, and the fetch now exists twice. Next lesson we turn that fetch into something we write once and reuse, a custom hook, and use the same idea to create a login state for the whole app, so we can lock some pages behind it.

## Resources

- React Router, the official docs. The tutorial and the routing guides cover everything here, and more. https://reactrouter.com/
- React Router, picking a mode. We use the declarative API in this course. This page explains how it relates to the data and framework approaches you'll see elsewhere. https://reactrouter.com/start/modes
- MDN, the History API. What `<Link>` uses to change the URL without a reload. https://developer.mozilla.org/en-US/docs/Web/API/History_API

## Applying this to your project

Most of the team half is done already, from the shell setup. Two team things are left: the not-found page, and the URLs in the readme (a list route and a detail route per module), because every link in the app depends on them. `App.tsx` and `Layout.tsx` are shared files, so keep the edits small and merge them the same day.

In your module, add a detail page at `/.../:id`, and link to it from every card or row in your list. The examples in this lesson show how, including the mock data with one file per record. Then try a wrong id: it should show your error state, not a blank page.

If your module is functional, it's probably a good time to improve your styling (and HTML).