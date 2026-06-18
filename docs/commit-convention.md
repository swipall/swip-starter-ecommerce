# Commit Convention

All commits in Swipall microservices follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

---

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Rules

- **type** is required
- **description** immediately follows the colon and a single space — no capital letter, no period at the end
- **body** starts one blank line after the description
- **footers** start one blank line after the body
- Use the imperative mood in the description: "add feature" not "added feature"

---

## Types

| Type | When to use | SemVer impact |
|------|-------------|---------------|
| `feat` | A new feature or endpoint | MINOR |
| `fix` | A bug fix | PATCH |
| `refactor` | Code change that neither fixes a bug nor adds a feature | — |
| `docs` | Documentation only | — |
| `test` | Adding or updating tests | — |
| `chore` | Maintenance tasks (deps, config, tooling) | — |
| `ci` | CI/CD pipeline changes | — |
| `perf` | Performance improvement | — |
| `style` | Formatting, missing semicolons, etc. (no logic change) | — |
| `build` | Changes to build system or external dependencies | — |

---

## Scope

The scope names the Django app or module affected, in parentheses:

```
feat(my_app): add list endpoint for resources
fix(api): correct slug uniqueness on concurrent saves
```

Common scopes in a Swipall microservice:

| Scope | What it covers |
|-------|---------------|
| `api` | Base app — Project, AbstractModel, auth |
| `<app_name>` | Your feature app |
| `workers` | RQ jobs |
| `settings` | Django configuration |
| `docker` | Dockerfile, docker-compose |
| `deps` | requirements.txt changes |

---

## Breaking Changes

Breaking changes must be marked in one of two ways (or both):

**1. Append `!` before the colon:**
```
feat(api)!: change Project slug field to non-unique
```

**2. Add a `BREAKING CHANGE` footer:**
```
feat(api): change authentication header

BREAKING CHANGE: the API now requires X-API-Key instead of Authorization header.
Clients must update their request headers.
```

Breaking changes correlate with a **MAJOR** version bump.

---

## Examples

```
feat(orders): add bulk create endpoint
```

```
fix(workers): prevent duplicate jobs on concurrent events
```

```
refactor(api): extract slugify logic into utility function
```

```
docs(starter): add integration testing guide
```

```
feat(billing)!: remove free tier plan option

BREAKING CHANGE: the 'free' plan value is no longer accepted in Project.plan.
Existing records must be migrated to 'lite'.
```

```
chore(deps): upgrade django-ninja to 1.4.3
```

```
test(my_app): add integration tests for resource creation
```

---

## Multi-line commit (body)

Use the body to explain **why**, not what (the diff already shows what):

```
fix(workers): retry failed jobs on transient DB errors

Previously, any exception caused the job to be moved to the failed queue
permanently. Now transient errors (OperationalError, InterfaceError) trigger
up to 3 automatic retries with exponential backoff.
```

---

## What never goes in a commit message

- No mentions of Claude, AI, or any AI tool — commits describe the code, not who wrote it
- No vague messages like "fix bug", "update code", "changes" — always specify what and where
- No period at the end of the description
- No capital letter at the start of the description

---

## Quick reference

```
feat(scope): add something new
fix(scope): correct wrong behavior
refactor(scope): reorganize without changing behavior
docs(scope): update documentation
test(scope): add or fix tests
chore(scope): update deps or config
ci(scope): update pipeline
perf(scope): improve speed or memory
style(scope): fix formatting
build(scope): change build system
```