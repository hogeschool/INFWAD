namespace Catalog.Api.Dtos;

public record ProductDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}

public record CreateProductDto
{
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}

public record UpdateProductDto
{
    public string Title { get; init; } = string.Empty;
    public decimal Price { get; init; }
}