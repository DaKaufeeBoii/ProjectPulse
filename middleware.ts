import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, decodeSession } from './lib/auth';

const PROTECTED = ['/dashboard', '/projects', '/budget', '/team'];
const AUTH_ONLY = ['/login', '/register', '/verify'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
    const session = sessionCookie ? decodeSession(sessionCookie) : null;
    const isLoggedIn = !!session;

    // Redirect unauthenticated users away from protected routes
    if (PROTECTED.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && isLoggedIn) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
