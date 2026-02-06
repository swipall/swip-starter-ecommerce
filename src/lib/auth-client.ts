'use client';

import { CurrentUser } from "./swipall/types/types";


const AUTH_USER_STORAGE = 'swipall-auth-user';
const AUTH_USER_EVENT = 'auth-user-changed';

/**
 * Store authenticated user in localStorage
 * Note: This is called from client-side after successful login
 */
export function setAuthUser(user: CurrentUser) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(user));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent(AUTH_USER_EVENT, { detail: user }));
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
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent(AUTH_USER_EVENT, { detail: null }));
    }
}

/**
 * Get the customer_id from the authenticated user if available
 */
export function getAuthUserCustomerId(): string | undefined {
    const user = getAuthUser();
    return user?.id;
}

/**
 * Event name for auth user changes
 */
export const AUTH_USER_CHANGED_EVENT = AUTH_USER_EVENT;
