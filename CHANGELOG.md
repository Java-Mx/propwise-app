# Changelog

All notable changes to PropWise are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Added
- PropWise application identity, branding, and product documentation suite:
  - `README.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `ANALYTICS.md`, `API.md`
  - `TESTING.md`, `DEPLOYMENT.md`, `ENVIRONMENT.md`, `SECURITY.md`
  - `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `PROJECT_STRUCTURE.md`
  - `CHANGELOG.md`, `LICENSE`
- PWA manifest (`public/manifest.json`) and PropWise favicon (`public/favicon.svg`).
- Browser title, Open Graph, and Twitter metadata updated to PropWise identity.

### Changed
- Application metadata (page title, description, theme color) updated from default platform branding to PropWise.
- `base44/config.jsonc` project name updated from `untitled` to `propwise`.
- `README.md` rewritten from generic platform documentation to a professional PropWise README.

### Summary of existing application features (documented, not newly added)
- 4-step onboarding wizard (Basic Information, Property & Loan, Financial, Review).
- Affordability module group: Property & Loan Setup, Affordability Check, EMI Simulator, Loan Payoff Explorer, Future Property Value.
- Property Costs module group: Cost Builder, Monthly/Annual/One-Time Cost Analyzers, Ownership Cost Breakdown.
- Investment module group: Buyer Profile, Financial Commitment, Investment Horizon, Rental Income/Yield/Costs/Benefit, Property Value Projection, Equity Growth, Yearly Investment Analysis, Scenario Comparison, Property Comparison.
- Persistent saved analyses with create, save, update, refresh, reopen, duplicate, rename, and delete.
- Read-only shared reports via unguessable share token and the `readSharedReport` backend function.
- Indian currency formatting (rupees, lakhs, crores).
- Light and dark themes with a graphite/charcoal dark-mode system and teal as functional accent.
- Responsive design (desktop, tablet, mobile).
- Central `AnalysisContext` and workspace state for consistent analysis lifecycle.
- Owner-only row-level security on `Analysis` and `Source` entities.
- Semantic text color token system replacing opacity-based dimming for accessibility.
- Backend-function-based secure shared report viewing.

### Notes
- Financial projections depend on user-provided assumptions and are not guaranteed future outcomes.
- PropWise provides estimates for informational and decision-support purposes only. It does not constitute financial, investment, tax, legal, or lending advice.