# Coding Conventions

- One class/component per file.
- Prefer small methods.
- Clear names, no abbreviations.
- No TODOs in committed code.
- No commented dead code.
- SHOULD prefer composition over inheritance.
- Avoid inheritance solely for code reuse.
- Use inheritance only when there is a genuine IS-A relationship or when extending framework base classes (e.g. ControllerBase, BackgroundService, Exception, DbContext).
- Keep `Program.cs` minimal (see `10-architecture.md`).
- Controllers orchestrate only.
- Use async/await.
