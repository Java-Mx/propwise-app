# PropWise — Deployment

## Overview

PropWise is deployed through the platform's managed hosting. The repository syncs to the platform via git — pushing changes to the repository reflects them in the builder, and publishing from the dashboard deploys them.

## Prerequisites

- A clean working tree with all changes committed and pushed.
- The build must pass locally: `npm run build`.
- The application must have been published at least once for local development to work.

## Build

```bash
npm run build
```

This runs Vite, which:
1. Bundles the React application.
2. Processes Tailwind CSS with the semantic token system.
3. Outputs static files to `dist/`.

The platform's Vite plugin handles SDK integration, analytics tracking, and navigation notifications during the build.

## Environment Variables

See `ENVIRONMENT.md` for the full list. No secrets are stored in the repository.

## Production Configuration

Production configuration is managed through the platform dashboard:

- **App Settings** — app visibility, badge, custom domains.
- **Authentication** — login methods (email/password, Google, etc.).
- **Security** — security scan, headers, and advanced settings.
- **Secrets** — environment variables for backend functions.

## Deployment Process

1. **Push changes to the repository.** The repository syncs to the platform via git.
2. **Open the platform dashboard.**
3. **Publish the app** from the dashboard. This deploys the current repository state.

> Do not use a CLI deploy that ships the local tree directly — it bypasses the git sync and the deployed state can diverge from the repository. Always publish from the dashboard after pushing.

## Verification

After deployment, verify:

1. The published URL loads the PropWise landing page.
2. The browser title shows "PropWise — Property Financial Analysis & Decision Support".
3. The favicon is the PropWise mark.
4. Login and registration work.
5. Creating a new analysis works end-to-end (onboarding → report → save).
6. Saved analyses load correctly after refresh.
7. Share links open read-only reports for authenticated recipients.
8. Both light and dark themes render correctly.
9. Mobile and desktop layouts are correct.

## Common Deployment Issues

- **Blank page after deploy** — check the browser console for build or routing errors.
- **Auth redirect loop** — verify authentication settings in the dashboard.
- **Shared report 404** — verify the `readSharedReport` function is deployed and the share token is valid.
- **Data not persisting** — verify entity RLS configuration matches the schema in `base44/entities/`.
- **Dark mode text unreadable** — verify the semantic token system in `src/index.css` is up to date.