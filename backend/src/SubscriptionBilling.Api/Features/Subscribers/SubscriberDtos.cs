namespace SubscriptionBilling.Api.Features.Subscribers;

public sealed record SubscriberResponse(
    Guid Id,
    string Name,
    string Email,
    DateTime CreatedAt);

public sealed record CreateSubscriberRequest(string Name, string Email);

public sealed record UpdateSubscriberRequest(string Name, string Email);
