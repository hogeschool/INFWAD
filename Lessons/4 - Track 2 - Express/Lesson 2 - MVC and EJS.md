# Lesson 2: MVC and EJS

## Server Side Rendering (SSR) vs Single Page Applications (SPA)
**SSR** and **SPA** are two different approaches to generating and delivering web content, each with its own advantages and trade-offs.

Server-side rendering with EJS generates HTML pages on the server for each request. When a client requests a page, the Express server processes the corresponding EJS template, injects dynamic data from the application or database, and returns fully rendered HTML to the browser. The browser then displays the page immediately, and any subsequent interactions typically require new requests to the server. This approach ensures that the content is visible to search engines, works on devices with limited JavaScript support, and often has faster initial load times because the client receives a complete HTML document.

Single-Page Applications, on the other hand, load a minimal HTML page initially and rely heavily on JavaScript to render and update content dynamically on the client side (Client Side Rendering). In SPAs, after the initial page load, navigation and data updates occur without full page reloads, often fetching only JSON data from the server via APIs. This provides a smoother and more interactive user experience, with faster subsequent navigation and complex client-side features, but it typically requires more client-side processing and may have slower initial rendering.

In summary, SSR prioritizes **server-rendered content and quick initial display**, while SPAs prioritize **client-side interactivity and fluid navigation**. Choosing between the two approaches depends on the application’s requirements for SEO, performance, and user experience.

A recent trend is hybrid rendering, popularized by frameworks such as Next.js (React) and Nuxt (Vue). These frameworks allow applications to combine server-side rendering (SSR) and client-side rendering (CSR), even within the same page.

**Examples of SSR websites:** Tweakers, Wikipedia, HR.nl  
**Examples of SPA websites:** Pathé, Spotify, Gmail  
**Examples of hybrid websites:** Bol.com (Next.js), Booking.com (Next.js), Funda (Nuxt)

For now, we'll start with SSR, where the server generates HTML pages and sends them to the user's browser. This approach is easier to get started with and allows us to understand the basics of Express, HTTP requests and responses, MVC, and our ORM without having to deal with API security right away.

Once we understand these fundamentals, we'll move on to building an API.



## Handling the POST request

At this moment we're not storing any data on our server. To get this going we need to get the form on our `add-product.html` page working. 

Make sure the form is set up correctly. The action is empty and the method is set to post.
```html
    <form action="" method="post">
```

When we press the submit button on this form the page will submit with a `POST` request. Which will result in a 404 page, because we only handle the `GET` request at this moment. Let's fix that.

In our `routes/product.routes.ts` we can copy paste the /add-product route but adjust it to use `router.post()` instead of `router.get()`.

### GET vs POST
GET is used to request something from the server, like a HTML file. POST is used to send data to the server. The data that is being sent to the server is not visible in the URL but is _hidden_ in the body of the request. 

A form in HTML can be used for both purposes. For example the search bar on a search engine is a form that is being handled by a GET request. The data you entered into the search bar is visible in the URL after submitting. \
A form to login to a website will be handles by a POST request. The data is send to the server but not visible anymore after submitting the form. 

### Handle the received POST data

When we receive the `Request` object as parameter in our routes, the data in `req.body` is not directly readable. We need to **parse** it (convert it from raw format into a JavaScript object that our code can work with). 

Luckily, Express has a built-in tool for that. We can use this as middleware so all incoming requests will be parsed automatically. We're going to use this in the `index.ts` before calling the routers. 

```ts
app.use(express.urlencoded({ extended: true }))
```

The `{ extended: true }` option allows parsing of complex objects and arrays in the URL-encoded data.

Let's add a log to to our `.post()` route and see what is inside the request we receive. 

```ts
router.post("/add-product", (req: Request, res: Response) => {
    console.log(req.body)
    res.sendFile(path.join(__dirname, "..", "views", "add-product.html"))
});
```

Open the add-product website, fill in the form and submit it. Now take a look at your terminal where the server is running. It will show the content of the request. Note that all values are strings.
```ts
{ name: 'Book', description: 'A nice book', price: '12' }
```

### Typescript handling
By default the `urlencoded()` parser method will return type `any`, which is not perfect. In TypeScript projects you'll often see more middleware methods to parse the result to a proper type. This will better protect your server from malicious form submissions, as it will throw an error if the content is not what we expect it to be. For now we'll keep it simple and use `any`.


### Parsing options
At this moment our server will only handle POST requests by HTML forms. HTML forms set the body type to `urlencoded`. In the upcoming lessons we will start handling different POST requets, like JSON, then we need to change this middleware to parse requests differently. 

## Temporary storage

The data we received in our request needs to be stored somewhere, often you'll do this in a database. Which we will also introduce later in the course. For now, lets store it temporary in an array so further requests can access it again.

👉 **Exercise:** In the `routes/product.routes.ts` add a new array above the routes. In the post route for add-product, add the `req.body` into this array. At the route for `/products` add a `console.log()` to log the length of the array. Now try it out! Add a few products using the form, access the products page and see if the printed length in the terminal is correct. 

This array doesn't require a type. Even if we create an `interface` to type the array, we can still add data with a different structure because `req.body` is typed as `any`. TypeScript won't prevent us from adding incorrect data. In later lessons, we'll learn how to validate data properly.


## MVC

The **Model–View–Controller (MVC)** pattern is a software architectural design pattern that separates an application into three interconnected components. The goal of MVC is to organize code in a way that promotes clarity, modularity, and ease of maintenance.

### MVC in Express
In the context of **Express.js**, the **Model–View–Controller (MVC)** pattern provides a structured way to organize server-side applications. Express does not enforce MVC by default, but developers commonly adopt it to keep code organized, modular, and scalable. In addition to the three main components of MVC, Express applications also make use of **routes**, which play a crucial role in directing requests to the correct logic.

1. **Model**
   The Model is responsible for managing data and business logic. In an Express.js application, this may include database schemas, query methods, or simple in-memory data structures. Models encapsulate the rules for creating, reading, updating, and deleting data (CRUD operations). For example, a “User” model might specify user attributes and provide methods for retrieving or modifying user data in a database.

2. **View**
   The View represents the presentation layer of the application. In Express.js, this is commonly implemented with template engines such as EJS, Pug, or Handlebars, or with static HTML files. The View receives data from the Controller and is responsible for rendering output that is sent back to the client’s browser. Views focus exclusively on how data is displayed, without embedding business logic.

3. **Controller**
   The Controller manages application logic and acts as the link between Models and Views. Controllers handle incoming requests, interact with Models to perform operations on data, and determine which View should be returned in response. For instance, a Controller for products might fetch all products from the Model and then pass that data to a product list View.

4. **Routes**
   Routes in Express.js define the entry points of the application. A route specifies how the application should respond to a particular HTTP method (such as GET or POST) and a specific URL path. Routes connect requests to the appropriate Controller functions. They do not contain business logic themselves; instead, they act as a traffic director, ensuring that requests are forwarded to the correct controller for processing.

**Flow of Control in Express.js MVC with Routes**

* The client sends a request to a specific URL.
* The Express router matches the request to a defined **route**.
* The route delegates control to the appropriate **Controller**.
* The Controller interacts with the **Model** to retrieve or modify data.
* The Controller passes data to the **View**, which generates a response.
* The **View** is sent back to the client’s browser.

By incorporating routes alongside the traditional MVC structure, Express.js applications achieve clear separation of concerns: routes direct traffic, controllers manage logic, models handle data, and views provide presentation. This organization leads to cleaner, more maintainable, and scalable web applications.

### MVC vs Three Layer Architecture
Both **Model–View–Controller (MVC)** and the **Three-Layer Architecture** (which you used in the OODP Project) are design patterns that separate concerns in software systems, but they emphasize different aspects.

**MVC** divides an application into:

* **Model**: data and business rules,
* **View**: presentation of information,
* **Controller**: coordination of user input and responses.
  It focuses on the interaction between data, the interface, and user actions.

**Three-Layer Architecture** separates software into:

* **Presentation Layer** (user interface),
* **Business Logic Layer** (rules and processing),
* **Data Access Layer** (database communication).
  It emphasizes technical separation between presentation, logic, and storage.

**Comparison**

* MVC is primarily concerned with user interaction flow (input → logic → output).
* Three-Layer Architecture is concerned with technical boundaries (UI, logic, data).
* MVC’s View corresponds to the Presentation Layer, while the Model overlaps with business logic and data access. Controllers often map to parts of the business logic layer.


## Implementing MVC in our server


**Step 1: Create the model** Create a new `models` folder in your `src` directory. Create the file `Product.ts`. In this file create a new Product class containing the fields `name`, `description` and `price` and create the necessary constructor.

Below the class, in the same file, create an array called `products` of type `Product` (your class). Create a function `addProduct` that takes `Product` and adds it to the array. Create a function `getAllProducts` that returns the array. 

Export the class and functions so we can import them later in our controller. \
You should be able to do this yourself now. But here's the example code one more time ;)
```TS
class Product {
    name: string;
    description: string;
    price: number;

    constructor(n: string, d: string, p: number){
        this.name = n;
        this.description= d;
        this.price = p
    }
}

const products : Product[] = [];

function addProduct(p: Product){
    products.push(p);
}

function getAllProducts() : Product[] {
    return products;
}

export {Product, addProduct, getAllProducts}
```

**Step 2: Create the controller** Create a new `controllers` folder in your `src` directory. Inside this folder, create a file named `product.controller.ts`. In this file, import the `Product` class, the `addProduct` and `getAllProducts` functions from your `Product` model.

Then, create three functions. 
- The first function, `showProducts`, takes a `Request` and `Response` object. Inside this function, call `getAllProducts` to retrieve the list of products and log the length of the array to the console. After that, send the `products.html` file located in your `views` folder as the response.
- The second function, `showAddProductPage`, also takes a `Request` and `Response` object and simply sends the `add-product.html` file from the `views` folder.\
- The third function, `handleAddProduct`, takes a `Request` and `Response` object, extracts the `name`, `description`, and `price` from `req.body`, creates a new instance of the `Product` class with these values, and adds it to the products array using the `addProduct` function. Finally, send the `add-product.html` file as the response.

Export all three functions so that they can be used in your routes.

**Step 3: Edit the existing router** In the `routes/product.routes.ts` file that you already have, you will update it to use the controller functions instead of handling logic directly in the routes. First, import the three controller functions you created earlier: `showProducts`, `showAddProductPage`, and `handleAddProduct` from the `controllers/product.controller.ts` file. Remove the current route handlers that directly manipulate the `products` array and send files. Remove the array as well. Then, replace them with routes that call the corresponding controller functions. Specifically, set the GET route for `/products` to use `showProducts`, the GET route for `/add-product` to use `showAddProductPage`, and the POST route for `/add-product` to use `handleAddProduct`.\
Remove the imports that are no longer being used. Finally, make sure the router is still exported at the bottom of the file so it can be used in `app.ts`.

Your routes will look like this

```ts
router.get("/products", showProducts);
router.get("/add-product", showAddProductPage);
router.post("/add-product", handleAddProduct);
```

Express automatically calls the function with the `Request` and `Response` objects when a request comes in. You should not add parentheses `()` because that would immediately execute the function during route setup, instead of waiting for a request.

**Done! Run your server and try it.** 

👉 **Exercise:** Create a `home.controller.ts` as well. Fix what is needed to let the router in `routes\home.routes.ts` use this new controller. 

## EJS

**EJS (Embedded JavaScript)** is a templating engine for Node.js that allows developers to generate HTML markup dynamically using JavaScript. It provides a simple way to embed JavaScript code directly within HTML files, enabling the rendering of data from a server or database into web pages at runtime.

In an Express.js application, EJS is often used in the **view layer** of the Model–View–Controller (MVC) architecture. EJS templates contain standard HTML along with special syntax for embedding JavaScript expressions, loops, and conditionals. This allows the template to display dynamic content, such as lists of products, user information, or other data passed from the controller.

EJS separates the presentation logic from application logic by letting the controller supply data to the template without embedding business rules in the HTML itself. The template is processed on the server, generating the final HTML that is sent to the client’s browser. This approach simplifies code maintenance, promotes reuse of HTML components, and enables consistent rendering of dynamic content across the application.

## Adding EJS to our views
**Step 1: Rename the view and configure EJS**\
Install the ejs package from the terminal `npm install ejs`.\
Rename your `products.html` file to `products.ejs`. In your `index.ts`, set the view engine to EJS and ensure the views folder is correctly referenced. This allows Express to render EJS templates and pass data from the controller to the view. Copy the code to get `__dirname` from the previous lesson.

```ts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
```

---

**Step 2: Update the controller to pass data**
Open your `showProducts` controller function. Instead of sending a static file, use `res.render` to render the `products.ejs` template. 

We can just pass `products` string to the render function. As we previously set the `view engine` and `views` path, Express wil map this `products` string to the correct file. 

The second argument is an object whose properties are made available in the EJS template. In this case, the EJS template can access the returned array via the property name `products`.

```ts
res.render("products", { products: getAllProducts() });
```

---

**Step 3: Modify the HTML to loop through products**
In `products.ejs`, find the section where the static product divs are located. Replace these static divs with an EJS loop to iterate over the `products` array. Use `<% %>` tags for embedding JavaScript code that does not output content, such as loops or conditionals, and `<%= %>` tags for outputting values into the HTML. Inside the loop, display each product’s `name`, `description`, and `price` using `<%= %>`. Keep the existing styling so that each product appears in its own box. 

For example, you can use a snippet like this inside the div container to generate a box for each product dynamically:

```ejs
<% products.forEach(product => { %>
  <div style="border: 1px solid black; padding: 0.4rem;">
    <strong><%= product.name %></strong><br>
    <%= product.description %><br>
    $<%= product.price %>
  </div>
<% }) %>
```

This ensures that each product in the array automatically gets its own div without manually adding HTML for each item.


---
**Step 4: Test the dynamic rendering**
Start your server! Add a few products using the `add-product` route, now navigate to `products` and check if they are displayed!

👉 **Exercise:** Rename the `add-product.html` to EJS as well. Change the correspending routes to use the render method. Adjust the code so a `Product added` text is displayed on the page after handling the form.