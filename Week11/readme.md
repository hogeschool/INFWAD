# Lecture notes: Week 11 - Back-end: Controllers, services, and dependency injection

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## 1. Recap of Database and EF

Before we introduce Controllers and Services, let’s quickly recap what we covered in the previous units.

### 1.1 Entity Framework (EF Core) Basics

We built a simple data access layer using:
- Model classes (Customer, Product, Order, OrderDetail, etc.)
- DbContext to represent the database connection and tables (DbSet\<T\>)
- Migrations using

```
dotnet ef migrations add InitialCreate
dotnet ef database update
```

which generated our schema automatically.

### 1.2 LINQ Queries
We practiced writing database queries using:

- Query syntax
```cs
var q = from p in _context.Products
        where p.Price > 50
        select p;
```

- Method syntax
```cs
var q = _context.Products
    .Where(p => p.Price > 50)
    .ToList();
```
LINQ is important because EF can translate these expressions into SQL.

### 1.3 Repository Design Pattern
We introduced the Repository Pattern to separate data access from business logic. Why?

- Prevent controllers from talking to EF directly
- Avoid duplicated CRUD logic across controllers
- Increase testability
- Create a clean abstraction, aligned with SOLID (especially SRP and DIP)

We defined a generic repository:

```cs
public interface IRepository<T> where T : class
{
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
    IEnumerable<T> GetAll();
    IEnumerable<T> GetBy(Expression<Func<T, bool>> predicate);
    T? GetById(params object[] keyValues);
    IQueryable<T> Query();
    int SaveChanges();
}
```

We then registered the repository in DI:

```cs
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
```

This allowed Minimal APIs and Controllers to request IRepository<Product> or IRepository<Order> automatically.

## 2. Recap of Endpoints in Minimal API
Before using Controllers, we wrote endpoints directly in Program.cs using Minimal API.

```cs
app.MapGet("/user/{id}", (int id) => Results.Ok(id));
app.MapPost("/json", (MyObject obj) => Results.Ok(obj));
```
Minimal API is lightweight, but:
- It becomes messy as the project grows
- No built-in validation
- No automatic binding errors
- Harder to test
- Harder to organize

This leads naturally to using Controllers.

## 3. Introducing Controllers
Controllers are classes that handle HTTP requests in an organized, structured way.

### 3.1 Basic Controller
```cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class SimpleController : ControllerBase
{
    [HttpGet]
    public string Hi() => "Hi";
    
    [HttpPost("echo")]
    public IActionResult Echo([FromBody] Object obj){
      return Ok($"Received: Key = {obj}");
    }
}
```

```[Route("[controller]")]``` means that controller name: SimpleController and route name: simple.

So the endpoints are:

```cs
GET /simple` 
or 
GET http://localhost:5050/simple
###

POST http://localhost:5050/simple/echo
Content-Type: application/json
{
  "Key": "SomeKey",
  "Value": 11,
  "Extra":"Some Extra Information"
}
###
```

### 3.2 Understanding Controller Attributes

```[ApiController]``` Adds automatic behavior:

- Model validation
- Parameter binding from body, route, query automatically
- Better error messages
- Required parameters enforced

It is highly recommended for any web API.

```[Route]``` Defines base URL for the controller.
Common patterns:
```
[Route("[controller]")]
[Route("api/[controller]")]
[Route("api/products")]
```

```[controller]``` is replaced with the controller name (minus “Controller”).

```
[HttpGet], [HttpPost], [HttpPut], [HttpDelete]
```
Specifies which HTTP method the function responds to.

Examples:

- ```[HttpGet("{id:int}")]``` - Matches /simple/4 - {id:int} enforces integer constraint

- ```[HttpPost("echo")]``` - Matches /simple/echo

- ```[FromBody], [FromQuery], [FromRoute]```
Indicates where the parameter value comes from.

- ```[FromBody]``` → JSON body

- ```[FromQuery]``` → ?min=10&max=20

- ```[FromRoute]``` → /product/14

With ```[ApiController]```, many are inferred automatically.

### 3.3 ControllerBase vs Controller

ControllerBase:

- For Web APIs
- No View support
- Lightweight

Controller:

- For MVC apps (Views + APIs)
- Includes View rendering (View())
- We use ControllerBase for all pure API projects.

### 3.4 Return Types in Controllers

- ```IActionResult``` A general type representing HTTP responses (200, 404, 500, etc.)

- ```ActionResult<T>``` A strong typed version:

- ```ActionResult<Product>``` Allows returning either a Product or a StatusCode.

- ```Task<IActionResult>``` Used when the method is asynchronous.

- ```IResult``` Minimal API equivalent. Not used in Controllers.

## 4. Bad Example: ProductController Using IRepository Directly
This is intentionally not recommended, but useful for teaching.

Why it is bad?
- Business logic leaks into controller
- Violates SRP (single responsibility principle) (controller now handles routing and business logic and validation)
- Hard to test
- Hard to mock
- If repository changes → all controllers break

```cs
// BAD EXAMPLE — DO NOT DO THIS IN REAL PROJECTS
[ApiController]
[Route("[controller]")]
public class ProductController : ControllerBase
{
    private readonly IRepository<Product> _repo;

    public ProductController(IRepository<Product> repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public IActionResult GetAll()
        => Ok(_repo.GetAll());

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
    {
        var p = _repo.GetById(id);
        return p == null ? NotFound() : Ok(p);
    }

    [HttpPost]
    public IActionResult create([FromBody] ProductDto dto)
    {
        // business logic in controller = bad
        var product = new Product { Name = dto.Name, Price = dto.Price };

        _repo.Add(product);
        _repo.SaveChanges();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    // etc...
}
```
DTOs: It is recommended to create DTOs as we seldom accept raw entity objects from API.

```cs
public record ProductDto(string Title, decimal Price, int CategoryId);
```

## 5. Introducing Services (Good Design)
The service contains business logic: Validation, Business rules such as (Price rules, Discount rules, Category checks, Inventory checks), Mapping DTOs, Coordinating multiple repositories.

This is the correct layering:

Controller → Service → Repository → DbContext

The controller becomes clean, readable, minimal.

```cs
public interface IProductService
{
  IEnumerable<Product> GetAll();
  Product? GetById(int id);
  IEnumerable<Product> GetByTitle(string title);
  Product Create(ProductDto productDto);
  Product? Update(int id, ProductDto productDto);
  bool Delete(int id);
  bool DeleteByCategory (int CategoryId);
}

public class ProductService : IProductService
{
  private readonly IRepository<Product> _productRepo;

  public ProductService(IRepository<Product> repository)
  {
    _productRepo = repository;    
  }
  public Product Create(ProductDto productDto)
  {
    var product = new Product
    {
      Title =productDto.Title,
      Price = productDto.Price,
      CategoryId = productDto.CategoryId 
    };

    _productRepo.Add(product);
    _productRepo.SaveChanges();
    return product;
  }

  public bool Delete(int id)
  {
    var x = _productRepo.GetById(id);
    if(x==null) return false;
    
    _productRepo.Delete(x);
    _productRepo.SaveChanges();
    return true;

  }

  public bool DeleteByCategory(int CategoryId)
  {
    var productList = _productRepo.GetBy(_=>_.CategoryId==CategoryId).ToList();
    if(productList.Count<=0) return false; 
    productList.ForEach(_=>_productRepo.Delete(_));
    if(_productRepo.SaveChanges()<=0) return false;    
    return true;
  }

  public IEnumerable<Product> GetAll() => _productRepo.GetAll();
  

  public Product? GetById(int id) => _productRepo.GetById(id);

  public IEnumerable<Product> GetByTitle(string title)
   => _productRepo.GetBy(p => p.Title.Contains(title));
  

  public Product? Update(int id, ProductDto productDto)
  {
    var x = _productRepo.GetById(id);
    if(x==null) return null;
    
      x.Title =productDto.Title;
      x.Price = productDto.Price;
      x.CategoryId = productDto.CategoryId; 

    _productRepo.Update(x);
    _productRepo.SaveChanges();

    return x;
  }
}
```

```cs
using Microsoft.AspNetCore.DataProtection.Repositories;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class ProductController: ControllerBase
{

  private readonly IProductService _productService;

  public ProductController(IProductService productService)
  {
   _productService = productService; 
  }

  [HttpGet("")]
  public ActionResult<IEnumerable<Product>> GetAll() {
    return Ok(_productService.GetAll());
  }
  [HttpGet("{id:int}")]
  public ActionResult<Product> GetById(int id)
  {
    var x = _productService.GetById(id);
    if(x==null) return NotFound();
    return Ok(x);
  }

  [HttpGet("name/{name}")]
  public ActionResult<IEnumerable<Product>> GetByName(string name)
  {
    var x = _productService.GetByTitle(name);
    if(x==null) return NotFound();
    return Ok(x);
  }
  
  [HttpPost("")]
  public ActionResult<Product> Create([FromBody] ProductDto p )
  {
    return Ok(_productService.Create(p));    
  }

  [HttpPut("{id:int}")]
  public ActionResult<Product> Update(int id, [FromBody] ProductDto p )
  {
    var x = _productService.Update(id, p);
      return x==null? NotFound(): Ok(x);
    
  }

  [HttpDelete("{id:int}")]
  public ActionResult Delete(int id )
  {
    return _productService.Delete(id)? Ok(): NotFound();
  }

  [HttpDelete("Category/{id:int}")]
  public ActionResult DeleteByCat(int id )
  {
    return _productService.DeleteByCategory(id)? Ok(): NotFound();
  }
  
}
```

Important: Program.cs also need to be updated for the dependency injection and service registration.
```cs
builder.Services.AddScoped<IProductService, ProductService>();
```

### 5.1 Service Lifetimes (DI basics)
ASP.NET Core uses Dependency Injection (DI) to create objects.

Transient:
```cs
builder.Services.AddTransient<IEmailSender, EmailSender>();
```
- New instance every time requested
- Lightweight stateless services
- Example: EmailSender, random number generator, short-lived utilities

Scoped (MOST COMMON):
```cs
builder.Services.AddScoped<IProductService, ProductService>();
```
- One instance per HTTP request
- Perfect for business logic
- Repositories and DbContext are also scoped

Singleton:

```
builder.Services.AddSingleton<ICache, MemoryCache>();
```
- Created once for entire app lifetime
- Good for caching, configuration, or static data
- Never use DbContext or repositories as Singleton

## 6. Order Processing Example.

Putting things together, In the following example we are presenting order processing, highlighting the flow of controller, services, repositories, and DTOs etc.

```cs
//1. Define DTOs
public record OrderItemDto(int ProductId, int Quantity);

public record OrderCreateDto(
    int CustomerId,
    List<OrderItemDto> Items,
    decimal DiscountPercentage
);
```

```cs
//2. Define Interface OrderProcessingService
public interface IOrderProcessingService
{
    Order ProcessOrder(OrderCreateDto dto);
}
```

```cs
//3. Implementation OrderProcessingService
public class OrderProcessingService : IOrderProcessingService
{
    //Various Repositories required to process an order
    private readonly IRepository<Customer> _customers;
    private readonly IRepository<Product> _products;
    private readonly IRepository<Order> _orders;
    private readonly IRepository<OrderDetail> _details;

    public OrderProcessingService(
        IRepository<Customer> customers,
        IRepository<Product> products,
        IRepository<Order> orders,
        IRepository<OrderDetail> details)
    {
        _customers = customers;
        _products = products;
        _orders = orders;
        _details = details;
    }

    public Order ProcessOrder(OrderCreateDto dto) {
        // 3.1. Validate customer
        var customer = _customers.GetById(dto.CustomerId);
        if (customer == null)
            throw new Exception("Customer not found");

        // 3.2. Validate each product
        var order = new Order
        {
            CustomerId = dto.CustomerId,
            OrderDate = DateTime.UtcNow,
            //Total = 0
        };

        _orders.Add(order);
        _orders.SaveChanges(); // Must save to get OrderId

        decimal runningTotal = 0m;

        foreach (var item in dto.Items)
        {
            var product = _products.GetById(item.ProductId);
            if (product == null)
                throw new Exception($"Product ID {item.ProductId} not found");

            decimal lineTotal = product.Price * item.Quantity;
            runningTotal += lineTotal;

            // Create order detail
            var detail = new OrderDetail
            {
                OrderId = order.Id,
                ProductId = product.Id,
                Quantity = item.Quantity,
                //LineTotal = lineTotal
            };

            _details.Add(detail);
        }

        // 3.3. Apply discount
        if (dto.DiscountPercentage > 0)
            runningTotal = runningTotal - (runningTotal * dto.DiscountPercentage / 100);

        //order.Total = runningTotal;

        _orders.Update(order);
        _orders.SaveChanges();

        return order;
    }
}
```

```cs
// 4. Register the service (in program.cs)
builder.Services.AddScoped<IOrderProcessingService, OrderProcessingService>();
```

```cs
//5. Controller
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly IOrderProcessingService _service;

    public OrderController(IOrderProcessingService service)
    {
        _service = service;
    }

    [HttpPost]
    public ActionResult<Order> CreateOrder([FromBody] OrderCreateDto dto)
    {
        try
        {
            var order = _service.ProcessOrder(dto);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id:int}")]
    public IActionResult GetOrder(int id, [FromServices] IRepository<Order> repo)
    {
        var order = repo.GetById(id);
        return order == null ? NotFound() : Ok(order);
    }
}
```

Test the controller:

```cs
### Create Order
POST http://localhost:5555/api/order
Content-Type: application/json

{
  "customerId": 1,
  "discountPercentage": 10,
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}

### Get Order by ID
GET http://localhost:5555/api/order/1
```

Have fun playing around and never stop learning.