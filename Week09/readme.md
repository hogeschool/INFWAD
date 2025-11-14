# Lecture notes: 1.9 - Database Modeling and Entity Framework Core (EF Core)

The lecture has been recorded. These are the teacher’s personal notes. They might not be perfect. This document is not meant as a complete transcript or replacement for the lecture, but contains the notes and tips for you to study after viewing the lecture.

## Context:
> - **MVC** is a rich framework for building web apps and APIs using the Model-View-Controller design pattern.
> - Modern web apps use MVC to allow simultaneous development, modularity, and code reuse.
> - Model — Represents the data and business logic
> - View — Defines the UI
> - Controller — Handles user requests, coordinates Models and Views

## 1. Implementing the Model Layer

There are two main ways to implement the Model:

1. **Direct SQL access**:
Tightly coupling your data-access code to a specific database provider (e.g., MySQL using SQL queries).

2. **ORM abstraction**:
Using an Object-Relational Mapper (ORM) to interact with a database through C# objects — independent of the underlying database

### 1.1 What is a Database?

- A database is a structured collection of related data that can be efficiently stored, accessed, and manipulated.
- It reflects a mini-world — a slice of reality represented digitally. Changes in the real world (e.g., a customer buying a product) should be reflected as updates in the database.
- A database has some source from which data is derived, some degree of interaction with events in the real world, and an audience that is actively interested in its contents. 
- The end users of a database may perform business transactions (for example, a customer buys a camera) or events may happen (for example, an employee retired) that cause the information in the database to change. 

### 1.2 Why use a Database?

What is the difference between storing data in a file or a database?

#### Problems with spreadsheets (xls, files)
> - Multiple inconsistent records
> - Lack of insight on business
> - Difficult to maintain links/relations between various entities

#### Advantages of databases
> - One version (consistent data) for multiuser
> - User groups see a limited part of data (different views)
> - Possibility to perform searches on real time data, filter results, do calculations 

#### Types of databases
- Relational databases: Microsoft SQL Server, Oracle Database, MySQL, PostgreSQL and IBM Db2
- Object-oriented databases: Wakanda, ObjectStore
- NoSQL databases: Apache Cassandra, MongoDB, CouchDB, and CouchBase
- Graph databases: Datastax Enterprise Graph, Neo4J
- Cloud databases: Microsoft Azure SQL Database, Amazon - Relational Database Service, Oracle Autonomous Database.
- Hierarchical databases: IBM Information Management System (IMS), Windows Registry
- Document databases: MongoDB, Amazon DocumentDB, Apache CouchDB
- https://www.matillion.com/blog/the-types-of-databases-with-examples

#### DBMS
- Database software is used to create, edit, and maintain database files and records. 
- The software also handles data storage, backup and reporting, multi-access control, and security. 

#### Data Modeling
- Most data models also include a set of basic operations for specifying retrievals and updates on the database.
- *High-level* or **conceptual data** models provide concepts that are close to the way many users perceive data, 
- *Low-level* or **physical data** models provide concepts that describe the details of how data is stored on the computer storage media, typically magnetic disks. 
- *Representational* or **implementation data** models hide many details of data storage on disk but can be implemented on a computer system directly

#### Conceptual data models
> - use concepts such as **entities**, attributes, and relationships. 
> - An entity represents a real-world object or concept, such as an employee or a project from the miniworld that is described in the database. 
> - An attribute represents some property of interest that further describes an entity, such as the employee’s name or salary. 

### 2. Case Study: Web Shop

#### Business Requirements
- The shop sells products.
- *Each product belongs to a category*.
- Customers can register and place orders.
- Each order contains multiple order details (items purchased).
- Each order detail links to a product and tracks quantity and price.
- *Extra:* Employees process orders, and each employee can have a manager (self-reference).

#### Data Modeling

Entity Framework (EF) Core is a lightweight, extensible, open source and cross-platform for data access. 
EF Core supports many database engines.
EF Core can serve as an object-relational mapper (O/RM)
Enables .NET developers to work with a database using .NET objects.
Eliminates the need for most of the data-access code.

#### EF Core

- With EF Core, data access is performed using a model. 
A **model** is made up of entity classes and a context object that represents a session with the database. 
- The **context** object allows querying and saving data.
- Data is created, deleted, and modified in the database using instances of **entity classes**.
- Instances of your entity classes are retrieved from the database using Language Integrated Query (**LINQ**)

More Technical Details on:
- https://learn.microsoft.com/en-us/ef/core/modeling/
- https://learn.microsoft.com/en-us/ef/core/modeling/relationships/foreign-and-principal-keys

### 3. Hands On

for the time being we will create a console application, as a playground to practice and learn EF and database concepts, later we will create API to integrate this model with controller and serveries.

```bash
dotnet new console -n EFIntroDemo
cd EFIntroDemo
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
```
You can use any database provider, e.g.
`dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL` for PostgreSQL.

**Domain Classes:**
```cs
public class Customer {
  public int Id { get; set; } //By default Id, ClassNameId PK, 
  public string Name { get; set; } = null!;
  public string Email { get; set; } = null!;
  
  //For formatted output only
  public override string ToString() => $"(Id: {Id}, Name: {Name}, Email: {Email})";

}
```

**Context Class:**
```cs
using Microsoft.EntityFrameworkCore;
public class AppDbContext : DbContext {
    public DbSet<Customer> Customers { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=Shop.db");
}
```
* One might use 
`optionsBuilder.UseNpgsql(@"Connection String here or from Config file");` for Postgressql.
* Sample Connection string : `"Host=localhost:5432;Username=postgres;Password=;Database=Shop;Maximum Pool Size=200"`

**Run Migrations**
```bash
dotnet ef migrations add InitCustomer
dotnet ef database update
```
> use Ctrl+Ship+P to open pallet, SQLite:Open Database (select the db file)/ SQL Explorer to view schema, provided you have appropriate SQLite Extension installed for example by alexcvzz 
- Other dbms can be used to view database schema for example pgadim for Postgress etc. 


**Testing CRUD** in Program.cs
```cs
using var db = new AppDbContext();
//Add 1 Customer
db.Customers.Add(new Customer() {
  Name = "Alice",
  Email = "alice@hr.nl"
});

//Add Multiple Customers
db.AddRange(new Customer[]
{
  new (){Name="Barbra", Email="barbra@gmail.com" },
  new (){Name="Casper", Email= "cantfind@anywhere.none" }
});

//Making Data persistent in db
 var ret = db.SaveChanges(); // returns the number of rows effected.

//List down all Customers
db.Customers.ToList().ForEach(
_ => Console.WriteLine(_.ToString()) ); 

var x = db.Customers.FirstOrDefault(_ => _.Name.Contains("Casper"));
if (x != null)
{
  x.Email = "Casper@kpn.nl"; //Edit or
  db.Remove(x);              //Delete
}
//No Changes are permanent unless SaveChanges
db.SaveChanges();
```
**Build / Run App**
```bash
dotnet build
dotnet run
```

**More on Database Modeling**:
Consider the following Test Entity class
```cs
public class Test
{
  public int Field1 { get; set; }
  public string Field2 { get; set; } = null!;
  public DateTime? DateTime { get; set; }
}
// Add the following prop to AppDbContext
public DbSet<Test> Tests { get; set; }
```
If you try to run migrations for the above test class you will get the following error, because the Test class has no field specified implicitly or explicitly as a primary key
```bash
The exception 'The entity type 'Test' requires a primary key to be defined. If you intended to use a keyless entity type, call 'HasNoKey' in 'OnModelCreating'
```
There are a couple of ways to fix it, 
1. Specify the Entity is Keyless which is not the best option but still possible and there are two ways of doing it 
- a. using annotation on top of class declaration
```cs
[Keyless]
public class Test {
    ....
}
```
- b. Or specify the same via fluid api (part of AppDbContext should look like this)
```cs

public class AppDbContext : DbContext {
  public DbSet<Test> Tests { get; set; }
  protected override void OnModelCreating(ModelBuilder modelBuilder) {
    modelBuilder.Entity<Test>().HasNoKey();
  }
}
```
2. By Implicitly or explicitly specifying a primary key, There are three (3) ways to declare a primary key in Entity Framework,
- a. By convention: The entity should have a public field named as Id, or className Id, (case insensitive) e.g `class Test {public int Id;}`  or `class Test{public class TestId;}`
- b. By Annotation: by annotating a field as Key, just like Keyless annotation, but this time on a field e.g.
```cs
public class Test {
  [Key]
  public int Field1 { get; set; }
}
```

- c. By FluentAPI: by explicitly specifying one or more field as primary key or composite primary key (when more than one fields are specified as part of the key).
```cs
    modelBuilder.Entity<Test>().HasKey(_=> _.Field1); //if one field as primary key
    modelBuilder.Entity<Test>().HasKey(_=>new { _.Field1, _.Field2 }); //if more than one fields as composite primary key

```
Database modeling (continued): Now let us extend the project and add further Domain classes, 

```cs
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Product> Products { get; set; } = null!; // Optional collection navigation property.
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }

    public int CategoryId { get; set; }// Foreign Key (if you omit it, EF will generate shadow fk property)
    public Category Category { get; set; } = null!; // Optional Reference navigation property 
}
```

```cs
public DbSet<Category> Categories => Set<Category>();
public DbSet<Product> Products => Set<Product>();
```

```cs
public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public List<OrderDetail> Details { get; set; } = null!;
}

public class OrderDetail
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
// Update Context Class
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<OrderDetail>()
        .HasKey(od => new { od.OrderId, od.ProductId });
}
```
**Extra:**
Add Employee (Self-Reference)
```cs
public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    public List<Employee> Subordinates { get; set; } = new();
}
//Self relationship
modelBuilder.Entity<Employee>()
    .HasOne(e => e.Manager)
    .WithMany(m => m.Subordinates)
    .HasForeignKey(e => e.ManagerId);

```
Seeding and Querying
```cs
using var db = new AppDbContext();

// Seed categories and products
if (!db.Categories.Any()) {
    var electronics = new Category {
        Name = "Electronics",
        Products = new() {
            new Product { Name = "Laptop", Price = 1200M },
            new Product { Name = "Mouse", Price = 25m }
        }
    };

    var groceries = new Category {
        Name = "Groceries",
        Products = new() {
            new Product { Name = "Milk", Price = 2.5m },
            new Product { Name = "Bread", Price = 1.5m }
        }
    };

    db.AddRange(electronics, groceries);
    db.SaveChanges();
}

// Query: join categories and products
var products = db.Products
    .Include(p => p.Category)
    .Where(p => p.Price > 10)
    .Select(p => new { p.Name, p.Price, Category = p.Category.Name })
    .ToList();

foreach (var p in products)
    Console.WriteLine($"{p.Name} ({p.Category}) - ${p.Price}");

// Example of a set operation
var cheapItems = db.Products.Where(p => p.Price < 50);
var expensiveItems = db.Products.Where(p => p.Price >= 50);
var allProducts = cheapItems.Union(expensiveItems).ToList();

Console.WriteLine($"Total Products: {allProducts.Count}");

```
More Examples on Queries, and Syntax

```cs

var queryJoin = db.Products
    .Join(
        db.Categories,                  // Inner sequence to join
        product => product.CategoryId,  // Outer key selector (from Products)
        category => category.Id,        // Inner key selector (from Categories)
        (product, category) => new      // Result selector
        {
            ProductName = product.Name,
            ProductPrice = product.Price,
            CategoryName = category.Name
        }
    )
    .Where(p => p.ProductPrice > 10);      // Filter applied after join


// Query: Same join written using LINQ Query Expression syntax

var queryExpression =
    from p in db.Products
    join c in db.Categories on p.CategoryId equals c.Id
    where p.Price > 10
    select new
    {
        ProductName = p.Name,
        ProductPrice = p.Price,
        CategoryName = c.Name
    };

// Query: Group products by category and calculate aggregate statistics like Count, Average, Min, Max, and Sum using LINQ in EF Core.
// Useful for reports, dashboards, or summary statistics.

var queryGroup =
    from p in db.Products
    join c in db.Categories on p.CategoryId equals c.Id
    group p by c.Name into g
    select new
    {
        Category = g.Key,             // Group key (Category Name)
        TotalProducts = g.Count(),    // Total number of products in category
        AveragePrice = g.Average(p => p.Price),
        MaxPrice = g.Max(p => p.Price),
        MinPrice = g.Min(p => p.Price),
        TotalValue = g.Sum(p => p.Price)  // Total price of all products
    };

```
**Note:** query is still IQueryable<T> (deferred execution)
It will be executed only when enumerated (e.g., .ToListAsync(), .CountAsync(), etc.)
More on LINQ to SQL can be found here https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/sql/linq/

**NB:** This is not an exhaustive tutorial on Database, Entity Framework or LINQ, 
