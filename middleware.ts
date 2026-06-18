import { NextRequest, NextResponse } from 'next/server';

const AUTH_TOKEN_COOKIE = process.env.SWIPALL_AUTH_TOKEN_COOKIE || 'swipall-auth-token';
const REFRESH_TOKEN_COOKIE = process.env.SWIPALL_REFRESH_TOKEN_COOKIE || 'swipall-refresh-token';

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    // If neither token exists the user is definitely not logged in
    if (!accessToken && !refreshToken) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/checkout/:path*'],
};
