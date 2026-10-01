# PropWise — Environment Configuration

## Overview

PropWise uses environment variables for platform configuration and backend function secrets. No real secrets are committed to this repository — `.env` and `.env.*` are gitignored.

## Environment Variables

| Variable | Purpose | Required | Example Format |
|---|---|---|---|
| `BASE44_LEGACY_SDK_IMPORTS` | Enables legacy SDK import paths (`@/integrations`, `@/entities`) for older code. Set to `true` only if the code has not been updated to use `@base44/sdk` imports. | Optional | `true` |

### Platform-Managed Configuration

The following are configured through the platform dashboard (Secrets page), not through `.env` files:

| Secret | Purpose | Required |
|---|---|---|
| Third-party API keys | If PropWise integrates external services via backend functions | Optional (none currently used) |

PropWise currently does not use any external third-party API keys. The platform's built-in Core integration (LLM, email, file upload, image generation) is configured at the platform level.

## Local Development

For local development, environment variables can be placed in `.env.local`:

```bash
# .env.local — never commit this file
BASE44_LEGACY_SDK_IMPORTS=false
```

## Production

Production secrets are managed through the platform dashboard's Secrets page. They are injected into backend functions at runtime as `process.env.<SECRET_NAME>`.

## Security Notes

- Never commit `.env`, `.env.local`, or any file containing real API keys, passwords, or tokens.
- Use placeholders like `YOUR_API_KEY_HERE` in documentation.
- If a secret is accidentally committed, rotate it immediately and remove it from the repository history.