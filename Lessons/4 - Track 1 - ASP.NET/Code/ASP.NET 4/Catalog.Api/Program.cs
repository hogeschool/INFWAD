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

var frontendUrl = builder.Configuration["Frontend:Url"]
    ?? throw new InvalidOperationException("Missing configuration value Frontend:Url");
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

await SeedData.InitializeAsync(app);

app.MapControllers();
app.UseCors();

app.Run();