# PropWise — Project Structure

This document describes the actual repository structure and the responsibility of each directory and key file.

## Top-Level

```
/
├── src/                    Frontend application source
├── base44/                 Platform config, entity schemas, and backend functions
├── public/                 Static assets served at root (manifest, favicon)
├── index.html              HTML entry point (title, metadata, OG tags)
├── package.json            Dependencies and scripts
├── vite.config.js          Vite build config and platform plugin
├── tailwind.config.js      Tailwind theme (semantic tokens mapped to CSS variables)
├── postcss.config.js       PostCSS config
├── jsconfig.json           JS path aliases (@/ → src/)
├── eslint.config.js        Linting config
├── components.json          shadcn/ui config
├── .gitignore
└── *.md                    Documentation (README, ARCHITECTURE, etc.)
```

## `src/`

### `src/pages/`

Route-level React components. Each file is one page.

| File | Route | Purpose |
|---|---|---|
| `Landing.jsx` | `/` | Public landing page |
| `Onboarding.jsx` | `/analysis/new` | 4-step onboarding wizard |
| `Analysis.jsx` | `/analysis/:id`, module routes | Analysis report and modules |
| `SavedAnalyses.jsx` | `/tools/saved` | Saved analyses list |
| `Sources.jsx` | `/tools/sources` | Trusted sources reference |
| `SharedReport.jsx` | `/shared/:id` | Read-only shared report |
| `Login.jsx` | `/login` | Login |
| `Register.jsx` | `/register` | Registration |
| `ForgotPassword.jsx` | `/forgot-password` | Password reset request |
| `ResetPassword.jsx` | `/reset-password` | Password reset |
| `OAuthConsent.jsx` | — | OAuth consent screen |

### `src/components/`

#### `src/components/propwise/`

PropWise-specific components and state.

| Path | Responsibility |
|---|---|
| `PropWiseHeader.jsx` | Desktop header, navigation, and menus |
| `BottomNav.jsx` | Mobile bottom navigation |
| `MobileTools.jsx` | Mobile tools bottom sheet |
| `Logo.jsx` | PropWise logo mark and wordmark |
| `AmbientBackground.jsx` | App-shell ambient background |
| `ModuleHost.jsx` | Hosts analysis modules by group/key |
| `ScenarioCompare.jsx` | Scenario comparison component |
| `ReportStatus.jsx` | Report save status indicator |
| `AnalysisRouteState.jsx` | Loading/error route states |
| `Attribution.jsx` | Source attribution component |
| `SourceBadge.jsx` | Source status badge |
| `ui.jsx` | Shared UI primitives (Button, Field, NumberInput, PercentInput, Select, Section, ResultCard, etc.) |

#### `src/components/propwise/home/`

Landing page sections.

| File | Purpose |
|---|---|
| `Hero.jsx` | Hero section with CTA |
| `HeroDivider.jsx` | Hero visual divider |
| `MetricsBand.jsx` | Key metrics summary |
| `DataDecision.jsx` | Data-driven decision section |
| `ThreeAreas.jsx` | Three analysis areas (affordability, costs, investment) |
| `Scenarios.jsx` | Scenario comparison preview |
| `HowItWorks.jsx` | How it works section |
| `FinalCTA.jsx` | Closing call-to-action |
| `Footer.jsx` | Footer |
| `CalcEngine.jsx` | Calculation flow visual |
| `CalcFlow.jsx` | Calc flow component |
| `CalculationJourney.jsx` | Calculation journey section |
| `WhatItCalculates.jsx` | Feature list section |
| `WhyPropWise.jsx` | Value proposition section |
| `Reveal.jsx` | Scroll-triggered reveal animation |

#### `src/components/propwise/home/charts/`

Miniature charts for the landing page.

`AffordabilityMini.jsx`, `CostMini.jsx`, `InvestmentMini.jsx`, `MiniEmpty.jsx`, `primitives.jsx`

#### `src/components/propwise/modules/`

Analysis module groups (the three tabs).

| File | Modules |
|---|---|
| `AffordabilityModules.jsx` | Setup, Check, EMI Simulator, Payoff Explorer, Future Value |
| `CostModules.jsx` | Cost Builder, Monthly/Annual/One-Time, Breakdown |
| `InvestmentModules.jsx` | Profile, Commitment, Horizon, Rental Income/Yield/Costs/Benefit, Value Projection, Equity, Yearly, Scenario, Property Compare |

#### `src/components/propwise/state/`

Analysis state management.

| File | Responsibility |
|---|---|
| `useAnalysisWorkspace.js` | In-memory workspace state + localStorage browser recovery |
| `useAnalysisRecords.js` | Platform entity CRUD bridge |
| `analysisModel.js` | Input sanitization, validation, and payload construction |

#### `src/components/propwise/report/`

Report rendering components.

`ReportSummary.jsx`, `ReportProjections.jsx`

#### `src/components/propwise/charts/`

`ChartCard.jsx` — reusable chart container.

#### `src/components/propwise/qa/`

`AuditChecklist.md` — manual end-to-end QA checklist.

#### `src/components/ui/`

shadcn/ui component primitives (Radix UI based). These are platform-generated, standard components — not PropWise-specific.

### `src/lib/`

| File | Responsibility |
|---|---|
| `finance.js` | **Calculation engine** — EMI, amortization, projections, affordability, rental, costs |
| `AnalysisContext.jsx` | Central analysis state provider |
| `AuthContext.jsx` | Auth state provider |
| `theme.js` | Theme context (light/dark/system) |
| `chartTheme.js` | Chart color palette by theme |
| `modules.js` | Module and group definitions |
| `demoData.js` | Illustrative demo data for landing page charts |
| `app-params.js` | App parameter utilities |
| `authReturnTo.js` | Post-login redirect resolution |
| `query-client.js` | React Query client |
| `utils.js` | `cn()` class merge utility |
| `PageNotFound.jsx` | 404 page |

### `src/api/`

`base44Client.js` — pre-initialized platform SDK client.

### `src/hooks/`

`use-mobile.jsx`, `use-size.jsx` — responsive hooks.

### `src/utils/`

`index.ts` — shared utilities.

## `base44/`

| Path | Responsibility |
|---|---|
| `config.jsonc` | Project config (name, build/serve commands) |
| `entities/Analysis.jsonc` | Analysis entity schema + RLS |
| `entities/Source.jsonc` | Source entity schema + RLS |
| `entities/User.jsonc` | User entity (role field) |
| `functions/readSharedReport/entry.ts` | Backend function for read-only shared reports |

## `public/`

| File | Purpose |
|---|---|
| `manifest.json` | PWA manifest |
| `favicon.svg` | PropWise favicon |