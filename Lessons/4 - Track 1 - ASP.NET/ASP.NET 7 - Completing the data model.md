# ASP.NET 7: Completing the data model

Try to store one more fact about a product: the Headphones are wireless. Easy, you think. Add a column. `IsWireless`, a boolean, done. The Speakers are wireless too, so that flag covers them. Then somebody wants the Monitor marked as on sale, so that's another column, `IsOnSale`. Then "Refurbished". Then "Bestseller". Then whatever next month's marketing meeting decides, and every one of them is a schema change, a migration, and a products table slowly filling up with booleans, most of them `false`. I've seen tables like this in real projects, and they only get worse.

The trouble is that these labels aren't properties of a product, the way a title or a price is. They're things on their own, shared between products: one "Wireless" label that three different products point at. That's a tag. And tags need the one relationship type we haven't met yet, the many-to-many: a product carries many tags, and a tag sits on many products.

Today we add the third and last entity, `Tag`, with that relationship, and then the data model is done. Since you've built this kind of slice twice now, I'm going to do less of the typing. The new parts, everything to do with many-to-many, we build together. The parts you've done before, I describe, and you build them. There's reference code to compare with when you're finished, but try it on your own first.

## What changes this lesson

```
infwad-project/
  Catalog.Api/
    Models/
      Product.cs               (gains a list of tags)
      Tag.cs                   (new)
    Data/
      AppDbContext.cs          (add the Tags table)
      SeedData.cs              (seed tags, and put some on products)
    Dtos/
      ProductDtos.cs           (tags on the way out, tag ids on the way in)
      TagDtos.cs               (new)
    Exceptions/
      AppException.cs          (one more member: ConflictException)
    Services/
      ProductService.cs        (load the tags, set the tags)
      ITagService.cs           (new, and you write it)
      TagService.cs            (new, and you write it)
    Controllers/
      TagsController.cs        (new, and you write it)
    Program.cs                 (register the tag service)
    products.rest             (create and update now send tags)
    tags.rest                 (new)
  ClientApp/
    src/
      types/
        Tag.ts                (new)
        Product.ts            (gains a list of tags)
      api/
        products.ts           (a product carries its tags, both ways)
      features/products/
        ProductForm.tsx        (keeps a product's tags when you edit it)
        ProductDetailPage.tsx  (shows the tags)
```

## 1. The relationship that will not fit in a column

You know how to relate two entities: a foreign key. A product belongs to one category, so the product row carries a `CategoryId`. Now try the same with tags.

Put a `TagId` on `Product`? Then a product holds exactly one tag id, and the Phone cannot be both "Wireless" and "Sale". Wrong.

Put a `ProductId` on `Tag`, then? Then the "Wireless" tag belongs to exactly one product, and to make three products wireless you'd need three separate rows all named "Wireless", three tags pretending to be one. Same problem, the other way round.

A foreign key column holds one value, and one value cannot say "these three".

The solution is a third table, a table of links, where every row is one pair: this product, that tag.

```
Product                       ProductTag             Tag
-------                       ----------             ---
Id  Title       ...           ProductId  TagId       Id  Name
1   Laptop                    1          4           1   Wireless
2   Monitor                   2          2           2   Sale
3   Headphones                2          3           3   Refurbished
4   Speakers                  3          1           4   Bestseller
5   Phone                     3          4
6   Tablet                    4          1
                              5          1
                              5          2
```

Read the middle table row by row. Product 3 links to tag 1: the Headphones are Wireless. Product 5 shows up twice, so the Phone carries two tags. Tag 1 shows up three times, so Wireless sits on three products. That's many-to-many, and the middle table is where the "many" lives, one link per row. Its key is the pair itself, so the same product-tag pair can only be in there once.

This table has a few names (_join table_, junction table, linking table), and every many-to-many relationship in a relational database is built this way.

## 2. The Tag entity

> 🎓 Create `Catalog.Api/Models/Tag.cs`:

```csharp
namespace Catalog.Api.Models;

public class Tag : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Product> Products { get; set; } = [];
}
```

> 🎓 And give `Models/Product.cs` a list of tags, so it reads:

```csharp
namespace Catalog.Api.Models;

public class Product : IEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public List<Tag> Tags { get; set; } = [];
}
```

Look at the two files together. `Tag` holds a `List<Product>`, `Product` holds a `List<Tag>`. Compare that to `Category`, where one side had a collection and the other side had a single object plus a foreign key. Here there's no foreign key property anywhere, and no join table class either. I just told you every many-to-many needs a join table, and then I didn't write one.

> 🎓 Tell the `DbContext` about the new entity, in `Data/AppDbContext.cs`:

```csharp
using Catalog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
}
```

> 🎓 Now make the migration, and read the result:

```bash
dotnet ef migrations add AddTags
```

Open the new file in `Migrations`. There's a `Tags` table, as expected. And then there's a second table we didn't ask for: `ProductTag`. It has two columns, `ProductsId` and `TagsId` (named after the navigation properties, plural and all), a primary key made of the two together, and a foreign key from each column to its own table. That's the join table from section one, in migration code.

Entity Framework saw a collection on both sides, `List<Tag>` on the product and `List<Product>` on the tag, recognised the shape as many-to-many, and wrote the join table itself. It also manages that table for you: you add and remove links by putting `Tag` objects into a product's list, and EF turns that into rows appearing and disappearing in `ProductTag`. For a plain link like this one, a product and a tag and nothing else, EF needs no configuration at all.

(There's a harder version, for when the link itself has to carry data, and that one you write yourself. We get to it in section seven.)

### Resetting, one more time

This migration could go onto the existing database without any problem, because it only adds tables. No new required column lands on the rows that are already there.

We reset anyway, because of the seeder. It only runs when the products table is empty, and our current products were seeded without tags. Apply the migration, run the app, and you'd have a new `ProductTag` table with nothing in it.

> 🎓 Drop and rebuild:

```bash
dotnet ef database drop
```

Answer `y`, then:

```bash
dotnet ef database update
```

Do not run the app yet. The seeder would refill the empty database with the old seed, without tags, and you'd have to drop it again. First we add tags to the seeder.

## 3. Seeding tags

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

        var wireless = new Tag { Name = "Wireless" };
        var sale = new Tag { Name = "Sale" };
        var refurbished = new Tag { Name = "Refurbished" };
        var bestseller = new Tag { Name = "Bestseller" };

        context.Tags.AddRange(wireless, sale, refurbished, bestseller);

        context.Products.AddRange(
            new Product { Title = "Laptop", Price = 1200, Category = computers, Tags = [bestseller] },
            new Product { Title = "Monitor", Price = 300, Category = computers, Tags = [refurbished, sale] },
            new Product { Title = "Headphones", Price = 150, Category = audio, Tags = [wireless, bestseller] },
            new Product { Title = "Speakers", Price = 200, Category = audio, Tags = [wireless] },
            new Product { Title = "Phone", Price = 800, Category = mobile, Tags = [wireless, sale] },
            new Product { Title = "Tablet", Price = 450, Category = mobile }
        );

        await context.SaveChangesAsync();
    }
}
```

The Monitor is refurbished and on sale, the Phone is wireless and on sale, and the Tablet has no tags at all, which is fine. Tags are optional decoration, but every product must have a category.

Note: we add the four tags on their own line, with `AddRange`, even though Entity Framework would have found them through the products, the way it found the categories. Adding them directly keeps their ids in the order we wrote them, one through four, and the `.rest` requests later in this lesson use those ids.

And there's no `ProductTag` anywhere in this file. We put tag objects on products, call `SaveChangesAsync`, and EF inserts the tags, inserts the products, works out every pair, and writes the join rows itself.

> 🎓 Run the app once to seed, then stop it:

```bash
dotnet run
```

> 🎓 Open `catalog.db` in your SQLite viewer. Four tables now, plus the migrations table. Open `ProductTag` and look at the rows: pairs of numbers, eight of them, the same eight as the concept table in section one. Match a few against the seed by hand. Product 5, tag 1: the Phone is Wireless.

But if you send `GET api/products` now, in the browser or your `.rest` file, the response looks exactly like it did last lesson: id, title, price, category. The tags are in the database and the API is keeping them to itself. The response DTO has no room for tags, and the service isn't loading them.

## 4. Tags on the way out

The response needs a tag shape, and it should be a DTO, not the entity. Remember the endless loop with categories? A `Tag` carries a `List<Product>`, each of those products carries a list of tags, and each of those tags carries more products. So `TagDto` gets an id and a name, and nothing else.

> 🎓 Create `Catalog.Api/Dtos/TagDtos.cs`:

```csharp
namespace Catalog.Api.Dtos;

public record TagDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}
```

> 🎓 Give `ProductDto` a list of them, in `Dtos/ProductDtos.cs`:

```csharp
public record ProductDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public CategoryDto Category { get; init; } = null!;
    public List<TagDto> Tags { get; init; } = [];
}
```

Now the service. Three small edits in `Services/ProductService.cs`: the two read paths ask the repository to include the tags, and the mapper maps them.

> 🎓 In `GetAllAsync`, add the tags include to both branches:

```csharp
var products = string.IsNullOrWhiteSpace(search)
    ? await _products.GetAllAsync(p => p.Category, p => p.Tags)
    : await _products.FindAsync(
        p => p.Title.ToLower().Contains(search.ToLower()),
        p => p.Category, p => p.Tags);
```

> 🎓 Same in `GetByIdAsync`:

```csharp
var product = await _products.GetByIdAsync(id, p => p.Category, p => p.Tags);
```

> 🎓 And add the tags to `ToDto`:

```csharp
private static ProductDto ToDto(Product product) => new()
{
    Id = product.Id,
    Title = product.Title,
    Price = product.Price,
    Category = new CategoryDto
    {
        Id = product.Category.Id,
        Name = product.Category.Name
    },
    Tags = product.Tags.Select(t => new TagDto
    {
        Id = t.Id,
        Name = t.Name
    }).ToList()
};
```

Remember the `params` on the includes parameter, and that you could pass more than one? Now we do: `p => p.Category, p => p.Tags`. The repository loops over both, so a product arrives with its category and its tags in a single query, and we didn't have to change the repository at all. Behind the scenes, Entity Framework is quietly joining through the `ProductTag` table to get there.

> 🎓 Run the app and fetch the products:

```http
### Get all products
GET {{baseUrl}}/api/products
```

```json
[
  {
    "id": 1,
    "title": "Laptop",
    "price": 1200,
    "category": { "id": 1, "name": "Computers" },
    "tags": [{ "id": 4, "name": "Bestseller" }]
  },
  {
    "id": 2,
    "title": "Monitor",
    "price": 300,
    "category": { "id": 1, "name": "Computers" },
    "tags": [
      { "id": 3, "name": "Refurbished" },
      { "id": 2, "name": "Sale" }
    ]
  }
]
```

There they are! Every product with its category and its tags, and further down the list the Tablet, with an empty `"tags": []`.

## 5. Tags on the way in

When we create a product, we want to say which tags it carries. Categories already showed the pattern: the response carries the whole nested category object, but the request sends just a `categoryId`. Tags work the same way, except there are many of them, so the request sends a list of ids.

> 🎓 Update the two request DTOs in `Catalog.Api/Dtos/ProductDtos.cs`. The whole file now reads:

```csharp
using System.ComponentModel.DataAnnotations;

namespace Catalog.Api.Dtos;

public record ProductDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public CategoryDto Category { get; init; } = null!;
    public List<TagDto> Tags { get; init; } = [];
}

public record CreateProductDto
{
    [Required]
    [StringLength(100)]
    public string Title { get; init; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal Price { get; init; }

    public int CategoryId { get; init; }

    public List<int> TagIds { get; init; } = [];
}

public record UpdateProductDto
{
    [Required]
    [StringLength(100)]
    public string Title { get; init; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal Price { get; init; }

    public int CategoryId { get; init; }

    public List<int> TagIds { get; init; } = [];
}
```

`TagIds` has no validation annotation, and it defaults to an empty list, so a request without tags can leave it out and nothing breaks. But it has the same problem `CategoryId` had last lesson: no annotation can know which tag ids actually exist. Only the database knows that, so the check goes in the service.

> 🎓 Update `Services/ProductService.cs`. The constructor gets a third repository, and create and update both handle the tags. Here's the whole file:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Exceptions;
using Catalog.Api.Models;
using Catalog.Api.Repositories;

namespace Catalog.Api.Services;

public class ProductService : IProductService
{
    private readonly IRepository<Product> _products;
    private readonly IRepository<Category> _categories;
    private readonly IRepository<Tag> _tags;

    public ProductService(
        IRepository<Product> products,
        IRepository<Category> categories,
        IRepository<Tag> tags)
    {
        _products = products;
        _categories = categories;
        _tags = tags;
    }

    public async Task<List<ProductDto>> GetAllAsync(string? search = null)
    {
        var products = string.IsNullOrWhiteSpace(search)
            ? await _products.GetAllAsync(p => p.Category, p => p.Tags)
            : await _products.FindAsync(
                p => p.Title.ToLower().Contains(search.ToLower()),
                p => p.Category, p => p.Tags);

        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var product = await _products.GetByIdAsync(id, p => p.Category, p => p.Tags);
        return product is null ? null : ToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category is null)
        {
            throw new BadRequestException($"There is no category with id {dto.CategoryId}");
        }

        var tags = await _tags.FindAsync(t => dto.TagIds.Contains(t.Id));
        if (tags.Count != dto.TagIds.Count)
        {
            throw new BadRequestException("One or more tag ids do not exist");
        }

        var product = new Product
        {
            Title = dto.Title,
            Price = dto.Price,
            Category = category,
            Tags = tags
        };

        _products.Add(product);
        await _products.SaveChangesAsync();

        return ToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _products.GetByIdAsync(id, p => p.Tags);
        if (product is null) return null;

        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category is null)
        {
            throw new BadRequestException($"There is no category with id {dto.CategoryId}");
        }

        var tags = await _tags.FindAsync(t => dto.TagIds.Contains(t.Id));
        if (tags.Count != dto.TagIds.Count)
        {
            throw new BadRequestException("One or more tag ids do not exist");
        }

        product.Title = dto.Title;
        product.Price = dto.Price;
        product.Category = category;
        product.Tags = tags;
        await _products.SaveChangesAsync();

        return ToDto(product);
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
        },
        Tags = product.Tags.Select(t => new TagDto
        {
            Id = t.Id,
            Name = t.Name
        }).ToList()
    };
}
```

Let's go over it:

- `FindAsync(t => dto.TagIds.Contains(t.Id))` is the same `FindAsync` as the search, with a new kind of predicate: fetch every tag whose id is in the request's list, in one query. If the request sent three ids and we got three tags back, all of them exist. If the counts differ, at least one id was made up, and we refuse the whole request. (A request that sends the same id twice also fails the count check. I can live with that. Send sensible data.) After the check we're holding the actual tag objects, so `Tags = tags` hands them straight to the product, and EF fills in the join rows from the objects at save time.

- `GetByIdAsync(id, p => p.Tags)`, the first line of the update, loads the current tags even though we're about to replace them. When we assign `product.Tags = tags`, Entity Framework has to work out which links to add and which to remove, and it can only do that if it knows the old list. Load the product without its tags and EF sees the new list as pure additions, tries to insert join rows that already exist, and the database refuses. So if your code is going to change a relationship, load it first.

- The category check and the tag check now appear, almost word for word, in both `CreateAsync` and `UpdateAsync`. We'll clean that up next lesson.

> 🎓 Run the app and create a tagged product. Add this to `products.rest` and send it:

```http
### Create a product with tags
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "title": "Webcam",
  "price": 60,
  "categoryId": 1,
  "tagIds": [1, 2]
}
```

`201 Created`, and the response carries the full shape, category and tags included:

```json
{
  "id": 7,
  "title": "Webcam",
  "price": 60,
  "category": { "id": 1, "name": "Computers" },
  "tags": [
    { "id": 1, "name": "Wireless" },
    { "id": 2, "name": "Sale" }
  ]
}
```

> 🎓 Now try to lie to it:

```http
### Create a product with a tag that does not exist (400)
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "title": "Webcam Pro",
  "price": 90,
  "categoryId": 1,
  "tagIds": [1, 999]
}
```

```json
{
  "status": 400,
  "title": "One or more tag ids do not exist"
}
```

Refused, nothing saved, and a clean message.

> 🎓 One more experiment. Update the Laptop's tags and watch the terminal while you do it:

```http
### Retag the laptop
PUT {{baseUrl}}/api/products/1
Content-Type: application/json

{
  "title": "Laptop",
  "price": 1200,
  "categoryId": 1,
  "tagIds": [2, 3]
}
```

The Laptop goes from Bestseller to Sale and Refurbished. And in the terminal, between the SQL lines that Entity Framework logs, there's a `DELETE` on `ProductTag` for the old pair and an `INSERT` for the two new ones. We assigned a list. EF worked out the difference and changed only the join rows that needed changing. I think that's pretty cool.

## 6. The tag slice, built by you

Right now tags only come along inside products. The frontend can't ask "what tags exist?" (which it needs for a filter bar or a tag picker), and nobody can add a new tag without changing the seed. So tags need their own slice: get all, get one, create, delete.

One piece is new, and you don't have an example to copy it from: the `409`. Remember the status-code table? A `409` is for a valid request that collides with the current state of the data. Creating a tag whose name already exists is that kind of collision, and it needs its own exception.

> 🎓 Add one class to `Catalog.Api/Exceptions/AppException.cs`, so the file reads:

```csharp
using Microsoft.AspNetCore.Http;

namespace Catalog.Api.Exceptions;

public abstract class AppException : Exception
{
    public abstract int StatusCode { get; }
    protected AppException(string message) : base(message) { }
}

public class BadRequestException : AppException
{
    public override int StatusCode => StatusCodes.Status400BadRequest;
    public BadRequestException(string message) : base(message) { }
}

public class ConflictException : AppException
{
    public override int StatusCode => StatusCodes.Status409Conflict;
    public ConflictException(string message) : base(message) { }
}
```

That's four lines. The handler already knows what to do with anything that's an `AppException`: take its status code, put its message in the response. Throw a `ConflictException` and the frontend gets a `409` with your message on it.

Everything else in this slice you've built before: the reads for `Category`, the create and the delete for `Product`. See if you can build this yourself.

The endpoints:

| Method | Route           | Success           | Failure                        |
| ------ | --------------- | ----------------- | ------------------------------ |
| GET    | `api/tags`      | `200`, all tags   |                                |
| GET    | `api/tags/{id}` | `200`, one tag    | `404` if it does not exist     |
| POST   | `api/tags`      | `201` and the tag | `400` invalid, `409` duplicate |
| DELETE | `api/tags/{id}` | `204`             | `404` if it does not exist     |

The rules:

- A new tag needs a name, at most 30 characters. That's annotations on a new `CreateTagDto` in `Dtos/TagDtos.cs`.
- Two tags with the same name make no sense, so creating a tag whose name already exists is refused with a `409`, using the `ConflictException` you just added.
- The delete has no guard. Before you build it, ask yourself what deleting a tag that's still on products leaves behind, and whether that's a problem at all. We test it in a minute.

The build order I'd use: `CreateTagDto` first, then `ITagService` and `TagService`, then `TagsController`, then the one registration line in `Program.cs` that makes the whole thing exist. (Forget that line and ASP.NET greets your first request with a long exception about being "unable to resolve service". Now you know what it means: you asked for an interface nobody registered.)

> 🎓 Build the tag slice. Use the category and product files as your example, and test each endpoint from a new `tags.rest` file as you go. Test with tags you make up yourself and leave the seeded ones alone, because we need them in a minute. Come back when it works, or when you're stuck.

Done? Then compare with my version. Yours doesn't have to match word for word, but the shape should be the same, and the status codes must be.

`Dtos/TagDtos.cs`:

```csharp
using System.ComponentModel.DataAnnotations;

namespace Catalog.Api.Dtos;

public record TagDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public record CreateTagDto
{
    [Required]
    [StringLength(30)]
    public string Name { get; init; } = string.Empty;
}
```

`Services/ITagService.cs`:

```csharp
using Catalog.Api.Dtos;

namespace Catalog.Api.Services;

public interface ITagService
{
    Task<List<TagDto>> GetAllAsync();
    Task<TagDto?> GetByIdAsync(int id);
    Task<TagDto> CreateAsync(CreateTagDto dto);
    Task<bool> DeleteAsync(int id);
}
```

`Services/TagService.cs`:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Exceptions;
using Catalog.Api.Models;
using Catalog.Api.Repositories;

namespace Catalog.Api.Services;

public class TagService : ITagService
{
    private readonly IRepository<Tag> _tags;

    public TagService(IRepository<Tag> tags)
    {
        _tags = tags;
    }

    public async Task<List<TagDto>> GetAllAsync()
    {
        var tags = await _tags.GetAllAsync();
        return tags.Select(ToDto).ToList();
    }

    public async Task<TagDto?> GetByIdAsync(int id)
    {
        var tag = await _tags.GetByIdAsync(id);
        return tag is null ? null : ToDto(tag);
    }

    public async Task<TagDto> CreateAsync(CreateTagDto dto)
    {
        var existing = await _tags.FindAsync(t => t.Name == dto.Name);
        if (existing.Count > 0)
        {
            throw new ConflictException($"A tag named '{dto.Name}' already exists");
        }

        var tag = new Tag { Name = dto.Name };
        _tags.Add(tag);
        await _tags.SaveChangesAsync();
        return ToDto(tag);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var tag = await _tags.GetByIdAsync(id);
        if (tag is null) return false;

        _tags.Delete(tag);
        await _tags.SaveChangesAsync();
        return true;
    }

    private static TagDto ToDto(Tag tag) => new()
    {
        Id = tag.Id,
        Name = tag.Name
    };
}
```

The duplicate check is `FindAsync` again, searching by name this time instead of by id, and `ConflictException` carries the `409` for us. (The comparison is exact, so "sale" and "Sale" would both get in. If you want to stop that as well, lower-case both sides of the comparison, like the search does.)

`Controllers/TagsController.cs`:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly ITagService _tags;

    public TagsController(ITagService tags)
    {
        _tags = tags;
    }

    [HttpGet]
    public async Task<ActionResult<List<TagDto>>> GetAll()
        => Ok(await _tags.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TagDto>> GetById(int id)
    {
        var tag = await _tags.GetByIdAsync(id);
        return tag is null ? NotFound() : Ok(tag);
    }

    [HttpPost]
    public async Task<ActionResult<TagDto>> Create(CreateTagDto dto)
    {
        var created = await _tags.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _tags.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
```

And the line in `Program.cs`, next to the other services:

```csharp
builder.Services.AddScoped<ITagService, TagService>();
```

Here's a `tags.rest` to check the whole slice, deliberate failures included:

```http
@baseUrl = http://localhost:5088

### Get all tags
GET {{baseUrl}}/api/tags

### Get one tag
GET {{baseUrl}}/api/tags/2

### Create a tag
POST {{baseUrl}}/api/tags
Content-Type: application/json

{
  "name": "Gaming"
}

### Create a duplicate tag (409)
POST {{baseUrl}}/api/tags
Content-Type: application/json

{
  "name": "Gaming"
}

### Create a nameless tag (400)
POST {{baseUrl}}/api/tags
Content-Type: application/json

{
  "name": ""
}

### Delete the Wireless tag
DELETE {{baseUrl}}/api/tags/1
```

> 🎓 Send it top to bottom and read the codes as they come back: `200`, `200`, `201`, `409`, `400`, `204`. If your slice answers with those, it's done. (If you already made a Gaming tag while testing, the `201` is a `409` as well.)

### Deleting a tag that's in use

> 🎓 That last request in `tags.rest` deleted a tag that was still on four products. Now look at the products:

```http
### Get all products
GET {{baseUrl}}/api/products
```

`204 No Content` on the delete, and then: the Headphones, the Speakers, the Phone and the Webcam are all still there, prices, categories, everything intact, just without "Wireless".

Deleting a tag deletes rows in `ProductTag`, the links themselves, and a product with one fewer link is still a perfectly valid product. The database even does that cleanup on its own: the join table's foreign keys _cascade_, which means "if my target goes, I go". Now compare a category. Entity Framework set up the same cascade on `CategoryId`, because every product must have a category, so deleting the Audio category would silently delete the Headphones and the Speakers with it. That's why a category delete would need a guard that refuses with a `409` while products still point at it. One relationship is required, the other is decoration, and the delete rules should match what the relationship means.

(Want Wireless back? You know the ritual by now: `dotnet ef database drop`, `dotnet ef database update`, run.)

## 7. When the link itself carries data

EF wrote our join table, and we never touched it. That works until the link needs to carry information of its own. This is the version your project is most likely to need, even though we won't build it into the catalog.

Take a webshop order. An order contains many products, and a product appears in many orders, so that's a many-to-many. But each line of an order knows things: how many, and at what price. Two Headphones at 150 each. Where does the `2` live? Not on the product: it's not a property of headphones. Not on the order: an order has many lines with different quantities. It's a fact about the pair, so it belongs on the link.

And a setup like our tags has nowhere to put it: `List<Product>` on one side, `List<Order>` on the other, and the table in the middle belongs to Entity Framework. You cannot put a `Quantity` on a table you never wrote. So you write the middle table yourself, as a real entity:

```csharp
// Not part of our build. This is the shape, for the day you need it.
public class OrderLine : IEntity
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
```

`Order` holds a `List<OrderLine>`, and `Product` holds a `List<OrderLine>` too, instead of the two pointing at each other directly.

Look closely at that class: there's nothing new in it. An id, and two foreign keys, each with a navigation property. That's the one-to-many with categories, twice: order to lines, and product to lines. The many-to-many, written out by hand, is two relationships you already know, meeting in a middle table, and the extra columns (`Quantity`, `UnitPrice`) are ordinary properties. It even implements `IEntity` and works with the generic repository, because it's an entity like everything else.

So for your project: a plain link is two lists, and EF writes the table for you, like our tags. A link with data is a middle entity you write yourself, and it's just two one-to-manys. Relationships often get data of their own later ("when was this added?", "who added it?"), so don't be surprised if you end up with more of the second kind than the first.

One more thing the link makes you decide: can the same pair appear twice? On an order it can, in principle. Two lines of Headphones on one order is odd, but nothing forbids it, and the `Id` is what keeps the two lines apart. A lot of project links are the other way round: a member is on a waiting list once, a game sits on a shelf once. When that's the rule, tell the database. If our webshop allowed a product only once per order, it would look like this:

```csharp
// In AppDbContext. Not part of our build either.
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<OrderLine>()
        .HasIndex(l => new { l.OrderId, l.ProductId })
        .IsUnique();
}
```

`OnModelCreating` is where you tell Entity Framework the things it can't read from the class, and a _unique index_ on the pair is one of them. From then on the database refuses a second row for the same order and product, whatever your code does. Your service still checks first (`FindAsync` on both ids, and a `ConflictException` when it finds a row, like the duplicate tag name), because the database's refusal comes out as an exception in the middle of `SaveChangesAsync`, and the frontend should get a `409` with a sentence on it instead. The index catches whatever your check misses.

"Then why not make the pair the primary key and drop the `Id`?" You could. It's called a _composite key_, and SQL and Entity Framework both allow it. Don't, not in this course. The repository, the routes and the frontend are all built on one `Id` per row.

(Why copy `UnitPrice` onto the line, when the product already has a price? Because prices change and orders are history. When the Headphones go up to 180 next month, today's order must still say what was actually paid.)

## 8. One-to-one and self-reference

Two relationship types we won't build, so you recognise them when you need one.

A _one-to-one_ pairs each row on one side with at most one row on the other. Say the products table splits off a `ProductDetails` table holding the long description and the technical specs, loaded only on the detail page. It works like a one-to-many with the "many" capped at one: a foreign key, plus a uniqueness rule so no two detail rows claim the same product. Rare in small models. If you think you need one, first ask whether the two tables should really be one.

A _self-reference_ is a one-to-many where both ends are the same entity. A category with a `ParentCategoryId` pointing at another category gives you subcategories, Computers containing Laptops containing Gaming Laptops, one table, as deep as you like. An employee with a `ManagerId` pointing at another employee is the same trick. The mechanism is nothing new, a foreign key into your own table, but it can be confusing the first time you see one.

## 9. Your turn: from a sentence to a model

Every model in this block was handed to you: products, categories, tags. Your project's model isn't. A case says what someone keeps track of, in plain sentences, and turning those sentences into classes is a step we haven't practised yet. So let's do it once, on a different domain, before you do it on yours.

Here's the sentence:

_A veterinary clinic keeps track of its vets and of the pets that come in. Every pet has a name and an owner, and an owner has a name and a phone number. A visit is one pet seen by one vet on a date, and the clinic records what it cost._

> 🎓 Before you read on, write the model. In a scratch file, not in the project: one class per thing the clinic keeps track of, with its properties. Then, for every relationship, name its shape (one-to-many, plain many-to-many, or a link that carries data) and say which class gets the foreign key.

Done? Here's how I'd do it.

First, the nouns. Clinic, vet, pet, owner, name, phone number, visit, date, cost. Not all of them are entities. A name and a phone number are facts about an owner, so they're columns on `Owner`. A date and a cost are facts about a visit. The clinic itself is the whole application, not a row in it. What's left is `Vet`, `Pet`, `Owner` and `Visit`: four classes.

Second, the relationships, read straight off the sentence with a "one" or a "many" at each end. Every pet has an owner, and an owner can bring in several pets: one owner, many pets, so `Pet` carries an `OwnerId`. A visit is one pet, and a pet comes in for many visits: `Visit` carries a `PetId`. A visit is one vet, and a vet sees many: `Visit` carries a `VetId` too. Three one-to-manys, and the foreign key lands on the "many" side every time, the same way `CategoryId` landed on `Product`.

Third, look at what `Visit` turned into. A pet is seen by many vets over its life, and a vet sees many pets: that's many-to-many, and this time we write the join table ourselves, because the link carries data. The date and the cost are facts about the pair. That's section seven's shape.

```csharp
public class Owner : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    public List<Pet> Pets { get; set; } = [];
}

public class Pet : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int OwnerId { get; set; }
    public Owner Owner { get; set; } = null!;

    public List<Visit> Visits { get; set; } = [];
}

public class Vet : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Visit> Visits { get; set; } = [];
}

public class Visit : IEntity
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public decimal Cost { get; set; }

    public int PetId { get; set; }
    public Pet Pet { get; set; } = null!;

    public int VetId { get; set; }
    public Vet Vet { get; set; } = null!;
}
```

Compare with yours. The names may differ, and a `Species` on `Pet` or a `Notes` on `Visit` would be fine additions. What should match is the shape: four classes, every foreign key on the many side, and the link with data written out as an entity rather than as two lists pointing at each other. If you put a `List<Vet>` on `Pet` and stopped there, go back to section seven and ask where the date lives. "Where does this fact live?" is the question to ask of every sentence in your case, and the answer is a column, a foreign key, or a class you haven't written yet.

## 10. Tags in the browser

The backend serves tags now, and the frontend ignores all of them.

> 🎓 Create `ClientApp/src/types/Tag.ts`:

```ts
export type Tag = {
  id: number;
  name: string;
};
```

> 🎓 And add it to `types/Product.ts`:

```ts
import type { Category } from "./Category";
import type { Tag } from "./Tag";

export type Product = {
  id: number;
  name: string;
  price: number;
  category: Category;
  tags: Tag[];
};
```

> 🎓 In `api/products.ts`, add tags to `ProductResponse`, to `toProduct`, to `ProductData`, and to `toRequestBody`:

```ts
type ProductResponse = {
  id: number;
  title: string;
  price: number;
  category: { id: number; name: string };
  tags: { id: number; name: string }[];
};
```

```ts
function toProduct(raw: ProductResponse): Product {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
    category: raw.category,
    tags: raw.tags,
  };
}
```

```ts
export type ProductData = {
  name: string;
  price: number;
  categoryId: number;
  tagIds: number[];
};
```

```ts
function toRequestBody(data: ProductData) {
  return {
    title: data.name,
    price: data.price,
    categoryId: data.categoryId,
    tagIds: data.tagIds,
  };
}
```

The tags come in as an id-and-name shape that's already the app's `Tag` type, so `toProduct` copies them straight across, no rename. On the way out, `ProductData` gets a `tagIds`, a plain list of numbers, because that's what `CreateProductDto` and `UpdateProductDto` want.

But there's a problem. There's no tag editor on the form, and a `PUT` replaces the whole product, tags included. The backend's `UpdateAsync` takes the `TagIds` you send and makes those the product's tags, exactly those. So if the form edits a title, sends no tag ids, and calls update, the server reads that as "this product now has no tags" and strips every one of them.

The fix is small and a little sneaky: when editing, send back the tag ids the product already has, so a `PUT` that changes the price leaves the tags exactly where they were.

> 🎓 In `features/products/ProductForm.tsx`, where `handleSubmit` builds the `data` object, include the current tags:

```tsx
const data: ProductData = {
  name,
  price,
  categoryId,
  tagIds: editingProduct?.tags.map((tag) => tag.id) ?? [],
};
```

For a new product there's no `editingProduct`, so `tagIds` is an empty list, and products created from this form start untagged. Tags get onto products through the seed or a request in `products.rest`, not through the form. A tag picker would be a nice addition, but not for the demo.

Last, let's show the tags on the detail page.

> 🎓 In `features/products/ProductDetailPage.tsx`, add a line near the category:

```tsx
<p>Tags: {product.tags.map((tag) => tag.name).join(", ") || "none"}</p>
```

The list cards could show them too, as little chips maybe. Feel free to add them there.

> 🎓 Make sure both the frontend and the backend are running. Open the Laptop's detail page: its tags are listed. Now edit it, change only its price, and save. Reopen the detail page: the price changed and the tags survived, because we sent them back. Now change the `tagIds` line in the form to `tagIds: []`, edit the price again, and watch the tags vanish. Then put the line back.

Putting the line back doesn't put the tags back. They're gone from the join table, and the form now faithfully sends an empty list. To restore them, send the retag request in `products.rest` again, and the Laptop is Sale and Refurbished at 1200 again, price included.

## Where this goes next

The data model is complete! Three entities, both relationship shapes, and the frontend shows all of it.

Next lesson we debug across the whole stack and clean up the code we have, keeping it working the whole way.

## Resources

- Microsoft's EF Core docs on many-to-many relationships, covering both the convention-based form we built and the explicit join entity from section seven. https://learn.microsoft.com/ef/core/modeling/relationships/many-to-many
- Microsoft's EF Core docs on cascade delete, for what happens to dependent rows when the row they point at goes. https://learn.microsoft.com/ef/core/saving/cascade-delete
- Microsoft's EF Core docs on one-to-one relationships, for the shape we described but did not build. https://learn.microsoft.com/ef/core/modeling/relationships/one-to-one

## Applying this to your project

Finish your module's model. Take every entity still on paper through the steps from section nine. Most of what you have left is probably a many-to-many, and most of those carry data (when, who, how much, which position), so each one is an entity you write yourself, like the vet's visit. A pair that may occur only once (one signup per member, one rating per person per item) keeps its `Id` and gets a unique index and a service check, as in section seven. Build each one end to end, with the tag slice as your example.

The team adds `ConflictException` to the exception family. Rules from last lesson where a valid request collides with the current state of the data now throw it instead of a `BadRequestException`. Then decide, per entity, what its delete does: anything that other rows must point at refuses the delete with a `409` while something still points at it. Write the decision next to the rule in your backlog.

Complete your seed data: twenty to thirty rows per list, the link rows included, every state the case names, and the awkward rows from the case rules. Use `AddRange` in a fixed order for anything your `.rest` files reference by id.

On the frontend, check every edit form in your module for a link it could silently wipe, and send the current ids back the way `ProductForm` does. Feel free to add a picker (checkboxes, a multi-select), so members can make the links themselves.