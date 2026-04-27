/**
 * @module inviteToken
 *
 * sessionStorage helpers for carrying an `inviteToken` across signup/auth
 * round-trips. The /invite/accept page stashes the token here when the
 * invitee is signed out, and the auth methods in `userStore` consume it
 * during magicLinkVerify / otpVerify / passkeyRegisterFinish / OAuth start.
 *
 * For OAuth the token also rides in `stateData` (the platform survives the
 * Google round-trip via the OAuth state param). sessionStorage is the
 * fallback for flows that don't have a state-bag of their own.
 */

const STORAGE_KEY = "primitive:pendingInviteToken";

/**
 * Loose validation for invite tokens. The platform issues opaque strings;
 * we only check that callers haven't handed us obvious garbage.
 */
export function isPlausibleInviteToken(token: unknown): token is string {
  return (
    typeof token === "string" &&
    token.length >= 16 &&
    token.length <= 512 &&
    /^[A-Za-z0-9._~+/=-]+$/.test(token)
  );
}

export function setPendingInviteToken(token: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function getPendingInviteToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearPendingInviteToken(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
