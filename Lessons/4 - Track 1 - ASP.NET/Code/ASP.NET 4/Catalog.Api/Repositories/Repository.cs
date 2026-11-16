using Catalog.Api.Data;
using Catalog.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Catalog.Api.Repositories;

public class Repository<T> : IRepository<T> where T : class, IEntity
{
    private readonly AppDbContext _context;

    public Repository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<T>> GetAllAsync()
        => await _context.Set<T>().ToListAsync();

    public async Task<T?> GetByIdAsync(int id)
        => await _context.Set<T>().FirstOrDefaultAsync(e => e.Id == id);

    public async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate)
        => await _context.Set<T>().Where(predicate).ToListAsync();

    public void Add(T entity) => _context.Set<T>().Add(entity);
    public void Update(T entity) => _context.Set<T>().Update(entity);
    public void Delete(T entity) => _context.Set<T>().Remove(entity);

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();
}