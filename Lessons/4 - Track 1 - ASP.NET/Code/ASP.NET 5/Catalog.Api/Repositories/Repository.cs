using System.Linq.Expressions;
using Catalog.Api.Data;
using Catalog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Api.Repositories;

public class Repository<T> : IRepository<T> where T : class, IEntity
{
    private readonly AppDbContext _context;

    public Repository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<T>> GetAllAsync(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _context.Set<T>();
        foreach (var include in includes)
            query = query.Include(include);
        return await query.ToListAsync();
    }

    public async Task<T?> GetByIdAsync(int id, params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _context.Set<T>();
        foreach (var include in includes)
            query = query.Include(include);
        return await query.FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate,
        params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _context.Set<T>().Where(predicate);
        foreach (var include in includes)
            query = query.Include(include);
        return await query.ToListAsync();
    }

    public void Add(T entity) => _context.Set<T>().Add(entity);
    public void Update(T entity) => _context.Set<T>().Update(entity);
    public void Delete(T entity) => _context.Set<T>().Remove(entity);

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();
}