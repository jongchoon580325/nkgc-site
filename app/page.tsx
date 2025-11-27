import HeroSection from './components/sections/HeroSection'
import QuickActions from './components/sections/QuickActions'
import NoticeNews from './components/sections/NoticeNews'
import Gallery from './components/sections/Gallery'
import AffiliateLinks from './components/sections/AffiliateLinks'

export default function HomePage() {
    return (
        <main className="min-h-screen">
            {/* 1단: Coram Deo */}
            <HeroSection />

            {/* 2단: 주요 서비스 */}
            <QuickActions />

            {/* 3단: 노회공지&소식 */}
            <section className="section-padding bg-gray-50">
                <div className="container-custom">
                    <NoticeNews />
                </div>
            </section>

            {/* 4단: Photo Gallery */}
            <Gallery />

            {/* 5단: 관련기관 */}
            <AffiliateLinks />
        </main>
    )
}
