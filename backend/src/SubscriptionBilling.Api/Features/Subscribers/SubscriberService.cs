using Microsoft.EntityFrameworkCore;
using SubscriptionBilling.Api.Domain.Subscribers;
using SubscriptionBilling.Api.Infrastructure.Persistence;

namespace SubscriptionBilling.Api.Features.Subscribers;

public sealed class SubscriberService(AppDbContext dbContext)
{
    public async Task<IReadOnlyList<SubscriberResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var subscribers = await dbContext.Subscribers
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);

        return subscribers.Select(ToResponse).ToList();
    }

    public async Task<SubscriberResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var subscriber = await dbContext.Subscribers.FindAsync([id], cancellationToken);
        return subscriber is null ? null : ToResponse(subscriber);
    }

    public async Task<SubscriberResponse> CreateAsync(CreateSubscriberRequest request, CancellationToken cancellationToken)
    {
        await EnsureEmailIsAvailableAsync(request.Email, excludingId: null, cancellationToken);

        var subscriber = Subscriber.Create(request.Name, request.Email);

        dbContext.Subscribers.Add(subscriber);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(subscriber);
    }

    public async Task<SubscriberResponse?> UpdateAsync(Guid id, UpdateSubscriberRequest request, CancellationToken cancellationToken)
    {
        var subscriber = await dbContext.Subscribers.FindAsync([id], cancellationToken);
        if (subscriber is null)
        {
            return null;
        }

        await EnsureEmailIsAvailableAsync(request.Email, excludingId: id, cancellationToken);

        subscriber.Update(request.Name, request.Email);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(subscriber);
    }

    private async Task EnsureEmailIsAvailableAsync(string email, Guid? excludingId, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var emailTaken = await dbContext.Subscribers
            .Where(s => s.Email == normalizedEmail && s.Id != excludingId)
            .AnyAsync(cancellationToken);

        if (emailTaken)
        {
            throw new ArgumentException($"Email '{email}' is already in use.", nameof(email));
        }
    }

    private static SubscriberResponse ToResponse(Subscriber subscriber) => new(
        subscriber.Id,
        subscriber.Name,
        subscriber.Email,
        subscriber.CreatedAt);
}
