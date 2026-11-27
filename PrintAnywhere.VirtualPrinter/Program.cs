using Microsoft.AspNetCore.Server.Kestrel.Core;
using PrintAnywhere.VirtualPrinter.Ipp;
using PrintAnywhere.VirtualPrinter.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddWindowsService(options =>
{
    options.ServiceName = "PrintAnywhereVirtualPrinter";
});

builder.Services.AddHttpClient();
builder.Services.AddSingleton<SpoolService>();
builder.Services.AddSingleton<IppEndpointHandler>();

int port = builder.Configuration.GetValue("Server:Port", 6310);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 200 * 1024 * 1024; // 200 MB max print payload
    options.ListenLocalhost(port, listenOptions =>
    {
        listenOptions.Protocols = HttpProtocols.Http1;
    });
});

var app = builder.Build();

app.MapGet("/", () => Results.Ok("Print Anywhere IPP Virtual Printer is running."));
app.MapPost("/ipp/print", (HttpContext ctx, IppEndpointHandler handler) => handler.HandleRequestAsync(ctx));
app.MapPost("/", (HttpContext ctx, IppEndpointHandler handler) => handler.HandleRequestAsync(ctx));

app.Run();