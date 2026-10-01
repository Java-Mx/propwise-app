# PropWise — Contributing

Thank you for your interest in contributing to PropWise. This document outlines the expectations for development, review, and documentation.

## Development Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Use the platform dev command for local development (backend + frontend together).
4. See `README.md` for full setup instructions.

## Branching

- Create a feature branch from the main branch for each change.
- Use a descriptive branch name (e.g., `fix/emi-rounding`, `feature/scenario-export`).
- Keep branches focused on a single change.

## Commit Conventions

- Write clear, factual commit messages.
- Use the imperative mood (e.g., "Fix EMI rounding for sub-1-lakh loans").
- Reference issues where applicable.
- Avoid claims about features that do not exist.

## Pull Request Expectations

- Describe what changed and why.
- Link to the related issue if one exists.
- Include screenshots for UI changes.
- Verify that the build passes (`npm run build`).
- Verify that existing functionality is not broken.
- Do not introduce generated or placeholder documentation.

## Testing Requirements

- Test functional changes against the checklists in `TESTING.md`.
- For calculation changes, verify against known inputs with expected outputs.
- For persistence changes, verify the full create/save/refresh/reopen/duplicate/rename/delete cycle.
- For routing changes, verify the analysis ID is preserved and invalid IDs show a not-found state.
- For UI changes, verify both light and dark themes at desktop, tablet, and mobile widths.

## Documentation Requirements

- Update `CHANGELOG.md` for meaningful changes.
- Update `DATA_MODEL.md` if entity fields change.
- Update `API.md` if backend function contracts change.
- Update `ARCHITECTURE.md` if structural changes occur.
- Do not document features, APIs, or technologies that do not exist in the repository.
- Do not use generated or placeholder content.

## UI Consistency

- Use the semantic token system (`--pw-*` variables via Tailwind classes) for all colors and text.
- Do not use hardcoded hex values in JSX (use mapped token classes instead).
- Do not use opacity-based dimming for normal text — only genuinely disabled controls may appear dimmed.
- Ensure WCAG AA 4.5:1 contrast for normal text and 3:1 for large text.
- Respect `prefers-reduced-motion`.
- Test both light and dark themes.

## Avoiding Unverified Feature Claims

- Do not claim features that are not implemented.
- Do not describe APIs that do not exist.
- Do not list technologies, databases, or integrations that are not present in the repository.
- If a feature is planned but not built, mark it explicitly as "planned" or "not implemented."