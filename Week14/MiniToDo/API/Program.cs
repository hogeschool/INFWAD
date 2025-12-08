using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Add CORS
var frontendUrl = builder.Configuration["Frontend:Url"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(frontendUrl!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Dependency Injection
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ITodoService, TodoService>();

// Registers the MVC controller framework into the DI container
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use CORS
app.UseCors("FrontendPolicy");

// IMPORTANT: Set URLs from config
var httpUrl = builder.Configuration["BackendUrls:Http"];
if (!string.IsNullOrEmpty(httpUrl))
    app.Urls.Add(httpUrl);

// Controller endpoint mapping
app.MapControllers();

app.UseSwagger();   
app.UseSwaggerUI();

app.Run();