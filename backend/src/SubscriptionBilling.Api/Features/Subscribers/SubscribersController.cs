using Microsoft.AspNetCore.Mvc;

namespace SubscriptionBilling.Api.Features.Subscribers;

[ApiController]
[Route("api/subscribers")]
public sealed class SubscribersController(SubscriberService subscriberService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SubscriberResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await subscriberService.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubscriberResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var subscriber = await subscriberService.GetByIdAsync(id, cancellationToken);
        return subscriber is null ? NotFound() : Ok(subscriber);
    }

    [HttpPost]
    public async Task<ActionResult<SubscriberResponse>> Create(CreateSubscriberRequest request, CancellationToken cancellationToken)
    {
        var subscriber = await subscriberService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = subscriber.Id }, subscriber);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SubscriberResponse>> Update(Guid id, UpdateSubscriberRequest request, CancellationToken cancellationToken)
    {
        var subscriber = await subscriberService.UpdateAsync(id, request, cancellationToken);
        return subscriber is null ? NotFound() : Ok(subscriber);
    }
}
