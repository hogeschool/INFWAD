# Web Fundamentals 4: JavaScript, thinking in functions, and frameworks

In Lesson 1 we already made a static web page interactive. In the calculator example, we used a button, two number inputs, and a handful of lines of JavaScript to do the DOM manipulation. Find a node, listen for an event, change a node. That's basically the shape of every interactive page on the web.

The problem is, that way of writing the code won't scale very well.

For a basic calculator it's fine. But the moment a page has a list that grows and shrinks, has data arriving from a server, and a dozen things on screen that all have to stay in sync, writing find-listen-change by hand turns into a lot of bookkeeping. You spend your time managing the DOM instead of building the thing you actually set out to build.

The last few lessons were about the vanilla web: HTML, CSS, and a bit of JavaScript by hand. Next lesson we start using a framework. This one sits in between, and it has one job: show you when doing it by hand is a bad idea, and get you comfortable with the style of JavaScript that modern frameworks are built on.

## A closer look at JavaScript

You've already played around with JavaScript, and run into it in the wild, countless times, on the web, perhaps without knowing it.

But where are my manners? Let's give JavaScript a proper introduction!

It was born in 1995. Brendan Eich wrote the first version in ten days. (Some say it shows.) It runs in every browser on Earth, which is its superpower and also why it's a bit messy: every browser vendor had to agree on it, slowly, over decades.

It's a dynamically typed language. A variable can hold a number, then a string, then an object, and the runtime will not complain. JavaScript is permissive to a fault: it will let you do almost anything, including things that make no sense. `[] + []` gives you an empty string. `0.1 + 0.2` is `0.30000000000000004`. Let's not get into that. It is weird.

It also evolves. The JavaScript you write today (often called ES2015 or later) is a lot nicer than the JavaScript of 2005. We are using the modern version.

> 🎓 Ok, you know what? I changed my mind. Let's get into the weirdness. Open your browser's DevTools console and run `[] + []`, then `0.1 + 0.2`, then `"5" - 3`, and then `"5" + 3`. The first three give odd answers, the last gives `"53"` instead of `8`. JavaScript accepts almost any expression and tries its best, even when its best is nonsense. That's why from the next lesson on you'll be writing TypeScript, and a type checker rejects most of these before the code ever runs.

Coming from C# and Python in year 1, here is what tends to feel different:

- There is no classes-first culture. JavaScript has classes, but most modern code is built out of functions and plain objects, not class hierarchies. More on that further down.
- There is no `Console.WriteLine` or `print`. You use `console.log`, and the output shows up in the browser DevTools.
- A lot happens "later" instead of in a straight line. Events and asynchronous code: waiting for a click, loading data from a server. We'll deal with that in one of the upcoming lessons.

One last thing, and then we move on. Starting next lesson, all the code you write will be _TypeScript_. For now, just think of it as JavaScript with a type checker added on top. You'll see some type annotations in the examples in this lesson, so you get used to looking at TypeScript from the start.

## The limits of doing things by hand

Let's start with an example: you have some products, and you want to show them on the page.

```js
const products = [
  { name: "Laptop", price: 1200, inStock: true },
  { name: "Phone", price: 800, inStock: false },
  { name: "Tablet", price: 600, inStock: true },
];

const container = document.querySelector("#product-list");

products.forEach((product) => {
  const card = document.createElement("div");
  card.innerHTML = `<h3>${product.name}</h3><p>€${product.price}</p>`;
  container.appendChild(card);
});
```

This works. The page shows three product cards. For a list that's built once and never changes, you could use this.

But what if a user adds a new product? Or removes one, or filters the list, or sorts it. The moment that happens, this code is not enough, because it only knows how to build the list from empty. To show an updated list you have to clear what is there and build the whole thing again:

```js
function renderProducts(products) {
  container.innerHTML = ""; // throw away the old cards

  products.forEach((product) => {
    const card = document.createElement("div");
    card.innerHTML = `<h3>${product.name}</h3><p>€${product.price}</p>`;
    container.appendChild(card);
  });
}
```

Now every piece of code that changes the products has to remember to call `renderProducts` again afterwards. Miss one call and the screen will still show the old data. And this is the easy version. Real pages have many small pieces that each depend on different bits of state, and rebuilding the whole HTML every time is wasteful and slow. So you start writing clever code that updates only the parts that changed. That clever code becomes more and more complicated, and that's where the bugs live.

And at some point it becomes unmaintainable. It's not that any single line is hard. The problem is that keeping the DOM in sync with your data, by hand, across a whole application, does not scale. Spend more than a few months building a large app this way and you end up with a codebase nobody wants to touch.

To fix this we need two things: a better way to handle the data itself, and a framework that hands the DOM-syncing problem to a tool. In this lesson, we'll focus on the first thing. The framework comes next lesson.

## Thinking in functions

We're going to start by changing _how_ we write code.

### From loops to transformations

In year 1 you probably wrote a lot of code that looked more or less like this:

```ts
const numbers = [1, 2, 3, 4, 5];
const doubled: number[] = [];

for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}
```

A loop, a counter, an empty array, a push on every step. It works. It is the standard imperative style: you're spelling out, step by step, how the machine should build the result.

Here is the same thing in modern JavaScript:

```ts
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2);
```

Both produce `[2, 4, 6, 8, 10]`. The second version is shorter, but shorter is not really the point. The point is that there is no loop counter to get wrong, no empty array to forget to initialise, and no mutation: `numbers` is untouched, and `doubled` is a brand new array, filled with the output of `map()`.

You are describing what you want (each number, doubled) rather than telling the browser how to do it.

> 🎓 Let's try it, to get used to it. Open the DevTools console on any page and run:
>
> ```js
> [1, 2, 3, 4, 5].map((n) => n * 2);
> ```
>
> See the new array come back. Then try:
>
> ```js
> [1, 2, 3, 4, 5].filter((n) => n > 2);
> ```
>
> Then chain them:
>
> ```js
> [1, 2, 3, 4, 5].filter((n) => n > 2).map((n) => n * 2);
> ```
>
> Read that last one out loud: "the numbers, the ones bigger than two, doubled." Reading it like that makes it clear that we are describing what we want, instead of doing it by hand.
>
> You'll get used to the new syntax quickly.

### Arrow functions

The thing inside `.map(...)` in the example above is a function. A small one, written inline. Modern JavaScript has two forms for writing functions, and you'll use both:

```js
// Named function declaration
function double(n) {
  return n * 2;
}

// Arrow function (the "fat arrow" form), the same function written differently
const double = (n) => n * 2;
```

Now, let's add TypeScript's type annotations to make the types specific.

```ts
// Named function declaration
// (The second ': number' is the type of the return)
function double(n: number): number {
  return n * 2;
}

// Arrow function (the "fat arrow" form), the same function written differently
const double = (n: number): number => n * 2;
```

Named function declarations are common for top-level things with a name, including React/Vue components (next lesson).

Arrow functions show up everywhere else: callbacks, event handlers, and the little inline transformations you pass to `.map()`.

The arrow form has a few different shapes:

```ts
// One parameter, expression body: the return is implied
const double = (n: number): number => n * 2;

// A block body needs an explicit return
const greet = (name: string): string => {
  const message = `Hello, ${name}`;
  return message;
};

// Returning an object literal: wrap it in parentheses
const wrap = (n: number) => ({ value: n });
```

When an arrow function is passed somewhere TypeScript already understands, like a callback to `.map()` on an array of numbers, you can drop the type annotations. TypeScript works the type out from the context:

```ts
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2); // n is known to be a number
```

Writing `(n: number) => n * 2` there is not wrong, but it's just not needed. Most TypeScript code leaves the types off when the surrounding code already makes them obvious.

One small thing that might confuse some people: the arrow `=>` and the comparison operators `>=` and `<=` look alike at a glance, especially at a small font size. Read carefully when you're scanning unfamiliar code.

### map, filter, and reduce

`.map()` is one of a small family of array methods that take a function and apply it to the array for you. They are called **higher-order functions**, which just means a function that takes another function as an argument. You'll be using these _a lot_.

`map` transforms every element and returns a new array of the same length.

```ts
const products = [
  { name: "Laptop", price: 1200, inStock: true },
  { name: "Phone", price: 800, inStock: false },
  { name: "Tablet", price: 600, inStock: true },
];

const names = products.map((p) => p.name);
// Result: ["Laptop", "Phone", "Tablet"]
```

`filter` keeps only the elements that pass a test, and returns a new, possibly shorter array.

```ts
const available = products.filter((p) => p.inStock);
// (p.inStock is a boolean, so this is the same as 'p.inStock == true')
// Result: Laptop and Tablet

const affordable = products.filter((p) => p.price < 1000);
// Result: Phone and Tablet
```

`reduce` boils a whole array down to a single value. It's the most flexible of the three and the trickiest to read.

```ts
const totalPrice = products.reduce((total, p) => total + p.price, 0);
// Result: 2600
```

The `0` at the end is the starting value, the accumulator. The function gets the running total and the current element, and returns the new running total. After the last element, the final total is the result. If you forget the starting value, `reduce` behaves oddly, so make a habit of always providing it.

These methods all return new arrays, which means you can chain them (which is the beauty of this pattern!):

```ts
const totalAvailableUnder1000 = products
  .filter((p) => p.inStock)
  .filter((p) => p.price < 1000)
  .reduce((total, p) => total + p.price, 0);
// Result: 600
```

Read it top to bottom: take the products, keep the in-stock ones, keep the ones under €1000, add up their prices.

> 🎓 `reduce` could be the hardest to get used to if it's new to you. Make sure you try out the example for yourself: copy the example to the DevTools console, and edit the chain so it's doing one method at a time, and you see the array shrink at each `filter` and collapse to a number at the `reduce`.

None of this means old-school loops are bad. But for the everyday job of "I have an array, I want a transformed array," `map`, `filter`, and `reduce` are shorter, harder to break, and they match the style of every modern frontend codebase you'll work in. For now, remember: if you find yourself writing a loop, try to see if you should be using one of these higher-order functions instead.

> 🎓 Ok, now you write some. You've watched `map`, `filter`, and `reduce` run, but to remember them, it's good to practice a little. Here are three loops in the imperative style. Rewrite each one using `map`, `filter`, or `reduce`. The third one needs a `filter` and a `reduce` working together.
>
> (You can do this in the console tab inside your browser's DevTools. Type `console.log(withVat)`, etc to see the results.)

```ts
const products = [
  { name: "Laptop", price: 1200, inStock: true },
  { name: "Phone", price: 800, inStock: false },
  { name: "Tablet", price: 600, inStock: true },
];

// 1. Every price with 21% VAT added
const withVat = [];
for (let i = 0; i < products.length; i++) {
  withVat.push(products[i].price * 1.21);
}

// 2. Only the products that are out of stock
const soldOut = [];
for (let i = 0; i < products.length; i++) {
  if (!products[i].inStock) {
    soldOut.push(products[i]);
  }
}

// 3. The total price of just the in-stock products
let inStockTotal = 0;
for (let i = 0; i < products.length; i++) {
  if (products[i].inStock) {
    inStockTotal += products[i].price;
  }
}
```

> Run your version next to the loop and check they give the same answer. If you get stuck on the third one, look back at the previous examples.

### Immutability and pure functions

Notice what `map` and `filter` did not do: they did not change the original `products` array. They each returned a new array and left the input alone. That is not an accident. It is the whole idea.

A value is immutable when it's not changed after it's created. Instead of editing the thing you have, you produce a new thing. `map`, `filter`, and `reduce` all work this way.

Closely related is the idea of a pure function. A pure function always returns the same output for the same input, and it changes nothing outside itself: no editing of global variables, no writing to the DOM, no surprises. The function you pass to `.map()` should be pure. Given a product, it returns that product's name, and does nothing else. Because a pure function depends only on its inputs, you can read it on its own and know exactly what it does. You do not have to trace the rest of the program to understand it.

Modern frontend frameworks work like this, and expect you to do the same. They expect the state of your app to be treated as immutable. Updating state means handing the framework a new value, not editing the old one.

#### Why?

In short: working this way saves you a lot of debugging. The trouble starts when one object is shared and passed around to different functions across your code, and something quietly changes it in one spot. A value you never touched is suddenly causing unexpected behaviour somewhere else, and now you have to put on your Sherlock Holmes cap and spend the afternoon tracing its steps. Keep everything immutable and that whole class of bug never shows up.

All of this is part of **functional programming**, which is declarative, instead of imperative.

### A note on recursion

One more idea before we leave functions: a function is allowed to call itself. That is recursion. It might take some practice before you get used to thinking like this.

Some mathematics as an example. The factorial `4!` means `4 × 3 × 2 × 1`, which is `24`.

You could do that calculation with a loop:

```ts
function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result = result * i;
  }
  return result;
}
```

But we can rewrite that in a cleaner way, by letting the function call itself:

```ts
function factorial(n: number): number {
  if (n <= 0) return 1;
  return n * factorial(n - 1);
}
```

The `if (n <= 0) return 1;` is the part that matters most. It is the stopping point. Without it, the function calls itself forever. Every recursive function needs a case where it stops calling itself, or it runs until the program gives up.

You probably won't write much recursion when you start with React or Vue. It comes up when you work with data shaped like a tree (a comment thread with replies to replies, a folder containing folders), where the structure repeats inside itself. For now, just recognise it when you see it: a function calling its own name. You'll see more uses for it once you advance a little.

## Single-page applications and frameworks

Now back to why writing DOM manipulation logic by hand doesn't scale.

The skeptical version of you probably has a fair question here: "Do I really need a framework for this?"

For a small site, no, and you should not feel bad about skipping it. I still build small things with plain HTML, CSS, and JavaScript. Frameworks can make a small site more complex than it needs to be. The framework earns its place when the app gets large.

### Two ways to build a site

The original way the web works goes like this: you click a link, the browser sends a request to a server, the server sends back a complete HTML page, and the browser throws away the page it was showing and renders the new one from scratch. This is a multi-page application. It's still how most blogs, news sites, and documentation sites work, and it's still completely fine. Wikipedia is a multi-page application.

A single-page application works differently. On the first visit the browser loads one HTML page, and from then on JavaScript takes over. Click something, and instead of fetching a whole new page, JavaScript fetches just the data it needs and updates the DOM in place. The page never does a full reload, but the address bar still changes and the back button still works. It feels less like a series of web pages and more like a desktop application. Gmail, Trello, Spotify in the browser: those are single-page applications.

Making it feel more like an application has a cost, and the cost is complexity. The browser is now running one long-lived JavaScript program that has to hold the state of the whole app, decide which "page" to show for which URL, fetch data, and keep a user logged in as they move around. Written by hand, that becomes a lot of complicated code.

Keep in mind, though: single-page applications are not the right answer for everything. A blog or a content-heavy site is usually better off with the multi-page approach. "Everything should be a single-page app" is fashion, not an engineering rule.

> 🎓 Try this to see the difference behind the scenes: open a multi-page site (Wikipedia) and a single-page app (Gmail) side by side, each with the DevTools Network tab open. Navigate around both. On Wikipedia, every click loads a fresh document. On the single-page app, clicks fetch small bits of data and the document itself never reloads. The difference is visible right there in the Network tab.

### What a framework actually does

If you ignore the marketing, a framework like React or Vue does two things:

First, it lets you describe the UI as a function of state. You say "when the data looks like this, the screen should look like that," and you write that as a component. You do not write the steps to get there.

Second, when the state changes, it updates the DOM for you, efficiently, touching only the parts that actually need to change.

Remember the product list we rebuilt by hand, the one where every change meant clearing the container and regenerating every card's HTML? Let's use React as an example just for this moment: you describe the list once, as a function of the products array:

```tsx
function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      {products.map((product) => (
        <ProductCard product={product} />
      ))}
    </div>
  );
}
```

When the `products` array changes, React figures out what should change on the screen and updates the DOM itself. You never write `container.innerHTML = ""` or call a `renderProducts` function again. That whole category of bugs is gone, because you stopped doing that job by hand.

We won't explain this syntax now. The thing to take away is the shape of it: a component is a function, the screen is described from the data, and `.map()` is right there in the middle of it.

The three frameworks you'll hear about most are React, Vue, and Angular. React is a UI library, born at Facebook, used just about everywhere. Vue is quite similar in spirit. Angular is a larger, more opinionated framework, common in enterprise software. The syntax is different, but underneath, they are all solving the same problem in the same way. Learn one well and the next one is mostly new syntax for ideas you already have.

### Where the tools come in

A real single-page application is a lot of code: the code you write, plus all the library code you pull in (React/Vue itself, a router, and so on). That's far too many separate files for the browser to load one by one. It would take too long to load. On top of that, the browser does not understand TypeScript. Something has to deal with all of that.

That something is a build step. A tool reads your project, follows every `import`, pulls all the code together, converts the TypeScript into plain JavaScript the browser does understand, and produces a small set of files to actually serve.

You'll meet all of it hands-on next lesson, and after the first setup you can forget it's there for a while. That's the idea. The tooling does all the conversion and optimization work so you can spend your attention on the actual application.

## Looking ahead

Next lesson we install the tooling, set up a first project, and write our first component.

The tools mentioned above will need Node.js installed. Prepare for the next lesson by [following the instructions here](../X%20-%20Extra/Setup%201%20-%20Nodejs.md).

If you had trouble understanding the "thinking in functions" section in this lesson, read it again, and try to practice a little. But don't worry, you'll get it once you start using it. So give it some time, then come back to it later or read a bit more online.

## Resources

- MDN's JavaScript Guide. The best free reference for the language. https://developer.mozilla.org/docs/Web/JavaScript/Guide
- MDN on array methods. `map`, `filter`, and `reduce`, plus the related ones we did not cover (`find`, `some`, `every`, `flatMap`). https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
- The TypeScript handbook, "Everyday Types." Worth a read before the next lesson if you want a head start. https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

## Applying this to your project

This is the last week your project is plain HTML and CSS, and the temptation might be to make the pages do something: a bit of JavaScript that adds a row to the list, filters it, shows a message. Don't. Next week the framework takes over exactly that job. Hand-written JavaScript in the project now is work you throw away in a week.

Use the week to finish the static version instead. Every page your module needs, inside the shared shell, mobile-first, using the shared variables and class names. (You can still make it more beautiful in the coming months. Focus on getting the basics right first.) When that's done, look at your pages the way this lesson looks at code: which pieces repeat? A card, a table row, a form field with its label, the navigation. Those are the pieces that turn into components in the next lesson, so knowing where they are now is a head start on the rewrite.

And the backlog: by the first React lesson it should list, per module, the pages, the rules, and what each page lets a user do. That list is what the rewrite works from, so the static pages and the backlog together are your plan for the rest of the semester.