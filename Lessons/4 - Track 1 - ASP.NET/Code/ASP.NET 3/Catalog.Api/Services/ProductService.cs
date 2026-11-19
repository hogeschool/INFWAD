using Catalog.Api.Dtos;
using Catalog.Api.Models;
using Catalog.Api.Repositories;

namespace Catalog.Api.Services;

public class ProductService : IProductService
{
    private readonly IRepository<Product> _products;

    public ProductService(IRepository<Product> products)
    {
        _products = products;
    }

    public async Task<List<ProductDto>> GetAllAsync()
    {
        var products = await _products.GetAllAsync();
        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var product = await _products.GetByIdAsync(id);
        return product is null ? null : ToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Title = dto.Title,
            Price = dto.Price
        };

        _products.Add(product);
        await _products.SaveChangesAsync();

        return ToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _products.GetByIdAsync(id);
        if (product is null) return null;

        product.Title = dto.Title;
        product.Price = dto.Price;
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
        Price = product.Price
    };
    
}