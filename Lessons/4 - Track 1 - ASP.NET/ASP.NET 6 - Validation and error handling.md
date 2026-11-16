# ASP.NET 6: Validation and error handling

Our API trusts whatever it gets. An empty title? Stored. A price of minus ten euro? Stored, and now you owe your customers money. A product in category 999, which doesn't exist? That one it cannot store, so it crashes and sends a stack trace to whoever asked. Today we fix that.

Let's look at the damage first.

> 🎓 Start the app with `dotnet run`, add these two requests to `Catalog.Api/products.rest`, and send them:

```http
### A nonsense product (empty title, negative price)
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "title": "",
  "price": -10,
  "categoryId": 1
}

### A product in a category that does not exist
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "title": "Smart Fridge",
  "price": 900,
  "categoryId": 999
}
```

The first one comes back `201 Created`. Created! A product with no name and a negative price is now in your database, and the API seems proud of it. The second one comes back `500 Internal Server Error` with a wall of stack trace: a `DbUpdateException`, a `FOREIGN KEY constraint failed` somewhere in the middle, and file paths from your own machine. The database refused to point a product at a category that's not there (good), and our code had no plan for that refusal (bad), so the explosion went straight to the client.

To be fair to ourselves, we got one of these right already. Ask for `GET api/products/999` and you get a clean `404 Not Found`. So the API can fail politely, it just only knows how for one kind of failure.

By the end of this lesson, bad input gets a `400` that names what was wrong with it, the impossible category gets a `400` with a message a human can read, and a real server error still returns a `500`, but a clean, generic one, with the details in the log where they belong.

## What changes this lesson

We're changing what the API accepts, and how it answers when it doesn't like something. That's all backend:

```
Catalog.Api/
  Dtos/
    ProductDtos.cs            (validation rules on the incoming DTOs)
  Exceptions/                 (new folder)
    AppException.cs           (new)
  GlobalExceptionHandler.cs   (new)
  Services/
    ProductService.cs         (checks the category exists)
  Program.cs                  (register the handler)
  products.rest               (requests that go wrong on purpose)
```


## 1. The language of failure: status codes

Every HTTP response carries a status code, and you've seen a few already: `200` on a read, `201` on a create, `204` on a delete, `404` for a product that doesn't exist, and just now a `500`. The frontend uses them too. `response.ok`, the thing the api module checks before trusting a fetch, is nothing more than "is this status code in the 200s?".

So the codes are not just decoration. The frontend can show a form error on a `400`, a "not found" page on a `404`, a "sorry, try again later" on a `500`, but only if you let your backend send the right code.

If you really wanted to, you could do it your own way, and send `200 OK` with an error message in the body (people actually do this), but it's a bad idea. Pick the right code and the whole client/server conversation gets simpler.

The first digit is the category. `2xx` means it worked. `4xx` means the client did something wrong: "change your request and try again". `5xx` means the server did something wrong: "your request was fine, we broke".

The codes this API uses, most of which you already know:

| Code | Name                  | When                                                                           |
| ---- | --------------------- | ------------------------------------------------------------------------------ |
| 200  | OK                    | A successful read or update, data in the body.                                 |
| 201  | Created               | A successful create. Something new exists now.                                 |
| 204  | No Content            | It worked and there is nothing to send back. Our deletes.                      |
| 400  | Bad Request           | The client sent something wrong: missing field, bad value, nonsense reference. |
| 401  | Unauthorized          | "Who are you?" No valid login where one is required.                           |
| 403  | Forbidden             | "I know who you are, and no." Logged in, but not allowed to do this.           |
| 404  | Not Found             | No such thing at this address.                                                 |
| 409  | Conflict              | A valid request that collides with the current state of the data.              |
| 500  | Internal Server Error | The server broke. Not the client's fault.                                      |

`401` and `403` aren't for today. They belong to authentication, which our API doesn't have yet, so they come in the authentication lessons (the catalog gets a role there too: deleting a product becomes a manager's job). The names are misleading, so learn them now: `401` means "not authenticated" even though it says "unauthorized", and `403` means "authenticated, but not allowed". `409` comes next lesson. The rest we produce today.

## 2. Validation: teaching the DTOs to say no

Start with the nonsense product. That request should never have reached the database. It should have been refused with a `400` that says what was wrong with it.

"But hold on," I hear you think. "The frontend will have a form, and the form will have required fields and a minimum price. Why check again on the server?"

Great question! But the API doesn't know your form exists. It answers anyone who speaks HTTP. You've been bypassing the frontend yourself with a `.rest` file, and so can anybody else: a script, a different app, an attacker. Frontend validation is a convenience for honest users. It protects the data against nothing. The server is the last line, so the server checks. Always.

The good news is that in ASP.NET this is easy. Especially when you've already been doing things the right way, like us!

### Annotations on the DTOs

The rules are written as attributes, the things in square brackets, on the DTO properties. They come from a namespace called `System.ComponentModel.DataAnnotations`, so they are called _validation annotations_.

> 🎓 Update `Catalog.Api/Dtos/ProductDtos.cs`. The two incoming DTOs get rules, the outgoing one doesn't:

```csharp
using System.ComponentModel.DataAnnotations;

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
    [Required]
    [StringLength(100)]
    public string Title { get; init; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal Price { get; init; }

    public int CategoryId { get; init; }
}

public record UpdateProductDto
{
    [Required]
    [StringLength(100)]
    public string Title { get; init; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal Price { get; init; }

    public int CategoryId { get; init; }
}
```

See how easy that was now?

- `[Required]` means the field must be there and must not be empty. It catches both a missing `title` and a `title` of `""`, which is how our nonsense product got in.
- `[StringLength(100)]` caps the title at 100 characters. Nobody needs a product title longer than that. (You can also set a minimum with `[StringLength(100, MinimumLength = 3)]`.)
- `[Range(0.01, 1000000)]` says the price is at least one cent and at most a million. The lower bound refuses the negative price and the free product in one go. If your shop ever sells something over a million euro through this API, congratulations (I'm so proud of you! Please don't forget to thank your teacher!), and also come back and update this number.

The rules sit on `CreateProductDto` and `UpdateProductDto`, the shapes that come in. `ProductDto`, the shape that goes out, gets none, because we build that one ourselves. _You validate what you receive, not what you send._

And `CategoryId` has no annotation at all. An annotation checks the shape of a value, and no annotation can know which category ids actually exist. Only the database knows whether category 999 is real, so that check goes somewhere else, later this lesson.

### Who runs these rules?

Remember the `[ApiController]` attribute on top of every controller? One of its jobs is to check the incoming DTO against its annotations before the action method runs. If any rule fails, it answers with a `400` on its own, and the controller method, the service and the database are never touched.

> 🎓 Run the app and send the nonsense product again (empty title, price of `-10`). Now you get `400 Bad Request`, and a body like this:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Title": ["The Title field is required."],
    "Price": ["The field Price must be between 0.01 and 1000000."]
  }
}
```

(With one more line, a `traceId`. That's a number for finding this request in the logs later. Ignore for now.)

Look at that! Both problems, explained, in one response. A frontend can read that `errors` object and tell the user exactly what went wrong. (Ours can't yet. We fix it in the last backend lesson.)

That response shape has a name: _problem details_. It's a small web standard for error bodies, so every API's errors look the same. ASP.NET uses it out of the box.

> 🎓 Play with it a bit. Send a title of exactly 100 characters, then 101. Send a price of `0.01`, then `0`. Send the request with the `title` line deleted entirely. Watch which rule answers each time.

Note: the rules only check what comes in from now on. The nonsense product from the top of the lesson is still in the database, and so is anything from your experiments that got through (a hundred-character title at a legal price is a valid product, after all).

> 🎓 Send "Get all products", read off the ids of the strays, and send a `DELETE` to `api/products/` for each to clean up the mess.

Yes, the rules on `CreateProductDto` and `UpdateProductDto` are exactly the same, just like the DTOs themselves. Keep both anyway. The moment updates need different rules than creates, you'll have a place to put that difference. (Example: you may set an initial price freely but never change one by more than fifty percent.)

## 3. SQL injection

While we're on the subject of not trusting input: SQL injection. It's the most famous input-trust failure there is, so every developer should know about it.

Imagine a search endpoint that builds its SQL by hand, gluing the user's text straight into the query:

```csharp
// Never do this. Seriously.
var sql = "SELECT * FROM Products WHERE Title = '" + userInput + "'";
```

For a user who types `Laptop`, fine. But, a user can also type `'; DROP TABLE Products;--`, and now the quote closes the string early, the rest gets read as its own commands, and the input has stopped being data and become code that the database runs. That's SQL injection. It's decades old, entirely preventable, but companies still get hacked by it every year. Oops.

But we're using Entity Framework, and it doesn't build SQL by gluing strings. Every query we've written is turned into a _parameterized query_: the query text and the values travel separately, and the values are only ever treated as values.

> 🎓 Let's prove it! Create a product whose title is an attack:

```http
### Little Bobby Tables
POST {{baseUrl}}/api/products
Content-Type: application/json

{
  "title": "Robert'); DROP TABLE Products;--",
  "price": 5,
  "categoryId": 1
}
```

`201 Created`. Send "Get all products" and there he is, quotes and all, stored as an ordinary, harmless string. The `Products` table is still there. Phew! (The name is from a famous xkcd comic, linked at the bottom.)

Note: Entity Framework does let you write raw SQL, with `FromSqlRaw`, and if you glue user input into that string you have this risk again. So never build SQL out of strings that contain user input. Stay with LINQ, and this entire class of attack does not apply to you.

> 🎓 Delete Robert again: send a `DELETE` to `api/products/` with his id.

## 4. One place to catch everything

Now let's talk about that stack trace. The `categoryId: 999` request blew up with a `500`, and the client got the whole exception: type names, our file paths, the SQL error, line numbers. It's useless to the client, which just needed to know what to do differently. But it's a gift to an attacker, who now knows what framework we run, how our project is laid out, and what our queries look like. Error details like that should only go into our logs, never to the client.

What actually happened? The service called `SaveChangesAsync`, the database refused the foreign key, and Entity Framework threw an exception. Nothing caught it, so it climbed all the way up, out of the repository, out of the service, out of the controller, until the framework printed it and answered `500`.

The obvious fix is to wrap everything in `try` and `catch`, in every service method. Do not do that. You'd be writing the same ten lines in forty places. We can do it with one handler, at the top, that catches everything that climbs out.

ASP.NET has a place for exactly this. But the handler needs to write to a log, so first, a short detour.

### About logging

You've been seeing logs since the first ASP.NET lesson, without knowing it. Every time you run the app, the terminal fills with lines like:

```
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (2ms) ... SELECT "p"."Id", "p"."Price", "p"."Title" ...
```

That's the logging system talking. Every line has a level (`info` at the front), a category (the long dotted name, which is the class that wrote it), and a message. The levels run from chatty to alarming: `Trace`, `Debug`, `Information`, `Warning`, `Error`, `Critical`. And the `Logging` section in `appsettings.json` is the volume knob:

```json
"Logging": {
  "LogLevel": {
    "Default": "Information",
    "Microsoft.AspNetCore": "Warning"
  }
}
```

It sets a minimum level per category. `Default` at `Information` means "show me Information and up, from everyone", which is why you see Entity Framework's SQL. The `Microsoft.AspNetCore` line raises the bar for the framework's own plumbing to `Warning`, which is why you don't see three lines of routing chatter for every request. Turn `Default` up to `Warning` and the SQL lines vanish too.

To write your own log line, any class can ask for an `ILogger<ThatClass>` in its constructor, the same way our services ask for repositories, and the framework hands one over with the class name already set as the category.

### The exception family

One handler at the top has to answer one question per exception: what status code does this deserve? An unexpected error, like our foreign key one, is a `500`. But in the next section we're going to throw exceptions on purpose, for rule violations that map to a `400`, and the handler needs to tell those apart from the accidents.

So we give our own exceptions a shape: a small family where every member carries the status code it maps to.

> 🎓 Create a new folder `Catalog.Api/Exceptions`, and in it `AppException.cs`:

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
```

`AppException` is the abstract parent: an ordinary `Exception` plus one promise, that every child declares a `StatusCode`. `BadRequestException` is the one child we need today, for "the client sent something we cannot work with", which maps to a `400`. When we need another code (next lesson), that's four more lines here.

(Don't name one of these `ValidationException`. .NET already has a class with that name.)

### The global exception handler

> 🎓 Create `Catalog.Api/GlobalExceptionHandler.cs`, in the project root next to `Program.cs`:

```csharp
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Catalog.Api.Exceptions;

namespace Catalog.Api;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var statusCode = exception is AppException appException
            ? appException.StatusCode
            : StatusCodes.Status500InternalServerError;

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception");
        }

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = statusCode == StatusCodes.Status500InternalServerError
                ? "An unexpected error occurred"
                : exception.Message
        };

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
```

It works like this:

- `IExceptionHandler` is the framework's interface for "call me when an exception escapes". Implement its one method, `TryHandleAsync`, register the class (next step), and every exception that climbs out of any controller, service or repository lands here.
- `statusCode` is the sorting. If the exception is one of ours, an `AppException`, we take the status code it carries. Anything else becomes a `500`.
- `_logger.LogError(...)` only runs for a `500`. Then we log the full exception, stack trace and all, but the client just gets a deliberately boring "An unexpected error occurred". For our own exceptions there's nothing to log, because nothing broke, and the message is meant for the client, so it goes out as the title.
- `ProblemDetails` is the same standard shape the validation errors already use. Every error this API produces, from today on, has a `status` and a `title`.
- `return true` at the end says "handled, nobody else needs to deal with this".

### Wiring it up

Two lines to register the handler, one line to switch it on.

> 🎓 In `Catalog.Api/Program.cs`, add these two registrations right after `builder.Services.AddControllers()` (above the CORS block):

```csharp
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
```

> 🎓 And add this as the first line of the request pipeline, above `app.UseCors()`:

```csharp
app.UseExceptionHandler();
```

About the three lines:

- `AddProblemDetails()` teaches the app the standard error format.
- `AddExceptionHandler<GlobalExceptionHandler>()` registers our class as the thing to call.
- `app.UseExceptionHandler()` puts the catching itself into the request pipeline. It goes first, before CORS and before the controllers, because it has to wrap everything that can throw. It's the outermost `try` around the whole application.

Note: your `Program.cs` also needs a `using Catalog.Api;` at the top, if your editor didn't add it for you.

Here's the layer diagram again, with an exception travelling the other way:

```
UseExceptionHandler  ->  Controller  ->  Service  ->  Repository  ->  DbContext  ->  database
        ^                                                                              |
        +-------- an exception climbs back out, layer by layer, and lands here --------+
```

Wherever the throw happens (the database refusing a row today, the service refusing a request on purpose in the next section), the exception climbs back out the way the request came in, and the handler is the last thing it meets.

> 🎓 Run the app and send the impossible category again (`categoryId` of 999). Still a `500`, we have not fixed the cause yet, but look at the difference. The client now gets:

```json
{
  "status": 500,
  "title": "An unexpected error occurred"
}
```

And the terminal shows the real story: a `fail:` line from `Catalog.Api.GlobalExceptionHandler` with the full `DbUpdateException` and its stack trace underneath.

> 🎓 One more to test this. Put `throw new Exception("KABOOOOOM!");` as the first line of `GetAllAsync` in `ProductService`, run, and load the products. A clean `500` for the client, and the explosion in your log. Then take that test bomb out again, before you forget it's there!

## 5. Business rules

The handler cleaned up how the `categoryId: 999` failure looks, but a `500` says the server broke, and that's a bit dramatic. The server is fine. The client sent a reference to a category that doesn't exist. That's a client error, so it should be a `400`, with a message that says what to fix.

No annotation can know which categories exist. That answer lives in the database, and the layer that talks to the database with business logic is the service. So this check is service code: fetch the category, and if it's not there, throw the exception we just built.

There's a bonus. To check the category exists, the service has to fetch it, so after the check it's holding the category, loaded and ready. Remember the extra read after creating a product last lesson, just to have the category for the response? We don't need it anymore. We hand the category we already have to the product, Entity Framework fills in the foreign key from it (the same move the seeder makes), and the second fetch is gone.

To fetch categories, `ProductService` needs a second repository, an `IRepository<Category>`, asked for in the constructor like anything else it depends on.

> 🎓 Update `Catalog.Api/Services/ProductService.cs`. The constructor gains the second repository, and `CreateAsync` gains the check and loses the re-fetch:

```csharp
    private readonly IRepository<Product> _products;
    private readonly IRepository<Category> _categories;

    public ProductService(IRepository<Product> products, IRepository<Category> categories)
    {
        _products = products;
        _categories = categories;
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category is null)
        {
            throw new BadRequestException($"There is no category with id {dto.CategoryId}");
        }

        var product = new Product
        {
            Title = dto.Title,
            Price = dto.Price,
            Category = category
        };

        _products.Add(product);
        await _products.SaveChangesAsync();

        return ToDto(product);
    }
```

Note: you'll need `using Catalog.Api.Exceptions;` at the top of the file.

`CreateAsync` now fetches the category first (`_categories.GetByIdAsync(dto.CategoryId)`). If it's not there, it throws a `BadRequestException` with a message written for a human, and stops: nothing gets added, nothing gets saved, and the handler turns the throw into a clean `400`. If it is there, the product gets `Category = category`, the loaded object. Because the navigation property is already set, `ToDto` can map the category straight away, so the second fetch is gone.

`UpdateAsync` can get the same treatment.

> 🎓 Change `UpdateAsync` yourself. It keeps the lookup and the `return null` for a product that isn't there (that's still a `404`, the address was wrong), then does the same category check as create, assigns `Category = category` instead of `CategoryId`, saves, and returns `ToDto(product)` straight away, without the re-fetch and its `updated!`.
>
> <details>
> <summary>👀 After you're done, click here to see the answer.</summary>
>
> ```csharp
> public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
> {
>     var product = await _products.GetByIdAsync(id);
>     if (product is null) return null;
>
>     var category = await _categories.GetByIdAsync(dto.CategoryId);
>     if (category is null)
>     {
>         throw new BadRequestException($"There is no category with id {dto.CategoryId}");
>     }
>
>     product.Title = dto.Title;
>     product.Price = dto.Price;
>     product.Category = category;
>     await _products.SaveChangesAsync();
>
>     return ToDto(product);
> }
> ```
>
> </details>

> 🎓 Run `dotnet build`, then check the whole file against this:

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

    public ProductService(IRepository<Product> products, IRepository<Category> categories)
    {
        _products = products;
        _categories = categories;
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
        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category is null)
        {
            throw new BadRequestException($"There is no category with id {dto.CategoryId}");
        }

        var product = new Product
        {
            Title = dto.Title,
            Price = dto.Price,
            Category = category
        };

        _products.Add(product);
        await _products.SaveChangesAsync();

        return ToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _products.GetByIdAsync(id);
        if (product is null) return null;

        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category is null)
        {
            throw new BadRequestException($"There is no category with id {dto.CategoryId}");
        }

        product.Title = dto.Title;
        product.Price = dto.Price;
        product.Category = category;
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
        }
    };
}
```

We didn't have to touch `Program.cs`. The constructor now asks for an `IRepository<Category>`, and the open generic registration (`AddScoped(typeof(IRepository<>), typeof(Repository<>))`) already covers it.

And the controller isn't involved either. It doesn't know the rule exists. The service throws, the handler answers, and the controller stays as thin as it should be. _A service never picks a status code._ It throws something that carries one.

> 🎓 Run the app and send the Smart Fridge at category 999 one last time:

```json
{
  "status": 400,
  "title": "There is no category with id 999"
}
```

See? A `400`, with a message that tells the client exactly what to fix.

"Hang on," I hear you think. "The category was not found. Isn't 'not found' a `404`?" Nice try, but no. A `404` is about the address, the URL. `POST api/products` is a perfectly real address, so the request arrived fine. The problem is inside the body the client sent: it refers to something that doesn't exist, which makes it bad data, which is a `400`. Compare `GET api/products/999`, where the missing thing is the URL itself. That one is really not found.

## 6. The error reaches the browser

The backend got a lot stricter today, and because we've prepared the frontend for all this already, it doesn't need anything new. Every request already checks `response.ok`, and when it's not ok, `errorFromResponse` pulls the server's message out of the problem-details body and throws it. The page's save handlers catch that and put the message in the `saveError` line next to the form. So a stricter server just means better messages, arriving through a path that already exists.

Let's watch it happen. The form guards against an empty category before it submits, so to see the server's own refusal we have to let a bad request through on purpose.

> 🎓 In `ClientApp/src/features/products/ProductForm.tsx`, temporarily remove the `categoryId === 0` part of the submit guard, so the form will submit with no category chosen. Then, in the app, add a product with the dropdown left on "Choose a category".

The save fails, and a message appears next to the form:

```
There is no category with id 0
```

And even though we disabled the check in the frontend, nothing bad happened. The data stayed clean, because the server always checks.

> 🎓 Put the `categoryId === 0` check back. Sending `categoryId: 0` to the server on every empty submit is still bad.

Some work remains for later. The message that came through so cleanly was one you wrote by hand. The framework's own validation errors are different: you saw that an empty title produces a `400` with an `errors` object, a message per field. But `errorFromResponse` reads only the top-level `title`, not that object, so an annotation failure surfaces as the generic "One or more validation errors occurred." rather than the specific field problem. We will improve that in an upcoming lesson.

## Where this goes next

The API can now say *no*, in the right words, with the right codes. We have some improvements left to do, but it's a good start.

Next lesson we go back to the data model and finish it. There's one relationship type we haven't met, the many-to-many, where a product can carry several tags and a tag belongs to several products.

## Resources

- Microsoft's overview of model validation and the built-in annotations, for the full list beyond `Required`, `StringLength`, and `Range`. https://learn.microsoft.com/aspnet/core/mvc/models/validation
- Microsoft's docs on handling errors in web APIs, including `IExceptionHandler` and problem details. https://learn.microsoft.com/aspnet/core/fundamentals/error-handling
- Microsoft's docs on logging, for log levels, categories, and providers. https://learn.microsoft.com/aspnet/core/fundamentals/logging
- MDN's full reference of HTTP status codes, for everything the table above left out. https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- OWASP on SQL injection, if you want the deep version of section 3. https://owasp.org/www-community/attacks/SQL_Injection
- The xkcd comic. https://xkcd.com/327/

## Applying this to your project

The team half is the `Exceptions` folder, `GlobalExceptionHandler.cs` and the three lines in `Program.cs`: one copy, built together. Nobody writes a `try` and `catch` in a service. Every module throws, the handler answers.

For your module, add annotations to your create and update DTOs, and a service check for every id your request DTO carries, the way create and update did in this lesson. Put the requests that should fail in your `.rest` file and check that they do.

Then the rules from your backlog. Rules about the data (the thing is already out, the tasting is full, the end is before the start) go in your service now, as a `BadRequestException`. Rules about who is asking (the owner, the role) wait for the authentication lessons.

Your frontend should already be able to handle all this: the message from your `BadRequestException` should land in `saveError` next to your form. Check it by breaking one of your own rules from the app. This is stuff you should demo during your final presentation, so this is a good rehearsal.