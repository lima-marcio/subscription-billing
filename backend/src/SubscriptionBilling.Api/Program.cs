using Microsoft.EntityFrameworkCore;
using Serilog;
using SubscriptionBilling.Api.Extensions;
using SubscriptionBilling.Api.Features.Plans;
using SubscriptionBilling.Api.Features.Subscribers;
using SubscriptionBilling.Api.Features.Subscriptions;
using SubscriptionBilling.Api.Infrastructure.ExceptionHandling;
using SubscriptionBilling.Api.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddControllers();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerWithJwt();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddPersistence(builder.Configuration, builder.Environment);
builder.Services.AddPlansFeature();
builder.Services.AddSubscribersFeature();
builder.Services.AddSubscriptionsFeature();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
