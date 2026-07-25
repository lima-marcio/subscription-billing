using Microsoft.EntityFrameworkCore;
using SubscriptionBilling.Api.Domain.Plans;
using SubscriptionBilling.Api.Domain.Subscribers;

namespace SubscriptionBilling.Api.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Plan> Plans => Set<Plan>();

    public DbSet<Subscriber> Subscribers => Set<Subscriber>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
