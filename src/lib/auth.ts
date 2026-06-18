import { cookies } from 'next/headers';
import { getCustomerInfoServer } from './swipall/users/server';

const AUTH_TOKEN_COOKIE = process.env.SWIPALL_AUTH_TOKEN_COOKIE || 'swipall-auth-token';
const REFRESH_TOKEN_COOKIE = process.env.SWIPALL_REFRESH_TOKEN_COOKIE || 'swipall-refresh-token';
const SWIPALL_API_URL = process.env.SWIPALL_SHOP_API_URL || process.env.NEXT_PUBLIC_SWIPALL_SHOP_API_URL;

function getTokenExpiry(token: string): number | null {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
        return typeof decoded.exp === 'number' ? decoded.exp : null;
    } catch {
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    const exp = getTokenExpiry(token);
    if (!exp) return true;
    return Date.now() / 1000 >= exp - 30;
}

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
 * Returns a valid access token, refreshing it first if it's expired.
 */
export async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

    if (!accessToken) return undefined;

    if (!isTokenExpired(accessToken)) return accessToken;

    // Token expired — try to refresh before the request goes out
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) return undefined;

    try {
        const res = await fetch(`${SWIPALL_API_URL}/api/v1/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        if (!res.ok) return undefined;
        const { access } = await res.json();
        // Save the new token so subsequent calls in the same request also use it
        cookieStore.set(AUTH_TOKEN_COOKIE, access, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return access as string;
    } catch {
        return undefined;
    }
}

export async function setRefreshToken(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function removeAuthToken() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAuthUserCustomerId(): Promise<string | undefined> {
    try {
        const token = await getAuthToken();
        if (!token) return undefined;
        const customerInfo = await getCustomerInfoServer();
        return customerInfo.id;
    } catch {
        return undefined;
    }
}
