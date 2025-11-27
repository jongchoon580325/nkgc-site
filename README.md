# 남경기노회 공식 랜딩페이지

대한예수교 장로회 남경기노회의 공식 웹사이트입니다.

![남경기노회 로고](./public/images/logo.png)

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Font**: Noto Sans KR (Google Fonts)

## 주요 기능

### 1. Hero Section

- "Coram Deo" 슬로건
- 시편 1:1~2 성경 구절
- 환영 메시지 및 CTA 버튼

### 2. Quick Actions (8개 주요 서비스)

- 노회공지
- 노회운영규칙
- 상비부현황
- 고시부자료
- 정회원게시판
- 시찰주소록
- 노회서식
- 노회결의서

### 3. 노회장 인사말

- 제 48~49회기 노회장 유병구 목사님 인사말

### 4. 공지 & 소식

- 카테고리별 필터링 (노회공지, 자립위원회, 정회원전용)
- 최신 공지사항 표시

### 5. 계좌 안내

- 노회 상회비: 농협 351-1196-9056-43
- 전도·구제·미자립: 농협 351-1196-9067-23
- 계좌번호 복사 기능

### 6. Photo Gallery

- 노회 주요 활동 사진
- Lightbox 모달로 확대 보기

### 7. 관련 기관 링크

- 대한예수교장로회총회
- 자립개발원
- 세례교인헌금
- 세계선교회
- 기독신문사
- 총신대학원

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## 디렉토리 구조

```
nkgc/
├── app/
│   ├── components/
│   │   ├── layout/         # Header, Footer
│   │   ├── sections/       # 메인 페이지 섹션 컴포넌트
│   │   └── ui/            # 재사용 가능한 UI 컴포넌트
│   ├── lib/               # 유틸리티 함수
│   ├── styles/            # 전역 스타일
│   ├── globals.css        # Tailwind 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx          # 메인 페이지
├── public/
│   └── images/           # 이미지 파일
│       └── logo.png      # 노회 로고
└── README.md
```

## 브랜드 컬러

- **Primary Blue**: #2196F3 (로고 좌측)
- **Primary Green**: #8BC34A (로고 우측)

## SEO 최적화

- 시맨틱 HTML 구조
- Open Graph 메타 태그
- 한글 키워드 최적화
- Next.js 이미지 최적화

## 접근성

- ARIA 레이블
- 키보드 네비게이션
- 반응형 디자인 (모바일: 360px, 태블릿: 768px, 데스크톱: 1024px+)

## 연락처

- **노회서기**: 문보길 목사 | 010-9777-1409
- **관리자**: 정영교(노회장)
- **이메일**: <naloveu@korea.com>
- **전화**: 050-2247-5432

## 라이선스

© 2024 대한예수교 장로회 남경기노회. All rights reserved.
# nkgc-site
