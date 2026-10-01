# PropWise — API

## Overview

PropWise does not expose a custom public REST API. The application interacts with its data through the platform SDK (`base44.entities.*`, `base44.functions.invoke`) from the frontend, and through serverless backend functions for operations that require elevated access.

## Platform SDK (Client-Side)

The frontend uses the pre-initialized SDK client (`src/api/base44Client.js`) to read and write entity records. All calls run as the authenticated user and are subject to row-level security.

### Analysis Entity Operations

| Operation | Method | Purpose |
|---|---|---|
| List | `base44.entities.Analysis.list()` | Fetch the current user's saved analyses |
| Get | `base44.entities.Analysis.get(id)` | Load a single analysis by ID |
| Create | `base44.entities.Analysis.create(data)` | Create a new analysis record |
| Update | `base44.entities.Analysis.update(id, data)` | Update an existing analysis |
| Delete | `base44.entities.Analysis.delete(id)` | Delete an analysis |
| Filter | `base44.entities.Analysis.filter(query)` | Query analyses by field |

All operations are owner-only via RLS — `created_by_id` must match the current user.

### Source Entity Operations

Same pattern: `base44.entities.Source.list()`, `.get()`, `.create()`, `.update()`, `.delete()`, `.filter()`.

## Backend Functions

### `readSharedReport`

**Purpose:** Allows an authenticated recipient to view a read-only shared analysis report by providing the analysis ID and the owner's share token. This is the only path that bypasses owner-only RLS.

**File:** `base44/functions/readSharedReport/entry.ts`

**Method:** POST (invoked via `base44.functions.invoke("readSharedReport", { analysisId, token })`)

**Input:**

```json
{
  "analysisId": "string (8–100 chars, alphanumeric + _ -)",
  "token": "string (64-char hex)"
}
```

**Output (success — 200):**

```json
{
  "report": {
    "id": "string",
    "title": "string",
    "owner_name": "string",
    "property_location": "string",
    "property_type": "string",
    "property_price": "number",
    "amount_saved": "number",
    "home_loan_percentage": "number",
    "monthly_income": "number",
    "existing_emi": "number",
    "interest_rate": "number",
    "loan_tenure_years": "number",
    "costs": "array",
    "monthly_rent": "number",
    "annual_rent_increase": "number",
    "vacancy_rate": "number",
    "annual_rental_maintenance": "number",
    "other_rental_costs": "number",
    "annual_appreciation": "number",
    "projection_years": "number",
    "scenarios": "array",
    "calculated": "object",
    "calculation_version": "number",
    "created_date": "string",
    "updated_date": "string",
    "saved_at": "string",
    "lifecycle": "string"
  }
}
```

**Fields explicitly excluded from the response:** `owner_email`, `share_token`, `status`, `report_ready`, `draft_key`, `created_by_id`. The recipient never sees the owner's email or the sharing token.

**Authentication:** Required. The recipient must be a signed-in app user.

**Error behavior:**

| Status | Condition | Response |
|---|---|---|
| 401 | Not authenticated, or auth error | `{"error": "Sign in to view this shared report."}` |
| 404 | Invalid `analysisId` or `token` format, no matching record, or `report_ready` is false | `{"error": "Shared report not found."}` |
| 500 | Unexpected server error | `{"error": "Unable to load the shared report. Please retry."}` |

**Security notes:**

- `analysisId` is validated against `^[a-zA-Z0-9_-]{8,100}$`.
- `token` is validated against `^[a-f0-9]{64}$`.
- The function uses `asServiceRole` to read the record, but only returns a field-filtered projection.
- No mutation, no general lookup, and no token exposure is permitted through this function.

## No External APIs

PropWise does not call any external third-party REST APIs. The platform's built-in Core integration (LLM, email, file upload, image generation) is available but not currently used in the application's core flows.