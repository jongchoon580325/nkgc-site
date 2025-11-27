'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import AccountModal from '../common/AccountModal'

export default function Header() {
    const { data: session, status } = useSession()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const menuItems = [
        { label: 'Home', href: '/' },
        {
            label: '노회소개',
            href: '/about/greeting',
            submenu: [
                { label: '노회장인사', href: '/about/greeting' },
                { label: '노회소개', href: '/about/introduction' },
                { label: '역대임원', href: '/about/past-officers' },
                { label: '현재임원', href: '/about/officers' },
            ],
        },
        {
            label: '시찰소개',
            href: '/about/inspections',
        },
        {
            label: '기관소개',
            href: '/organizations/sunday-school',
            submenu: [
                { label: '주교연합회', href: '/organizations/sunday-school' },
                { label: '학생면려회', href: '/organizations/student' },
                { label: '청장년면려회', href: '/organizations/young-adult' },
                { label: '여전도회', href: '/organizations/womens' },
                { label: '남전도회', href: '/organizations/mens' },
            ],
        },
        {
            label: '노회행정',
            href: '/administration/forms',
            submenu: [
                { label: '노회행정서식', href: '/administration/forms' },
                { label: '자립위원회서식', href: '/administration/independence-forms' },
                { label: '노회원현황', href: '/administration/members-status' },
                { label: '상비부현황', href: '/administration/standing-committees' },
                { label: '상회비현황', href: '/administration/fees-status' },
                { label: '별명부', href: '/administration/separate-registry' },
            ],
        },
        {
            label: '노회자료',
            href: '/resources/photos',
            submenu: [
                { label: '사진자료실', href: '/resources/photos' },
                { label: '영상자료실', href: '/resources/videos' },
                { label: '규칙자료실', href: '/resources/rules' },
                { label: '고시자료실', href: '/resources/notices' },
                { label: '결의서자료실', href: '/resources/resolutions' },
                { label: '고시자학습자료실', href: '/resources/study-materials' },
            ],
        },
        {
            label: '노회알림',
            href: '/notices',
            submenu: [
                { label: '노회공지', href: '/notices/announcements' },
                { label: '자립위원회', href: '/notices/independence' },
                { label: '정회원전용', href: '/notices/members-only' },
            ],
        },
    ]

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white shadow-md'
                : 'bg-white/95 backdrop-blur-sm'
                }`}
        >
            <div className="container-custom">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <Image
                            src="/images/logo.png"
                            alt="남경기노회 로고"
                            width={50}
                            height={50}
                            className="h-12 w-auto"
                            priority
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-accent-600">
                                대한예수교장로회
                            </span>
                            <span className="text-2xl font-bold text-primary-blue tracking-wide">
                                남경기노회
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {menuItems.map((item) => (
                            <div key={item.label} className="relative group">
                                <Link
                                    href={item.href}
                                    className="px-4 py-2 text-gray-700 hover:text-primary-blue transition-colors font-medium"
                                >
                                    {item.label}
                                </Link>
                                {item.submenu && (
                                    <div className="absolute top-full left-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 pt-2">
                                        <div className="bg-white shadow-lg rounded-lg overflow-hidden min-w-[200px]">
                                            {item.submenu.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-primary-blue transition-colors"
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {status === 'loading' ? (
                            <div className="px-4 py-2 text-gray-400">...</div>
                        ) : session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-blue transition-colors font-medium"
                                >
                                    <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white font-semibold">
                                        {session.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span>{session.user?.name || '사용자'}</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* User Dropdown Menu */}
                                {showUserMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-sm text-gray-500">로그인됨</p>
                                            <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                                        </div>
                                        {session.user?.role && ['super_admin', 'admin'].includes(session.user.role) && (
                                            <Link
                                                href="/admin"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                관리자 페이지
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                signOut({ callbackUrl: '/' });
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            로그아웃
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-gray-700 hover:text-primary-blue transition-colors font-medium"
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-gray-700 hover:text-primary-blue transition-colors font-medium"
                                >
                                    회원가입
                                </Link>
                            </>
                        )}
                        <button
                            onClick={() => setIsAccountModalOpen(true)}
                            className="px-5 py-2 bg-primary-green text-white rounded-lg hover:bg-accent-600 transition-colors font-medium shadow-sm"
                        >
                            상회비 납부
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-gray-700 hover:text-primary-blue"
                        aria-label="메뉴 열기"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMobileMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t">
                        <nav className="flex flex-col space-y-2">
                            {menuItems.map((item) => (
                                <div key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="block px-4 py-2 text-gray-700 hover:bg-brand-50 hover:text-primary-blue rounded transition-colors font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                    {item.submenu && (
                                        <div className="pl-4 mt-1 space-y-1">
                                            {item.submenu.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-brand-50 hover:text-primary-blue rounded transition-colors"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-4 mt-4 border-t space-y-2">
                                <Link
                                    href="/login"
                                    className="block px-4 py-2 text-gray-700 hover:bg-brand-50 hover:text-primary-blue rounded transition-colors font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    로그인
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-4 py-2 text-gray-700 hover:bg-brand-50 hover:text-primary-blue rounded transition-colors font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    회원가입
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsAccountModalOpen(true)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className="block w-full px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-accent-600 transition-colors font-medium text-center"
                                >
                                    상회비 납부
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>

            {/* Account Modal */}
            <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />
        </header>
    )
}
