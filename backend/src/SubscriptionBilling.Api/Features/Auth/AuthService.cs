using SubscriptionBilling.Api.Infrastructure.Security;

namespace SubscriptionBilling.Api.Features.Auth;

public sealed class AuthService(IConfiguration configuration, JwtTokenService tokenService)
{
    public LoginResponse Login(LoginRequest request)
    {
        var adminUsername = configuration["Auth:AdminUsername"]
            ?? throw new InvalidOperationException("Auth:AdminUsername is not configured.");
        var adminPasswordHash = configuration["Auth:AdminPasswordHash"]
            ?? throw new InvalidOperationException("Auth:AdminPasswordHash is not configured.");

        if (!string.Equals(request.Username, adminUsername, StringComparison.Ordinal)
            || !PasswordHasher.Verify(request.Password, adminPasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        var (token, expiresAt) = tokenService.CreateToken(adminUsername);
        return new LoginResponse(token, expiresAt);
    }
}
