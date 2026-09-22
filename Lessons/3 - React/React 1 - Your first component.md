# React 1: Your first component

In the previous lesson we introduced frontend frameworks. We looked at doing DOM manipulation by hand, watched the find-listen-change approach fall apart as more functionality is added, and gave a preview of a React component that did the same job without any of the manual work.

Today we install the tooling, set up a real React project, and write our first component. We take some plain HTML, which you've been writing these last weeks, and turn it into a React component you can reuse. No state, no events, no data from a server yet. One component, built from the HTML you already have.

## Setting up the project

Ok, first things first.

> 🎓 Open the terminal inside VSCode and check if Node.js is installed:

```bash
node -v
npm -v
```

If both print a version number, you're good. If `node` is not found, [follow the instructions here](../X%20-%20Extra/Setup%201%20-%20Nodejs.md).

We're sticking with NPM only. No Yarn, pnpm, etc. NPM is still the default today and it's pretty good. Feel free to explore the alternatives!

### Generating a new React project

> 🎓 Create a new folder for the project:

```
infwad-project/
```

Now we start by creating a project from a React/TypeScript template. We use Vite, a build tool that sets up the project, runs a fast development server, and handles all the conversion from TypeScript and JSX to plain JavaScript that we talked about in the previous lesson.

> 🎓 Scaffold a React + TypeScript project with Vite:

```bash
cd infwad-project

npm create vite@latest ClientApp -- --template react-ts
```

The `react-ts` part is the important bit. It gives us React with TypeScript, which is what we'll be using all semester.

Vite might ask you to confirm a couple of choices.

Ok, let's see what the output of that was, and check the files.

> 🎓 Take a moment to click around and explore the generated folders and files in VSCode.

Normally I might change some of the settings right away (check the `tsconfig.app.json` settings for example), or change the readme, but for now let's leave everything as it is by default.

> 🎓 Go into `ClientApp` and install the dependencies:

```bash
cd ClientApp
npm install
```

That `npm install` reads the list of packages the project needs and downloads them into a `node_modules` folder. (That folder gets big. Hundreds of packages, thousands of files. You never commit it to git, which is why there's a `.gitignore` file that already lists it. If you ever clone a fresh copy of a project and the code doesn't run, the first thing to try is `npm install` to get `node_modules` back.)

> 🎓 Now start the dev server:

```bash
npm run dev
```

> 🎓 Open the address that Vite printed, usually `http://localhost:5173`. You get the default Vite-and-React starter page, with a spinning logo and a counter button.

> 🎓 With the dev server still running, open `src/App.tsx`, change some of the text, save, and look back at the browser.

It updated, without a refresh, and without resetting the counter. That's **hot module replacement**: while the dev server runs, it swaps in your changes the moment you save. You'll spend the whole semester with a dev server running in one terminal and your editor next to it. Edit, save, glance at the browser. It is a good way to work.

## A look around the project

Vite generated a pile of files. The ones that matter right now are only a handful.

`index.html` is the single HTML page the whole app loads into. It is nearly empty: one `<div id="root">` and a script tag pointing at your code. Remember single-page applications from the previous lesson? This is the single page. `src/main.tsx` is the entry point. It finds that `root` div and tells React to render your app into it. You rarely touch this file. `src/App.tsx` is the first real component, the one you just edited, and that's where we start. `package.json` lists the project's dependencies and the scripts, so `npm run dev` is also defined in there.

You'll notice two file extensions. `.ts` is a plain TypeScript file. `.tsx` is a TypeScript file that's allowed to contain JSX, the HTML-like markup. Components live in `.tsx` files. Plain logic with no markup can live in a `.ts` file.

And since you're now staring at real TypeScript files, a quick word on why. In the previous lesson I waved my hand and said TypeScript is JavaScript with a type checker on top. That's still the one-sentence version. The point of the type checker is that it reads your code before it runs and catches the kind of nonsense we poked at in the previous lesson, the `"5" - 3` and the typo'd property name, while you're typing, in the editor, instead of at runtime in front of a user. It also means your editor knows the shape of your data, so it can autocomplete fields and warn you when you try to use one that isn't there. You write a little more (the type annotations), and in return the computer catches a whole category of mistakes for you. That's a good trade.

## The rest of the toolchain

Vite's React-TypeScript template comes with one more tool already wired up: ESLint. A _linter_ reads your code and flags likely problems and sloppy patterns, the things that aren't quite errors but will bite you later. You'll see its warnings in the editor and in the terminal.

We add a few more tools, and I will keep this short, because you mostly set them up once and then forget they're there. Prettier formats your code automatically, so the whole team's files look the same and nobody has to argue about where the spaces go. For styling we use Stylelint, which is ESLint but for your CSS. We'll go through the exact setup for these together later. For now, just know what each one is for.

## Your first component

Enough setup. Let's make something.

Here's a product card as plain HTML. Nothing new. You could have written this in week 1:

```html
<div class="card">
  <h3>Laptop</h3>
  <p>€1200</p>
</div>
```

To turn that into a React component, you wrap it in a function that returns it:

```tsx
function ProductCard() {
  return (
    <div className="card">
      <h3>Laptop</h3>
      <p>€1200</p>
    </div>
  );
}
```

That's a component. A function, with a capital letter for a name, that returns some markup. (If you read older React code or older tutorials, you'll run into components written as JavaScript classes. That was the old way of doing it. Modern React is all functions, and that's all we use here. I mention it only so the class syntax doesn't confuse you when you meet it in the wild.)

The markup inside the function is JSX, and a couple of things changed when the HTML moved in there. `class` became `className`, and the whole thing is wrapped in `return (...)`. Let me explain both, because JSX comes with a small set of new rules.

## JSX: HTML inside JavaScript

JSX is the markup you write inside a component. It looks like HTML and it mostly behaves like HTML, but it is not HTML. It is a syntax extension on top of JavaScript, and the build step turns it into ordinary JavaScript function calls before the browser ever sees it. The browser does not know what JSX is. By the time your code runs, the angle brackets are gone, compiled away into plain JS.

That last point is the one to remember: JSX is JavaScript. Which is exactly why you can drop a JavaScript value straight into your markup with curly braces.

```tsx
const name = "Piet";

function Greeting() {
  return <h1>Hello, {name}</h1>;
}
```

Anything inside `{ }` is evaluated as JavaScript. A variable, a sum, a function call, whatever you like. `{2 + 2}` renders `4`. Every time you want something dynamic in your markup, you'll use `{ }`.

Now the rules. None of them are hard, but you'll probably hit each one at least once and wonder why the editor is yelling at you.

- A component only returns one element, not two sitting side by side. If you have two things to return, wrap them in a parent. That can be a real element like a `<div>`, or, when you don't want an extra `<div>` cluttering the page, an empty `<>...</>` (called a Fragment):

```tsx
function Header() {
  return (
    <>
      <h1>Title</h1>
      <p>Subtitle</p>
    </>
  );
}
```

- `class` becomes `className`. The word `class` already means something in JavaScript, so JSX uses `className` for the HTML class attribute. The same goes for a `<label>`'s `for`, which becomes `htmlFor`.

- Attribute names are camelCase. `onclick` is written `onClick`, `tabindex` is `tabIndex`. (We get to event handlers like `onClick` in a couple of lessons. For now, just notice that the casing is different from HTML.)

- Every tag closes. In HTML you can get away with a lonely `<img>` or `<br>`. In JSX they have to be self-closed: `<img />`, `<br />`.

- Multiline markup goes in parentheses. When your `return` spans more than one line, wrap it in `( )` so JavaScript doesn't get confused about where the returned value ends.

## Props: making a component reusable

Our `ProductCard` component from above has a problem. It always shows a Laptop for €1200. Hardcoded. If we wanted a card for a Phone, we'd have to write a second, nearly identical component, and that's exactly the copy-paste we're trying to get away from.

What we want is one `ProductCard` that we hand a product to, and it renders whatever we gave it. The data a component receives from its parent is called props (short for properties). Props are how data flows into a component.

Let's start with the simplest possible version. Here is `ProductCard` again (simplified with just a name, for now). This time the content isn't baked in:

```tsx
type ProductProps = {
  name: string;
};

function ProductCard(props: ProductProps) {
  return <h1>Product: {props.name}</h1>;
}
```

A few things are going on. The component now takes one argument, `props`, an object holding whatever was passed in. We describe the shape of that object with a `type`: `ProductProps` that says this component expects a `name` (a string). Inside the JSX, `{props.name}` reads the values out.

You use it by passing `name` like an HTML attribute:

```tsx
<ProductCard name="Laptop" />
<ProductCard name="Phone" />
```

Same component, different data. That's the whole point of props.

Writing `props.name`, `props.price`, `props.whatever` gets old fast, so almost everyone pulls the fields straight out of the props object in the function's parameter list. This is called destructuring, and it does exactly the same thing:

```tsx
function ProductCard({ name }: ProductProps) {
  return <h1>Product: {name}</h1>;
}
```

Now it's just `{name}`. You'll see this form everywhere, and we use it for the rest of the course.

One rule about props: Props are read-only. A component can read the props it was given, but it must never change them. Writing `name = "someone else"` inside `ProductCard` is wrong, and TypeScript will stop you from doing it. Data flows one way: down, from parent to child. The parent owns the data and decides what to pass. If a child needs something to change, it asks the parent to do it, and we'll see exactly how that works in a couple of lessons, once components start talking back.

Now let's add the product's price.

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
```

> 🎓 Now put it to use. Replace everything in `src/App.tsx` with this:

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

> 🎓 Save and look at the browser. The starter page is gone, and in its place are a heading and three products with their prices.

Those double curly braces look strange the first time you see them. The outer `{ }` is the JSX "here comes JavaScript" braces. The inner `{ }` is a plain JavaScript object. So you're passing one object, `{ name: "Phone", price: 800 }`, as the `product` prop.

For now the `Product` type sits right here in the component file. Once we have more than one component sharing it, redefining the same type in every file gets silly, so we'll move it somewhere central. But that's next lesson's problem.

Now it's your turn, with your own HTML.

> 🎓 Remember the card you built in the CSS lesson, using [developer.mozilla.org/play](https://developer.mozilla.org/play)? Take that HTML (or any small chunk of markup from your first weeks) and turn it into a component. Wrap it in a function, give it a props type for whatever fields the card has (a title, a price, an image URL, whatever yours uses), and read those fields out in the JSX. Then render it two or three times in `App`, each with different data. Remember that you're now writing JSX, not HTML, so any `<img>` in there needs self-closing now. If TypeScript complains that a field is missing, good, now you've proven that the type checker is doing its job!

## Where this goes next

You have one component, and you can feed it different data through props. That's the atom of a React app. But an atom is not an application.

Right now everything is one component showing one card, and the data is still hardcoded into our example, sitting in the markup. A real interface is dozens of components arranged in a tree: a page that holds a list, a list that holds cards, a card that holds a button. Next lesson we take a screen apart into a tree of components, decide what each one is responsible for, and let the data flow down through it. After that, we make it move.

## Resources

- The React docs. The official ones at react.dev are really good now, and the "Learn" section is worth reading alongside these lessons. https://react.dev/learn
- The Vite guide, if you want to understand the tool you just used. https://vite.dev/guide/
- The TypeScript handbook, "Everyday Types." A short read that covers most of the type syntax you'll see. https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

## Applying this to your project

Today your project becomes a React project. One person on the team scaffolds it the way we did above, in a `ClientApp` folder in the team repository, and commits it. Everyone else pulls and runs `npm install`. (Not all four of you scaffolding your own. That gives you four `package.json` files that are almost the same, and a merge nobody enjoys.) The static HTML files stay in the repository for now. They're your reference during the rewrite, and you delete them when nothing looks at them anymore.

Right after the scaffold, you can build the app's shell with your team. [Setup 2: The project shell](../X%20-%20Extra/Setup%202%20-%20React%20project%20shell.md) walks you through it. That way each of you has a file of your own from the first commit, and nobody needs to touch `App.tsx` again. We will talk more about routing in React lesson 5.

Bring the stylesheets along. The shared `styles.css` from the fundamentals weeks goes into `src/` and gets imported once in `main.tsx`, where the template already imports its own `index.css`. Each module's stylesheet gets imported by that module's page. The variables and the class names you agreed on stay exactly what they are. That's the whole reason we got them right first.

Now the rewrite starts. Last week you marked the pieces that repeat in your static pages: a card, a table row, a form field with its label. Take one or two from your own module and turn them into components, the way the card above became one: a function, a props type, the JSX. Render each of them a few times in your own page with made-up data, and check that TypeScript complains when you leave a field out. That's all for this lesson. No lists, no state, no clicking yet. It'll feel small. Next lesson the tree grows.

The backlog doesn't change much yet, but start noting per page which components it's built from.