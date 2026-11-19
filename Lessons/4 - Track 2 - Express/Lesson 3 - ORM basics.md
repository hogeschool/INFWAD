# ORM

## Why We Need an ORM (Object-Relational Mapper)

In programming, we work with classes and objects, while databases store data in tables and rows. This mismatch means that every time we want to save or retrieve data, we would normally have to write SQL queries and manually convert database rows into objects in our code. Even for simple operations like inserting a user or fetching a product, this process can be repetitive, error-prone, and harder to maintain as applications grow.

An Object-Relational Mapper (ORM) solves this by automatically handling the translation between objects and database tables. With an ORM, you can create, read, update, and delete objects directly in your programming language, and the ORM generates the necessary SQL behind the scenes. This allows developers to focus on the logic of their application rather than on database mechanics, while still leveraging the relational database structure they already understand.

## TypeORM

TypeORM is a TypeScript-friendly Object-Relational Mapper that allows you to work with databases using classes and objects instead of writing SQL queries. You define entities as TypeScript classes, and TypeORM automatically maps them to database tables, handles inserts, updates, deletes, and queries, and even manages relationships between entities.

Using TypeORM, you can interact with your database in a way that feels natural in TypeScript. You can save an object, fetch records, or update data directly through your classes, while TypeORM generates the SQL behind the scenes and keeps your database in sync with your application's models. This simplifies development and keeps your code clean, readable, and easy to maintain.

### Design Patterns

There are two common ways ORMs organize how objects talk to the database: Active Record and Data Mapper. In Active Record, each class represents a table and has methods to save, update, or delete itself. This is easy to use, but the class mixes the data with the database logic.

Data Mapper keeps the data model and the database connection separate. The entity class only defines the data model, while a separate manager or repository handles saving, updating, and fetching from the database. 

TypeORM supports both patterns. but the documentation is written mostly for Data Mapper since it's more commonly used, especially in larger projects where the separation of concepts is more important. So your classes stay clean and database operations are done through repositories or the EntityManager. We will use the Data Mapper pattern as well. 

## Getting our ORM ready

### Step 1: Installation and config

The first step to use TypeORM is to **install the library and the database driver** you want to use. For example, if you are using SQLite for simplicity, you can run:

```bash
npm install typeorm reflect-metadata better-sqlite3
```

TypeORM needs `reflect-metadata` to handle decorators, which are used to define your entities. After installing, you create a **data source configuration** file where you tell TypeORM how to connect to the database, which entities it should use, and whether to automatically create tables. A simple setup for SQLite looks like this:

```ts
// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "./models/Product.js";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "database.sqlite",
  synchronize: true, // automatically creates tables
  logging: true,
  entities: [Product], // list all your entity classes here
});
```

The `entities` array tells TypeORM which classes represent database tables. Right now we only have `Product`, so the array contains just one item. **Important:** As you add more entities throughout this course (like `Category` or `User`), you must add them to this array as well. For example, when you create a Category entity later, you'll update it to:

```ts
entities: [Product, Category],
```

If you forget to add an entity to this array, TypeORM won't create its table and you'll get errors when trying to use it.

### Step 2: Create an entity


Now that TypeORM is installed and your data source is configured, the next step is to create an **entity**. An entity is a TypeScript class that represents a table in your database. Each property in the class becomes a column. We are going to adjust our existing `models/Product.ts` to an entity.

TypeORM uses `decorators` to adjust our model class to a database entity. For example, *decorating* a field in our model with `@Column()` makes it a column in our database table. 
```ts
@Column()
name: string;
```

Like this we can decorate our existing Product model. 

```ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column("float")
    price: number;

    constructor(name: string, desc: string, price: number) {
        this.name = name;
        this.description = desc;
        this.price = price;
    }
}
```

Note that we added a new field; `id`. This is the `primary key` of the database table. You have learned about this in previous courses. 

Marking `id` with `@PrimaryGeneratedColumn()` means that whenever a new product is saved, TypeORM will automatically assign a unique number to it, which can then be used to fetch, update, or delete that specific product in the future. This automatic primary key generation is a foundational feature in any ORM, allowing developers to work with objects without manually handling unique identifiers. This also means we don't need the `id` in our constructor.

### TypeScript and the Definite Assignment Assertion

You might notice the exclamation mark (`!`) after the `id` property: `id!: number`. This is TypeScript's **definite assignment assertion operator**.

TypeScript's strict mode (which we have enabled in `tsconfig.json`) requires all class properties to be initialized either in their declaration or in the constructor. However, with TypeORM entities, the `id` field is automatically generated and assigned by the database when we save a product - not in our constructor. TypeScript doesn't know this will happen, so without the `!` it would show an error: *"Property 'id' has no initializer and is not definitely assigned in the constructor."*

By adding `!` after the property name, we're telling TypeScript: "Trust me, this property will be assigned a value before it's used, even though it's not initialized in the constructor." This is standard practice when working with TypeORM and other ORMs that manage certain properties automatically.


### Step 3: Connect the database

Now our app is dependent on the database we need to connect to it before we can use our app. In our `index.ts` file we need to do this. First off, import the configuration from the data-source file. And get `reflect-metadata` imported so the app can handle the decorators.

```ts
import "reflect-metadata";
import { AppDataSource } from "./data-source.js"; // your TypeORM data source
```

Now we need to put all `app...()` methods that require the database connection inside the initializtion of our database (the imported `AppDataSource`).

```ts
AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");

        // Register routes after database is ready
       ...

        // 404 handler
        ...

        // Start server
        ...
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });

```

The complete `index.ts` file can be found in the files folder. 

#### Run it!
Run your server like normal.
Once the server is started, TypeORM begins managing the database automatically. During initialization, it checks whether the specified database exists and verifies whether the tables defined by your entities are present. If a table does not exist, TypeORM will create it automatically.

In the project's `src` folder, a file named `database.sqlite` will appear. This file represents the database that TypeORM has created and manages for the application. The automatic creation of tables and the database file is controlled by the `synchronize: true` option in the `data-source.ts` configuration. 
**Production Warning:** The `synchronize: true` setting automatically updates your database schema to match your entity definitions. This is extremely convenient during development, if you add a new column to your entity, TypeORM creates it in the database automatically. However, **this is dangerous in production** because it can delete existing data, drop columns, or make unexpected schema changes when you deploy updates. In production applications, you should:
- Set `synchronize: false`
- Use TypeORM migrations to control database changes in a safe, predictable way
- Review and test all schema changes before applying them

For this course, we'll keep `synchronize: true` to focus on learning concepts rather than migration management. Just remember: real-world applications need proper migration strategies.
**Never** adjust the structure of the database tables directly in the `sqlite` file. Always use the `entity` models so your ORM does not get confused.


## CRUD actions on our database

Like discussed before, TypeORM uses the **Data Mapper** pattern with the **Repository Pattern**. The repository represents a collection of all your `Product` records in the database. You access and manage these records through the repository object, for example by calling `.find()` to get all products or `.save()` to add a new product.


### Create
In our `productController.ts` we have a method to create a new Product object and add it to our list of products. We need to change this to add it to the database instead. We're not gonna write an SQL query for this, but let the ORM do the work.

At the top of the file, import our source and get the `Product` repository from it.

```ts
import { AppDataSource } from "../data-source.js";

const productRepository = AppDataSource.getRepository(Product)
```

Now we can adjust our existing `handleAddProduct` method to use this productRepository. 

```ts
export async function handleAddProduct(req: Request, res: Response) {
    const name = req.body["name"];
    const desc = req.body["description"];
    const price = parseFloat(req.body["price"]);

    // Create the product
    const newProduct = new Product(name, desc, price)

    // Save it to the repository (database)
    await productRepository.save(newProduct)

    // Render the page again with a new message
    res.render("add-product", { message: "Product added" });
}
```

Note that we changed the function to being `async` and there is an `await` infront of the `productRepository` call. We'll explain this in the next bit. 

### Async await
Some operations, like reading from a database, take time and run asynchronously. Marking a function with `async` lets it handle these operations, and using `await` pauses the code until the operation is finished. This way, you can write asynchronous code that reads like normal, step-by-step code. For example, `await productRepository.save()` waits for the database succesfully save the product before continuing.

If `async` and `await` are not used, database operations still run asynchronously, but the program does not wait for them to finish before moving to the next line of code. This means that any code depending on the result of the operation may execute too early, leading to incorrect behavior. In our case, it will render the page with the message `Product added` before the product is actually added.


### Read

With the current knowledge you should be able to adjust the `showProducts` method to work with the `repository` as well. Try to get it working! 

Now we can delete the list and two helper methods in the `models/Product.ts` as we no longer need this. It's all handles by the ORM (database) now.

Solution
```ts
export async function showProducts(req: Request, res: Response) {
    const products: Product[] = await productRepository.find();
    console.log(`Number of products found: ${products.length}`);
    res.render("products", { products: products });
}
```

## Dynamic routes in Express

In Express, routes define how the server responds to different URL paths. Sometimes, these paths need to include changing values, such as an ID for a specific product or user. Dynamic routes make this possible by using **route parameters**, written with a colon (`:`) followed by a name. For example, the route `/products/:id` can match `/products/1` or `/products/42`, treating the number as a variable part of the URL. This allows the same route definition to handle many similar requests without needing a separate route for each item.

Inside the route handler, Express automatically makes these variable parts available through the `req.params` object. For instance, if the route is `/products/:id` and the user visits `/products/3`, then `req.params.id` will contain the value `"3"`. The server can use this value to look up a record in the database and send back the correct response. Dynamic routes are essential for building flexible web applications, as they make it easy to handle resources like users, posts, or products in a consistent way.

### Read a single product
Let's get these dynamic routes going to display a single product. First, we need to create a `async` `ShowSingleProduct` function in our controller, that takes a `Request` and `Reponse` like the other. 

We know the dynamic part gets inserted into the `req.params` object by Express. Get the `id` from there, parse it to a int and save it in a new variable.
```ts 
const paramId = parseInt(req.params.id);
```

Now we can use the ORM to find a product with this `id`.\
Remember filtering in SQL is done with `WHERE`. It would be a query like this
```SQL
SELECT *
FROM product
WHERE id = 1
```
Our ORM offers different `Find` options. Take a look at the official documentation and look for the best solution to get one product from the given id.\
https://typeorm.io/docs/working-with-entity-manager/find-options 

Solution
```ts
const paramId = parseInt(req.params.id);
const product = await productRepository.findOneBy({ id: paramId })
```

### Set up the route

In our `./routes/products.routes.ts`. file, import the `ShowSingleProduct` method.\
Add the route with the `:id` parameter.
```ts
router.get("/product/:id", showSingleProduct)
```

#### Create a new View
Create `./views/product.ejs` and write some HTML and EJS code to display the product data. Take a look at our previous EJS files to remember the syntax and create your new file. 

Now adjust `ShowSingleProduct` to render this view and pass the product object from the database to it.\
Run your server and try it!

ðŸ‘‰ **Exercise:** On the view showing all products, create a link to the single product page for each product. 

ðŸ‘‰ **Exercise:** Create a new route and controller function to handle the deletion of a product. Edit the `product` view to show a *delete* link for that product. Yes, the way we are handling this now is very unsafe, this is just for practice. We'll properly implement it later. 

# Writing Queries with TypeORM

When working with an ORM, we no longer write raw SQL statements. Instead, we use **repositories** and **query methods** that TypeORM provides to interact with the database in an object-oriented way.

Each entity, such as `Product` or `Category`, has a corresponding **repository** that represents the table in the database. The repository gives us methods like `.find()`, `.findOneBy()`, `.save()`, and `.delete()` to perform common database operations. For example, instead of writing a SQL query to get all products, we simply call `productRepository.find()`.

### Searching and Filtering with `.find()`

TypeORM's `.find()` method lets you search for records by giving it a filter object. For example, to find a product with an exact name match:

```ts
const product = await productRepository.find({
  where: { name: "The Great Gatsby" },
});
```

This will return all products whose `name` exactly matches *The Great Gatsby*.

If you want a **partial match**, use the `Like` operator. This works like SQL's `LIKE` keyword. First, import it from TypeORM:

```ts
import { Like, LessThan } from "typeorm";
```

Then you can use it in your queries:

```ts
const similarProducts = await productRepository.find({
  where: { name: Like("%Book%") },
});
```

This finds all products that have "Book" anywhere in their name.

You can also combine filters to narrow your results. For example, to find all products that contain "Book" in their name **and** have a price below 20:

```ts
const filteredProducts = await productRepository.find({
  where: { 
    name: Like("%Book%"),
    price: LessThan(20)
  },
});
```


### Finding a Single Record with `.findOneBy()`

If you only want a simple condition without extra options, you can use `.findOneBy()`, which is a shorter and slightly faster version:

```ts
const product = await productRepository.findOneBy({ id: 1 });
```

This version is often preferred when you're simply searching by an ID or other exact field, when you're sure you only need one record - for example, showing a single product page. Using `.find()` in those cases would be unnecessary and might even cause confusion, since it always returns an array.


### More info on Find() filters
https://typeorm.io/docs/working-with-entity-manager/find-options/ 



