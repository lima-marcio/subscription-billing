# Security

- Required secrets (API keys, client ids/secrets) are configured via
  `dotnet user-secrets` in development — never committed to appsettings.

## Build Gate — NuGet Vulnerabilities
Block the build on any NuGet package with a known vulnerability, at any
severity level (not just high/critical). Add to the solution's
`Directory.Build.props`:

```xml
<Project>
  <PropertyGroup>
    <NuGetAudit>true</NuGetAudit>
    <NuGetAuditMode>all</NuGetAuditMode>
    <NuGetAuditLevel>low</NuGetAuditLevel>
    <WarningsAsErrors>$(WarningsAsErrors);NU1900;NU1901;NU1902;NU1903;NU1904</WarningsAsErrors>
  </PropertyGroup>
</Project>
```

A vulnerable transitive package is fixed by pinning a patched version
with a direct `PackageReference` in the same file — not by lowering the
audit level.
