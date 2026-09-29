// Deterministic ILLUSTRATIVE dataset for homepage demo charts.
// These values are NOT user data, NOT market data, and never change between
// loads (no Math.random, no external fetch). Used only so the homepage is not
// empty before the user enters anything — clearly labeled "Illustrative".
import { calculateEMI, futureValue } from "@/lib/finance";

export const DEMO = {
  price: 10000000,        // ₹1.00 Cr
  monthlyIncome: 150000,  // ₹1.50 L / month
  loan: 7000000,          // ₹70 L
  rate: 8,
  tenure: 20,
  maintenance: 5000,      // / month
  other: 2500,            // / month
  rental: 35000,          // / month
  appreciation: 5,
  rentGrowth: 4,
  vacancy: 5,
  rentalCosts: 24000,     // / year
};

// Monthly affordability composition (illustrative).
export function demoAffordability() {
  const emi = calculateEMI(DEMO.loan, DEMO.rate, DEMO.tenure * 12);
  const property = emi + DEMO.maintenance;
  const existing = 0;
  const remaining = Math.max(DEMO.monthlyIncome - property - existing, 0);
  const pct = (property / DEMO.monthlyIncome) * 100;
  return { income: DEMO.monthlyIncome, property, existing, remaining, pct, emi, maintenance: DEMO.maintenance };
}

// Monthly cost composition (illustrative).
export function demoCost() {
  const emi = calculateEMI(DEMO.loan, DEMO.rate, DEMO.tenure * 12);
  const maintenance = DEMO.maintenance;
  const other = DEMO.other;
  return { emi, maintenance, other, total: emi + maintenance + other };
}

// Long-term projection Year 0..20 (illustrative, smooth amortization).
export function demoProjection() {
  const emi = calculateEMI(DEMO.loan, DEMO.rate, DEMO.tenure * 12);
  const r = DEMO.rate / 12 / 100;
  let balance = DEMO.loan;
  const rows = [{ year: 0, propertyValue: DEMO.price, loanBalance: DEMO.loan, equity: DEMO.price - DEMO.loan }];
  for (let y = 1; y <= 20; y++) {
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      const pp = Math.min(emi - interest, balance);
      balance -= pp;
      if (balance < 0.01) balance = 0;
    }
    const propertyValue = futureValue(DEMO.price, DEMO.appreciation, y);
    rows.push({
      year: y,
      propertyValue: Math.round(propertyValue),
      loanBalance: Math.round(Math.max(balance, 0)),
      equity: Math.round(propertyValue - Math.max(balance, 0)),
    });
  }
  return rows;
}