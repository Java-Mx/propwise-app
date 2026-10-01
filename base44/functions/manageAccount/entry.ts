import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const NAME_MAX = 80;
const PW_MIN = 8;
const PW_MAX = 128;

function fail(message, status = 400) {
  return Response.json({ error: message }, { status });
}

// Self-service account management for the signed-in caller.
// Actions: updateName, changePassword, deleteAccount.
// The caller's identity is always taken from the request — never trusted from
// the payload — so a user can only act on their own account.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return fail('Sign in to manage your account.', 401);

    const body = await req.json().catch(() => ({}));
    const action = body && body.action;

    if (action === 'updateName') {
      const name = String(body.display_name || body.full_name || '').trim();
      if (!name) return fail('Please enter your full name.');
      if (name.length > NAME_MAX) return fail('That name is too long.');
      // `full_name` is an immutable built-in, so the editable name is persisted
      // in the custom `display_name` field via the request-authenticated client.
      // updateMe only touches the caller's own record — user A cannot modify
      // user B, and the id is never taken from the payload.
      await base44.auth.updateMe({ display_name: name });
      return Response.json({ ok: true, display_name: name });
    }

    if (action === 'changePassword') {
      const currentPassword = String(body.currentPassword || '');
      const newPassword = String(body.newPassword || '');
      if (!currentPassword || !newPassword) return fail('Please fill in both password fields.');
      if (newPassword.length < PW_MIN) return fail(`New password must be at least ${PW_MIN} characters.`);
      if (newPassword.length > PW_MAX) return fail('That new password is too long.');
      if (newPassword === currentPassword) return fail('Choose a new password that differs from your current one.');
      // Runs on the request-authenticated client — verifies the current password.
      await base44.auth.changePassword({ userId: user.id, currentPassword, newPassword });
      return Response.json({ ok: true });
    }

    if (action === 'deleteAccount') {
      if (String(body.confirm || '') !== 'DELETE') return fail('Please type DELETE to confirm.');
      // Remove all user-owned data first (service role bypasses row-level security),
      // then the account itself. Deletion is keyed on the authenticated user id.
      await base44.asServiceRole.entities.Analysis.deleteMany({ created_by_id: user.id });
      await base44.asServiceRole.entities.Source.deleteMany({ created_by_id: user.id });
      await base44.asServiceRole.entities.User.delete(user.id);
      return Response.json({ ok: true });
    }

    return fail('Unsupported account action.');
  } catch (error) {
    const status = error?.status || 500;
    const authed = status === 401 || status === 403;
    const message = error?.message || 'Unable to complete the request. Please retry.';
    return Response.json(
      { error: authed ? 'Sign in to manage your account.' : message },
      { status: authed ? 401 : 500 }
    );
  }
}