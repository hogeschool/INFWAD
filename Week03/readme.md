# Lecture notes: Week 3 - Front-end fundamentals part 2

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## 1. Introduction by Ronald Vonk

The 1990s.

30 years ago, I was dialing up to the web for the first time. Me and my
friend were using Netscape Navigator 2.0. We thought it was amazing,
even though you had to be very patient and wait for ages for everything
to load. Back then we had many other options to go online as well, like
IRC for chat, BBSses, and CompuServe which was like a cross between a
forum and Wikipedia.

But we could already sense that the world wide web was going to be 'it'.

One thing that was cool about Netscape was that it had JavaScript.

When they announced it, they said in their press release:\
JavaScript is an easy-to-use object scripting language designed for
creating live online applications that link together objects and
resources on both clients and servers.

It added interactivity to HTML.

Together with JavaScript 1.0 came another key innovation: the Document
Object Model (DOM). More about that one later.

Microsoft, around that same time, released Internet Explorer 3, which
included their own version. With Internet Explorer 5, in 1999, Microsoft
also introduced the first practical way to send asynchronous HTTP
requests via JavaScript. I could talk for days about all the differences
between browsers, because back then, we had to write specific code for
each browser and browser version, to make sure the websites we made
worked for everyone. Luckily, that part has gotten a lot easier these
days.

It does point out the unique challenge that front-end developers have:\
You have no control over the environment your code is running in. You
don't compile it yourself, but send it out there. And it will be
interpreted in different ways, for example, by:

- Lots of different browsers and browser versions on different devices

- Search engines

- Specialized tools or browser extensions for disabled people

- Test automation software

- AI tools

The way your code is interpreted also has multiple different dimensions:
Sometimes it is mined for data, other times it is interpreted for
interaction.

But the nice thing back then was, they were just a bunch of text files.
Your HTML, CSS and JavaScript could be made with Notepad and you could
upload it for free to host your homepage.

That low barrier to entry is probably what made the world wide web so
successful and made it what it is today.

It's actually a bit of a shame that a lot of it has gotten so complex
these days. The evolution of jQuery, npm and later the big frameworks
like Angular, React and VueJS has made it possible to develop and
maintain bigger web applications and work. But it is good to know that
under the hood, everything still works the same way. Sure, HTML, CSS and
JavaScript have also evolved and are now a bit more advanced. But it is
still quite easy to get started in, and you can build pretty cool stuff
just by using those basic technologies.

There is still nothing wrong with building something yourself with plain
JavaScript. There are actually new frameworks like Nue popping up now
that want to remain closer to that, and stay lightweight. It will be
interesting to see where that goes.

My point is this: This ancient history stuff is still relevant. The past
is never dead. It isn't even past. It is still there, doing its thing,
underneath what we're working on in the present moment.

There's value in sometimes zooming out and looking at that bigger
picture. Maybe what everyone is doing now has gone a bit too far, and we
could see a different road to take.

Remember that.

But, that's enough history and philosophy for now.

## 2. The DOM

The **DOM** (Document Object Model) is an API that represents and
interacts with any HTML or XML-based markup language document. The DOM
is a document model loaded in the browser and representing the document
as a node tree, or **DOM tree**, where each node represents part of the
document (e.g., an element, text string, or comment).

The DOM is one of the most-used APIs on the Web because it allows code
running in a browser to access and interact with every node in the
document. That means it connects web pages to scripts or programming
languages. Nodes can be created, moved, and changed. Event listeners can
be added to nodes and triggered on the occurrence of a given event.

The DOM is not part of the JavaScript language, even though it is mostly
used by JavaScript. You could implement the DOM API in Python, as well,
for example.

There are a lot of things I could list here about the DOM, like events:

- Mouse events

- Touch events

- Keyboard events

- Form events

- Window events

But you can figure out the details for yourselves while you are working
on your code, by going to the Mozilla Dev Docs. Which was founded by the
Netscape Navigator people 20 years ago!

MDN: https://developer.mozilla.org

### 2.1 Inspecting the DOM

Let's start by opening the developer tools in the browser. I'm using
Safari, but the other browsers have this as well.

1.  *Open the browser console and inspector*. Try selecting specific
    HTML tags from the DOM via the inspector (Could be used while
    debugging frontend). Also check out the computed styles on the
    right-hand side of the inspector tab.

2.  Try some very simple examples via the browser console
    (document.getElementBy...()) in a simple website (example.com or any
    other simple example). Try the following things:

    a.  Get the content of a specific paragraph node

    b.  Get the content of a node with a specific ID/class name

    c.  Alter the content (text, ID, CSS, etc) of the nodes that were found

    d.  Add a node to a child

3.  Show some special DOM events

    a.  Mouse events

    b.  Click event (Example: [`1_javascript-click-event.html`](./Examples/1_javascript-basics/1_javascript-click-event.html))

    c.  Keyboard events

    d.  Form events

    e.  Window events

Use MDN <https://developer.mozilla.org> if you need help with this.

### 2.2 Examples in code

The examples contain a simple calculator app where some DOM manipulation
happens, using an onclick event on a button.

1. **Basic inline script tag examples**

    > Study the example: [`0_javascript.html`](./Examples/1_javascript-basics/0_javascript.html)

    > Study the example: [`1_javascript-click-event.html`](./Examples/1_javascript-basics/1_javascript-click-event.html)

2. **More advanced, separate .js file, using DOM manipulation to create HTML elements**

    > Study the example: [`2_javascript-dom-manipulation.html`](./Examples/2_dom-manipulation/2_javascript-dom-manipulation.html)


## 3. Client-server interaction

Firstly, about forms and validation:

The most important lesson about forms is... Don't annoy your user!

A lot of what you will be making as a web developer is some sort of user
interface that will capture input from a user. UX stands for user
experience. Which means, what the user experiences when he or she uses
your web application. Make sure it is a great, and seamless, experience.

Always keep thinking about the user. All of your different users. When
you only think about the technical stuff, like preventing data
inconsistencies, etc, you are surely going to annoy your user, and if
you're a business, that means customers who are going to leave and not
buy your stuff.

Think, for example, about any of your own experiences in the past, with
web forms that didn't accept your submitted data because you had to
write your phone number in a very specific way, or a 'new password'
field that forces some weird format on you, even though you already know
how to make a strong password (long and with random words is better than
short and with lots of strange characters).

### 3.1 HTTP requests in the browser

Open the dev tools in your browser and inspect the Network tab. Go
through some of the requests of your favorite example website, and look
at the request headers, body, and the response for some of the API
requests, to get an idea of how data is loaded asynchronously using
requests and JSON response bodies.

JSON is a simple format used to store and transport data. It is a
plain-text format, which allows for easy data interchange between
different programming languages. JSON is often used to send data between
web applications and servers.

Do go and read more about it:\
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON

### 3.2 Last example

We have included an example to play around with that includes the same
calculator, but it is now using a .NET backend with some API endpoints.
You can try to run it (you will have to install .NET SDK, then Open the
folder, look at the Solution Explorer in VSCode, Build the backend, and
then run it. Look for the debug console, where you'll find the localhost
URL with the port (probably <http://localhost:5011>).

You can already learn a little bit about getting started with .NET. Or
you can just study the code in your editor, besides watching the
recording of this lesson, where I demonstrate this in the browser.

> Study the example in folder: [`3. Client-server interaction`](./Examples/3_client-server-interaction/)

### 3.3 Some things about modern front-end frameworks and tooling

A short history overview, for some perspective. Topics that you could
look into if you want to know more about how we got here:

1. jQuery

2. Package management

    - Grunt, gulp
        - Were concatenating, which means just adding .js files together.
        - Minifying (making the file smaller, optimizing for performance).
        - In a settings file you could add external dependencies to your project.

    - npm\
    Collection of reusable JavaScript code in the form modules.

    -  Module loaders, making larger codebases more manageable

    - Then came other tools like Webpack, which looked at what was
    needed when, and optimized all web assets for loading. Because
    there is a maximum number of connections to load file
    asynchronously, it was optimizing the load order and size.\
    Webpack and React became popular together. One made the other
    possible.

    - After that came ESBuild and Vite. Most of the above are still being used.

3. Same for CSS. Pre-processing, etc. Sass and SCSS.

4. Lots of tools these days. Makes front-end development easier for
bigger projects, but also a more complex. Like I said, it's nice to
remember you can still do stuff just using the standards. For small
projects, there is something to be said for things like [static site
generators](https://jamstack.org/generators/). That's a whole other
history tree that we could go through with things like Jekyll, Hugo,
etc. And now, we are going there again with server-side rendering of
Angular and NextJS.

If you want to read more: <https://en.wikipedia.org/wiki/JavaScript>

## 4. Introduction to TypeScript:

In the old days, JavaScript was the only way to add some degree of
intelligence and logic to web applications on the client side. From form
validation in real-time, to more sophisticated functionality that makes
web applications feel a lot more like desktop applications, JavaScript
became incredibly popular.

However, over time, teams working on big applications were suffering
from the biggest missing functionality: static types. A long time ago
(2012), Microsoft published TypeScript. A fully open source programming
language with just one clear, explicit goal in mind: add types to
JavaScript. The task was not simple at all, because JavaScript has to
deal a lot with API communication and unstructured JSON data, and
traditional type systems (let\'s say à la Java or C#) would not be able
to correctly capture the subtlety of the way unstructured JSON is parsed
into safe types known at compile-time. The common usage of formatted
strings for routes also made this challenge extra complicated.

Not even languages such as Haskell or F# with their advanced type
systems were cut for the job. Something new and more powerful was
needed.

TypeScript started off with a clean slate. On top of a simple,
traditional type system (the sort of thing that says that it\'s not OK
to pass a string to a function expecting a number), more and more
advanced types were added, but always in a way that would be at the same
time theoretically impeccable as well as elegant, intuitive, and
pragmatic. The result was elegant, and more powerful than most type
systems available anywhere in the industry. TypeScript became a beloved
industry standard very quickly, adopted almost universally. Developers
with a theoretical background could build awesome tools and libraries
that pragmatic web developers could use intuitively and without having
to get a PhD in Computer Science (yes, Haskell, we are looking at you!).

TypeScript is a compiled language (ignore the word transpiled, if you
ever read that somewhere). When you take a high level language and
translate it automatically into a lower level language, it\'s
a *compiler*.

The process of compilation will start by type checking the program in
order to make sure that there are no violations to the type system rules
that might cause errors ultimately leading to a wrong datatype being
used in a place where this does not make sense (like \"a string is not a
number\"/42). After type-checking, if no errors have occurred, the
original type annotations of TS, as well as any advanced features of the
language, will be either stripped away (\"elided\") or simplified into
plain JavaScript. The resulting JavaScript will have the guaranteed
property that it is well behaved, meaning that it will not attempt to
violate the rules of reasonable types.

We will dive into TypeScript during the upcoming lessons.

## 5. Extra resources to study:

More about HTTP requests in JavaScript:\
https://kinsta.com/knowledgebase/javascript-http-request/

More about crawlers and SEO (Search Engine Optimization):\
https://www.cloudflare.com/en-gb/learning/bots/what-is-a-web-crawler/
