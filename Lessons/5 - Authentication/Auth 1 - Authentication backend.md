# Authentication 1: Authentication backend

In December 2009 a company called RockYou, which made little games and widgets for social networks, was broken into. Thirty-two million accounts walked out the door, and the passwords went with them, because RockYou had stored every single one as plain text. Not hashed, not scrambled, nothing. Just a column in a table, next to the email address. That list is still in circulation, all these years later, as a standard tool for anyone who breaks into things, because people reuse passwords and the list tells you what people actually type. (The most common entry was `123456`. Second place went to `12345`. Humanity, ladies and gentlemen.)

I'm not telling you this to make you pick better passwords, though please do. I'm telling you because your API is about to get a users table, and what you put in it is a decision with consequences that outlive the project. Since React lesson six the login has been theatre: type anything, you're in, and the "user" is a plain object in localStorage that anyone with F12 can edit. I've been saying the real thing comes at the end of the course, and here we are. Two lessons. Today the backend learns who someone is, and learns to refuse everyone it doesn't know. Next lesson the React app catches up and the mock retires.

This lesson has more explaining in it than the last few, the way the second half of ASP.NET lesson two did. That's on purpose. The code for authentication is maybe two hundred lines and you could paste it from any tutorial. A real project would not write it at all: it would use ASP.NET Core Identity, or leave the login to a provider like Google or Microsoft. We build it by hand, once, so you know what those tools do for you. What matters is the reasoning underneath: why a password is hashed and what a hash even is, what a token proves and what it doesn't, and where a check has to sit before it counts. Get the reasoning wrong and correct code will not save you. At the final assessment you'll be asked to explain your auth flow end to end, out loud, and "I copied it" is not an explanation.

## What changes this lesson

```
Catalog.Api/
  Controllers/
    AuthController.cs         (new: register and login)
    ProductsController.cs     (locked, and delete is for managers only)
    CategoriesController.cs   (locked)
    TagsController.cs         (locked)
  Data/
    AppDbContext.cs           (a Users table, and a rule that usernames are unique)
    SeedData.cs               (two users, passwords hashed)
  Dtos/
    AuthDtos.cs               (new)
  Exceptions/
    AppException.cs           (one more member: UnauthorizedException)
  Models/
    User.cs                   (new)
  Repositories/
    IUserRepository.cs        (new: the first repository with a method of its own)
    UserRepository.cs         (new)
  Services/
    IAuthService.cs           (new)
    AuthService.cs            (new)
    ITokenService.cs          (new)
    TokenService.cs           (new)
  Program.cs                  (two packages' worth of setup, two lines of middleware)
  appsettings.json            (a signing key)
  auth.rest                   (new)
  products.rest               (every request now carries a token)
  categories.rest             (same)
  tags.rest                   (same)
```

One new entity, one migration, two new packages, and a whole new slice from model to controller. And once again `ClientApp` is not in the tree. One warning about that up front: by the end of this lesson the API refuses every request without a valid token, and the React app has no idea what a token is. So from the moment you lock the doors until next lesson, the frontend shows its error state. That is expected, not broken, and it's the same gap we had between ASP.NET lessons one and three, when the backend existed and the frontend hadn't heard about it yet.

## 1. Two questions

Every request that reaches a server holding anything worth protecting has to answer two questions. Who are you? And, given who you are, are you allowed to do this? The first is authentication and the second is authorization. They sound alike, they get confused constantly (the status code for the first one is literally named `Unauthorized`, a naming accident we filed away in ASP.NET lesson six), but they're different jobs done at different moments.

Authentication happens once, at login. You prove you are who you say, usually with a password, and the server is convinced. The trouble is that HTTP has no memory. The request that fetches the products after you log in is a complete stranger to the request that logged you in. The server has no idea they came from the same person. So the proof has to travel with every single request, and that's what a token is: a small note, signed by the server, that says "I checked, this is frodo". The client shows the note, the server checks the signature, and the "who are you?" is answered without a password ever crossing the wire again.

Authorization happens every request, after that. Once the server knows it's frodo, it can decide whether frodo may delete a product. That is a rule, and the rule needs something to go on. In your project case that something is the role: the desk, the committee, whatever your case calls the one role above member. So the role travels in the note as well.

Here's the plan for today, in the order we build it. Store users so a password can be checked, without storing the password. Check it at login and hand back a token. Require the token on every other request. And put the role in the token, so the second question can be answered too.

In the request pipeline from ASP.NET lesson six, those two questions get their own stations, right between CORS and the controllers:

```
request  ->  UseExceptionHandler  ->  UseCors  ->  UseAuthentication  ->  UseAuthorization  ->  Controller  ->  ...
                                                    (who is this?)         (may they?)
```

Between CORS and the controllers there has been room all block. Today we use it.

## 2. Storing passwords without storing passwords

Start from the RockYou question. Suppose your database leaks. What do you want the attacker to find in the password column?

Not the password, obviously. The next idea most people have is "encrypt it", and it is the wrong idea for a reason worth understanding. Encryption is reversible by design: there's a key, and whoever has the key gets the password back. That key has to live on your server, where the database also lives, so an attacker who has one usually has the other. But look at what the server actually needs to do with a password. It never needs to know it. It only ever needs to answer one question: does what the user just typed match what they typed when they registered? For that, you don't need the password back. You need a fingerprint of it.

That's a hash. A hash function takes any input and produces a fixed-size scramble, with two properties that matter here. The same input always gives the same output, and there's no way back: from the scramble you cannot work out the input, except by guessing inputs and checking. So at registration we hash the password and store the hash. At login we hash whatever was typed and compare the two hashes. The plain password exists in memory for a few milliseconds, twice, and is never written anywhere.

Except that a plain hash, like SHA-256, is not good enough on its own, and RockYou's successors learned that the hard way. Two problems.

Hashing is fast. That's a feature everywhere else in computing, and a bug here. A modern graphics card computes billions of SHA-256 hashes per second, so "guess inputs and check" is a perfectly good plan: take the RockYou list, hash every entry, compare against your leaked column, and most of your users fall in seconds.

And the same password gives the same hash for everyone. If forty thousand users share one hash, an attacker doesn't need to crack it to know it's `123456`. Worse, the hashes of every common password can be computed once, in advance, and looked up.

The fixes for both have been known for decades, and the algorithm we use, bcrypt, does both for us. Against the second problem, a salt: a random string, different for every user, mixed into the password before hashing, so two users with the same password get two different hashes and precomputed tables are useless. Against the first, deliberate slowness: bcrypt runs its work in rounds, and the number of rounds is a setting, so hashing one password takes about a tenth of a second. Nobody notices a tenth of a second at login. An attacker trying a billion guesses notices three years.

Here's what a bcrypt hash looks like. I made this one earlier:

```
$2a$11$Vk3M2qPyDh8XwF1nLc6rOeK9dJ5HtBmYQx7ZaRfGsWpNjUvCiEoLm
```

Everything is in that one string. `$2a$` names the algorithm, `11` is the cost (2 to the power 11 rounds, so 2048), the next 22 characters are the salt, and the rest is the hash. So there's no separate salt column to manage and nothing to remember: store the string, and at login the library reads the salt and the cost back out of it and does the same work again.

The library is `BCrypt.Net-Next`, and the whole of it, for our purposes, is two calls.

```csharp
var hash = BCrypt.Net.BCrypt.HashPassword(password);   // at register
var valid = BCrypt.Net.BCrypt.Verify(password, hash);  // at login
```

`HashPassword` generates the salt, does the rounds, and returns the string. `Verify` takes a typed password and a stored hash and answers `true` or `false`. That's the entire surface. The hard part of password storage is knowing why, and now you do.

> 🎓 In `Catalog.Api`, add the package:

```bash
dotnet add package BCrypt.Net-Next --version 4.0.*
```

## 3. The user

Now the entity that holds those hashes. It's an entity like any other, with one rule on top: the column is called `PasswordHash`, on purpose, so nobody reading the code six months from now wonders what's in it.

> 🎓 Create `Models/User.cs`:

```csharp
namespace Catalog.Api.Models;

public class User : IEntity
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "member";
}
```

`Role` is the answer to the second question from section one, stored as plain text. Every user is a `"member"` unless someone says otherwise, and in our catalog the one role above it is `"manager"`. (A string rather than an enum, because it goes into a token as text anyway and comes back out as text. Keep it boring.) In your project, `"manager"` becomes whatever your case calls its role.

### The table, and a rule the database enforces

> 🎓 Rewrite `Data/AppDbContext.cs`:

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
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
    }
}
```

The `Users` set you've seen three times before. The `OnModelCreating` method is where you tell Entity Framework things it can't guess from the class, and the thing here is that two users may never share a username. Our service will check that too, in a minute, the way the tag service checks for a duplicate name. But a check in code can be raced (two registrations for `frodo` arriving in the same millisecond), and a unique index in the database cannot. The index is the rule. The service check is there to give a polite answer before the database has to give a rude one.

> 🎓 Add the migration and apply it (stop the backend first if it's still running):

```bash
dotnet ef migrations add AddUsers
dotnet ef database update
```

No reset this time. Nothing about the existing tables changed, we only added one, so the migration creates it next to the others and your products, categories and tags are untouched.

### Two users to start with

The seeder has one `AnyAsync` check at the top, on products, and it returns early when they exist. That was fine while the seeder owned one family of tables, and it would silently skip our users now, because the products are already there. So the seeder gets two guarded halves instead of one.

> 🎓 Rewrite `Data/SeedData.cs`:

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

        await SeedCatalogAsync(context);
        await SeedUsersAsync(context);
    }

    private static async Task SeedCatalogAsync(AppDbContext context)
    {
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

    private static async Task SeedUsersAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return;
        }

        context.Users.AddRange(
            new User
            {
                Username = "gandalf",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("youshallnotpass"),
                Role = "manager"
            },
            new User
            {
                Username = "frodo",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("secondbreakfast")
            }
        );

        await context.SaveChangesAsync();
    }
}
```

The catalog half is ASP.NET lesson seven's seeder, moved into a method of its own and otherwise untouched. The users half is new: a manager and a member, and notice the passwords are hashed right here in the seed, with the same call the service will use. The plain text exists in this file, which is fine for a demo (and for your project's seed, where your instructor needs to be able to log in as the desk) and is exactly the kind of thing you'd strip out before anything went near the internet.

> 🎓 Run the app once to seed, then stop it. Open `catalog.db` and look at the new `Users` table. Two rows, and in the `PasswordHash` column, two strings starting with `$2a$11$` that look nothing like `youshallnotpass`.

(If start-up felt a hair slower than usual, that was bcrypt, doing its 2048 rounds twice. The slowness that makes it safe, felt once.)

### The first repository with a method of its own

Login has to find a user by username. The generic repository finds by id, and `FindAsync` takes any predicate, so `AuthService` could call `FindAsync(u => u.Username == ...)` itself and pick the first result. But register and login both need this query, and a query that's used in two places should have a name and one home. So the users get a repository of their own, and it's smaller than you'd fear: everything generic is inherited, and the one extra query is added on top.

> 🎓 Create `Repositories/IUserRepository.cs`:

```csharp
using Catalog.Api.Models;

namespace Catalog.Api.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
}
```

> 🎓 Create `Repositories/UserRepository.cs`:

```csharp
using Catalog.Api.Data;
using Catalog.Api.Models;

namespace Catalog.Api.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<User?> GetByUsernameAsync(string username)
        => (await FindAsync(u => u.Username == username)).FirstOrDefault();
}
```

`Repository<User>` does all the usual work, and `GetByUsernameAsync` rides on the inherited `FindAsync`, so `Repository.cs` itself does not change. This is the shape for any entity that needs a query of its own, and it's the first time in the course we've needed it.

One thing we're deliberately not building: a `UsersController`. There is no `GET api/users`, and there will not be. Nothing in the app needs a list of accounts, and not building the endpoint is the cheapest possible way to never leak one.

## 4. Register and login

Now the slice that uses all that. Two endpoints: `POST api/auth/register`, which makes an account, and `POST api/auth/login`, which checks a password and hands back a token. Bottom up, as always. DTOs, an exception, two services, a controller.

### The DTOs

> 🎓 Create `Dtos/AuthDtos.cs`:

```csharp
using System.ComponentModel.DataAnnotations;

namespace Catalog.Api.Dtos;

public record RegisterUserDto
{
    [Required]
    [StringLength(30, MinimumLength = 3)]
    public string Username { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; init; } = string.Empty;
}

public record LoginUserDto
{
    [Required]
    public string Username { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}

public record AuthResponseDto
{
    public string Token { get; init; } = string.Empty;
}
```

Read the differences, because they're the point. The register DTO carries the password policy as annotations, so `[ApiController]` refuses a seven-character password before our code sees it, the way it refused the nameless tag. The login DTO carries `[Required]` and nothing else, so a failed login can never explain the password rules to whoever is trying them. The response DTO is a token and nothing else. And there's no DTO anywhere with a `Role` in it: you don't get to tell the server what your role is, the server tells you.

Nowhere in these three shapes, or in any DTO in this project, does the hash appear, and that is a rule, not a coincidence.

### One more exception

A wrong password is a `401`, and ASP.NET lesson six's table said `401` arrives today. It's the same move as the `409` in ASP.NET lesson seven.

> 🎓 Add one member to `Exceptions/AppException.cs`, below `ConflictException`:

```csharp
public class UnauthorizedException : AppException
{
    public override int StatusCode => StatusCodes.Status401Unauthorized;
    public UnauthorizedException(string message) : base(message) { }
}
```

Four lines, and the handler from ASP.NET lesson six turns it into a clean `401` with our message as the problem-details title. You might wonder why a failed login is an exception and not a `null`, when a missing product is a `null`. The `null` convention means "there's no resource at that id", and a failed login is not that. It's a refusal, with a message meant for the client, and the exception family is how a message reaches the client.

### The token service

Making a token is its own job, so it gets its own class, and `AuthService` gets to stay about credentials. Treat this one as a sealed box for the next ten minutes. We open it in section five, once you've held a real token in your hands.

> 🎓 In `Catalog.Api`, add the token package:

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 10.0.*
```

That's the package that verifies tokens, which is section six. It brings the library that creates them along as a dependency, and `TokenService` needs that one now.

> 🎓 Create `Services/ITokenService.cs`:

```csharp
using Catalog.Api.Models;

namespace Catalog.Api.Services;

public interface ITokenService
{
    string CreateToken(User user);
}
```

> 🎓 Create `Services/TokenService.cs`:

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Catalog.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Catalog.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateToken(User user)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Missing configuration value Jwt:Key");
        var expiryMinutes = _configuration.GetValue<int>("Jwt:ExpiryMinutes");

        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new("unique_name", user.Username),
            new("role", user.Role)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

For now, read the shape: three claims, which is token-speak for facts about the user (who, by id and by name, and which role), a key from configuration, an expiry, a signature. The `?? throw` is ASP.NET lesson three's fail-fast again. A missing signing key should give a clear error, not produce tokens nobody can verify.

> 🎓 Give it the configuration it's asking for. Add a `Jwt` section to `appsettings.json`, next to `Frontend`:

```json
"Jwt": {
  "Key": "dev-only-change-me-this-needs-at-least-32-chars",
  "ExpiryMinutes": 60
}
```

The key needs at least 32 characters, because the signing algorithm wants 256 bits of it. A key in `appsettings.json` is fine for a course project on localhost and wrong for anything else, and where a real key lives is next lesson's business. Sixty minutes is long enough to get work done and short enough that you'll see a token expire on you at some point while you're working on the project, which is instructive.

### The auth service

> 🎓 Create `Services/IAuthService.cs`:

```csharp
using Catalog.Api.Dtos;

namespace Catalog.Api.Services;

public interface IAuthService
{
    Task RegisterAsync(RegisterUserDto dto);
    Task<AuthResponseDto> LoginAsync(LoginUserDto dto);
}
```

> 🎓 Create `Services/AuthService.cs`:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Exceptions;
using Catalog.Api.Models;
using Catalog.Api.Repositories;

namespace Catalog.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokens;

    public AuthService(IUserRepository users, ITokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    public async Task RegisterAsync(RegisterUserDto dto)
    {
        var existing = await _users.GetByUsernameAsync(dto.Username);
        if (existing is not null)
            throw new ConflictException("That username is taken.");

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };
        _users.Add(user);
        await _users.SaveChangesAsync();
    }

    public async Task<AuthResponseDto> LoginAsync(LoginUserDto dto)
    {
        var user = await _users.GetByUsernameAsync(dto.Username);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid username or password.");

        return new AuthResponseDto { Token = _tokens.CreateToken(user) };
    }
}
```

Two methods, and section two's two calls, each in the one place it belongs. `RegisterAsync` checks the username, hashes the password, saves. `LoginAsync` finds the user, verifies the password against the stored hash, and if both hold, asks the token service for a token. Notice what `RegisterAsync` doesn't set: the role. A new account is a member, because the model says so, and the only way to become a manager is for someone with database access to say so. That's the correct amount of trust to put in a registration form, which is none.

Look at the login's one `if` a moment longer. An unknown username and a wrong password get the same message, on purpose. "No such user" would tell whoever is knocking which usernames exist, and that is half of a break-in handed over for free. One message, one status, whichever half was wrong.

### The controller

> 🎓 Create `Controllers/AuthController.cs`:

```csharp
using Catalog.Api.Dtos;
using Catalog.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserDto dto)
    {
        await _auth.RegisterAsync(dto);
        return NoContent();
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginUserDto dto)
        => Ok(await _auth.LoginAsync(dto));
}
```

Thin, as a controller should be. One thing is different from every create you've written: `Register` answers `204 No Content` instead of `201 Created`. A `201` wants a location, an address where the new thing can be fetched, and we decided in section three that there is no such address for a user. So: it worked, nothing to show you, `204`.

### Wiring

> 🎓 In `Program.cs`, add three registrations under the existing services:

```csharp
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
```

The first line is new in kind: until now the open-generic registration from ASP.NET lesson one covered every repository, and it still does, but `AuthService` asks for `IUserRepository` specifically, so that interface needs a line of its own.

### Does it work?

> 🎓 Create `auth.rest` in the project root, next to `products.rest`:

```http
@baseUrl = http://localhost:5088

### Register
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "username": "samwise",
  "password": "po-ta-toes"
}

### Login
# @name login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "username": "samwise",
  "password": "po-ta-toes"
}
```

The `# @name login` line is new. It gives the request a name, and in section six the name is how other requests in a file get at this one's answer.

> 🎓 Start the app with `dotnet watch`, and send the requests in order.

Register: `204 No Content`. Nothing to see, exactly as designed. Login: `200 OK`, and a body like this:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwidW5pcXVlX25hbWUiOiJzYW13aXNlIiwicm9sZSI6Im1lbWJlciIsImV4cCI6MTc5NjI5MjAwMH0.vlqMfMjC2qwgR_NGsCJG4fp-Iq3_VNeVfuRuG9YwD7A"
}
```

Yours is longer, and different. That's a JSON Web Token, and it's the thing the rest of the course runs on. Before we look inside it, break the login a few ways.

> 🎓 Send Register a second time, unchanged. `409 Conflict`, "That username is taken." Now change the login's password to `potatoes` and send it: `401 Unauthorized`, "Invalid username or password." Change the username to `samwis` instead, password back to `po-ta-toes`: the same `401`, the same sentence. Put the username back to `samwise` and send Login once more, so the last answer is a token again. Then try to register `pippin` with the password `pip`: `400`, and the framework's message names the length rule, because the register DTO is allowed to.

> 🎓 One more, and it's the one to remember. Register `pippin` properly, also with the password `po-ta-toes`, and open the `Users` table. Samwise and Pippin have the same password and completely different hashes. That's the salt at work. Their rows tell an attacker nothing about each other.

## 5. What did we just hand out?

Copy the token from your login response and look at it. Two dots, three parts.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOiIzIiwidW5pcXVlX25hbWUiOiJz... . vlqMfMjC2qwgR_NGsCJG4fp-Iq3_VNeVfuRuG9YwD7A
             header                                  payload                                       signature
```

> 🎓 Go to https://jwt.io and paste your token into the decoder. (A development token from your own laptop is fine to paste there. A token from a real system is not, ever. It is a key to that system.)

The first two parts decode into plain JSON. The header says how the token is signed. The payload is our three claims and an expiry:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

```json
{
  "sub": "3",
  "unique_name": "samwise",
  "role": "member",
  "exp": 1796292000
}
```

Two things to take from that. The names are the ones we wrote in `TokenService`, and they're short on purpose: `sub` is the standard name for the subject, the one the token is about, and here that's the user's id. And `exp` is a number of seconds since 1970, one hour after you logged in.

Now the part that matters. Those two parts are base64url, which is an encoding, not encryption. Anyone holding the token can read every claim in it, no key required. So a token never carries a secret: no password, no hash, nothing you wouldn't put on a postcard. It carries facts the server is willing to state about you.

What stops someone from changing those facts is the third part. The signature is a hash (the same idea as section two, wearing different clothes) of the header and the payload, mixed with the server's key. The server, and only the server, has the key, so only the server can produce a valid signature for a given payload. Change one character of the payload and the signature no longer matches. Anyone can read a token. Nobody can edit one, and nobody can make one up.

jwt.io shows "Invalid Signature" under your token, by the way. Nothing is wrong with the token: jwt.io doesn't have our key, so it cannot check the signature.

That's the whole trick, and it explains a few things about how the rest of this works.

The server remembers nothing. There's no table of who's logged in, no session, no lookup. Every request brings its own proof, and checking it is arithmetic. That is what "stateless" means when people say it about APIs, and it is why the server cannot log you out: logging out is the client forgetting the token, and it's next lesson's job.

And the flip side. Because the server keeps no list, a token cannot be cancelled. Whoever holds it is you, as far as the API is concerned, until `exp` passes. That is why a lifetime is short, and why where the browser keeps the token is a security decision and not a storage detail. Both of those are next lesson too, where they belong, next to the attack that makes them matter.

## 6. Locking the doors

We have a way to make tokens. Now the API has to demand them. That's the package from section four doing its other job: it reads the `Authorization` header off every request, checks the signature and the expiry, and if both hold, turns the claims back into a user the rest of the pipeline can see.

> 🎓 In `Program.cs`, add three `using` lines at the top:

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
```

> 🎓 Then, below the CORS block and above `builder.Build()`, add the authentication setup:

```csharp
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Missing configuration value Jwt:Key");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        });
builder.Services.AddAuthorization();
```

> 🎓 And fill the middleware slot. Two lines, in this order, between `app.UseCors()` and `app.MapControllers()`:

```csharp
app.UseAuthentication();
app.UseAuthorization();
```

The registration says: expect bearer tokens, and check them with this key. `ValidateIssuerSigningKey` is the signature check from section five. The lifetime check is on by default, so an expired token is refused without another line. Issuer and audience are switched off, and that's a real decision, not laziness: those two matter when one service makes tokens that another service consumes, and here one API issues its own tokens and checks its own tokens. Next lesson names them, with the other production hardening, so you know what you'd add and when.

The two middleware lines are the two stations from the diagram in section one, and the order is not optional. Authentication first, because it's the one that works out who's asking. Authorization second, because it decides what that person may do, and it cannot decide anything about nobody.

Nothing is protected yet, though. The middleware is in place, but no endpoint has asked for it. That's one attribute.

> 🎓 Add `[Authorize]` to the three data controllers, above `[ApiController]`, with its `using`. `ProductsController` first:

```csharp
using Microsoft.AspNetCore.Authorization;
```

```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
```

> 🎓 Then the same two additions to `CategoriesController` and `TagsController`. `AuthController` gets neither, and stays open: you have to be able to reach the login without being logged in.

`[Authorize]` at class level covers every action in the controller. (When one action in a locked controller must stay open, `[AllowAnonymous]` on that one action reopens it. The catalog has no such action. A case with a public page might.)

> 🎓 Restart the backend (press Ctrl+R in the `dotnet watch` terminal, so the changes in `Program.cs` take effect), then send `Get all products` from `products.rest`.

`401 Unauthorized`, and an empty body. This is the other `401` in the API, and it is worth telling the two apart. The login's `401` came from our exception family, through our handler, with our sentence in it. This one comes from the middleware, before any controller runs, and it says nothing except a `WWW-Authenticate: Bearer` header, because the middleware has nothing to say to someone it doesn't know. Your whole catalog is behind a locked door now, and the key is a token.

So let's hand one over. The REST Client can reuse the answer of a named request, which is what the `# @name login` was for. Request names are file scoped, so a file whose requests need a token starts with its own login.

> 🎓 At the top of `products.rest`, right under `@baseUrl`, add a login request. Log in as gandalf, the manager:

```http
### Login
# @name login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "username": "gandalf",
  "password": "youshallnotpass"
}
```

> 🎓 Then give every other request in the file an `Authorization` header, on the line after the request line. `Get all products` becomes:

```http
### Get all products
GET {{baseUrl}}/api/products
Authorization: Bearer {{login.response.body.$.token}}
```

`Bearer` is the scheme: it tells the server what kind of credential follows, and "bearer" means exactly what it sounds like, whoever bears this token gets in. The `{{login.response.body.$.token}}` part reaches into the login's response and pulls the token out, so you never copy-paste one.

> 🎓 Send Login, then Get all products.

`200 OK`, and the products are back. The door opens for the right key.

> 🎓 Now go through the rest of `products.rest` and add the same header line to every request. Then do the same for `categories.rest` and `tags.rest`: a login at the top of each, the header on every request. Send one from each file to confirm.

> 🎓 And one experiment, because you should see the signature earn its keep. In `Get all products`, replace the `{{login.response.body.$.token}}` with a token pasted in by hand, from your login response. Send it: `200`. Now change one character somewhere in the middle part, the payload, and send again.

`401`. Chances are the payload still decodes into a perfectly plausible user if you paste it into jwt.io, and the server won't have it, because the signature was computed over the original and doesn't match this one. Or take samwise's token from `auth.rest`, change `member` to `manager` on jwt.io's JWT Encoder tab, and send the token it builds for you: the same refusal, because jwt.io signed it with its own key and only our key counts. Anyone can read a token. Nobody can edit one.

> 🎓 Put the request back the way it was. Then start the frontend, if it isn't running, and open the React app in your browser.

"Request failed with status 401". The mock login sent no token, because it has never heard of one, and the API refuses it like any other stranger. This is the gap I warned you about at the top: for one lesson, the two halves are out of step. Next lesson closes it.

## 7. The second question

Everything so far answers "who are you?". Now the one attribute that answers "may you?". Our catalog's rule is small: anyone signed in can read, add and edit products, and only a manager can delete one.

> 🎓 In `ProductsController`, put a second attribute on the `Delete` action:

```csharp
[HttpDelete("{id:int}")]
[Authorize(Roles = "manager")]
public async Task<IActionResult> Delete(int id)
```

> 🎓 Let it restart. In `products.rest`, change the login to frodo (password `secondbreakfast`), send Login, then send `Delete a product`, pointed at any product you can spare.

`403 Forbidden`. ASP.NET lesson six's table called it "I know who you are, and no". The middleware read frodo's token, knew exactly who he was, found `role: member`, and the authorization station refused. Not a `401`: frodo is authenticated fine. He just is not allowed.

> 🎓 Log back in as gandalf and send the same delete: `204 No Content`.

Follow the role's whole path once, because it's the thing to be able to explain. It started in the seed, went into the database, came out at login inside a signed token, was read back by the middleware on the delete, and was checked against the attribute. At no point did the client get a say. Frodo's browser could claim to be a manager all day, the way the mock lets you claim anything, and the API would check the token and say no.

One thing to know for your project. `[Authorize(Roles = ...)]` covers rules of the form "only the role may call this", and most case rules are not that simple. "The owner, or the desk, may change this record" needs the caller's id and role next to the record, inside the service, where the record is. The controller reads them from the claims the middleware restored and hands them down like any other parameter:

```csharp
var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
var isManager = User.IsInRole("manager");
```

(`User` here is the controller's own property, filled in by the authentication middleware. It needs `using System.Security.Claims;`.)

Note: the token says `sub`, and the controller asks for `ClaimTypes.NameIdentifier`. The middleware renames the short names to Microsoft's own long ones on the way in, and `ClaimTypes.NameIdentifier` is the long name for `sub`. (This is exactly the sort of thing that makes people swear at auth libraries. Now you've seen it, it won't surprise you.)

The catalog has no owned records, so we don't build that rule today. Your case does, and now you know where the two facts come from and where the rule goes: in the service, fed from the token, never from the request body.

## Where this goes next

The API now knows its users, keeps their passwords in a form that's worthless to a thief, hands out tokens it can verify and nobody can forge, and turns strangers away at the door. Every rule about who may do what has something solid to stand on. That's the backend half of authentication, and it is the half that has to be right.

Next lesson is the browser's half, and it starts by retiring the mock from React lesson six. A real login page that calls `api/auth/login`, a token to keep (where to keep it is a decision with an attack attached, called cross-site scripting), and a promise from ASP.NET lesson three coming due: because every request flows through the api modules and their shared plumbing, teaching them all to carry the token is a change in one place. Then the UI starts using the role, hiding the delete button from frodo the way the API already refuses him, and the protected routes become real. That lesson also pays a debt from ASP.NET lesson three: what CORS actually is, and why your backend had to opt in back in ASP.NET lesson three. And it closes with a recap of every security pitfall we've met, and where each one was covered, so you can walk through the whole flow, end to end, out loud. Which is exactly what you'll be asked to do.

## Resources

- OWASP, "Password Storage Cheat Sheet". The current advice on hashing, salts and work factors, and why the algorithms are ranked the way they are. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- jwt.io, "Introduction to JSON Web Tokens". The three parts, the claims, and the signature, with the decoder next to it. https://jwt.io/introduction
- Microsoft's docs on JWT bearer authentication in ASP.NET Core, for the framework's own account of `AddJwtBearer` and the validation parameters. It also tells you not to make your own tokens in a real app and to use a provider, which is what the top of this lesson said. https://learn.microsoft.com/aspnet/core/security/authentication/configure-jwt-bearer-authentication
- Have I Been Pwned, "Pwned Passwords". Type a password (an old one, please) and see how many breaches it appears in. https://haveibeenpwned.com/Passwords