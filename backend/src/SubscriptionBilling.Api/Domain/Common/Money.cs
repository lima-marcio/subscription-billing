namespace SubscriptionBilling.Api.Domain.Common;

public sealed record Money
{
    public decimal Amount { get; init; }

    public string Currency { get; init; }

    public Money(decimal amount, string currency)
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount cannot be negative.");
        }

        if (string.IsNullOrWhiteSpace(currency))
        {
            throw new ArgumentException("Currency is required.", nameof(currency));
        }

        Amount = amount;
        Currency = currency.Trim().ToUpperInvariant();
    }
}
