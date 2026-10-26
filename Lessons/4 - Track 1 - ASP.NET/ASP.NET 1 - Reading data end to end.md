# ASP.NET 1: Reading data end to end

In the React lessons you built a products page that fetched its data from a server. Except there was no server. You fetched from a `products.json` file sitting in the `public` folder, and I promised you would get to build the real thing later in the course. Well, here we are!

Today we build a real backend. By the end of this lesson you'll open a URL in your browser and see your own products come back as JSON. For that, we need an API, a database, Entity Framework, and the layers you'll use for every feature this semester. We won't work on creating, updating, or deleting yet. Just reading.

I think it's best to learn how to do things the right way, from the start. Our backend will be built as vertical slices from the first lesson: we start with a thin slice through every layer on one entity (Product), and each later lesson we'll extend that slice with a new capability or entity.

## What we are building

This is what we'll have created by the end of this lesson:

```
Catalog.Api/
  Controllers/
    ProductsController.cs
  Services/
    IProductService.cs
    ProductService.cs
  Repositories/
    IRepository.cs
    Repository.cs
  Data/
    AppDbContext.cs
    SeedData.cs
  Models/
    IEntity.cs
    Product.cs
  Dtos/
    ProductDtos.cs
  Program.cs
  appsettings.json
```

Every backend feature will be added somewhere in that tree. Reading a list of products needs almost all of it, so we have a lot to cover today. Once this skeleton stands, the later lessons mostly add methods to files that already exist.

## 1. Setting up the project

Open the terminal inside VSCode and check if the .NET SDK is installed:

```bash
dotnet --list-sdks
```

You want a line that starts with `10.`, something like `10.0.100 [C:\Program Files\dotnet\sdk]` (the path looks different on a Mac). If nothing prints, or every line starts lower, [follow the instructions here](../X%20-%20Extra/Setup%203%20-%20ASP.NET.md) before going on.

First, make sure your terminal is in the root of our project, the `infwad-project` folder that holds `ClientApp`:

```bash
cd infwad-project
```

Now create the backend project. We start from an empty web project with `dotnet new web`.

```bash
dotnet new web -n Catalog.Api
cd Catalog.Api
```

That gives us a tiny project with a one-line `Program.cs` that says hello. We will replace that shortly.

We need Entity Framework, and the SQLite provider, since SQLite is the database we're going to use. It's a whole database in a single file, with nothing to install or run separately.

```bash
dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 10.0.*
dotnet add package Microsoft.EntityFrameworkCore.Design --version 10.0.*
```

The `--version 10.0.*` pins the major version, just like `@7` did for React Router. Entity Framework gets a new major version every year, and without the pin a teammate who sets up a month after you can end up on a newer one than the rest of the team. The `*` still lets the bug-fix releases through.

And then we install the Entity Framework command-line tool, as well, globally, pinned the same way:

```bash
dotnet tool install --global dotnet-ef --version 10.0.*
```

(If it's already installed, dotnet will tell you. If it is an older version, `dotnet tool update --global dotnet-ef --version 10.0.*` brings it up to date.)

## 2. The first model and the database

Our data will live in a database, in tables and rows. Our code works with C# objects. Something has to translate between the two. You could write that translation yourself, in SQL, by hand, for every single query, but that's not what this course is about. So we're going to let Entity Framework do the hard work for us.

Entity Framework is an ORM, an object-relational mapper, and its whole job is that translation: we describe our data as plain C# classes, and Entity Framework works out the tables, writes the SQL, and hands us back objects.

### Models / Entities

We start with a class. One product.

> 🎓 Create `Models/Product.cs`:

```csharp
namespace Catalog.Api.Models;

public class Product : IEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
```

A simple class. An `Id`, a `Title`, a `Price`. This is what one row in the products table will look like.

It also says `: IEntity`. That's a reusable interface. Let's create it.

> 🎓 Create `Models/IEntity.cs`:

```csharp
namespace Catalog.Api.Models;

public interface IEntity
{
    int Id { get; }
}
```

Every entity we make will have an `Id`, and putting that in an interface lets us write code later that works on any entity by its id. You will see why that pays off when we get to the repository in a minute. For now: every model implements `IEntity`, and `IEntity` means "has an Id".

### DbContext

Next, the thing that represents the database itself. In Entity Framework that is a `DbContext`.

> 🎓 Create `Data/AppDbContext.cs`:

```csharp
using Catalog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
}
```

The `DbContext` is our session with the database. Each `DbSet` on it is one table: `Products` is the products table. When we ask `Products` for data, Entity Framework turns that into SQL and uses that on the real table.

The constructor takes its options (which database, which connection) from outside. We'll hand it those options in `Program.cs`, which we get to next. (You may see tutorials that configure the connection right inside the context, in a method called `OnConfiguring`, with the database path hardcoded there. That's a bad idea. Passing the options in from outside keeps it flexible.)

Let's write the configuration for it, in `appsettings.json`.

> 🎓 Open `appsettings.json` and rewrite it so it looks like this:

```json
{
  "ConnectionStrings": {
    "Default": "Data Source=catalog.db"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

`Data Source=catalog.db` just means "a SQLite file called `catalog.db`", in the project folder. It does not exist yet, but we'll create it in a moment.

The `Logging` section decides how much the app prints to its terminal while it runs. We'll come back to that in lesson 6, when those printed lines start telling us what went wrong.

Now `Program.cs`. This file is the start of the whole application: it wires everything together and starts the server. Open it, delete the hello-world line that `dotnet new web` put in there, and make it look like this. It will grow over the next few lessons, but here is the starting point:

> 🎓 Rewrite `Program.cs` so it looks like this:

```csharp
using Catalog.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

app.MapGet("/", () => "Catalog API is running");

app.Run();
```

It registers our `AppDbContext` and tells it to use SQLite with the connection string from `appsettings.json`. That's how we give our DbContext its options from outside.

The `MapGet` line is just a placeholder for now.

Let's check if it works!

> 🎓 Run (in your terminal):

```bash
dotnet run
```

Watch the output. It prints something like:

```
Now listening on: http://localhost:5088
```

(Your port number might be different. You can also find it in `Properties/launchSettings.json`.)

> 🎓 Open that address in your browser. You should see the line "Catalog API is running".

Woohoo! It's working!

Now stop it again with Ctrl+C, and let's give it a database.

### Migrations

Right now our C# knows there is a `Product` with an `Id`, a `Title` and a `Price`, but the database knows nothing about any of that. The database file doesn't even exist!

A **migration** is how we get from "the code describes this shape" to "the database has this shape". It's a generated set of instructions that creates or changes tables to match your models. You create a migration, then you apply it.

> 🎓 In the terminal, create the first migration:

```bash
dotnet ef migrations add InitialCreate
```

This looks at your `AppDbContext` and your `Product` class, sees that it needs a products table with three columns, and writes a migration file describing exactly that. It does not touch the database yet, it only writes the instructions.

> 🎓 Have a look in the new `Migrations` folder and read the file that it wrote. It is C#, not SQL yet: an `Up` method that creates the table, column by column, and a `Down` that removes it again. The SQL happens when the migration is applied, which is the next step.

> 🎓 Now apply it:

```bash
dotnet ef database update
```

This runs the migration against the database. The `catalog.db` file did not exist, so SQLite creates it, and the migration builds the products table inside it. You now have a real (but empty) products table. From now on, every time you change a model, you have to add another migration and update again, and the database will be updated. You never edit the database by hand.

> 🎓 Install a SQLite extension in your editor (VSCode), open `catalog.db` and take a look at the empty `Products` table.

## 3. Adding some data

An empty table might make Marie Kondo happy, but let's add some products to ours. Filling a database with starting data is called **seeding**.

We do it in code, so our starting data is always the same. Super handy when you're working with other people, like your teammates.

> 🎓 Create `Data/SeedData.cs`:

```csharp
using Catalog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (await context.Products.AnyAsync())
        {
            return;
        }

        context.Products.AddRange(
            new Product { Title = "Laptop", Price = 1200 },
            new Product { Title = "Phone", Price = 800 },
            new Product { Title = "Headphones", Price = 150 }
        );

        await context.SaveChangesAsync();
    }
}
```

The same products we had in our frontend, now going into the real database. The method checks if there are any products already, and if there are, it does nothing. We don't want to get a pile of duplicate laptops every time the server starts. If the table is empty, it adds them and saves. `SaveChangesAsync` is the moment it actually gets written.

As you can see it uses `DbContext` directly. This is the only place where we will do that, outside of one specific file (the repository, coming up next). But seeding only runs once when the app boots, before any request arrives, so it's ok. It sits outside the normal flow.

We call it from `Program.cs`, right after the app is built.

> 🎓 Update your `Program.cs` so it looks like this:

```csharp
using Catalog.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

await SeedData.InitializeAsync(app);

app.MapGet("/", () => "Catalog API is running");

app.Run();
```

> 🎓 Run the app once (`dotnet run`) to let the seeding happen, then stop it again. Your three products are in the database now. (Open `catalog.db` again in your editor's SQLite extension if you want to see them sitting in the table.)

> 🎓 One experiment before we move on. Open `SeedData.cs` and change the Laptop's price to 1300. Run the app, stop it, and look at the table again.

Still 1200. Your edit never got used: the `AnyAsync` check found three products and returned before the `AddRange`, exactly as it should. Seed data only gets used in an empty table. So, if you want to try your new seed data, the table has to be empty first. The blunt way is to throw the whole database away and let the migration build it again:

> 🎓 With the app stopped, drop the database:

```bash
dotnet ef database drop
```

It asks "are you sure?". Type `y`. Then rebuild it from the migration:

```bash
dotnet ef database update
```

> 🎓 Run the app once more and check the table: three products, and the Laptop costs 1300 now.

Your local `catalog.db` probably doesn't hold any important data, which is why resetting it is a normal move while a project's shape is still moving. You'll do it again in lessons 5 and 7, when the tables themselves change.

> 🎓 Now change the seed data again, so everyone starts next lesson from the same data. Put the price back to 1200, then drop, update, and run once more. Check the table: Laptop 1200, Phone 800, Headphones 150.

## 4. Reading the data, through the proper layers

Now the final part: an endpoint that returns those products. We _could_ do it in about three lines of code. Inject the `DbContext` straight into a controller, ask it for the products, send them back. Plenty of tutorials do exactly that, but it does not scale well.

At the beginning of this lesson, I said: It's best to learn how to do things the right way from the start.

As soon as an app grows, mixing "handle the web request", "do the actual work", and "talk to the database" into one place turns into code that's hard to change and hard to test. So we keep them in separate layers from the very first feature, even though for reading a list of products it looks like overkill. A few features later, you'll be glad you did it right.

This is how we do it: requests will take this path, always in one direction:

```
Controller  ->  Service  ->  Repository  ->  DbContext  ->  database
(the web)       (the work)   (data access)   (EF)
```

- The controller deals with the web and nothing else.
- It hands things off to a service, which does the actual work.
- The service asks a repository for data.
- The repository is the one place that talks to the `DbContext`.

Each layer only knows about the one below it.

Let's build them bottom to top, so each piece will be done before the thing that uses it. We already have the database and DbContext.

### Repository

```
                                 ↓
Controller  ->  Service  ->  Repository  ->  DbContext  ->  database
(the web)       (the work)   (data access)   (EF)

```

The repository is the data-access layer. One generic repository works for every entity we will ever add, which is why we made that `IEntity` interface earlier.

We will create an interface for the repository first, to define its shape.

> 🎓 Create `Repositories/IRepository.cs`:

```csharp
using Catalog.Api.Models;

namespace Catalog.Api.Repositories;

public interface IRepository<T> where T : class, IEntity
{
    Task<List<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);

    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);

    Task<int> SaveChangesAsync();
}
```

`IRepository<T>` works for any type `T` that is an entity. It can:

- get all of them
- get one by its id
- add
- update
- delete

We only build _reading data_ in this lesson, so the two methods we use are `GetAllAsync` and `GetByIdAsync`. The other four, `Add`, `Update`, `Delete` and `SaveChangesAsync`, are part of the repository too, we just won't need them until next lesson, when we start creating and deleting. Defining them now means the repository is ready for that from the start, and it makes it clear to you what the thing is for.

Now the implementation.

> 🎓 Create `Repositories/Repository.cs`:

```csharp
using Catalog.Api.Data;
using Catalog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Repositories;

public class Repository<T> : IRepository<T> where T : class, IEntity
{
    private readonly AppDbContext _context;

    public Repository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<T>> GetAllAsync()
        => await _context.Set<T>().ToListAsync();

    public async Task<T?> GetByIdAsync(int id)
        => await _context.Set<T>().FirstOrDefaultAsync(e => e.Id == id);

    public void Add(T entity) => _context.Set<T>().Add(entity);
    public void Update(T entity) => _context.Set<T>().Update(entity);
    public void Delete(T entity) => _context.Set<T>().Remove(entity);

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();
}
```

Let's go over it.

- `_context.Set<T>()` is Entity Framework's way of saying "the table for type `T`". (For `Product`, that is the products table.)

- `GetAllAsync` reads the whole table into a list.

- `GetByIdAsync` finds the one row whose `Id` matches, or gives back `null` if there is none.

Notice everything is `async` and `await`. Talking to a database is slow (it might be on another machine), and just like `fetch` on the frontend, we do not want to freeze everything while we wait. Same idea, but now on the server. The return types say it too: `Task<List<Product>>` is C#'s `Promise<Product[]>`, a list that isn't there yet, and `await` is how you wait for it. That same `Task` sits in every signature from here up to the controller, for the same reason.

### DTOs

Let's do the next layer.

Above the repository sits the service. But before we write it, we'll add one more thing. Just like we did in the frontend's `ProductResponse`, we want something that can handle translations between how things are named in the backend, and what we send back out over the network. Our new service will not hand `Product` objects back, it hands back a `ProductDto`.

A DTO, a data transfer object, is a shape made specifically for crossing the boundary between your API and whoever is calling it.

> 🎓 Create `Dtos/ProductDtos.cs`:

```csharp
namespace Catalog.Api.Dtos;

public record ProductDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}
```

Right now it looks identical to `Product` (that we made at the beginning of this lesson), which makes the whole thing seem pretty pointless. Fair point.

But hear me out. `ProductDto` has a different job. `Product` is the database's shape: it is what gets stored. Later on it will also hold things the outside world doesn't need to see, and a product in the database might have links to other tables that would drag half the database along if you send it out in that shape. `ProductDto` is the shape you choose to _expose_.

Keeping these things separate means you can change your database without changing your API, and change your API without changing your database. Very useful, so we make it possible right now, to save ourselves a lot of work later.

So the service reads `Product` objects from the repository and maps them into `ProductDto` objects.

### Service

Now we can create the service that does the work.

```
                   ↓
Controller  ->  Service  ->  Repository  ->  DbContext  ->  database
(the web)       (the work)   (data access)   (EF)

```

> 🎓 Create an interface for it, `Services/IProductService.cs`:

```csharp
using Catalog.Api.Dtos;

namespace Catalog.Api.Services;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(int id);
}
```

> 🎓 Create the implementation, `Services/ProductService.cs`:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Models;
using Catalog.Api.Repositories;

namespace Catalog.Api.Services;

public class ProductService : IProductService
{
    private readonly IRepository<Product> _products;

    public ProductService(IRepository<Product> products)
    {
        _products = products;
    }

    public async Task<List<ProductDto>> GetAllAsync()
    {
        var products = await _products.GetAllAsync();
        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var product = await _products.GetByIdAsync(id);
        return product is null ? null : ToDto(product);
    }

    private static ProductDto ToDto(Product product) => new()
    {
        Id = product.Id,
        Title = product.Title,
        Price = product.Price
    };
}
```

Let's go over it:

- `GetAllAsync()`: Asks the repository for every `Product`, then uses `.Select(ToDto)` to turn each one into a `ProductDto`, and `.ToList()` to collect them back into a list.

- `GetByIdAsync(int id)`: Gets a single product by id, or returns null (to the controller, which can then decide what to do with that).

Notice the service takes an `IRepository<Product>` in its constructor, not a `Repository<Product>`. It asks for the interface, the capability, and does not care how it is built. We will talk about that and connect the pieces when we change `Program.cs` later today.

### Controller

We've reached the top of the stack, the controller. The layer that speaks HTTP.

```
    ↓
Controller  ->  Service  ->  Repository  ->  DbContext  ->  database
(the web)       (the work)   (data access)   (EF)

```

> 🎓 Create `Controllers/ProductsController.cs`:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _products;

    public ProductsController(IProductService products)
    {
        _products = products;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetAll()
        => Ok(await _products.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _products.GetByIdAsync(id);
        return product is null ? NotFound() : Ok(product);
    }
}
```

Again, a few things to explain:

- `[ApiController]` marks this as a web API controller and switches on some helpful behaviour. You will see some of that in the next lesson, when data comes in, and also in lesson six, where it rejects bad input before your code ever sees it.

- `[Route("api/[controller]")]` sets the address: here, `[controller]` will become the controller's name without the word "Controller", so `ProductsController` will be connected to `api/products`.

- The `[HttpGet]` method with no extra path handles `GET api/products` and returns the whole list.

- The `[HttpGet("{id:int}")]` method handles `GET api/products/5`, pulls the `5` out of the URL as `id`, and asks the service for it.

  And here you see what happens to that `null` from the service's `GetByIdAsync(int id)`: if the service found nothing, the controller answers `404 Not Found`, the standard HTTP way of saying "no such thing here". If it found the product, it answers `200 OK` with the product. `Ok(...)` and `NotFound()` are nice ways to set those status codes.

  Notice that the controller does no real work of its own: it just calls the service, and turns the result into an HTTP response. _That is all a controller should do_.

### Dependency injection in Program.cs

Last step: tell the application about all of this. We do that with three registrations, and two lines to turn the controllers on.

> 🎓 Change `Program.cs` into this:

```csharp
using Catalog.Api.Data;
using Catalog.Api.Repositories;
using Catalog.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddControllers();

var app = builder.Build();

await SeedData.InitializeAsync(app);

app.MapControllers();

app.Run();
```

About the new stuff:

- `builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>))` says: whenever something asks for an `IRepository<Something>`, give it a `Repository<Something>`. That one line works for `Product` and every entity we add later.
- `builder.Services.AddScoped<IProductService, ProductService>()` does the same for the service: ask for `IProductService`, get a `ProductService`.

This is **dependency injection**. No class builds its own dependencies, it just asks for what it needs in its constructor and the framework hands it over, already built. It is why the service can just ask for `IRepository<Product>` and the controller for `IProductService`, and they didn't have to write `new` anywhere. (`Scoped` means one instance per web request. There are other options. In the next lesson we look at all three.)

- `builder.Services.AddControllers` and `app.MapControllers()` are the two lines that find our controller and hook its methods up to their URLs. This replaces the `app.MapGet("/", () => "Catalog API is running");` placeholder we had before.

That is the whole vertical slice.

> 🎓 We're done! Let's run it!

```bash
dotnet run
```

Watch for the listening line again and open that address in your browser, but add `/api/products` to the end:

> 🎓 Open (your port number could be different):

```
http://localhost:5088/api/products
```

And there they are. Your three products, as JSON, straight out of the database:

```json
[
  { "id": 1, "title": "Laptop", "price": 1200 },
  { "id": 2, "title": "Phone", "price": 800 },
  { "id": 3, "title": "Headphones", "price": 150 }
]
```

Isn't that cool? A real working backend and database, a vertical slice with the proper architecture to build upon, in one lesson.

One small thing to notice in that JSON. In C# the properties are `Id`, `Title` and `Price`, with capitals, and they came out as `id`, `title` and `price`. ASP.NET writes JSON in the JavaScript convention, camelCase, without being asked, and also reads it back the same way. So the keys already match what the React app expects.

Let's not forget to try the other things we made:

> 🎓 Try to get a single product with: `http://localhost:5088/api/products/1`, and you get just the laptop.
>
> Ask for one that is not there, `http://localhost:5088/api/products/999`, and you get an empty response with a 404 status instead of a crash.
>
> (The bare address, without `/api/products`, also gives a 404 now, and that's fine. There is nothing to be seen at the root of our server. Our products live under `/api/products`.)

### What just happened?

Take a moment to think about what just happened. Your browser asked for a URL. The controller took the request and called the service. The service asked the repository. The repository asked Entity Framework, which turned it into SQL, ran it against SQLite, and got rows back. Those rows became `Product` objects, the service mapped them into `ProductDto` objects, and the controller sent them back as JSON, which is what landed in your browser. Every layer did its one job. I love it when a plan comes together! (No cigar emoji. I don't endorse smoking.)

## Where this goes next

You can now read a list, or read one item. That's only half of what we want from our API. The other half is changing things: adding a product, deleting one, editing one. Next lesson we work on all three. We start with creating and deleting, which means sending data to the server instead of only asking for it. We'll need a new kind of DTO for the incoming data. Then we finish full CRUD (Create, Read, Update, and Delete) by adding editing, and with the API complete, we look more closely at the architecture itself: why we split everything into a controller, a service, and a repository.

## Resources

- Microsoft's EF Core docs, "Getting Started". The official walk-through of a context, a model, and a first migration. https://learn.microsoft.com/ef/core/get-started/overview/first-app
- Microsoft's docs on migrations. What `migrations add` and `database update` actually do, and how to undo one. https://learn.microsoft.com/ef/core/managing-schemas/migrations/
- Microsoft's tutorial on controller-based Web APIs, if you want the framework's own version of the controller part. https://learn.microsoft.com/aspnet/core/tutorials/first-web-api

## Applying this to your project

Set up your backend once, with the whole team. One person creates the backend project, in a folder next to `ClientApp`, named after your case (`GameShelf.Api`, `BlokD.Api`, `Zetsel.Api` or `Hollowmere.Api` instead of `Catalog.Api`), adds the two packages and the tool, and builds the skeleton from section 1 up to the repository: `Program.cs`, `appsettings.json`, `AppDbContext`, `IEntity`, `IRepository` and `Repository`, and the registrations. Commit, everybody pulls.

The _shared thing_ for your case is also team work. Every case has one entity that every module points at (the catalogue, the machines, the beans, the bestiary). Build its _read_ slice together: the model, its own `DbSet` inside `AppDbContext`, a seed block, the DTO, the service, the controller, one line of DI.

Now you can work on your own module. Take the entity your list page has been showing since React lesson 2 and give it the same slice: a model class that implements `IEntity`, a `DbSet` in `AppDbContext`, a block in `SeedData.cs`, a response DTO, a service with `GetAllAsync` and `GetByIdAsync`, a controller with the two GETs, and a registration in `Program.cs`. Reads only. If that entity can't exist without pointing at something else (a loan is nothing without the thing being lent), start with the one in your module that stands on its own, and wait until we get to relationships in lesson 5. The seed rows can come from the JSON mock you made in the React lessons. Move them over (minus the fields that point at other things). Then test your own `/api/...` in the browser.

You can keep improving your frontend and styling, and refining your backlog.

### Tip for when multiple people change the database at once

Two shared files get touched by everyone in the team: `AppDbContext` and `SeedData.cs`. Add your own lines, commit small, merge the same day. The migrations are the bigger hazard, because every new entity is a migration, and Entity Framework keeps one snapshot file for all of them. When two of you add one on the same day and git complains about `AppDbContextModelSnapshot.cs`, don't hand-edit it. Merge the code, but delete the whole `Migrations` folder, and do section 3's reset (see above in this lesson) with one step added in the middle: drop, add one fresh `InitialCreate` from the merged model, update, run. Do it together, once. Everything in your database comes back from the seeder, which is what makes that safe, and it stays safe for as long as the project has no real data that you want to keep.