import { NextRequest, NextResponse } from 'next/server';

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
    // Refresh 30 seconds early to avoid race conditions
    return Date.now() / 1000 >= exp - 30;
}

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!accessToken || !refreshToken) {
        return NextResponse.next();
    }

    if (!isTokenExpired(accessToken)) {
        return NextResponse.next();
    }

    // Token expired — attempt refresh
    try {
        const refreshResponse = await fetch(`${SWIPALL_API_URL}/api/v1/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
            const response = NextResponse.redirect(new URL('/sign-in', request.url));
            response.cookies.delete(AUTH_TOKEN_COOKIE);
            response.cookies.delete(REFRESH_TOKEN_COOKIE);
            return response;
        }

        const data = await refreshResponse.json();
        const response = NextResponse.next();
        response.cookies.set(AUTH_TOKEN_COOKIE, data.access, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return response;
    } catch {
        return NextResponse.next();
    }
}

export const config = {
    matcher: ['/account/:path*', '/checkout/:path*'],
};
