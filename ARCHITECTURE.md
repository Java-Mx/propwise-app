# PropWise — Architecture

## Overview

PropWise is a single-page React application backed by a managed platform that provides authentication, a document database (entities), serverless backend functions, and file storage. The application's core intellectual property is a pure-JavaScript financial calculation engine that is framework-agnostic and testable in isolation.

## Application Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation (UI)                     │
│   React components · Tailwind tokens · Recharts charts   │
├─────────────────────────────────────────────────────────┤
│                Application Logic (State)                 │
│  AnalysisContext · Workspace state · Record management   │
├─────────────────────────────────────────────────────────┤
│              Analysis / Calculation Engine               │
│        src/lib/finance.js — EMI, projections, yield      │
├─────────────────────────────────────────────────────────┤
│               Data / Persistence Layer                   │
│     Platform SDK (entities, functions, auth, files)     │
└─────────────────────────────────────────────────────────┘
```

### Frontend / UI

- **React 18** with React Router for client-side routing.
- **Tailwind CSS** with a custom semantic token system (`--pw-*` variables) for light/dark theming.
- **shadcn/ui** primitives in `src/components/ui/` for accessible form controls, dialogs, and overlays.
- **PropWise-specific UI** in `src/components/propwise/` — header, bottom nav, modules, home sections, report views.
- **Recharts** for all financial visualizations (area, bar, line charts).
- **Framer Motion** for subtle entrance animations, disabled when `prefers-reduced-motion` is set.

### Application Logic / State

- **`src/lib/AnalysisContext.jsx`** — the central React context provider. It coordinates:
  - The active analysis workspace (inputs, calculated results, dirty state).
  - Persistence operations (save, load, create, duplicate, rename, delete).
  - Share-link generation for read-only reports.
  - Toast feedback for save/error states.
- **`src/components/propwise/state/useAnalysisWorkspace.js`** — manages in-memory workspace state and localStorage-based browser recovery for unsaved drafts.
- **`src/components/propwise/state/useAnalysisRecords.js`** — bridges workspace state to platform entity CRUD operations.
- **`src/components/propwise/state/analysisModel.js`** — sanitizes and validates user inputs before persistence (coercing empty strings to numeric defaults, validating finite non-negative values).

### Analysis / Calculation Engine

`src/lib/finance.js` is the calculation core. It is pure JavaScript with no React or platform dependencies, making it independently testable. Key functions:

| Function | Purpose |
|---|---|
| `calculateEMI(principal, rate, months)` | Reducing-balance EMI |
| `remainingLoanBalance(principal, rate, tenure, elapsed)` | Outstanding principal after N years |
| `futureValue(present, rate, years)` | Compound future value |
| `buildAmortization(principal, rate, years)` | Full amortization schedule |
| `buildYearlyProjection(input)` | Yearly property value, loan balance, equity, rental, costs |
| `computeAll(input)` | Full affordability + cost + rental + investment results |
| `payoffWithExtra(principal, rate, years, extra)` | Early-payoff scenario |
| `computeScenarioSummary(scenario, appreciation)` | Per-scenario metrics for comparison |
| `costBreakdown(input)` | Monthly/annual/one-time cost categorization |

### Data / Persistence Layer

The platform provides:

- **Entities** — JSON-schema-defined stored objects. PropWise uses:
  - `Analysis` — the primary persisted analysis record (inputs, calculated snapshot, share token).
  - `Source` — trusted reference sources for market data.
  - `User` — built-in user entity (read-only fields plus role).
- **Row-Level Security (RLS)** — the `Analysis` entity is owner-only: only the creator can read, update, or delete their own records. Shared reports bypass this via the `readSharedReport` backend function using an unguessable token.
- **Backend Functions** — serverless handlers in `base44/functions/`. The `readSharedReport` function elevates access for authenticated recipients holding a valid share token.

## Routing

```
/                          Landing page (public)
/login                     Login
/register                  Registration
/forgot-password           Password reset request
/reset-password            Password reset (with token)

/analysis                  → redirect to /analysis/new
/analysis/new              Onboarding wizard (4 steps)
/analysis/affordability    Affordability module group
/analysis/property-costs   Property Costs module group
/analysis/investment       Investment module group
/analysis/:id              Analysis report by ID
/tools/saved               Saved analyses list
/tools/sources             Trusted sources
/shared/:id                Read-only shared report
*                          404 not found
```

Authenticated routes are wrapped in a `ProtectedRoute` guard. The `AnalysisProvider` context scopes state to the current user.

## Reporting

A completed analysis produces a named report containing:

- Report metadata (title, owner name, location, property type).
- All user inputs (property price, savings, loan terms, income, costs, rental assumptions).
- A calculated snapshot (EMI, loan amount, affordability metrics, cost breakdown, yearly projections).
- The snapshot is persisted at save time so shared reports remain stable even if the owner later edits the analysis.

## Saved Analysis Lifecycle

```
New Analysis (onboarding)
    ↓
Draft created (database record, status: draft)
    ↓
Report generated (report_ready: true, status: saved)
    ↓
Edit modules → dirty state
    ↓
Save → persist inputs + calculated snapshot
    ↓
Refresh → reload from database
    ↓
Duplicate → new independent record
Rename → update title on existing record
Delete → remove record
Copy Link → generate share_token
```

## Shared / Read-Only Reports

```
Owner generates share link
    ↓
Share token (64-char hex) stored on Analysis record
    ↓
Recipient opens /shared/:id
    ↓
readSharedReport backend function:
    - Verifies recipient is authenticated
    - Matches analysisId + share_token + status: saved
    - Returns a filtered projection (no owner email, no share_token)
    ↓
Recipient views read-only report (no edit/delete/save controls)
```

The backend function is the only path that bypasses owner-only RLS. It accepts a validated `analysisId` and `token`, and returns a field-filtered projection that excludes sensitive fields. See `API.md` for the full contract.

## External Services

PropWise does not integrate external third-party APIs beyond the platform's built-in Core integration (which provides LLM invocation, email, file upload, image generation, etc. — used only where applicable). No external data feeds, market APIs, or payment gateways are currently connected.