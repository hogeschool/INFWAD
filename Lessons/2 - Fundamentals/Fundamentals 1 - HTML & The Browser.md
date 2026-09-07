# Web Fundamentals 1: HTML, the browser, and the DOM

Let's start with a story about that amazing time, the 1990s.

Over 30 years ago, I was dialing up to the web for the first time. Me and my nerdy friends couldn't stop talking about Netscape Navigator 2.0. We thought it was amazing, even though you had to wait for ages for everything to load.

Back then we had many other options to go online as well, like IRC for chat, BBSes for, well, mostly for downloading copies of PC games, and CompuServe which was like a cross between a forum and Wikipedia. But you could already feel that the World Wide Web was going to be _it_.

One thing that was cool about Netscape was JavaScript. The press release at the time said: _"JavaScript is an easy-to-use object scripting language designed for creating live online applications that link together objects and resources on both clients and servers."_

It added interactivity to HTML. Together with JavaScript came another innovation, the Document Object Model (DOM). More about that one later.

A bit later, Microsoft released Internet Explorer 3, which had its own JavaScript implementation. With Internet Explorer 5, in 1999, they introduced the first practical way to send asynchronous HTTP requests from JavaScript, which eventually grew into the modern web app. I could talk for days about all the differences between browsers, because back then, we had to write specific code for each browser and browser version, to make sure the websites we made worked for everyone. Luckily, that part has gotten a lot easier!

What hasn't changed is the unique challenge frontend developers face: You don't control the environment your code runs in. You don't compile it yourself, but send it out there, and then other things interpret it:

- Many different browsers and browser versions on different devices
- Specialized tools for people with disabilities, like screen readers
- Search engines and crawlers
- Test automation software
- AI tools

Sometimes your code is being interacted with by a human clicking buttons. Sometimes it is being mined for data.

But the nice thing back then was, they were just a bunch of text files. Your HTML, CSS and JavaScript could be made with Notepad (I even wrote that in the footer of the websites I built!) and you could upload it for free to host your homepage. That low barrier to entry is probably what made the web so successful and made it what it is today.

It is actually a bit of a shame that it has gotten so complex. jQuery, npm, and later the big frameworks like Angular, React, and Vue made it possible to build and maintain larger web applications. But under the hood, everything still works the same way. Sure, HTML, CSS, and JavaScript have evolved, but they are still simple enough that you can build pretty cool stuff using just those basics.

There is still nothing wrong with building something yourself with plain JavaScript. There are even new frameworks now (Nue, for example) that want to stay close to that lightweight idea. It will be interesting to see where that goes.

The point is: all this old stuff is still relevant. The past is never dead. It isn't even past. It is still there, doing its thing, underneath everything we work on now.

The ever growing technological complexity today can be overwhelming sometimes. You don't always have to go along with it. Remember that. Put on a vinyl record, play a CD, build something just for fun, with barebones technology.

## HTML

Let's get specific.

HTML has been around since 1993. Tim Berners-Lee invented it at CERN. The basics haven't changed that much since, even though it has picked up plenty of new features along the way.

HTML is how you structure content on a web page. It is not a programming language. It uses _elements_ (also called _tags_) to tell the browser how to render content: text, images, buttons, links, inputs.

A tag with some text content looks like this:

```html
<h1>Header</h1>
```

Almost every tag has an opening and a closing form and most can contain other tags, so it becomes a hierarchical structure. Some are not allowed to contain other tags (like `<img>`) and don't have a closing tag.

Tags can have attributes, like this: `<tag attribute="value"></tag>`.

Here is a basic page:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>A basic example page</title>
  </head>
  <body>
    <h1>Header of this piece of text</h1>
    <p>This is a paragraph.</p>
    <p><a href="another-page.html">Link to another page</a></p>
  </body>
</html>
```

That last line, the `<a>` tag, is the original superpower of the web. Linking. One page to another. The web's foundational idea, before anything else.

You don't need to memorise every HTML element. There are about a hundred of them and you'll only use twenty regularly. The ones worth knowing right away are `<h1>` through `<h6>` for headings, `<p>` for paragraphs, `<a>` for links, `<img>` for images, `<ul>` / `<ol>` / `<li>` for lists, `<button>`, `<input>`, and the generic containers `<div>` and `<span>`. The rest you look up as you need them.

Use [MDN](https://developer.mozilla.org/) for that. MDN is still maintained by Mozilla: the same people who created Netscape and JavaScript!

> 🎓 Read through the [HTML Cheatsheet](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Cheatsheet) and [HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element) for a few minutes, to get an idea of what elements are available.

At the end of this lesson, I'll share some links you can use to learn more about using HTML.

Now, let's move on to _why_ HTML is written the way it is.

### Semantic HTML

Semantic means "related to meaning."

You can build a whole page using only `<div>` and `<span>`. People do. (Don't be like them!) It works in the sense that it shows up in a browser. But compare these two ways of writing a simple navigation bar:

```html
<div class="container">
  <div class="links">
    <a href="/">Home</a>
    <a href="/about">About</a>
  </div>
</div>
```

```html
<header>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
```

Both render the same way visually. The second one is better, because it _means_ something. A screen reader knows it's a navigation block. Google knows it's a navigation block. A developer reading the code six months from now sees the meaning at a glance. (Often that developer is you, scratching your head, cursing and crying out loud: "What idiot made this?! Oh wait... _What was I thinking when I made this?!_")

A few reasons why good semantic choices matter:

- A blind user with a screen reader **hears** your HTML structure. The reader announces "navigation" or "main content" if you've used `<nav>` or `<main>`. With a sea of `<div>`s, it announces nothing useful. Government sites in the Netherlands and the EU are legally required to be accessible to everyone. You will run into this in your career!
- Users should also be able to use their keyboard to tab through items on a page in a logical order, and use `Enter` instead of clicking their mouse or trackpad. Most of that works automatically if your structure is good.
- Search engine crawlers use semantic tags to figure out what's important on the page.
- Other developers, including your future self, read your HTML and have to work with it. Generic `<div>` soup is hard to maintain.

> 🎓 Let's try that using only your keyboard to navigate a website. Open a well-built site ([MDN](https://developer.mozilla.org/), for example) and use the `Tab` and `Enter` keys. Watch the focus move through the links and buttons in a logical order. You can use `Enter` to open submenus and links.

The most important reason is probably maintainability. Take it seriously now. Refactoring as you go is much cheaper than rewriting from scratch in one or two years. Trust me. This is still the number one challenge at every company I have ever worked at, large or small.

The most useful semantic tags are `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`. Use them when structuring your pages.

Other examples, to give you an idea:

- Use `<button>` when something is interactive, instead of adding click events to a `<div>`. (If it is for navigation, use `<a>`)
- Give every form input a `<label>`, connected through the label's `for` and the input's `id`. Clicking the label focuses the input, and a screen reader reads the label out when the input gets focus. A placeholder does neither.
- A collection of things that are related should be grouped with list elements `<ul>` or `<ol>`

Our menu example from above would be even better if we used a list, because a screen reader will announce "list, 3 items," so the user knows how many links the nav holds before moving through them with the tab or arrow keys on their keyboard.

```html
<header>
  <nav>
    <ul>
      <li>
        <a href="/">Home</a>
      </li>
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/contact">Contact</a>
      </li>
    </ul>
  </nav>
</header>
```

You will not know all these things in the beginning, but you _should_ get used to thinking about this, and looking up the best practices. When structuring your content, look up the documentation for the element you're using on [MDN](https://developer.mozilla.org/) and do a quick search online on the best structure for whatever part you're building.

> 🎓 Open [https://htmhell.dev](https://www.htmhell.dev). Pick one or two examples, read what's wrong, and why. The site explains the rules, how screen readers respond, what happens to keyboard usability, etc.
>
> Example 1: [https://www.htmhell.dev/27-a6/](https://www.htmhell.dev/27-a6/)
>
> Example 2: [https://www.htmhell.dev/11-the-trigram-for-heaven/](https://www.htmhell.dev/11-the-trigram-for-heaven/)

You have now read other people's bad HTML. Time to fix some yourself.

> 🎓 Practice: Rewrite this snippet with semantic tags. Every `<div>` can go. Use the [HTML Cheatsheet](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Cheatsheet) and [HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element) you visited in the previous chapter as your guide.

```html
<div class="top">
  <div class="title">Retro Game Reviews</div>
</div>
<div class="content">
  <div class="post">
    <div class="post-title">Doom (1993)</div>
    <div class="text">
      The gameplay is fast, aggressive, and incredibly satisfying.
    </div>
  </div>
  <div class="post">
    <div class="post-title">SimCity 2000 (1993)</div>
    <div class="text">
      Quaint by modern standards but it has surprisingly deep gameplay.
    </div>
  </div>
</div>
<div class="bottom">Proudly made in Notepad</div>
```

There is more than one good answer. If you are not sure about a tag, look it up! That's the habit we're trying to build.

## The browser and the DOM

So far I have been talking about HTML as a text file. That is true on disk. The moment the browser opens it, something else happens.

When you type a URL and hit enter, the browser sends an HTTP request to a server. The server sends back HTML, the same kind of text you've just been looking at. Then the browser does roughly four things to turn that text into a page you can see:

- It parses the HTML into a tree of objects
- It applies CSS to figure out how those objects should look (next lesson)
- It calculates where every box goes on the screen
- Then it paints pixels

That tree of objects is called the DOM. The Document Object Model. Every tag, every piece of text, every attribute becomes a **node** in the tree.

Drawn out, a small page looks like this in the DOM:

```
document
└── html
    ├── head
    │   └── title ("A page")
    └── body
        ├── h1 ("Hello")
        └── p ("This is a paragraph.")
```

Each node is a live object in memory. Each one has properties (`textContent`, `id`, `className`, etc) and methods (`appendChild`, `addEventListener`, etc). The whole tree is reachable from one global object: `document`.

The important thing to understand: **the DOM is not the HTML file.** The file is fixed text on disk. The DOM is alive in memory. Code can read the tree, change it, add to it, remove from it, and the page updates immediately. JavaScript does not change the file on the server.

The DOM is how JavaScript talks to the page.

> 🎓 Try it yourself! Open DevTools on any website (In your browser, click the F12 key on your keyboard, or right-click and pick Inspect, then go to the Console tab) and type:
>
> ```js
> document.querySelector("h1").textContent = "Yay! I changed it!";
> ```
>
> The page updates. The HTML file on the server is untouched. Want proof? Right-click the page and pick View page source: the original text is still there. The Elements tab shows the live DOM, View Source shows the file. Now refresh the page, your change disappears, because the browser rebuilds the DOM from the original file.

When we get to frontend frameworks in a few weeks, the magic will be smarter DOM manipulation, with a layer of abstraction so you don't have to write `document.querySelector('...')` yourself. Same mechanism underneath.

Every browser has DevTools. The Elements tab shows the DOM. The Console tab lets you type JavaScript that runs against the current page. Get used to both, because you'll spend a lot of time in there!

## JavaScript meets the DOM

JavaScript is the language that runs in the browser to make pages do things. Its job in this environment is talking to the DOM: reading from it, writing to it, listening for events.

The JavaScript language itself should be easy enough for you, so we will skip the basics. Next week we will go deeper into modern features. For now, the thing to notice is what JavaScript actually does in the browser.

Here is a tiny page that uses JavaScript to do something when you click a button:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Sum Calculator</title>
  </head>
  <body>
    <input type="number" id="num1" placeholder="Enter first number" />
    +
    <input type="number" id="num2" placeholder="Enter second number" />
    =
    <span id="result"></span><br />
    <button id="calculate">Calculate</button>

    <script>
      const button = document.querySelector("#calculate");
      const result = document.querySelector("#result");

      button.addEventListener("click", () => {
        const a = parseFloat(document.querySelector("#num1").value);
        const b = parseFloat(document.querySelector("#num2").value);
        result.textContent = `${a + b}`;
      });
    </script>
  </body>
</html>
```

Three things are happening. The HTML defines two number input boxes, a span container for the result, and a button. The script finds the button by its id and tells it: when somebody clicks you, run this function. Inside the function, we read the input values from the DOM, add them, and write the result back to the span.

That is the basic shape of every interactive web page. Find a node, listen for an event, change a node. (Modern frameworks add a lot on top of this loop, but they don't replace it.)

You will see a different syntax in older tutorials and code: `<button onclick="doSomething()">`. It still works in browsers. Don't write new code that way. Mixing event handlers into HTML attributes makes the code hard to read and harder to refactor. `addEventListener` is the modern way.

> 🎓 Run the calculator example live. Open VSCode, and create a new file with the extension `.html`. Copy the example into the new HTML file, and open that in your browser. (You don't need a server to open an HTML file in your browser!)
>
> Now try it out. Type two numbers and click the button. It works!
>
> Now break it on purpose: change one of the IDs in the HTML and watch the calculator stop working. Open the console to see the error, and then fix it again.
>
> Exercises:
>
> 1. Add a third input and wire it up.
> 2. Change the operation to multiply or divide

A few DOM methods worth knowing:

- `document.querySelector(selector)` finds the first match (selectors use the same syntax as CSS)
- `document.querySelectorAll(selector)` finds all matches
- `element.textContent = '...'` changes the text of an element
- `element.classList.add('active')` and `element.classList.remove('active')` toggle CSS classes
- `element.addEventListener('event', handler)` listens for events
- `element.appendChild(newElement)` adds a child node

When we start using a frontend framework, you will not write this find-listen-change code by hand anymore. You will describe the structure you want as a component, and the framework figures out the DOM updates for you.

## Why bother with all this?

Why should you care about HTML, CSS, and JavaScript fundamentals? Isn't this all ancient history? Won't modern frameworks and AI tools handle this for me?

Nope. Sorry.

Frameworks come and go. The fundamentals don't. Today there are dozens of options and a lot of strong opinions about which one is best. Some of those opinions will look ridiculous in five years. A lot of frameworks exist because someone enjoyed the challenge of building one, not because the world needed another. They get hyped, marketed, adopted, then quietly replaced. HTML, CSS, JavaScript, the DOM, HTTP, all of it is still here. It has been here for thirty years. It will outlast whatever is currently hot.

Cross-disciplinary skills matter more and more. As a backend developer, knowing the basics of HTML, CSS, and the DOM lets you work with the rest of the team. It helps when you apply for jobs. It lets you be a competent tech lead later, instead of one who can't read the code on the other side of the API. The reverse is true if you want to be a frontend developer.

**But the third reason is the big one**. Over the years, by writing things yourself, you slowly build a library in your head. Every time you actually solve a problem and understand something, your library is being built. You can't access it directly to fill it. Reading a book about it doesn't do it. Watching tutorials doesn't do it. There is no Matrix-plug that can fill your brain. You have to be the one writing the code, figuring out how it works, why it works. Not generating, not autocompleting. The 10,000-hour rule doesn't work if you are not the one doing the hours.

That library in your subconscious is what makes you valuable later, so start now. It is what lets you see the big picture in a complex project, recognise where new technologies came from, and pick up the next thing without panic.

Generating your work with AI makes it harder for you to learn. Our body, our brain, is always trying to conserve fuel, so if you make it too easy to just move on 'because it seems to work', you are not going to learn as much about why it works, how it works.

Of course, asking AI to explain something or help you debug is a different mode and can be useful. But pasting prompts and getting code that you copy in without understanding it will make you worse at this job, not better.

So learn the boring foundations until they are not boring anymore. Become an engineer, not just a developer. Engineers stay valuable when the latest framework dies. Developers who only know the latest framework get replaced. As AI gets better and better, make sure you are always learning and understanding, not just using a tool.

Ok, I think I've made my point.

## Up next

Next lesson is about CSS. How the visual layer works, how layout actually behaves, and why most "I just need it centered" problems are not what they look like.

## Resources

### Self-study

This lesson doesn't cover everything. While you build your project you will need to dig deeper, and these are good places to do that:

- [MDN: Structuring Content with HTML](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content)

- These are good free courses on HTML & CSS. Check them out, then choose the one that works best for you:
  - [The Odin Project](https://www.theodinproject.com)
  - [Google's web.dev](https://web.dev/learn/css)
  - [Khan Academy](https://www.khanacademy.org/computing/computer-programming/html-css)

### Reference

- Mozilla Developer Network: https://developer.mozilla.org. Founded by the Netscape people, twenty years ago. Still the best reference.

- HTMHell: https://htmhell.dev. Examples of bad and well-structured HTML, with explanations.

- How I Experience Web Today: https://how-i-experience-web-today.com. A fun and somewhat depressing demo of how annoying a lot of websites have become.

## Applying this to your project

After this lesson your team starts on the case. Before you write a single tag: start by turning the case into a rough backlog (you can keep refining this every week), divide the modules, and set up the repository (the case rules say how).

Then start with HTML only. Take your own module and write the pages it needs as plain HTML files: the list, the form, maybe a detail page. Semantic elements, good grouping, and content that looks real (make up a handful of rows now. Later you can move it to seed data). No CSS yet.

It will look like 1995. Ugly white page, black serif text, blue links. Good. An HTML page without styling is your wireframe: every element is there, in the right order and the right grouping, and nothing distracts you from whether the structure is right. That's the thing to get right this week, because in a few weeks, when we start using a framework, everything you build now gets rebuilt as components, and the component tree is the same tree you're drawing in HTML now. Good structure comes along in that rewrite. Don't worry about making it look pretty yet.

So: rough, simple, and only your module. Skip the states, the rules and the edge cases. A list, a form and one detail page is plenty. There will be time to make it beautiful later.
