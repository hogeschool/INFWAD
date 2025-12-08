public class TodoService : ITodoService
{
    private readonly IRepository<Todo> _repo;

    public TodoService(IRepository<Todo> repo) => _repo = repo;

    public Task<List<Todo>> GetAll() => _repo.GetAllAsync();

    public Task<Todo?> Get(int id) => _repo.GetByIdAsync(id);

    public async Task<Todo> Create(string title)
    {
        var t = new Todo { Title = title };
        await _repo.AddAsync(t);
        await _repo.SaveAsync();
        return t;
    }

    public async Task<Todo?> Update(int id, string title, bool isDone)
    {
        var todo = await _repo.GetByIdAsync(id);
        if (todo == null) return null;

        todo.Title = title;
        todo.IsDone = isDone;

        await _repo.UpdateAsync(todo);
        await _repo.SaveAsync();
        return todo;
    }

    public async Task<bool> Delete(int id)
    {
        var todo = await _repo.GetByIdAsync(id);
        if (todo == null) return false;

        await _repo.DeleteAsync(todo);
        await _repo.SaveAsync();
        return true;
    }
}