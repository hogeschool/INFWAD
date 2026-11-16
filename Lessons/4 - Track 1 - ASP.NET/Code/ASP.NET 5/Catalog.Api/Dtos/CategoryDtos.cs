namespace Catalog.Api.Dtos;

public record CategoryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}