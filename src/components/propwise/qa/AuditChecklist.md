# PropWise reliability and text-quality audit

## Verification status
- Implementation review completed for persistence, draft recovery, record actions, routing and semantic text colors.
- Frontend compilation was checked during implementation; final compilation must pass after the last edit.
- The read-only report handler's malformed-link check returned 404 (no report data).
- **End-to-end browser tests and the responsive visual matrix below are PENDING.** No runtime save/routing/visual case is marked passed without Testing Agent evidence. Use the Testing Agent side panel; do not infer runtime success from compilation.

## Data contract / implementation review
- The entity's built-in `id` is the ONE analysisId; context exposes it as `analysisId` and `currentId`, wizard stores it as `analysisId`, route and shared report use exactly that value. No second competing ID is assigned.
- Basic Continue creates the database draft once; a persisted draft_key supports recovery after an uncertain create response. Later generation and save update by that database ID only.
- An in-flight operation lock is acquired synchronously before database requests; save buttons reflect processing. Failed writes do not issue success notices.
- Inputs, financial results (including EMI / loan amount), amortization, property/loan/equity yearly projections, lifecycle and save time are persisted; built-in creation/update timestamps remain authoritative.
- Browser recovery is account-scoped and record-scoped. It preserves wizard and unsaved report edits; a saved analysis opened from Saved Analyses explicitly reloads database values.
- A changed server timestamp wins over an older local edit recovery cache; report loading never displays another analysis during the request.
- Duplicate generates an independent database ID and draft key, with no copied sharing token. Rename/delete address exactly one existing ID.
- Copy Link grants authenticated recipients read-only access using an unguessable token; no user email, ownership fields or token are returned by the read handler. Owner-only entity access remains unchanged.
- Legacy reports without calculated snapshots are recomputed from their persisted input data; new saves store snapshots.
- Solid theme tokens control text; only disabled controls, hidden states, entry transitions and decorative ambient layers retain opacity. Chart legend and tooltip text do not inherit low-contrast series colors.

## Test data (Testing Agent only; do not seed real user data)
Use two clearly labelled QA reports with different report names, prices, incomes and loans. Include monthly maintenance, annual property tax, one-time costs, rent, vacancy, rental expenses and explicitly entered appreciation. Capture each report URL/ID and displayed values before and after each action.

## Save / data consistency — PENDING
- [ ] New Analysis starts at Basic Information; required name, full name and email validate inline.
- [ ] Continue creates one draft ID; repeated clicks do not create a second draft.
- [ ] Fill property and financial steps; return to Basic and forward; all values and ID remain intact.
- [ ] Refresh on steps 1, 2, 3 and review; progress, form, draft ID and validation remain correct.
- [ ] Generate report; confirm stable `/analysis/:id` and valid calculations.
- [ ] Add maintenance/taxes/one-time costs and rental inputs; apply appreciation/projection changes.
- [ ] Save repeatedly; confirm one saved entry, not duplicates, and confirmed save status.
- [ ] Refresh report; compare every input, EMI, loan amount and yearly property/loan/equity value with the saved display.
- [ ] Reopen from Saved Analyses; verify database values, not an unrelated cached report.
- [ ] Edit, save and refresh again; ID unchanged, updated values and timestamps correct.
- [ ] Leave an unsaved edit, switch modules and refresh; recover it on the same ID without altering another report.
- [ ] Open saved analysis with local edits explicitly from Saved Analyses; database values load exactly.
- [ ] Create second report; alternate between both; their details, costs, rental inputs and calculations remain independent.
- [ ] Simulate write/read failures; no fake success, inputs retained, readable error shown, retry works.
- [ ] Simulate list failure; show retry/error rather than a fake empty Saved Analyses list.
- [ ] Deny browser draft storage; show recovery warning while successful database saves still work.

## Routing / management — PENDING
- [ ] All New Analysis / Start Property Analysis actions lead to Basic Information, including footer CTA and Saved Analyses empty state.
- [ ] Direct `/analysis` goes to Basic Information.
- [ ] Direct legacy module routes without a complete active analysis go to Basic Information.
- [ ] Legacy routes with a complete active analysis redirect to the same ID and intended group/module.
- [ ] Module header, segmented switcher and mobile bottom navigation retain the ID.
- [ ] Browser back/forward across wizard, modules, Saved Analyses and reports preserves the correct analysis.
- [ ] Direct `/analysis/:id` loads that exact database record; refresh repeats correctly.
- [ ] A database draft opened by ID reconstructs Basic Information with the SAME ID even without browser recovery data.
- [ ] Missing/invalid/deleted/other-owner IDs show a usable not-found state, never another report or blank screen.
- [ ] Transient report-load failures show Retry rather than a misleading deleted-record message.
- [ ] Duplicate creates a new independent ID; edit copy and confirm original remains unchanged.
- [ ] Rename persists immediately on existing ID; blank rename rejected; failure keeps dialog available.
- [ ] Delete confirmation removes only selected report; repeated confirmation disabled; failure remains visible.
- [ ] Copy Link opens correct read-only report; no save/edit/delete controls exist there.
- [ ] Signed-out shared recipient signs in and returns to exact shared URL; wrong/missing token returns not-found.
- [ ] Refresh shared report shows saved snapshot, including assumptions, costs and yearly results; email remains private.
- [ ] Existing saved analyses bypass onboarding; successful Save stays on their correct report URL.

## Visual / contrast matrix — PENDING
Run each item in LIGHT and DARK at DESKTOP (1079+), TABLET and MOBILE widths.
- [ ] Landing: heading/subtitles, flow cards, illustrative charts, metrics, scenarios, navigation and footer.
- [ ] Onboarding: all four steps, placeholders, selects/custom percentages, hints, validation, step labels, review and loading states.
- [ ] Affordability: setup/check, simulator, payoff, future-value labels, statistics, currency, pills and chart ticks/tooltips.
- [ ] Property Costs: builders, monthly/annual/one-time/ownership results, tables, legends and tooltips.
- [ ] Investment: profile/commitment/horizon, rental inputs/yield/costs/benefit, projections/equity/yearly tables and comparison charts.
- [ ] Saved Analyses: empty/loading/error/list states, metadata, action buttons and rename/delete dialogs.
- [ ] Shared report: heading/metadata, assumptions, costs, all chart/table values and bottom disclaimer.
- [ ] Trusted Sources and reference dialogs: text, pills, inputs, dropdowns and empty states.
- [ ] Login/register/OTP/password reset, restricted-access and not-found screens.
- [ ] Desktop dropdowns, mobile top pills, bottom navigation, Tools sheet, settings/help/save-name dialogs and feedback.
- [ ] No active label/value/control looks disabled; only genuinely disabled controls use reduced opacity.
- [ ] Normal-size text reaches WCAG AA 4.5:1; large text reaches 3:1 on its actual rendered surface, including hover states.
- [ ] Long report names, full names and locations wrap/truncate without hiding actions; no currency overlap or mobile clipping.

## Required final acceptance scenario — PENDING
Create New Analysis → Basic Information → enter data → generate report → save → refresh → open Saved Analysis → edit → save → refresh → Copy Link → open read-only report. Record the stable ID, exact values, database confirmation and failure behavior at each stage. Do NOT call this audit fully verified until this scenario and the matrix have passed.