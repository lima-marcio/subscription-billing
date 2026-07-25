using Microsoft.EntityFrameworkCore;
using SubscriptionBilling.Api.Domain.Plans;
using SubscriptionBilling.Api.Domain.Subscribers;
using SubscriptionBilling.Api.Domain.Subscriptions;

namespace SubscriptionBilling.Api.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Plan> Plans => Set<Plan>();

    public DbSet<Subscriber> Subscribers => Set<Subscriber>();

    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
