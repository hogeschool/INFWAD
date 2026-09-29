# React 3: State, events, and refactoring

We now have a page with a hardcoded array, a list rendering it, a card showing one item, data handed down from parent to child. Good starting point, but when you look at it in the browser, it's pretty boring. Nothing on the screen does anything, because nothing in the code can change while the app runs. I promised two things would fix that. Memory, so a component can hold a value and change it. And a way for a child to talk back up to its parent. That is state and events, the subject of this lesson.

Making the tree more dynamic is only half the work. The other half is what happens right after. Code that can change things has a habit of growing, and code that grows without care turns into a dark forest you get lost in. So we always do both. Make things come alive, let them grow a little, then learn to clean things up without breaking what works. Build a little, then refactor.

## State: giving a component memory

Here is the top of ProductsPage from last lesson:

```tsx
const products: Product[] = [
  { id: 1, name: "Laptop", price: 1200 },
  { id: 2, name: "Phone", price: 800 },
  { id: 3, name: "Headphones", price: 150 },
];
```

That array is a plain `const`. It is fixed the moment the file loads, and the only way to change it is to edit the source. To change it while the app is running, the page needs memory, a value it can hold onto and change between renders. React gives a component memory with `useState`.

> 🎓 In `ProductsPage.tsx`, swap the plain array for `useState`:

```tsx
import { useState } from "react";

const [products, setProducts] = useState<Product[]>([
  { id: 1, name: "Laptop", price: 1200 },
  { id: 2, name: "Phone", price: 800 },
  { id: 3, name: "Headphones", price: 150 },
]);
```

Let's go over that example, because most of this is probably new for you.

- `const [products, setProducts] = `

  useState returns an array with pre-defined length and types (which is called a **tuple**). It will have
  the current value and a function to change it, and we destructure them into `products` and `setProducts`. The naming pattern (a value and a `setWhatever` for it) is important.

  You will _read_ `products` like any variable, but you _change_ it only by calling `setProducts`. Calling the setter does two things: it stores the new value, and it tells React to run this component again so the screen is updated with the change.

- `[{ id: 1, name: "Laptop", price: 1200 }, etc... }]`

  The argument you pass to useState (the array of three products here) is the initial value, used only on the first render and ignored after that.

- `<Product[]>`

  What are those angle brackets (`<` and `>`)? Well, useState is a generic function. It must work for state of any type, a number, a string, an object, an array, and the part in angle brackets tells it which type this particular state holds. `useState<Product[]>` says the state is an array of `Product`, so TypeScript knows `products` is a `Product[]` and that `setProducts` will only accept a `Product[]`. Hand it the wrong type by mistake and TypeScript will warn you before the code runs.

  The name for this is a **generic**: a function or a type, that takes a type as an argument, the way an ordinary function takes a value. You will see the angle brackets on other things through the course.

> 🎓 Save the code in your editor and look at the browser. Nothing is different. Same three cards. That's expected, all we changed is how the array is stored, from a frozen `const` into state the page is allowed to change. Nothing changes it yet. For that we need events, which is the next section. But one worry first, because it's the obvious one.

### Virtual DOM

"Wait, when talking about using the setter, you said calling it runs the component again. Runs the whole function, top to bottom, and redraws the page? Every single time anything changes? That has to be slow."

It would be, if React redrew the real page every time. It does not. When your component runs, it does not touch the actual page directly. It returns a lightweight description of what the page should look like, a plain tree of objects that React keeps in memory. People call it the virtual DOM. When state changes and the component runs again, React builds a fresh description and compares it against the previous one, then works out the smallest set of real changes that take the page from the old version to the new. Remove one product from a list of fifty and React changes that one item and leaves the other forty-nine alone. Remember writing `document.createElement` and `appendChild` by hand, clearing the whole list and rebuilding it on every change? This is React doing that for you, and doing far less of it than you would by hand. You describe what the page should be. React figures out the steps to get there.

## Handling events

The page can hold state now. Something has to change it, and that something is the user, clicking and typing. React wires those things up with event handlers.

Let's start with a click. You attach a function to an event using a prop, and for a click that prop is `onClick`:

```tsx
<button onClick={handleClick}>Do the thing</button>
```

with a function somewhere above it:

```tsx
function handleClick() {
  // ...
}
```

When the button is clicked, React calls `handleClick`. The casing matters: `onClick` and not `onclick`, the same camelCase for other JSX props. A click handler that does nothing is not much use on its own. The useful version changes state, by calling a setter inside the handler, and we'll do that in a moment.

Typing into an input is another useful event. An input element fires a change event as the user types, and you handle it with `onChange`.

In plain HTML, an input remembers its own text value. You type, the box holds what you typed, the browser takes care of it. React wants the opposite. React wants your state to be the single source of what is in the box, so that what is on screen and what is in your code can never drift apart. That takes two things to wire up, not one:

```tsx
const [name, setName] = useState("");

<input
  type="text"
  value={name}
  onChange={(event) => setName(event.target.value)}
/>;
```

`value={name}` fills the box from state: whatever is in `name` is what shows. `onChange` runs on every keystroke and pushes the new text back into state with `setName`. State to box, box to state, wired by hand. An input set up this way is called a controlled input, because React controls its value, not the browser.

Maybe you're now thinking "That is two lines for what should be one variable. Other frameworks just bind a variable to the input and keep them in sync for you."

Some do, yes. Vue has `v-model`, Angular has two-way binding. React deliberately does not. The idea is that there is exactly one place the value lives, your state, and the input is only ever a reflection of it. There is no second copy hiding inside the DOM that might be different.

## A form that adds products

Now the real thing. The form is its own component. We have a page that owns the products and a form that collects a new one, and they are not the same component, which is the whole point of this lesson and also, in a minute, a problem to fix.

> 🎓 Make `ProductForm.tsx` in `features/products/`, next to the others:

```tsx
import { useState } from "react";
import type { SubmitEvent } from "react";

type ProductFormProps = {
  onAdd: (name: string, price: number) => void;
};

export function ProductForm({ onAdd }: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (name.trim() === "" || price <= 0) {
      return;
    }
    onAdd(name, price);
    setName("");
    setPrice(0);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add product</h2>
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
      <button type="submit">Add</button>
    </form>
  );
}
```

Two controlled inputs, name and price, each backed by its own piece of state. The price one wraps the value in `Number(...)` because an HTML input gives you a string even when it is `type="number"`, and we want to store a number in state.

The inputs sit inside a real `<form>`, which gets you two things for free: pressing Enter submits it, and a screen reader announces it as a form. The catch is that a submitted HTML form, by default, reloads the entire page, and in a single-page app a reload throws the whole running app away and starts from scratch. `event.preventDefault()` stops that. It's the first line of nearly every submit handler you will write.

The imports are also worth a look. We pull in `useState`, a real function, and `SubmitEvent`, which is only a type (the shape of the event the form passes to the submit handler). `import type` keeps it out of the compiled output, just like for the `Product` type last lesson.

The validation is a bit basic now. Trim the name, check the price is above zero, stop early if either fails. No message on screen yet, just a quiet refusal. Enough for now.

Now the part that matters. Look at what the form does when you submit a valid product: it calls `onAdd(name, price)`. It does not add the product itself. `onAdd` is a prop, a function handed in by whoever rendered the form.

This is events going up. Data goes down the tree as props, the way it has since the first React lesson, parent handing values to child. Actions go back up as function calls. The parent gives the child a function, the child calls that function when something happens and passes along whatever the parent needs to know. The form is not allowed to reach up and put a product into the page's state, and it could not anyway, the state lives in a different component. So instead it taps the page on the shoulder: someone wants to add a product, here is the name and the price. What the page does about that is the page's business.

```
            props (data, down)
ProductsPage  ───────────────────▶  ProductForm
ProductsPage  ◀───────────────────  ProductForm
            onAdd(name, price) (action, up)
```

Now notice the type of `onAdd` in the code example at the beginning of this section: `(name: string, price: number) => void`. It shows that a prop can be a function, and you type a function prop the way you type any function, its parameters and what it returns. The `=> void` means it hands nothing back, the form calls it and carries on. Giving the prop a type means the page cannot wire up a function of the wrong shape, and inside the form you get autocomplete on the arguments inside your editor.

> 🎓 Over in the page, two changes need to be made. A handler that does the actual adding, and the form rendered with `onAdd` that points to the handler:

```tsx
function addProduct(name: string, price: number) {
  const newProduct: Product = { id: Date.now(), name, price };
  setProducts([...products, newProduct]);
}
```

```tsx
<ProductForm onAdd={addProduct} />
```

`addProduct` builds the new product object and adds it to the list. The id uses `Date.now()`, the current time in milliseconds, which is a good-enough unique value for now. (Once there is a backend, the server will send us real ids and this goes away.)

The line to take a closer look at is `setProducts([...products, newProduct])`. Inside setProducts, we build a new array, fill it with all the old products using the spread syntax, and add the new one on the end. What we do not do is push onto the existing array:

```tsx
products.push(newProduct); // No. Don't. Not cool. Seriously, I mean it!
```

It looks like it should work, and it is one of the meaner bugs in React, because the product does get added to the array but nothing on screen changes. React decides whether to re-render by checking whether the state **value** is a **new** one. `push` changes the array in place, so it is the same array, the same reference, and as far as React can tell nothing happened. You sit there staring at a list that is plainly wrong, certain the code is right. (And it is, except for that one line.) So do not mutate state. Build a new value and set it. This is the immutability idea we introduced earlier.

> 🎓 After you've made all the changes, try things out in the browser: type a name and a price, hit Add. The product appears in the list, the form empties itself, ready for the next one. The page owns the list, the form collects input and reports up, and neither one knows much about the other. Doesn't that code feel clean now?

## Removing products

Removing is similar to adding, and we'll use the same up-the-tree pattern. However, the delete button belongs on the card itself, because that is where a single product lives, but the card cannot remove anything, it does not own the list. So the card gets a callback too.

> 🎓 Update `ProductCard.tsx` so it looks like this:

```tsx
import type { Product } from "../../types/Product";

type ProductCardProps = {
  product: Product;
  onDelete: (id: number) => void;
};

export function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>€{product.price}</p>
      <button onClick={() => onDelete(product.id)}>Delete</button>
    </div>
  );
}
```

`onDelete` is typed `(id: number) => void`, and the button hands the id of the product to the parent. One small thing in that `onClick` that could be confusing: it is `onClick={() => onDelete(product.id)}`, an arrow function that calls `onDelete` when clicked, not `onClick={onDelete(product.id)}`, which would call `onDelete` immediately, during render, on every render. We want to hand React a function that will be able to run later, not run onDelete now.

The list component only passes the callback through. `ProductList` does not delete anything either, it sits between the page and the cards, so it takes `onDelete` and hands it to every card.

> 🎓 Update `ProductList.tsx` to pass `onDelete` through to each card:

```tsx
import type { Product } from "../../types/Product";
import { ProductCard } from "./ProductCard";

type ProductListProps = {
  products: Product[];
  onDelete: (id: number) => void;
};

export function ProductList({ products, onDelete }: ProductListProps) {
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onDelete={onDelete} />
      ))}
    </div>
  );
}
```

Same `.map` and `key` from last lesson, one card per product. The only new thing is `onDelete` being passed along to each card.

> 🎓 And the page above handles it. Make these changes to `ProductsPage.tsx`: Add the `deleteProduct` handler, and pass it to the list:

```tsx
function deleteProduct(id: number) {
  setProducts(products.filter((p) => p.id !== id));
}
```

```tsx
<ProductList products={products} onDelete={deleteProduct} />
```

`filter` returns a new array with the matching product left out, which is the new-array-not-mutation rule again, this time for free, since `filter` never touches the original. Hand the new array to `setProducts`, React sees a new value, re-renders, the product is gone.

> 🎓 Save and try it out: click Delete on a card, watch it disappear. Two features now, add and delete, implemented the same way: the event happens down in a child, the state change happens up in the page, and a callback prop connects them.

## When a file starts to grow (Oh, oh!)

Step back and look at `ProductsPage`. It holds the products, it holds the add and delete logic, it renders the form and the list and wires them up. At the end of last lesson it did almost nothing. It has put on weight. That is not a problem yet. A page component is meant to coordinate its feature, and coordinating means holding some state and some handlers. Growth is normal.

The problem is the growth you stop noticing. Every feature you add is one more thing the page does, and the path of least resistance is always to add it right here, where everything already is. Keep doing that for a few weeks without ever pausing to reorganise, and you arrive at the failure I see most often in this course: one component carrying a whole feature on its own, hundreds of lines, state and logic and markup are all over the place, and nobody on the team wants to take the time to clean up this mess.

The fix is not to write it perfectly the first time. You cannot, because you do not yet know what the feature will need. _Coding is a journey of discovery_. The fix is to keep reshaping the code as you go, so it never gets too far. That is refactoring: improving the structure of code without changing what it does. Same behaviour, better shape. You are not adding a feature or fixing a bug, the app does exactly what it did before, you are just making the code easier to live in. Rename a variable that misleads, split a component that has gotten too big, lift a repeated block into one place. Small and constant, woven through the work, not a grand cleanup you schedule for "later".

I will share an embarrassing story, because it is the thing new developers most underrate. I once worked at a company that threw away two years of work by 40 developers, before ever releasing a 1.0, because the code had rotted to the point where every change broke two other things and the servers crashed every weekend. I blame it on management without a clear vision. They wanted us to keep adding endless (and aimless) new features. It wasn't a fun experience, but they paid me quite well to bring the servers back up every weekend for almost a year. Nobody planned to build something unworkable. They just kept adding and never refactoring, and one day the code was past saving. Code that has grown too tangled to change safely is dead, even while it still runs.

A "code smell" is the name for a sign that the structure is going wrong. Not a bug, just a shape that tends to grow bugs. Some examples for a React app:

- A component file long enough that you have to scroll around to find anything.
- The same chunk of JSX or logic in two places, so any change has to be made twice and one copy eventually gets forgotten.
- A component that knows too much about another component's internals, reaching into data that is not really its business.
- Names that lie or say nothing. `data`, `handleStuff`, a component called `Card` that is actually a form.

Each one is a reminder to refactor, not an emergency. You notice it, fix it, and carry on.

## Editing products

Time to add editing to our project. It seems like a small feature. Click Edit on a product, change its name or price, save. But watch what it does to the code.

We can use ProductForm as a starting point.

First the page needs to know that a product is being edited, and which one. The obvious choice would be to add something like this:

```tsx
const [editingId, setEditingId] = useState<number | null>(null);
```

When editingId is `null`, the component's state would be "not editing, the form is in add mode". When editingId contains an id, it would be "editing this product". We could add an Edit button that sends the id up to the parent, the same callback pattern as delete, and have the page store it.

Now the form has to do two jobs, add and edit, and in edit mode it has to open with the product's current values already in the boxes. Here we're starting to see why the `editingId` choice might be wrong. The form is handed an id, a number. But to fill the name and price fields, it needs the product's name and price. So the form also has to go and find the product, which means the page has to also hand it the whole products array, and the form has to dig through it. Something like:

```tsx
// inside ProductForm, the bad version
const editing =
  editingId === null ? null : products.find((p) => p.id === editingId);
```

The form's props have now grown to include the entire `products` array. Stop and look at what that did.

The form used to need one thing (onAdd, a way to report a new product up). Now it also needs the whole list and the logic for searching it. A component whose job is "edit one product" is suddenly carrying the entire collection and a lookup. That is the third "code smell" from the last section, a component reaching into data that is not its business. It works, but it is wrong, and the wrongness will spread.

Components are now tied together, and dependent on how that list is shaped. We want components that stand on their own and do one thing.

So, another approach. Not the id, but the product itself:

```tsx
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
```

Now the page hands the form the one product it is editing, whole. No list, no search. The form gets exactly what it needs and nothing more:

```tsx
type ProductFormProps = {
  editingProduct: Product | null;
  onAdd: (name: string, price: number) => void;
  onUpdate: (product: Product) => void;
  onCancel: () => void;
};
```

What the user sees is identical. The shape of the code is better. That is a refactor: we changed the structure, not the behaviour.

> 🎓 Update `ProductForm.tsx`. It fills its fields from `editingProduct` and handles both submit cases:

```tsx
import { useState } from "react";
import type { FormEvent } from "react";
import type { Product } from "../../types/Product";

type ProductFormProps = {
  editingProduct: Product | null;
  onAdd: (name: string, price: number) => void;
  onUpdate: (product: Product) => void;
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

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (name.trim() === "" || price <= 0) {
      return;
    }
    if (editingProduct) {
      onUpdate({ id: editingProduct.id, name, price });
    } else {
      onAdd(name, price);
    }
    setName("");
    setPrice(0);
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
      <button type="submit">{editingProduct ? "Save" : "Add"}</button>
      {editingProduct && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
```

Let's go over the new stuff.

For name, we pass this to `useState()`:

```ts
editingProduct?.name ?? "";
```

- The `?.` reads `.name` only when `editingProduct` is not null.
- The `??` falls back to an empty string when it _is_ null.

So in add mode the fields are empty, and in edit mode they open with the product's values.

`handleSubmit` now does something different if `editingProduct` is not null:

- when editing: build a new product, but use the same id, and call `onUpdate`.
- else: call `onAdd` like before.

(Keeping the same id is of course important for an edit. You are changing the contents of an existing product, not making a new one.)

The heading and the button label change, based on whether you are editing. A Cancel button appears only in edit mode, and because it is a `<button type="button">` and not a `<button type="submit">`, it does not submit the form.

Now, when we test this, a new issue shows up, but the fix reuses something you already know.

The form reads its initial field values from `editingProduct` once, when it first appears on screen. But click Edit on the Laptop and then, without saving, click Edit on the Phone, and the form component is already on screen. It does not re-read its initial values, so it would still be showing the Laptop. The initial value of state is set only on the first render, never again on its own.

What we want is for the form to start over, fresh, whenever the product being edited changes. React has a clean way to ask for that, and it is the `key` you met on list items last lesson. A `key` is how React tells one element apart from another between renders. Give the form a key connected to the product being edited, and when that product changes, the key changes, and React treats it as a different form. It throws the old one away and builds a new one, which reads its initial values from the new product:

```tsx
<ProductForm
  key={editingProduct?.id ?? "new"}
  editingProduct={editingProduct}
  onAdd={addProduct}
  onUpdate={updateProduct}
  onCancel={cancelEdit}
/>
```

The key is `editingProduct?.id ?? "new"`, the product's id while editing, the string `"new"` while adding. Click Edit on a different product and the id changes, so React gives you a fresh form filled from that product. Save or cancel and it goes back to `"new"`, a fresh empty form.

> 🎓 Add the three handlers to `ProductsPage.tsx` to finish this:

```tsx
function updateProduct(updated: Product) {
  setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
  setEditingProduct(null);
}

function startEditing(product: Product) {
  setEditingProduct(product);
}

function cancelEdit() {
  setEditingProduct(null);
}
```

The `products.map()` might need an explanation:

`updateProduct` maps through the list and swaps in the updated product wherever the id matches, but leaves the rest. Then it clears `editingProduct`, which sets the key back to `"new"` and gives you a fresh empty form. `startEditing` stores the whole product, and `cancelEdit` clears it. Notice `startEditing` takes the product, not the id, so the Edit button on the card hands up the whole product now:

```tsx
<button onClick={() => onEdit(product)}>Edit</button>
```

Delete hands up an id, because all the page needs to remove a product is its id. Edit hands up the whole product, because that is what becomes `editingProduct`. You pass up whatever the parent actually needs, no more.

> 🎓 Here is the updated `ProductsPage.tsx`. Compare it with yours and make sure they match:

```tsx
import { useState } from "react";
import type { Product } from "../../types/Product";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Phone", price: 800 },
    { id: 3, name: "Headphones", price: 150 },
  ]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

`ProductList` now also takes `onEdit` and passes it to each card together with `onDelete`.

> 🎓 Update `ProductCard.tsx` to take `onEdit` and add the Edit button:

```tsx
import type { Product } from "../../types/Product";

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
};

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>€{product.price}</p>
      <button onClick={() => onEdit(product)}>Edit</button>
      <button onClick={() => onDelete(product.id)}>Delete</button>
    </div>
  );
}
```

> 🎓 Save and try the whole thing. Click Edit on the Phone, the form fills with its name and price and the heading turns into "Edit product". Change the price, hit Save, the card updates in place. Click Edit on one product, then another, the form refills each time. Cancel backs out without saving. And adding still works whenever nothing is being edited.

## Styling your components

It's time to talk about CSS again. See that `className="card"`? We haven't added any stylesheets yet, and `index.css` has been empty since we cleared out Vite's demo styling (if yours still has it, empty it now). Time to fix that, and to keep a promise from the CSS lesson: with React, we can give every component its own stylesheet.

> 🎓 Make `ProductCard.module.css` in `features/products/`:

```css
.card {
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
}
```

> 🎓 Then import it at the top of `ProductCard.tsx`, and change the `className`:

```tsx
import styles from "./ProductCard.module.css";
```

```tsx
    <div className={styles.card}>
```

Save, and the cards have a border. Now open the inspector in your browser, and look at the class on one of them. It isn't `card`. It's something like `_card_1a2b3`. The `.module.css` in the file name tells Vite this is a CSS Module: it renames every class in the file to something unique, and hands you the new names as an object, so `styles.card` is whatever it came up with. The payoff is that a `.card` in this file can never collide with a `.card` anywhere else. In the fundamentals lessons every class was global, one namespace for the whole site, and you managed that just by using good class names. In a project where four people each style their own components, that stops working the first time two of you pick the same name. (And you will. There are only so many words for "card".)

Two things a module leaves alone: the variables in `:root` and anything on `body` are global and stay global, so a module can use `var(--space-m)` from the shared stylesheet like any other file: modules rename classes, nothing else. And the shared stylesheet, imported once in `main.tsx` (`index.css` here, `styles.css` in your project), is still the one home for the reset, the typography and the variables. A module holds what belongs to one component, and nothing more. One wrinkle: TypeScript only knows `styles` is an object of strings, so `styles.crad` is not an error, it's an empty class. If a style refuses to show up, check the spelling first.

## Tidying up, and a checklist for code smell

The feature now works, and the editing refactor already cleaned up the biggest mess. Before moving on, let's do another short pass over the structure. It's a habit worth building.

Where do the new pieces live? `ProductForm` is a product thing, so it sits in `features/products/` with the card, the list, and the page. The `Product` type is still the single shared definition in `types/`. Nothing new crosses features, so nothing new goes in the top-level `components/` folder:

```
src/
  App.tsx
  main.tsx
  components/            shared components, still empty
  features/
    products/
      ProductCard.module.css
      ProductCard.tsx
      ProductForm.tsx
      ProductList.tsx
      ProductsPage.tsx
  types/
    Product.ts
```

"Both buttons, the form's and the card's, are just plain `<button>`. Should I pull a shared Button into `components/` now, so they stay consistent later?"

Not yet. You have one feature and a couple of simple buttons. A shared Button is a good idea the day a second feature wants the same one, and you do not have a second feature.

One more thing you might have noticed: every bit of product logic, the adding, the updating, the deleting, lives in the page. That is fine for now. There is a nicer way to lift that logic out so it can be reused and tested on its own, but I think this was plenty for today.

When you are not sure if something needs a refactor, these are the questions to ask. They are also, more or less, what we look at when we grade code quality, so they are worth saving somewhere for later:

- Is any component too long to take in at a glance? If you have to scroll to find things inside one file, split it.
- Is anything duplicated? The same HTML (JSX) or the same logic in two places? Lift it out and make it a shared thing.
- Does each component have one clear job you can state in a sentence? "Shows a product", "collects a new product", "coordinates the products feature". If the sentence needs an "and", something should probably be done.
- Do the names say what the thing is? A component called `Card` should be a card. A handler called `handleSubmit` should handle a submit.
- Is state changed only through its setter, always with a new value, never mutated in place?
- Does data still flow one way, down through props, with actions reported back up through callbacks, and no child reaching into a parent?
- Are shared types defined once and imported, not copied?

None of this is about making the code clever. It is about making it the kind of code another person, or you in three months, can change without fear.

> 🎓 Now try it on your own code. Open the project you've been building alongside these lessons and check it against the seven questions above. Find one thing that smells (just one for this exercise), fix it, then run the app and check if it still does exactly what it did before. Spotting the smell before anyone is pointing at it is one of the best skills a developer can develop.

## What's next

You can add, edit, and delete now, and the code holding it together is in pretty good shape.

The data is still baked in, though. Look at the top of `ProductsPage`: the products start as a hardcoded array sitting in `useState`, three products we typed into the source. A real app does not know its data in advance. It asks a server, and the server answers a moment later, over the network, which takes time. So the screen has to handle the in-between, the time after you ask and before the answer arrives, and the case where the answer comes back with an error instead of data.

That is the next lesson. We swap the hardcoded array for a real request and learn to handle a screen that's waiting for its data. But our add, edit, and delete keep working on whatever comes back.

## Resources

- React docs, "State: A Component's Memory". `useState` from the source, with the re-render model laid out. https://react.dev/learn/state-a-components-memory
- React docs, "Responding to Events". Event handlers, `onClick`, `onChange`, in full. https://react.dev/learn/responding-to-events
- React docs, "Updating Arrays in State". The add, replace, and remove patterns we used, and why you never mutate. https://react.dev/learn/updating-arrays-in-state
- React docs, "Sharing State Between Components". The lift-the-state-up pattern behind the page owning the products. https://react.dev/learn/sharing-state-between-components
- React docs, "Preserving and Resetting State". The `key` trick for resetting the form, explained properly. https://react.dev/learn/preserving-and-resetting-state

## Applying this to your project

Now your module starts to work. The list in your page moves into `useState`, and the form from the fundamentals weeks becomes a component that adds to it. Then delete, then edit, in that order, built the way the products were: the event happens in the child, the state change happens in the page, and a callback prop connects them. Editing is the one that forces a rethink of the form, so expect the same refactor we did above, and do it instead of working around it.

The form checks its own fields: empty, not a number, a date that isn't one. The case's rules are a different thing. Who may do what, when, on whose record: nearly all of that belongs on the server, and the server is weeks away. Write the rules down in the backlog next to the page they belong to, and leave them there for now. (Everything you add still vanishes on refresh, and the fetch in the next lesson doesn't change that. Fine.)

Then the checklist. Run the seven questions over your own module and fix what smells. Then run them over a teammate's module, and have them do the same with yours. At the end of the semester every one of you has to answer questions about modules you didn't build, so code review is a habit to start now, while the files are short. And the shared button: the day two modules want the same one, it moves to `components/`. Not before.

And the styling. Your module's stylesheet from React lesson 1 stays, for what your page shares across its components. From now on, a component whose look is its own gets a `.module.css` beside it, the way the card did. The shared `styles.css` remains the one home for the variables, the reset and the typography, and a module reaches them through `var()` like any other file.