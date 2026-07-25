using System.Net.Mail;

namespace SubscriptionBilling.Api.Domain.Subscribers;

public sealed class Subscriber
{
    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public DateTime CreatedAt { get; private set; }

    private Subscriber()
    {
    }

    public static Subscriber Create(string name, string email)
    {
        ValidateName(name);
        var normalizedEmail = NormalizeAndValidateEmail(email);

        return new Subscriber
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Email = normalizedEmail,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string name, string email)
    {
        ValidateName(name);
        var normalizedEmail = NormalizeAndValidateEmail(email);

        Name = name.Trim();
        Email = normalizedEmail;
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Subscriber name is required.", nameof(name));
        }
    }

    private static string NormalizeAndValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Subscriber email is required.", nameof(email));
        }

        try
        {
            return new MailAddress(email).Address.ToLowerInvariant();
        }
        catch (FormatException)
        {
            throw new ArgumentException($"'{email}' is not a valid email address.", nameof(email));
        }
    }
}
