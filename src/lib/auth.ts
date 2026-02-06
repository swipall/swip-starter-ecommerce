import {cookies} from 'next/headers';
import { getCustomerInfo } from './swipall/users';

const AUTH_TOKEN_COOKIE = process.env.SWIPALL_AUTH_TOKEN_COOKIE || 'swipall-auth-token';

/**
 * Store JWT token in cookies for server-side authentication
 */
export async function setAuthToken(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

/**
 * Retrieve JWT token from cookies
 */
export async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
}

/**
 * Remove JWT token from cookies
 */
export async function removeAuthToken() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_TOKEN_COOKIE);
}

/**
 * Get the customer_id from the authenticated user if available (server-side)
 * Returns undefined if user is not authenticated
 */
export async function getAuthUserCustomerId(): Promise<string | undefined> {
    try {
        const token = await getAuthToken();
        if (!token) {
            return undefined;
        }
        
        const customerInfo = await getCustomerInfo({ useAuthToken: true });
        return customerInfo.id;
    } catch (error) {
        return undefined;
    }
}
