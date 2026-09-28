// PropWise — financial calculation engine
// All calculations are transparent and based on user-provided assumptions.

export const DEFAULT_INPUTS = {
  title: "My Property Analysis",
  property_price: 30000000,
  amount_saved: 10000000,
  home_loan_percentage: 70,
  monthly_income: 500000,
  existing_emi: 30000,
  interest_rate: 8.5,
  loan_tenure_years: 20,
  // monthly cost breakdown (Tab 2)
  monthly_maintenance: 12000, // maintenance fee
  society_charges: 0,
  parking: 0,
  property_management: 0,
  insurance_monthly: 0,
  other_monthly: 5000,
  // annual costs (Tab 2)
  property_tax: 0,
  insurance_annual: 0,
  repairs: 0,
  maintenance_reserve: 0,
  other_annual: 0,
  // one-time costs (Tab 2)
  registration: 0,
  stamp_duty: 0,
  brokerage: 0,
  furnishing: 0,
  moving: 0,
  other_one_time: 0,
  // rental (Tab 3)
  monthly_rent: 90000,
  annual_rent_increase: 4,
  vacancy_rate: 5,
  annual_rental_maintenance: 20000,
  // projection
  annual_appreciation: 5,
  projection_years: 20,
};

export const DEMO_INPUTS = { ...DEFAULT_INPUTS };

export const TENURE_OPTIONS = [5, 10, 15, 20, 25, 30];
export const PROJECTION_OPTIONS = [5, 10, 15, 20];

// ---------- Formatting ----------

export function indianFormat(num) {
  const n = Math.round(Math.abs(num || 0));
  const str = String(n);
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return rest + "," + last3;
}

export function formatINR(num) {
  if (num == null || isNaN(num)) return "₹0";
  const sign = num < 0 ? "-" : "";
  return sign + "₹" + indianFormat(num);
}

export function formatCompact(num) {
  if (num == null || isNaN(num)) return "₹0";
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 10000000) return sign + "₹" + round2(abs / 10000000) + " Cr";
  if (abs >= 100000) return sign + "₹" + round2(abs / 100000) + " L";
  return sign + "₹" + indianFormat(abs);
}

export function formatPct(num) {
  if (num == null || isNaN(num)) return "0%";
  return round1(num) + "%";
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

export function futureValue(present, annualRatePct, years) {
  return present * Math.pow(1 + annualRatePct / 100, years);
}

// ---------- Burden thresholds (configurable, indicative) ----------

export const BURDEN_THRESHOLDS = {
  low: 25, // < 25% -> lower
  moderate: 40, // 25-40% -> moderate
  high: 55, // 40-55% -> high
  // >= 55% -> very high
};

export function burdenLevel(pct) {
  if (pct < BURDEN_THRESHOLDS.low) return { key: "low", label: "Lower commitment", color: "emerald" };
  if (pct < BURDEN_THRESHOLDS.moderate) return { key: "moderate", label: "Moderate commitment", color: "amber" };
  if (pct < BURDEN_THRESHOLDS.high) return { key: "high", label: "High commitment", color: "orange" };
  return { key: "very_high", label: "Very high commitment", color: "rose" };
}

// ---------- Amortization (yearly) ----------

export function buildAmortization(principal, annualRatePct, years) {
  const months = years * 12;
  const emi = calculateEMI(principal, annualRatePct, months);
  const r = annualRatePct / 12 / 100;
  let balance = principal;
  const rows = [];
  for (let y = 1; y <= years; y++) {
    let interestPaid = 0;
    let principalPaid = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      const pp = Math.min(emi - interest, balance);
      interestPaid += interest;
      principalPaid += pp;
      balance -= pp;
      if (balance < 0.01) balance = 0;
    }
    rows.push({ year: y, balance, interestPaid, principalPaid, emiPaid: emi * 12 });
  }
  return rows;
}

// ---------- Yearly investment projection ----------

export function buildYearlyProjection(input) {
  const {
    price, emi, expectedLoan, interest_rate, loan_tenure_years,
    monthlyMaintenance, otherMonthly, annual_appreciation,
    annual_rent_increase, vacancy_rate, annual_rental_maintenance,
    monthly_rent, projection_years,
  } = input;

  const r = interest_rate / 12 / 100;
  const tenure = loan_tenure_years;
  const totalMonths = tenure * 12;
  let balance = expectedLoan;
  const rows = [];
  const maxYears = Math.max(projection_years || 20, tenure);

  for (let y = 1; y <= maxYears; y++) {
    let interestPaid = 0;
    let principalPaid = 0;
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
    const propertyValue = futureValue(price, annual_appreciation, y);
    const annualEmiPaid = y <= tenure ? emi * 12 : 0;
    const annualMaintenance = (monthlyMaintenance + otherMonthly) * 12;
    const grossRent = monthly_rent * 12 * Math.pow(1 + annual_rent_increase / 100, y - 1);
    const annualRentalIncome = Math.max(grossRent * (1 - vacancy_rate / 100) - annual_rental_maintenance, 0);
    const annualNetOutflow = annualEmiPaid + annualMaintenance - annualRentalIncome;
    const equity = propertyValue - Math.max(balance, 0);
    rows.push({
      year: y,
      propertyValue: Math.round(propertyValue),
      loanBalance: Math.round(Math.max(balance, 0)),
      annualEmiPaid: Math.round(annualEmiPaid),
      annualMaintenance: Math.round(annualMaintenance),
      annualRentalIncome: Math.round(annualRentalIncome),
      annualNetOutflow: Math.round(annualNetOutflow),
      equity: Math.round(equity),
    });
  }
  return rows;
}

// ---------- Master compute ----------

export function computeAll(input) {
  const price = +input.property_price || 0;
  const saved = +input.amount_saved || 0;
  const loanPct = +input.home_loan_percentage || 0;
  const monthlyIncome = +input.monthly_income || 0;
  const existingEmi = +input.existing_emi || 0;
  const rate = +input.interest_rate || 0;
  const tenure = +input.loan_tenure_years || 0;

  const expectedLoan = price * loanPct / 100;
  const downPaymentNeeded = price - expectedLoan;
  const requiredFunding = Math.max(price - saved, 0);
  const remainingRequired = Math.max(downPaymentNeeded - saved, 0);
  const surplusAfterDownPayment = Math.max(saved - downPaymentNeeded, 0);

  const months = tenure * 12;
  const emi = calculateEMI(expectedLoan, rate, months);
  const totalRepayment = emi * months;
  const totalInterest = Math.max(totalRepayment - expectedLoan, 0);

  const monthlyMaintenance = +input.monthly_maintenance || 0;
  const otherMonthly = (+input.society_charges || 0) + (+input.parking || 0)
    + (+input.property_management || 0) + (+input.insurance_monthly || 0) + (+input.other_monthly || 0);
  const totalMonthlyCost = emi + monthlyMaintenance + otherMonthly;

  const incomeBurden = monthlyIncome > 0 ? (totalMonthlyCost / monthlyIncome * 100) : 0;
  const totalBurdenWithExisting = monthlyIncome > 0 ? ((totalMonthlyCost + existingEmi) / monthlyIncome * 100) : 0;
  const level = burdenLevel(incomeBurden);

  const appreciation = +input.annual_appreciation || 0;
  const fv = (years) => futureValue(price, appreciation, years);

  // rental
  const monthlyRent = +input.monthly_rent || 0;
  const grossAnnualRent = monthlyRent * 12;
  const vacancy = +input.vacancy_rate || 0;
  const effectiveAnnualRent = grossAnnualRent * (1 - vacancy / 100);
  const annualRentalMaint = +input.annual_rental_maintenance || 0;
  const netAnnualRental = effectiveAnnualRent - annualRentalMaint;
  const grossYield = price > 0 ? (grossAnnualRent / price) * 100 : 0;
  const netYield = price > 0 ? (netAnnualRental / price) * 100 : 0;
  const netMonthlyRentalBenefit = netAnnualRental / 12;
  const netMonthlyOutflow = totalMonthlyCost - netMonthlyRentalBenefit;

  // annual + one-time
  const annualCostTotal = (+input.property_tax || 0) + (+input.insurance_annual || 0)
    + (+input.repairs || 0) + (+input.maintenance_reserve || 0) + (+input.other_annual || 0);
  const estimatedAnnualPropertyCost = totalMonthlyCost * 12 + annualCostTotal;

  const oneTimeTotal = (+input.registration || 0) + (+input.stamp_duty || 0)
    + (+input.brokerage || 0) + (+input.furnishing || 0) + (+input.moving || 0) + (+input.other_one_time || 0);
  const totalInitialCash = downPaymentNeeded + oneTimeTotal;

  const loanToValue = price > 0 ? (expectedLoan / price) * 100 : 0;

  const amortization = buildAmortization(expectedLoan, rate, tenure);

  const yearly = buildYearlyProjection({
    price, emi, expectedLoan, interest_rate: rate, loan_tenure_years: tenure,
    monthlyMaintenance, otherMonthly, annual_appreciation: appreciation,
    annual_rent_increase: +input.annual_rent_increase || 0,
    vacancy_rate: vacancy, annual_rental_maintenance: annualRentalMaint,
    monthly_rent: monthlyRent, projection_years: +input.projection_years || 20,
  });

  return {
    price, saved, loanPct, monthlyIncome, existingEmi, rate, tenure,
    expectedLoan, downPaymentNeeded, requiredFunding, remainingRequired, surplusAfterDownPayment,
    emi, totalRepayment, totalInterest,
    monthlyMaintenance, otherMonthly, totalMonthlyCost,
    incomeBurden, totalBurdenWithExisting, level,
    fv,
    monthlyRent, grossAnnualRent, effectiveAnnualRent, annualRentalMaint,
    netAnnualRental, grossYield, netYield, netMonthlyRentalBenefit, netMonthlyOutflow,
    annualCostTotal, estimatedAnnualPropertyCost,
    oneTimeTotal, totalInitialCash,
    loanToValue,
    amortization,
    yearly,
  };
}

// ---------- Suggestion generator (rule-based, transparent) ----------

export function generateSuggestions(input, r) {
  const out = [];
  const burden = r.incomeBurden;
  const levelKey = r.level.key;

  if (levelKey === "low") {
    out.push("The estimated monthly property cost represents a relatively lower share of your current income. Review the income remaining after existing obligations and property costs.");
  } else if (levelKey === "moderate") {
    out.push("The estimated monthly property cost represents a moderate share of your income. Ensure your emergency savings and existing obligations remain comfortable.");
  } else if (levelKey === "high") {
    out.push("The estimated monthly property cost represents a high share of your current income. Consider a lower-priced property, a higher initial contribution, or a longer loan tenure.");
  } else {
    out.push("The estimated monthly property cost represents a very high share of your current income. This may strain your finances — consider a lower-priced property or a much higher initial contribution.");
  }

  if (r.surplusAfterDownPayment > 0) {
    out.push("Your available savings exceed the required down payment, reducing the amount that needs to be financed and giving you a cushion.");
  } else if (r.remainingRequired > 0) {
    out.push("Your current savings are lower than the estimated down payment. You may need to arrange additional funds before purchase.");
  }

  if (r.tenure >= 20) {
    out.push("A longer loan tenure reduces the monthly EMI but increases the total interest paid over the loan.");
  } else if (r.tenure <= 10) {
    out.push("A shorter loan tenure keeps total interest low but increases the monthly EMI.");
  }

  if (r.totalInterest > r.expectedLoan) {
    out.push("Total interest paid is expected to exceed the loan principal — typical for long tenures, but worth noting.");
  }

  if (r.netMonthlyOutflow > 0 && r.monthlyRent > 0) {
    out.push("If rented out, the rental income offsets part of your monthly cost, leaving a net monthly outflow of " + formatCompact(r.netMonthlyOutflow) + ".");
  }

  return out;
}

// ---------- Scenario comparison ----------

export function buildScenarios(input) {
  const price = +input.property_price || 0;
  const bases = [
    { label: "Scenario A", factor: 0.8 },
    { label: "Scenario B", factor: 1.0 },
    { label: "Scenario C", factor: 1.2 },
  ];
  return bases.map((b) => {
    const scenarioPrice = Math.round(price * b.factor);
    const sInput = { ...input, property_price: scenarioPrice };
    const r = computeAll(sInput);
    return {
      label: b.label,
      price: scenarioPrice,
      requiredInitial: r.downPaymentNeeded,
      loanAmount: r.expectedLoan,
      emi: r.emi,
      monthlyCost: r.totalMonthlyCost,
      rentalIncome: r.netMonthlyRentalBenefit,
      netMonthlyOutflow: r.netMonthlyOutflow,
      valueAfter10: r.fv(10),
    };
  });
}