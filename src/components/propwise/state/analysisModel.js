import { DEFAULT_INPUTS, computeAll, num } from '@/lib/finance';

export const newKey = () => crypto.randomUUID();
export const isLocalId = (id) => typeof id === 'string' && id.startsWith('local_');
export function readInputs(record = {}) {
  return Object.fromEntries(Object.keys(DEFAULT_INPUTS).map(key => [key, record[key] ?? DEFAULT_INPUTS[key]]));
}
export function validateAnalysis(inputs, basicOnly = false) {
  if (!inputs.title?.trim()) return 'Enter a report name.';
  if (!inputs.owner_name?.trim()) return 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.owner_email?.trim() || '')) return 'Enter a valid email address.';
  if (basicOnly) return null;
  if (!(num(inputs.property_price) > 0)) return 'Enter a property price greater than zero.';
  if (!(num(inputs.monthly_income) > 0)) return 'Enter a monthly income greater than zero.';
  if (!(num(inputs.home_loan_percentage) > 0 && num(inputs.home_loan_percentage) <= 95)) return 'Loan percentage must be between 1 and 95.';
  if (!(num(inputs.interest_rate) > 0 && num(inputs.interest_rate) <= 100)) return 'Interest rate must be between 0 and 100%.';
  if (!(num(inputs.loan_tenure_years) >= 1 && num(inputs.loan_tenure_years) <= 40 && Number.isInteger(num(inputs.loan_tenure_years)))) return 'Loan tenure must be a whole number from 1 to 40 years.';
  if (num(inputs.projection_years) > 50 || !Number.isInteger(num(inputs.projection_years))) return 'Projection period must be a whole number up to 50 years.';
  if (num(inputs.vacancy_rate) > 100) return 'Vacancy rate cannot exceed 100%.';
  for (const key of Object.keys(DEFAULT_INPUTS)) {
    if (DEFAULT_INPUTS[key] === '' && !['title', 'owner_name', 'owner_email', 'property_location'].includes(key)) {
      if (inputs[key] !== '' && (!Number.isFinite(Number(inputs[key])) || Number(inputs[key]) < 0)) return 'Financial inputs must be finite, non-negative numbers.';
    }
  }
  if ((inputs.costs || []).some(c => !Number.isFinite(Number(c.amount)) || Number(c.amount) < 0)) return 'Cost amounts must be finite, non-negative numbers.';
  if ((inputs.scenarios || []).some(s => Object.entries(s).some(([k, v]) => !['id', 'label'].includes(k) && v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0)))) return 'Scenario inputs must be finite, non-negative numbers.';
  return null;
}
export function savePayload(inputs) {
  const clean = readInputs(inputs);
  for (const key of Object.keys(clean)) {
    if (DEFAULT_INPUTS[key] === '' && !['title', 'owner_name', 'owner_email', 'property_location'].includes(key)) clean[key] = num(clean[key]);
  }
  ['title', 'owner_name', 'owner_email', 'property_location'].forEach(k => { clean[k] = String(clean[k] || '').trim(); });
  clean.costs = (clean.costs || []).map(c => ({ ...c, amount: num(c.amount) }));
  clean.scenarios = (clean.scenarios || []).map(s => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, ['id', 'label'].includes(k) ? v : num(v)])));
  const { fv, ...calculated } = computeAll(clean);
  const finite = value => typeof value === 'number' ? Number.isFinite(value) : value && typeof value === 'object' ? Object.values(value).every(finite) : true;
  if (!finite(calculated)) throw new Error('These assumptions exceed the calculation limits. Please reduce the amounts or growth rates.');
  return { ...clean, calculated, calculation_version: 1 };
}
export function reportResults(inputs, calculated) {
  return { ...computeAll(inputs), ...(calculated || {}) };
}
export function errorMessage(error, fallback) {
  const status = error?.status || error?.response?.status;
  if (status === 401 || status === 403) return 'Your session has expired or you do not have access. Please sign in again.';
  return error?.response?.data?.error || error?.data?.message || error?.message || fallback;
}