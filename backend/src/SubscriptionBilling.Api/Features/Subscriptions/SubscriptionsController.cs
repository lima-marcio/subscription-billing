using Microsoft.AspNetCore.Mvc;

namespace SubscriptionBilling.Api.Features.Subscriptions;

[ApiController]
[Route("api/subscriptions")]
public sealed class SubscriptionsController(SubscriptionService subscriptionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SubscriptionResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await subscriptionService.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubscriptionResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var subscription = await subscriptionService.GetByIdAsync(id, cancellationToken);
        return subscription is null ? NotFound() : Ok(subscription);
    }

    [HttpPost]
    public async Task<ActionResult<SubscriptionResponse>> Create(CreateSubscriptionRequest request, CancellationToken cancellationToken)
    {
        var subscription = await subscriptionService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = subscription.Id }, subscription);
    }

    [HttpPost("{id:guid}/reactivate")]
    public async Task<ActionResult<SubscriptionResponse>> Reactivate(Guid id, CancellationToken cancellationToken)
    {
        var subscription = await subscriptionService.ReactivateAsync(id, cancellationToken);
        return subscription is null ? NotFound() : Ok(subscription);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<SubscriptionResponse>> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var subscription = await subscriptionService.CancelAsync(id, cancellationToken);
        return subscription is null ? NotFound() : Ok(subscription);
    }

    [HttpPost("{id:guid}/plan-change")]
    public async Task<ActionResult<SubscriptionResponse>> SchedulePlanChange(Guid id, SchedulePlanChangeRequest request, CancellationToken cancellationToken)
    {
        var subscription = await subscriptionService.SchedulePlanChangeAsync(id, request, cancellationToken);
        return subscription is null ? NotFound() : Ok(subscription);
    }
}
