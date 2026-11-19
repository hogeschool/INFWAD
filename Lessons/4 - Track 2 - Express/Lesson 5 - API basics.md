# Lesson 5: API basics

### What is an API?

An API, short for **Application Programming Interface**, is a set of rules that allows different software programs to communicate with each other. The clients (front-end) can call the API to get data from the back-end. Or call the API to send data to the back-end.

By seperating the back-end logic from the front-end we can access the same back-end from different clients. For example, this client can be a website or a smartphone app. 

### Different API types

There are several types of web APIs, each designed for different needs and styles of communication between systems. The most common are **REST**, **SOAP**, and **GraphQL**.

**REST (Representational State Transfer)** is the most widely used style today. It uses standard HTTP methods such as GET, POST, PUT, and DELETE, and works with resources represented as URLs. REST APIs are simple, flexible, and easy to use, which makes them a great choice for most modern web applications. Express is especially well-suited for building REST APIs because it naturally follows this request-response structure.

**SOAP (Simple Object Access Protocol)** is an older, XML-based protocol that focuses on strict standards and security. It is often used in enterprise environments where reliability and formal contracts between systems are important. However, it is more complex and less flexible than REST.

**GraphQL** is a newer approach where clients can request exactly the data they need in a single query. This reduces unnecessary data transfer and can make APIs more efficient for complex applications, though it requires more setup and a different way of thinking about data.

As the most common type today is REST. This is what we are gonna use. The format to sent data between the client and the API will be JSON. 


## API Routes in Express

In a web application, an **API route** is an endpoint on the server that responds to client requests with data or performs specific actions. Each route corresponds to a URL path and an HTTP method, such as GET, POST, PUT, or DELETE. For example, a GET request to `/products` might return a list of all products, while a POST request to `/products` could create a new product.

API routes are often seperated from other routes by giving them their own `/api/` path. For example a GET call to `/api/products` will respond with a JSON containing all products. 

So, we want to use our ORM to get all `Product` objects. Convert that list of objects to JSON. Respond it back to the client.  

## Our first endpoint

### JSON parser
In our index.ts we have this line
```TS
app.use(express.urlencoded());
```
Do you still remember what it does?

It parses the body from the incoming request to an array so we can more easily use it in our code. When working with API routes the body of incoming requests will be JSON. We need to include the JSON parser as well. Express can identify the incoming request and use the correct parser. Add the JSON parser middleware below the existing one. 

```TS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
```

### CORS

**Cross-Origin Resource Sharing (CORS)** is a browser security feature that controls which websites are allowed to send requests to your server.
Normally, when a web page and the server both come from the same address (for example, `localhost:3000`), everything works fine. That's the case when you use a regular HTML or EJS website, the browser sees them as coming from one place.
But when your front-end runs separately (for example, a Vue app on `localhost:5173` and an Express API on `localhost:3000`), they have different addresses. In that case, the browser will block the request unless your server says it's allowed. That's where CORS comes in, it tells the browser to allow other origins.

You can use CORS to further restrict access to one origin, for example `https://mywebsite.com`. But during development it's common to allow all CORS so any origin can make requests.  

CORS is not included in Express by default so we will need to install it from npm
```
npm install cors
npm install @types/cors --save-dev
```

Now, in our index.ts we can import it and use the middleware. It's common to use this middleware before the *parsers*.
```TS
import cors from "cors";

app.use(cors())
```


## Creating the API routes

We want to seperate our API routes from our view (with EJS) routes. In our `routes` folder create a new folder called `api`. In this new folder create a file named `products.routes.ts`. In this file we will define the routes for our product API.

Let's start with two simple GET routes. One to get all products and one to get a single product by id. No need to write *handlers* yet, just get the routes so we can handle them later in our `controller`. 
You should be able to write this code by yourself now. 


```TS
import express from "express";

const router = express.Router();

router.get("/");
router.get("/:id");

export default router;
```

Import this router in your `index.ts` and set it to the `/api/products` path.  

```TS
app.use("/api/products", productApiRouter);
```



### Set up the api controller
In the `controllers` folder, create a new folder called `api`, in this folder create a new `products.controller.ts`.

In the controller we create the functions to handle the incoming requests. The incoming `"/api/products"` would get all products and return those. As we know, a REST API answers in JSON. Express can easily convert our objects to JSON and send it as response by calling `res.json(...)`. 

So, creating the handler for this route can be as simple as this (with the correct imports).
```TS
import { Request, Response } from "express";
import { AppDataSource } from "../../data-source.js";
import { Product } from "../../models/Product.js";

const productRepository = AppDataSource.getRepository(Product);

export async function getAllProducts(req: Request, res: Response) {
    const allProducts = await productRepository.find();
    res.json(allProducts);
}
```

Now import and set this function in our `api/products.routes.ts`

`router.get("/", getAllProducts);`

👉 **Exercises: Create API controller for /:id**
Write the `getProduct` method in our API controller to get a single product based on id and connect it to the route.
Don't forget to handle possible errors.

## Testing your API

To test our API we need to access that route. Just like we did when we had views. Now the endpoint returns JSON instead of a website using a webbrowser for this is not the most handy way. 
In VS Code install the plugin `REST Client` by `Huachao Mao`.
In the root of your project, create a folder called `rest-tests`. This folder will contain our HTTP request files, keeping them separate from the application code. Now in your this folder create a new file called `products.rest`, the VS Code extension will recognize this a REST test file. You could create multiple `.rest` files for different paths.

Write the following line `GET http://localhost:3000/api/products`. Run your server, check if port 3000 is correct. Above your line a text *Send Request* will appear. You can click this to send the request, if your server works correctly, a new window will open with the result of your request. 

👉  **Exercises: Test your API**
You can create multiple requests in a `.rest` file by separating them by a line of `###`. Create a second request to get a single product and try it. 

👉  **Exercises: Include the category**
You have probably noticed, there's no `category` information in the response. TypeORM doesn't include relations automatically, like we have seen in the previous lesson. Fix the two controller methods to include the `category` information and test your endpoints again. 


## What is an RESTful API?

Earlier, we shortly introducted the definition of REST API. When an API is according to the REST principles, we call it *RESTful*. These a are a few  principles you should keep in mind.

**Endpoints are resources instead of actions.**

In a RESTful API, everything is treated as a resource:
- /users
- /products
- /orders/123

You use HTTP methods to express what you want to do with the resource:
- GET /products -> retrieve
- POST /products -> create
- PUT /products/10 -> replace/update
- PATCH /products/10 -> partially update
- DELETE /products/10 -> delete

Get resources from within another resource.\
For example, to get all items from an order\
Good: /orders/5/items\
Bad: /getItemsFromOrderId/5

**The API is stateless.**

The server does *not* remember any user state between requests.
Every request contains all required info (authentication, filters, data, etc.).

## Filter endpoints

Filter endpoints enable you to write filters for a query inside the request. 
A request like this `/products?categoryId=1` will respond with all product with categoryId 1.\
Any text behind the `?` will be considered is considered a *query parameter*. Query parameters are not part of the route path, so they do not appear in your `.get()` route definition.
So, this request will trigger `.get("/products")`. If you are using a router mounted on a path, like we are, it would just be `.get("/")`. 

ExpressJS will parse these parameters into JSON in our *Request* object. You can access them through the `query` property in the *Request* object. The given example will result in the following JSON in `req.query`.
```TS
{
  categoryId: "1"
}
```

Let's go and adjust our `getAllProducts` method to deal with query parameters. We can build a filter JSON and pass this to our TypeORM `.find()` method.

Check out the following code. Can you unravel how it works? What happens if the request contains no query paramters?
```TS
export async function getAllProducts(req: Request, res: Response) {
    const filters: any = {};

    if (req.query.categoryId) {
        filters.category = { id: Number(req.query.categoryId) }
    }

    const allProducts = await productRepository.find({
        where: filters,
        relations: { category: true },
    });

    res.json(allProducts);
}
```
👉  **Exercises: Filter by name**
Adjust the code to also be able to filter on name. Include a new test in your products.rest file to test it.

👉 **Exercises: Filter with operators**
Now look up what TypeORM operators are and adjust your filter to use Like on the name. Include a new test in your products.rest file to test it.


👉  **Exercises: Create a POST /Products endpoint** 
Code an endpoint to create a new product. You can take a look at our non-api code where we have done this before.\
An endpoint should always respond something. Send a `201` response containing the newly created product, including its new generated id from the database.
```res.status(201).json(newProduct);```
The test code in your `products.rest` will be something like this. The given content will be included in the `body` of the `Request` just like when we handled the form.
```
POST http://localhost:3000/api/products
Content-Type: application/json

{
    "name": "The Hobbit",
    "description": "Fantasy",
    "price": 12.50
}
```







