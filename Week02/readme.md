# Lecture notes: 1.2 - Front-end fundamentals

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## 1. Quote from the introduction by Ronald Vonk
```
If something is worth doing, it's worth doing right,
and having fun in the process.
```

## 2. HTML

Tim Berners Lee created HTML in 1993, look up some of the story. Those
were exciting times!

### 2.1 Some first things to know

- HTML elements are still the building blocks for structuring and
  creating web pages and web applications.

- It is not a programming language.

- HTML uses elements to tell the browser how to render content on a web
  page.

- Elements are also referred to as tags.

- Can be text, images, buttons, links, etc.

- Format: `<h1>content</h1>`

- It has an XML-like structure. In some projects, having your HTML be
  valid XML can be important. So pay attention to closing every tag,
  including self-closing `<example-component />`

- The tags can have attributes. We'll go through some examples to
  explain that further.

### 2.2 Example

> Study the example: [`0_html.html`](./Examples/1_html/0_html.html)

### 2.3 Semantic HTML

- It is easy enough to find information on all of this. I would suggest
  the Mozilla Dev Docs. Great resource and nicer to work with if you're
  looking for something than asking AI. But however you look it up, you
  have to know what is important. In short, that means things like:

  - Accessibility. When working for government projects there will be
    many specific things you have to consider, like making sure your
    code works well for blind people who use specific tools like screen
    readers to tell them if they are looking at a menu-item or a
    paragraph of text.

  - UX. Make choices for the best user experience. An example is tab
    index. Let a user tab through relevant items on a page in a logical
    order. You might have to do some specific things to your HTML
    structure or add tabindex attributes, for example.

  - SEO stuff / crawlers. Besides humans, machines should also enjoy
    looking at your code.

  - Dev experience. Other developers will have to work with your code
    and they won't think like you. Try to not make them hate you. The
    code should be nice to work with and not break easily if they make
    changes. Tester experience is another variation: Think of the tester
    that will have to work with your code. Tip: For HTML elements that
    have to be found by automated testing: Add a
    **data-test="insert-your-chose-identifier-here"** attribute, so a
    tester has a reliable way to find the element, instead of having to
    make complicated selectors using ID or class.

  - Maintainability. Related, but more about the long term. This
    requires constant rewriting and refactoring every time you make
    changes. I'm sure this subject is not new to you but it applies to
    HTML and CSS as much as it does to your other source code. Think
    about clear structure, easily readable, perhaps comments to explain
    and document complex code (although ideally the code should be so
    clear and beautiful that it doesn't need explanation). You might
    think it's better to work fast and don't worry too much about that,
    but you'd be wrong. Your future self will thank you for taking care
    about that now. Time won in the short term will be paid double in
    the future when your code becomes hard to maintain. Trust me. This
    was the number one challenge at all the companies (large and small)
    I've worked for. Refactor, refactor, refactor, or you can start over
    from scratch in about two years.

- That's why: Semantic HTML is still the way to go. It is relevant to
  all of those. Semantic means 'related to meaning'. I'll get into that
  in the next example.

### 2.4 Example

> Study the example: [`1_html-semantic.html`](./Examples/1_html/1_html-semantic.html)

### 2.5 Why should you care? (Part one. To be continued!)

Why learn HTML, CSS and JavaScript? Here are some practical reasons:

Having knowledge about standards offers significant long-term benefits:

**Try to also learn Timeless skills:**

Knowledge of HTML, CSS, and JavaScript fundamentals remains valuable
across decades, while framework-specific knowledge will quickly become
outdated. Today, there are so many options (and opinions!) to choose from. It can
be quite hard. Because modern frameworks are always built upon the same
fundamentals, it is still valuable to learn about HTML, CSS and
JavaScript.

There are many frameworks and methodologies that are 'hyped' and some
that will become very popular for a few years. The companies and people
using them will be very vocal in their conviction that it is the
absolute best way to do things.

It is however smart to keep some perspective and recognize that this
will change in a few years. It has always been like that. It is useful
to specialize in something for a while, but keep your perspective on the
bigger picture and be open to other things.

In this field, there are many frameworks that were created just because
a developer or group enjoyed the challenge of creating a new framework,
not really because there was a need for another new one. They will then
promote their new thing as the best ever and the way of the future.
Sometimes they are correct for a while, even if it is just because they
had the most successful marketing and became popular.

Furthermore, in software development, especially web development, having
cross-disciplinary experience is going to be very useful. It will
actually be expected of you, in most places. As a back-ender,
understanding the basics of HTML, CSS and how the DOM works will allow
you to work well with the rest of the team, it will help when you're
trying to get a job, and it will let you be a better team lead, tech
lead, or CTO. The same is true vice versa.

Just for yourself, by also picking up experience with the underlying
technologies instead of only focusing on the latest framework or tool,
you will over the years slowly build up a valuable library in your
brain. Sadly, the only way to fill that library in your unconscious is
practice and repetition. There is no matrix to plug into and fill your
brain with knowledge. Even reading a book about it doesn't work. You
have actually be the one doing it and writing the code. Not generating
or autocompleting. That 10.000 hour rule doesn't work if you don't do it
yourself.

In time that library will help you see the big picture in large
projects. It will give you a perspective of where things came from so
new technologies will make sense to you and you can keep growing and
learning more easily.

### 2.6 Some last things about HTML

- Forms and validation\
  When getting to forms and validation, remember a few things:

  - Use client-side validation effectively (use the native browser
    implementations as much as you can so you check input before sending
    it to the server (for instance, using date and time inputs properly
    will make the browser do most of the work for you already).
    Bootstrap and other frameworks might have good implementations as
    well that you can use without having to build things yourself.

  - Consider the same things I mentioned before (accessibility (very
    important with forms), UX (Same! Especially when the form is for
    customers. Make it go as smooth as possible and don't annoy a paying
    customer), SEO, dev experience, maintainability)

  - Remember that for every element and attribute in HTML there will be
    best practices. It might take you a few years before you know all
    those. But get into the habit of doing a search for every element
    you use and check best practices advice. Might seem like overkill
    but it's important. HTML and CSS might seem simple but that is a
    common pitfall for developers. Take it as seriously as the rest of
    the code base.

- Other elements you could use and look into:
  - Video and audio
  - The canvas element
  - SVG

- Fun link about how annoying a lot of websites have become today:\
  <https://how-i-experience-web-today.com/>

- Resources:

  - Your main reference should probably be:
    <https://developer.mozilla.org/>
  - <https://caniuse.com> for checking browser and device compatibility
  - Some fun examples to study related to bad / unreadable HTML vs
    well-structured, semantic HTML: <https://htmhell.dev>

## 3. CSS

CSS might seem quite simple at first glance. It's just styling, right?
Give an element a color and a border. Maybe some margin and padding.

The code itself looks simple and is structured in a simple way. But in
CSS a lot of things are interrelated. One line of CSS somewhere can
change the way everything else on a page renders.

CSS of course requires knowledge of HTML and the DOM. But also of the
different layout modes a browser uses to render a page.

An example is height. Seems easy enough, but setting height: 100%; on an
element will probably never do what you expect unless you understand
more about browser rendering.

It is all relative, but relative to what?

Fun read:\
<https://www.joshwcomeau.com/css/height-enigma/>

So. CSS is simple but complex.\
You have a lot of freedom in HTML and CSS, but that means you have more
responsibilities to do it in a clear, future-proof way. Getting a clear
picture on the best practices for HTML and CSS can be a challenge,
because the web if filled by decades of mis-use and bad practices.
Because of the changing nature of the early days of the web, a lot of
knowledge found online is outdated.

HTML & CSS together can be like a fun puzzle. Or like a box of Lego.
Limited building blocks but lots of creative combination and uses of it.
Don't underestimate it.

### 3.1 Examples about inline css and classes

> Study the example: [`0_html-css-inline.html`](./Examples/2_css/0_html-css-inline.html)

> Study the example: [`1_html-css-classes-ugly.html`](./Examples/2_css/1_html-css-classes-ugly.html)

> Study the example: [`2_html-css-classes-elegant.html`](./Examples/2_css/2_html-css-classes-elegant.html)

### 3.2 More about clean code

As I mentioned before, when I was talking about HTML, Developer
experience (readability, preventing misunderstandings) is a big
priority. Though there will always be a market for someone building
something once and never updating the code, most well-paying jobs in
software development require a team of people to maintain code for
years. Clean, readable, well-structured and maintained code is the goal
and it requires constant refactoring. If your code is messy the chances
are greater that someone else will misunderstand it, or not want to
touch it, causing it to become a dirty unkept corner in the code base. A
risk and a source of frustration and loss of time in the future, when
someone will eventually have to rewrite it all or just throw it away to
start over. Write and continually rewrite code to make sure that someone
else can easily understand and adapt it.

AI can quickly mess up your nicely structured CSS code if you ask it to
refactor it for you, by the way. Be careful. Don't blindly follow its
suggestions.

### 3.3 Naming conventions are important

Check out BEM and SMACSS for examples of what has been done in the past
to provide some rules around that. My advice is keep it simple: Take
inspiration from BEM. Look at my examples and at how Bootstrap does it.
Classnames only, use only lowercase, dashes as separator.

### 3.4 Layout modes

The browser will use different **"render engines**" to render your html+css.
You should know a little about:

- The standard **"flow**" layout (with text and block elements)

- Flexbox

- Grid

- Positioned

- Table

Read this to get some understanding on that:\
<https://www.joshwcomeau.com/css/understanding-layout-algorithms/>

### 3.5 Last reminders

- Simple language means hard work to keep it organized!

- Naming conventions are important

  - Keep it consistent across whole organization or project

- Use Linting tools (for example in a git pre-commit hook), also for
  css.

- Keep cleaning up, refactoring as you go or you will be sorry later
  (Remember Family Guy gif!)

- Common pitfall: point solutions everywhere (look up what the term
  means by yourself). Make your solutions generic and re-usable like the
  rest of your code

### 3.6 CSS Specificity

Prevent headaches, learn about specificity!

> Study the example: [`3_html-css-specificity.html`](./Examples/2_css/3_html-css-specificity.html)

In modern frameworks, CSS is often 'scoped' to prevent a lot of
problems.

### 3.7 Media queries and responsive design

Media queries are the lines of CSS that allow responsive design. That means changing the styling of your UI based on things like screen size.

Study these links:

https://www.w3schools.com/css/css3_mediaqueries_ex.asp

https://css-tricks.com/a-complete-guide-to-css-media-queries/

Another tip: Adding media queries to your CSS will make it even harder to
keep it clean and readable (and thus maintainable). Do your best to keep
refactoring (yes I know, I keep repeating myself) whenever you add
something new to your code.

### 3.8 Warning against ugliness

Sometimes something is popular simply because of marketing and traction,
not because it is actually a good idea. It can take years for people to
drop something like that again! Stay critical. (And don't use
TailwindCSS. It might seem quick, but there is a good chance it won't
take long before you regret it.)

> Study the example: [`4_html-css-too-many-utility-classes.html`](./Examples/2_css/4_html-css-too-many-utility-classes.html)

### 3.9 Bootstrap

Also not perfect, but still a good way to get started and have something
that looks OK without having to re-invent the wheel. Usually, companies
will move away from Bootstrap and build their own component library as
they go. There are, of course, plenty of good alternatives. Material UI,
etc. Bootstrap is what we chose in the past so for now we'll stick to
it.

> Study the example: [`5_html-css-bootstrap.html`](./Examples/2_css/5_html-css-bootstrap.html)

(But honesty, a better tip: Check [the Bootstrap website](https://getbootstrap.com))
