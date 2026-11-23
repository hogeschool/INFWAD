using Catalog.Api.Dtos;
using Catalog.Api.Models;
using Catalog.Api.Repositories;

namespace Catalog.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly IRepository<Category> _categories;

    public CategoryService(IRepository<Category> categories)
    {
        _categories = categories;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _categories.GetAllAsync();
        return categories.Select(ToDto).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _categories.GetByIdAsync(id);
        return category is null ? null : ToDto(category);
    }

    private static CategoryDto ToDto(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name
    };
}