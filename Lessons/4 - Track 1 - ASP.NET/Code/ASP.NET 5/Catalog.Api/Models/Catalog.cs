namespace Catalog.Api.Models;

public class Category : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Product> Products { get; set; } = [];
}