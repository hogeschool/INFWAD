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

        context.Products.AddRange(
            new Product { Title = "Laptop", Price = 1300 },
            new Product { Title = "Phone", Price = 800 },
            new Product { Title = "Headphones", Price = 150 }
        );

        await context.SaveChangesAsync();
    }
}