export default function HeroSection() {
    return (
        <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
            {/* Space background with dark overlay */}
            <div className="absolute inset-0 space-bg opacity-80" />

            {/* Content */}
            <div className="relative z-10 container-custom text-center text-white px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Main Slogan */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
                        Coram Deo
                    </h1>

                    {/* Organization Name */}
                    <p className="text-xl md:text-2xl lg:text-3xl font-semibold mb-8 opacity-95">
                        대한예수교 장로회 남경기노회
                    </p>


                    {/* Motto */}
                    <div className="mb-8 space-y-4 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
                        <p className="font-bold text-white">
                            1. 우리는 창조주 하나님을 믿습니다.
                        </p>
                        <p className="font-bold text-white">
                            2. 우리는 구세주 예수님을 믿습니다.
                        </p>
                        <p className="font-bold text-white">
                            3. 우리는 보혜사 성령님을 믿습니다.
                        </p>
                    </div>

                    {/* Subtitle */}
                    <div className="mb-10 text-base md:text-lg opacity-90">
                        <p className="italic">
                            Living as Christians before the Word of God.
                        </p>
                    </div>

                    {/* Call to Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/board/FORM_ADMIN"
                            className="px-8 py-4 bg-white text-brand-700 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            노회 행정 서식 다운로드
                        </a>
                        <a
                            href="/board/NOTICE"
                            className="px-8 py-4 bg-accent-500 text-white rounded-lg font-semibold text-lg hover:bg-accent-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-2 border-white/30"
                        >
                            최신 노회 공지 확인
                        </a>
                    </div>
                </div>
            </div>

            {/* Decorative Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                >
                    <path
                        d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
                        fill="white"
                    />
                </svg>
            </div>
        </section>
    )
}
