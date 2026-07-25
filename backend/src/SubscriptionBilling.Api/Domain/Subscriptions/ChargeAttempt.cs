namespace SubscriptionBilling.Api.Domain.Subscriptions;

public sealed class ChargeAttempt
{
    public Guid Id { get; private set; }

    public Guid SubscriptionId { get; private set; }

    public DateTime AttemptedAt { get; private set; }

    public bool Succeeded { get; private set; }

    public string? GatewayReference { get; private set; }

    public string? FailureReason { get; private set; }

    private ChargeAttempt()
    {
    }

    public static ChargeAttempt Succeed(Guid subscriptionId, DateTime attemptedAt, string gatewayReference) => new()
    {
        Id = Guid.NewGuid(),
        SubscriptionId = subscriptionId,
        AttemptedAt = attemptedAt,
        Succeeded = true,
        GatewayReference = gatewayReference
    };

    public static ChargeAttempt Fail(Guid subscriptionId, DateTime attemptedAt, string failureReason) => new()
    {
        Id = Guid.NewGuid(),
        SubscriptionId = subscriptionId,
        AttemptedAt = attemptedAt,
        Succeeded = false,
        FailureReason = failureReason
    };
}
