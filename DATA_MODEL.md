# PropWise — Data Model

## Overview

PropWise persists two custom entities (`Analysis`, `Source`) and uses the built-in `User` entity. All entities are stored in the platform's document database with JSON-schema validation and row-level security.

## Entities

### Analysis

The primary persisted record. Each analysis represents one user's complete property-financial analysis — inputs, calculated results, and sharing state.

**Entity schema:** `base44/entities/Analysis.jsonc`

#### Identity / Report Information

| Field | Type | Description |
|---|---|---|
| `title` | string (required) | Report name, set during onboarding |
| `owner_name` | string | Full name of the report owner |
| `owner_email` | string | Email of the report owner |
| `property_location` | string | Property location/city (optional) |
| `property_type` | string (enum) | Apartment, Villa, Independent House, Row House, Plot, Other |
| `status` | string (enum) | `draft` or `saved` |
| `report_ready` | boolean | Whether the report is ready for display |
| `lifecycle` | string (enum) | `created` or `updated` |
| `share_token` | string | 64-char hex token for read-only sharing (empty if not shared) |
| `draft_key` | string | Local draft recovery key |

#### Property & Financial Information

| Field | Type | Description |
|---|---|---|
| `property_price` | number | Property purchase price |
| `amount_saved` | number | Available savings for down payment |
| `monthly_income` | number | Buyer's monthly income |
| `existing_emi` | number | Existing monthly EMI obligations |

#### Loan Information

| Field | Type | Description |
|---|---|---|
| `home_loan_percentage` | number | Loan-to-value percentage (e.g. 80) |
| `interest_rate` | number | Annual interest rate (e.g. 8.5) |
| `loan_tenure_years` | number | Loan tenure in years |

#### Ownership Costs

| Field | Type | Description |
|---|---|---|
| `costs` | array | User-defined cost items, each with `section` (monthly/annual/onetime), `category`, `amount`, `frequency` |

#### Rental Information

| Field | Type | Description |
|---|---|---|
| `monthly_rent` | number | Expected monthly rental income |
| `annual_rent_increase` | number | Annual rent growth percentage |
| `vacancy_rate` | number | Expected vacancy percentage |
| `annual_rental_maintenance` | number | Annual rental maintenance cost |
| `other_rental_costs` | number | Other annual rental costs |

#### Projection Data

| Field | Type | Description |
|---|---|---|
| `annual_appreciation` | number | Annual property appreciation percentage |
| `projection_years` | number | Projection horizon in years |
| `scenarios` | array | Up to 3 comparison scenarios, each with its own price, savings, loan %, rate, tenure, and rent |
| `calculated` | object | Confirmed financial results at save time (EMI, loan amount, amortization, yearly projections) |
| `calculation_version` | number | Schema version of the calculated snapshot |

#### Timestamps (built-in)

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique record identifier (the analysisId) |
| `created_date` | date-time | Creation timestamp |
| `updated_date` | date-time | Last update timestamp |
| `created_by_id` | string | Owner user ID |
| `saved_at` | date-time | Last successful save timestamp |

#### Row-Level Security

The `Analysis` entity is **owner-only**. Every operation (read, create, update, delete) requires `created_by_id` to match the current user's `id`. Shared reports bypass this exclusively through the `readSharedReport` backend function, which validates a share token before returning a filtered projection.

### Source

Trusted reference sources for market data used in PropWise analysis.

**Entity schema:** `base44/entities/Source.jsonc`

| Field | Type | Description |
|---|---|---|
| `name` | string (required) | Source name |
| `category` | string (enum, required) | Interest Rates, Property Values, Rental Market, Taxes & Fees, Economic Assumptions, General References |
| `url` | string | Source URL |
| `description` | string | What the source covers |
| `data_used` | string | Specific data points referenced |
| `notes` | string | Additional notes |
| `status` | string (enum) | Official, Verified, User Provided, Reference, Assumption |
| `last_checked` | date | Date the source was last verified |

RLS: Owner-only (same pattern as Analysis).

### User

Built-in entity. PropWise does not add custom fields beyond the default `role` (admin/user).

## The `analysisId` Concept

The `analysisId` is the entity record's built-in `id` field. It is the single stable identifier that connects every stage of the analysis lifecycle:

```
Basic Information (onboarding)
    ↓ assigns analysisId
Inputs (property, financial, costs, rental)
    ↓ same analysisId
Calculations (EMI, projections, affordability)
    ↓ same analysisId
Saved Analysis (persisted record)
    ↓ same analysisId
Report (viewable at /analysis/:id)
    ↓ same analysisId
Shared Report (viewable at /shared/:id with token)
    ↓ same analysisId
```

No secondary or competing ID is generated. The onboarding wizard creates one database draft record; all subsequent edits, saves, and views operate on that same record by its `id`.

## Persistence Behavior

- **Create:** Onboarding creates a single `Analysis` record with `status: draft`.
- **Generate report:** The record's `report_ready` is set to `true` and `status` to `saved`; a calculated snapshot is stored in `calculated`.
- **Save:** Inputs and a fresh calculated snapshot are written to the existing record. The `id` never changes.
- **Duplicate:** A new independent record is created with a new `id` and no copied `share_token`.
- **Rename:** The `title` field is updated on the existing record.
- **Delete:** The record is removed.
- **Copy Link:** A `share_token` is generated and stored on the record.

## Browser Recovery

The workspace maintains a browser-local (localStorage) cache of unsaved edits keyed by `analysisId` and user ID. This supports recovery after refresh or accidental navigation. On conflict, a newer server `updated_date` wins over a stale local cache. Explicitly opening a saved analysis from the Saved Analyses list always loads database values, overriding any local cache.