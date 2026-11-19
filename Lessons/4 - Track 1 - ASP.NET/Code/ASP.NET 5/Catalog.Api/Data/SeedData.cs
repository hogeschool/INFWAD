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