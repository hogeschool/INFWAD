using Catalog.Api.Dtos;
using Catalog.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categories;

    public CategoriesController(ICategoryService categories)
    {
        _categories = categories;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
        => Ok(await _categories.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var category = await _categories.GetByIdAsync(id);
        return category is null ? NotFound() : Ok(category);
    }
}