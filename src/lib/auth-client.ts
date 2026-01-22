'use client';

import { CurrentUser } from '@/lib/swipall/rest-adapter';

const AUTH_USER_STORAGE = 'swipall-auth-user';

/**
 * Store authenticated user in localStorage
 * Note: This is called from client-side after successful login
 */
export function setAuthUser(user: CurrentUser) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(user));
    }
}

/**
 * Retrieve authenticated user from localStorage
 * Note: This is called from client-side
 */
export function getAuthUser(): CurrentUser | null {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(AUTH_USER_STORAGE);
        if (stored) {
            try {
                return JSON.parse(stored) as CurrentUser;
            } catch (error) {
                console.error('Error parsing stored user:', error);
                return null;
            }
        }
    }
    return null;
}

/**
 * Remove authenticated user from localStorage
 * Note: This is called from client-side
 */
export function removeAuthUser() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_USER_STORAGE);
    }
}
