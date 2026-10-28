# Express with TypeScript
## Basics

**Node.js** is a JavaScript runtime that lets you run JavaScript outside the browser, perfect for building server-side applications. Node.js comes with a built-in `http` module that can create web servers. While powerful, it requires you to handle many low-level details yourself: manually checking request URLs, setting headers, writing responses, and managing routing logic.

**Express** is a framework that solves these problems. It gives you simple functions for:  
- **Routing** – deciding what to do for different URLs (`/`, `/about`, `/bye`).  
- **Responses** – sending text, HTML, or JSON without having to manually write headers.  
- **Middleware** – small pieces of code that run *before* or *after* your route, like logging, authentication, or parsing data.  

**TypeScript** adds another layer: safety. In plain JavaScript, you might mistype a variable or call a function incorrectly, and you won’t know until your program crashes. TypeScript checks your code *before running it*. It knows what type of data things are (numbers, strings, objects), and warns you if you make a mistake. This helps a lot in bigger projects where bugs can be harder to find.  

So, think of our setup like this:  
- **Node.js**: gives us the engine to run JavaScript outside the browser.  
- **Express**: builds a nicer car on top of the engine, with a steering wheel, seats, and brakes.  
- **TypeScript**: adds lane assist and a navigation system so you don’t accidentally crash.  

---

## No Vite?

The set-up for our front-end was easy. We used Vite to get a boilerplate setup for our front-end. Vite generates the needed configuration files and project structure, and after running `npm install`, all required packages are ready to go. Vite also acts as a bundler that compiles your TypeScript code and bundles it with the CSS, images, and other assets into one complete website. Very handy! For our back-end with Express, we'll have to install and configure things ourselves.

---

## Installation

We’re going to create a project that uses Express with TypeScript.  Our front-end uses Vite, a toolkit which makes setting up everything much easier. Sadly, there's no such thing for Express in the backend meaning we'll need to set up everything ourselves. Follow these steps carefully, misconfiguring something can cause annoyingly vague errors.

1. Create a new folder for your project. Open it in your terminal.  
2. Run the following commands:  

```bash
npm init -y
npm install express
npm install -D typescript tsx @types/node @types/express
```

Here’s what each package does:  
- **express** – the framework we’ll use to build our server.  
- **typescript** – the TypeScript compiler. It converts `.ts` files into plain `.js`.  
- **tsx** – lets us run TypeScript files directly, without compiling first, and includes a watch mode for development.  
- **@types/node** and **@types/express** – TypeScript doesn’t know what’s inside Node.js or Express by default. These “type definitions” describe them in a way TypeScript can understand.  

3. Create a `tsconfig.json` file so TypeScript knows how to behave:  

```bash
npx tsc --init
```

Open the file and make sure these settings are there. Change the values if needed:  

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    
    /* Required for TypeORM in lesson 3 */
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

**What these settings mean:**
- `target: "ES2022"` – The version of JavaScript to compile to. ES2022 is modern and fully supported by Node.js.
- `module: "NodeNext"` – Tells TypeScript to emit modules the way modern Node expects for ESM projects.
- `moduleResolution: "NodeNext"` – Uses Node's modern module resolution rules, matching ESM behavior in runtime.
- `rootDir: "./src"` – Where our TypeScript source files live.
- `outDir: "./dist"` – Where TypeScript puts the compiled JavaScript files.
- `strict: true` – Enables all strict type checking. This catches many bugs before you run your code.
- `esModuleInterop: true` – Makes importing CommonJS packages smoother in ESM TypeScript projects.
- `skipLibCheck: true` – Skips type checking of library files for faster compilation.
- `forceConsistentCasingInFileNames: true` – Prevents issues when moving code between Windows, Mac, and Linux.  



---


## Installing our linter and formatter

Just like in the front-end we want to use the modern oxc linter and formatter. There's no Vite to help us, so we'll have to do this ourselves as well. Run the following commands in the terminal

```
npm add -D oxlint oxfmt
npx oxlint --init
npx oxfmt --init
```
Now restart your VS Code to see the checkmarks at the oxc extension in the bottom right of the window. 

---
## Running the Server with tsx

👉 **Exercise:** Create the folder `src/` in your project. Inside it, make a file called `index.ts`.  

Right now, we could run the server with:  

```bash
npx tsx src/index.ts
```

That works, but there are two problems:  
1. It’s an annoying command to type every time.  
2. When you change your code, you have to stop and restart the server manually.  

That’s where **tsx watch** comes in. It keeps an eye on your project files, and whenever you save changes, it restarts your server automatically.  

To make this easy to run, we’ll set up an **npm script**.  

1. Open your `package.json` file.  
2. Find the `"scripts"` section. It probably looks like this:  

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

3. Replace it with:  

```json
  "scripts": {
    "build": "tsc --build",
    "start": "node ./dist/index.js",
    "typecheck": "tsc --noEmit",
    "dev": "tsx watch ./src/index.ts"
  }

```
Here’s what the dev script does:  
- `tsx watch` → watches your files and restarts the app when you save changes.  

Add the following line to the top `{}` of your `package.json`.
This tells Node to treat `.js` files in this project as ESM modules by default.
`"type": "module",`

Now, in your terminal, we can run:  

```bash
npm run dev
```

Your server will start. If you make changes in `src/index.ts` or any other file in `src`, tsx will automatically restart it for you. 
We don't have a server yet, so nothing will happen, time to make that work in the next chapter! 


### ESM notes
ESM (ECMAScript Modules) is the modern JavaScript module system that uses `import` and `export` syntax. We use it in this course because it is the current standard across modern Node.js and frontend tooling, so students learn one future-proof pattern instead of starting with legacy module behavior.

In our source code we still write TypeScript files (`.ts`), but for local relative imports we use `.js` in the import path. This matches what Node expects at runtime after TypeScript compiles to JavaScript in `dist`.

During development, `tsx` makes this workflow smooth: when it sees a `.js` import in a TypeScript file, it resolves it to the matching `.ts` source file and runs it directly. During production-style runs, `tsc --build` creates the real `.js` files in `dist`, and Node then loads those files exactly as written in the import paths.




---

## First Express Server

In `src/index.ts`, add this code:  

```ts
import express from "express";
import type { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = 3000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello! Welcome to my Express + TypeScript server");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

### How it works
- `import express` – brings in the Express framework.  
- `const app = express();` – creates an **application object**. This is like our “server brain”: it knows about all the routes, middleware, and settings.  
- `const PORT = 3000;` – the port number is like the “door” into our server. If multiple apps run on your computer, each one uses a different door.  
- `app.get("/", ...)` – this defines a **route**. It says: *when someone sends a GET request to `/`, run this function*.  
  - The function gets two arguments:  
    - `req` (request): information about what the client asked for.  
    - `res` (response): the object we use to reply.  
  - Here we simply call `res.send()`, which sets the headers and sends the text automatically (much easier than writing `res.writeHead` + `res.end` like in plain Node.js).

You can see the types `Request` and `Response` at our arrow function at the route. We need to tell TypeScript the types we are expecting to receive.

Now you can run your server with `npm run dev` and try it out by visiting the given localhost url. 

👉 **Exercise:** Start your server with `npm run dev`. Change the text in your `/` route, save the file, and watch how tsx restarts the server automatically. Then refresh your browser to see the change — no manual restart needed!  

### Adding routes

Now you can add new routes to your `index.ts`. Be sure to add them before the `app.listen()` method. This method should be last in your file.\
In plain Node.js, you had to check `req.url` manually. Express makes this easier by letting you define one route per URL. Each `app.get()` is matched to one URL which is given as the first parameter. 

👉 **Exercise:** Add a route for "/bye" and send the response saying "Goodbye!"


## Handling 404 Errors

To handle 404 errors we add a new route. The code is slightly different. This is added as the last route before the `listen` method is called.

```ts
app.use((req: Request, res: Response) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});
```

How it works
- app.use() without a path means “this applies to all requests.”
- Because this is placed at the end, it only runs if no other route matched.
- We set the status code to 404 to tell the browser this was not found.

👉 **Exercise:** Change the 404 page to include your name and a funny error message.  

---

## Middleware

Middleware are special functions that run before your routes. They are useful for logging, authentication, or modifying requests. We're gonna add a middleware function before the routes in our `index` file. This middleware will log the current requested url. 

```ts
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next(); // without this, the request would stop here
})
```

Add the middleware. Run the server. Make some requests, check the terminal to see if it works.



## Router

We have written all our routes in the index file. This will get too big. We can split these routes up by using the router. Inside your `src` folder, create a new folder called `routes`. In this folder we can create different files for our routes. For now we are keeping it simple, create one file called `home.routes.ts`. 

In this file import `express` and the types again.

```ts
import express from "express";
import type { Request, Response } from 'express';
```

Create an instance of the express router.
```ts
const router = express.Router();
```
Now we copy paste the routes from index.ts into this files. Do **not** copy the middleware or the 404 route. Change the `app.get()` methods to `router.get()` methods.
For example:
```ts
router.get("/bye", (req: Request, res: Response) => {
    res.send("Goodbye!");
});
```

At the end of the file we export the `router`. So we can import this router in our index file.

```ts
export default router;
```


In our `index.ts` file we can now import the router from our routes file.
```ts
import homeRouter from "./routes/home.routes.js"
```

Now we can set the `app.use(homeRouter)` so the server will include the important routes. The complete `index.ts` will now look something like this. 

```ts
import express from "express";
import type { Request, Response, NextFunction } from 'express';

import homeRouter from "./routes/home.routes.js"

const app = express();
const PORT = 3000;

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next(); 
})

app.use(homeRouter)

app.use((req: Request, res: Response) => {
    res.status(404).send("<h1>404 - Page Not Found</h1>");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

```

👉 **Exercise:** Create a new router in a new file `product.routes.ts`. Add a route for `/add-product`. If the path gets requested, respond the text `Here you can add a product`. Add a route for `/products`. If the path gets requested, respond the text `All products are displayed here.`\
Import the router into your `index.ts` and test if all paths work.


### Adding a path to your paths

All the routers we have imported are now connected to the root of our webapp. We can add a prefix to the paths by passing it in as the first argument on the `app.use()` method.`

For example:
```ts
app.use("/shop", productRouter)
```

Now all the routes in the productRouter need to be accessed with the `/shop` prefix. Like this `/shop/add-product`.


## Returning a HTML file

Our routes are now answering a text. We could add HTML code in there but that would get messy. Let's create some HTML files in send these instead. In your `src` folder, create a new folder called `views`.

Create two HTML files in there, `products.html` and `add-product.html`. Page `add-product.html` should contain a form which POSTs to the same file, containing inputs for name, desciption and price. The page `products.html` should contain two divs displaying the plain text name, description and price. You can create the HTML code yourself or use the example (if provided). 

**Note:** We are not going to worry about any CSS at this point. These HTML files are just temporary to test our back-end functionality.

We're gonna adjust the `\products` path to respond by sending the correspending HTML file. 


```ts
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/products", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "views", "products.html"))
});
``` 

The `path.join()` puts together the strings to form the actual path to the file. This happens according to which OS is currently being run. 

**Note:** Are you getting a TypeScript error on `import.meta.url`? You probably forgot to add ` "type": "module",` to your `package.json`.

👉 **Exercise:** Try it out! Now edit the `/add-product` route as well to respond by sending the correspending file. Create a `404.html` file in the views folder and implement it in the 404 route. 

**💡 Thought exercise**\
Submitting the form on `add-product` will result in an 404 page being shown. Why is this?\
Next lesson we will get the form working. 






