# PropWise — Analytics

PropWise structures its analysis around four analytical layers. Each answers a distinct question about a property decision.

> **Important:** Predictive and prescriptive results are scenario-based and assumption-dependent. They are not guaranteed future outcomes. See `README.md` → Limitations.

## Descriptive Analytics

### What is happening now?

Descriptive analytics summarize the current state of a property analysis from the user's inputs.

**Examples in PropWise:**

- **Monthly property cost** — EMI plus monthly maintenance, society charges, and other recurring costs.
- **EMI** — the equated monthly installment for the calculated loan amount.
- **Commitment ratio** — total monthly commitments (property cost + existing EMI) as a percentage of monthly income.
- **Remaining income** — income left after all monthly obligations.
- **Cost composition** — the breakdown of monthly/annual/one-time costs by category (maintenance, property tax, stamp duty, etc.).

**Where it appears:** Affordability Check, Monthly Cost Analyzer, Annual Cost Analyzer, Ownership Cost Breakdown, Financial Commitment.

## Diagnostic Analytics

### Why is it happening?

Diagnostic analytics explain what drives the numbers, helping the user understand cause and effect.

**Examples in PropWise:**

- **Loan amount driving EMI** — how the property price minus savings determines the loan, which determines the EMI.
- **Interest rate impact** — how a 0.5% rate change affects monthly payment and total interest.
- **Tenure impact** — how a longer tenure reduces EMI but increases total interest paid.
- **Ownership-cost drivers** — which cost categories (maintenance, tax, insurance) dominate the monthly burden.
- **Rental contribution drivers** — how vacancy rate and rental expenses reduce gross rent to net rental income.

**Where it appears:** EMI Simulator, Loan Payoff Explorer, Cost Builder, Rental Costs, Buyer Profile.

## Predictive Analytics

### What could happen?

Predictive analytics project future states based on user assumptions. These are **estimates, not guarantees**.

**Examples in PropWise:**

- **Property value projection** — future value based on annual appreciation assumption.
- **Loan balance projection** — remaining principal over the loan tenure.
- **Estimated equity** — property value minus remaining loan balance, year by year.
- **Rental scenarios** — how rental income grows over time with annual rent increases.
- **Investment horizon** — total invested, loan paid down, property value, equity, and cumulative rental over 3–20 years.

**Where it appears:** Future Property Value, Property Value Projection, Equity Growth, Yearly Investment Analysis, Investment Horizon.

## Prescriptive Analytics

### What should I examine or consider?

Prescriptive analytics guide the user toward better decisions by suggesting what to test or compare.

**Examples in PropWise:**

- **Test a different loan amount** — use the EMI Simulator to see how a smaller loan changes monthly cost.
- **Compare contribution levels** — see how income burden changes with different property prices.
- **Test different property prices** — use Property Comparison to evaluate up to 3 properties side by side.
- **Compare financing scenarios** — use Scenario Comparison to test different loan percentages, rates, and tenures.
- **Examine sensitivity to assumptions** — adjust appreciation, rental growth, and vacancy to see how outcomes shift.
- **Consider extra payments** — use the Loan Payoff Explorer to see how an additional monthly payment reduces tenure and interest.

**Where it appears:** Scenario Comparison, Property Comparison, EMI Simulator, Loan Payoff Explorer, Rental Yield (try different rent values).

## Analytical Workflow

These four layers are not separate tools — they are parts of one integrated analysis:

```
Descriptive    "Your monthly cost is ₹X."
     ↓
Diagnostic     "That's because your loan is ₹Y at Z% interest."
     ↓
Predictive     "In 10 years, your property could be worth ₹A and your equity ₹B."
     ↓
Prescriptive   "Consider testing a shorter tenure or comparing a second property."
```

Each PropWise analysis report presents all four layers together, so the user moves naturally from understanding the present to evaluating the future and their options.