import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatINR, formatCompact } from '@/lib/finance';
import { useChartTheme, tooltipStyle } from '@/lib/chartTheme';
import { Section } from '@/components/propwise/ui';

export default function ReportProjections({ r }) {
  const t = useChartTheme();
  const headings = ['Year', 'Property value', 'Loan balance', 'Equity', 'Rental income', 'Ownership cost', 'Net outflow'];
  return <Section title="Saved property, loan & equity projections">
    <div className="mb-5 h-64">
      <ResponsiveContainer width="100%" height="100%"><LineChart data={r.yearly} margin={{ right: 12, left: 0, top: 12, bottom: 0 }}>
        <XAxis dataKey="year" tick={{ fill: t.axis, fontSize: 11 }} stroke={t.grid} />
        <YAxis tick={{ fill: t.axis, fontSize: 11 }} tickFormatter={formatCompact} width={70} stroke={t.grid} />
        <Tooltip contentStyle={tooltipStyle(t)} labelStyle={{ color: t.tooltipText }} formatter={formatINR} />
        <Legend formatter={label => <span className="text-sub">{label}</span>} />
        <Line dataKey="propertyValue" name="Property value" stroke={t.series.value} dot={false} />
        <Line dataKey="loanBalance" name="Loan balance" stroke={t.series.loan} dot={false} />
        <Line dataKey="equity" name="Equity" stroke={t.series.equity} dot={false} />
      </LineChart></ResponsiveContainer>
    </div>
    <div className="overflow-x-auto"><table className="w-full text-sm tabular-nums">
      <thead><tr className="border-b border-line text-left text-xs text-sub">{headings.map(h => <th key={h} className="whitespace-nowrap py-2 pr-5 font-medium">{h}</th>)}</tr></thead>
      <tbody>{r.yearly.map(row => <tr key={row.year} className="border-b border-line text-ink">{[row.year, ...['propertyValue', 'loanBalance', 'equity', 'annualRentalIncome', 'annualPropertyCost', 'annualNetOutflow'].map(k => formatINR(row[k]))].map((v, i) => <td key={i} className="whitespace-nowrap py-2 pr-5">{v}</td>)}</tr>)}</tbody>
    </table></div>
  </Section>;
}