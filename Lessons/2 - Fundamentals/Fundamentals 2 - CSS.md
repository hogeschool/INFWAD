# Web Fundamentals 2: CSS

CSS might seem simple at first. Just styling, right? Pick an element, give it a color and some padding, done.

Well, the syntax is simple. The code looks small. But a lot of things in CSS are interrelated, and one line in one place can change how everything else on the page renders. You can lose an entire afternoon to a `height: 100%` that does not do what you expect, because the answer depends on the parent, and the parent's parent, and which layout mode the browser is using to render that part of the page.

(For the curious, Josh Comeau wrote an article on this exact problem: [https://www.joshwcomeau.com/css/height-enigma/](https://www.joshwcomeau.com/css/height-enigma/))

CSS sits on top of HTML and the DOM (which we covered last lesson). It is a layer of instructions that targets your HTML. So the quality of your CSS depends on the quality of the HTML beneath it. When working on layout, this will become clear (at the end of this lesson, and next lesson).

There are many things to learn about CSS, but let's start with getting the basics right. Understand how CSS gets applied to HTML and how to organise it, and you avoid the traps that confuse most developers. Sadly, a lot of full-stack developers still do not really understand CSS. They paste from Stack Overflow, hope it works, move on, and leave a mess behind. Frontend skills are undervalued in the industry, which makes them a competitive advantage. Take them seriously.

## How a CSS rule is written

A quick bit of syntax first. A CSS rule has two parts:

```
selector {
  property: value;
}
```

The _selector_ says which HTML elements the rule applies to. The block in curly braces is a list of _declarations_. Each declaration is a `property: value` pair, ended with a semicolon.

You can have as many declarations in a rule as you need:

```css
p {
  color: blue;
  font-size: 16px;
  margin-bottom: 1rem;
}
```

That rule selects every `<p>` element on the page and applies all three declarations to each one.

Whitespace inside a rule is mostly cosmetic. The browser does not care if each declaration sits on its own line or if they're all jammed together on one. Humans care. Indent properly and be consistent, or use a code formatter like Prettier (more on that later).

## Selectors

A selector tells CSS which HTML elements to style. Here are the ones you'll use most.

A _type selector_ is just the element's name. It matches every element of that type:

```css
p {
  color: navy;
}
```

Useful for defaults: a base style for paragraphs, lists, links, headings.

A _class selector_ starts with a dot. It matches every element with that class:

```css
.warning {
  color: red;
}
```

This is what most of your styling rules should use. An element can carry multiple classes (space-separated): `class="warning urgent"`. Each one is then targetable on its own.

An _ID selector_ starts with a hash:

```css
#site-header {
  background: black;
}
```

IDs are unique per page. Don't use them for styling unless you have a specific reason. I'm showing you just so you know it exists. IDs in your HTML are useful for jump-to-section links and as hooks for JavaScript, but for styling, classes are almost always better.

You can apply the same styling to multiple selectors by _grouping_ them with commas:

```css
.read,
.unread {
  background: white;
  border-radius: 4px;
}
```

Easier to maintain than two copies of the same declarations!

A space between two selectors is a _descendant combinator_. It matches the second selector only when the element sits inside something matching the first:

```css
.tabledemo .tabledemo-cell {
  padding: 10px 16px;
}
```

```html
<table class="tabledemo">
  <tr>
    <td class="tabledemo-cell"></td>
  </tr>
</table>
```

That rule applies to `.tabledemo-cell` only when it's inside a `.tabledemo`. Keep these chains short. More than three levels deep and the rule starts being hard to read.

## Three places CSS can live

CSS can be written in three places:

1. Directly on an element, with a `style` attribute. This is "inline" CSS.
2. In a `<style>` block in the `<head>` of the page.
3. In a separate `.css` file, linked from the HTML with a `<link>` tag.

You can also combine them. The browser doesn't care where the CSS comes from, it applies all of it.

In real projects, almost all of your CSS will be in separate `.css` files (option 3). Inline styles (option 1) should be avoided. `<style>` blocks (option 2) are mostly used for prototypes and small examples (like the ones in this lesson, to keep each example in a single file).

Why does it matter so much where the CSS lives? Let's demonstrate.

## The same page, three ways

Below are three versions of the same page. Same HTML structure, same end result in the browser. The only thing that changes is how the styling is organised.

> 🎓 Open VSCode, copy these examples into new HTML files, and open them all in your browser. They should look identical. Walk through each one in the DevTools inspector to see how it feels to work with them.
>
> Just so you're not overwhelmed: these examples use flexbox, grid, and a couple of other layout features that we'll cover properly next week. You don't need to understand every line of CSS to follow the comparison. The point of this section is how the CSS is structured, not what each layout property does.

### Version 1: Inline styles everywhere

This first example uses inline styles for everything:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>
      Sample HTML with Flexbox, Grid, Block, and Table (Divs) styling
    </title>
  </head>
  <body
    style="font-family: Arial, sans-serif; margin: 30px; background: #f8f9fa;"
  >
    <h1>HTML Layout Examples</h1>

    <h2>Default flow layout example</h2>
    <p
      style="background: #d1e7dd; color: #0f5132; padding: 14px; border-radius: 6px; margin-bottom: 12px;"
    >
      This is flow layout. Inline elements like <strong>this</strong>,
      <em>this</em> and <a href="#" style="color: red">this link</a> flow with
      browser-default formatting.
    </p>
    <p
      style="background: #d1e7dd; color: #0f5132; padding: 14px; border-radius: 6px; margin-bottom: 12px;"
    >
      Text wraps as needed, and elements appear in the order they are written in
      the HTML.
    </p>

    <h2>Margins & paddings example (notice the collapsing margins)</h2>
    <div style="background: red;">
      <div style="background: seagreen; margin: 10px; padding: 10px;">
        <div style="background: white">
          <span style="border: 2px solid black">Content (text node)</span>
        </div>
      </div>
      <div style="background: seagreen; margin: 10px; padding: 10px;">
        <div style="background: white">
          <span style="border: 2px solid black">Content (text node)</span>
        </div>
      </div>
    </div>

    <h2>Flexbox layout mode example</h2>
    <div
      style="display: flex; gap: 10px; margin-bottom: 32px; border: 2px solid #198754; padding: 10px; background: #e9fbe5;"
    >
      <div
        style="background: #198754; color: #fff; padding: 16px; border-radius: 6px; flex: 1 1 0; text-align: center;"
      >
        Flex Item 1
      </div>
      <div
        style="background: #198754; color: #fff; padding: 16px; border-radius: 6px; flex: 2 1 0; text-align: center;"
      >
        Flex Item 2 (Grow 2x)
      </div>
      <div
        style="background: #198754; color: #fff; padding: 16px; border-radius: 6px; flex: 1 1 0; text-align: center;"
      >
        Flex Item 3
      </div>
    </div>

    <h2>Flexbox with wrapping example</h2>
    <div
      style="display: flex; flex-wrap: wrap; gap: 12px; border: 2px dotted #fd7e14; padding: 10px; background: #fff3e0; margin-bottom: 32px;"
    >
      <div
        style="background: #fd7e14; color: #fff; padding: 18px; border-radius: 6px; min-width: 120px; text-align: center;"
      >
        Item 1
      </div>
      <div
        style="background: #fd7e14; color: #fff; padding: 18px; border-radius: 6px; min-width: 120px; text-align: center;"
      >
        Item 2
      </div>
      <div
        style="background: #fd7e14; color: #fff; padding: 18px; border-radius: 6px; min-width: 120px; text-align: center;"
      >
        Item 3
      </div>
      <div
        style="background: #fd7e14; color: #fff; padding: 18px; border-radius: 6px; min-width: 120px; text-align: center;"
      >
        Item 4
      </div>
      <div
        style="background: #fd7e14; color: #fff; padding: 18px; border-radius: 6px; min-width: 120px; text-align: center;"
      >
        Item 5
      </div>
    </div>

    <h2>Grid layout mode example</h2>
    <div
      style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px;"
    >
      <div
        style="background: #ffb84f; color: #222; padding: 20px; border-radius: 8px; text-align: center;"
      >
        Grid 1
      </div>
      <div
        style="background: #ffb84f; color: #222; padding: 20px; border-radius: 8px; text-align: center;"
      >
        Grid 2
      </div>
      <div
        style="background: #ffb84f; color: #222; padding: 20px; border-radius: 8px; text-align: center;"
      >
        Grid 3
      </div>
      <div
        style="background: #ffb84f; color: #222; padding: 20px; border-radius: 8px; text-align: center;"
      >
        Grid 4
      </div>
      <div
        style="background: #ffb84f; color: #222; padding: 20px; border-radius: 8px; text-align: center;"
      >
        Grid 5
      </div>
      <div
        style="background: #ffb84f; color: #222; padding: 20px; border-radius: 8px; text-align: center;"
      >
        Grid 6
      </div>
    </div>

    <h2>Block Elements</h2>
    <div
      style="display: block; background: #e0e0e0; color: #333; padding: 16px; margin-bottom: 12px; border-radius: 6px; width: 60%;"
    >
      This is a block-level div element.
    </div>
    <div
      style="display: block; background: #e0e0e0; color: #333; padding: 16px; margin-bottom: 12px; border-radius: 6px; width: 60%;"
    >
      Another block-level div element.
    </div>

    <h2>
      Table Using Only Divs (This is possible with CSS, but not the most
      semantic)
    </h2>
    <div
      style="display: table; width: 60%; border-collapse: collapse; margin-top: 24px;"
    >
      <div style="display: table-row;">
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #4f8cff; color: #fff; font-weight: bold;"
        >
          Name
        </div>
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #4f8cff; color: #fff; font-weight: bold;"
        >
          Age
        </div>
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #4f8cff; color: #fff; font-weight: bold;"
        >
          Country
        </div>
      </div>
      <div style="display: table-row;">
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          Alice
        </div>
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          24
        </div>
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          USA
        </div>
      </div>
      <div style="display: table-row;">
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          Bob
        </div>
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          30
        </div>
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          UK
        </div>
      </div>
      <div style="display: table-row;">
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          Charlie
        </div>
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          28
        </div>
        <div
          style="display: table-cell; border: 1px solid #bbb; padding: 10px 16px; background: #fff;"
        >
          Canada
        </div>
      </div>
    </div>
  </body>
</html>
```

This is where a lot of beginners start. One file, everything visible, no jumping between locations. It feels approachable.

It is also a trap. For elements that should look the same, you'd have to duplicate the style by hand. If you want to change the color of all those boxes, you have to edit every single one. If a fourth one gets added, the styling has to be retyped or copy-pasted. And copy-paste is where bugs come from, and typos become hard to spot.

There is no separation between structure and styling. The HTML reads like a wall of attributes, and the actual content (the words on the page) is buried inside it.

Don't do this. Not even for small projects.

### Version 2: Classes, but the names are a mess

This second version is a bit better, though still not good enough:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>
      Sample HTML with Flexbox, Grid, Block, and Table (Divs) styling
    </title>
    <style>
      .text {
        border: 2px solid black;
      }

      .top {
        font-family: Arial, sans-serif;
        margin: 30px;
        background: #f8f9fa;
      }

      .example1 {
        background: #d1e7dd;
        color: #0f5132;
        padding: 14px;
        border-radius: 6px;
        margin-bottom: 12px;
      }

      .example2 {
        background: #d1e7dd;
        color: #0f5132;
        padding: 14px;
        border-radius: 6px;
        margin-bottom: 12px;
      }

      .example3 {
        background: green !important;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 12px;
      }

      .container {
        background: seagreen;
        margin: 10px;
        padding: 10px;
      }

      .container2 {
        background: white;
      }

      .greenboxes {
        display: flex;
        gap: 10px;
        margin-bottom: 32px;
        border: 2px solid #198754;
        padding: 10px;
        background: #e9fbe5;
      }

      .box {
        background: #198754;
        color: #fff;
        padding: 16px;
        border-radius: 6px;
        text-align: center;
        flex: 1 1 0;
      }

      .specialbox {
        flex: 2 1 0;
      }

      .redboxes,
      .blueboxes {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        border: 2px dotted #fd7e14;
        padding: 10px;
        background: #fff3e0;
        margin-bottom: 32px;
      }

      .blueboxes {
        background: #00f;
      }

      .redboxes div {
        background: #fd7e14;
        color: #fff;
        padding: 18px;
        border-radius: 6px;
        min-width: 120px;
        text-align: center;
      }

      .table-a {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 32px;
      }

      .blockdemo {
        display: block;
        background: #e0e0e0;
        color: #333;
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 6px;
        width: 60%;
        font-weight: normal;
      }

      .overzicht {
        display: table;
        width: 60%;
        border-collapse: collapse;
        margin-top: 24px;
      }

      .overzicht .line {
        display: table-row;
      }

      .overzicht .line .cell {
        display: table-cell;
        border: 1px solid #bbb;
        padding: 10px 16px;
        background: #fff;
      }

      .container1 {
        background: red;
      }

      .cell.blauw {
        background: #4f8cff !important;
        color: #fff;
        font-weight: bold;
      }

      .block {
        background: #ffb84f;
        color: #222;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      }
    </style>
  </head>
  <body class="top">
    <h1>HTML Layout Examples</h1>
    <p>
      This page demonstrates various HTML and CSS layout techniques including
      flow layout, flexbox, grid, and block elements.
    </p>
    <p>
      It works but class names are a mess. The code is not self-explanatory and
      there is a high risk of mistakes when working on this code.
    </p>
    <p>
      While working on code like this over time, it is likely that it will
      become a big mess, with orphaned code and more lines than needed.
    </p>

    <h2>Default flow layout example</h2>
    <p class="example1">
      This is flow layout. Inline elements like <strong>this</strong>,
      <em>this</em> and <a href="#">this link</a> flow with browser-default
      formatting.
    </p>
    <p class="example2">
      Text wraps as needed, and elements appear in the order they are written in
      the HTML.
    </p>

    <h2>Margins & paddings example (notice the collapsing margins)</h2>
    <div class="container1">
      <div class="container">
        <div class="container2">
          <span class="text">Content (text node)</span>
        </div>
      </div>
      <div class="container">
        <div class="container2">
          <span class="text">Content (text node)</span>
        </div>
      </div>
    </div>

    <h2>Flexbox layout mode example</h2>
    <div class="greenboxes">
      <div class="box">Flex Item 1</div>
      <div class="box specialbox">Flex Item 2 (Grow 2x)</div>
      <div class="box">Flex Item 3</div>
    </div>

    <h2>Flexbox with wrapping example</h2>
    <div class="redboxes">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      <div>Item 4</div>
      <div>Item 5</div>
    </div>

    <h2>Grid layout mode example</h2>
    <div class="table-a">
      <div class="block">Grid 1</div>
      <div class="block">Grid 2</div>
      <div class="block">Grid 3</div>
      <div class="block">Grid 4</div>
      <div class="block">Grid 5</div>
      <div class="block">Grid 6</div>
    </div>

    <h2>Block Elements</h2>
    <div class="blockdemo">This is a block-level div element.</div>
    <div class="blockdemo">Another block-level div element.</div>

    <h2>
      Table Using Only Divs (This is possible with CSS, but not the most
      semantic)
    </h2>
    <div class="overzicht">
      <div class="line">
        <div class="cell blauw">Name</div>
        <div class="cell blauw">Age</div>
        <div class="cell blauw">Country</div>
      </div>
      <div class="line">
        <div class="cell">Alice</div>
        <div class="cell">24</div>
        <div class="cell">USA</div>
      </div>
      <div class="line">
        <div class="cell">Bob</div>
        <div class="cell">30</div>
        <div class="cell">UK</div>
      </div>
      <div class="line">
        <div class="cell">Charlie</div>
        <div class="cell">28</div>
        <div class="cell">Canada</div>
      </div>
    </div>
  </body>
</html>
```

This one moves the styling out of the HTML and into a `<style>` block, using class names. That's already a huge improvement. The HTML is readable again. You can see what's content and what's structure.

But the class names are bad!

This is still an improvement compared to version 1. But six months from now, when someone needs to add a new section, they will be staring at this file wondering which class to copy and what `top` actually means. This is where it becomes a **slow-motion disaster**: they will give up and just add a new class, bloating the code further.

> 🎓 Practice: Before you scroll down, go up and copy version 2 into a new HTML file in VSCode, and rename every class yourself. For each one, ask yourself what the thing is actually _for_, and give it a better name.
>
> Some hints:
>
> - `top` is not a useful name for the body.
> - `.example1` and `.example2` have identical styles, and they are separate classes for no reason.
> - `.specialbox` is a strange name, since it doesn't make it clear what is so special about it.
> - `.container1` and `.container2` are just generic names, and tell you nothing.
> - `.greenboxes` and `.redboxes` are named after a color, so they will be lying when someone changes the color in the styles.
> - `.table-a` is actually not styled as a table, so the name is misleading.
> - `.overzicht` is Dutch while the rest of the file is English. And what kind of 'overzicht' is it, even?
> - There is even some dead code in there (a class that is never used in the HTML at all.)
> - And none of these names tell you what the thing is for.

Beside the naming problems, there are `!important` declarations in there (`background: green !important` on `.example3`, `background: #4f8cff !important` on `.cell.blauw`). That's a bad sign. If you do things right, you never have to use it. `!important` is a sledgehammer for fixing problems you don't yet understand. It almost always means someone gave up on figuring out why their styling wasn't applying. We'll come back to this in a minute.

### Version 3: Classes with consistent naming

This is better:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>
      Sample HTML with Flexbox, Grid, Block, and Table (Divs) styling
    </title>
    <style>
      .htmldemo {
        font-family: Arial, sans-serif;
        margin: 30px;
        background: #f8f9fa;
      }

      .flowdemo {
        background: #d1e7dd;
        color: #0f5132;
        padding: 14px;
        border-radius: 6px;
        margin-bottom: 12px;
      }

      .spacingdemo {
        background: red;
      }

      .spacingdemo-block {
        background: seagreen;
        margin: 10px;
        padding: 10px;
      }

      .spacingdemo-content {
        background: white;
      }

      .spacingdemo-label {
        border: 2px solid black;
      }

      .flexboxdemo {
        display: flex;
        gap: 10px;
        margin-bottom: 32px;
        border: 2px solid #198754;
        padding: 10px;
        background: #e9fbe5;
      }

      .flexboxdemo-item {
        background: #198754;
        color: #fff;
        padding: 16px;
        border-radius: 6px;
        text-align: center;
        flex: 1 1 0;
      }

      .flexboxdemo-item--grow {
        flex: 2 1 0;
      }

      .flexboxwrapdemo {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        border: 2px dotted #fd7e14;
        padding: 10px;
        background: #fff3e0;
        margin-bottom: 32px;
      }

      .flexboxwrapdemo-item {
        background: #fd7e14;
        color: #fff;
        padding: 18px;
        border-radius: 6px;
        min-width: 120px;
        text-align: center;
      }

      .griddemo {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 32px;
      }

      .griddemo-item {
        background: #ffb84f;
        color: #222;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      }

      .blockdemo {
        display: block;
        background: #e0e0e0;
        color: #333;
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 6px;
        width: 60%;
      }

      .tabledemo {
        display: table;
        width: 60%;
        border-collapse: collapse;
        margin-top: 24px;
      }

      .tabledemo-row {
        display: table-row;
      }

      .tabledemo-cell {
        display: table-cell;
        border: 1px solid #bbb;
        padding: 10px 16px;
        background: #fff;
      }

      .tabledemo-header {
        background: #4f8cff;
        color: #fff;
        font-weight: bold;
      }
    </style>
  </head>
  <body class="htmldemo">
    <h1>HTML Layout Examples</h1>
    <p>
      This page demonstrates various HTML and CSS layout techniques including
      flow layout, flexbox, grid, and block elements.
    </p>
    <p>
      Class names follow a naming convention similar to
      <a href="https://getbem.com">BEM</a>. Keep it simple and elegant. Style
      based on class names.
    </p>

    <h2>Default flow layout example</h2>
    <p class="flowdemo">
      This is flow layout. Inline elements like <strong>this</strong>,
      <em>this</em> and <a href="#">this link</a> flow with browser-default
      formatting.
    </p>
    <p class="flowdemo">
      Text wraps as needed, and elements appear in the order they are written in
      the HTML.
    </p>

    <h2>Margins & paddings example (notice the collapsing margins)</h2>
    <div class="spacingdemo">
      <div class="spacingdemo-block">
        <div class="spacingdemo-content">
          <span class="spacingdemo-label">Content (text node)</span>
        </div>
      </div>
      <div class="spacingdemo-block">
        <div class="spacingdemo-content">
          <span class="spacingdemo-label">Content (text node)</span>
        </div>
      </div>
    </div>

    <h2>Flexbox layout mode example</h2>
    <div class="flexboxdemo">
      <div class="flexboxdemo-item">Flex Item 1</div>
      <div class="flexboxdemo-item flexboxdemo-item--grow">
        Flex Item 2 (Grow 2x)
      </div>
      <div class="flexboxdemo-item">Flex Item 3</div>
    </div>

    <h2>Flexbox with wrapping example</h2>
    <div class="flexboxwrapdemo">
      <div class="flexboxwrapdemo-item">Item 1</div>
      <div class="flexboxwrapdemo-item">Item 2</div>
      <div class="flexboxwrapdemo-item">Item 3</div>
      <div class="flexboxwrapdemo-item">Item 4</div>
      <div class="flexboxwrapdemo-item">Item 5</div>
    </div>

    <h2>Grid layout mode example</h2>
    <div class="griddemo">
      <div class="griddemo-item">Grid 1</div>
      <div class="griddemo-item">Grid 2</div>
      <div class="griddemo-item">Grid 3</div>
      <div class="griddemo-item">Grid 4</div>
      <div class="griddemo-item">Grid 5</div>
      <div class="griddemo-item">Grid 6</div>
    </div>

    <h2>Block Elements</h2>
    <div class="blockdemo">This is a block-level div element.</div>
    <div class="blockdemo">Another block-level div element.</div>

    <h2>
      Table Using Only Divs (This is possible with CSS, but not the most
      semantic)
    </h2>
    <div class="tabledemo">
      <div class="tabledemo-row">
        <div class="tabledemo-cell tabledemo-header">Name</div>
        <div class="tabledemo-cell tabledemo-header">Age</div>
        <div class="tabledemo-cell tabledemo-header">Country</div>
      </div>
      <div class="tabledemo-row">
        <div class="tabledemo-cell">Alice</div>
        <div class="tabledemo-cell">24</div>
        <div class="tabledemo-cell">USA</div>
      </div>
      <div class="tabledemo-row">
        <div class="tabledemo-cell">Bob</div>
        <div class="tabledemo-cell">30</div>
        <div class="tabledemo-cell">UK</div>
      </div>
      <div class="tabledemo-row">
        <div class="tabledemo-cell">Charlie</div>
        <div class="tabledemo-cell">28</div>
        <div class="tabledemo-cell">Canada</div>
      </div>
    </div>
  </body>
</html>
```

Nice. Much cleaner. No more headache just from looking at it!

Now the class names tell you what each thing is for. `.flowdemo`, `.flexboxdemo`, `.griddemo`, `.tabledemo`. The structure follows a pattern: a demo's container is `.flexboxdemo`, the items inside it are `.flexboxdemo-item`, the special variant is `.flexboxdemo-item--grow`. You can read the HTML and know which CSS rules apply, without scrolling.

This is a simplified version of a convention called BEM (Block Element Modifier). I'm not strict about BEM in this course, and you do not have to follow it exactly. _What matters is consistency_. Pick a convention, stick to it, and use it across the whole project.

### The final separation

One more thing. The CSS still sits in a `<style>` block, and that's not what you should keep doing. We're going to move it into its own file.

> 🎓 Create a file called `styles.css` next to your version 3 HTML file. Cut everything between the `<style>` tags into it, delete the now empty `<style>` block, and put this line in the `<head>` instead:

```html
<link rel="stylesheet" href="styles.css" />
```

Refresh the page. Nothing should change. From here on, give every page its own CSS file, and keep one shared file for what every page uses: the variables, the reset, the typography. Anything that shows up on more than one page belongs in the shared file, not in both. (Later, when we start using a frontend framework, every component gets its own file.)

## A few rules of thumb for naming classes

I'll keep this short.

- Lowercase. Use dashes between words. Don't mix in camelCase or underscores.
- Class names cannot start with a number. `.4-warnings` is not a valid selector. (Numbers anywhere else in the name are fine.)
- Name things by what they are, not what they look like. `.warning` survives a redesign. `.red-text` does not.
- Don't call your container `.container` if you can call it `.product-card` or `.sidebar`. Generic names collide.
- Be consistent across the whole project. If one thing is `.user-avatar`, the next thing should not be `.userPhoto`.
- Use one language. Mixing English and Dutch class names in the same file (`.overzicht` next to `.box`) is bad.

(Look at how Bootstrap names its classes if you want a reference. Or look at version 3 above. There is no single right answer, only consistent answers and inconsistent ones.)

## The cascade and specificity

CSS stands for _Cascading Style Sheets_. The "cascading" bit is important: when more than one CSS rule applies to the same element, the browser has to pick which one wins. That picking algorithm is the cascade, and the system it uses to decide is called _specificity_.

The basic order, from least to most specific (or: lowest to highest priority):

1. Type selectors (`p`, `h1`, `a`)
2. Class selectors (`.button`, `.warning`)
3. ID selectors (`#main-nav`)
4. Inline styles (the `style="..."` attribute)
5. `!important`, which overrides everything else regardless of where it sits

Higher specificity wins. If two rules have the same specificity, the last one wins.

A small demo:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CSS Specificity Example</title>
    <style>
      /* Type selector */
      p {
        color: blue;
      }

      /* Class selector */
      .example-classname-a {
        color: green;
      }

      /* ID selector */
      #example-id-1,
      #example-id-2,
      #example-id-3 {
        color: red;
      }

      /* Class selector with !important */
      .example-classname-b {
        color: purple !important;
      }
    </style>
  </head>
  <body>
    <h1>CSS Specificity Demo</h1>
    <p>
      This paragraph is styled by the <strong>type selector</strong> (blue).
    </p>
    <p class="example-classname-a">
      This paragraph is styled by a <strong>class selector</strong> (green
      overrides blue).
    </p>
    <p id="example-id-1" class="example-classname-a">
      This paragraph is styled by the <strong>ID selector</strong> (red
      overrides green and blue).
    </p>
    <p id="example-id-2" class="example-classname-a" style="color: orange;">
      This paragraph uses <strong>inline style</strong> (orange overrides red,
      green, and blue).
    </p>
    <p id="example-id-3" class="example-classname-b" style="color: orange;">
      This paragraph is styled by the
      <strong>!important rule</strong> (overrides everything).
    </p>
  </body>
</html>
```

Run that page in a browser. Each paragraph is styled by a different mechanism, and you can see which color wins.

> 🎓 Try this now: open DevTools on the rendered page, click on one of the paragraphs to inspect it, and look at the Styles panel on the right. The browser shows you exactly which rule won and which got overridden (the overridden ones get a strikethrough). Add a new color rule somewhere, change a class, and see what happens.

A few practical takeaways from specificity:

- Stick to class selectors for your own styles. Type selectors are useful for resets of browser-default styling and setting base styles like fonts. ID selectors for styling are best avoided (they're fine for JavaScript hooks). Inline styles should be forbidden. `!important` is a bad smell.
- If you find yourself using `!important`, pause. The real problem is almost always that some other rule is more specific than you realised. Find that rule and fix the conflict properly. Use the DevTools in your browser to help you find it!
- The full specificity rules are more involved (see [https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity)). The five-level mental model above is enough for now.

> 🎓 Try this now: open DevTools on a real website, and look at the Styles panel and the strikethroughs. Break a color on purpose by adding `!important` somewhere unexpected, and see the chaos. Then remove it again.

## A handful of properties to start with

You can spend years learning every CSS property in detail. You should get used to looking things up while you work. For now, let's just go over some basics. Here are the ones you'll use most often.

### Color

The `color` property sets the text color. `background-color` sets the background.

```css
.warning {
  color: white;
  background: crimson;
}
```

Color values can be named (`red`, `cornflowerblue`, `transparent`), or written as HEX (`#ff0044`), RGB (`rgb(255, 0, 68)`), or HSL (`hsl(348, 100%, 50%)`). HEX is the most common. RGB and HSL are useful when you need transparency: `rgba(255, 0, 68, 0.5)`.

### Typography

Four properties cover most needs: `font-family`, `font-size`, `font-weight`, and `text-align`.

```css
body {
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  font-weight: normal;
  text-align: left;
}
```

`font-family` takes a comma-separated list. The browser tries each font in order and uses the first one available. End the list with a generic fallback (`sans-serif`, `serif`, or `monospace`) as a safety net.

`font-size` takes a length (`16px`, `1rem`, `1.25em`). `font-weight` is the boldness (`normal`, `bold`, or a number like `700` if you want more precision). `text-align` is the alignment (`left`, `center`, `right`).

### Spacing

`padding` is space _inside_ an element, between its content and its border. `margin` is space _outside_ an element, between it and its neighbours. Both can take one to four values:

```css
.card {
  padding: 16px; /* all four sides */
  padding: 16px 24px; /* top/bottom, left/right */
  padding: 16px 24px 8px; /* top, left/right, bottom */
  padding: 4px 8px 12px 16px; /* top, right, bottom, left (clockwise from top) */
}
```

(Of course you'd only have one `padding` value at a time. The four lines above show the syntax options.)

### Borders

`border` is shorthand for three things at once: width, style, color.

```css
.card {
  border: 1px solid #ccc;
}
```

For everything else, MDN is your friend: [https://developer.mozilla.org/en-US/docs/Web/CSS](https://developer.mozilla.org/en-US/docs/Web/CSS). Each property has its own reference page listing every value it accepts.

## CSS variables

CSS supports custom properties, often called CSS variables. They look like this:

```css
:root {
  --color-primary: #0070f3;
  --color-text: #1a1a1a;
  --space-md: 1rem;
}

.button {
  background: var(--color-primary);
  color: white;
  padding: var(--space-md);
}

.headline {
  color: var(--color-text);
  margin-bottom: var(--space-md);
}
```

The `:root` block declares the variables (they have to start with `--` but you can name them as you like). The `var(--name)` function reads them.

You should definitely use them!

The trivial reason is that you can change the brand color in one place. Set `--color-primary: hotpink;` in `:root` and every button, link, and accent that uses `var(--color-primary)` updates at the same time.

The deeper reason is that CSS variables are the foundation of design systems. A consistent palette of colors, spacing, and typography expressed as variables forces the rest of your CSS to use them. The colors stop drifting and the spacing stops being random. The team starts producing UI that looks like it belongs to one product.

> 🎓 Try this now: open DevTools on a site that uses CSS variables (most modern sites do). In the Styles panel, find a `--color-` or `--space-` value and change it. Watch the page update everywhere that variable is used.

CSS variables are also live. You can change them with JavaScript at runtime, which is how dark mode toggles, theme switchers, and a lot of other dynamic styling actually work under the hood. We're not doing that this week, but it's worth knowing.

If you're interested in theme switchers and dark mode toggles: this is a new way of doing color schemes: [MDN: light-dark() CSS function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark)

## Refactoring is a big part of the job

CSS _rots_ faster than most code. Every new feature adds a few rules, every edge case adds an exception, and after a while you have a stylesheet that nobody touches because nobody knows which rule does what.

The only way to keep CSS healthy is to refactor as you go. Rename a class when its purpose drifts. Delete rules that are not being used. Pull repeating values such as colors into variables. Consolidate duplicate styles. Don't leave it for "later", because later never comes. Apply software architecture thinking to your CSS code.

Your team project's pages will be quite rough for a few weeks: you are figuring it out as you go and nothing will look great yet, but that's fine. Rough is not the same as messy, though. Messy is when you just keep adding stuff until it seems to work, not paying attention to re-use or good class names, and copying the same color hex code five times. It takes a little more work, but in this early stage it's easier to keep it clean than to clean up after weeks of adding messy CSS.

A linter helps. We will be using Stylelint in this course. It catches inconsistent naming, deprecated properties, and a few common mistakes before they get committed.

There will be times when you think it's not worth the effort, especially in the short term. When you have only worked on something for a few weeks, you will not feel the cost of bad CSS as badly as when you're maintaining it for years. Once your CSS has started to rot, it's too late. It can be almost impossible to clean up.

## A short word about AI

Generating CSS with AI is tempting. The output looks plausible. It often does work the first time.

It also tends to make a mess. AI-generated CSS bloats fast, repeats values that should be variables, and creates duplicate rules that subtly conflict with each other (which is hard to fix). If you ask it to refactor your stylesheet, you should review every line. It will sometimes confidently rewrite a rule that breaks the rest of the page in ways you don't notice for a week.

Asking AI to _explain_ CSS to you (specificity, the cascade, why a rule isn't applying) is fine and often useful. Asking it to _write_ CSS for you, especially this early in your learning, will hurt you. You won't internalise the patterns, and you'll struggle when something breaks.

(For looking things up, I'd suggest the Mozilla Developer Network: [https://developer.mozilla.org/en-US/docs/Web/CSS](https://developer.mozilla.org/en-US/docs/Web/CSS). Great resource and nicer to work with than asking AI when you actually want to learn.)

## Good HTML makes good CSS possible

Back to something from the start of this lesson. I said the quality of your CSS depends on the quality of your HTML, and the biggest reason is layout.

Flexbox and Grid, the two tools behind almost every layout, work the same way: they arrange a parent's direct children. A flex container _lays out_ the children inside it, and nothing else. So if you want three things in a row, those three things have to be siblings inside one container. If you want an image sitting next to a block of text, the image and the text block have to be wrapped together first.

This means your HTML structure decides which layouts are even possible. Get the structure wrong and no CSS rule will save you. You go back, add or move the wrapper elements, and then write the CSS.

Let's say you want a small 'card' layout with two columns: an image on the left, then a title, a stardate, a short summary, and a button, all to the right of the image.

```html
<div class="card">
  <img src="photo.jpg" alt="" />
  <h3>Mission report</h3>
  <p>Stardate 4523.3</p>
  <p>Brief summary of the mission outcome.</p>
  <button>Read full report</button>
</div>
```

Five elements, all siblings inside the card. You cannot get the layout you want. To put the image beside the text, the text has to be grouped into one thing, and right now it is four separate siblings. Nothing in CSS can group them for you. You group them using HTML (and let's choose some semantic elements and class names for that at the same time):

```html
<article class="card">
  <img src="photo.jpg" alt="" />
  <div class="card-body">
    <header>
      <h3>Mission report</h3>
      <p>Stardate 4523.3</p>
    </header>
    <p>Brief summary of the mission outcome.</p>
    <footer>
      <button>Read full report</button>
    </footer>
  </div>
</article>
```

Let's see this nesting as a tree. It is the same kind of tree you saw last lesson when we looked at the DOM. With this HTML, the tree is:

```
article.card
├── img
└── div.card-body
    ├── header
    │   ├── h3
    │   └── p
    ├── p
    └── footer
        └── button
```

The card is the parent. It has two children: the image and the `div.card-body` block. That div is itself a parent to the other elements: the header, summary, and footer. If we tell the card to use a row layout, we get two columns: the img and the div. That is the layout we wanted, and the HTML structure is what made it possible.

While you are building this sort of structure, pick the element that matches the meaning. A self-contained card with text content like this is an `<article>`, not a `<section>` (a `<section>` is a thematic part of a page, which is not what this is). The title and stardate are the card's heading, so they go in a `<header>`. The button is an action, so it goes in a `<footer>`. You needed the grouping for the layout anyway. Choosing the elements that mean something makes it even better.

The one plain `<div>` left in there, `card-body`, is not a mistake. Last lesson's advice, do not build a whole page out of `<div>` and `<span>`, still holds. But if you can't find a semantic element for "the text column of a card", we can use a `<div>`. It groups the heading, summary, and footer so they sit beside the image as a single block. Use a semantic element where one fits the meaning, and a plain `<div>` where the layout just needs a grouping that has no specific meaning (but do give it a good class name!).

Half the CSS work happens at the HTML stage. Try to get the structure right first: semantic elements where they fit, wrapper elements where the layout needs them. Then write the CSS. (That's why your project pages were HTML only last week.) In practice, you will probably have to go back and forth a lot, but try to create a good starting point for yourself.

> 🎓 Try implementing the above example yourself using https://developer.mozilla.org/play. Write the CSS for `.card-body` yourself, according to the description above. When you're done, save the results in your demo project folder, so we can use it in a later lesson.

## What's coming next

In this lesson we've covered some of the basics. Next lesson we go into layout: the box model, flexbox, grid, common layout patterns, and responsive design with media queries. We'll also touch on CSS frameworks (Bootstrap, Tailwind, and what they actually do).

## Resources

### Self-study

This lesson doesn't cover everything. While you build your project you will need to dig deeper. These are sources for good learning material about CSS:

- [MDN: CSS Styling Basics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)

- These are good free courses on HTML & CSS. Check them out, then choose the one that works best for you:
  - [The Odin Project](https://www.theodinproject.com)
  - [Google's web.dev](https://web.dev/learn/css)
  - [Khan Academy](https://www.khanacademy.org/computing/computer-programming/html-css)

### Reference

- Mozilla Developer Network: https://developer.mozilla.org. Founded by the Netscape people, twenty years ago. Still the best reference.

- Can I Use: https://caniuse.com. For checking what works in which browser.

## Applying this to your project

You've made some plain HTML for your module's pages already. Keep working on that, but this week, add stylesheets: one per module, plus one `styles.css` for the whole team. The colors, the spacing and the font belong to everyone, so agree on them together and put them in `:root` as variables before anyone writes a rule. Then each of you adds the classes your own pages need, using a naming convention you agreed on as a team. (Read the rules of thumb above again, together.)

Keep it simple for now. Three or four colors, one font, a few spacing sizes for things like margins, and enough rules to make a list look like a list and a form look like a form. No fancy stuff like shadows or hover effects. It will still look boring, but it should, because layout is next week and the framework rewrite comes after that. What has to be right first is the stuff that survives all of that: the variables, the class names, the structure underneath. Fix those while the stylesheets are thirty lines, not three hundred.

And keep refining the backlog, like we said last week.
