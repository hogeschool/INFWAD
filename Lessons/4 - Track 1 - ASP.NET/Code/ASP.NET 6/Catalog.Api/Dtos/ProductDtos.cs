using System.ComponentModel.DataAnnotations;

namespace Catalog.Api.Dtos;

public record ProductDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public CategoryDto Category { get; init; } = null!;
}

public record CreateProductDto
{
    [Required]
    [StringLength(100)]
    public string Title { get; init; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal Price { get; init; }

    public int CategoryId { get; init; }
}

public record UpdateProductDto
{
    [Required]
    [StringLength(100)]
    public string Title { get; init; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal Price { get; init; }

    public int CategoryId { get; init; }
}