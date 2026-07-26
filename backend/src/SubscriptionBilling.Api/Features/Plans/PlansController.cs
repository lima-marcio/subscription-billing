using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SubscriptionBilling.Api.Features.Plans;

[ApiController]
[Route("api/plans")]
[Authorize]
public sealed class PlansController(PlanService planService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PlanResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await planService.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PlanResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var plan = await planService.GetByIdAsync(id, cancellationToken);
        return plan is null ? NotFound() : Ok(plan);
    }

    [HttpPost]
    public async Task<ActionResult<PlanResponse>> Create(CreatePlanRequest request, CancellationToken cancellationToken)
    {
        var plan = await planService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PlanResponse>> Update(Guid id, UpdatePlanRequest request, CancellationToken cancellationToken)
    {
        var plan = await planService.UpdateAsync(id, request, cancellationToken);
        return plan is null ? NotFound() : Ok(plan);
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult<PlanResponse>> Archive(Guid id, CancellationToken cancellationToken)
    {
        var plan = await planService.ArchiveAsync(id, cancellationToken);
        return plan is null ? NotFound() : Ok(plan);
    }

    [HttpPost("{id:guid}/unarchive")]
    public async Task<ActionResult<PlanResponse>> Unarchive(Guid id, CancellationToken cancellationToken)
    {
        var plan = await planService.UnarchiveAsync(id, cancellationToken);
        return plan is null ? NotFound() : Ok(plan);
    }
}
