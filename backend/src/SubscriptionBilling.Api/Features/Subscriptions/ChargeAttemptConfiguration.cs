using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubscriptionBilling.Api.Domain.Subscriptions;

namespace SubscriptionBilling.Api.Features.Subscriptions;

public sealed class ChargeAttemptConfiguration : IEntityTypeConfiguration<ChargeAttempt>
{
    public void Configure(EntityTypeBuilder<ChargeAttempt> builder)
    {
        builder.ToTable("ChargeAttempts");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.GatewayReference).HasMaxLength(200);
        builder.Property(c => c.FailureReason).HasMaxLength(500);

        builder.HasOne<Subscription>()
            .WithMany()
            .HasForeignKey(c => c.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
