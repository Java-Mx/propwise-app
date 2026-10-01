# PropWise

**Property Financial Analysis & Decision Support**

*Think Beyond the Price.*

---

## Overview

PropWise is a property-financial analysis and decision-support platform that helps users evaluate property affordability, ownership costs, rental potential, and long-term financial outcomes through a single personalized analysis.

Property decisions involve far more than purchase price or EMI. PropWise consolidates a user's financial situation, property details, loan and funding assumptions, ownership costs, rental expectations, and long-term projections into one integrated, transparent analysis — so a buyer can see the full financial picture before committing.

## Problem Statement

Most property calculators stop at EMI. A buyer's real question is broader:

- *Can I afford this property given my income, existing obligations, and savings?*
- *What will this property actually cost me every month and every year?*
- *How much will rental income offset my ownership costs?*
- *What will my equity, loan balance, and property value look like in 5, 10, or 20 years?*
- *How do different scenarios compare?*

PropWise addresses this gap by connecting user financial situation, property details, loan/funding assumptions, ownership costs, rental assumptions, and long-term projections into a single integrated analysis — rather than treating each as an isolated calculator.

## Objectives

- **Property affordability analysis** — assess whether a property is within financial reach.
- **Monthly ownership-cost analysis** — break down what a property costs each month.
- **Loan and EMI analysis** — simulate loan assumptions and payoff strategies.
- **Rental analysis** — estimate gross-to-net rental income, yield, and net benefit.
- **Long-term property-value analysis** — project appreciation and future value.
- **Loan-balance and equity projections** — track how equity builds over time.
- **Personalized reports** — produce a named, owner-attributed analysis.
- **Persistent saved analyses** — save, revisit, rename, duplicate, and delete reports.
- **Scenario-based decision support** — compare up to three property or financing scenarios side by side.

## Key Features

The following features are implemented in this repository:

- **4-step onboarding wizard** — Basic Information, Property & Loan, Financial, Review — collects all inputs before generating a report.
- **Affordability module group** — Property & Loan Setup, Affordability Check, EMI Simulator, Loan Payoff Explorer, Future Property Value.
- **Property Costs module group** — Cost Builder, Monthly Cost Analyzer, Annual Cost Analyzer, One-Time Cost Calculator, Ownership Cost Breakdown.
- **Investment module group** — Buyer Profile, Financial Commitment, Investment Horizon, Rental Income, Rental Yield, Rental Costs, Net Rental Benefit, Property Value Projection, Equity Growth, Yearly Investment Analysis, Scenario Comparison, Property Comparison.
- **Shared/read-only reports** — an unguessable share token grants authenticated recipients read-only access to a saved report.
- **Indian currency formatting** — values display in rupees, lakhs, and crores throughout.
- **Light and dark themes** — a graphite/charcoal dark-mode system with teal reserved as a functional accent.
- **Responsive design** — desktop, tablet, and mobile layouts.

## Analytics

PropWise structures its analysis around four analytical layers:

### Descriptive Analytics — *What is happening now?*
Monthly property cost, EMI, commitment ratio, remaining income, and cost composition.

### Diagnostic Analytics — *Why is it happening?*
Loan amount driving EMI, interest-rate impact, tenure impact, ownership-cost drivers, and rental-contribution drivers.

### Predictive Analytics — *What could happen?*
Property value projection, loan-balance projection, estimated equity, and rental scenarios. Predictive results are scenario-based and assumption-dependent — not guaranteed future outcomes.

### Prescriptive Analytics — *What should I examine?*
Test a different loan amount, compare contribution levels, test different property prices, compare financing scenarios, and examine sensitivity to assumptions.

See `ANALYTICS.md` for the full detail.

## Application Workflow

```
Basic Information
    ↓
Property & Financial Inputs
    ↓
Affordability Analysis
    ↓
Property Cost Analysis
    ↓
Rental Analysis
    ↓
Long-Term Investment Analysis
    ↓
Report
    ↓
Save / Revisit / Share
```

## Technology

PropWise is built with:

- **React 18** — UI library
- **Vite** — build tool and dev server
- **Tailwind CSS** — utility-first styling with a semantic token system
- **Recharts** — financial charts and projections
- **Framer Motion** — subtle entrance animations (respects reduced-motion)
- **React Router** — client-side routing
- **shadcn/ui** — component primitives (Radix UI based)

The calculation engine (`src/lib/finance.js`) is framework-agnostic pure JavaScript.

## Project Structure

See `PROJECT_STRUCTURE.md` for a detailed breakdown. Key directories:

```
src/
  pages/          Route-level React components
  components/
    propwise/     PropWise-specific UI, modules, state, and home sections
    ui/           shadcn/ui component primitives
  lib/            Finance engine, contexts, theme, and utilities
  api/            SDK client
base44/
  entities/       Data schemas (Analysis, Source, User)
  functions/      Backend functions (readSharedReport)
public/
  manifest.json   PWA manifest
  favicon.svg     PropWise favicon
```

## Installation / Setup

### Prerequisites

1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Use the platform CLI for local development (see the platform docs for the CLI reference).

### Run Locally

```bash
npm install
# Then use the platform dev command (runs backend + frontend together)
```

Open the frontend URL the dev command prints (typically `http://localhost:5173`).

### Frontend Only, Hosted Backend

To work on just the frontend against the live hosted backend:

```bash
npm run dev -- --remote
```

> In this mode writes go to production data. Use the standard local dev command for sandboxed data.

### Build

```bash
npm run build
```

Output is written to `dist/`.

## Environment Variables

See `ENVIRONMENT.md` for the full list. No secrets are committed to this repository.

## Testing

See `TESTING.md` for the testing approach, including functional, persistence, route, calculation, UI, and accessibility testing categories.

## Deployment

See `DEPLOYMENT.md` for the deployment process.

## Limitations

PropWise provides estimates based on user-provided assumptions and is intended for informational and decision-support purposes only. It does **not** constitute financial, investment, tax, legal, or lending advice.

Financial projections (property value, loan balance, equity, rental income) depend on user-supplied assumptions about appreciation, interest rates, rental growth, vacancy, and other factors. Actual results will differ. PropWise does not guarantee any future outcome.

## Screenshots

> **Screenshots pending.** Add images to `docs/screenshots/` and reference them here.
>
> Suggested captures: homepage, basic information (onboarding step 1), affordability, property costs, investment analysis, saved analyses, shared report, and mobile views.

## License

See `LICENSE`.

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture and data flow |
| [DATA_MODEL.md](DATA_MODEL.md) | Analysis data structure and field documentation |
| [ANALYTICS.md](ANALYTICS.md) | Analytical layers and methodology |
| [API.md](API.md) | Backend function documentation |
| [TESTING.md](TESTING.md) | Testing strategy and checklists |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment process |
| [ENVIRONMENT.md](ENVIRONMENT.md) | Environment configuration |
| [SECURITY.md](SECURITY.md) | Security policy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Code of conduct |
| [CHANGELOG.md](CHANGELOG.md) | Change history |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Repository structure reference |