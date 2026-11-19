using Catalog.Api.Dtos;

namespace Catalog.Api.Services;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(CreateProductDto dto);
    Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto);
    Task<bool> DeleteAsync(int id);

}