using SubscriptionBilling.Api.Domain.Common;

namespace SubscriptionBilling.Api.Domain.Plans;

public sealed class Plan
{
    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public Money Price { get; private set; } = null!;

    public BillingCycle BillingCycle { get; private set; }

    public int TrialDays { get; private set; }

    public bool IsArchived { get; private set; }

    public DateTime CreatedAt { get; private set; }

    private Plan()
    {
    }

    public static Plan Create(string name, string? description, Money price, BillingCycle billingCycle, int trialDays)
    {
        ValidateName(name);
        ValidateTrialDays(trialDays);

        return new Plan
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Description = description,
            Price = price,
            BillingCycle = billingCycle,
            TrialDays = trialDays,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string name, string? description, Money price, BillingCycle billingCycle, int trialDays)
    {
        ValidateName(name);
        ValidateTrialDays(trialDays);

        Name = name.Trim();
        Description = description;
        Price = price;
        BillingCycle = billingCycle;
        TrialDays = trialDays;
    }

    public void Archive() => IsArchived = true;

    public void Unarchive() => IsArchived = false;

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Plan name is required.", nameof(name));
        }
    }

    private static void ValidateTrialDays(int trialDays)
    {
        if (trialDays < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(trialDays), "Trial days cannot be negative.");
        }
    }
}
