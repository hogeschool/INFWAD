# ASP.NET 4: Connecting the frontend, writing and searching

Last lesson we connected the reads. Open the app and the products come out of your database now, through the api module and the hook, not from a JSON file. But only the reads. Add a product in the browser, press refresh, and it's gone. The form still talks to nobody.

Today we will connect the POST, PUT and DELETE to the frontend. And once the writes work, we build something new on top of them: a search box, and behind it a complete feature slice, from a query in the URL all the way down to a filtered database query and back.

## What changes this lesson

Most of the work is in `ClientApp` again. The backend already has the endpoints for the writes, and it only gains a little for the search.

```
infwad-project/
  Catalog.Api/
    Repositories/
      IRepository.cs          (add FindAsync)
      Repository.cs           (add FindAsync)
    Services/
      IProductService.cs      (GetAllAsync gains a search parameter)
      ProductService.cs       (GetAllAsync gains a search branch)
    Controllers/
      ProductsController.cs   (GetAll gains a search query parameter)
    products.rest          (a search request)
  ClientApp/
    src/
      api/
        products.ts           (the three write functions, and search)
      features/products/
        ProductsPage.tsx       (handlers save for real, plus a search box)
```

Before starting, make sure both halves contain everything from the last lesson: the frontend and backend connected, the reads going through `api/products.ts`, the addresses in configuration. If yours is behind, catch it up first, or find a classmate whose copy is at that point and diff yours against theirs.

## 1. Writing back

Let's start by looking at the boundary between the frontend and the backend.

### The shape of a write

> 🎓 Open `Catalog.Api/Dtos/ProductDtos.cs` in the backend and read `CreateProductDto`: a title and a price, no id.

That's the contract for a write, and the frontend needs a shape that matches it. Not `Product`, which is what the frontend shows on screen and which carries an id the server hands out. A write is a different thing, so it gets a different type.

> 🎓 Open `ClientApp/src/api/products.ts`. Below `toProduct`, add a `ProductData` type and a `toRequestBody` mapper first:

```ts
export type ProductData = {
  name: string;
  price: number;
};
```

```ts
function toRequestBody(data: ProductData) {
  return {
    title: data.name,
    price: data.price,
  };
}
```

- `ProductData` is the shape of a write as the frontend sees it: what you must provide to create or edit a product. It's the frontend cousin of `CreateProductDto`, in the frontend's own vocabulary (`name`, not `title`). It lives here in the api module, not in `types/` next to `Product`, because it describes a request, and requests belong in the module that makes them.

- `toRequestBody` is `toProduct` the other way around. Data coming in from the server gets translated at this boundary, and now data going out does too: the `name` becomes a `title` the moment it leaves, and no other file ever has to know about it.

### The three write requests

> 🎓 Add `create` and `remove` to `api/products.ts`, below the two read functions:

```ts
export async function create(data: ProductData): Promise<Product> {
  const response = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toRequestBody(data)),
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse = await response.json();
  return toProduct(raw);
}

export async function remove(id: number): Promise<void> {
  const response = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
}
```

Let's go over it:

- `fetch` gets a second argument here for the first time. Everything we fetched until now was a GET, which is what `fetch` does when you only give it a URL. The options object changes that:
    - `method` specifies if it's GET, POST, PUT or DELETE.
    - `headers` announces `Content-Type: application/json`.
    - `body` carries the payload. It's `JSON.stringify(...)`, because HTTP carries text: the object is turned into a JSON string on this side, and `[ApiController]` parses it back into a `CreateProductDto` on the other side.

- `create` returns a `Product`, because our controller answers a POST with `201 Created` and the finished product, id included.

- `remove` doesn't need to read the response body, because a successful delete answers `204 No Content`. Call `response.json()` on a 204 and it throws on the empty body.

We have been writing these exact requests by hand in `products.rest` since ASP.NET lesson 2: the method and the URL, the `Content-Type` header, the blank line, the JSON. This is the same request, written in JavaScript instead of in a `.rest` file.

Note: why `remove` and not `delete`? Because `delete` is a reserved word in JavaScript (it's the operator for removing a property from an object), so you can't name a function after it. Most JavaScript code uses `remove`, `destroy` or `del` instead.

One request is missing: update. It's `create` with two changes.

> 🎓 Write `update` yourself, below `create`. It sends a `PUT` instead of a `POST`, and it takes an `id` that goes in the URL, the way `getById` does. Everything else (the headers, `toRequestBody`, reading the returned product back) is the same.
>
> <details>
> <summary>👀 After you're done, click here to see the answer.</summary>
>
> ```ts
> export async function update(id: number, data: ProductData): Promise<Product> {
>   const response = await fetch(`${baseUrl}/api/products/${id}`, {
>     method: "PUT",
>     headers: { "Content-Type": "application/json" },
>     body: JSON.stringify(toRequestBody(data)),
>   });
>   if (!response.ok) {
>     throw await errorFromResponse(response);
>   }
>   const raw: ProductResponse = await response.json();
>   return toProduct(raw);
> }
> ```
>
> </details>

> 🎓 Then check your whole `api/products.ts` against this:

```ts
import type { Product } from "../types/Product";
import { baseUrl, errorFromResponse } from "./http";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

export type ProductData = {
  name: string;
  price: number;
};

function toProduct(raw: ProductResponse): Product {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
  };
}

function toRequestBody(data: ProductData) {
  return {
    title: data.name,
    price: data.price,
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

export async function getById(id: number): Promise<Product> {
  const response = await fetch(`${baseUrl}/api/products/${id}`);
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse = await response.json();
  return toProduct(raw);
}

export async function create(data: ProductData): Promise<Product> {
  const response = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toRequestBody(data)),
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse = await response.json();
  return toProduct(raw);
}

export async function update(id: number, data: ProductData): Promise<Product> {
  const response = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toRequestBody(data)),
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse = await response.json();
  return toProduct(raw);
}

export async function remove(id: number): Promise<void> {
  const response = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
}
```

That's the api module done: five functions, `Product` shapes going in and coming out, and nothing outside this file knows there's a server at all. Compare it with the backend's `IProductService`:

```
IProductService (C#)          productsApi (TypeScript)
GetAllAsync()                 getAll()
GetByIdAsync(id)              getById(id)
CreateAsync(dto)              create(data)
UpdateAsync(id, dto)          update(id, data)
DeleteAsync(id)               remove(id)
```

They line up, because they're the two ends of the same five requests. When you write your project's api modules, check this: a frontend module and its backend service should roughly mirror each other.

### The page saves for real

Now the page.

> 🎓 Rewrite `features/products/ProductsPage.tsx`:

```tsx
import { useState } from "react";
import type { Product } from "../../types/Product";
import * as productsApi from "../../api/products";
import { useFetch } from "../../hooks/useFetch";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";

export function ProductsPage() {
  const {
    data: products,
    loading,
    error,
    setData: setProducts,
  } = useFetch(productsApi.getAll, []);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function addProduct(name: string, price: number) {
    try {
      const created = await productsApi.create({ name, price });
      setProducts([...(products ?? []), created]);
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save the product.",
      );
    }
  }

  async function updateProduct(updated: Product) {
    try {
      const saved = await productsApi.update(updated.id, {
        name: updated.name,
        price: updated.price,
      });
      setProducts((products ?? []).map((p) => (p.id === saved.id ? saved : p)));
      setEditingProduct(null);
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save the product.",
      );
    }
  }

  async function deleteProduct(id: number) {
    try {
      await productsApi.remove(id);
      setProducts((products ?? []).filter((p) => p.id !== id));
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not delete the product.",
      );
    }
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
      {saveError && <p>{saveError}</p>}
      <ProductList
        products={products ?? []}
        onEdit={startEditing}
        onDelete={deleteProduct}
      />
    </div>
  );
}
```

Every handler has the same shape: call the api module, await the answer, update the state from what came back, and catch what went wrong into a message for the user. About the new stuff:

- `saveError` is new. Read errors already have a home, the hook's `error`, shown when the page can't load at all. A write error is a different situation: the page is fine, the list is fine, one save failed. So its message is shown next to the form, and the user can carry on.

- `addProduct` no longer has `Date.now()`. That was the placeholder id since React lesson 3. Now the server assigns the id, and the `created` object we append to the list is the server's own answer, real id and all. Same in `updateProduct`: the list takes the server's returned version, not our local copy. The database is the source of truth now.

- The three `catch` blocks are almost the same. Leave them for now, we'll fix that in lesson 8.

Note: the form didn't change. It still collects a name and a price and hands them up, exactly as it did in React lesson 3. Only what the page does with them changed: instead of putting the new product in an array in memory, it sends it to the server.

### Testing the writes

Let's test it!

> 🎓 Make sure both the frontend and the backend are running. In the app, add a product: name "Webcam", price 60. Submit.

It appears in the list. Nothing new so far. Now the part that has never worked:

> 🎓 Refresh the page.

Still there! The Webcam came back from the database, because it lives there now. It went through our form, our POST, our service, our repository, into the database, and back again.

> 🎓 Now try the other two. Edit the Headphones' price, save, refresh: the new price stuck. Delete a product, refresh: gone, and gone from the database too. Open `catalog.db` in your SQLite viewer and watch the rows change as you go.

> 🎓 Look under the hood: open the DevTools Network tab and add another product. Two requests appear where you made one: an `OPTIONS` to `api/products` and then your `POST`. That's the preflight: the browser first asks the server for permission, our CORS policy says yes, and the real request follows. More about that in the authentication lessons.

It works! The reads went live last lesson, the writes today, and the app is a full-stack application now.

## 2. A search feature

Now the search box. There's no endpoint for it yet, so we build one, through every layer, the same way we built reading in lesson one: a repository method, a service that uses it, a controller that exposes it, and a piece of UI that calls it. This is what a feature is, and most of the features in your project will have this shape.

```
search box  ->  api module  ->  Controller  ->  Service  ->  Repository  ->  DbContext  ->  database
(the UI)        (the fetch)     (the web)       (the work)   (data access)   (EF)
```

That's the diagram from lesson one with the two frontend stops added on the left. We build it from right to left again: the repository first.

### Adding FindAsync to the repository

So far the repository can read everything (`GetAllAsync`) or one row by id (`GetByIdAsync`). Search is neither: it's "give me the rows that match this". So the repository gets a new method, `FindAsync`, which takes a condition and returns the rows that match it.

> 🎓 In `Repositories/IRepository.cs`, add the `System.Linq.Expressions` using at the top, and a `FindAsync` method below `GetByIdAsync`:

```csharp
using System.Linq.Expressions;
```

```csharp
Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate);
```

> 🎓 In `Repositories/Repository.cs`, add the same using, and the implementation below `GetByIdAsync`:

```csharp
using System.Linq.Expressions;
```

```csharp
public async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate)
    => await _context.Set<T>().Where(predicate).ToListAsync();
```

That `predicate` is a condition: a function that takes one entity and returns true or false, true for the rows you want. `_context.Set<T>().Where(predicate)` keeps the ones that pass, and `ToListAsync` reads them.

Note that the type of the predicate is `Expression<Func<T, bool>>`, not a plain `Func<T, bool>`. A plain function is a black box you can only call. An `Expression` is a function Entity Framework can read, take apart and translate. So EF looks at your condition, turns it into a SQL `WHERE` clause, and the filtering happens in the database. With a plain `Func`, EF couldn't see inside it, so it would have to fetch the entire table into memory and filter in C# afterwards. On three products, nobody would notice. On a real table, that's a disaster.

### The service and the controller

The service is where the decision lives: was a search term given, or not? No term means the plain list. A term means a filtered one.

> 🎓 In `Services/IProductService.cs`, give `GetAllAsync` an optional search parameter:

```csharp
Task<List<ProductDto>> GetAllAsync(string? search = null);
```

> 🎓 In `Services/ProductService.cs`, replace `GetAllAsync` with a version that branches on it:

```csharp
public async Task<List<ProductDto>> GetAllAsync(string? search = null)
{
    var products = string.IsNullOrWhiteSpace(search)
        ? await _products.GetAllAsync()
        : await _products.FindAsync(p => p.Title.ToLower().Contains(search.ToLower()));

    return products.Select(ToDto).ToList();
}
```

When there's no search term, it asks for every product, exactly as before. When there is one, it calls `FindAsync` with a condition: keep the products whose title contains the term. `string.IsNullOrWhiteSpace` handles null, empty and all-spaces in one check, so a blank search box is the same as no search at all.

Notice: both sides are lower-cased. `p.Title.ToLower().Contains(search.ToLower())` matches ignoring case, so a search for `lap` also finds `Laptop`. Without it, the database would compare letter for letter, and `lap` would find nothing.

The controller only has to accept the term from the URL and pass it down.

> 🎓 In `Controllers/ProductsController.cs`, change `GetAll` to take the search term from the query string:

```csharp
[HttpGet]
public async Task<ActionResult<List<ProductDto>>> GetAll([FromQuery] string? search)
    => Ok(await _products.GetAllAsync(search));
```

`[FromQuery]` tells the framework to fill `search` from the query string, the part after the `?` in the URL. So `GET api/products?search=lap` arrives with `search` set to `"lap"`, and `GET api/products` arrives with `search` as `null`, which the service reads as "everything". Remember the REST idea from lesson two? The URL names the resource, the products, and the query string only narrows it down. So you don't build a separate `api/searchProducts` address.

> 🎓 Add a search request to `products.rest`:

```http
### Search products
GET {{baseUrl}}/api/products?search=lap
```

> 🎓 Restart the backend and send it. See? One product comes back, the Fancy Laptop, even though you typed `lap` in lowercase.

Let's trace that request. The controller pulled `lap` out of the query string and passed it to the service. The service saw a real term and called `FindAsync` with a condition. Entity Framework read that condition, turned it into a SQL `WHERE` on the lower-cased title, and SQLite returned the one matching row. The service mapped it to a `ProductDto`, the controller wrapped it in a `200`, and that is what landed in your panel. Every layer did its one job, the same as reading in lesson one, with a filter added along the way.

### Searching from the browser

The endpoint works. Now the box. First the api module has to pass the term along.

> 🎓 In `ClientApp/src/api/products.ts`, change `getAll` to take an optional search term:

```ts
export async function getAll(search?: string): Promise<Product[]> {
  const url = search
    ? `${baseUrl}/api/products?search=${encodeURIComponent(search)}`
    : `${baseUrl}/api/products`;

  const response = await fetch(url);
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse[] = await response.json();
  return raw.map(toProduct);
}
```

When there's a search term, we add it to the URL as `?search=...`, through `encodeURIComponent`. A search for "gaming mouse" has a space in it, and a space (and plenty of other characters) isn't allowed in a URL as it is. `encodeURIComponent` turns it into its safe form (the space becomes `%20`), so the term survives the trip. No term, and we send the plain URL and get everything, exactly as before.

Now the page.

> 🎓 At the top of `ProductsPage`, add the search state and make the fetch depend on it:

```tsx
const [search, setSearch] = useState("");

const {
  data: products,
  loading,
  error,
  setData: setProducts,
} = useFetch(() => productsApi.getAll(search), [search]);
```

That second argument, `[search]`, is the same dependency array we used for the detail page with `[id]`. When a dependency changes, the hook runs its load again. So when `search` changes, the hook fetches again, with the new term, and the list shows the filtered result.

> 🎓 Add the search box to the JSX, just above the list:

```tsx
<input
  type="search"
  placeholder="Search products..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

A controlled input, the same `value` and `onChange` pair as in the product form.

> 🎓 Try it now. It filters! But watch closely, or set the Network tab to "Slow 4G" and watch: every keystroke blanks the whole page to "Loading products..." for a moment, then the list returns. Worse, the search box disappears with the page, so you lose your cursor and can't type the second letter.

The cause is one line. `useFetch` sets `loading` to true at the start of every load, these search reloads included, and the page shows the loading text the moment `loading` is true. That was the right thing to do when there was nothing on screen yet. It's the wrong thing now.

> 🎓 Change the loading guard so it only takes over on the very first load, while there's nothing to show yet:

```tsx
if (loading && products === null) {
  return <p>Loading products...</p>;
}
```

`products` is `null` only until the first response lands. After that it's a list, even an empty one, so `loading && products === null` is true for the first load and false for every reload after it. Now a search reload keeps the current list, and the box, on screen while the new results are on their way. Your cursor never leaves the box.

Note: type `lap` quickly and three requests go out, one per letter, and on a slow connection they can come back in the wrong order. Remember the `ignore` flag we built into the hook in React lesson 6? That's what stops a late answer for `la` from overwriting the answer for `lap`. Searching is where you actually need it. Without this, fast typing on a slow line would leave you staring at the wrong results, now and then, unpredictably.

> 🎓 Try it. Type `lap`: the list narrows to the Fancy Laptop. Clear the box: all products return. Type something with no match, like `zzz`: an empty list, no error. Open the Network tab and watch a request fire on each keystroke, every one a `GET` to `api/products?search=...`.

### One request per keystroke

Firing a request on every keystroke is a bit wasteful. For our handful of products against a server on the same machine, nobody notices. Against a real API, you'd wait until the typing pauses before sending, so `laptop` sends one request instead of six. That trick is called _debouncing_.

We're not adding it today, but now you know the word. If you want to improve your project's search, this is the thing to add.

## The final check

> 🎓 Stop both the frontend and the backend, then go through this list in order:

1. Start the backend, start the frontend, two terminals.
2. Open the app and log in (any name, the doorman has not changed).
3. The products page loads its list from the database.
4. Add a product: it appears, and it survives a refresh.
5. Edit a product's price: saved, and still there after a refresh.
6. Delete a product: gone, also after a refresh.
7. Search for part of a name: the list filters. Clear the box: the full list returns.
8. Stop the backend and reload: an error state, not a blank page. Start it again.

If all eight work, you're done!

## Where this goes next

Every conversation with the server now goes through the api module, and no component knows what a fetch is. Keep it like that in your project.

Two things we leave for the last ASP.NET lesson, on purpose: the three near-identical `catch` blocks, and the form clearing its fields the moment you submit, before it knows whether the save even worked, so a failed save leaves you with an empty form and an error message.

Next lesson the app gets a second table: a product gets a category, the first time a row points at another row. And because the app is connected now, the category also turns up in the browser, in a dropdown on the form.

## Resources

- MDN, "Using the Fetch API". Now also for the request-options half: `method`, `headers`, `body`. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- Microsoft's EF Core docs on querying data, for how a `Where` condition becomes SQL and why the expression matters. https://learn.microsoft.com/ef/core/querying/
- MDN, "encodeURIComponent()". What it escapes and why a raw search term cannot go straight into a URL. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

## Applying this to your project

You can now implement the writes, following the examples from this lesson: `create`, `update` and `remove` in your api module, with a data type for the write shape and a `toRequestBody` next to the mapper, and the three handlers in your page calling them, updating the list from the server's answer, and catching what went wrong into a `saveError` next to the form.

Every module in your case has a list worth filtering or searching. You can follow the examples in this lesson to implement it. Filtering on a field with a fixed set of values (a state, a kind) is similar to search, but with a different `Where`. Get used to building end to end, the way the lesson did.

After you have everything working, look into _debouncing_ your search input.

For the shared entity's writes and its list filter, work closely together with your team.