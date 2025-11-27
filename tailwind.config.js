/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // 노회 공식 컬러 (로고에서 추출)
                primary: {
                    blue: '#2196F3', // 로고 좌측 파란색
                    green: '#8BC34A', // 로고 우측 녹색
                },
                // 추가 색상 팔레트
                brand: {
                    50: '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#42A5F5',
                    500: '#2196F3',
                    600: '#1E88E5',
                    700: '#1976D2',
                    800: '#1565C0',
                    900: '#0D47A1',
                },
                accent: {
                    50: '#F1F8E9',
                    100: '#DCEDC8',
                    200: '#C5E1A5',
                    300: '#AED581',
                    400: '#9CCC65',
                    500: '#8BC34A',
                    600: '#7CB342',
                    700: '#689F38',
                    800: '#558B2F',
                    900: '#33691E',
                },
            },
            fontFamily: {
                sans: ['var(--font-noto-sans)', 'sans-serif'],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
        },
    },
    plugins: [],
}
