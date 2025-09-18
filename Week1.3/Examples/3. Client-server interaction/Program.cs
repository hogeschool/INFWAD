using System.Net.Mime;
using System.Text;
using Microsoft.AspNetCore.Mvc;


var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseStaticFiles();

app.MapGet("/", () => Results.Extensions.Html(@"
<html lang='en'>

<head>
    <title>The Fantastic WebPage</title>
</head>

<body>
    <script type = 'module' src='./js/index.js'></script> 
</body>

</html>
"));


app.MapGet("/api/welcome", () => Results.Ok("Welcome to the INFWEB Exam"));

app.MapGet("/api/sum", ([FromQuery] int a, [FromQuery] int b) => {
    System.Console.WriteLine($"\n\n GET REQUEST {a} + {b} = {a + b}\n\n");
    return Results.Ok($"{a + b}");});

app.MapPost("/api/calculate", ([FromBody] Binary binOp) =>
        {
            if (binOp != null)
            {
                switch (binOp.Operator)
                {
                    case '+':
                        return Results.Ok(binOp.n1 + binOp.n2);
                    case '-':
                        return Results.Ok(binOp.n1 - binOp.n2);
                    case '*':
                        return Results.Ok(binOp.n1 * binOp.n2);
                    case '/':
                        return Results.Ok(binOp.n1 / binOp.n2);
                    default:
                        return Results.BadRequest();
                }
            }
            return Results.BadRequest();
            
        }
    );

app.Run("http://localhost:5011");


public record Binary (int n1, int n2, char Operator);


// ----------DO NOT CHANGE THIS SECTION:---------
static class ResultsExtensions
{
    public static IResult Html(this IResultExtensions resultExtensions, string html)
    {
        ArgumentNullException.ThrowIfNull(resultExtensions);

        return new HtmlResult(html);
    }
}

class HtmlResult : IResult
{
    private readonly string _html;

    public HtmlResult(string html)
    {
        _html = html;
    }

    public Task ExecuteAsync(HttpContext httpContext)
    {
        httpContext.Response.ContentType = MediaTypeNames.Text.Html;
        httpContext.Response.ContentLength = Encoding.UTF8.GetByteCount(_html);
        return httpContext.Response.WriteAsync(_html);
    }
}

// -----------------------------------------------
