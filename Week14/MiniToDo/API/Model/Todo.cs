public class Todo
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public bool IsDone { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}