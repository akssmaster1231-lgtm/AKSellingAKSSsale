/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppUser } from './firebase';

export const AUTHORIZED_OWNER_EMAILS: string[] = [
  'akyadavprintaksellig@gmail.com',
  'support.akselling@gmail.com',
  'akselling@gmail.com',
  'admin@akselling.com',
  'owner@akselling.com',
  'anojyadav@akselling.com',
];

export const OWNER_PASSKEYS: string[] = [
  '98214',
  'AK-7890',
  '7890',
  'akselling2026',
  'ADMIN2026',
];

const OWNER_STORAGE_KEY = 'akselling_owner_authorized_session';

/**
 * Checks if a given email is in the authorized store owner list
 */
export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    AUTHORIZED_OWNER_EMAILS.includes(normalized) ||
    normalized.endsWith('@akselling.com') ||
    normalized === 'support.akselling@gmail.com'
  );
}

/**
 * Checks if the currently authenticated user object represents the store owner
 */
export function isOwnerUser(user?: AppUser | null): boolean {
  if (!user || !user.email) return false;
  return isOwnerEmail(user.email);
}

/**
 * Checks if the current browser session has active verified owner authorization
 */
export function isOwnerSessionAuthorized(): boolean {
  try {
    const session = localStorage.getItem(OWNER_STORAGE_KEY);
    if (!session) return false;
    const parsed = JSON.parse(session);
    // Session validity: 24 hours
    if (parsed && parsed.authorized && parsed.expiresAt > Date.now()) {
      return true;
    }
    // Expired
    localStorage.removeItem(OWNER_STORAGE_KEY);
    return false;
  } catch {
    return false;
  }
}

/**
 * Persists verified owner session
 */
export function setOwnerSessionAuthorized(authorized: boolean): void {
  try {
    if (authorized) {
      const sessionData = {
        authorized: true,
        grantedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };
      localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(sessionData));
    } else {
      localStorage.removeItem(OWNER_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Storage error on setOwnerSessionAuthorized', e);
  }
}

/**
 * Comprehensive check if user has access to Supplier Dashboard
 */
export function hasSupplierDashboardAccess(user?: AppUser | null): boolean {
  if (isOwnerUser(user)) {
    return true;
  }
  return isOwnerSessionAuthorized();
}

/**
 * Validates entered PIN / Passkey for Owner Access
 */
export function verifyOwnerPasskey(passkey: string): { success: boolean; message: string } {
  const cleanKey = passkey.trim();
  if (!cleanKey) {
    return { success: false, message: 'Please enter owner security passkey or PIN.' };
  }

  const isMatched = OWNER_PASSKEYS.some(
    (k) => k.toLowerCase() === cleanKey.toLowerCase()
  );

  if (isMatched) {
    setOwnerSessionAuthorized(true);
    return { success: true, message: 'Owner identity verified successfully!' };
  }

  return { 
    success: false, 
    message: 'Invalid owner credentials or passkey. Access denied.' 
  };
}

/**
 * Revokes owner mode authorization
 */
export function revokeOwnerAccess(): void {
  setOwnerSessionAuthorized(false);
}
