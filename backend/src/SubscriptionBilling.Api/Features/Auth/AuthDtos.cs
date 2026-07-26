namespace SubscriptionBilling.Api.Features.Auth;

public sealed record LoginRequest(string Username, string Password);

public sealed record LoginResponse(string Token, DateTime ExpiresAt);
