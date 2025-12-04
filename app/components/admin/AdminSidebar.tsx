'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SubMenuItem {
    name: string;
    href: string;
    badge?: number;
}

interface MenuItem {
    name: string;
    icon: React.ReactNode;
    href?: string; // 최상위 메뉴가 링크일 경우
    submenu?: SubMenuItem[];
    requiredRole?: string[];
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['노회행정', '노회자료']); // 기본적으로 일부 펼쳐둠

    const toggleMenu = (name: string) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setExpandedMenus([name]);
        } else {
            setExpandedMenus(prev =>
                prev.includes(name)
                    ? prev.filter(item => item !== name)
                    : [...prev, name]
            );
        }
    };

    const menuItems: MenuItem[] = [
        {
            name: '대시보드',
            href: '/admin',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: '노회행정',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            submenu: [
                { name: '정회원관리', href: '/admin/members' },
                { name: '상비부관리', href: '/admin/standing-committees' },
                { name: '상회비관리', href: '/admin/fees-status' },
                { name: '별명부관리', href: '/admin/separate-registry' },
            ]
        },
        {
            name: '노회자료',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            submenu: [
                { name: '규칙관리', href: '/admin/rules' },
                { name: '결의서관리', href: '/admin/resolutions' },
                { name: '사진자료실 관리', href: '/admin/gallery-settings' },
                { name: '영상자료실 관리', href: '/admin/video-settings' },
                { name: '응시자 관리', href: '/admin/exam' },
            ]
        },
        {
            name: '노회소개',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            submenu: [
                { name: '임원 관리', href: '/admin/officers' },
                { name: '콘텐츠 관리', href: '/admin/content' },
            ]
        },
        {
            name: '기관소개',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            submenu: [
                { name: '기관 관리', href: '/admin/organizations' },
            ]
        },
        {
            name: '시찰소개',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            ),
            submenu: [
                { name: '시찰 관리', href: '/admin/inspections' },
            ]
        },
        {
            name: '노회알림/서식',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            submenu: [
                { name: '게시판 설정', href: '/admin/board-settings' },
            ]
        },
        {
            name: '메인 페이지',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            submenu: [
                { name: '히어로 관리', href: '/admin/hero' },
            ]
        },
        {
            name: '시스템 관리',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            submenu: [
                { name: '데이터 관리', href: '/admin/data-management' },
            ]
        },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    const isCategoryActive = (item: MenuItem) => {
        if (item.href && isActive(item.href)) return true;
        if (item.submenu) {
            return item.submenu.some(sub => isActive(sub.href));
        }
        return false;
    };

    return (
        <aside
            className={`${isCollapsed ? 'w-20' : 'w-64'
                } bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed left-0 top-0 transition-all duration-300 z-40 flex flex-col`}
        >
            {/* Logo & Toggle */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                {!isCollapsed && (
                    <div>
                        <h1 className="text-xl font-bold">NKGC Admin</h1>
                        <p className="text-xs text-gray-400 mt-1">남경기노회 관리자</p>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isCollapsed ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const active = isCategoryActive(item);
                    const expanded = expandedMenus.includes(item.name);

                    return (
                        <div key={item.name} className="mb-1">
                            <div
                                onClick={() => {
                                    if (item.submenu) {
                                        toggleMenu(item.name);
                                    }
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${active && !item.submenu // 단일 메뉴이면서 활성화된 경우
                                        ? 'bg-primary-blue text-white shadow-lg'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    } ${active && item.submenu ? 'text-white' : ''}`} // 서브메뉴가 있고 활성화된 경우 텍스트 밝게
                            >
                                {item.href && !item.submenu ? (
                                    <Link href={item.href} className="flex items-center gap-3 w-full">
                                        <span className="flex-shrink-0">{item.icon}</span>
                                        {!isCollapsed && <span className="flex-1 font-medium">{item.name}</span>}
                                    </Link>
                                ) : (
                                    <>
                                        <span className="flex-shrink-0">{item.icon}</span>
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 font-medium">{item.name}</span>
                                                {item.submenu && (
                                                    <svg
                                                        className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Submenu */}
                            {!isCollapsed && item.submenu && expanded && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-700 pl-2">
                                    {item.submenu.map((sub) => (
                                        <Link
                                            key={sub.href}
                                            href={sub.href}
                                            className={`block px-4 py-2 text-sm rounded-lg transition-colors ${isActive(sub.href)
                                                    ? 'bg-gray-700 text-white font-medium'
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                                }`}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    {!isCollapsed && <span className="font-medium">사이트로 돌아가기</span>}
                </Link>
            </div>
        </aside>
    );
}
