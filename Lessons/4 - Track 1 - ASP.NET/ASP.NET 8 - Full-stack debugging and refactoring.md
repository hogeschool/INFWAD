# ASP.NET 8: Full-stack debugging and refactoring

Every lesson in this block has ended with the app able to do something it couldn't do at the start. This one doesn't, on purpose. At the end of this lesson, the app has no new features.

If that sounds like a wasted lesson, let me explain. Most of a developer's working life happens inside code that already exists: finding out why it misbehaves, finishing what someone left half done, and cleaning up what got messy. Starting from an empty folder, like we did at the start of each block, is the exception in a real job. Remember the company that threw away two years of work by forty developers? This lesson is practice for the part of the job that would have saved them.

We also have some loose ends to fix, in the form and in how errors reach the user.

Debugging is finding out why behaviour is wrong. Fixing is changing wrong behaviour into right behaviour. Refactoring is changing the structure of the code while the behaviour stays the same. If you do all three at once, a quick cleanup turns into an evening of "what did I touch?". So we do them one at a time, in that order, and we finish by deleting code that shouldn't exist at all.

## What changes this lesson

```
infwad-project/
  Catalog.Api/
    Dtos/
      ProductMapper.cs          (new, the mapping lives here now)
    Services/
      ProductService.cs         (two helpers absorb the repeated checks, mapping moves out)
    products.rest               (an update request for the Headphones)
  ClientApp/
    index.html                  (drops a leftover favicon link)
    src/
      api/
        http.ts                 (errorFromResponse reads the errors object)
      features/products/
        useProducts.ts          (new, the feature's logic lives here)
        ProductsPage.tsx        (slims down to coordination)
        ProductForm.tsx         (clears on success, shows its errors, blocks double-submit)
      App.css                   (deleted, template leftover)
      assets/
        react.svg               (deleted, template leftover)
    public/
      vite.svg                  (deleted, template leftover)
```

Keep the frontend and the backend running for the whole lesson. Start the backend with `dotnet watch` instead of `dotnet run`, so it picks up your changes every time you save a file. If it asks whether it should restart the app, answer `a` (always). Every "let the backend restart" below counts on it.

## 1. Commit first

One new habit before anything else. Everything we do in this lesson changes working code, so when a change goes wrong, you want a working version you can go back to with one command.

> 🎓 Make sure the frontend and the backend are where last lesson left them (both running, the backend under `dotnet watch`, the list loads, search works, a tagged product shows its tags, writes land in the database), then commit everything with a clear message like `Working end of lesson 7`.

Each time we finish a clean step in this lesson, it's a good moment to commit again. Nothing you delete or change is ever really gone, as long as you keep committing.

## 2. Debugging across the stack

Since the app became full-stack, a bug can be anywhere: a component, a hook, an api module, the request itself, CORS, a controller, a service, a repository, Entity Framework, the database file. And the frontend and the backend can't read each other's code. Reading code until you spot the bug doesn't work anymore. We need a method.

### The tools

Ok, first the tools. You already have all of them.

- The browser console (F12). Every uncaught error, every `console.log`, every complaint the page has about your code.
- The Network tab, next to the console. Every request the page sends and every response it gets, with status, headers, and bodies, exactly as they were sent.
- The backend terminal. The request logging, and the `fail:` lines our `GlobalExceptionHandler` writes when something goes wrong.
- The `.rest` file. It talks to the API directly, without the frontend, which is what you want when you need to know whether the frontend or the backend is wrong.
- Your SQLite viewer. What's really in the database. When everything above disagrees, the row in the table decides.
- The compilers and the linter. The only tools that complain before the code even runs. Red squiggles are the cheapest bugs you'll ever fix.

(There's one more tool, the real debugger with breakpoints and variable inspection, and VS Code has a good one for both the frontend and the backend. We don't need it in this lesson, but it's worth learning on your own. Link at the bottom.)

### The method

When something looks wrong on the screen, the first thing most people do is look at the code closest to the symptom. Go to the boundary first instead.

Open the Network tab, find the request that matters, and read what was actually sent and what came back. Whatever either program thinks, that's what happened.

That one look splits the problem in half:

```
          symptom on the screen
                   |
     Network tab: find the request,
      read what was sent and what
             came back
                   |
        is the response correct?
         /                    \
       yes                    no
        |                      |
   the frontend            the backend
   owns the bug            owns the bug
        |                      |
   walk up from the       replay it from the
   api module: mapper,    .rest file, then walk
   hook, props, render    down the layers:
                          controller, service,
                          repository, database
```

If the response is wrong, replay the same request from your `.rest` file. The same wrong answer without the browser means the backend owns it. Then go down through the layers, one at a time. This is where the layered architecture helps in a new way: the controller is four lines, the service method is short, the repository is generic and shared, and the database can simply be opened and read. Each layer is small enough to check in a minute, so a bug that could be anywhere has to be in one of four small places.

If the response is right and the screen still shows nonsense, the backend is innocent and you go up instead: the mapper in the api module, the state in the hook, the props, the render.

Let's try it on four bugs.

### A wrong URL

We plant the bugs ourselves, so we know the answer while we practise. The first two are quick, and easy to notice.

> 🎓 In `ClientApp/src/api/products.ts`, in `getAll`, change the plain path from `/api/products` to `/api/product` (drop the `s`). Save, and let the page reload.

The list is gone, and in its place: "Request failed with status 404". Now use the method instead of guessing.

> 🎓 Open the Network tab and reload the page. There is your request, in red: a `GET` to `/api/product`, status `404`.

A `404` means the server looked for that address and found nothing there. And the URL, read back, is simply wrong. So the problem is in how the request was built, on the frontend, in the api module. We didn't have to open a single backend file.

> 🎓 Restore the `s`. The list comes back.

### The test bomb

> 🎓 Now break the backend. Put the test bomb back in: `throw new Exception("KABOOOOOM!");` as the first line of `GetAllAsync` in `Catalog.Api/Services/ProductService.cs`. Let the backend restart, reload the app, and open the failed request in the Network tab.

For the user, it looks the same as the last bug: no list, and an error message. The Network tab shows something else. The `GET api/products` request is there, and this time it's a `500`, with the boring `{ "title": "An unexpected error occurred" }` body. A `500` means the request arrived fine and the server crashed while answering it, so the backend owns this one. Let's check it without the frontend anyway, for practice:

> 🎓 Open `products.rest` and send the get-all request.

Same `500`, and no browser involved. The backend terminal has the rest of the story: a `fail:` line from `Catalog.Api.GlobalExceptionHandler`, the `KABOOOOOM!` message, and a stack trace pointing at the exact line. The details go to your log, and the frontend only gets the boring message.

> 🎓 Take the bomb out again and let the backend restart. The list returns.

### A renamed property

Those two were easy to notice: a red request, an error on the page. A bug that makes no noise is worse.

A teammate looks at the backend and decides `Title` is a silly name. The frontend says `name` everywhere, the customer says name, so let's make the API match. A two-minute improvement. What could go wrong?

> 🎓 Play the teammate. In `Catalog.Api/Dtos/ProductDtos.cs`, rename the `Title` property of `ProductDto` to `Name` (only that record, leave the create and update DTOs alone). Then in `Services/ProductService.cs`, in the `ToDto` method at the bottom, change `Title = product.Title` to `Name = product.Title`. The backend compiles without complaining. Let it restart.

> 🎓 Now reload the products page and look at it.

Cards, prices, working buttons, and not a single product name. Check the usual places: the browser console is clean, the backend terminal is calm, and in the Network tab the products request is a green `200`. Two compilers approved this code and every status code says it worked. Nothing in the chain considers this an error, except you.

So, boundary first.

> 🎓 In the Network tab, click the `products` request and open its Response tab.

There is the problem:

```json
[
  { "id": 1, "name": "Laptop", "price": 1200, ...
```

The server now says `name`. Our `toProduct` mapper in `api/products.ts` still reads `raw.title`, and in JavaScript, reading a property that doesn't exist is not an error. It's `undefined`. So every product got `name: undefined`, and React renders `undefined` as nothing at all.

"Hang on," you say. "The whole point of TypeScript was catching this. `ProductResponse` says there's a `title`. Why didn't it complain?"

Because `ProductResponse` is a claim, not a check. TypeScript has never read a line of your C#. When we wrote that type, we described what the server sends, and TypeScript has trusted that description ever since. It can only check that the frontend agrees with itself. (Tools exist that generate the TypeScript types from the running API, so a machine keeps them in sync instead. We write ours by hand so you know what those tools do for you.)

So the fix is a conversation with your team, not just a code edit. `ProductDto` is a contract, and the frontend was built against it. Renaming a property in a contract is a _breaking change_: either both sides change in the same commit, on purpose, or neither side changes.

> 🎓 Revert both edits: `Name` back to `Title` in the DTO, and `Title = product.Title` back in `ToDto`. Reload the app. The names are back.

When data goes quietly wrong at the boundary in your project (blank fields, missing pieces, everything `200` and nothing on screen), open `ProductDtos.cs` and `api/products.ts` side by side and compare the DTO with the response type.

### A price that doesn't change

The last bug is the hardest to find. Plant it:

> 🎓 In `Services/ProductService.cs`, in `UpdateAsync`, delete this one line, then let the backend restart:

```csharp
product.Price = dto.Price;
```

(In real life, a line like this goes missing in a bad merge, or in a late-night edit.)

> 🎓 In the app, edit the Headphones. Change the price from 150 to 135 and save.

No error, no complaint, and the list shows the Headphones at... 150. Try it again, more carefully this time. Saved, and 150. Change the name while you're at it: the new name sticks. The edit works, except the price doesn't change, and every part of the system says it worked.

Same method: the Network tab first.

> 🎓 Do the edit again with the Network tab open. Click the `PUT` request. Look at its Payload tab (Chrome calls it Payload, Firefox calls it Request), then at its Response tab.

The payload says `"price": 135`. So the frontend did its whole job: the form collected the right number and the api module sent it. The response, though, says `"price": 150`. The backend owns this one, and we found that out without reading a single line of code.

Let's check it without the browser.

> 🎓 Add this request to `Catalog.Api/products.rest` and send it. A `PUT` replaces the whole product, so the body carries the title, the category and the tags as well. (Use your own id if your Headphones aren't number 3.)

```http
### Update the headphones
PUT {{baseUrl}}/api/products/3
Content-Type: application/json

{
  "title": "Headphones",
  "price": 135,
  "categoryId": 2,
  "tagIds": [4]
}
```

Same wrong answer, without the frontend. Now go down through the layers. The controller's `Update` is four lines that pass the DTO through, nothing there to break. One layer down, in `ProductService.UpdateAsync`, there it is: the title is copied from the DTO, the category is set, the tags are set, and the price is never mentioned. The entity keeps its old price, `SaveChangesAsync` faithfully saves no change, and `ToDto` sends the unchanged product back.

> 🎓 Put the line back, let the backend restart, and edit the price again. 135, and still 135 after a refresh.

### Common symptoms

Some symptoms you'll probably meet in your project, and the first place to look:

- One field renders blank while its neighbours are fine. The boundary types have drifted. Diff the DTO against the response type, and check the Network tab for what the server really calls the field.
- An edit saves without error but one field never changes. The update mapping in the service forgot that field.
- "Failed to fetch", instantly, on everything. No request reached the backend at all: the backend is down, or the URL is wrong, so check the terminal and your `.env`.
- A red CORS error in the console. The CORS origin in the backend: exact string, right port, no trailing slash.
- "Unexpected end of JSON input". You parsed a body that's not there, usually `response.json()` on the `204 No Content` answer to a delete.
- A `400` with a tidy JSON body. Not a bug at all: your own validation refusing bad input. Read the body, it names the field.
- A `500`. The full story is in the backend terminal, in the `fail:` line. The message for the frontend is vague on purpose.
- It worked yesterday and no code changed. Then something that's not code changed: the `.env`, `appsettings.json`, the database file, the port.

## 3. Fixing the loose ends

Now the fixing. Everything in this section changes behaviour on purpose. The loose ends are all in the form and its saves, and each fix is small.

### Handlers that report back

Start with the worst one. The moment you press Add, the form clears all three fields, before it knows whether the save worked. Submit a product the server refuses, and the error message appears next to an empty form, so you have to type everything again. We've all used software that does this. Let's not write any.

The form needs to know how the save went. "Can't the form just put a `try` and `catch` around its own submit?" No, because the form doesn't do the saving. The page does, in its handlers, and the page also owns `saveError` and shows it.

The page's handlers already know exactly how each save went. They just don't tell anyone. So each handler returns a `Promise<boolean>` (true for saved, false for failed), and the form waits for that verdict and clears only on true. (Our `DeleteAsync` in the backend does the same thing: it returns a `bool`, because its controller has a decision to make.)

> 🎓 In `ClientApp/src/features/products/ProductsPage.tsx`, give the three handlers a verdict. Each one gains a return type of `Promise<boolean>`, a `return true` at the end of the `try`, and a `return false` at the end of the `catch`. Here's `addProduct`:

```tsx
async function addProduct(data: ProductData): Promise<boolean> {
  try {
    const created = await productsApi.create(data);
    setProducts([...(products ?? []), created]);
    setSaveError(null);
    return true;
  } catch (err) {
    setSaveError(
      err instanceof Error ? err.message : "Could not save the product.",
    );
    return false;
  }
}
```

> 🎓 Give `updateProduct` and `deleteProduct` the same two lines. Nothing else in them changes yet.

(Yes, this makes the three handlers even more alike. Leave it for now. We clean that up in the refactoring section.)

### Rewriting the form

The other loose ends are all in `ProductForm.tsx`: the `if` that refuses without a message, the category dropdown that can fail silently, and the clearing that has to wait for the verdict. That waiting creates one new problem: the fields stay filled until the save has answered, so a double click would save the product twice. We disable the button while a save is running. First the pieces that change, then the whole file to compare against.

First, the props: `onAdd` and `onUpdate` now return the verdict.

> 🎓 Change the props type in `ProductForm.tsx`:

```tsx
type ProductFormProps = {
  editingProduct: Product | null;
  onAdd: (data: ProductData) => Promise<boolean>;
  onUpdate: (id: number, data: ProductData) => Promise<boolean>;
  onCancel: () => void;
};
```

Then two new pieces of state and one new piece of the categories fetch.

> 🎓 Just below the existing state (`name`, `price`, `categoryId`), add:

```tsx
const [formError, setFormError] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
```

> 🎓 And where the form fetches its categories, pull out the error too. Change the destructure to:

```tsx
const { data: categories, error: categoriesError } = useFetch(
  categoriesApi.getAll,
  [],
);
```

Now `handleSubmit`. It becomes `async` so it can wait for the verdict, it shows a message when the `if` refuses, and it only clears the fields when the save worked.

> 🎓 Replace `handleSubmit` with this:

```tsx
async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  if (name.trim() === "" || price <= 0 || categoryId === 0) {
    setFormError("A product needs a name, a price above zero, and a category.");
    return;
  }
  setFormError(null);

  const data: ProductData = {
    name,
    price,
    categoryId,
    tagIds: editingProduct?.tags.map((tag) => tag.id) ?? [],
  };

  setSaving(true);
  const saved = editingProduct
    ? await onUpdate(editingProduct.id, data)
    : await onAdd(data);
  setSaving(false);

  if (saved) {
    setName("");
    setPrice(0);
    setCategoryId(0);
  }
}
```

Last, three small additions to the JSX:

> 🎓 After the `</select>`, add a line for the dropdown's error:

```tsx
{categoriesError && <p>Could not load the categories.</p>}
```

> 🎓 Change the submit button so it disables and renames itself while saving, and add the `formError` message under the buttons:

```tsx
<button type="submit" disabled={saving}>
  {saving ? "Saving..." : editingProduct ? "Save" : "Add"}
</button>
```

```tsx
{formError && <p>{formError}</p>}
```

About the new stuff:

- `formError` holds one plain sentence when the `if` refuses, and is cleared again the moment a submit gets past it. (The server has more rules than these three, like the title length and the price range, and we're not copying them all into the form. Copy the rules that catch honest mistakes. The server always checks anyway.)
- `saving` is true while we wait for the save and false after, and the button is disabled in between, with its label switched to "Saving..." so the user knows why. On localhost that takes a few milliseconds and you'll never see it. On a real connection it's long enough for a nervous user to click three times and create three products. (Every payment form that greys out its Pay button does exactly this.)
- `if (saved)` now wraps the field resets, so a failed save leaves your input alone, and you fix one field instead of typing all three again.
- `categoriesError` is the `error` from the `useFetch` call that loads the categories, so the dropdown shows a sentence when it fails, instead of an empty list.

> 🎓 Compare your whole `ProductForm.tsx` against this final version:

```tsx
import { useState } from "react";
import type { SubmitEvent } from "react";
import type { Product } from "../../types/Product";
import type { ProductData } from "../../api/products";
import * as categoriesApi from "../../api/categories";
import { useFetch } from "../../hooks/useFetch";

type ProductFormProps = {
  editingProduct: Product | null;
  onAdd: (data: ProductData) => Promise<boolean>;
  onUpdate: (id: number, data: ProductData) => Promise<boolean>;
  onCancel: () => void;
};

export function ProductForm({
  editingProduct,
  onAdd,
  onUpdate,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(editingProduct?.name ?? "");
  const [price, setPrice] = useState(editingProduct?.price ?? 0);
  const [categoryId, setCategoryId] = useState(
    editingProduct?.category.id ?? 0,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { data: categories, error: categoriesError } = useFetch(
    categoriesApi.getAll,
    [],
  );

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (name.trim() === "" || price <= 0 || categoryId === 0) {
      setFormError(
        "A product needs a name, a price above zero, and a category.",
      );
      return;
    }
    setFormError(null);

    const data: ProductData = {
      name,
      price,
      categoryId,
      tagIds: editingProduct?.tags.map((tag) => tag.id) ?? [],
    };

    setSaving(true);
    const saved = editingProduct
      ? await onUpdate(editingProduct.id, data)
      : await onAdd(data);
    setSaving(false);

    if (saved) {
      setName("");
      setPrice(0);
      setCategoryId(0);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editingProduct ? "Edit product" : "Add product"}</h2>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="number"
        value={price}
        onChange={(event) => setPrice(Number(event.target.value))}
      />
      <select
        value={categoryId}
        onChange={(event) => setCategoryId(Number(event.target.value))}
      >
        <option value={0}>Choose a category</option>
        {(categories ?? []).map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {categoriesError && <p>Could not load the categories.</p>}
      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : editingProduct ? "Save" : "Add"}
      </button>
      {editingProduct && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
      {formError && <p>{formError}</p>}
    </form>
  );
}
```

> 🎓 Try it. Submit the empty form: a message, and it stays. Fill in a name and a price but no category: the same message. Now the real one: fill everything in correctly, stop your backend (Ctrl+C), submit, and read the save error while noticing your input is still sitting there. Start the backend again, submit again. Saved!

### The validation messages

One loose end left, in `errorFromResponse`.

> 🎓 Add a product named "Quantum mainframe" with a price of 2000000 and a category. Submit.

The form's `if` lets it pass, since it only checks for a price above zero. The server doesn't: `[Range(0.01, 1000000)]` refuses it. But look at the message next to the form:

```
One or more validation errors occurred.
```

Which errors? On which field? The server actually told us. A validation `400` carries the full problem details body, including an `errors` object with the messages for each field. Our `errorFromResponse` only reads the `title`, and for validation errors the title is that generic sentence.

> 🎓 In `api/http.ts`, change `errorFromResponse` so it checks for `errors` first:

```ts
export async function errorFromResponse(response: Response): Promise<Error> {
  try {
    const problem: { title?: string; errors?: Record<string, string[]> } =
      await response.json();
    if (problem.errors) {
      return new Error(Object.values(problem.errors).flat().join(" "));
    }
    if (problem.title) {
      return new Error(problem.title);
    }
  } catch {
    // The body was not JSON. The generic message below will do.
  }
  return new Error(`Request failed with status ${response.status}`);
}
```

Two new bits of TypeScript in there. `Record<string, string[]>` means "an object whose keys are strings (the field names) and whose values are arrays of strings (the messages for that field)", which is the shape of the `errors` object. And `Object.values(...)` collects those arrays into an array of arrays, `.flat()` turns that into one flat list of messages, and `.join(" ")` turns the list into a sentence. Without an `errors` object it works as before: the title if there is one, the status code if not.

> 🎓 Submit the two million euro mainframe again.

```
The field Price must be between 0.01 and 1000000.
```

The server's own message, from the `[Range]` annotation, shown to the user. And your input is still in the form, so you can lower the price and submit again.

## 4. Refactoring

The app now behaves the way we want, so it's time to refactor: change the structure, keep the behaviour. This time on both the frontend and the backend.

Some rules before we touch anything:

1. Start from working code, so you can tell "still works" from "broke it". We just tested everything, so we're good.
2. Small steps, and verify after every one. Ten small refactors with ten checks are faster than one big one with a mystery at the end.
3. Never mix a refactor with a fix or a feature. You check a refactor by seeing that the app behaves exactly the same, and that check is useless if you also changed behaviour on purpose. So they go in separate commits.

### The feature hook

> 🎓 Open `ClientApp/src/features/products/ProductsPage.tsx` and read the three handlers we just changed: `addProduct`, `updateProduct`, `deleteProduct`.

They're all the same, with different words in the middle: try the thing, update the list, clear the error, return true. Catch, turn the error into a message, return false. What differs is which api call, which state update, and which fallback text. The same logic in three places is a code smell.

Now look at the whole file. `ProductsPage` fetches data, owns the save logic and its error, owns the search term, tracks which product is being edited, and renders the page. Remember the code smell checklist? Each component should have one job you can state in one sentence, and if the sentence needs an "and", something should move out. Ours needs several.

The split is between logic and presentation. Everything about products and the server (the fetch, the list state, the saves, the save error, the search term) is one job. Showing a page is another. You already know the tool for moving logic with state out of a component: a custom hook, like `useFetch` and `useAuth`. This one is `useProducts`, and it lives in the feature's own folder, because it belongs to the products feature, unlike the general `useFetch`.

We do two things at once: replace the three handlers' shared code with one `runSave` helper, and move all that logic out of the page and into the hook. (In your own code those might be two separate commits. Here they land in one new file, so we make both changes and test once.)

> 🎓 Create `features/products/useProducts.ts`:

```ts
import { useState } from "react";
import type { ProductData } from "../../api/products";
import * as productsApi from "../../api/products";
import { useFetch } from "../../hooks/useFetch";

export function useProducts() {
  const [search, setSearch] = useState("");
  const {
    data: products,
    loading,
    error,
    setData: setProducts,
  } = useFetch(() => productsApi.getAll(search), [search]);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function runSave(
    action: () => Promise<void>,
    fallback: string,
  ): Promise<boolean> {
    try {
      await action();
      setSaveError(null);
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : fallback);
      return false;
    }
  }

  function addProduct(data: ProductData) {
    return runSave(async () => {
      const created = await productsApi.create(data);
      setProducts([...(products ?? []), created]);
    }, "Could not save the product.");
  }

  function updateProduct(id: number, data: ProductData) {
    return runSave(async () => {
      const updated = await productsApi.update(id, data);
      setProducts(
        (products ?? []).map((p) => (p.id === updated.id ? updated : p)),
      );
    }, "Could not save the product.");
  }

  function deleteProduct(id: number) {
    return runSave(async () => {
      await productsApi.remove(id);
      setProducts((products ?? []).filter((p) => p.id !== id));
    }, "Could not delete the product.");
  }

  return {
    products,
    loading,
    error,
    saveError,
    search,
    setSearch,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
```

It works like this:

- `search` moved in too, because the search term decides which products the feature has, so it's feature state.
- `runSave` does the shared part once: the `try`, the error handling, the verdict.
- `action` is a small async function with only what's different about each save. If the api call inside it throws, the rest of the action never runs, so the state update after a failed call is skipped, just like before.

Now the page, which becomes almost entirely markup.

> 🎓 Rewrite `features/products/ProductsPage.tsx`:

```tsx
import { useState } from "react";
import type { Product } from "../../types/Product";
import type { ProductData } from "../../api/products";
import { useProducts } from "./useProducts";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";

export function ProductsPage() {
  const {
    products,
    loading,
    error,
    saveError,
    search,
    setSearch,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  async function saveEdit(id: number, data: ProductData) {
    const saved = await updateProduct(id, data);
    if (saved) {
      setEditingProduct(null);
    }
    return saved;
  }

  if (loading && products === null) {
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
        onUpdate={saveEdit}
        onCancel={() => setEditingProduct(null)}
      />
      {saveError && <p>{saveError}</p>}
      <input
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ProductList
        products={products ?? []}
        onEdit={setEditingProduct}
        onDelete={deleteProduct}
      />
    </div>
  );
}
```

The hook now holds everything the feature knows: where products come from, how each save works, what to say when one fails, and the search term. The page holds what the feature shows: which components, in what order, wired to which actions. Both files fit on one screen.

We made two choices in the split that you'll have to make in your own code as well:

- `editingProduct` stayed in the page. It's about what this page is showing (the form in edit mode, for one product), not about products. But `updateProduct` used to clear the editing state itself, and the hook can't do that, because it doesn't know about editing. So the page wraps the hook's `updateProduct` in a small `saveEdit` that waits for the verdict and clears the editing state when the save worked.

- `startEditing` and `cancelEdit` are gone. Each was one call to `setEditingProduct`, so the page now hands `setEditingProduct` to the list directly, and gives the form `() => setEditingProduct(null)`.

Now put the frontend and the backend side by side:

```
Catalog.Api                          ClientApp
Controller    handles HTTP,          Component     renders, handles
              stays thin                           events, stays thin
Service       the feature's          useProducts   the feature's
              logic and rules                      logic and state
Repository    talks to the           api module    talks to the
              database                             server
```

The frontend now has the same architecture as the backend, built one layer at a time. When your project's frontend starts to feel messy, this is the picture to clean it up toward.

> 🎓 Test the app end to end once more, and run `npm run lint` in `ClientApp`. Everything works the same, and no unused leftovers? Great! Time to commit again.

### The repeated checks in the service

> 🎓 Now the backend. Open `Catalog.Api/Services/ProductService.cs` and put `CreateAsync` and `UpdateAsync` next to each other.

Both start with the same two checks. The category check first:

```csharp
var category = await _categories.GetByIdAsync(dto.CategoryId);
if (category is null)
    throw new BadRequestException($"There is no category with id {dto.CategoryId}");
```

And right below it, the tag check, also the same in both:

```csharp
var tags = await _tags.FindAsync(t => dto.TagIds.Contains(t.Id));
if (tags.Count != dto.TagIds.Count)
    throw new BadRequestException("One or more tag ids do not exist");
```

Two rules, each written twice. This kind of duplication is dangerous: the day a rule changes (a better message, an extra condition), someone will change one copy and forget the other, and the API will apply two slightly different rules depending on which endpoint you call. So each rule gets its own method.

> 🎓 In `ProductService.cs`, add two private helpers at the bottom of the class:

```csharp
private async Task<Category> GetRequiredCategoryAsync(int categoryId)
{
    var category = await _categories.GetByIdAsync(categoryId);
    if (category is null)
        throw new BadRequestException($"There is no category with id {categoryId}");
    return category;
}

private async Task<List<Tag>> GetRequiredTagsAsync(List<int> tagIds)
{
    var tags = await _tags.FindAsync(tag => tagIds.Contains(tag.Id));
    if (tags.Count != tagIds.Count)
        throw new BadRequestException("One or more tag ids do not exist");
    return tags;
}
```

> 🎓 Then replace the two checks in both `CreateAsync` and `UpdateAsync` with the helper calls, so the methods read:

```csharp
public async Task<ProductDto> CreateAsync(CreateProductDto dto)
{
    var category = await GetRequiredCategoryAsync(dto.CategoryId);
    var tags = await GetRequiredTagsAsync(dto.TagIds);

    var product = new Product
    {
        Title = dto.Title,
        Price = dto.Price,
        Category = category,
        Tags = tags
    };

    _products.Add(product);
    await _products.SaveChangesAsync();
    return ToDto(product);
}

public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
{
    var product = await _products.GetByIdAsync(id, p => p.Tags);
    if (product is null) return null;

    var category = await GetRequiredCategoryAsync(dto.CategoryId);
    var tags = await GetRequiredTagsAsync(dto.TagIds);

    product.Title = dto.Title;
    product.Price = dto.Price;
    product.Category = category;
    product.Tags = tags;

    await _products.SaveChangesAsync();
    return ToDto(product);
}
```

Note the names. "Required" says these methods always return what they looked for, or throw. The framework's own `GetRequiredService` (in `SeedData`) uses the same idea. Each public method now reads like a summary of itself: fetch what the rules require, build or change, save, map, return.

> 🎓 Send the `.rest` checks: get all, get one, create a tagged one, update one, the bad-category one for its `400`, and a create with a made-up tag id for its `400`. Same answers as before? Great!

### Moving the mapping out

`ProductService` is the biggest file in the backend, and the part that got bigger fastest is not logic at all. `ToDto` started as three lines of copying. Now it builds a `CategoryDto`, maps a list of tags, and copies the rest, in the middle of a class whose job is business rules. Mapping is a separate job, so it gets its own file.

> 🎓 Create `Dtos/ProductMapper.cs`:

```csharp
using Catalog.Api.Models;

namespace Catalog.Api.Dtos;

public static class ProductMapper
{
    public static ProductDto ToDto(Product product) => new()
    {
        Id = product.Id,
        Title = product.Title,
        Price = product.Price,
        Category = new CategoryDto
        {
            Id = product.Category.Id,
            Name = product.Category.Name
        },
        Tags = product.Tags
            .Select(tag => new TagDto { Id = tag.Id, Name = tag.Name })
            .ToList()
    };
}
```

> 🎓 In `ProductService.cs`, delete the private `ToDto` method and change every use of `ToDto` to `ProductMapper.ToDto`. There are four of them: the `.Select(ToDto)` in `GetAllAsync` becomes `.Select(ProductMapper.ToDto)`, and the three single calls in `GetByIdAsync`, `CreateAsync`, and `UpdateAsync` each gain the `ProductMapper.` prefix.

> 🎓 Send the same `.rest` checks once more. Same answers? Then compare your whole `ProductService` against last lesson's version plus today's four edits (the two helpers, the helper calls in create and update, the four mapping calls, and the deleted `ToDto`).

### Knowing when to stop

One duplication stays, on purpose.

The `err instanceof Error ? err.message : fallback` check is now in two places: `useFetch` and `runSave`. It could become a shared helper, but not yet. There's a rule of thumb for this, the _rule of three_: the first time you write something, you just write it. The second time, you notice it. The third time, you extract it. Two copies don't show you the pattern's real shape yet, and a helper extracted too early tends to get extra parameters and special cases as soon as the next use is a bit different. If a third copy ever appears, move it then, into `api/http.ts` next to `errorFromResponse`.

We didn't wait for a third copy with the two checks in `ProductService`, because those are rules about the data, and two copies of a rule can start to give different answers. The `instanceof` check only reads an error message, so it can wait.

## 5. Removing dead code

The last kind of work is the easiest: deleting code that doesn't do anything anymore. Every line in a file is a line the next reader (usually you) has to understand before they know what the file does, and dead code describes behaviour the app doesn't have. Unused imports, functions nobody calls, whole files nothing points to, and big blocks of commented-out code kept "in case we need it later".

Let's clean up ours.

### Files nothing imports

The linter and the compiler catch unused variables and imports inside a file. What they cannot catch is a whole file that nothing imports, because a file that's not part of the program gives no errors. Those you find with search.

You'll see `App.css` sitting in `src`, next to `index.css`. It looks like it belongs.

> 🎓 In VS Code, search the whole of `ClientApp` for the string `App.css` (the search panel, not Ctrl+F, so it looks across every file).

Nothing comes back. Not one import, anywhere. It came with the Vite template, `App.tsx` stopped importing it when we rebuilt that file in the React block, and it has been dead ever since. Two more files came from the same template: `src/assets/react.svg` and `public/vite.svg`, the logos from the demo page.

> 🎓 Search for `react.svg` and `vite.svg` the same way.

`react.svg`: nothing. `vite.svg`: one hit, and not in any component, where you'd look first. It's in `index.html`, on the `<link rel="icon" ...>` line that points the browser tab's icon at the template's logo. That's why you search instead of look: this reference was never an import.

> 🎓 In `ClientApp/index.html`, remove the favicon line:

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

> 🎓 Then delete all three files, and reload the app: unchanged, apart from the tab icon falling back to the browser's default. (`index.css` stays! Search for it and `main.tsx` turns up, importing it.)

### A method nobody calls

Now one that needs some thinking.

> 🎓 In `Catalog.Api`, open `Repositories/IRepository.cs`, right-click `Update`, and choose Find All References (Shift+F12).

The interface declares it, `Repository.cs` implements it, and nobody calls it. Not one of the three services. Dead, surely? Delete it?

First ask why nothing calls it. Our services fetch an entity through the repository, Entity Framework starts tracking it, the service changes its properties, and `SaveChangesAsync` saves whatever tracked entities changed. Updating never needed an `Update` call. The method is there for a case we haven't met yet: an entity Entity Framework isn't tracking, built by hand instead of fetched.

So unused code comes in two kinds: unused and forgotten, or unused on purpose. The test is one question: can anyone on the team say why it exists? For `Update` the answer is one sentence, so it stays. (In your own project, write that sentence as a short comment above the method.) For `App.css` nobody could answer, so it went. When your search finds something unused, ask the question before you delete it, and ask a teammate before deleting something you didn't write.

"But what if we need it later?" That's what people say about commented-out code. You have version control. Git remembers every line you've ever committed and will give any of it back. Deleting code doesn't destroy it. Commented-out code clutters the file, and it gets out of date with the code around it, until the day someone uncomments it and gets a surprise. Delete it. All of it.

## The final check

> 🎓 Stop both the frontend and the backend, then go through this list in order:

1. Start the backend, start the frontend, two terminals.
2. Log in (any name, the doorman has not changed).
3. The products page loads its products from the database.
4. Submit the form empty: a visible message, and nothing gets cleared.
5. Add a product properly: it appears, and survives a refresh.
6. Add one with a price of 2000000: the server's own field message appears, and your input survives.
7. In the Network tab, set throttling to "Slow 4G" and double-click Add as fast as you can: still only one new product. Set throttling back to "No throttling".
8. Edit a price: saved, the form leaves edit mode, and the product's tags survive.
9. Delete a product: gone, also after a refresh.
10. Search for part of a name: the list filters, and the search box keeps your cursor while it does.
11. Stop the backend and reload: the error state. Submit a product while it's still down: a save error, input intact. Start it again.
12. `npm run lint` in `ClientApp`: clean. Open `ProductsPage.tsx` and `ProductService.cs`: each fits on roughly one screen, and you can state each file's job in one sentence without an "and".

If steps three to eleven work like the end of last lesson plus the fixes from section three, the refactoring changed only the structure. Close the lesson the way it started: commit.

## Where this goes next

We started this lesson with an app that works, and we end it with an app you could hand over to a teammate, or to yourself in three months.

Next lesson we start on real authentication, on the backend: passwords that are actually checked (and properly hashed), tokens that cannot be faked by typing in the console, and endpoints that refuse strangers.

## Resources

- Chrome DevTools, "Inspect network activity". The Network tab in full: filtering, payloads, timing. https://developer.chrome.com/docs/devtools/network
- Martin Fowler's refactoring catalog. The vocabulary of refactoring: small named moves, each with its mechanics. Today's extractions are in there under their official names. https://refactoring.com/catalog/
- VS Code, "Debugging". Breakpoints, stepping, and variable inspection, the tool we skipped today, for both C# and browser JavaScript. https://code.visualstudio.com/docs/debugging

## Applying this to your project

Commit first. Then do what this lesson did, on your own module: fixing, refactoring and deleting, in that order, in separate commits.

Your forms probably have the loose ends the demo had: handlers that don't report back, a form that clears before the save has answered, an `if` that refuses in silence, and a dropdown that fails without a word. Fix them on every form in your module, and once a form waits for the answer, disable its button while the save is running. `errorFromResponse` reading the `errors` object is team code, one edit in `api/http.ts`, done together.

Every module gets a feature hook (`features/<module>/use<Things>.ts`), and its page keeps only what it shows. Your service gets a `GetRequired...Async` for every reference check that appears twice, and a mapper file in `Dtos/` when the mapping gets big. Check the result with step 12 of the final check, on your own files.

Then search for dead code: the Vite leftovers, any JSON mock files that are still there, static HTML from the fundamentals weeks that nothing uses anymore, the imports the linter underlines, and all commented-out code.

Then review a teammate's module with the code smell checklist, and have them review yours.