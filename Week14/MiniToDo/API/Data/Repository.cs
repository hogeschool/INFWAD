using Microsoft.EntityFrameworkCore;

public class Repository<T> : IRepository<T> where T : class
{
    private readonly AppDbContext _db;
    public Repository(AppDbContext db) => _db = db;

    public Task<List<T>> GetAllAsync() => _db.Set<T>().ToListAsync();
    public Task<T?> GetByIdAsync(int id) => _db.Set<T>().FindAsync(id).AsTask();

    public async Task AddAsync(T entity)
    {
        await _db.Set<T>().AddAsync(entity);
    }

    public Task UpdateAsync(T entity)
    {
        _db.Set<T>().Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(T entity)
    {
        _db.Set<T>().Remove(entity);
        return Task.CompletedTask;
    }

    public async Task SaveAsync() => await _db.SaveChangesAsync();
}