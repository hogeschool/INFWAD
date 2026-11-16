# ASP.NET 5: A second entity and relationships

Everything so far has been one entity, on its own. A product just has a title, a price, and an id. Real data is not like that. A product belongs to a category, an order has line items, a captain's mission carries a stack of log entries. Things point at other things.

Today we add a second entity, `Category`, and connect it to `Product`. One category has many products, each product belongs to one category. That's a one-to-many relationship, the most common kind you'll meet. By the end, a product you fetch will come back with its category attached.

## What changes this lesson

Two things are different from the last few lessons.

First, we add a whole new entity, so it gets its own slice through every layer, the same way `Product` did in lesson one: a model, a DTO, a service, a controller.

Second, we'll update the repository, but not specifically for `Product`, because our generic repository already handles any entity. It doesn't have the ability to load related data yet, though, so we will add that. Then, a product can come back with its category.

```
infwad-project/
  Catalog.Api/
    Models/
      Product.cs               (gains a category link)
      Category.cs              (new)
    Data/
      AppDbContext.cs          (add the Categories table)
      SeedData.cs              (categories, and every product gets one)
    Dtos/
      ProductDtos.cs           (the response carries a category)
      CategoryDtos.cs          (new)
    Repositories/
      IRepository.cs           (the reads can load related data)
      Repository.cs            (the reads can load related data)
    Services/
      ProductService.cs        (load the category, map it)
      ICategoryService.cs      (new)
      CategoryService.cs       (new)
    Controllers/
      CategoriesController.cs   (new)
    Program.cs                 (register the category service)
    products.rest             (create and update now send a category)
    categories.rest           (new)
  ClientApp/
    src/
      types/
        Category.ts           (new)
        Product.ts            (gains a category)
      api/
        products.ts           (a product now carries a category)
        categories.ts          (new, and you write it)
      features/products/
        ProductForm.tsx        (gains a category dropdown)
        ProductsPage.tsx       (hands the form's data straight through)
        ProductDetailPage.tsx  (shows the category)
```

`IProductService` and `ProductsController` don't have to change at all this lesson. The controller is thin enough that it can handle adding a new relationship.

We do have to change the shape of the database, so there's a migration. We'll throw the database away and build it again. More on that when we get there.

## 1. A second model: Category

### The Category class

Same idea as `Product`. A plain class, an `Id`, a `Name`, and it implements `IEntity` like every entity does.

> 🎓 Create `Catalog.Api/Models/Category.cs`:

```csharp
namespace Catalog.Api.Models;

public class Category : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Product> Products { get; set; } = [];
}
```

The one new part is that last line. A category has many products, so it gets a `List<Product>`. This is a _navigation property_: a way to get from a category to its products as objects, in code, without writing any SQL. It isn't a column in the categories table. It's something Entity Framework fills in for you when you ask for it.

### Linking Product to Category

The other half of the relationship lives on `Product`. Each product belongs to one category, so a product needs to know which one.

> 🎓 Add two properties to `Models/Product.cs`, so it looks like this:

```csharp
namespace Catalog.Api.Models;

public class Product : IEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
```

`CategoryId` is the foreign key: an `int` that holds the id of the category this product belongs to. That's the thing that actually gets stored in the products table, in a new column. `Category` is a navigation property again, the other direction of the one on `Category`: from a product, get its category as an object.

So a product has both. The id is what gets stored, the object is what you read the category's name from.

The `= null!` on the end tells the compiler "trust me, this will be filled in". It has to be there because a product always has a category, so the property should not be nullable, but we don't set it when we build a `Product` in code. Entity Framework sets it when it loads the product with its category. The `null!` is us promising that will happen.

### Adding the new table

The `DbContext` needs to know about the new table.

> 🎓 Add a `Categories` set to `Data/AppDbContext.cs`:

```csharp
using Catalog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
}
```

That's everything the relationship needs. Entity Framework takes care of the rest, from the property names. A `Category` property plus a matching `CategoryId` on `Product`, and a `List<Product>` on `Category`, is the shape it recognises as one-to-many. There's no configuration to write for this relationship.

Here's what it will look like in the database:

```
Category                    Product
--------                    -------
Id  Name                    Id  Title       Price   CategoryId
1   Computers               1   Laptop      1200    1
2   Audio                   2   Monitor      300    1
3   Mobile                  3   Headphones   150    2
                            4   Speakers     200    2
                            5   Phone        800    3
                            6   Tablet       450    3
```

The `CategoryId` column on the right is the relationship. Product 1 (Laptop) has `CategoryId` 1, so it belongs to Computers. Two products can share a category, which is what makes it one-to-many: one category, many products pointing back at it.

As you can see, the navigation properties are not here. That's added by Entity Framework, on top of what's stored in the database.

## 2. Migrating and resetting

### The migration

We've described a new table and a new column on the products table, but we still have to tell the database about it. That means we need a migration.

> 🎓 Create the migration:

```bash
dotnet ef migrations add AddCategory
```

> 🎓 Open the new file in `Migrations` and read it. You'll see it create a `Categories` table, add a `CategoryId` column to `Products`, and set up a foreign key between them. That's the relationship, written out as the database understands it.

### Resetting the database

There's a problem, though. We made `CategoryId` a required column, because every product belongs to a category. But the database already has products in it, from the last few lessons, and those products have no category. (Look at the migration again: the `AddColumn` for `CategoryId` has a `defaultValue: 0`, which is how Entity Framework gets past that. But there is no category `0`, so those products would point at nothing.)

Why not just make the column nullable? We could. But nullable would mean that we would be ok with products that have no category, and that's not true. A product without a category is a hole in the data, not a valid state. So we keep the column required, and reset the database once.

When we do this, we throw the database away and let the migrations build it again, empty, with the new shape. Then the seeding fills it up again, this time with categories (so yes, we have to update the seed data now!). You'd never do this to a real database with real data in it. There the migration itself has to solve this, and fill in the new column, with a default value or a step that fills it in from somewhere. We never need that in this course, but you should know about that scenario. Your local `catalog.db` probably doesn't hold any important data, so resetting it is fine, and you'll do it often while your project's data model is still changing.

This is also why it's a good idea to create good seed data, by the way, because you will be losing anything you've added by hand.

> 🎓 Drop the database, then rebuild it from the migrations:

```bash
dotnet ef database drop
```

It asks "are you sure?". Type `y`. Then:

```bash
dotnet ef database update
```

Now the database is empty but has the right shape: a products table with a `CategoryId` column, a categories table, and the foreign key between them.

Don't run the app yet, though, because when you run the backend, it will see that the database is empty, and fill it with the seed. But we still need to rewrite the seed.

### Seeding categories and their products

The old seed made three products with no category. That isn't allowed anymore. So first we make the categories, then we hand each product one.

> 🎓 Rewrite `Catalog.Api/Data/SeedData.cs`:

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

        var computers = new Category { Name = "Computers" };
        var audio = new Category { Name = "Audio" };
        var mobile = new Category { Name = "Mobile" };

        context.Products.AddRange(
            new Product { Title = "Laptop", Price = 1200, Category = computers },
            new Product { Title = "Monitor", Price = 300, Category = computers },
            new Product { Title = "Headphones", Price = 150, Category = audio },
            new Product { Title = "Speakers", Price = 200, Category = audio },
            new Product { Title = "Phone", Price = 800, Category = mobile },
            new Product { Title = "Tablet", Price = 450, Category = mobile }
        );

        await context.SaveChangesAsync();
    }
}
```

Look at what we assign to each product: `Category = computers`, the category object, not a `CategoryId`. When `SaveChangesAsync` runs, Entity Framework sees three new categories hanging off these products, inserts the categories first, gets their ids back from the database, and fills in each product's `CategoryId` for us. That's what an ORM is for. It handles all the foreign-key bookkeeping!

I also gave each category two products instead of one, so there's something to see when the app groups them later. Six products across three categories. For your project, you really need to add a lot more! Realistic-ish data (so not `Test 1`, `Test 2`, etc) is needed so you see how your app (and your UI!) behaves with realistic data. This is also part of the learning goals, by the way, so get in the habit now.

> 🎓 Run the app once to seed, then stop it:

```bash
dotnet run
```

> 🎓 Open `catalog.db` in your SQLite viewer. You now have a `Categories` table with three rows, and every product in `Products` has a `CategoryId`.

But if you send `GET api/products` right now, in the browser or your `.rest` file, the categories are nowhere in the response. Just the same id, title, and price as before. The data is there, sitting in the database, and the API isn't showing it. That's the next job.

## 3. Showing the category: loading related data

Two things are missing.

The first is that nobody is loading the category. When the repository fetches a product, it fetches the product row and stops. It doesn't load the related category unless we tell it to, so `product.Category` comes back empty.

The second is that even if it were loaded, the response has nowhere to put it. `ProductDto`, the shape we send back, has an id, a title, and a price. No category.

Fix the repository first, then the DTO, then wire them together in the service.

### Teaching the repository to load relations

Loading related data has a name in Entity Framework: an _include_. You tell the query to include a related property, and it pulls that in alongside the main row, in one database trip.

Our generic repository doesn't offer that yet. The trick is to let each read method take a list of properties to include.

> 🎓 Update `Catalog.Api/Repositories/IRepository.cs`:

```csharp
using System.Linq.Expressions;
using Catalog.Api.Models;

namespace Catalog.Api.Repositories;

public interface IRepository<T> where T : class, IEntity
{
    Task<List<T>> GetAllAsync(params Expression<Func<T, object>>[] includes);
    Task<T?> GetByIdAsync(int id, params Expression<Func<T, object>>[] includes);
    Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate,
        params Expression<Func<T, object>>[] includes);

    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);

    Task<int> SaveChangesAsync();
}
```

The scary-looking part is `params Expression<Func<T, object>>[] includes`.

Let's explain it:

`Expression<Func<T, object>>` is a fancy way to say "a little function that points at a property". You'll pass it something like `p => p.Category`.

`params` in front means you can pass zero, one, or several of them. So every call we already wrote, like `GetAllAsync()` and `GetByIdAsync(id)`, still works as before. When you want related data, you add it: `GetByIdAsync(id, p => p.Category)`. And you can pass more than one: `GetAllAsync(p => p.Category, p => p.Supplier)`.

All three reads take the same `includes` now, `FindAsync` too, so a filtered read can load related data as well.

Now the implementation.

> 🎓 Update `Repositories/Repository.cs`:

```csharp
using System.Linq.Expressions;
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

    public async Task<List<T>> GetAllAsync(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _context.Set<T>();
        foreach (var include in includes)
            query = query.Include(include);
        return await query.ToListAsync();
    }

    public async Task<T?> GetByIdAsync(int id, params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _context.Set<T>();
        foreach (var include in includes)
            query = query.Include(include);
        return await query.FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate,
        params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _context.Set<T>().Where(predicate);
        foreach (var include in includes)
            query = query.Include(include);
        return await query.ToListAsync();
    }

    public void Add(T entity) => _context.Set<T>().Add(entity);
    public void Update(T entity) => _context.Set<T>().Update(entity);
    public void Delete(T entity) => _context.Set<T>().Remove(entity);

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();
}
```

All three reads now do the same thing before running: start a query on the table, then loop over the includes and add each one with `.Include(...)`.

 `.Include(include)` tells Entity Framework to load that related property too. With no includes, it's the same query as before.

### A DTO for the category

Now the response needs room for a category. But not the whole `Category` entity, with its `List<Product>` on it. Remember why we have DTOs? A product points at a category, the category points back at all its products, and each of those points at the category again. If we serialise this entity, it will go round in circles forever.

So we make a `CategoryDto` with an id and a name and nothing else. No list of products, no more endless loop.

> 🎓 Create `Dtos/CategoryDtos.cs`:

```csharp
namespace Catalog.Api.Dtos;

public record CategoryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}
```

Then give `ProductDto` a category, and update the incoming DTOs while we're here, because creating a product now also needs the category.

> 🎓 Update `Dtos/ProductDtos.cs`:

```csharp
namespace Catalog.Api.Dtos;

public record ProductDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public CategoryDto Category { get; init; } = null!;
}

public record CreateProductDto
{
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public int CategoryId { get; init; }
}

public record UpdateProductDto
{
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public int CategoryId { get; init; }
}
```

Look at the difference between what goes out and what comes in. The response (`ProductDto`) carries a nested `CategoryDto`: id and name, the stuff a page wants to show. The create and update DTOs take a plain `CategoryId`. When the frontend creates a product, it doesn't send a category object, it says "put this in category 2". This is why we keep the incoming and outgoing shapes separate.

### Loading and mapping in the service

Last piece. The service has to ask the repository for the category (pass the include), and map it into the DTO.

> 🎓 Update `Services/ProductService.cs`. Here's the whole file:

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

    public async Task<List<ProductDto>> GetAllAsync(string? search = null)
    {
        var products = string.IsNullOrWhiteSpace(search)
            ? await _products.GetAllAsync(p => p.Category)
            : await _products.FindAsync(
                p => p.Title.ToLower().Contains(search.ToLower()), p => p.Category);

        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var product = await _products.GetByIdAsync(id, p => p.Category);
        return product is null ? null : ToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Title = dto.Title,
            Price = dto.Price,
            CategoryId = dto.CategoryId
        };

        _products.Add(product);
        await _products.SaveChangesAsync();

        var created = await _products.GetByIdAsync(product.Id, p => p.Category);
        return ToDto(created!);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _products.GetByIdAsync(id);
        if (product is null) return null;

        product.Title = dto.Title;
        product.Price = dto.Price;
        product.CategoryId = dto.CategoryId;
        await _products.SaveChangesAsync();

        var updated = await _products.GetByIdAsync(id, p => p.Category);
        return ToDto(updated!);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await _products.GetByIdAsync(id);
        if (product is null) return false;

        _products.Delete(product);
        await _products.SaveChangesAsync();

        return true;
    }

    private static ProductDto ToDto(Product product) => new()
    {
        Id = product.Id,
        Title = product.Title,
        Price = product.Price,
        Category = new CategoryDto
        {
            Id = product.Category.Id,
            Name = product.Category.Name
        }
    };
}
```

Let's go over it:

- The reads are the simple case. `GetAllAsync` and `GetByIdAsync` now pass `p => p.Category`, so the product comes back with its category loaded.
- `CreateAsync` and `UpdateAsync` needed an update too. When you make a `Product` and set `CategoryId = 2`, you've set the number, but the `Category` object isn't loaded. So right after saving, `product.Category` is still empty, and mapping it would fail. The fix is to load it back with `GetByIdAsync(product.Id, p => p.Category)`, and that's what we map and return. It's one extra database read. (There are ways to avoid it. We'll look at that in the next lesson.)
- The `created!` and `updated!`: `GetByIdAsync` returns a nullable, but we just created or updated this one, so it's certainly there. The `!` tells the compiler that.
- `ToDto` maps the category across. If you forget an include, `product.Category` is `null`, and `ToDto` fails on `product.Category.Name`. That's not a mystery bug, it's the include doing its job: no include, no category, and the mapping tells you so immediately.

> 🎓 Run the app and send `GET api/products` from your `.rest` file.

Now each product comes back with its category nested inside it. The first two, the other four follow the same shape:

```json
[
  {
    "id": 1,
    "title": "Laptop",
    "price": 1200,
    "category": { "id": 1, "name": "Computers" }
  },
  {
    "id": 2,
    "title": "Monitor",
    "price": 300,
    "category": { "id": 1, "name": "Computers" }
  }
]
```

Look at that! Related data, loaded through the repository, mapped through a DTO, and no sign of infinite loops in the JSON.

> 🎓 Send your search request too, `GET api/products?search=lap`. One product comes back, the Laptop, and it carries its category now, just like the full list does.

### When the create needs a category

The product endpoints now expect a `CategoryId` on the way in. Our create and update requests don't send one yet, so let's fix them.

> 🎓 In `products.rest`, replace the create request so it sends a category:

```http
### Create a product
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "title": "Webcam",
  "price": 60,
  "categoryId": 1
}
```

> 🎓 Send it. Back comes a `201`, and the created product with its category nested, id and all. Send "Get all products" again and the Webcam is in the list, in Computers.

> 🎓 And fix the update request the same way, because `UpdateProductDto` carries a `CategoryId` now as well:

```http
### Update a product
PUT {{baseUrl}}/api/products/1
Content-Type: application/json

{
  "title": "Fancy Laptop",
  "price": 2500,
  "categoryId": 1
}
```

> 🎓 Send it. A `200`, and the Fancy Laptop comes back with its category nested.

Now let's try something.

> 🎓 Send a create with a category that doesn't exist, `categoryId` of `999`:

```http
### Create a product in a category that does not exist
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "title": "Ghost",
  "price": 10,
  "categoryId": 999
}
```

You don't get a clear "no such category". You get a `500` with a stack trace in it. The database has a foreign key rule that says a product's `CategoryId` must match a real category, so it refuses the row, and because we wrote nothing to catch that, it comes out as an ugly `500`. We'll fix that next lesson. Right now, the API is still trusting all its input.

## 4. A home for categories

Now we have everything we need to get a product's category in the frontend. But we haven't added a way to get a _list_ of all categories yet.

So let's work on the vertical slice for `Category`. We only need to _read_ categories for now, so it's a smaller slice: get all, get one.

Our generic repository can already handle any `IEntity`, so we only have to work on the service and the controller. See if you can build this yourself:

- `Catalog.Api/Services/ICategoryService.cs`: an interface with `GetAllAsync` returning `Task<List<CategoryDto>>` and `GetByIdAsync(int id)` returning `Task<CategoryDto?>`. The read half of `IProductService`, with the word swapped.
- `Services/CategoryService.cs`: implements it, holds an `IRepository<Category>` from its constructor, and has a private `ToDto` that copies the id and the name. One thing to decide before you type: does either read need an include?
- `Controllers/CategoriesController.cs`: `[ApiController]`, `[Route("api/[controller]")]`, a `GetAll` on `[HttpGet]` and a `GetById` on `[HttpGet("{id:int}")]` that answers `404` when the service hands back null. `ProductsController`'s read half, again with the word swapped.
- One registration in `Program.cs`, next to the product service's.

> 🎓 Write the three files and the registration. Keep the product files open beside them and use them as your example. Run `dotnet build` until it's clean, then compare with mine (below).

### The service

The interface:

```csharp
using Catalog.Api.Dtos;

namespace Catalog.Api.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto?> GetByIdAsync(int id);
}
```

The service:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Models;
using Catalog.Api.Repositories;

namespace Catalog.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly IRepository<Category> _categories;

    public CategoryService(IRepository<Category> categories)
    {
        _categories = categories;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _categories.GetAllAsync();
        return categories.Select(ToDto).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _categories.GetByIdAsync(id);
        return category is null ? null : ToDto(category);
    }

    private static CategoryDto ToDto(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name
    };
}
```

The same shape as `ProductService`'s read side. And the answer to the include question: no include. `CategoryDto` is just an id and a name, and both are on the category row itself. You add an include only when the DTO needs something from another table.

### The controller

The controller:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categories;

    public CategoriesController(ICategoryService categories)
    {
        _categories = categories;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
        => Ok(await _categories.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var category = await _categories.GetByIdAsync(id);
        return category is null ? NotFound() : Ok(category);
    }
}
```

Nothing new here. Yours may differ in the small things (an `if` instead of the `?:`) as long as the status codes match. `CategoriesController` sits at `api/categories`.

### One line of wiring

The controller asks for an `ICategoryService`, so the application has to know which class to hand over. That's one registration, next to the product service's in `Program.cs`:

```csharp
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
```

### Testing the categories

Categories are a new resource, and a new resource gets a `.rest` file of its own.

> 🎓 Create `categories.rest` next to `products.rest` in `Catalog.Api`:

```http
@baseUrl = http://localhost:5088

### Get all categories
GET {{baseUrl}}/api/categories

### Get one category
GET {{baseUrl}}/api/categories/1
```

> 🎓 Run the app and send "Get all categories". The three categories come back:

```json
[
  { "id": 1, "name": "Computers" },
  { "id": 2, "name": "Audio" },
  { "id": 3, "name": "Mobile" }
]
```

Notice what is _not_ there: no products. `CategoryDto` has no products list, on purpose. A product nests its one category, because it's small and useful to show. A category doesn't nest its many products, because that's far too much data every time you list categories. If you want a category's products, ask the products endpoint with a filter.

That filter doesn't exist yet: `?categoryId=2` would be one more branch in `GetAllAsync` with a different `Where`, the same as search. A good one to try on your own!

## 5. The category in the frontend

The backend part is done. Now the frontend. The form needs a category dropdown, and for that it needs to fetch categories and know what a category is.

### The types

The frontend's `Product` type needs a category, and there's no `Category` type yet.

> 🎓 Create `ClientApp/src/types/Category.ts`:

```ts
export type Category = {
  id: number;
  name: string;
};
```

> 🎓 And add it to `types/Product.ts`:

```ts
import type { Category } from "./Category";

export type Product = {
  id: number;
  name: string;
  price: number;
  category: Category;
};
```

Note: right now, the frontend won't compile. That's TypeScript doing its job. We changed the type that several other files rely on, and every red squiggle points at a file that still uses the old shape. Work through them, and when the errors run out, you're done.

(Stop and think about this for a moment. If we didn't have types, this would be much harder! This is what makes a typed refactor simple instead of terrifying: change the type, follow the errors, done.)

### The api module carries a category

The products api module translates between the server's shape and the app's shape, in both directions, and both directions now have a category to carry.

> 🎓 In `api/products.ts`, add the category to `ProductResponse` and to `toProduct`, and to the write shape and its mapper:

```ts
type ProductResponse = {
  id: number;
  title: string;
  price: number;
  category: { id: number; name: string };
};
```

```ts
function toProduct(raw: ProductResponse): Product {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
    category: raw.category,
  };
}
```

```ts
export type ProductData = {
  name: string;
  price: number;
  categoryId: number;
};
```

```ts
function toRequestBody(data: ProductData) {
  return {
    title: data.name,
    price: data.price,
    categoryId: data.categoryId,
  };
}
```

About the new stuff:

- `ProductResponse` gains the category the server sends.
- `toProduct` copies it straight across, because the `Category` type and the server's nested shape are identical, so there's nothing to rename.
- `ProductData`, the shape of a write, gains a `categoryId`, the plain number, because that's what `CreateProductDto` on the backend wants.

The five request functions don't change, because everything already goes out through `toRequestBody` and comes in through `toProduct`.

### Your turn: the categories module

The form needs a list of categories for its dropdown, and the backend has `GET api/categories` now. So we need a second api module, `api/categories.ts`.

> 🎓 Write `api/categories.ts` yourself: one exported `getAll` returning `Promise<Category[]>`, using `baseUrl` and `errorFromResponse` from `./http`. Before you start, look at `CategoryDto` on the backend and at your `Category` type, and decide whether this module needs a mapper at all.
>
> <details>
> <summary>👀 After you're done, click here to see the answer.</summary>
>
> ```ts
> import type { Category } from "../types/Category";
> import { baseUrl, errorFromResponse } from "./http";
>
> export async function getAll(): Promise<Category[]> {
>   const response = await fetch(`${baseUrl}/api/categories`);
>   if (!response.ok) {
>     throw await errorFromResponse(response);
>   }
>   return response.json();
> }
> ```
> 
> No mapper. `CategoryDto` is just an id and a name, our `Category` type on the frontend is the same, so right now there's nothing to translate. In this case, we'll skip the mapper, and we can always add it when the frontend and backend have a different shape for Category.
> 
> </details>



### The form gets a dropdown

Now the form gets a category selector, and its contract with the page changes: instead of loose arguments, it hands up one `ProductData`, the shape the api module wants.

> 🎓 Rewrite `features/products/ProductForm.tsx`:

```tsx
import { useState } from "react";
import type { SubmitEvent } from "react";
import type { Product } from "../../types/Product";
import type { ProductData } from "../../api/products";
import * as categoriesApi from "../../api/categories";
import { useFetch } from "../../hooks/useFetch";

type ProductFormProps = {
  editingProduct: Product | null;
  onAdd: (data: ProductData) => void;
  onUpdate: (id: number, data: ProductData) => void;
  onCancel: () => void;
};

export function ProductForm({
  editingProduct,
  onAdd,
  onUpdate,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(editingProduct?.name ?? "");
  const [price, setPrice] = useState(editingProduct?.price ?? 0);
  const [categoryId, setCategoryId] = useState(
    editingProduct?.category.id ?? 0,
  );
  const { data: categories } = useFetch(categoriesApi.getAll, []);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (name.trim() === "" || price <= 0 || categoryId === 0) {
      return;
    }
    const data: ProductData = { name, price, categoryId };
    if (editingProduct) {
      onUpdate(editingProduct.id, data);
    } else {
      onAdd(data);
    }
    setName("");
    setPrice(0);
    setCategoryId(0);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editingProduct ? "Edit product" : "Add product"}</h2>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="number"
        value={price}
        onChange={(event) => setPrice(Number(event.target.value))}
      />
      <select
        value={categoryId}
        onChange={(event) => setCategoryId(Number(event.target.value))}
      >
        <option value={0}>Choose a category</option>
        {(categories ?? []).map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <button type="submit">{editingProduct ? "Save" : "Add"}</button>
      {editingProduct && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
```

The dropdown first:

- The form fetches its own category list with `useFetch(categoriesApi.getAll, [])`. Loading a list from the server, with loading state and error state, is one line now, in any component. This is when it starts to become clear that all that effort into making stuff reusable is worth it!

- The `<select>` is a controlled component, like the inputs: `value` from state, `onChange` into state, with `Number(...)` because HTML elements always hand you a string, even an option value you wrote as a number. Option zero is the "nothing chosen yet" placeholder, and in edit mode the state initialiser preselects the product's current category. (If the categories request fails, the dropdown is just empty, with no message. Not great. We'll fix that later.)

Second, the submit:

- `onAdd` hands up a `ProductData`, `onUpdate` hands up an id plus a `ProductData`. Compare that with the backend: `CreateAsync(dto)` and `UpdateAsync(id, dto)`. The same shapes all the way through the stack.

- Notice the `if`. It refuses to submit when no category is chosen (`categoryId === 0`), so the form never sends the server a `categoryId` that doesn't exist. But the refusal does nothing visible: it just returns, and the user doesn't know why the form won't submit. That's a bit rude, and it's another one we'll improve in a later lesson.

### The page hands the data through

The page itself barely changes. Its handlers used to take a name and a price, or a whole product, and pull the pieces apart. Now the form hands them a `ProductData`, so the handlers just pass it to the api module.

> 🎓 In `features/products/ProductsPage.tsx`, add the `ProductData` import at the top:

```tsx
import type { ProductData } from "../../api/products";
```

> 🎓 And replace `addProduct` and `updateProduct` with these:

```tsx
async function addProduct(data: ProductData) {
  try {
    const created = await productsApi.create(data);
    setProducts([...(products ?? []), created]);
    setSaveError(null);
  } catch (err) {
    setSaveError(
      err instanceof Error ? err.message : "Could not save the product.",
    );
  }
}

async function updateProduct(id: number, data: ProductData) {
  try {
    const updated = await productsApi.update(id, data);
    setProducts(
      (products ?? []).map((p) => (p.id === updated.id ? updated : p)),
    );
    setEditingProduct(null);
    setSaveError(null);
  } catch (err) {
    setSaveError(
      err instanceof Error ? err.message : "Could not save the product.",
    );
  }
}
```

### Showing it on the detail page

The detail page already has all the category data now, it just isn't showing it.

> 🎓 In `features/products/ProductDetailPage.tsx`, add a line for the category where the product is shown, near the price:

```tsx
<p>Category: {product.category.name}</p>
```

The list cards could show it too. Feel free to add it there, too.

### The final check

The compiler errors should have stopped now. Let's test it!

> 🎓 Make sure both the frontend and the backend are running. In the app, add a product: name "Microphone", price 45, category Audio. Submit.

It appears in the list.

> 🎓 Refresh: still there, category and all, because it lives in the database now.

> 🎓 Stop both the frontend and the backend, then go through this list in order:

1. Start the backend, start the frontend, two terminals.
2. Open the app, log in (any name, the doorman has not changed).
3. The products page loads its list, and each product knows its category.
4. Click into a product: the detail page shows its category.
5. Add a product with a category: it appears, and survives a refresh.
6. Edit a product and change its category: saved, and still changed after a refresh.
7. Try to submit with the dropdown on "Choose a category": the form quietly refuses.
8. Search for part of a name: the list still filters, results carrying their categories.

If all eight work, the slice is done!

## Where this goes next

What the API still doesn't do is say no. Post a product with an empty title, a negative price, or a category that doesn't exist, and it stores the mess or throws that ugly `500`. Next lesson we add validation and proper error handling.

## Resources

- Microsoft's EF Core docs on loading related data, covering `Include` and eager loading, which is what the includes parameter uses. https://learn.microsoft.com/ef/core/querying/related-data/
- Microsoft's EF Core docs on relationships, for how the conventions map a `CategoryId` and a navigation property to a foreign key. https://learn.microsoft.com/ef/core/modeling/relationships
- Microsoft's EF Core docs on managing schemas, if you want more on `migrations add`, `database update`, and `database drop`. https://learn.microsoft.com/ef/core/managing-schemas/

## Applying this to your project

This lesson's slice is the entity in your module that points at another one: a loan points at the thing lent, a booking at a machine, a share at an order. That's a one-to-many, and you can build it the way the category was built in this lesson, including the drop-and-update for your database, because your seed changes shape too.

Before the migration, do this: draw your module's entities with the arrows between them (all of them), and show the drawing to your teacher during project time. It's a good moment to check your model.

The member is the one entity your module points at that doesn't exist on the backend yet, and that one is team work: a plain `User` entity in the shared core (call it `User`, even if your case calls it a member), with the username, the role and whatever else the case puts on a member, seeded from the hardcoded list you made in the React lessons. No password and no login yet, those come in the authentication lessons. For now it's something for a loan, a booking or a signup to point at.

Seed your rows in every state the case names, because a rule can only be shown on data that has those states.

On the frontend, follow the lesson's examples: the type grows, the api module carries the new field in both directions, a `<select>` on your form fetches its list, and the detail page shows it. An api module for the shared entity or the member is team code, written once.

Migrations collide the most this lesson, since all four of you add one. Keep them small, merge them the same day, and use the fix from the end of lesson one when they clash.