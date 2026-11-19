using Catalog.Api.Models;

namespace Catalog.Api.Repositories;

public interface IRepository<T> where T : class, IEntity
{
    Task<List<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);

    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);

    Task<int> SaveChangesAsync();
}