# ASP.NET 3: Connecting the frontend, reading

Our two programs have been growing up in the same folder, but they just sit there, side by side on your disk, and have never exchanged a single byte. Let's change that!

Last lesson I explained why the backend is split into a controller, a service, and a repository, each layer with one job and knowing only the layer below it. Hold on to that idea, because today the frontend gets the exact same treatment.

Today we do the reads. The writes are next lesson.

## What changes this lesson

Today, most of the work happens in `ClientApp`. We only need a few lines in `Program.cs` to let the browser in.

```
infwad-project/
  Catalog.Api/
    Program.cs                  (CORS)
    appsettings.json            (gains the frontend's address)
  ClientApp/
    .env                        (new: the API's address)
    public/
      products.json             (deleted)
      products/                 (deleted)
    src/
      api/                      (new folder)
        http.ts                 (new: shared plumbing)
        products.ts             (new: the product read requests)
      hooks/
        useFetch.ts             (reworked)
      features/products/
        ProductsPage.tsx        (reads go to the server)
        ProductDetailPage.tsx   (reads go to the server)
```

Because we did things right when we were building the React part, we don't have to change the form, the card, and the list components. For the login, we'll keep using the mock from React lesson 6 for a while longer: the doorman who lets everyone through gets to keep his job. We'll fire him near the end of the course.

Before starting, make sure both halves contain everything from the previous lessons. If either is behind, catch it up first, or find a classmate whose copy is at that point and diff yours against theirs.

## 1. Two apps, two terminals

Ok, first things first: both programs have to run at the same time.

> 🎓 Open two terminals in VS Code (the split or plus button on the terminal panel). In the first:

```bash
cd Catalog.Api
dotnet run
```

> 🎓 And in the second:

```bash
cd ClientApp
npm run dev
```

Two servers, two ports. The backend prints its listening line, something like `Now listening on: http://localhost:5088`. The frontend prints Vite's banner with `http://localhost:5173/`. Your backend port may differ from mine. It was picked when the project was created and it lives in `Properties/launchSettings.json`, so check your own listening line and use that number wherever I write 5088.

(You'll be restarting the backend a few times today. If the Ctrl+C routine gets old, you can run `dotnet watch` instead of `dotnet run` and it restarts itself whenever a file changes.)

> 🎓 Open both addresses in your browser, in two tabs. On 5173, log in with anything and look at the products page: three products, from the json file. On 5088, open `/api/products`: the same products, this time as raw JSON straight out of the database. Nearly the same, that is. The first one is a Fancy Laptop at 2500 there and a plain Laptop at 1200 in the app, because the json file never heard about your update from the previous lesson.

There they are. Two working programs, one machine, and not one byte travelling between them. The React app is a client with a fake server, and the API is a server whose only client has been a `.rest` file. Let's fix that.

## 2. Blocked by your own browser

The React app asks for its data in exactly one place at the moment, the `useFetch` call in `ProductsPage`. So the next move is obvious: point that URL at the real API and see what happens.

> 🎓 In `features/products/ProductsPage.tsx`, change only the URL in the `useFetch` call (use your port, remember?):

```tsx
const {
  data: products,
  loading,
  error,
  setData: setProducts,
} = useFetch<ProductResponse[], Product[]>(
  "http://localhost:5088/api/products",
  (raw) =>
    raw.map((item) => ({ id: item.id, name: item.title, price: item.price })),
);
```

> 🎓 Save, let the page reload, and watch.

"Could not load data." Hm. Bummer.

> 🎓 Open the browser console (F12). There's the real story, in red:

```
Access to fetch at 'http://localhost:5088/api/products' from origin
'http://localhost:5173' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the requested resource.
```

The exact wording differs per browser, but the four capital letters are always there. Welcome to CORS. Every web developer runs into this error eventually, usually near a deadline.

Here's what it means. Your React app runs on one origin, `http://localhost:5173`, and your API answers from another, `http://localhost:5088` (different port, so as far as the browser is concerned, a different place entirely). Browsers have a long-standing rule that code running on a page from one origin does not get to read responses from another origin, unless that other origin says out loud that it's ok. Your API has not said so yet, so the browser blocks the read to protect you.

One thing might seem strange: open the DevTools Network tab and reload. The request to `/api/products` is there. It was sent, and it was answered. The browser isn't stopping the request from going out. It's stopping your page's code from reading the answer, because the answer arrived without the permission header. Knowing that is helpful when you're debugging, so remember it.

We don't have to dive deeper into CORS today. The full story (why the browser is the one enforcing this and not the server, what a "preflight" is, and why CORS isn't actually a lock on your API) is really about the browser's security model. We'll talk about that in one of the authentication lessons. Today we take the fix, use it, and move on.

### The fix

The API has to say, out loud, "I serve `http://localhost:5173`." (Our frontend.) In ASP.NET Core that's a service registration and one line of _middleware_.

> 🎓 In `Catalog.Api/Program.cs`, add the CORS registration below the `AddControllers` line, and the `app.UseCors()` line just above `app.MapControllers()`:

```csharp
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()));
```

```csharp
app.UseCors();
```

`AddDefaultPolicy` defines the one policy this app has, and `UseCors()` without arguments applies it to every request. `WithOrigins` is where you can give it a list of origins that get the permission header. `AllowAnyHeader` and `AllowAnyMethod` open up the _what_ for that one trusted _who_, so our JSON content type and, next lesson, our PUT and DELETE, all pass.

Remember these two things, to save hours of troubleshooting later:

- An origin has no trailing slash: `"http://localhost:5173/"` looks identical, but matches nothing, and fails without a complaint.
- The port is part of the origin, so if Vite ever starts on 5174 because something else took 5173, your permission no longer matches. Exact string, no slash, right port.

(If you start troubleshooting CORS by searching online or asking AI, the top answer is usually `policy.AllowAnyOrigin()`, which makes the message go away, but tells your API to serve every page on the internet. Do not use it. Always name the one origin you need.)

> 🎓 Restart the backend, go back to the React tab in your browser, and reload.

Now we see three products, and the first one is a Fancy Laptop at 2500. The json file never had a Fancy Laptop! That one was renamed by the `PUT` you sent in the last lesson, and just now went through your controller, your service, your repository, Entity Framework, and SQLite, crossed the gap between two running programs, landed in your React state, and rendered. The two halves of this course just shook hands. Apart from that one name, the page looks exactly as it did, which is either an anticlimax or the whole point, depending on how you look at it. A clean connection is invisible!

> 🎓 Before we move on: in DevTools, open the Network tab and reload. There is the request to `localhost:5088/api/products`, going to your API, not to a file. (Two of them, the same as `products.json` showed twice in React lesson 4: `<StrictMode>` mounts twice in development. A production build sends only one request.) Set throttling to "Slow 4G" and reload again. See the "Loading products..." that we added in the React lessons? Against a real server on a slow connection, it's doing its actual job.

But we're not done yet. The detail page still reads the static files. And the page fetches from a URL hardcoded into a component... Not a great solution.

## 3. One home for the plumbing

Our frontend code was so nice and clean before. Now it has started to smell bad. `ProductsPage` currently knows the server's address, the server's paths, and the server's naming habits. If we continue like that, knowledge about the server ends up scattered across the whole feature folder.

Remember last lesson? Your backend already solved this problem. A controller doesn't know SQL. It talks to a service, the service talks to a repository, and everything about the database lives behind that boundary. The frontend deserves the same kind of approach.

Let's start by creating an **api module**, an ordinary TypeScript file with functions, one per request the app can make. We make one file per backend controller. `api/products.ts` today, `api/categories.ts` in a later lesson, when there's a second backend controller to mirror. This is the shape your project should have from the start. It's easier to do now, while the app is small, instead of untangling everything in a few months.

The api module should know about HTTP and the server's dialect. The `useFetch` hook knows React, the loading and error states, the effect, the race condition. The component knows nothing about all that. It just asks and renders.

### Shared plumbing

Two small things will be needed in every api module: the server's base address, and something that turns a failed response into an error. Copying them into each module would give us slowly diverging copies of the same code, which is how a messy codebase starts. So they get their own tiny file first.

> 🎓 Create a new folder `src/api/`, and in it a file `api/http.ts`:

```ts
export const baseUrl = "http://localhost:5088";

export async function errorFromResponse(response: Response): Promise<Error> {
  try {
    const problem: { title?: string } = await response.json();
    if (problem.title) {
      return new Error(problem.title);
    }
  } catch {
    // The body was not JSON. The generic message below will do.
  }
  return new Error(`Request failed with status ${response.status}`);
}
```

`baseUrl` is the server address, hardcoded for now (one thing at a time).

`errorFromResponse` has a job that mostly pays off later. When a response comes back not ok, it tries to read the body as a problem-details document and pull out a `title`, a message meant for a human, then falls back to the status code if there's no such body. Right now your API doesn't send those human messages yet. A missing product is a bare `404`, so this helper falls back to `Request failed with status 404`. In lesson six you teach the backend to answer errors with a real sentence, and this code will be ready for it.

Notice: it _returns_ the error rather than throwing it. An `async` function's throw is wrapped in its promise, so the caller writes `throw await errorFromResponse(response)`, which reads a bit strange at first sight, but works exactly right: wait for the error to be built, then throw it.

### The products api module

> 🎓 In the same folder, create `api/products.ts`:

```ts
import type { Product } from "../types/Product";
import { baseUrl, errorFromResponse } from "./http";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

function toProduct(raw: ProductResponse): Product {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
  };
}

export async function getAll(): Promise<Product[]> {
  const response = await fetch(`${baseUrl}/api/products`);
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse[] = await response.json();
  return raw.map(toProduct);
}
```

We only implement the reads, for now. The writes join this file next lesson.

Explanation for the code above:

- `ProductResponse` is the shape the server actually sends: an `id`, a `title`, a `price`. The frontend calls that middle field `name`, so the two shapes aren't identical, which is what the mapper fixes. You wrote this same type inside `ProductsPage` back in React lesson 4. Now that code moves here, to the one file that deals with the server, and we can remove it from the page.

- `toProduct`: Everything the server sends passes through here on its way in. Past this function, nothing in the app knows the server calls it `title`. This is the thing your backend service does with `ToDto`, in mirror image: the boundary layer does the mapping, in both programs.

- `getAll()` is the familiar `fetch` and `response.ok` check, then parse, map, return. Notice what it promises in its signature: `Promise<Product[]>`. App shapes in, app shapes out. `ProductResponse` is not used anywhere outside of this module.

> 🎓 Now write `getById` yourself, below `getAll()`. It takes an `id: number` and promises one `Product`. Same URL with the id on the end, same `ok` check, but the body is a single `ProductResponse` rather than an array, so it's `toProduct(raw)` instead of `raw.map(toProduct)`.
>
> <details>
> <summary>👀 After you're done, click here to see the answer.</summary>
> 
> ```ts
> export async function getById(id: number): Promise<Product> {
>   const response = await fetch(`${baseUrl}/api/products/${id}`);
>   if (!response.ok) {
>     throw await errorFromResponse(response);
>   }
>   const raw: ProductResponse = await response.json();
>   return toProduct(raw);
> }
> ```
>
> </details>

### Rewriting the useFetch hook

Our `useFetch` hook still does everything by itself. But we just made the api module do the fetching, checking, parsing, and mapping.

The hook doesn't need to talk to the server anymore. It only has to do the React half: the three states, the effect, and the ignore flag that stops a stale response from overwriting a fresh one. Instead of a URL, it takes a function that loads something.

> 🎓 Rewrite `hooks/useFetch.ts`:

```tsx
import { useState, useEffect } from "react";

export function useFetch<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await load();
        if (!ignore) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Could not load data.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      ignore = true;
    };
    // The linter cannot check dependencies handed in as a parameter,
    // the same story as the transform in the previous version.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}
```

A bit shorter and simpler than before.

The `fetch`, the `ok` check, and the transform are all gone, replaced by one `await load()`. What stayed is exactly what a React hook should own: state, effect, cleanup, and the ignore flag to prevent multiple requests from conflicting (see React lesson 6).

The second parameter, `deps` (for dependencies), replaces the hardcoded `[url]` from the old version and is passed straight through to the effect. The hook is used for both the detail page and the list page, so `deps` will be `[]` for "load once", and `[id]` for "reload when the id changes". (The eslint-disable comment was already there. It's needed because the linter can only verify dependencies it can see written out at the effect, not ones arriving through a parameter.)

And the catch block got improved. The old version showed "Couldn't load data." no matter what went wrong. Our api module now throws errors with real messages in them, so we show `err.message` when there is one. The `instanceof Error` check is there because a caught value has type `unknown` (JavaScript lets you throw anything), so we make sure it really is an `Error` before reading its `.message`.

_(Hm... we could rename the hook now, because it doesn't actually call `fetch` anymore. It runs any async load you give it. For now we'll keep it as it is.)_

### Rewiring the pages

Now the pages can be refactored.

> 🎓 In `features/products/ProductsPage.tsx`, add the api module import, delete the `ProductResponse` type at the top of the file, and change the `useFetch` call:

```tsx
import * as productsApi from "../../api/products";
```

```tsx
const {
  data: products,
  loading,
  error,
  setData: setProducts,
} = useFetch(productsApi.getAll, []);
```

That way of importing might be new to you: `import * as productsApi` takes everything the module exports and hangs it under one name. It's the right tool here for two reasons. The module's function names are short verbs like `getAll` and, later, `create` and `update`, which would be confusing if we let them loose in a component and they would collide with the page's own handler names. Under the namespace (`productsApi`) they look better: `productsApi.getAll`, `productsApi.create`.

And look at the call itself. `productsApi.getAll` takes no arguments, so we don't even wrap it, we hand the function itself to the hook, plus `[]` for "load once, on mount".

Now the page knows nothing about URLs, transforms or servers anymore!

We will change the add, edit, and delete handlers in the next lesson.

> 🎓 Now rewrite `features/products/ProductDetailPage.tsx`:

```tsx
import { useParams, Link } from "react-router";
import { useFetch } from "../../hooks/useFetch";
import * as productsApi from "../../api/products";

export function ProductDetailPage() {
  const { id } = useParams();
  const {
    data: product,
    loading,
    error,
  } = useFetch(() => productsApi.getById(Number(id)), [id]);

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

Just like before, but here the load function (`productsApi.getById(Number(id))`) does take an argument, so we wrap it in an arrow: "when asked to load, call `getById` with the current id". `useParams` gives us the id as a string, because everything in a URL is a string, and `Number(id)` turns it into what `getById` wants.

`[id]` in the dependencies keeps the behaviour we built in React lesson 6: click from product 1 to product 2, the id changes, the hook reloads.

Now we can throw away our mock data!

> 🎓 Delete `public/products.json` and the whole `public/products/` folder.

> 🎓 Check if everything still works. The list shows the products from the database. Click through to a detail page: real data, and clicking between products still swaps cleanly. Then change the address bar to `/products/999`: the page shows "Request failed with status 404". That's the `404` your controller returns, surfaced by the error UI we built in React lesson 6. It's not a very friendly message yet, but we can improve that in a future lesson.

> 🎓 One last check: stop the backend (Ctrl+C in its terminal), reload the products page, and read the error state. "Failed to fetch", straight from the browser, shown by your error UI instead of a blank page. Start the backend again. This is what "the server is down" looks like to your users, and your app already survives it.

All reads now flow through one module, and the app behaves the same as it did at the start of this lesson. That's what a good refactor looks like from the outside: it looks like nothing ever happened.

## 4. Addresses shouldn't be in the code at all

Two URLs are still living inside source code where they don't belong. The frontend has `http://localhost:5088` in `api/http.ts`, and the backend has `http://localhost:5173` in `Program.cs`. Both should be moved to some configuration file.

Why does that matter? Because these values change per machine and per environment, and code should not. Your backend port probably differs from mine already. When the app deploys, the API lives at some real address and the frontend at another, and "edit the source and rebuild" isn't something you should ever have to write in your documentation. Configuration answers "where", code answers "how", and the two change at completely different speeds. In the backend, we already fixed this once: the connection string sits in `appsettings.json`, not in `AppDbContext`.

### The backend

> 🎓 In `Catalog.Api/appsettings.json`, add a `Frontend` section, so the whole file reads:

```json
{
  "ConnectionStrings": {
    "Default": "Data Source=catalog.db"
  },
  "Frontend": {
    "Url": "http://localhost:5173"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

> 🎓 In `Program.cs`, read it where the CORS policy is built. Replace the hardcoded origin:

```csharp
var frontendUrl = builder.Configuration["Frontend:Url"]
    ?? throw new InvalidOperationException("Missing configuration value Frontend:Url");
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()));
```

See that `??`? `builder.Configuration["Frontend:Url"]` returns the value, or `null` if it's missing, and C# lets the right side of `??` be a `throw`. It helps if you read it like this: the frontend URL is the configured value, or else refuse to start. That's fail-fast pattern, and it's a nice thing to do for your future self. A missing config value should be a loud crash at startup with a message naming the value, not a mystery CORS error you have to troubleshoot.

> 🎓 Restart the backend. Nothing visible changes, the origin is the same, it just comes from configuration now instead of from source.

### The frontend

Vite has its own configuration mechanism: environment variables, read from a file called `.env`.

> 🎓 Create a file `.env` in the `ClientApp` root, next to `package.json`. Not inside `src/`. One line:

```
VITE_API_URL=http://localhost:5088
```

The `VITE_` prefix is required. It's a safety feature. Everything in your frontend ships to every visitor's browser, source, variables, all of it, so Vite refuses to expose environment variables to your code unless you have opted them in by prefix. A database password in a frontend env file would otherwise be one careless import away from the whole internet. (Always remember! Real secrets never belong in frontend code at all, prefixed or not. If a value must stay secret, it lives on the server. We'll talk more about this in the authentication lessons.)

You can commit this `.env` file to git. It holds no secret, just an address your teammates need too. The convention for values that should not be shared is a second file, `.env.local`. Vite will also read that, but you should never commit it to git, so it belongs in `.gitignore`.

> 🎓 In `api/http.ts`, read the variable instead of hardcoding it. Change the first line, and add the check below it:

```ts
export const baseUrl = import.meta.env.VITE_API_URL;

if (!baseUrl) {
  throw new Error(
    "VITE_API_URL is missing. Create ClientApp/.env and restart the dev server.",
  );
}
```

`import.meta.env` is Vite's window into those variables. And there's our fail-fast again, just like the backend's `?? throw`. Two programs, one discipline: refuse to run half-configured.

> 🎓 Then restart the frontend dev server (Ctrl+C, `npm run dev` again) and reload the app.

That restart isn't optional. This will confuse you someday, so keep it in mind: Vite reads `.env` once, at startup. If you edit the file while the server runs, nothing changes until the restart. If your app ever ignores an env change, remember to restart.

Everything still works? Great!

## Where this goes next

Look at what we did today! The frontend no longer reads from a static file, it reads from your API. Between the two sits a small, disciplined boundary: an api module that knows HTTP, one hook that knows React, and configuration that knows the addresses. The components just ask. Always use this pattern.

Later, when we add authentication, every request needs to carry a token. That's will now be just one change in the api modules, and we won't have to go digging through all our components.

Next lesson we implement the add, edit and delete!

## Applying this to your project

The connection has a team half and a module half, like routing did. Do this with your team first, because every module depends on it.

Team: the CORS registration and `app.UseCors()` in `Program.cs`, the frontend's address in `appsettings.json`, a `.env` with `VITE_API_URL` in `ClientApp` (committed, it holds no secret), `api/http.ts` with `baseUrl` and `errorFromResponse`, and the `useFetch` rework. Do it together, merge it the same day, and rewire the shared entity's pages while you're there. Then each of you fixes your own.

Your module: one api module per controller, so `api/<your resource>.ts` with `getAll` and `getById`, a private response type, and a mapper where the server's names differ from the app's. Your list page and your detail page go through it, one `useFetch` call each, and no URL anywhere in a component. Then delete your JSON mock files from `public/`. They did their job. The list should look exactly as it did before, out of your database now, and a wrong id in the address bar should show your error state, not a blank page.

From this lesson on, a component never talks to the server. It asks a module. I don't want to see `fetch` calls directly in components anymore.