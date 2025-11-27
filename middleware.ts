import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    // Only protect /admin routes
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // /admin 경로 보호
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // 관리자 권한 체크 (super_admin, admin만 허용)
        const adminRoles = ['super_admin', 'admin', 'ADMIN', 'SUPER_ADMIN'];
        const userRole = token.role as string;

        if (!adminRoles.includes(userRole)) {
            // 관리자 권한이 없으면 홈으로 리다이렉트
            return NextResponse.redirect(new URL('/', request.url));
        }

        // 회원관리 페이지는 최고관리자만 접근 가능
        if (request.nextUrl.pathname.startsWith('/admin/users') && userRole !== 'super_admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
