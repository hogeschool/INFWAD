using Catalog.Api.Dtos;
using Catalog.Api.Exceptions;
using Catalog.Api.Models;
using Catalog.Api.Repositories;

namespace Catalog.Api.Services;

public class ProductService : IProductService
{
    private readonly IRepository<Product> _products;
    private readonly IRepository<Category> _categories;

    public ProductService(IRepository<Product> products, IRepository<Category> categories)
    {
        _products = products;
        _categories = categories;
    }

    public async Task<List<ProductDto>> GetAllAsync(string? search = null)
    {
        var products = string.IsNullOrWhiteSpace(search)
            ? await _products.GetAllAsync(p => p.Category)
            : await _products.FindAsync(
                p => p.Title.ToLower().Contains(search.ToLower()), p => p.Category);

        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var product = await _products.GetByIdAsync(id, p => p.Category);
        return product is null ? null : ToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category is null)
        {
            throw new BadRequestException($"There is no category with id {dto.CategoryId}");
        }

        var product = new Product
        {
            Title = dto.Title,
            Price = dto.Price,
            Category = category
        };

        _products.Add(product);
        await _products.SaveChangesAsync();

        return ToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _products.GetByIdAsync(id);
        if (product is null) return null;

        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category is null)
        {
            throw new BadRequestException($"There is no category with id {dto.CategoryId}");
        }

        product.Title = dto.Title;
        product.Price = dto.Price;
        product.Category = category;
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
        Price = product.Price,
        Category = new CategoryDto
        {
            Id = product.Category.Id,
            Name = product.Category.Name
        }
    };
}