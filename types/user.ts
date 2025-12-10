// 회원 데이터 타입
export interface User {
    id: number;
    username: string;
    password: string;
    name: string;
    phone: string;
    churchName: string;
    position: 'pastor' | 'elder' | 'evangelist' | 'member';
    role: 'super_admin' | 'admin' | 'member' | 'guest' | 'pending';
    email: string | null;
    isApproved: boolean;
    approvedBy: number | null;
    approvedAt: Date | null;
    rejectedReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
}

// 회원 생성 데이터
export interface CreateUserData {
    username: string;
    password: string;
    name: string;
    phone: string;
    churchName: string;
    position: 'pastor' | 'elder' | 'evangelist' | 'member';
    email?: string;
    role?: string;
    isApproved?: boolean;
}

// 회원 수정 데이터
export interface UpdateUserData {
    name?: string;
    phone?: string;
    churchName?: string;
    position?: 'pastor' | 'elder' | 'evangelist' | 'member';
    email?: string;
    role?: string;
    isApproved?: boolean;
}

// 직분 레이블
export const POSITION_LABELS: Record<string, string> = {
    pastor: '목사',
    elder: '장로',
    evangelist: '전도사',
    member: '일반교인'
};

// 권한 레이블 (새로운 5단계 권한 체계)
export const ROLE_LABELS: Record<string, string> = {
    super_admin: '최고관리자',
    admin: '일반관리자',
    member: '정회원',      // 목사/장로 - 글쓰기, 보기 권한
    guest: '일반회원',      // 전도사/일반교인 - 보기만 권한
    pending: '승인대기'
};

// 권한별 설명
export const ROLE_DESCRIPTIONS: Record<string, string> = {
    super_admin: '모든 권한 (회원관리 포함)',
    admin: '관리 권한 (회원관리 제외)',
    member: '글쓰기, 보기 권한',
    guest: '보기만 권한',
    pending: '승인 대기 중'
};

