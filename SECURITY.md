# PropWise — Security Policy

## Reporting Security Issues

If you discover a security vulnerability in PropWise, please report it responsibly. Do not open a public issue.

Contact the project maintainers directly with a description of the issue, steps to reproduce, and any relevant output. Include the severity assessment if possible.

## Sensitive Data Handling

PropWise collects the following user-provided information during analysis:

- **Owner name** — displayed on reports and shared reports.
- **Owner email** — stored on the analysis record but **never exposed in shared reports**. The `readSharedReport` backend function explicitly excludes `owner_email` from its response.
- **Financial inputs** — property price, savings, income, loan details, costs, and rental assumptions.

Financial data is personal and sensitive. PropWise does not share it with third parties.

## Environment Variables

- Secrets and environment variables are stored in the platform's secrets management, never in the repository.
- `.env` and `.env.*` are gitignored.
- See `ENVIRONMENT.md` for documented variables. No real secrets are committed.

## Authentication

PropWise uses the platform's managed authentication:

- Email/password, Google OAuth, and OTP verification flows.
- Sessions and tokens are managed by the platform — PropWise does not implement custom auth.
- Authenticated routes are guarded by `ProtectedRoute`.
- Unauthenticated users are redirected to login with a `returnTo` parameter.

## Database / Row-Level Security

- The `Analysis` entity is **owner-only**. Every operation (read, create, update, delete) requires `created_by_id` to match the current user's `id`.
- The `Source` entity follows the same owner-only pattern.
- Users cannot read, modify, or delete another user's records through standard SDK operations.
- The `User` entity allows admins to list/update/delete other users; regular users cannot.

## Sharing / Read-Only Reports

- A share link contains an `analysisId` and a 64-character hex `share_token`.
- The token is unguessable and stored on the `Analysis` record.
- Shared reports are accessed via the `readSharedReport` backend function, which:
  - Requires the recipient to be authenticated.
  - Validates `analysisId` and `token` format before any database lookup.
  - Returns a field-filtered projection that excludes `owner_email`, `share_token`, `created_by_id`, and other sensitive fields.
  - Returns only records with `status: saved` and `report_ready: true`.
- Recipients have read-only access. No edit, delete, or save controls are available on shared reports.
- The share token is never returned to the recipient.

## Personal Information Handling

- Owner email is collected for report attribution but is private to the owner.
- Shared reports display the owner's name and property location but not the email.
- No personal information is sent to external services.
- No analytics or tracking sends personally identifiable information.

## Security Controls Not Claimed

PropWise does not claim the following controls, which are not implemented:

- Rate limiting on share link generation (relies on platform-level protections).
- Audit logging of data access.
- Data encryption at rest or in transit beyond what the platform provides by default.
- IP-based access restrictions.