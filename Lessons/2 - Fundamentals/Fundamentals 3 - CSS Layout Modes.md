# Web Fundamentals 3: Layout, responsive design, and CSS frameworks

Doing layout for websites used to be much weirder. Browser support for CSS was incomplete and inconsistent for many years. We built whole websites using complicated `<table>` structures filled with invisible 1x1 pixel GIFs because that was the only way of making it look the way you wanted. We then discovered floats, which were not designed for layout but we used them anyway, alongside a magical CSS hack called `.clearfix` that nobody fully understood and everyone copied from each other. Centering a div became a meme (Google it!).

The good news: it got better. Flexbox arrived in browsers around 2012 and caught on properly a couple of years later. CSS Grid arrived in 2017. The layout part of CSS is now one of the things the web got right.

Thankfully, we don't have to teach you tons of weird hacks and illogical best practices anymore. But CSS layout can still be a challenge to learn. For many developers, it is a frustrating experience (and many give up early, so if _you_ don't, you'll have an advantage!). It doesn't have to be like that if you approach it with the right expectations, so don't underestimate it. Take it seriously, and take your time to figure it out and practice with it yourself, instead of relying on ready-made solutions.

If you learn to understand how these things work, and get a feeling for it, there is a good chance that this experience will stay relevant for the rest of your career (no matter which framework you end up using).

## Layout modes: the first thing to understand

> 🎓 Before reading any further, open a site you use every day, open DevTools, and paste this into the Console tab:
>
> ```js
> document
>   .querySelectorAll("*")
>   .forEach((el) => (el.style.outline = "1px solid red"));
> ```
>
> Now you see that the whole page is made up of rectangles. Every heading, link, image, icon, and paragraph of text: just boxes inside boxes. What you're looking at is the DOM tree from the first lesson, drawn on the screen. CSS layout is deciding where those boxes go and how big they are.

The first thing to know is that CSS has several **layout modes**. A layout mode is something you set on a parent element, and determines how its children get placed.

The three you will use the most:

- **Normal flow**. The default. 'Block' elements stack vertically. 'Inline' elements flow within a line, like text.
- **Flexbox**. Children get arranged in one direction, either a row or a column. Opt in by setting `display: flex` on the parent.
- **Grid**. Children get arranged in two directions at once, in rows _and_ columns. Opt in by setting `display: grid` on the parent.

You don't pick one mode for the whole page. You pick a mode per container.

A page might be a grid at the top level, with a flex row of cards inside the main area, with normal flow inside each card. Most real layouts mix all of them.

> 🎓 Let's demo it before we get into the details. Five identical children, and we only touch the parent.
>
> Try this out on https://developer.mozilla.org/play. Paste the HTML and CSS, then change the styling for `.parent` into `display`, `flex`, and `grid`, and watch the children rearrange.

```html
<div class="parent">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
</div>
```

```css
.parent > div {
  background: #1e2535;
  color: white;
  padding: 1rem;
}
```

With nothing set on `.parent`, the children stack vertically. That's normal flow doing its default thing.

Now add one declaration to the CSS:

```css
.parent {
  display: flex;
}
```

Now, the same five children line up in a row.

Change the `.parent` declaration to:

```css
.parent {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
```

Now they arrange themselves into two columns (`grid-template-columns` means "give me two equal columns"). The children's CSS never changed. All the rearranging came from one line on the parent.

That is the mental model: the parent decides the layout mode, and the mode decides what positioning properties the children respond to. A child of a flex container responds to `flex` and `align-self`. A child of a grid container responds to `grid-column` and `grid-row`. A child in normal flow responds to `margin` and `display`. The same property names sometimes show up in multiple modes, but they mean different things there. The rest of this lesson goes into the details, mode by mode.

## Normal flow: block and inline, the default behaviour

Before flex and grid, you need to understand how the browser renders your HTML by default. That default is called **normal flow**, and it's built around a single distinction: every element is either a **block** or an **inline** element.

**Block elements** take up a full line (between the left and right border of the browser window). They stack vertically, one after another, each on its own row. They respect every sizing property you give them: `width`, `height`, `margin` (all four sides), `padding` (all four sides). Examples of elements that are block by default: `<div>`, `<p>`, `<h1>` through `<h6>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<ul>`, `<li>`.

**Inline elements** sit in line with their neighbours. They flow left-to-right, are only as wide as their content, and wrap to the next line when they hit the edge. The classic inline elements are `<span>`, `<a>`, `<strong>`, `<em>`. The bit that confuses people: inline elements largely _ignore_ `width`, `height`, and vertical `margin` and `padding` if you try to set them. They flow with the text, and the text decides how big they are.

Let's look at some examples of confusing stuff. Try this:

```html
<span class="highlight">A captain's log entry</span>
```

```css
.highlight {
  width: 300px;
  height: 100px;
  background: #1e2535;
  color: white;
}
```

You'd expect a 300 by 100 box. Nope. The span ignores the width and height entirely and stays exactly as wide as its text content. The background color gives it away: it is only behind the letters, no extra space around it. This is one of those things that, once you know it, you'll never forget, because you'll have spent half an hour wondering why your span isn't getting bigger.

A solution could be the `display` property:

```css
.highlight {
  display: inline-block;
  width: 300px;
  height: 100px;
  background: #1e2535;
  color: white;
}
```

> 🎓 Try it first, then read on. It's worth doing live. Copy the HTML and CSS into a new HTML document and open it in your browser (or use https://developer.mozilla.org/play). Notice it ignores the width and height. Open DevTools, and add `display: inline-block` and watch the box appear.

`inline-block` says "behave inline (sit next to other things in a line), but accept block-style sizing." The span is now 300 by 100 and sits in the flow where you put it in the HTML structure. You can also force an element to be a full block with `display: block`, which makes it start a new line and stretch to the full width of its parent. (That defeats the point of using a span, since a div is `display: block` by default, but it's a useful trick on links and buttons that you want to behave like block elements.)

`display` is the property that controls all of this. `block`, `inline`, `inline-block`, and the `flex` and `grid` you'll meet in a moment are all values of `display`. When we say "set `display: flex` on the parent" later in this lesson, we're using the same property you'd use to switch between block and inline.

## The box model

Every element on the page is a box. The box has four parts:

```
┌──────────────────────────────────────────┐
│ margin (space outside the box)           │
│  ┌────────────────────────────────────┐  │
│  │ border (the visible edge)          │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │ padding (space inside)       │  │  │
│  │  │  ┌────────────────────────┐  │  │  │
│  │  │  │ content                │  │  │  │
│  │  │  └────────────────────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

From the inside out:

- **Content** is the actual stuff: the text, the image, the child elements.
- **Padding** is space _inside_ the border. Background color fills this part.
- **Border** is the visible edge of the box.
- **Margin** is space _outside_ the border. It pushes other elements away.

Padding and margin both create space around content, so when do you use which? Padding is part of the box. Margin is space between boxes. If you give a card a `background-color`, the padding gets colored and the margin doesn't. Those things usually determine which you choose.

If you want the box model explained again, slower and spoken, [Kevin Powell's box model video](https://www.youtube.com/watch?v=D_akuQHIPtg) is a good one. It's part of a free beginner course. (The link is also in Resources, at the end of this lesson.)

### Confusion about width (and using `box-sizing`)

By default, when you write `width: 300px` on a block element, that 300 pixels is just the content. If you then add `padding: 20px` and `border: 2px solid`, the actual rendered box is `300 + 40 + 4 = 344` pixels wide (padding and border are on the left and right, so count double). That `width: 300px` in your stylesheet no longer means what it looks like it means and could confuse you later. This is why everybody, on every project, sets this at the top of their stylesheet:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

`border-box` makes `width: 300px` mean _the whole box including padding and border is 300px_. The content area shrinks to make room. This is what you almost always want, and writing this universal reset on day one of a project saves you a lot of headaches later.

> 🎓 Open any site in your browser, open DevTools, click any element. In the **Computed** tab, scroll down: there is a little diagram of the box model with the actual measured numbers. Hover over the parts to highlight them on the page. **This is the single most useful CSS debugging tool in the browser, and most people don't know it exists**.

> 🎓 Spend a few minutes on the box model panel in DevTools now. Inspect a paragraph, a button, an image. Tweak the settings in the Styles tab and see how the numbers update.

## Flexbox

Flexbox arranges its child elements in **one direction**: either a row or a column. That's the whole concept, but it's very useful when creating layouts.

The parent has the layout. Set `display: flex` on an element, and its direct children become flex items, which means they get arranged along an axis you can control.

```
flex-direction: row (the default)

  → → → → → main axis → → → → →
  ┌─────┐  ┌─────┐  ┌─────┐
  │  1  │  │  2  │  │  3  │     ↕  cross axis
  └─────┘  └─────┘  └─────┘
```

```
flex-direction: column

  ↓  main axis
  ┌─────┐
  │  1  │      ←→  cross axis
  └─────┘
  ┌─────┐
  │  2  │
  └─────┘
  ┌─────┐
  │  3  │
  └─────┘
```

Two axes. The **main axis** is the direction your items flow in. The **cross axis** is the perpendicular one. Once you have those two names in your head, every flex property gets easier, because each one is about positioning along one of those axes.

An example. Three mission cards on a page, before flex:

```html
<div class="cards">
  <div class="card">Captain's log #001</div>
  <div class="card">Captain's log #002</div>
  <div class="card">Captain's log #003</div>
</div>
```

```css
.card {
  background: #1e2535;
  padding: 1rem;
  margin-bottom: 1rem;
}
```

The cards stack vertically, because that's normal flow. Each `<div>` is a block, and blocks stack. To get them horizontally in a row, you used to need all sorts of tricks or hacks (floats, or `display: inline-block` with whitespace tricks, or `<table>` tags)

Now we only need:

```css
.cards {
  display: flex;
  gap: 1rem;
}
```

Done. Three cards in a row, with even spacing between them. The parent (`div.cards`) says "I am a flex container, arrange my children in a row," and the children oblige.

The most useful flex properties:

- `display: flex` on the parent. The starting point.
- `flex-direction: row | column`. Which way does the main axis go.
- `gap`. Space between children.
- `justify-content`. Alignment along the **main axis**. `flex-start`, `center`, `space-between`, `space-around`.
- `align-items`. Alignment along the **cross axis**. `stretch` (default), `center`, `flex-start`, `flex-end`.
- `flex-wrap: wrap`. Allow children to wrap to a new line when they don't fit.
- `flex: 1` on a child. Lets that child grow to fill the rest of the available space.

There are more (`align-self`, `flex-basis`, `order`), but the seven above cover the majority of real use cases. For the full reference, the [CSS-Tricks Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) is the canonical resource. It's nice and visual. Open it now, and keep coming back when you're applying flexbox. (There is also a [poster version](https://css-tricks.com/wp-content/uploads/2022/02/css-flexbox-poster.png) worth saving.)

> 🎓 Try playing around with the above examples. Copy the HTML and CSS into a new HTML document and open it in your browser, then play around with the CSS in DevTools and see the layout change. (Or use https://developer.mozilla.org/play to do the same.) Try copying the different properties from above.

> 🎓 Open DevTools on any random page. Find a container with a few children. In the Styles panel, add `display: flex` and watch what happens. Then add `gap: 1rem`. Then change `justify-content`. Tip: You can prototype layouts directly in the browser like this, without touching your editor. Just play around, and then copy your results to your source code.

### Centering a div (now finally possible without being a genius)

The thing CSS used to be famously bad at. With flexbox:

```css
.parent {
  display: flex;
  justify-content: center; /* horizontal axis (by default) */
  align-items: center; /* vertical axis (by default) */
  min-height: 100vh;
}
```

That's all! (Though you should expect to run into other alignment challenges in your HTML/CSS adventures to come... Try to approach those as puzzles to solve... You'll learn things you can keep using later.)

## Grid

Flexbox is for one-dimensional layouts. Grid is for two-dimensional layouts.

If you find yourself building a layout where you care about both rows _and_ columns at the same time (a page layout with a header, sidebar, main, and footer, or a card collection with a fixed number of columns and any number of rows), you can use a grid layout.

```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

That declares a layout with two columns (a 200px sidebar and the rest) and three rows (a header that fits its content, a flexible middle, a footer that fits its content). The children fall into the grid cells in source order.

The unit `1fr` means "one fraction of the remaining space." It's the most useful unit grid added. `1fr 1fr` is two equal columns. `2fr 1fr` is a two-thirds / one-third split. `200px 1fr` is a fixed sidebar plus a flexible main area.

For card collection layouts, this is a useful grid pattern:

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
```

That tells the browser: "make as many columns as fit, where each column is at least 250px wide and at most 1fr." Drop in any number of cards. The grid figures out how many columns to make. It's responsive without a single media query. This pattern alone is worth knowing.

The most useful grid properties:

- `display: grid` on the parent.
- `grid-template-columns` and `grid-template-rows`. Define the tracks.
- `gap`. Same idea as in flex.
- `grid-column` and `grid-row` on a child. Place that child in a specific cell or span.
- `grid-template-areas`. Name regions of the grid and place children by name. Verbose but very readable.

Like flex, there is a [CSS-Tricks Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/). Bookmark it, and browse it once to get an idea of what you can use in your project later. (It has a [poster version](https://css-tricks.com/wp-content/uploads/2022/02/css-grid-poster.png) as well.)

### Flex or grid?

Both are useful, but how do you choose?

- One row or one column of stuff → **flex**. Cards in a row, items in a navbar, buttons next to each other.
- A whole-page layout, or things that need both rows and columns → **grid**.

There's overlap. Both work for many cases. Pick one, see if it works, switch if it doesn't. You'll often nest them: a grid for the page structure, a flex for the header contents, another flex inside the items (like cards) on your page, another flex for the footer, etc.

## Common layout patterns

Some examples of layouts you'll actually need. Each of these will come back in your project.

### One thing centered on the page

```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

### Sidebar plus main content

```css
.app {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
```

Two columns. The left one is a fixed-width sidebar. The right one expands. You can add a header on top by changing to a two-row, two-column grid with `grid-template-areas`. We will practice that in a moment.

### A card list that wraps

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
```

The autosizing pattern again. Resize the browser window and watch the columns reflow on their own.

### Sticky footer

You want the footer at the bottom of the screen if there isn't enough content to fill the page, but pushed below the content if there is. Grid does this naturally:

```css
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

Three rows: header (fits content), main (takes remaining space), footer (fits content). Footer always at the bottom.

The "sticky footer" thing is one of those problems that used to be hard to solve. (You might find some old solutions if you do an online search, but now you know a better way!)

## Responsive design and media queries

Your site has to work on phones. More than half your users will be on mobile, and the small viewport is the harder challenge. Designing desktop-first and trying to retrofit a phone version later usually ends up with a worse phone experience than the other way around.

That's why the best practice is usually **mobile-first**: write your default styles for the small viewport, then _add_ styles for larger viewports inside media queries.

```css
/* Default styles, mobile */
.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

A media query is a block of CSS that only applies when its condition is true. `min-width: 768px` means "this CSS applies when the viewport is at least 768px wide." Stack them in increasing order, and you get a layout that adds complexity as the screen gets bigger.

Still wondering _why mobile-first and not desktop-first?_ Two more reasons. First, hiding stuff is usually easier than rearranging stuff, and a mobile design has less to hide. Second, the mobile constraint forces you to decide what's actually important. If something doesn't fit on a phone, it probably doesn't deserve as much attention on desktop either. You'll find that designs done mobile-first are often cleaner everywhere.

MDN has the full story on media queries: [Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using).

One advanced topic, worth knowing it exists: [CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries). For a long time, media queries could only respond to the viewport. So a card component would always look the same regardless of whether it was placed in a wide column or a narrow sidebar. The card had no way to know. Container queries fix that. They are fairly new (widely supported as of 2023), and you probably won't need them in this course, but if you ever build a component library, you will, and you'll be glad they're there.

### Fluid units

We haven't really talked about units yet.

We've been using 'px' a lot in the examples. Pixels are absolute. They don't scale, and these days, we have to deal with lots of different screen sizes, so scaling is important. For most of your sizing, you want units that respond to context.

- `rem`. Relative to the root font size (typically 16px). Use for almost everything: spacing, font sizes, widths. If a user changes their browser's default font size for accessibility, your whole layout scales with them. `1rem` = 16px by default, `1.5rem` = 24px, etc.
- `em`. Relative to the font size of the _current_ element. Useful for padding inside a button that should scale with its text size.
- `%`. Relative to the parent. Most useful for widths inside a flexible container.
- `vw`, `vh`. Percent of the viewport width/height. `100vh` = full screen height. Use carefully on mobile (the mobile browser's viewport changes when the address bar shows or hides).
- `ch`. Width of one character at the current font. Useful for line lengths: `max-width: 70ch` gives a comfortable reading width regardless of font size.
- `clamp(min, preferred, max)`. A value that scales but never goes below `min` or above `max`. Great for fluid typography: `font-size: clamp(1rem, 2vw, 2rem)` scales with viewport but stays readable at extremes.

Default to `rem` for most sizing. Try out `clamp` and `ch` when you want your text content to look good without writing hard breakpoints.

### Building a page layout

The layout you'll build most often is the classic page shape: a header across the top, a sidebar on one side, a main content area, and a footer. Grid does this well, and there's one more grid feature that's nice to use in this case: `grid-template-areas`. It makes your code easier to read, because you can draw the layout as text: one string per row, one word per cell, and you repeat a name to make an area span more than one cell.

The example below is built mobile-first, the way we just talked about: one column on small screens, the sidebar-plus-main-layout once there's enough room.

```html
<div class="page">
  <header>Header</header>
  <nav class="sidebar">Sidebar</nav>
  <main>Main content</main>
  <footer>Footer</footer>
</div>
```

```css
.page {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
  min-height: 100vh;
}

.page > header {
  grid-area: header;
}
.page > .sidebar {
  grid-area: sidebar;
}
.page > main {
  grid-area: main;
}
.page > footer {
  grid-area: footer;
}

@media (min-width: 768px) {
  .page {
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      "header  header"
      "sidebar main"
      "footer  footer";
  }
}
```

Read the `grid-template-areas` values and you can see the page in them. On small screens everything is one column, stacked, with the sidebar dropping below the main content so the important stuff comes first. Above 768px the header spans both columns, the sidebar and main sit side by side, and the footer spans both columns again. Each child just says which area it belongs to. The order in the HTML doesn't matter anymore now: move `main` above `sidebar` in the markup and nothing changes, because the CSS now decides the positions, not the source order.

Notice what the media query changes. Not the children, not the HTML. Two properties on the parent, and the whole page rearranges. That's the thing `grid-template-areas` is really good at: you redraw the entire layout in one place.

> 🎓 Build this yourself on https://developer.mozilla.org/play. Give each area a different background color so you can see the regions. Get the mobile version working first (one column, everything stacked), then add the media query and watch it become two columns. Resize the window and see the switch happen. (The DevTools also has an icon (top left) for simulating different screen sizes.)
>
> Those coloured boxes are exactly what your project pages should look like at this stage: the areas in the right place, nothing pretty yet. Use whichever combination of the layout tools above (and more) works for you.

## CSS frameworks

Bootstrap and Tailwind are the two you'll hear about most. They are very different things, even though both get called "CSS frameworks."

### Bootstrap (since 2011)

Component library plus a grid system. You write HTML with Bootstrap's class names (`btn btn-primary`, `col-md-6`, `card`), and you get pre-styled buttons, cards, and a responsive grid. It made layout accessible to backend developers who didn't really want to learn CSS, and it standardized what websites looked like for almost a decade. You'll still see it in older projects, and if you want, it is still usable today.

### Tailwind (since around 2017, popular more recently)

Utility-first framework. Instead of pre-built components, it gives you a huge set of single-purpose classes (`flex`, `pt-4`, `text-gray-700`, `md:grid-cols-3`), and you compose those classes directly in your HTML to build up styles. There is no `card` class. You write all the styles inline as a stack of utilities.

It's popular. And sure, the arguments for Tailwind are real. You can move fast. You don't have to invent class names. The constraints (the spacing scale, the color palette) push you toward consistent design. The community is huge. There are good reasons people use it.

I'm personally not a fan. Tailwind makes HTML harder to read (classes like `flex items-center justify-between p-4 md:p-6 bg-gray-100 rounded-lg shadow-sm` start to make your HTML like a messy wall of text), and it makes it very easy to lean on AI to generate styling that you don't actually understand, since the styling and the HTML are mixed together.

Maybe some of you will now ask: _"But at `[company]` they all use Tailwind, are you saying they're wrong?"_ No, I'm not. But in this course, we're writing CSS. Not because frameworks are bad, but because you can't have an honest opinion about a framework if you don't understand what it's doing, and understanding CSS is a more timeless skill than understanding (for example) Tailwind.

Once you know how layout actually works, how the cascade works, how to structure stylesheets, you'll be in a much better position to decide whether a framework is helping or hurting on a given project. Tailwind, used by someone who knows CSS, also looks very different from Tailwind used by someone who doesn't! The same is true of every framework you'll ever touch. Learn the foundation first, then choose your tools.

## What's next

In the next lesson we'll take a closer look at JavaScript and the tools needed for modern frontend development.

## Resources

### Self-study

This lesson doesn't cover everything. While you build your project you will need to dig deeper. These are sources for good learning material about CSS layout:

- [MDN: CSS layout](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout) Well-organized, neutral. The reference you'll come back to for years.

- [Kevin Powell: HTML & CSS for Absolute Beginners](https://www.youtube.com/playlist?list=PL4-IK0AVhVjOJs_UjdQeyEZ_cmEV3uJvx). A free video course by one of the best CSS teachers around. If anything in the last two lessons went too fast, this is the place to take a second, slower pass.

- [Flexbox Froggy](https://flexboxfroggy.com/) and [Grid Garden](https://cssgridgarden.com/). Two small browser games that teach flex and grid. Twenty minutes each, try it!

- These are good free courses on HTML & CSS. Check them out, then choose the one that works best for you:
  - [The Odin Project](https://www.theodinproject.com)
  - [Google's web.dev](https://web.dev/learn/css)
  - [Khan Academy](https://www.khanacademy.org/computing/computer-programming/html-css)

### Reference

- [CSS-Tricks Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/). The canonical flex reference. Bookmark it.

- [CSS-Tricks Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/). Same, for grid.

- Mozilla Developer Network: https://developer.mozilla.org. Founded by the Netscape people, twenty years ago. Still the best reference.

## Applying this to your project

This week: layout. Your pages have structure and a stylesheet. Now you can start working on making it look more organized. The page shape (header, navigation, `main`, footer) is something you should work on together, like the shared styling, so build one `.page` grid in the shared stylesheet, the way the example above does it, and let every module's pages sit inside `main`. (Because we're still working in plain HTML, you copy that part of the HTML into each of your files.) Then lay out your own pages inside that: a list that wraps or stacks, a form in one column, a detail page with its own sub-layout.

Mobile-first. Get the one-column version right, then add one media query for wider screens. Responsive is not a finishing touch you add at the end. Teams that leave it for the last weeks end up rebuilding the layout then, on top of everything else that's due at that point. Figuring it out now while it's all still quite basic is easier. Make sure you keep it up to date when you add new things over the coming weeks and months.

It should still look like a wireframe: coloured boxes, but with realistic content in the right places. Don't try to get it pixel-perfect yet.

Also keep working on refining your backlog. It should start to look less like a list of modules now, and more like the pages and rules each module actually needs.