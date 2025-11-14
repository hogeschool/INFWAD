# Lecture notes: 1.10 - Back-end: Repository Pattern, Minimal APIs, and Controllers

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## 1. The Repository Pattern
### 1.1 Why do we need a Repository?

When using Entity Framework (EF), it’s tempting to inject your DbContext directly into controllers or services. However, that makes your data access logic tightly coupled to EF. If you ever change your data provider (e.g., Dapper, MongoDB, etc.), the rest of your application breaks.

### 1.2 The Repository Pattern provides:

A clean abstraction between business logic and data persistence.
Separation of Concerns (Single Responsibility Principle).
Testability, because we can mock repositories for unit testing.
Consistency — all CRUD operations follow a common interface.
Single Responsibility Principle : Each class or module should have one, and only one, reason to change.

```cs
using System.Linq.Expressions;

public interface IRepository<T> where T : class
{
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
    IEnumerable<T> GetAll();
    T? GetById(object id);
    IEnumerable<T> Find(Expression<Func<T, bool>> predicate);
    IQueryable<T> Query(); // for advanced filtering, joins, grouping
    int SaveChanges();
}
```

Add, Update, and Delete mark changes but do not commit immediately.

This follows SRP, the repository shouldn’t decide when to save, that’s a unit of work or service decision.

SaveChanges() commit all pending changes as a single transaction.

Query() exposes IQueryable for LINQ operations (projection, joins, grouping, etc.) Later maybe used in services

Find() accepts an Expression<Func<T,bool>>, allowing EF to translate the filter to SQL (not in-memory).

```cs
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

public class Repository<T> : IRepository<T> where T : class {
    private readonly AppDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context) {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public void Add(T entity) => _dbSet.Add(entity);
    public void Update(T entity) => _dbSet.Update(entity);
    public void Delete(T entity) => _dbSet.Remove(entity);
    public IEnumerable<T> GetAll() => _dbSet;
    public T? GetById(object id) => _dbSet.Find(id);
    public IEnumerable<T> Find(Expression<Func<T, bool>> predicate)
        => _dbSet.Where(predicate);
    public IQueryable<T> Query() => _dbSet.AsQueryable();
    public int SaveChanges() => _context.SaveChanges();
}
```

## 2. Minimal API — Routing & Binding

For this part we need to create a new (minimal) (web) API We will use dotnet new web for instead of using dotnet new webapi with a lot of scaffolding (extra code).

```cs
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Urls.Add("http://localhost:5555");

// 1. GET with route params
app.MapGet("/user/{id}/details/{code}", (int id, string code)
    => Results.Ok($"UserId: {id}, Code: {code}"));

// 2. GET with query params
app.MapGet("/search", (string term, int limit)
    => Results.Ok($"Search Term: {term}, Limit: {limit}"));

// 3. POST with JSON body
app.MapPost("/jsonbody", (KeyValue obj)
    => Results.Ok($"Received: {obj.Key}={obj.Value}"));

// 4. POST with route + query + body
app.MapPost("/order/{orderId}/add", (
    int orderId,
    [FromQuery] decimal discount,
    [FromBody] OrderItem item
) => Results.Ok($"OrderId={orderId}, Product={item.ProductId}, Qty={item.Quantity}, Discount={discount}"));

// 5. POST with form data
app.MapPost("/form", async (HttpRequest req) =>
{
    var form = await req.ReadFormAsync();
    return Results.Ok($"Form Received: {form["key"]}={form["value"]}");
});

app.Run();

record KeyValue(string Key, int Value);
record OrderItem(int ProductId, int Quantity);
```

We can test these GET and POST endpoints using rest client, Install REST Client Extension by Huachao Mao, or PostMan.

Create .rest file with following contents to test each endpoint

> .rest
```cs
### GET with route params
GET http://localhost:5555/user/42/details/abc

### GET with query params
GET http://localhost:5555/search?term=apple&limit=5

### POST JSON body
POST http://localhost:5555/jsonbody
Content-Type: application/json

{
  "key": "Alpha",
  "value": 99
}

### POST URL + query + body
POST http://localhost:5555/order/10/add?discount=5
Content-Type: application/json

{
  "productId": 2,
  "quantity": 4
}

### POST form body
POST http://localhost:5555/form
Content-Type: application/x-www-form-urlencoded

key=FormKey&value=123
```

Moving to Controllers, Database, and Repository Injection
for EF/database add the following packages

```
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

Copy over Model and Data Folders containing entity classes and context class.

Change your Program.cs

```cs
var builder = WebApplication.CreateBuilder(args);

//1. Connection string from appsettings.json
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

//2. Register repository as service
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

//3. Add Controllers
builder.Services.AddControllers();

var app = builder.Build();

//4. Map Controller
app.MapControllers();

app.Run();
```


in the Controllers/ folder add:

```cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IRepository<Product> _repo;
    public ProductController(IRepository<Product> repo) => _repo = repo;

    [HttpGet]
    public IActionResult GetAll() => Ok(_repo.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var product = _repo.GetById(id);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpPost]
    public IActionResult Add(Product product)
    {
        _repo.Add(product);
        _repo.SaveChanges();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Product product)
    {
        if (id != product.Id) return BadRequest();
        _repo.Update(product);
        _repo.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var product = _repo.GetById(id);
        if (product == null) return NotFound();
        _repo.Delete(product);
        _repo.SaveChanges();
        return NoContent();
    }
}
```