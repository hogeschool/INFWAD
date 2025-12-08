public interface ITodoService
{
    Task<List<Todo>> GetAll();
    Task<Todo?> Get(int id);
    Task<Todo> Create(string title);
    Task<Todo?> Update(int id, string title, bool isDone);
    Task<bool> Delete(int id);
}