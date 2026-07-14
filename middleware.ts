import { NextRequest, NextResponse } from 'next/server';

const AUTH_TOKEN_COOKIE = process.env.SWIPALL_AUTH_TOKEN_COOKIE || 'swipall-auth-token';
const REFRESH_TOKEN_COOKIE = process.env.SWIPALL_REFRESH_TOKEN_COOKIE || 'swipall-refresh-token';
const PREVIEW_ACCESS_COOKIE = 'swipall-preview-access';

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/preview')) {
        const secret = process.env.PREVIEW_ACCESS_SECRET;
        const previewCookie = request.cookies.get(PREVIEW_ACCESS_COOKIE)?.value;
        const previewQueryToken = request.nextUrl.searchParams.get('pk');

        // Let the request through if either check could pass; page.tsx does the
        // constant-time comparison and issues the cookie on first load — the
        // middleware only rejects requests that are unambiguously unauthorized.
        if (!secret || (!previewCookie && !previewQueryToken)) {
            return NextResponse.rewrite(new URL('/404', request.url));
        }

        return NextResponse.next();
    }

    const accessToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    // If neither token exists the user is definitely not logged in
    if (!accessToken && !refreshToken) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/checkout/:path*', '/preview/:path*'],
};
