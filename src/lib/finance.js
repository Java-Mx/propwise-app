// PropWise — financial calculation engine
// Transparent estimates based on user-provided assumptions.

const num = (v) => (v === "" || v == null || !Number.isFinite(+v)) ? 0 : +v;
export { num };

// All fields start empty — no demo or preloaded values.
export const DEFAULT_INPUTS = {
  title: "",
  owner_name: "",
  owner_email: "",
  property_location: "",
  property_type: "Apartment",
  property_price: "",
  amount_saved: "",
  home_loan_percentage: "",
  monthly_income: "",
  existing_emi: "",
  interest_rate: "",
  loan_tenure_years: "",
  costs: [],
  monthly_rent: "",
  annual_rent_increase: "",
  vacancy_rate: "",
  annual_rental_maintenance: "",
  other_rental_costs: "",
  annual_appreciation: "",
  projection_years: "",
  scenarios: [],
};

// ---------- Option lists ----------

export const TENURE_OPTIONS = [5, 10, 15, 20, 25, 30];
export const PROJECTION_OPTIONS = [5, 10, 15, 20, 25];
export const INTEREST_OPTIONS = [6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
export const LOAN_PCT_OPTIONS = [50, 60, 70, 75, 80, 85, 90];
export const APPRECIATION_OPTIONS = [3, 4, 5, 6, 7, 8];
export const RENT_GROWTH_OPTIONS = [2, 3, 4, 5, 6, 7];
export const VACANCY_OPTIONS = [0, 5, 10, 15, 20];
export const PROPERTY_TYPES = ["Apartment", "Villa", "Independent House", "Row House", "Plot", "Other"];

export const FREQUENCIES = ["Monthly", "Quarterly", "Half-Yearly", "Yearly", "One-Time"];

export const MONTHLY_CATEGORIES = ["Maintenance", "Society Charges", "Parking", "Security", "Property Management", "Insurance", "Other"];
export const ANNUAL_CATEGORIES = ["Property Tax", "Insurance", "Repairs", "Maintenance Reserve", "Society Charges", "Other"];
export const ONETIME_CATEGORIES = ["Stamp Duty", "Registration", "Brokerage", "Interior", "Furnishing", "Moving", "Legal", "Other"];

// ---------- Formatting ----------

export function indianFormat(n) {
  const v = Math.round(Math.abs(n || 0));
  const str = String(v);
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return rest + "," + last3;
}

export function formatINR(n) {
  if (n == null || isNaN(n)) return "₹0";
  const sign = n < 0 ? "-" : "";
  return sign + "₹" + indianFormat(n);
}

export function formatCompact(n) {
  if (n == null || isNaN(n) || n === 0) return "₹0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 10000000) return sign + "₹" + round2(abs / 10000000) + " Cr";
  if (abs >= 100000) return sign + "₹" + round2(abs / 100000) + " L";
  return sign + "₹" + indianFormat(abs);
}

export function formatPct(n) {
  if (n == null || isNaN(n)) return "0%";
  return round1(n) + "%";
}

export function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
export function round1(n) { return Math.round((n + Number.EPSILON) * 10) / 10; }

// ---------- Core formulas ----------

export function calculateEMI(principal, annualRatePct, months) {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export function remainingLoanBalance(principal, annualRatePct, tenureYears, elapsedYears) {
  const totalMonths = num(tenureYears) * 12;
  const elapsed = num(elapsedYears) * 12;
  if (totalMonths <= 0 || elapsed >= totalMonths) return 0;
  const payment = calculateEMI(principal, annualRatePct, totalMonths);
  const monthlyRate = annualRatePct / 1200;
  if (monthlyRate === 0) return Math.max(principal - payment * elapsed, 0);
  const factor = Math.pow(1 + monthlyRate, elapsed);
  return Math.max(principal * factor - payment * (factor - 1) / monthlyRate, 0);
}

export function futureValue(present, annualRatePct, years) {
  return present * Math.pow(1 + annualRatePct / 100, years);
}

// ---------- Cost normalization ----------

export function monthlyEquiv(amount, frequency) {
  const a = num(amount);
  switch (frequency) {
    case "Monthly": return a;
    case "Quarterly": return a / 3;
    case "Half-Yearly": return a / 6;
    case "Yearly": return a / 12;
    default: return 0;
  }
}
export function annualEquiv(amount, frequency) {
  return monthlyEquiv(amount, frequency) * 12;
}

// ---------- Burden thresholds (indicative, configurable) ----------

export const BURDEN_THRESHOLDS = { low: 25, moderate: 40, high: 55 };

export function burdenLevel(pct) {
  if (pct < BURDEN_THRESHOLDS.low) return { key: "low", label: "Lower", color: "#2F8F6B" };
  if (pct < BURDEN_THRESHOLDS.moderate) return { key: "moderate", label: "Moderate", color: "#C58B32" };
  if (pct < BURDEN_THRESHOLDS.high) return { key: "high", label: "High", color: "#C58B32" };
  return { key: "very_high", label: "Very High", color: "#B95C5C" };
}

// ---------- Amortization ----------

export function buildAmortization(principal, annualRatePct, years) {
  const months = years * 12;
  const emi = calculateEMI(principal, annualRatePct, months);
  const r = annualRatePct / 12 / 100;
  let balance = principal;
  const rows = [];
  for (let y = 1; y <= years; y++) {
    let interestPaid = 0, principalPaid = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      const pp = Math.min(emi - interest, balance);
      interestPaid += interest;
      principalPaid += pp;
      balance -= pp;
      if (balance < 0.01) balance = 0;
    }
    rows.push({ year: y, balance: Math.max(balance, 0), interestPaid, principalPaid, emiPaid: emi * 12 });
  }
  return rows;
}

// ---------- Yearly projection ----------

export function buildYearlyProjection(input) {
  const {
    price, emi, actualLoan, rate, tenure, recurringMonthly,
    appreciation, rentGrowth, vacancy, rentalCosts, monthlyRent, projection_years,
  } = input;

  const r = rate / 12 / 100;
  let balance = actualLoan;
  const rows = [];
  const maxYears = Math.max(projection_years || 20, tenure);

  for (let y = 1; y <= maxYears; y++) {
    let interestPaid = 0, principalPaid = 0;
    if (balance > 0) {
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interest = balance * r;
        const pp = Math.min(emi - interest, balance);
        interestPaid += interest;
        principalPaid += pp;
        balance -= pp;
        if (balance < 0.01) balance = 0;
      }
    }
    const propertyValue = futureValue(price, appreciation, y);
    const annualEmiPaid = y <= tenure ? emi * 12 : 0;
    const annualMaintenance = recurringMonthly * 12;
    const grossRent = monthlyRent * 12 * Math.pow(1 + rentGrowth / 100, y - 1);
    const annualRentalIncome = Math.max(grossRent * (1 - vacancy / 100) - rentalCosts, 0);
    const annualNetOutflow = annualEmiPaid + annualMaintenance - annualRentalIncome;
    const equity = propertyValue - Math.max(balance, 0);
    rows.push({
      year: y,
      propertyValue: Math.round(propertyValue),
      loanBalance: Math.round(Math.max(balance, 0)),
      annualEmiPaid: Math.round(annualEmiPaid),
      annualPropertyCost: Math.round(annualEmiPaid + annualMaintenance),
      annualRentalIncome: Math.round(annualRentalIncome),
      annualNetOutflow: Math.round(annualNetOutflow),
      equity: Math.round(equity),
    });
  }
  return rows;
}

// ---------- Master compute ----------

export function computeAll(input) {
  const price = num(input.property_price);
  const saved = num(input.amount_saved);
  const loanPct = num(input.home_loan_percentage);
  const monthlyIncome = num(input.monthly_income);
  const existingEmi = num(input.existing_emi);
  const rate = num(input.interest_rate);
  const tenure = num(input.loan_tenure_years);

  // Funding logic — separate concepts
  const maxLoanEligibility = price * loanPct / 100;
  const requiredFunding = Math.max(price - saved, 0);
  let actualLoan = requiredFunding <= 0 ? 0 : Math.min(requiredFunding, maxLoanEligibility);
  const downPayment = Math.max(price - actualLoan, 0);
  const surplusSavings = Math.max(saved - downPayment, 0);
  const fundingGap = requiredFunding > maxLoanEligibility ? requiredFunding - maxLoanEligibility : 0;
  const maxPurchaseCapacity = saved + maxLoanEligibility;
  const canCover = maxPurchaseCapacity >= price;
  const savingsExceedsPrice = saved > price && price > 0;

  const months = tenure * 12;
  const emi = calculateEMI(actualLoan, rate, months);
  const totalRepayment = emi * months;
  const totalInterest = Math.max(totalRepayment - actualLoan, 0);
  const loanToValue = price > 0 ? (actualLoan / price) * 100 : 0;

  // Costs
  const costs = Array.isArray(input.costs) ? input.costs : [];
  const recurringMonthly = costs
    .filter((c) => c.frequency !== "One-Time")
    .reduce((s, c) => s + monthlyEquiv(c.amount, c.frequency), 0);
  const oneTimeTotal = costs
    .filter((c) => c.frequency === "One-Time")
    .reduce((s, c) => s + num(c.amount), 0);

  const totalMonthlyCost = emi + recurringMonthly;
  const totalMonthlyCommitment = totalMonthlyCost + existingEmi;
  const incomeBurden = monthlyIncome > 0 ? (totalMonthlyCost / monthlyIncome) * 100 : 0;
  const totalCommitmentBurden = monthlyIncome > 0 ? (totalMonthlyCommitment / monthlyIncome) * 100 : 0;
  const level = burdenLevel(incomeBurden);

  const estimatedAnnualPropertyCost = totalMonthlyCost * 12;
  const totalInitialCash = downPayment + oneTimeTotal;

  // Future value
  const appreciation = num(input.annual_appreciation);
  const fv = (years) => futureValue(price, appreciation, years);

  // Rental
  const monthlyRent = num(input.monthly_rent);
  const grossAnnualRent = monthlyRent * 12;
  const vacancy = num(input.vacancy_rate);
  const effectiveAnnualRent = grossAnnualRent * (1 - vacancy / 100);
  const rentalMaint = num(input.annual_rental_maintenance);
  const otherRentalCosts = num(input.other_rental_costs);
  const rentalCosts = rentalMaint + otherRentalCosts;
  const netAnnualRental = effectiveAnnualRent - rentalCosts;
  const grossYield = price > 0 ? (grossAnnualRent / price) * 100 : 0;
  const netYield = price > 0 ? (netAnnualRental / price) * 100 : 0;
  const netMonthlyRentalBenefit = netAnnualRental / 12;
  const netMonthlyOutflow = totalMonthlyCost - netMonthlyRentalBenefit;

  const amortization = buildAmortization(actualLoan, rate, tenure);
  const yearly = buildYearlyProjection({
    price, emi, actualLoan, rate, tenure, recurringMonthly,
    appreciation, rentGrowth: num(input.annual_rent_increase),
    vacancy, rentalCosts, monthlyRent,
    projection_years: num(input.projection_years) || 20,
  });

  const hasInputs = price > 0;

  return {
    hasInputs, price, saved, loanPct, monthlyIncome, existingEmi, rate, tenure,
    maxLoanEligibility, requiredFunding, actualLoan, downPayment, surplusSavings,
    fundingGap, maxPurchaseCapacity, canCover, savingsExceedsPrice,
    emi, totalRepayment, totalInterest, loanToValue,
    recurringMonthly, oneTimeTotal, totalMonthlyCost, totalMonthlyCommitment,
    incomeBurden, totalCommitmentBurden, level,
    estimatedAnnualPropertyCost, totalInitialCash,
    appreciation, fv,
    monthlyRent, grossAnnualRent, effectiveAnnualRent, rentalCosts, netAnnualRental,
    grossYield, netYield, netMonthlyRentalBenefit, netMonthlyOutflow,
    amortization, yearly,
  };
}

// ---------- Suggestion generator ----------

export function generateSuggestions(input, r) {
  if (!r.hasInputs) return [];
  const out = [];
  const levelKey = r.level.key;

  if (levelKey === "low") out.push("Estimated monthly property cost is a lower share of your income.");
  else if (levelKey === "moderate") out.push("Estimated monthly property cost is a moderate share of your income.");
  else if (levelKey === "high") out.push("Estimated monthly property cost is a high share of your income — consider a lower price, higher contribution or longer tenure.");
  else out.push("Estimated monthly property cost is a very high share of your income — review carefully before proceeding.");

  if (r.surplusSavings > 0) out.push("Your available savings cover the down payment, with " + formatINR(r.surplusSavings) + " remaining.");
  else if (r.fundingGap > 0) out.push("Your savings and selected loan percentage leave a funding gap of " + formatINR(r.fundingGap) + ".");

  if (r.tenure >= 20) out.push("A longer tenure lowers the monthly EMI but increases total interest paid (" + formatCompact(r.totalInterest) + ").");
  else if (r.tenure > 0 && r.tenure <= 10) out.push("A shorter tenure keeps total interest low but raises the monthly EMI.");

  if (r.monthlyRent > 0) out.push("If rented out, net monthly outflow after rental benefit is " + formatCompact(r.netMonthlyOutflow) + ".");
  else if (r.actualLoan > 0) out.push("Total loan interest is estimated at " + formatCompact(r.totalInterest) + " over " + r.tenure + " years.");

  return out;
}

// ---------- Scenario summary ----------

export function computeScenarioSummary(s, appreciation) {
  const price = num(s.property_price);
  const saved = num(s.amount_saved);
  const loanPct = num(s.home_loan_percentage);
  const rate = num(s.interest_rate);
  const tenure = num(s.loan_tenure_years);
  const monthlyRent = num(s.monthly_rent);
  const maxLoan = price * loanPct / 100;
  const requiredFunding = Math.max(price - saved, 0);
  const loan = requiredFunding <= 0 ? 0 : Math.min(requiredFunding, maxLoan);
  const emi = calculateEMI(loan, rate, tenure * 12);
  const netAnnualRent = monthlyRent * 12 * (1 - 5 / 100);
  const rentalBenefit = netAnnualRent / 12;
  const netOutflow = emi - rentalBenefit;
  const valueAfter10 = futureValue(price, num(appreciation), 10);
  return { price, loan, emi, monthlyCost: emi, rentalBenefit, netOutflow, valueAfter10, downPayment: Math.max(price - loan, 0) };
}

// ---------- Payoff with extra payment ----------

export function payoffWithExtra(principal, annualRatePct, years, extraMonthly) {
  const baseMonths = years * 12;
  const baseEmi = calculateEMI(principal, annualRatePct, baseMonths);
  const baseTotalInterest = Math.max(baseEmi * baseMonths - principal, 0);
  const r = annualRatePct / 12 / 100;
  let balance = principal;
  let totalInterest = 0;
  let m = 0;
  const payment = baseEmi + Math.max(extraMonthly, 0);
  const cap = baseMonths * 3 + 120;
  while (balance > 0.01 && m < cap) {
    const interest = balance * r;
    let pp = payment - interest;
    if (pp <= 0) { m = cap; break; } // payment too small to cover interest
    if (pp >= balance) { totalInterest += interest; balance = 0; m++; break; }
    totalInterest += interest;
    balance -= pp;
    m++;
  }
  return {
    months: m,
    totalInterest,
    interestSaved: Math.max(baseTotalInterest - totalInterest, 0),
    monthsReduced: Math.max(baseMonths - m, 0),
    baseEmi,
    baseTotalInterest,
    baseMonths,
  };
}

export function formatDuration(months) {
  if (!months || months <= 0) return "0 mo";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y && m) return `${y} yr ${m} mo`;
  if (y) return `${y} yr`;
  return `${m} mo`;
}

// Breakdown of ownership cost components over a horizon
export function costBreakdown(input) {
  const { actualLoan, rate, tenure, emi, recurringMonthly, oneTimeTotal, monthlyRent, vacancy, rentalCosts, years } = input;
  const horizon = Math.max(years || tenure || 1, 1);
  const months = tenure * 12;
  // lifetime = loan tenure (full interest + principal)
  const lifeInterest = Math.max(emi * months - actualLoan, 0);
  const lifePrincipal = actualLoan;
  const lifeMaintenance = recurringMonthly * 12 * horizon;
  const lifeOneTime = oneTimeTotal;
  // approximate tax/insurance split from recurring — keep as "other recurring"
  return {
    principal: lifePrincipal,
    interest: lifeInterest,
    maintenance: lifeMaintenance,
    oneTime: lifeOneTime,
  };
}