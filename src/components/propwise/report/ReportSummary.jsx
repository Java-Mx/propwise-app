import React from 'react';
import { formatINR, formatPct } from '@/lib/finance';
import { ResultCard, Section } from '@/components/propwise/ui';

export default function ReportSummary({ report, r }) {
  const rows = [
    ['Property type', report.property_type], ['Property price', formatINR(r.price)], ['Monthly income', formatINR(r.monthlyIncome)], ['Savings', formatINR(r.saved)],
    ['Loan percentage', formatPct(r.loanPct)], ['Loan amount', formatINR(r.actualLoan)], ['Down payment', formatINR(r.downPayment)], ['Funding gap', formatINR(r.fundingGap)],
    ['Interest rate', formatPct(r.rate)], ['Loan tenure', `${r.tenure} years`], ['Existing EMI', formatINR(r.existingEmi)], ['Maintenance / other recurring costs', formatINR(r.recurringMonthly)],
    ['One-time costs', formatINR(r.oneTimeTotal)], ['Total interest', formatINR(r.totalInterest)], ['Total repayment', formatINR(r.totalRepayment)],
    ['Monthly rent', formatINR(r.monthlyRent)], ['Annual rent increase', formatPct(report.annual_rent_increase)], ['Vacancy rate', formatPct(report.vacancy_rate)],
    ['Annual rental maintenance', formatINR(report.annual_rental_maintenance)], ['Other annual rental costs', formatINR(report.other_rental_costs)],
    ['Gross rental yield', formatPct(r.grossYield)], ['Net rental yield', formatPct(r.netYield)], ['Annual appreciation', formatPct(r.appreciation)], ['Projection period', `${report.projection_years || 20} years`],
  ];
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">
      <ResultCard label="Estimated EMI" value={formatINR(r.emi)} />
      <ResultCard label="Monthly ownership cost" value={formatINR(r.totalMonthlyCost)} />
      <ResultCard label="Monthly net outflow" value={formatINR(r.netMonthlyOutflow)} />
    </div>
    <Section title="Property & financial assumptions">
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 text-sm"><dt className="text-sub">{label}</dt><dd className="font-medium tabular-nums text-ink">{value}</dd></div>)}</dl>
    </Section>
    {!!report.costs?.length && <Section title="Maintenance, taxes & other costs"><div className="space-y-3">{report.costs.map((c, i) => <div key={c.id || i} className="flex flex-wrap justify-between gap-2 text-sm"><span className="text-sub">{c.category} · {c.frequency}</span><span className="tabular-nums text-ink">{formatINR(c.amount)}</span></div>)}</div></Section>}
    {!!report.scenarios?.length && <Section title="Saved scenarios"><div className="space-y-3">{report.scenarios.map((s, i) => <div key={i} className="text-sm text-sub"><span className="font-semibold text-ink">{s.label || `Scenario ${i + 1}`}</span> · Price {formatINR(s.property_price)} · Savings {formatINR(s.amount_saved)} · Loan {s.home_loan_percentage}% · Rate {s.interest_rate}% · {s.loan_tenure_years} years · Rent {formatINR(s.monthly_rent)}</div>)}</div></Section>}
  </div>;
}