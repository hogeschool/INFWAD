using Catalog.Api.Models;
using System.Linq.Expressions;

namespace Catalog.Api.Repositories;

public interface IRepository<T> where T : class, IEntity
{
    Task<List<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate);

    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);

    Task<int> SaveChangesAsync();
}