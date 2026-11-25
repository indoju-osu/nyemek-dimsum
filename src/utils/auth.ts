import { AdminAccount } from '../types';

/**
 * Lightweight salted hash helper for local demo prototype authentication.
 * Note: Client-side hashing does NOT provide production-grade security.
 * Production deployments must authenticate on a secure backend with bcrypt/scrypt and HTTP-only cookies.
 */
export function hashDemoPassword(password: string, salt: string): string {
  const input = `${salt}::nyemek-demo::${password}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0') +
    (h1 >>> 0).toString(16).padStart(8, '0')
  );
}

export function getDefaultAdminAccount(): AdminAccount {
  const salt = 'nyemek-demo-salt-v1';
  return {
    username: 'admin',
    salt,
    passwordHash: hashDemoPassword('admin', salt),
    updatedAt: '2026-11-01T00:00:00.000Z',
  };
}

export function verifyAdminCredentials(
  usernameInput: string,
  passwordInput: string,
  account: AdminAccount
): boolean {
  const trimmedUser = usernameInput.trim();
  if (!trimmedUser || !passwordInput) return false;
  if (trimmedUser !== account.username) return false;
  return hashDemoPassword(passwordInput, account.salt) === account.passwordHash;
}

export function createUpdatedAdminAccount(
  newUsername: string,
  newPassword: string
): AdminAccount {
  const salt = `salt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    username: newUsername.trim(),
    salt,
    passwordHash: hashDemoPassword(newPassword, salt),
    updatedAt: new Date().toISOString(),
  };
}
