using Microsoft.AspNetCore.Mvc;

namespace SubscriptionBilling.Api.Features.Auth;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public ActionResult<LoginResponse> Login(LoginRequest request)
    {
        return Ok(authService.Login(request));
    }
}
