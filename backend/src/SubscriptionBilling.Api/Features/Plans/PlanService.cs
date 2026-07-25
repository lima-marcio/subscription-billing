using Microsoft.EntityFrameworkCore;
using SubscriptionBilling.Api.Domain.Common;
using SubscriptionBilling.Api.Domain.Plans;
using SubscriptionBilling.Api.Infrastructure.Persistence;

namespace SubscriptionBilling.Api.Features.Plans;

public sealed class PlanService(AppDbContext dbContext)
{
    public async Task<IReadOnlyList<PlanResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var plans = await dbContext.Plans
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return plans.Select(ToResponse).ToList();
    }

    public async Task<PlanResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var plan = await dbContext.Plans.FindAsync([id], cancellationToken);
        return plan is null ? null : ToResponse(plan);
    }

    public async Task<PlanResponse> CreateAsync(CreatePlanRequest request, CancellationToken cancellationToken)
    {
        var billingCycle = ParseBillingCycle(request.BillingCycle);
        var price = new Money(request.PriceAmount, request.PriceCurrency);

        var plan = Plan.Create(request.Name, request.Description, price, billingCycle, request.TrialDays);

        dbContext.Plans.Add(plan);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(plan);
    }

    public async Task<PlanResponse?> UpdateAsync(Guid id, UpdatePlanRequest request, CancellationToken cancellationToken)
    {
        var plan = await dbContext.Plans.FindAsync([id], cancellationToken);
        if (plan is null)
        {
            return null;
        }

        var billingCycle = ParseBillingCycle(request.BillingCycle);
        var price = new Money(request.PriceAmount, request.PriceCurrency);

        plan.Update(request.Name, request.Description, price, billingCycle, request.TrialDays);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(plan);
    }

    public async Task<PlanResponse?> ArchiveAsync(Guid id, CancellationToken cancellationToken)
    {
        var plan = await dbContext.Plans.FindAsync([id], cancellationToken);
        if (plan is null)
        {
            return null;
        }

        plan.Archive();
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(plan);
    }

    public async Task<PlanResponse?> UnarchiveAsync(Guid id, CancellationToken cancellationToken)
    {
        var plan = await dbContext.Plans.FindAsync([id], cancellationToken);
        if (plan is null)
        {
            return null;
        }

        plan.Unarchive();
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(plan);
    }

    private static BillingCycle ParseBillingCycle(string value)
    {
        if (!Enum.TryParse<BillingCycle>(value, ignoreCase: true, out var billingCycle))
        {
            throw new ArgumentException($"Invalid billing cycle '{value}'. Valid values: Monthly, Annual.", nameof(value));
        }

        return billingCycle;
    }

    private static PlanResponse ToResponse(Plan plan) => new(
        plan.Id,
        plan.Name,
        plan.Description,
        plan.Price.Amount,
        plan.Price.Currency,
        plan.BillingCycle.ToString(),
        plan.TrialDays,
        plan.IsArchived,
        plan.CreatedAt);
}
