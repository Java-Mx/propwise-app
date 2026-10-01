# PropWise — Testing

## Overview

PropWise is a financial analysis application where correctness, persistence reliability, and visual clarity are critical. This document defines the testing strategy and checklists.

## Testing Categories

### Functional Testing

Verify that each user-facing feature works as designed.

- [ ] **Basic Information** — onboarding step 1 validates required name, full name, and email fields.
- [ ] **Property inputs** — property price, savings, property type, and location are captured and persisted.
- [ ] **Loan inputs** — loan percentage, interest rate, and tenure are captured and reflected in EMI calculations.
- [ ] **Cost inputs** — monthly, annual, and one-time costs are added, categorized, and summed correctly.
- [ ] **Rental inputs** — monthly rent, growth, vacancy, and rental costs are captured.
- [ ] **Calculations** — EMI, monthly cost, affordability ratio, loan balance, equity, and yield produce correct values for known inputs.
- [ ] **Reports** — the analysis report displays all inputs and calculated results consistently.
- [ ] **Saved analyses** — the saved analyses list loads, displays metadata, and supports open/share/duplicate/rename/delete.

### Persistence Testing

Verify that analysis data survives across sessions and operations.

- [ ] **Create** — onboarding creates exactly one draft record with a stable ID.
- [ ] **Save** — repeated saves update the same record without creating duplicates.
- [ ] **Update** — editing inputs and saving persists the new values and a fresh calculated snapshot.
- [ ] **Refresh** — refreshing the report page reloads the saved values from the database.
- [ ] **Reopen** — opening a saved analysis from the list loads database values, not a stale local cache.
- [ ] **Duplicate** — creates a new independent record with a new ID and no copied share token.
- [ ] **Rename** — updates the title on the existing record; blank names are rejected.
- [ ] **Delete** — removes the correct record; confirmation prevents accidental deletion.
- [ ] **Copy/share link** — generates a share token; the link opens a read-only report for an authenticated recipient.
- [ ] **Browser recovery** — unsaved edits survive a refresh; a newer server timestamp wins over a stale local cache.

### Route Testing

Verify that routing preserves the correct analysis at every step.

```
Basic Information → Analysis → Report → Saved Analysis → Shared Report
```

- [ ] All "New Analysis" / "Start Property Analysis" entry points lead to onboarding (Basic Information).
- [ ] Direct `/analysis` redirects to onboarding.
- [ ] Direct `/analysis/:id` loads the correct database record by ID.
- [ ] Legacy module routes (`/analysis/affordability`, `/analysis/property-costs`, `/analysis/investment`) redirect to the correct ID-based URL.
- [ ] Module header, segmented switcher, and mobile bottom navigation preserve the analysis ID.
- [ ] Browser back/forward across wizard, modules, saved analyses, and reports preserves the correct analysis.
- [ ] Missing, invalid, or deleted IDs show a usable not-found state — never a blank screen or another user's report.
- [ ] The same `analysisId` is preserved throughout the lifecycle (onboarding → report → save → reopen → share).

### Calculation Testing

Verify financial formulas against known inputs.

- [ ] **EMI** — reducing-balance EMI matches standard formula for known principal, rate, and tenure.
- [ ] **Monthly ownership cost** — EMI + monthly costs summed correctly.
- [ ] **Commitment ratio** — (property cost + existing EMI) / income, computed and categorized (lower/moderate/high/very high).
- [ ] **Remaining income** — income − total monthly commitment.
- [ ] **Loan balance** — remaining principal after N years matches amortization.
- [ ] **Property value projection** — future value = present × (1 + rate)^years.
- [ ] **Equity** — projected value − remaining loan balance.
- [ ] **Rental calculations** — gross annual rent, vacancy loss, rental expenses, net annual rental, and yield.
- [ ] **Payoff with extra** — extra monthly payment reduces tenure and interest correctly.

### UI Testing

Verify visual correctness across viewports and themes.

- [ ] **Desktop** (1079px+) — all pages, modules, charts, tables, and dialogs.
- [ ] **Tablet** — responsive layouts and navigation.
- [ ] **Mobile** — bottom navigation, tools sheet, collapsible sections, and no horizontal overflow.
- [ ] **Light mode** — readable text, proper contrast, no dimmed content.
- [ ] **Dark mode** — graphite/charcoal surfaces, teal accents, readable text, no dimmed content.
- [ ] **Charts** — Recharts renders correctly in both themes; tooltips and legends are readable.
- [ ] **Forms** — inputs validate, number formatting (Indian) works, percent inputs accept decimals.
- [ ] **Navigation** — desktop dropdowns, mobile pills, and bottom tabs all reach the correct destinations.
- [ ] **Error states** — loading, error, empty, and not-found states are clear and actionable.

### Accessibility Testing

#### Text Contrast / Dim Text Audit

Every page and component must be checked for:

- [ ] No unnecessary opacity on normal text.
- [ ] No disabled-looking normal text.
- [ ] No low-contrast labels.
- [ ] No low-contrast chart legends.
- [ ] No low-contrast navigation text.
- [ ] No low-contrast values.
- [ ] No low-contrast placeholders.
- [ ] No low-contrast dark-mode text.
- [ ] No low-contrast mobile text.
- [ ] No low-contrast buttons.

**Rule:** Normal content must never look disabled. Only genuinely disabled controls (e.g., a save button during an in-flight request) may use reduced opacity.

Normal-size text must reach WCAG AA 4.5:1 contrast. Large text must reach 3:1 on its actual rendered surface, including hover states.

#### Other Accessibility Checks

- [ ] Keyboard navigation works for all interactive elements.
- [ ] Focus states are visible.
- [ ] Forms have associated labels.
- [ ] Charts have accessible text alternatives or tooltips.
- [ ] Reduced-motion is respected (Framer Motion animations disabled).

## Manual QA Checklist

A detailed end-to-end checklist is maintained at `src/components/propwise/qa/AuditChecklist.md`. This covers the full save/route/share lifecycle and a responsive visual matrix across desktop, tablet, and mobile in light and dark themes.