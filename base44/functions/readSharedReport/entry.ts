import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in to view this shared report.' }, { status: 401 });
    const { analysisId, token } = await req.json();
    if (typeof analysisId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(analysisId) || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return Response.json({ error: 'Shared report not found.' }, { status: 404 });
    // Elevation is limited to an authenticated recipient possessing the owner's
    // unguessable read-only capability. No mutation or general lookup is exposed.
    const matches = await base44.asServiceRole.entities.Analysis.filter({ id: analysisId, share_token: token, status: 'saved' }, '-updated_date', 1);
    const record = matches[0];
    if (!record || record.report_ready === false) return Response.json({ error: 'Shared report not found.' }, { status: 404 });
    const fields = ['id', 'title', 'owner_name', 'property_location', 'property_type', 'property_price', 'amount_saved', 'home_loan_percentage', 'monthly_income', 'existing_emi', 'interest_rate', 'loan_tenure_years', 'costs', 'monthly_rent', 'annual_rent_increase', 'vacancy_rate', 'annual_rental_maintenance', 'other_rental_costs', 'annual_appreciation', 'projection_years', 'scenarios', 'calculated', 'calculation_version', 'created_date', 'updated_date', 'saved_at', 'lifecycle'];
    const report = Object.fromEntries(fields.filter(k => record[k] !== undefined).map(k => [k, record[k]]));
    return Response.json({ report }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error?.status || 500;
    return Response.json({ error: status === 401 || status === 403 ? 'Sign in to view this shared report.' : 'Unable to load the shared report. Please retry.' }, { status: status === 401 || status === 403 ? 401 : 500 });
  }
}