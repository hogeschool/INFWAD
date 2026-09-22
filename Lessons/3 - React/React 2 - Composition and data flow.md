# React 2: Composition and data flow

Last lesson you built a ProductCard and handed it data through props. The first (tiny) part of an application. But a real application is a whole tree of components, a page containing multiple lists, with each list containing different cards.

In this lesson we'll take the next step. Still no state, events, or server, but we'll look at what the rest of the page needs, and how components can be arranged the way a real React app is arranged. By the end you have a small tree of components and a sensible place for every file, which will start to matter when we have a lot of them.

## From one card to a list

Ok. Here is the ProductCard from last lesson, sitting in `App.tsx`:

```tsx
type Product = {
  name: string;
  price: number;
};

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>€{product.price}</p>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>Products</h1>
      <ProductCard product={{ name: "Laptop", price: 1200 }} />
      <ProductCard product={{ name: "Phone", price: 800 }} />
      <ProductCard product={{ name: "Headphones", price: 150 }} />
    </div>
  );
}
```

A shop should support many products, so we'll need a better way to do this. The first instinct, and it's the right one, is to keep editing and see what happens.

> 🎓 Update the `App` component's function in `App.tsx` so the product data comes from an array:

```tsx
export default function App() {
  const products = [
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Phone", price: 800 },
    { id: 3, name: "Headphones", price: 150 },
    { id: 4, name: "Record player", price: 500 },
    { id: 5, name: "NAS", price: 450 },
  ];

  return (
    <div>
      <h1>Products</h1>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

> 🎓 Save and look at the browser. The five products should render as a column of cards.

Yep, it works!

The new part is `products.map(...)` in the middle. You learned about `map` in Fundamentals 4: hand it an array and a function, and it gives you back a new array with that function run over every item. Same method here, except the function returns a component. An array of products becomes an array of `<ProductCard>` elements, and React renders them all. That's how you render a list in React. No special loop, no directive, no template syntax. Just `map`, the array method you already know, returning JSX.

One detail is worth zooming in on.

`key={product.id}`. Every element you produce in a list with `map` needs a `key`, a value unique among its siblings, that React uses to tell the items apart. When a list changes, items added, removed, moved around, React lines the new list up against the old one, and the key is how it matches them: this is the same Laptop as before, that one is new. Leave the key off and React will start complaining in the console.

Maybe you now think "Can I use the array index? `map` hands it to me for free." You can, and on a list that never changes it won't hurt you. But the day the list changes, the index starts lying. Remove the first product and everything after it shifts up one, so the key that meant Laptop now sits on Phone, and React gets confused. Right now our list is fixed, so you won't actually see this go wrong. Next lesson, when you can add and remove entries, you would. Use a real, stable id from the data now and the whole problem never appears. That's why there's an `id` on each product up there. (By the way, `key` may look like a prop, but it is not an ordinary prop. React reads it itself for its own bookkeeping. ProductCard never receives it.)

## A tree of components

So what's wrong with leaving it like this?

Nothing, today. The problem is what the `App` is meant for. App is the shell of your whole application, the thing `main.tsx` renders, the root of everything. And right now that root is also holding the product data, writing the page heading, and running the loop that builds the list. Three jobs that have nothing to do with being the root of an app, all piled into one function, in one file, next to ProductCard.

Add a search box, a sort dropdown, a second section below the products, a footer, and App keeps swallowing all of it, because App is where you already are and adding one more thing is always the path of least resistance. It is also the most reliable way I know to make a React project miserable to work in. So we stop doing it now, while the app is small and pulling it apart is still easy.

The first step is to stop seeing the screen as one thing and start seeing the tree inside it. Look at what's actually on the page. The whole thing is a _products page_. Inside it, the cards repeat, which makes them a _list_. Each entry in that list is one _card_. Three nested responsibilities, and each one should get its own component:

```
App                  the shell of the app
└── ProductsPage     the products feature: holds the data, arranges the page
    └── ProductList  takes a list of products, renders a card for each
        ├── ProductCard
        ├── ProductCard
        └── ProductCard
```

That's a component tree. A few large components near the top that arrange and coordinate, many small ones near the bottom that just display. You already have the bottom of it: ProductCard displays one product and knows nothing else about the world. Now we build the rest.

## Building the tree

Work from the bottom up. ProductCard is done. The next layer up is the list, and a ProductList has exactly one job: take some products, render a card for each. That's the `map` we already wrote, lifted out of App into its own component.

(The import lines point at files that don't exist yet, but we will create them next. Until then, your editor will underline them in red.)

> 🎓 Create `ProductList.tsx`:

```tsx
import type { Product } from "../../types/Product";
import { ProductCard } from "./ProductCard";

type ProductListProps = {
  products: Product[];
};

export function ProductList({ products }: ProductListProps) {
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

ProductList takes a `products` prop, an array of Product, and renders the list. It has no idea where the products came from and no reason to care. Hand it an array and it draws a card for each. Swap in a different array and the cards change to match.

Two small things in there. The `export` in front of `ProductList` makes it available to other files, and `import { ProductCard }` pulls ProductCard in by name, which means ProductCard needs an `export` of its own now, so put it in its own file and add the `export`. The braces on the import mark a named export, brought in by the name it was given. (App came out of the Vite template as a default export, the kind you import without braces, the way `main.tsx` does it. Both work. We name our own components, it reads a little better in the editor.)

> 🎓 Move `ProductCard` out of `App.tsx` into its own file, `ProductCard.tsx`, and put `export` in front of its component function.

Up one more level, the products feature gets a coordinator. ProductsPage component holds the data and arranges the feature. Right now "arrange" means a heading and the list, but this is the component that will grow as more features are added.

> 🎓 Create `ProductsPage.tsx`:

```tsx
import type { Product } from "../../types/Product";
import { ProductList } from "./ProductList";

export function ProductsPage() {
  const products: Product[] = [
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Phone", price: 800 },
    { id: 3, name: "Headphones", price: 150 },
    { id: 4, name: "Record player", price: 500 },
    { id: 5, name: "NAS", price: 450 },
  ];

  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  );
}
```

The hardcoded array lives here now. When the products start coming from a server, in a few lessons, this is the component that will go and fetch them. The page owns the data, the list renders it, the card shows one item. One job each.

That empties App out almost entirely.

> 🎓 Update `App.tsx` to just render the page and nothing else:

```tsx
import { ProductsPage } from "./features/products/ProductsPage";

export default function App() {
  return <ProductsPage />;
}
```

"Hold on. App renders ProductsPage and does nothing else. Why is that its own component? Why not leave the products in App and drop the middle layer?"

Well, yes, right now App is doing almost nothing, which does look like a waste of a file. But App is the top-level component every page sits inside, and a real app has more than one page. Soon App will hold what every page shares, a header, navigation, a layout wrapped around whichever page you're looking at. Keeping the products in their own page means that when you add a second page, you can just add it beside ProductsPage. No untangling of messy code. (We'll add navigation between pages in the routing lesson.)

Notice which way the data moves through all this. The products start in ProductsPage. ProductsPage hands them to ProductList as the `products` prop. ProductList hands each one to a ProductCard as the `product` prop. Data flows down the tree, parent to child, the same one-way flow from last lesson, now running through three levels instead of one:

```
ProductsPage  ──products──▶  ProductList  ──product──▶  ProductCard
```

No child reaches up to pull anything out of its parent. Each one is handed what it needs and renders it, and that's the whole reason a tree like this is easy to follow. To know what any component shows, you just have to read the props going into it and nothing else.

You should get used to thinking like this: draw the screen you want to build, divide everything into a tree structure, and give each part one job.

> 🎓 Draw the component tree for the shop screen below, and give every component the single job it does in one sentence.
>
> (Forgive me for the ugly ASCII art. I really like writing stuff in Markdown, but including pictures kind of sucks. There were so many old-school memes I wanted to include in all these lessons, but sadly I gave up on that. Though the upside is that it's probably less _cringe_ now!)

```
+-----------------------------------------+
|  Search [___________]         Sort [v]  |
+---------------+-------------------------+
|  Categories   |  [card] [card] [card]   |
|    Laptops    |  [card] [card] [card]   |
|    Phones     |  [card] [card] [card]   |
|    Audio      |                         |
+---------------+-------------------------+
```

For those of you unable to appreciate ASCII art: what you see here is a search box and a sort dropdown along the top, a list of categories at the left, and the product grid filling the rest. One thing here is shaped differently from the products page: more than one component sits directly inside the page, side by side, instead of a single straight line from top to bottom. Think about where that happens and name the components that sit next to each other. Do it on paper if you like analog, or a text file in your editor, either is fine.

When you're done, check the "Thinking in React" article in the resources. It walks through a screen just like this. (But don't cheat and go there right now. You'd only be cheating yourself, and that's just sad.)

## Where everything lives

You have three product components and, any second now, a Product type, all loose in `src/` beside App and `main.tsx`. Three files is fine. Thirty is not, and projects get to thirty faster than you'd think.

So settle where things go before it gets complicated. The useful question is what a component is related to.

Some components belong to one feature. ProductCard, ProductList, and ProductsPage are all about products. Those are feature components, and they live with their feature.

Other components belong to no feature in particular. A reusable button component, a card frame, a modal dialog, a labelled input: generic pieces any feature might use and none of them owns. Those are shared components.

You don't have a shared one yet. You'll soon enough. The form arrives next lesson and brings a button with it, and not long after there are several, and the second time two features want the same button you'll want one obvious place it already lives. So make that place now, even empty:

```
src/
  App.tsx
  main.tsx
  components/           for shared components (empty for now)
  features/
    products/           for everything about products, together
      ProductCard.tsx
      ProductList.tsx
      ProductsPage.tsx
  types/
    Product.ts          for shared types
```

This is a feature-based layout. A feature's files sit in one folder, so working on products means working in one place, instead of opening a `pages/` folder and a `components/` folder and reassembling the feature in your head from pieces scattered across both. The things that cross features, the shared components and the shared types, get their own top-level folders.

> 🎓 Create `features/products/`, move the product files into it, and make an empty `components/` folder beside it for the shared pieces you don't have yet.

Moving the files breaks every import that pointed at them, all at once, which sounds worse than it is. From inside `features/products/`, a neighbour is now `./ProductList`, and the types folder, two levels up and back down, is `../../types/Product`. You mostly won't type those out by hand: when you drag a file into its new folder, VSCode offers to update the imports for you, and you can just say yes. If it doesn't ask, the broken imports turn up as red squiggles, and you fix them from there, one at a time.

## The Product type, in one place

Look again at the import lines: every component that touches a product reads `Product` from `../../types/Product`. Last lesson that type sat inside ProductCard.

Fine when one component used it. But now we have three using it. Define it once, import it everywhere.

> 🎓 Create `types/Product.ts`:

```tsx
export type Product = {
  id: number;
  name: string;
  price: number;
};
```

`export` opens the type up to other files, and each component reads it in like this:

```tsx
import type { Product } from "../../types/Product";
```

Let's take a look at that `import type`: a plain `import` brings in something that exists when the code runs, a function, a value, a component. A `type` exists only while TypeScript checks your code. By the time the browser runs anything the types are gone, stripped out, the same way the angle brackets of JSX are gone. `import type` says precisely that: this one is for the type checker, leave it out of the output. A plain `import` usually works too, but `import type` is honest about what the line is for, and it's the form we'll use for types.

> 🎓 In `ProductCard.tsx`, delete the inline `Product` type and add the import at the top:

```tsx
import type { Product } from "../../types/Product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>€{product.price}</p>
    </div>
  );
}
```

One definition, one place to change it, every component reading the same shape. The `ProductCardProps` type stays here, with the component, because it describes this one component's props and nobody else needs it. The Product type is shared, the props type is local.

## Where this goes next

You now have a tree: each component doing one job, each in its own file, one shared type between them, data running cleanly down. For a static screen that's a good, solid shape.

A bit boring though. Open the page and there's nothing to do, nothing to click. Edit the array in ProductsPage and the screen changes, but only because you changed the code, not because anything happened in the running app. The products are baked in.

A real app reacts. You type and it responds, you add a product and it appears, you remove one and it's gone. For that, a component needs two things it doesn't have yet. It needs memory, a value it can hold and change while the app runs, instead of a constant, frozen into the source. And it needs a way for a child to talk back up to its parent, so a button inside a card can tell the page above it that something just happened.

That's state and events, and it's the next lesson. We make the tree move. (And the moment it can move, it also starts to become a mess pretty quickly, which is why we learn to tidy it up at the same time as well.)

## Resources

- React docs, "Rendering Lists". The official words on `map` and keys, with the index-as-key trap spelled out in full. https://react.dev/learn/rendering-lists
- React docs, "Passing Props to a Component". https://react.dev/learn/passing-props-to-a-component
- React docs, "Thinking in React". The same find-the-tree-in-the-screen exercise we just did, worked all the way through. Worth a read. https://react.dev/learn/thinking-in-react

## Applying this to your project

Now your module's list page becomes a tree. Draw it first, on paper or in the readme, the way the exercise above did for the shop screen: the page, the list, the card or the row, each with its single job in one sentence. Then build it. The page owns an array of made-up rows (the ones from your static pages, now typed), the list maps over them, and the card or row is the component from the previous lesson. The type goes in `types/`, once, and every component imports it from there.

Folders are a team decision, so agree on them now, before there are thirty files: `features/<module>/` per module, `components/` for what's shared, `types/` for the shared types. The case rules say what belongs to the whole team (the shell, the navigation, the shared components and styling), and `components/` is where that ends up. It's empty for now. It won't stay empty.

One practical problem: `App` shows one page, and you have four modules. Routing fixes that in one of the upcoming lessons. Until then, let `App` render the four page components one below the other, each person adding their own line. It looks silly, but everybody's work is visible in one running app, and it keeps four people from fighting over `App.tsx` with four different versions of it.

Keep the backlog current. Per page, the components it's made of is a useful line to have now.