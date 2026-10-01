# AGENTS.md

## Project Context

PropWise is a property-financial analysis and decision-support platform. Treat this as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Platform References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update skills before platform-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: PropWise frontend application source.
- `src/lib/finance.js`: the calculation engine (EMI, amortization, projections, affordability, rental).
- `src/lib/AnalysisContext.jsx`: central analysis state provider (workspace, persistence, sharing).
- `src/components/propwise/state/`: workspace state, record management, and payload sanitization.
- `base44/entities/`: entity schemas (Analysis, Source, User).
- `base44/functions/readSharedReport/`: backend function for read-only shared report access.
- `vite.config.js`: Vite config and platform plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use the platform dev command as the default local development command when you need the local backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted backend.
- Prefer the existing SDK client and Vite plugin patterns before adding new integration paths.
- Reuse the existing SDK client and Vite plugin patterns before adding new integration paths.
- Run the relevant checks from `package.json` before finishing code changes.
- Never claim features that do not exist. Refer to `ANALYTICS.md`, `ARCHITECTURE.md`, and `DATA_MODEL.md` for the documented scope.