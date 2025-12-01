# Lecture notes: Week 13 - Back-end: Middleware, Filters & Application Pipeline in ASP.NET Core

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## Recap
Earlier on we had:

A frontend:
- React app frontend (separate project, localhost:3000)

And a backend:
- EF Core (Context Class and Entity Classes)  and LINQ
- Repository Pattern (IRepository<T>) for CRUD operation
- Minimal API bootstrap (Program.cs)
- Controllers (ProductController, etc.) 
- Services (ProductService) and Dependency injection

## Agenda
In this lecture we will cover: 
- Middleware fundamentals
- Pipeline ordering
- Built-in middleware
- Custom middleware
- Filters (Action + Exception)
- CORS
- Cookies + Sessions
- Authentication + Authorization (JWT)

## 1. Middleware:
A software component placed in the HTTP request pipeline that can inspect, modify, or short-circuit requests and responses.
When an ASP.NET Core app receives an HTTP request, it passes through a series of components that are responsible for processing the request and generating a response. These components are called middleware. ASP.NET Core includes a set of built-in middleware, and you can also create custom middleware to handle specialized requirements.

Middleware can:
- Inspect request
- Modify request/response
- Block request
- Authenticate/Authorize
- Add headers
- Logging, rate limiting, routing
- Call next component

### Types of Middleware Methods
ASP.NET Core exposes 3 methods to register middleware:
- `app.Use()` : Most common middleware, it runs code and may call next.
- `app.Run()` : Does NOT call next, ends pipeline, terminal middleware.
- `app.Map()` : Branches pipeline based on URL


### **Hands-On:** Middleware is just a function that:
- Receives HttpContext
- (Usually) calls await next();
- Can stop the pipeline

`HttpContext context`
`Func<Task> next`

#### **Logging to console**
```cs
app.Use(async (context, next) =>
{
    Console.WriteLine($"Request starting → {context.Request.Method} {context.Request.Path}");//Request Pre-processing
    await next(); // Continue to next in pipeline
    Console.WriteLine($"Request finished → {context.Response.StatusCode}");//Request Post-processing
});
```


#### **Logging to Storage**

```cs
app.Use(async (context, next) =>
{
    var logFile = "logs.txt";   // relative to app root

    var start = $"[{DateTime.Now}] → {context.Request.Method} {context.Request.Path}\n";
    await File.AppendAllTextAsync(logFile, start);

    await next();

    var end = $"[{DateTime.Now}] ← Finished {context.Response.StatusCode}\n";
    await File.AppendAllTextAsync(logFile, end);
});
```

#### **Logging to Database**
```cs
// Create a model class for EF
public class RequestLog
{
    public int Id { get; set; }
    public string Method { get; set; } = "";
    public string Path { get; set; } = "";
    public int StatusCode { get; set; }
    public DateTime Timestamp { get; set; }
}

//Update Context
public DbSet<RequestLog> RequestLogs {get;set;}
```
Next, you run Migrations and Update Database (see previous lessons)

Now you can create middleware to log to the DB:
```cs
//Register Middleware
app.Use(async (context, next) =>
{
    var repo = context.RequestServices.GetRequiredService<IRepository<RequestLog>>();

    var log = new RequestLog
    {
        Method = context.Request.Method,
        Path = context.Request.Path,
        Timestamp = DateTime.Now
    };

    await next();

    log.StatusCode = context.Response.StatusCode;

    repo.Add(log);
    repo.SaveChanges();
});

``` 

#### **Intercepting Request**

Examples for securing endpoints:

```cs
app.Use(async (context, next) =>
{
    var adminToken = context.Request.Headers["X-ADMIN"].FirstOrDefault();

    if (!HttpMethods.IsGet(context.Request.Method) && adminToken != "secret")
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsync("Admin token required");
        return; // stop pipeline
    }

    await next();
});
```
The request header must contain X-ADMIN: secret
```rest
POST http://localhost:5050/simple/echo
X-ADMIN: secret
Content-Type: application/json

{
  "Key" : "Whatever",
  "Value" : 1
}
###
```

#### **Logging — BUILT-IN and CUSTOM**
ASP.NET Core logs automatically if configured in appsettings.json.
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```
This enables: Request start/stop logs, Routing logs, EF Core SQL logs
You view these logs in: Console, Debug window, Any configured logging provider

#### **LoggingMiddleware Class**
A middleware class must follow a very strict contract defined by ASP.NET Core:

If a class takes a RequestDelegate in the constructor and exposes a public method named Invoke or InvokeAsync, ASP.NET Core recognizes it as middleware.

```cs
public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        _logger.LogInformation($"→ {context.Request.Method} {context.Request.Path}");

        await _next(context);

        _logger.LogInformation($"← {context.Response.StatusCode}");
    }
}
```
Registering the middleware, `app.UseMiddleware<LoggingMiddleware>();` The framework, not you, injects _next. DI injects _logger.

If you REMOVE await _next(context); 
- Pipeline stops, 
- No controllers run,
- Response ends here
- It becomes a TERMINAL middleware (like Run)

### CORS Middleware
This is needed to allow your backend to receive requests from the front-end if it is running on a different host/port.

CORS = Cross-Origin Resource Sharing
Required when React frontend calls ASP.NET API.

```cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", p =>
        p.WithOrigins("http://localhost:3000") //This is where your react app is running
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});
```
`app.UseCors("ReactPolicy");`

**CORS MUST BE BEFORE AUTH!**
The correct sequence is as follows
- UseRouting
- UseCors
- UseAuthentication
- UseAuthorization
- MapControllers

CORS cannot be fully tested in REST client

```rest
OPTIONS http://localhost:5000/products
Origin: http://localhost:3000
###
```

#### HTTPS Redirection Middleware
app.UseHttpsRedirection();
works only if the application is correctly configured on HTTP and HTTPS
#### Cookies Middleware
Writing Cookie:
```cs
app.MapGet("/setcookie", (HttpContext ctx) =>
{
    ctx.Response.Cookies.Append("theme", "dark");
    return Results.Ok("Cookie set");
});
```
Reading cookie:
```cs
app.MapGet("/getcookie", (HttpContext ctx) =>
{
    var t = ctx.Request.Cookies["theme"];
    return Results.Ok(t ?? "no cookie");
});
```

```rest
GET http://localhost:5050/setcookie
###
GET http://localhost:5050/getcookie
###
```

#### Session Middleware

```cs
builder.Services.AddSession();
app.UseSession();
```
#### JWT (optional)

##  2. Filter
Filters only apply when using Controllers, not minimal APIs. Filters run inside MVC pipeline, not middleware. Filters run after routing, Globally, OR on Selected Controllers/ OR on Actions
for MVC only.
Types:
- Authorization Filter
- Resource Filter
- Action Filter
- Exception Filter
- Result Filter

### **ACTION FILTER** The Most Common One,  Runs code before and after the controller action for 
- Logging action execution
- Validating model state
- Modifying action parameters
- Changing the returned result

```cs
using Microsoft.AspNetCore.Mvc.Filters;
public class LogActionFilter : IActionFilter {
    public void OnActionExecuting(ActionExecutingContext context) {
        Console.WriteLine($"Before executing {context.ActionDescriptor.DisplayName}");
    }
    public void OnActionExecuted(ActionExecutedContext context) {
        Console.WriteLine($"After executing {context.ActionDescriptor.DisplayName}");
    }
}
```
- 1. Globally: to all controllers

```cs
builder.Services.AddControllers(options => options.Filters.Add<LogActionFilter>());
```

- 2. Controller Level: applies to ALL methods within the controller, 
While registering for NON Global (i.e for Controller or for Action, you need to provide dependency injections as follows)
`builder.Services.AddScoped<AdminFilter>();`
instead of registering it globally with AddControllers.

```cs
[ServiceFilter(typeof(LogActionFilter))]
public class ProductController : ControllerBase {}
```

- 3. Action Level: apply only to one method

```cs
[ServiceFilter(typeof(LogActionFilter))]
[HttpGet("{id}")]
public IActionResult GetOne(int id)
```

### **AUTHORIZATION FILTER** 

Used to allow/block access before model binding.

```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class AdminFilter : IAuthorizationFilter{
    public void OnAuthorization(AuthorizationFilterContext context) {
        var token = context.HttpContext.Request.Headers["X-ADMIN"].FirstOrDefault();

        if (token != "secret"){
            context.Result = new UnauthorizedResult();
        }
    }
}```

