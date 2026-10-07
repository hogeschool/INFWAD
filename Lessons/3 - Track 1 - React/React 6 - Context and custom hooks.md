# React 6: Context and custom hooks

Well, this is it. The final React lesson.

I said there were two things left. The first was the fetch we wrote twice, once for the list and once for the detail page. If we add another screen, there will be three copies that have the same kind of state, effect and try/catch logic. We'll have to find a way to refactor that into something reusable.

The second thing was that every route is now wide open. Anyone can just type the URL and land on any page, without any login deciding who is allowed there.

We'll fix the fetch first, by moving all that code into one function we call everywhere. That's what a _custom hook_ is for. Then we'll build a login, and to make that logged-in-or-not state readable from anywhere, we'll need _Context_. We wrap that in a custom hook as well, and then we can use it to lock the open pages behind the login.

## Custom hooks

A custom hook is a function whose name starts with `use` and that calls other hooks. `useState` and `useEffect` are hooks that React gives you. A custom hook is one you write yourself, built out of those, so your own state logic can be reused. It's allowed to call them because it's called the way a hook is: from a component, at the top level, in the same order every render. The `use` prefix is important. React's linter recognises it and checks that the code inside follows the rules for hooks.

Let's start by taking the fetch logic out of `ProductsPage` and putting it in its own file.

> 🎓 Open `features/products/ProductsPage.tsx` and look at the `useEffect`. Leave it open so you can compare it to the new code below.
>
> Create a new folder `hooks/` in `src/`, next to `components/` and `pages/`.
>
> Create a new file `hooks/useFetch.ts`:

```tsx
import { useState, useEffect } from "react";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const result: T = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Could not load data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [url]);

  return { data, loading, error };
}
```

It's the same three states and the same effect as in `ProductsPage`, with the URL passed in as an argument (`url`) and the three states returned. The generic `<T>` makes it reusable for different data. Remember the generics on `useState`? `useState<Product[]>` is state holding products. Here `T` is whatever we're fetching, so the hook doesn't care if you ask it for products, orders, or anything else, and the data it returns has the matching type.

A page would use it like this:

```tsx
const { data, loading, error } = useFetch<Product[]>("/products.json");
```

One call, and it returns the three states together.

Better already! But hold on, we won't implement it yet...

## Changing the hook's data

We're not done yet. Remember that the server sends `title` for products, but our app uses `name`? Our new `useFetch` from above returns exactly what the server sent, so the type up there is really `ProductResponse[]`, not `Product[]`, and the page still has to map one to the other after it gets the data.

You might think: "Ok, so I will map it in the component, the way I did before."

You can, but then you'd need to do that in every component that fetches: the list page, the detail page, and so on. The point of the mapping was to translate the server's shape into ours in exactly one place, the moment the data arrives, so nothing past that point cares how things are named on the server. Mapping in each component scatters the same translation across the app.

So we move it into the hook. The hook fetches, then reshapes, and returns the data the way we want it.

That means the hook needs to know how to reshape, and the reshaping is different each time (because this will be a reusable `useFetch`, remember?). So we pass it the transform, as a function. This is what we want:

```tsx
export function useFetch<TRaw, TData>(
  url: string,
  transform: (raw: TRaw) => TData,
) {
  // ...
  const raw: TRaw = await response.json();
  setData(transform(raw));
  // ...
}
```

Let's go over it:

- `TRaw` is the raw shape that comes from the server.
- `TData` is the shape we want.
- `transform` is the function that turns a `TRaw` into a `TData`. We will let the list page pass a transform function that maps the array of Products, and the detail page one that reshapes a single product.

Before we do that, let's improve one more thing.

## When the data arrives late

The fetch on our detail page has a bug, but it only shows up when the page fetches again.

Remember what happens when we go from `/products/1` to `/products/2`? React keeps the same detail page on screen and only swaps the id. The effect runs again and fires a second request for the product data.

What we haven't talked about yet is this: **What if the first one still wasn't done fetching?** On a slow connection the first request can even answer _after_ the second! (Remember the async timeouts example?) In that case, the previously requested data arrives last and overwrites the newer data, and you end up looking at product 1 with a 2 in the address bar. Think about that for a moment, or read this again! Requests are not automatically cleaned up or replaced. We have to handle that ourselves.

That's a bug, and an annoying one to track down, because _most of the time_ the requests come back in the order you expect.

But React has a solution. An effect can return a small cleanup function. React runs that, right before the effect runs again, and once more when the component is removed from the screen. That's where we put the fix. We will let each run of the effect set a local variable, then let the cleanup reset it. That way we can write something that makes sure only the most recent request is allowed to set state.

> 🎓 Let's update `hooks/useFetch.ts` with the transform and the cleanup:

```tsx
import { useState, useEffect } from "react";

export function useFetch<TRaw, TData>(
  url: string,
  transform: (raw: TRaw) => TData,
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const raw: TRaw = await response.json();
        if (!ignore) {
          setData(transform(raw));
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError("Could not load data.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
    // The linter will complain that transform is a missing dependency,
    // so we add the following line. If you want to fix this,
    // look into useCallback. For now, we skip it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error, setData };
}
```

It works like this:

- `ignore` starts as `false` at the top of every run of the effect.
- `setLoading(true)` and `setError(null)` reset the states when the effect runs again, so moving to another product shows the loading text instead of the previous product.
- `if (!ignore)` asks "is this run still the current one?" before touching state.
- The cleanup (`return () => { ignore = true; }`) sets the old run's flag to `true`, right before the next run starts.
- `[url]` makes the effect depend on the URL. When the URL changes, like moving to a different product, the effect runs again and fetches again. It doesn't depend on `transform`: the component makes that function fresh on every render, so listing it would run the effect on every render, in an endless loop.
- `setData` is returned beside the three states now. A screen that only reads, like the detail page, can ignore it. A screen that changes the data after it loads, like the list adding a product, uses it to update what the hook is holding.

> 🔍 A closer look at cancelling requests: you might see another solution in other codebases: an `AbortController`, which actually cancels the old request. The `ignore` flag doesn't stop the old request, it only stops its result from overwriting the new one. That's good enough for us.

It'll be clearer once we use it in our pages, so let's do that now.

## Refactoring the two pages

Our `ProductDetailPage` was pretty long, mostly because of the fetch. With our custom hook, the fetch is just one call.

> 🎓 Replace everything in `features/products/ProductDetailPage.tsx` with this:

```tsx
import { useParams, Link } from "react-router";
import { useFetch } from "../../hooks/useFetch";
import type { Product } from "../../types/Product";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

export function ProductDetailPage() {
  const { id } = useParams();
  const {
    data: product,
    loading,
    error,
  } = useFetch<ProductResponse, Product>(`/products/${id}.json`, (raw) => ({
    id: raw.id,
    name: raw.title,
    price: raw.price,
  }));

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

The three `useState` calls and the whole `useEffect` are gone. What is left is the id from `useParams`, one `useFetch` call with the transform function for a single product, and the HTML for the three states. Because the URL has the id in it, the hook fetches again when you move to another product.

`ProductsPage` can now use the hook too, with its own version of the transform. The fetch logic is replaced with one call.

> 🎓 In `features/products/ProductsPage.tsx`, import `useFetch` from `../../hooks/useFetch` and delete `useEffect` from the `react` import. Then replace the three `useState` lines for products, loading and error, plus the whole `useEffect`, with this (`ProductResponse` stays where it is):

```tsx
const {
  data: products,
  loading,
  error,
  setData: setProducts,
} = useFetch<ProductResponse[], Product[]>("/products.json", (raw) =>
  raw.map((item) => ({ id: item.id, name: item.title, price: item.price })),
);
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
```

We rename `setData` to `setProducts` on the way out, because that's what it sets here. The add, edit, and delete functions are exactly the ones from the async lesson, with one change: they call `setProducts`, which is now the setter that the hook handed back, instead of one inside the component itself.

The list starts as `null` until the fetch returns, so they read it as `products ?? []`, the current list or an empty one if it has not arrived.

> 🎓 Update the three functions, and give `<ProductList>` the same treatment: its prop becomes `products={products ?? []}`, because `null` is not a list.

```tsx
function addProduct(name: string, price: number) {
  const newProduct: Product = { id: Date.now(), name, price };
  setProducts([...(products ?? []), newProduct]);
}

function updateProduct(updated: Product) {
  setProducts((products ?? []).map((p) => (p.id === updated.id ? updated : p)));
  setEditingProduct(null);
}

function deleteProduct(id: number) {
  setProducts((products ?? []).filter((p) => p.id !== id));
}
```

> 🎓 Save and reload, then try both pages: the list, a product's page, back, add, edit, delete, and `/products/99999` into the error state. Everything works exactly as before. That's what a refactor is: the code changed, the behaviour didn't, and two pages just lost their duplicate copies of the fetch.

The rest of the page is unchanged from last lesson. These edits and deletes still only change the data in the browser's memory, because we don't have a backend. Once there's a real server, these functions will get a `fetch` of their own.

> 🎓 Now add another one on your own. Create `public/categories.json`:
>
> ```json
> [
>   { "id": 1, "label": "Computers" },
>   { "id": 2, "label": "Phones" },
>   { "id": 3, "label": "Audio" }
> ]
> ```
>
> Give it a response type of its own (the server says `label`, but we want to call it `name`), a `Category` type in `types/Category.ts`, and a transform, then call `useFetch` from `pages/HomePage.tsx` and render the names as a list under the welcome text. Nothing in `useFetch.ts` changes.
>
> <details>
> <summary>👀 After you're done, click here to see the answer.</summary>
>
> `types/Category.ts`:
>
> ```ts
> export type Category = {
>   id: number;
>   name: string;
> };
> ```
>
> `pages/HomePage.tsx`:
>
> ```tsx
> import { useFetch } from "../hooks/useFetch";
> import type { Category } from "../types/Category";
>
> type CategoryResponse = {
>   id: number;
>   label: string;
> };
>
> export function HomePage() {
>   const { data: categories } = useFetch<CategoryResponse[], Category[]>(
>     "/categories.json",
>     (raw) => raw.map((item) => ({ id: item.id, name: item.label })),
>   );
>
>   return (
>     <div>
>       <h1>Welcome to the product catalog</h1>
>       <p>Browse the products, or pick one to see its details.</p>
>       <ul>
>         {(categories ?? []).map((category) => (
>           <li key={category.id}>{category.name}</li>
>         ))}
>       </ul>
>     </div>
>   );
> }
> ```
>
> </details>

## State the whole app needs

The fetch is now nice and tidy. Now let's finally talk about the login.

To lock a page behind a login, several parts of the app all need to know one fact: are you logged in, and if so, who are you. The navigation needs it to show "Log in" or "Log out", each protected page needs it to decide whether to show itself or send you to the login, and if you have a greeting message somewhere, it needs your name. That one piece of state has to be readable from all over the tree.

So far we've used state and props. We could add a `user` in `App` and pass it down through props, but that gets ugly: `App` hands `user` to `Layout` for the nav, and every page that needs it gets it passed down too, through components that don't use it themselves, only there to carry it one level deeper. Passing a prop through middlemen only to reach someone further down is called _prop drilling_, and it gets worse the deeper your tree is.

And the router makes it even worse. Your pages render through `<Outlet>`, and you cannot hand a prop to a page through an Outlet the way you hand one to a normal child component. Luckily, there's a better tool for state that the whole app needs...

## Context

Context lets any component in a subtree read a value directly, no matter how deep, without passing it down through every level. You create the context once, wrap your app in a provider that holds the value, and every component inside reads that value. No prop drilling needed.

Here's an example:

```tsx
import { createContext } from "react";

// 1. make the context
const ThemeContext = createContext("light");

// 2. provide a value to everything inside
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>;
```

```tsx
import { useContext } from "react";

// 3. read it from anywhere inside, no props
const theme = useContext(ThemeContext);
```

- `createContext("light")` makes the context object, with a default value in it.
- `<ThemeContext.Provider value="dark">` sets the value for everything rendered inside it, in this case the whole `App`.
- `useContext(ThemeContext)` reads the value from any component inside it, no matter how many layers down. Change the value and every reader re-renders with the new one.

But what we actually want is the auth state, so let's build that.

## A mock login

A real login sends your username and password to a server, the server checks them, and it sends back a token that proves who you are on every request after. We have none of that yet. What we build now is a stand-in: it accepts any username, remembers that you are "logged in," and gives the rest of the app a way to ask. It's the auth version of our `products.json`: just something so we can continue building, and be ready for the real thing when it arrives.

The auth state goes in a context, and the provider owns it. Make a folder for auth, the way features get their own folder, and put the context in it:

> 🎓 Create a new folder `auth/` in `src/`, next to `hooks/`.
>
> Create a new file `auth/AuthContext.tsx`:

```tsx
import { createContext, useState, type ReactNode } from "react";

type User = {
  username: string;
};

type AuthContextValue = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(username: string, password: string) {
    if (username.trim() === "" || password.trim() === "") {
      return false;
    }
    const loggedIn = { username };
    setUser(loggedIn);
    localStorage.setItem("user", JSON.stringify(loggedIn));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Let's go over it:

- `AuthProvider` holds the `user` state and the two functions that change it, and passes all three to everything inside it.
- `login` would check the password, if we had a real server. Ours lets anyone through as long as they typed something, sets the user, and tells the browser to remember it.
- `logout` clears it.

The remembering is `localStorage`. State lives in memory, and you saw last lesson what memory does on a refresh: it resets, and your changes are gone. If the login lived only in state, every refresh would log you out. `localStorage` is memory the browser keeps across reloads, so we save the user there on login and read it back when the app starts. That's what the function we pass to `useState` does. `useState` can take a function instead of a value: React calls it once, on the first render, and uses what it returns as the starting state. So a saved user is there from the very first render, before anything in the app asks if you're logged in. Refresh the page and you're still logged in.

The provider wraps the app at the entry point, inside the router, so the routed pages are within it.

> 🎓 Update `main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

For a mock login this is good enough, but it's good to  understand that we're just keeping a plain `{ username }` object in `localStorage` and calling that logged in. Anyone can open the browser tools, type a username into localStorage, and your app believes them. That is not authentication. Good for now, while we build the rest of the app. It stays in place through the whole backend block, and in the authentication lessons at the end of the course we replace it with a server that actually checks your password, and a token that cannot be faked by editing localStorage.

## A custom hook for context

We could stop here and use this in our components, but it wouldn't look very good. To get the auth value, a component would call `useContext(AuthContext)`, and the type of what comes back is `AuthContextValue | null`, because the context's default is `null`. So every component would have to handle the `null` case before using anything, even though in practice the provider is always there. That is smelly code, repeated everywhere.

Custom hooks to the rescue! Wrap the `useContext` call and the null check in a custom hook, and let every component call that instead:

```tsx
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
```

> 🎓 Add that to `auth/AuthContext.tsx`, and add `useContext` to the `react` import at the top.

Now components can call `useAuth()` and get the value with the `null` already handled, and they never touch `useContext` themselves. The check also helps when someone uses `useAuth` in a component outside the provider: instead of a `null` that breaks in a confusing way later, they get a clear error right away that names the mistake.

Just like `useFetch` for data, we now have a function for auth that packages logic with hooks in it, written once, used everywhere.

The login screen is now quite simple! Just an ordinary page that gets `login` from `useAuth`, and uses `useNavigate`:

> 🎓 Create a new file `auth/LoginPage.tsx`:

```tsx
import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (login(username, password)) {
      navigate("/products");
    } else {
      setError("Enter a username and a password.");
    }
  }

  return (
    <div>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Log in</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}
```

It's the same shape as our `ProductForm`: controlled inputs  in a real `<form>`, `onSubmit` on the form, `preventDefault` as the first line of the handler so the page doesn't reload, and a `type="submit"` button so Enter works. `handleSubmit` calls `login`, and on success it sends you to the products page with `navigate`.

## Putting a lock on the open routes

Everything is now in place to close the open routes. We need a small component that sits in front of a page, checks if you're logged in, and either shows the page (its `children`) or sends you to the login:

> 🎓 Create a new file `auth/ProtectedRoute.tsx`:

```tsx
import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user === null) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
```

`<Navigate>` is the component version of React Router's redirect: render it, and the app goes to that path. The `replace` swaps the current entry in the history instead of adding a new one. Without it, pressing back on the login page would take you to the protected page, which sends you straight back to the login.

Note that `ProtectedRoute` asks `useAuth` as well, the one source of truth that knows if you're logged in.

In `App`, we can now wrap the routes we want to lock behind the login with `<ProtectedRoute>`. We also add the login page itself to the routes:

> 🎓 Edit `App.tsx`:

```tsx
import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./features/products/ProductsPage";
import { ProductDetailPage } from "./features/products/ProductDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./auth/LoginPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
```

The two products pages are wrapped, so opening them while logged out sends you to the login. The home page, the login page and the `NotFoundPage` stay open.

Lastly, let's update the nav, so we can log in and out from within the app.

> 🎓 Edit `components/Layout.tsx`:

```tsx
import { Link, Outlet } from "react-router";
import { useAuth } from "../auth/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {user ? (
            <button onClick={logout}>Log out ({user.username})</button>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

See how nice it is to be able to reuse `useAuth` everywhere? No props drilled down through Layout to reach it.

> 🎓 Time to try it! Open `/products` while logged out: you land on the login page. Submit it empty, and the error shows. Log in with any username and password, and you're sent to the products, with "Log out" and your name in the nav. Refresh: still logged in, and still on the products page. Now open DevTools, Application tab (Storage in Firefox), Local Storage, and look at the `user` entry. That plain object is the whole "login", which is the problem we talked about above. Log out, open `/products` again to get redirected, then press back: you don't end up on the products page again, because of that `replace`.

And let's take a look at our files. A new developer doesn't even have to open them to understand our app.

```
src/
  App.tsx
  main.tsx
  hooks/
    useFetch.ts
  auth/
    AuthContext.tsx
    ProtectedRoute.tsx
    LoginPage.tsx
  components/
    Layout.tsx
  features/
    products/
      ProductCard.module.css
      ProductCard.tsx
      ProductList.tsx
      ProductForm.tsx
      ProductsPage.tsx
      ProductDetailPage.tsx
  pages/
    HomePage.tsx
    NotFoundPage.tsx
  types/
    Category.ts
    Product.ts
```

Adding new features is easy now. Stick to this way of working, and you minimise the chances of your code smelling so bad that nobody (including future you) wants to touch it in a few months.

## Congratulations

This is the end of the React block. Look at what you're able to build now! And all of these building blocks are reusable and expandable. This could have been so many more lines of code, but it's all clean and tidy.

Of course the data comes from a static mock that cannot save anything (so your changes disappear when you refresh), and the login is a doorman that lets anyone through, but so what? For now, it's in excellent shape!

In the backend half of the course, we'll build the real data handling for our products, and send our doorman to the gym so he's actually able to stop unwanted visitors. The frontend code won't have to change much, because we already built it the right way.

## Resources

- React docs, "Reusing Logic with Custom Hooks". The custom-hook idea from the source, including a `useFetch`-style example and the `use` naming convention. https://react.dev/learn/reusing-logic-with-custom-hooks
- React docs, "Passing Data Deeply with Context". `createContext`, the provider, and `useContext`, with the prop-drilling problem they solve. https://react.dev/learn/passing-data-deeply-with-context
- React docs, "Synchronizing with Effects". The race-condition section uses the same `ignore` flag we used for cleanup, if you want it from the source. https://react.dev/learn/synchronizing-with-effects#fetching-data
- MDN, "Window: localStorage property". What `localStorage` is, what it holds, and its limits. https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## Applying this to your project

Some of this you do together with your team. `hooks/useFetch.ts` is team code, one copy for the whole app. Your own module's response type and mapping go in as the transform. When you're done, the fetch in each of your pages is one call. If it's more than that, something is still duplicated.

The login is another thing to do together: `auth/` with the provider, the login page and the protected route. Two things will be different from the lesson's example. The mock `User` gets the case's role beside the username (the desk, the committee, whatever your case calls it), because your rules need it later. And instead of letting any username through, keep a short hardcoded list of mock members, a few plain ones and one in the role, and let `login` look the username up in it. That list is the first version of your user seed data, so it's not throwaway. (Some cases put a second mark on a member besides the role. If yours does, it goes on the same object.) Then each of you locks your own routes and uses `useAuth()` in your own pages for the parts that depend on who is signed in. The rules themselves still wait for the backend.

Next week, it's time for the midterm presentation!