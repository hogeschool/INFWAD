# ORM advanced topics

## Exception handling

Whenever your code communicates with a database, things can go wrong. The connection might fail, the data might violate a constraint, or the query could be malformed. TypeORM doesn't silently ignore these problems - if something fails, it throws an error. If your code doesn't handle that error it can crash the entire Express server.

### Improving the showSingleProduct function

The current version of the function works in simple cases, but it assumes that everything will go right, that the database query will succeed and that a product with the given ID will always exist. In real applications, that's not always true. The database could fail to respond, or the user might request a product ID that doesn't exist.

First we should check if the result of our query actually contains a product. As TypeORM will return `null` if there is no product with the given id. Passing `null` to render will crash our EJS page.\
If the product is not found, respond a 404 status with a fitting message.
```TS
if (!product) {
    res.status(404).send("Product not found");
    return;
}
```


ðŸ‘‰ **Exercise:** Making `handleAddProduct` safer.\
Start by validating the user input. Check that all form fields are filled in and that the parsed price is a valid number (not `NaN`). If any of these checks fail, respond a 400 status code with a clear error message.



## Error handling middleware
The previous adjustments made sure the data is valid before it continues to the database. But things can go wrong during the database call as well. 
Manually wrapping all database calls in a `try catch` can create a lot of repetitive code, which we want to avoid. Remember middleware, the functions that run on every request? We can create our own *error-handling middleware* to centralize error management.

When a **await** method throws an error *Express* will catch this and pass it down the routes, to the global error handler. 

In our `index.ts`, after all routes have been declared, and after the 404 handler, you should add your global error-handling middleware. This middleware will catch any errors passed from your routes or any unhandled exceptions in async functions.

It should be the last middleware, just before `app.listen()` so that it can handle errors from all previous middleware and routes.

```TS
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);
    res.status(err.status || 500).send(err.message || "Internal Server Error");
});
```
This middleware receives `err` parameter, of type `Any` as we want to catch all type of errors. It logs the error and then sends the error to the client. If the error has a status code and message those are used. Otherwise it defaults to `500 Internal Server Error`

##### In Express 4, people often used an asyncHandler wrapper to avoid repetitive try/catch blocks. We do not need that here because we are using Express 5, which forwards async errors to error-handling middleware. This is just a historical heads-up, since a lot of material online is still based on Express 4.

## Table relationships

In a database, tables often have relationships with each other. These relationships are created by linking a primary key from one table to a foreign key in another. This allows data from different tables to be connected, for example, linking a product to the category it belongs to.

In plain SQL, you would use a `JOIN` statement to combine data from multiple tables. An ORM can handle this automatically. Instead of manually writing joins, the ORM uses these key relationships to load connected objects directly. This means you can access related data, such as a product's category, simply through object properties, not raw SQL.

To demonstrate this, we'll create a `Category` entity in our database.
Each Product belongs to one Category (for example, "Books"), while one Category can contain many Products. This is called a one-to-many relationship.

Create the file `./models/Category.ts`

```TS
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Product } from "./Product.js";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name: string;

    // Relation: One category can have many products
    @OneToMany(() => Product, (product) => product.category)
    products?: Product[];

    constructor(name: string) {
        this.name = name;
    }
}
```

In a traditional SQL database, the Category table would not store any direct reference to its products. Instead, the Product table contains a foreign key pointing to the Category it belongs to. This means that in pure SQL, a Category cannot have a list of Products stored inside it.

However, with an ORM, we can model this relationship as if such a list existed.
In our Category class, the products property is not an actual column in the database, but a virtual relationship managed by TypeORM. When we query a Category, the ORM can automatically fetch and fill this list with the related Product objects. This makes it much easier to work with our data in object form, without having to manually write SQL joins.

@OneToMany() is a decorator that tells TypeORM that one Category can be linked to many Products.The first part, `() => Product`, is a function returning the related class. TypeORM uses this to know which entity the relationship connects to.

The second part, `(product) => product.category`, explains how the two entities are linked. It points to the property on the `Product` side (`category`) that defines the other half of this relationship. 

Now we can create the category property in `Product`. We don't need to store the traditional **Foreign Key**, the ORM will fetch the actual Category object for us into the Product object. Behind the scenes, the database still uses a **foreign key** to link the tables, but we don't have to manage it ourselves.
```TS
// Relation: Many products belong to one category
@ManyToOne(() => Category, (category) => category.products)
category?: Category;
```

Note the `?` after `category`—this marks the property as optional. Because TypeORM only loads relations when you explicitly request them in your query, this property will be `undefined` by default. Using `?` tells TypeScript that the data might be missing, which forces you to safely handle the value before using it, preventing common runtime crashes.

In the `data-source.ts` file there is an `entities` array. Add the `Category` class to that list, to let TypeORM know it should handle this class for us:

```ts
import { Category } from "./models/Category.js";

// Update the entities array:
entities: [Product, Category],
```

Next time we run the server, TypeORM will automatically update the database to match our modified models. 

## Data seeding
Data seeding is the practice of populating a database with initial or test data so that we can work with meaningful information instead of starting with an empty database every time.

Since we are using an ORM, we avoid inserting rows manually through raw SQL. Instead, we use the ORM's repositories and entity objects to create and save data programmatically. This way, the database is automatically filled in a safe and consistent way whenever we start the server or run a seeding script.

In the utils folder, create a new file called `seed.ts`. 
```TS
export async function seedCategories() {

}
```
Using your current knowledge should be enough to create this method. Let's try it! Here's a few hints.
- Open the repository for `Category` 
- Use `.count()` to check if the database table is empty
- Create a new `Category` object with name `Book`
- Save it to the repository
- Write a console.log conforming the action. 

```TS
export async function seedCategories() {
    const categoryRepository = AppDataSource.getRepository(Category);
    const count = await categoryRepository.count();
    if (count === 0) {
        const books = new Category("Books");
        await categoryRepository.save(books);
        console.log("Seeded Categories");
    }
}
```

In our `index.ts`, import the function and call it just after the database was opened. Don't forget to `await` call it as it is an `async` function. The anonymous function within our `then()` needs to become `async` as well.

```TS
AppDataSource.initialize()
    .then(async () => {
        console.log("Database connected");
        await seedCategories();
        ...
```

**Exercises:** 
- Create a new `seedProducts()` to seed at least one product into the database with the existing `Category` *Books*.
- Adjust the controller so that all newly created `Products` get the existing *Books* `Category`.  
- Adjust the page to show a single product to also display the name of the category this product is in. 

### Filtering with Relations in TypeORM

When working with related tables, such as `Product` and `Category`, you often need to query data that involves both. TypeORM allows you to include relations directly in your queries so that you can fetch connected objects without writing complex SQL joins.

For example, if you want to find all products and include their category information, you can use the `relations` option inside your `find` call:

```ts
const products = await productRepository.find({
  relations: { category: true },
});
```

Here, TypeORM automatically performs the SQL join for you and fills each product with its related category object. You can then access the category name directly in your code with `product.category.name`.

You can also combine relations with filtering. Suppose you want to find all products that belong to the category "Books". You can do this by adding a `where` condition on the related table:

```ts
const books = await productRepository.find({
  relations: { category: true },
  where: {
    category: { name: "Books" },
  },
});

const product = await productRepository.findOne({
  relations: { category: true },
  where: {
    category: { name: "Books" },
    name: "The Great Gatsby",
  },
});
```

TypeORM will automatically generate the correct SQL query to match this relationship filter. This approach allows you to work with objects and their relationships naturally, without needing to think in terms of SQL joins or foreign keys.

 **Exercises: Advanced Filtering with TypeORM**
Write the `.Find()` filter for the following questions. No need to display them on your page. Just write the filters.


1. **Find expensive products with partial name match**
   Retrieve all products that cost more than 20 and have the word *guide* anywhere in their name. Include the category relation so you can display the category name alongside each product.

2. **Find cheapest product per category**
   For each category, find the product with the lowest price.

3. **Combine multiple filters with OR**
   Find all products that either cost less than 10 **or** have the word *book* in their name. Include the category relation to show which category each product belongs to.

