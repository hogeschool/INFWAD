# ASP.NET 2: Writing data, and the architecture behind it

Last lesson we gave our app a memory. It can read now. You open a URL and your products come back as JSON, out of a real database, through the proper layers. But reading is only half of what an API does. The other half is changing things, and that means sending data _to_ the server instead of only asking for it. Today we build that: creating products, deleting them, and editing them. Read plus those three is the whole of CRUD (Create, Read, Update, Delete), and by the end of this lesson it will all be working.

Two new things will come up along the way. A product sent from a client is not the same shape as a product we hand back, so we need a new kind of DTO for incoming data. And you cannot test POST or DELETE by typing a URL into the address bar, so we need a real way to send those requests. Everything else is the same as last lesson, just in the other direction.

Then, once the whole API is sitting finished in front of us, we can talk a little more about why all these layers are a good idea.

## What changes this lesson

We're not creating many new files this time. Because we started with a proper architecture from the start, we now mostly add methods to files that already exist.

```
Catalog.Api/
  Controllers/
    ProductsController.cs   (add POST, PUT, and DELETE)
  Services/
    IProductService.cs      (add CreateAsync, UpdateAsync, and DeleteAsync)
    ProductService.cs       (add CreateAsync, UpdateAsync, and DeleteAsync)
  Dtos/
    ProductDtos.cs          (add CreateProductDto and UpdateProductDto)
  products.rest             (new, for testing requests)
```

The repository is not in that list. Last lesson we put `Add`, `Update`, `Delete` and `SaveChangesAsync` on it and then didn't use any of them. Now we use `Add`, `Delete` and `SaveChangesAsync`, exactly as they are.

Nothing changes the database either. We're adding, removing, and editing rows, not columns, so there's no new migration this lesson. Migrations are for when the shape of a table changes. Creating, deleting, and updating products is just normal use of the table we already have.

## 1. Creating a product

### A DTO for the incoming data

When the frontend creates a product, what does it actually send? A title and a price. Not an id. The id doesn't exist yet. Handing out a fresh id when the row is saved is the database's job, not the client's. So the shape coming in is different from the shape going out: the response has an `Id`, the request does not.

That's a reason to create a second DTO. `ProductDto` is what we send back. `CreateProductDto` is what we receive.

> 🎓 Update `Dtos/ProductDtos.cs` so it holds both:

```csharp
namespace Catalog.Api.Dtos;

public record ProductDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}

public record CreateProductDto
{
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}
```

The file was named `ProductDtos.cs`, on purpose. It holds every DTO for the product. Now it holds two.

There's nothing here stopping a client from sending an empty title, or a price of minus ten. Right now the API will take it and store it without complaint. We will talk about rejecting bad input in lesson 6, and the rules for what counts as valid will live right here, in this DTO. For today we'll just trust anything that comes in. (What could possibly go wrong?)

### The service

Above the repository sits the service, and this is where the work happens. It takes a `CreateProductDto`, builds a real `Product` from it, hands that to the repository, and saves.

> 🎓 Add a `CreateAsync` method to `ProductService` (put it below `GetByIdAsync`):

```csharp
public async Task<ProductDto> CreateAsync(CreateProductDto dto)
{
    var product = new Product
    {
        Title = dto.Title,
        Price = dto.Price
    };

    _products.Add(product);
    await _products.SaveChangesAsync();

    return ToDto(product);
}
```

Step by step:

- It makes a new `Product` and copies the title and price across from the DTO. Notice it doesn't set an `Id`. We leave that empty and let the database fill it.
- `_products.Add(product)` hands the product to the repository. Remember from last lesson that `Add` does not touch the database yet. With `Add`, Entity Framework is only taking notes.
- `await _products.SaveChangesAsync()` is the moment it actually gets written. (The row goes into the table.)
- Now something nice has happened: after `SaveChangesAsync`, `product.Id` is no longer empty. The database assigned an id, and Entity Framework put it straight back onto our object. So `return ToDto(product);` returns a product with its real id.

> 🎓 Declare it in `IProductService` too, below the two GET methods:

```csharp
Task<ProductDto> CreateAsync(CreateProductDto dto);
```

### The controller

The controller is where HTTP happens. Take the request, call the service, turn the result into a response.

> 🎓 Add a `Create` action to `ProductsController`:

```csharp
[HttpPost]
public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
{
    var created = await _products.CreateAsync(dto);
    return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
}
```

Three things worth pointing at:

- `[HttpPost]` with no extra path handles `POST api/products`, similar to last lesson's two `[HttpGet]` methods.
- The `CreateProductDto dto` parameter will be filled in from the request body automatically. We don't read the body ourselves. Remember `[ApiController]` from last lesson, the attribute I said switched on some helpful behaviour? This is part of it. It sees the incoming body is JSON, matches it to the DTO, and hands it over. (No need for `[FromBody]`, no manual parsing.)
- `CreatedAtAction(...)` is how we answer, and it does three jobs at once:
    - It sets the status to `201 Created` instead of `200 OK`, because we didn't just fetch something, we made something new, and those mean different things and get their own HTTP codes.
    - It adds a `Location` HTTP header pointing at `GET api/products/{the new id}`, so the caller knows where the thing now lives.
    - And it sends the created product back in the body. With `nameof(GetById)`, we say which endpoint that `Location` should point at: the get-one method we already have.

> 🔍 A little more in-depth info about naming controller actions, while we're here. That lookup (`nameof(GetById)`) works because the action is called `GetById`, no suffix. If you name your controller actions `GetByIdAsync`, the way the service methods are named, ASP.NET drops the `Async` from the action name at runtime, and `nameof(GetByIdAsync)` doesn't work anymore. The create still saves, and then throws an error on the way out, and you get a 500 for a request that actually did its job. So controller actions in this course have no `Async` suffix, to prevent this sort of confusion.

One thing didn't change: the URL. `POST api/products` and `GET api/products` are the same address, on purpose. In a REST API the URL names a thing, the products, and the HTTP method says what you want done with it. GET to read, POST to add, DELETE to remove. So you don't build URLs like `api/createProduct` or `api/deleteProduct`.

That's the create slice done. Let's test it!

## 2. Testing what a browser cannot do

Oops, we have a problem. Typing a URL into the address bar always sends a GET. There's no box in the browser for "send a POST with this JSON body". So we cannot test what we just built. We need a different tool.

We'll use a `.rest` file. It's a plain text file where you write out HTTP requests, and a VSCode extension turns each one into a button you click to send it. This way they sit next to your code, so they're easy to keep and easy to share with the rest of your group. (Plenty of tutorials will use Swagger here, or a separate app like Postman. We'll keep it simple for now.)

> 🎓 Install the REST Client extension in VS Code. Open the Extensions panel and search for "REST Client" by Huachao Mao.

> 🎓 Create `products.rest` in the project root:

```http
@baseUrl = http://localhost:5088

### Get all products
GET {{baseUrl}}/api/products

### Get one product
GET {{baseUrl}}/api/products/1

### Create a product
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "title": "Keyboard",
  "price": 90
}
```

It works like this:

- `@baseUrl = http://localhost:5088` sets the server address once. Use your own port here, the one your app prints to the terminal when it starts. Everywhere below it, `{{baseUrl}}` fills it in.
- Each `###` starts a new request. The text on the same line, after the `###`, is just an optional label, so the file is easier to read.
- A request is a method and a URL. If it sends a body, like the POST does, you add a `Content-Type` header, then a blank line, then the JSON. The blank line matters. It's how the tool knows where the headers end and the body begins.

Once the extension is installed, a small "Send Request" link appears above each request.

> 🎓 Start the app with `dotnet run`, then click "Send Request" above "Get all products". The response opens in a panel next to the file, with the status line and the three products.

Same list you saw in the browser last lesson, now without leaving your editor. Now the one the browser couldn't do.

> 🎓 Click "Send Request" above "Create a product".

A response comes back with status `201 Created`, and the new product in the body, with an id of 4:

```json
{
  "id": 4,
  "title": "Keyboard",
  "price": 90
}
```

It worked! Our first POST. Look at the response headers as well, and you'll find the `Location` header we set: it ends in `/api/products/4`. That's the address of the thing you just made.

> 🎓 Send "Get all products" again. See? Four products now. The keyboard is in the list.

It's real. Not just held in memory until we reload the browser.

> 🎓 Stop the app, start it again, send the GET a third time: the keyboard is still there, because it's a row in the database file.

Let's think about what happened on that POST, because it went the whole way down and back. The controller took the JSON and let `[ApiController]` turn it into a `CreateProductDto`. It called the service. The service built a `Product` with no id, and asked the repository to add it. `SaveChangesAsync` wrote the row, SQLite handed back an id, and Entity Framework set it on the object. The service mapped the now-saved product into a `ProductDto`, the controller wrapped that in a `201` with a `Location` header, and that's what landed in your panel. Every layer did its one job, the same as reading, only in the other direction.

> 🎓 Now break that Keyboard's JSON on purpose: delete a comma or a closing brace and send the create again. You get `400 Bad Request` back, and we never even wrote a single line of error checking code! That's `[ApiController]` doing the work again, guarding the _shape_ of the JSON for free. What it doesn't guard is the _content_:

> 🎓 Try sending a create with an empty title, or with a negative price. Watch it get stored anyway, no complaint. We'll fix that in lesson 6.

Stop the app with Ctrl+C. We still have two features left to build.

## 3. Deleting a product

Delete is the easiest to make.

The service method:

```csharp
public async Task<bool> DeleteAsync(int id)
{
    var product = await _products.GetByIdAsync(id);
    if (product is null) return false;

    _products.Delete(product);
    await _products.SaveChangesAsync();

    return true;
}
```

It looks the product up first with `_products.GetByIdAsync(id)`. If there's nothing with that id, it returns `false`, so the controller can turn that into a "not found". If the product is there, the repository removes it, we save, and it returns `true`. This is the same shape as reading a single product last lesson: the service reports what happened, found it or didn't, and lets the controller decide what that means over HTTP.

> 🎓 Add a declaration in `IProductService`:

```csharp
Task<bool> DeleteAsync(int id);
```

> 🎓 Add the action in `ProductsController`:

```csharp
[HttpDelete("{id:int}")]
public async Task<IActionResult> Delete(int id)
{
    var deleted = await _products.DeleteAsync(id);
    return deleted ? NoContent() : NotFound();
}
```

`[HttpDelete("{id:int}")]` handles `DELETE api/products/5`. If the service deleted something, we answer `204 No Content`. This means: it worked, and there's nothing to send back, because the thing is gone. If there was nothing to delete, we send `404 Not Found`.

> 🎓 Add a delete request to your `.rest` file:

```http
### Delete a product
DELETE {{baseUrl}}/api/products/4
```

> 🎓 Run the app again, and send it. Status `204 No Content`, and an empty body. Send "Get all products" once more: the keyboard is gone.

> 🎓 Now send that same delete a second time, for id 4 again. This time you get `404 Not Found`, because there's no longer a product with that id. The endpoint tells the difference between "deleted it" and "there was nothing there to delete".

> 🎓 Also delete the products you added with the empty title and the negative price (whichever you sent). Send "Get all products", read the ids of the test entries, change the id in the delete request, and send it once for each. Then "Get all products" one last time: the three seed products, nothing else.

Note: the id of a new product keeps climbing. Delete number 4 and create another, and the new one is 5, not 4 again. SQLite doesn't reuse ids. (This is intentional: reusing an id is how an old reference ends up pointing at some new, unrelated thing.)

## 4. Updating a product

We want to have all the letters from CRUD, so now we do 'U': Update. Updating means taking an existing product, replacing its data with new data, and saving. Over HTTP that's a `PUT` request. The client sends the id of the thing to change (in the URL) and a new version of it (in the body), and the server overwrites what it has.

So we need a shape for that incoming data. Remember the DTOs? Update gets its own, `UpdateProductDto`.

> 🎓 Open `Dtos/ProductDtos.cs`. It has two DTOs so far. Add a third, so the whole file looks like this:

```csharp
namespace Catalog.Api.Dtos;

public record ProductDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}

public record CreateProductDto
{
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}

public record UpdateProductDto
{
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}
```

Yes, `CreateProductDto` and `UpdateProductDto` are, right now, exactly the same. Keep both anyway. I'll explain why below.

Next, the service. It needs a method that finds a product, changes it, and saves.

> 🎓 Add `UpdateAsync` to the `IProductService` interface in `Services/IProductService.cs`:

```csharp
Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto);
```

> 🎓 And implement it in `Services/ProductService.cs`:

```csharp
public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
{
    var product = await _products.GetByIdAsync(id);
    if (product is null) return null;

    product.Title = dto.Title;
    product.Price = dto.Price;
    await _products.SaveChangesAsync();
    return ToDto(product);
}
```

It asks the repository for the product. If there's none, it returns `null`, and the controller will turn that into a 404. If the product is there, it copies the new title and price onto it and saves.

Look closely and you might notice something missing. We change the product and call `SaveChangesAsync`, and we never call the repository's `Update` method, the one we defined all the way back in lesson one. That's not a bug. It's one of the nicer things Entity Framework does for us, and it will make far more sense after the architecture explanation, so hold that thought. (Just mentioning it now so you wouldn't think I forgot.)

Now the controller.

> 🎓 Add the `Update` action to `Controllers/ProductsController.cs`:

```csharp
[HttpPut("{id:int}")]
public async Task<ActionResult<ProductDto>> Update(int id, UpdateProductDto dto)
{
    var updated = await _products.UpdateAsync(id, dto);
    return updated is null ? NotFound() : Ok(updated);
}
```

`[HttpPut("{id:int}")]` handles `PUT api/products/5`. The `5` comes in as `id`, the new data comes in from the body as an `UpdateProductDto`, and we hand both to the service. If the service gives back `null`, the product didn't exist, so we answer 404. Otherwise we answer 200 with the updated product. The controller does no work of its own, same as always.

Note that `PUT` means "replace the whole resource with what I am sending". You send the complete product, every field, and it overwrites. There's another method, `PATCH`, for partial updates, where you send only the fields you want changed and leave the rest alone. We use `PUT` everywhere in this course.

Let's try it.

> 🎓 Add a request to your `.rest` file and click "Send Request" above it:

```http
### Update a product
PUT {{baseUrl}}/api/products/1
Content-Type: application/json

{
  "title": "Fancy Laptop",
  "price": 2500
}
```

You should get back a 200, and the laptop is now a Fancy Laptop at 2500. It works!

> 🎓 Change the id to `999` and send again: 404, because there's no product 999 to update.

And that's it! Create, Read, Update, Delete, all four, through the layers, tested. CRUD is complete.

We didn't have to touch the repository, the DbContext, or `Program.cs`. The service was already registered last lesson, so a new method on it needs no new wiring. The layers we set up are starting to pay for themselves.

## Why all those files

You have now written the same shape four times. Every operation, whether it reads or writes, took the same route: the controller took the HTTP request and called the service, the service did the work and asked the repository, the repository talked to the DbContext, the DbContext talked to SQLite.

```
Controller  ->  Service  ->  Repository  ->  DbContext  ->  database
(the web)       (the work)   (data access)   (EF)
```

Four layers to move one product around. For a catalog this small, it looks like overkill. So let me show you the version that's not overkill, and then show you what it costs.

### The version without layers

Here's the whole thing, everything we've just built, in a single controller that talks straight to the database. No service, no repository, no DTOs. Don't type this. Just read it.

```csharp
// This is the version we are NOT building. Read it, do not type it.
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetAll()
        => Ok(await _context.Products.ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _context.Products.FindAsync(id);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> Update(int id, Product input)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null) return NotFound();
        product.Title = input.Title;
        product.Price = input.Price;
        await _context.SaveChangesAsync();
        return Ok(product);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null) return NotFound();
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
```

This works. It's one file instead of seven. For three products, it's completely fine. Plenty of tutorials stop exactly here and call it a Web API.

So what is wrong with it? Nothing you can see at this size. The problem is what happens as the thing grows, because it grows in three directions at once! (Now picture your codebase mutating into a chaotic mess, like _Akira_!)

Every method up there is doing three different jobs mashed together: speaking HTTP (reading the URL, setting status codes), doing the work (deciding what to change), and talking to the database. With one entity and no rules, each of those jobs is one line, so this mashup doesn't hurt. Now picture a real application. Fifteen entities. Business rules ("a price cannot be negative", "you cannot delete a category that still has products"). Every controller is now a big file where database code, rules, and HTTP code are tangled together in the same methods, with a lot of stuff copied across all the files. I get a headache just thinking about all the scrolling and searching through it.

Splitting the work into layers keeps those three jobs apart, so each lives in a predictable place and you can change one without disturbing the others. This is separation of concerns, and the layers are what it looks like in code. Let's zoom in on each one...

### Pulling out the repository

The first job to move out is talking to the database.

We already did this in lesson one. The repository is the one and only place that knows about the `DbContext` and how data is fetched and saved. Everything above it asks for `IRepository<Product>`, which is a _capability_ ("something that can get and store products"), and doesn't know or care whether that's Entity Framework, SQLite, a different database, or a stack of index cards.

That indifference is the whole point, and it has a name: the repository pattern. Because nothing above the repository mentions Entity Framework, the day you switch from SQLite to PostgreSQL, or swap Entity Framework for something else, one file changes and the rest of the app doesn't even notice.

And because that one repository is generic, it serves every entity you'll ever add. That's what the `IEntity` interface was quietly setting up back in lesson one. It gives the generic repository a guaranteed `Id` to query on, so `GetByIdAsync` works for `Product`, and for the next entity, and the one after that, without you writing a new repository each time.

### Pulling out the service

The next job to move out is the actual work.

The service sits between the controller and the repository. It holds the business logic, it maps between entities and DTOs, and it coordinates repositories. Right now, for `Product`, look at what it does:

```csharp
public async Task<List<ProductDto>> GetAllAsync()
{
    var products = await _products.GetAllAsync();
    return products.Select(ToDto).ToList();
}
```

Ask the repository, map to a DTO, done. Now, it's mostly forwarding calls. But the moment a real rule shows up ("reject a negative price", "do not delete a category that still has products"), that rule needs a home, and the home is not the controller (which should only speak HTTP) and not the repository (which should only fetch and store). It goes in the service.

Another example: the moment an operation needs more than one entity at once, like creating an order that has to check the customer, look up each product, and write the order and its lines as a single piece of work, the service is the thing that holds all those repositories and runs them together. We'll do that in the next few lessons. The service you have now is an empty house. You're about to move furniture in.

### Why the DTO

So why not send the `Product` entity straight out, and accept a `Product` straight in?

Now that we have the whole API, it's easier to see the advantages.

The entity (`Product`) is the database's shape. The DTO is the shape you choose to show the outside world. Keeping them apart means you can change your database without changing your API, and change your API without touching your database. In reality, they usually start identical, but drift apart fast.

They drift because of what you need to hide. `Product` has nothing secret today. But later, we will add a `User` entity, and a `User` has a password hash sitting in the database. Return the entity as it is and that hash goes over the wire, straight into the browser, for anyone to read. Do not do that. The DTO is the wall: our `UserDto` will not have a hash field, so there's nothing to leak.

The second reason is what you need to refuse, coming in. A client creating a product should not get to pick its `Id`. A client updating a product should not be able to reassign who owns it, or change the "created at" date. `CreateProductDto` and `UpdateProductDto` won't have those fields, so a client cannot set them, full stop. The id for an update comes from the URL, where you control it, not from the body, where the client does.

The last reason they drift is what an entity drags with it because of its relationships. In lesson five a `Product` gets a link to a `Category`, and a `Category` links back to its products, which link to their category. Hand back the raw entity and the serialiser can walk that chain and pull half the database along with it, or spin in a loop. The DTO takes only the fields you decided to expose and stops there.

So these DTOs are three different boundaries: what you accept to create a thing, what you accept to change a thing, and what you hand back. Three DTOs per entity is the habit that saves you from untangling one overloaded shape later.

### The layered architecture

Here's the whole arrangement in one place:

| Layer      | May do                                                              | Must not do                                                     | Knows about                           |
| ---------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| Controller | Routing, HTTP status codes, calling one service                     | Business logic, data access, touching the DbContext or entities | DTOs, the service interface           |
| Service    | Business logic, mapping entities to DTOs, coordinating repositories | Anything HTTP                                                   | DTOs, entities, repository interfaces |
| Repository | Data access through the DbContext                                   | Business logic, mapping, anything about DTOs                    | Entities, the DbContext               |
| DbContext  | EF configuration, the tables, relationships                         | Anything else                                                   | Entities                              |

Dependencies only point down. Each layer knows about the layer directly below it, and nothing above. A controller talks to a service, never straight to a repository. A repository never reaches up to a service.

So entities stay at the service layer and below. They never appear in a controller. The service is the only layer that touches both entities and DTOs, because the service is where the two meet and get mapped.

### Dependency injection and how long things live

None of your classes build the things they depend on. The `ProductService` needs an `IRepository<Product>`, but it never does something like `new Repository<Product>(...)`. It just asks for one in its constructor, and something hands it over, already built. Same for the controller asking for an `IProductService`.

> 🎓 Open `Controllers/ProductsController.cs` and search it for the word `new`. See? There's not one in there. Nothing in the controller builds its own dependencies.

The "something" that hands it over is the framework, and the mechanism is called dependency injection. The wiring that makes this work is just a few lines in `Program.cs`.

> 🎓 Open `Program.cs` and look at these lines:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductService, ProductService>();
```

Each line says "when something asks for this, give it that". Ask for an `IProductService`, get a `ProductService`. Ask for an `IRepository<Product>`, get a `Repository<Product>`. The one repository line covers every entity, because it's registered for the generic `IRepository<>` rather than for one type.

So, what does `AddScoped` mean? When the framework hands over an instance, you have to think about how long that instance lives before it's thrown away. There are three options:

- Transient: a brand new instance every single time one is asked for.
- Scoped: one instance per HTTP request, shared by everything handling that request.
- Singleton: one instance for the whole application, from the moment it starts until it shuts down.

Our DbContext, repository, and services are all `Scoped`, one per request. We did that because of how the DbContext works.

The DbContext keeps track of the entities you have loaded and the changes you have made to them in your code, and then `SaveChangesAsync` writes all of those changes at once. For that to work, everything in one request has to share the same DbContext. The repository loads a product into the context, the service changes that product, and `SaveChangesAsync` on that same context sees the change and writes it. One context, carried along the whole request.

Watch what the other two lifetimes would do to that. If the DbContext were Transient, the repository and the service would each be handed their own separate context, tracking their own separate copies, and our whole layered setup will not work anymore. If it were Singleton, every request in the whole application would share one context at the same time. A DbContext is not built to be used by many requests at once, so two users saving at the same moment would cause issues, corrupting your data once your app is in production. And you didn't notice, because on your machine there was only one user.

So: one context per request. Scoped. The repository and services are Scoped for the same reason, they have to carry that same context around and have to live exactly as long as it does. The rule worth memorising is that a DbContext or a repository is never a Singleton. Transient is for cheap, stateless helpers that hold nothing (something that formats a string, or sends an email). Scoped is the normal choice for anything in a request that touches your data. Singleton is for application-wide things, a cache, or read-only configuration.

### Back to that Update method

Remember the loose end from the update endpoint: we changed the product and saved, and never called the repository's `Update`. Here's why, and it's the change tracking and the scoped context coming together.

When `UpdateAsync` calls `GetByIdAsync`, the repository loads that product through this request's one DbContext, and the context starts tracking it. When you then write `product.Title = dto.Title` and call `SaveChangesAsync`, the context already knows that exact product changed, and writes just that change. You never had to announce it. The tracking did the announcing.

> 🎓 See it for yourself: in `UpdateAsync`, comment out the `SaveChangesAsync` line, send a `PUT`, then send a `GET` for the same product. The change didn't stick. Put the line back and it does.

So what is the repository's `Update` method for? For the case where you are holding an entity that the context isn't tracking, a "detached" one, that came from somewhere other than a fresh load out of the database. That doesn't come up in our simple examples, but it's useful, so the method stays defined and ready. Most of the time, in this course, changing a tracked entity and saving is all you need.

## Where this goes next

CRUD is complete, and you know why it is shaped the way it is. It's a nice API already, but we haven't connected it to the frontend yet!

In the next lesson, we connect the React app to our new backend. The products page stops fetching from that `products.json` stand-in and starts fetching from your own server, and the pages that add, edit, and delete a product start sending the POST, PUT, and DELETE requests you wrote today. We'll wire up the reading side first, then the writing side.

## Resources

- The REST Client extension, if you want its full syntax: variables, sending several requests, saving responses. https://marketplace.visualstudio.com/items?itemName=humao.rest-client
- MDN on HTTP request methods, for what GET, POST, PUT, and DELETE are each meant to mean, and the difference between `PUT` and `PATCH`. https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
- MDN on HTTP response status codes, including 201 and 204. https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- Microsoft's docs on dependency injection in ASP.NET Core, including the service lifetimes. The official version of the Transient, Scoped, and Singleton distinction. https://learn.microsoft.com/aspnet/core/fundamentals/dependency-injection

## Applying this to your project

Implement CRUD on the same entity as last lesson: a create DTO and an update DTO (no id, no rules yet, those come in lesson 6), `CreateAsync`, `UpdateAsync` and `DeleteAsync` on your service, the three actions on your controller, and a `.rest` file named after your resource. Follow the examples from this lesson, but remember: you have to be able to explain how it works! It's not enough to say 'it works, right?'

The `.rest` file is part of the project, so don't let it get messy. Give it a request for every endpoint, the failures included: the delete of an id that isn't there, the update of a missing one, the create with the body broken on purpose. It's how your teammates and your teacher try your API without your pages, and it keeps working as a check on every later lesson's changes. One file per resource.

The _shared entity_ of your case should get its writes too, as team work. Some cases let only the role change the shared thing. You can wait with implementing business logic like that. For now, it's ok if anyone can POST anything, and the API believes them.

You can keep improving your frontend and styling, and refining your backlog.