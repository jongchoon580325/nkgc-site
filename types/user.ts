// 회원 데이터 타입
export interface User {
    id: number;
    username: string;
    password: string;
    name: string;
    phone: string;
    churchName: string;
    position: 'pastor' | 'elder' | 'evangelist' | 'member';
    role: 'admin' | 'pastor' | 'elder' | 'evangelist' | 'member' | 'pending';
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

// 권한 레이블
export const ROLE_LABELS: Record<string, string> = {
    admin: '관리자',
    pastor: '목사',
    elder: '장로',
    evangelist: '전도사',
    member: '일반교인',
    pending: '승인대기'
};
