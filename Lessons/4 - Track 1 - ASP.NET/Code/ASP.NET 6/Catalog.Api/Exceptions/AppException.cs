using Microsoft.AspNetCore.Http;

namespace Catalog.Api.Exceptions;

public abstract class AppException : Exception
{
    public abstract int StatusCode { get; }
    protected AppException(string message) : base(message) { }
}

public class BadRequestException : AppException
{
    public override int StatusCode => StatusCodes.Status400BadRequest;
    public BadRequestException(string message) : base(message) { }
}