using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubscriptionBilling.Api.Domain.Plans;

namespace SubscriptionBilling.Api.Features.Plans;

public sealed class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.BillingCycle)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.OwnsOne(p => p.Price, price =>
        {
            price.Property(m => m.Amount)
                .HasColumnName("PriceAmount")
                .HasColumnType("decimal(18,2)");

            price.Property(m => m.Currency)
                .HasColumnName("PriceCurrency")
                .HasMaxLength(3);
        });

        builder.Navigation(p => p.Price).IsRequired();
    }
}
