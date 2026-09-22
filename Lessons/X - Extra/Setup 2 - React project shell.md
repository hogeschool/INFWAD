# Setup 3: The project shell

In the first weeks your team built one page per module, maybe already with a header and a menu linking them together. But a React app is one page: `index.html`, one `<div id="root">`, and everything renders into that. Now you need a way to give each of your pages its own address again. The thing that connects an address to a component is called a router.

Routing gets explained in React lesson 5, but each of you needs your own page at its own address now, so that you can build inside your own module without four people editing `App.tsx`. You can use this file to help you set this up.

This is team work. Do it together, right after you've agreed on the folder names. One person types and commits, the rest watch, then everybody pulls.

## What you're going to build

```
ClientApp/
  src/
    main.tsx                  the router wraps the app here
    App.tsx                   the route table: which address shows which page
    components/
      Layout.tsx              the shell from your static pages: header, menu, footer
    pages/
      HomePage.tsx            just a placeholder for now
    features/
      orders/
        OrdersPage.tsx        one page per module, each owned by one of you
      recipes/
        RecipesPage.tsx
      deliveries/
        DeliveriesPage.tsx
      shifts/
        ShiftsPage.tsx
```

For this example I'm using an imaginary bakery with four modules: orders, recipes, deliveries and shifts. Your modules have other names. Wherever the bakery's names appear below, use the names from your static pages.

`pages/` is a new folder as well. It's for pages that belong to no module, like the home page. A page that belongs to a module lives in that module's folder in `features/`.

## Installing the router

React Router is a separate package, not part of React itself.

> 🎓 In a terminal, in your `ClientApp/` folder:

```bash
npm install react-router@7
```

The `@7` pins the major version, so the whole team gets the same one. It lands in `package.json`, which you commit, and after that anyone who pulls just runs `npm install` to get it too.

## The router around the app

> 🎓 Open `src/main.tsx` and wrap `App` in `BrowserRouter`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

Your imports (like the stylesheet lines) may look a little different. The change is the `BrowserRouter` import and the two lines wrapping `<App />`. That's the part that watches the address bar. You set it up once and never touch it again.

## The shell

Your static pages probably all had the same header, menu and footer, copied into every file. Now that will live in one component. The spot where a page's own content goes is marked with `<Outlet>`.

> 🎓 Create `src/components/Layout.tsx`:

```tsx
import { Link, Outlet } from "react-router";

export function Layout() {
  return (
    <div className="page">
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/recipes">Recipes</Link>
          <Link to="/deliveries">Deliveries</Link>
          <Link to="/shifts">Shifts</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>The Bakery</p>
      </footer>
    </div>
  );
}
```

This example is very minimal. Maybe you've already made something better. Move your own HTML and class names from your own static shell, so the `.page` grid and everything else in the shared stylesheet keep working as they did.

One thing does change. The menu links in your static pages were `<a href="orders.html">`. Here they're `<Link to="/orders">`. A normal `<a>` asks the server for a whole new page, which reloads your entire app and throws away everything it was doing. `<Link>` changes the address and lets the router swap the page, with no reload. So inside the app, every link is a `Link` from now on. (Links to other websites stay a plain `<a>`, because those really do leave the app.)

## A home page

> 🎓 Create `src/pages/HomePage.tsx`:

```tsx
export function HomePage() {
  return (
    <>
      <h1>The Bakery</h1>
      <p>Pick a page from the menu.</p>
    </>
  );
}
```

A placeholder. What the real home page shows is a team decision for later, and there's no hurry.

## The route table

> 🎓 Replace the contents of `src/App.tsx`:

```tsx
import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { OrdersPage } from "./features/orders/OrdersPage";
import { RecipesPage } from "./features/recipes/RecipesPage";
import { DeliveriesPage } from "./features/deliveries/DeliveriesPage";
import { ShiftsPage } from "./features/shifts/ShiftsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="shifts" element={<ShiftsPage />} />
      </Route>
    </Routes>
  );
}
```

It reads like a table: this address shows this page. `index` is the page at `/` itself. The paths inside have no leading slash, because they hang under the `/` of the outer route, the one that renders `Layout`. That's how every page ends up inside the shell, in the spot where `Outlet` is.

Whatever `App` rendered before this, the cards from React lesson 1 or the pages stacked on top of each other, has to be moved into its own page.

## Four pages, one each

Each of you owns one page component. A page is also a normal component, in your module's folder, with the name that `App.tsx` imports. The person typing creates all four now, with just a heading in each, so the whole thing compiles and goes into one commit.

> 🎓 Create `src/features/orders/OrdersPage.tsx`, and the same for the other three modules:

```tsx
import "./orders.css";

export function OrdersPage() {
  return <h1>Orders</h1>;
}
```

The first line shows you how to import your module's own stylesheet.

After the pull, each of you moves your own work into your own page.

## Try it

> 🎓 Run `npm run dev`, open the app, and click through the menu.

The address bar changes with every click, the shell stays, the page inside it swaps, and there's no flash of a reloading page. Press the browser's back button and it walks you back through the pages you visited. Type `/recipes` in the address bar by hand and you land on that page. That's what routing gives you, and React lesson 5 explains the machine that does it.

## Commit and pull

One commit. Everybody pulls and runs `npm install` inside `ClientApp/`.

## What we add in React lesson 5

A detail page with the record's id in the address (`/orders/12`), a page for addresses that don't exist, and sending the user somewhere from code after they submit a form. And we'll explain everything above properly.