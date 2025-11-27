'use client';

export default function RefreshSessionPage() {
    const handleRefresh = async () => {
        // 강제 로그아웃 후 로그인 페이지로 이동
        window.location.href = '/api/auth/signout?callbackUrl=/login';
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">세션 갱신 필요</h1>
                <p className="text-gray-600 mb-6">
                    권한이 업데이트되었습니다. <br />
                    다시 로그인하여 새로운 권한을 적용하세요.
                </p>
                <button
                    onClick={handleRefresh}
                    className="w-full px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    로그아웃 후 다시 로그인
                </button>
            </div>
        </div>
    );
}
