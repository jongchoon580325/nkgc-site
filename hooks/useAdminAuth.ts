import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UseAdminAuthOptions {
    requiredRole?: string[];
    redirectTo?: string;
}

export function useAdminAuth(requiredRole?: string) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        // 로그인하지 않은 경우
        if (!session) {
            router.push('/login');
            return;
        }

        const user = session.user;

        // 관리자 권한 체크 (super_admin, admin만 허용)
        const adminRoles = ['super_admin', 'admin'];
        const isAdmin = user?.role && adminRoles.includes(user.role);

        if (!isAdmin) {
            router.push('/');
            return;
        }

        // 회원관리 페이지는 최고관리자만 접근 가능
        if (requiredRole === 'super_admin' && user?.role !== 'super_admin') {
            router.push('/admin');
            return;
        }

        setIsAuthorized(true);
    }, [session, status, router, requiredRole]);

    return {
        session,
        status,
        isAuthorized,
        loading: status === 'loading',
        isSuperAdmin: session?.user?.role === 'super_admin',
        isAdmin: session?.user?.role === 'admin',
    };
}
