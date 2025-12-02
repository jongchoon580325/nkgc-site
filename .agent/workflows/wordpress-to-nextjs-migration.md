---
description: 워드프레스 게시판을 Next.js로 마이그레이션하는 워크플로우
---

# 워드프레스 게시판 → Next.js 마이그레이션 워크플로우

워드프레스 + PHP + MySQL 기반의 한국형 게시판을 Next.js 환경으로 마이그레이션하는 전체 과정을 안내합니다.

---

## Phase 1: 분석 및 설계 (2-3일)

### 1.1 기존 시스템 분석

- [ ] 워드프레스 데이터베이스 스키마 확인 및 ERD 작성
- [ ] 게시판 관련 테이블 구조 분석
- [ ] 사용 중인 플러그인 기능 목록 작성
- [ ] 첨부파일 저장 방식 및 위치 파악
- [ ] 사용자 권한 체계 분석 (정회원, 일반회원 등)

> **👤 사용자 승인 필요**: ERD 작성 후 데이터 모델 구조 확인

### 1.2 요구사항 정의

- [ ] 필수 기능 목록 작성 (CRUD, 검색, 페이지네이션, 추천, 조회수 등)
- [ ] **게시판 유형 정의**:
  - **Type A (일반형)**: 노회행정, 자립위, 고시부, 응시자, 공지, 자유, 회원 (6개)
  - **Type B (갤러리형)**: 사진자료실 (1개)
- [ ] 보안 요구사항 정의
- [ ] 성능 목표 설정
- [ ] UI/UX 개선 사항 정리 (고시자료실 탭 UI 등)

> **👤 사용자 승인 필요**: 요구사항 목록 검토 및 우선순위 결정

### 1.3 기술 스택 결정

- [ ] 데이터베이스 선택 (MySQL 유지 vs PostgreSQL vs MongoDB)
- [ ] ORM 선택 (Prisma, Drizzle, TypeORM 등)
- [ ] 인증 시스템 선택 (NextAuth.js, Auth.js, Clerk 등)
- [ ] 파일 스토리지 선택 (로컬, AWS S3, Cloudinary 등)
- [ ] 상태 관리 도구 선택 (React Query, SWR, Zustand 등)

> **👤 사용자 승인 필요**: 기술 스택 최종 결정

---

## Phase 2: 환경 구축 (1일)

### 2.1 프로젝트 초기화

```bash
# 새 Next.js 프로젝트 생성 (기존 프로젝트에 통합하는 경우 생략)
npx create-next-app@latest board-migration --typescript --tailwind --app
cd board-migration
```

### 2.2 필수 패키지 설치

```bash
# 데이터베이스 및 ORM
npm install @prisma/client
npm install -D prisma

# 인증
npm install next-auth bcryptjs
npm install -D @types/bcryptjs

# 데이터 fetching 및 상태 관리
npm install @tanstack/react-query

# 폼 관리 및 검증
npm install react-hook-form zod @hookform/resolvers

# 유틸리티
npm install date-fns clsx tailwind-merge

# 파일 업로드 (필요시)
npm install multer
npm install -D @types/multer
```

### 2.3 데이터베이스 설정

```bash
# Prisma 초기화
npx prisma init
```

- [ ] `.env` 파일에 데이터베이스 URL 설정

  ```
  DATABASE_URL="mysql://user:password@localhost:3306/database_name"
  NEXTAUTH_SECRET="생성된_시크릿_키"
  NEXTAUTH_URL="http://localhost:3000"
  ```

---

## Phase 3: 데이터베이스 마이그레이션 (2-3일)

### 3.1 스키마 정의

- [ ] `prisma/schema.prisma` 파일에 모델 정의
- [ ] **BoardType Enum 추가**: `NOTICE`, `FREE`, `MEMBER`, `FORM_ADMIN`, `FORM_SELF`, `EXAM_DEPT`, `EXAM_USER`, `GALLERY`
- [ ] `Post` 모델에 `boardType` 필드 추가
- [ ] User, Comment, Like, Attachment 모델 정의

> **👤 사용자 승인 필요**: 스키마 설계 검토

### 3.2 마이그레이션 실행

```bash
# Prisma 마이그레이션 생성 및 적용
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

### 3.3 기존 데이터 마이그레이션

```bash
# 워드프레스 데이터베이스 백업
mysqldump -u username -p database_name > wordpress_backup.sql
```

- [ ] 데이터 변환 스크립트 작성 (`scripts/migrate-data.ts`)
- [ ] 사용자 데이터 마이그레이션 실행
- [ ] 게시글 데이터 마이그레이션 실행 (각 게시판 ID를 BoardType으로 매핑)
- [ ] 댓글 및 메타데이터 마이그레이션 실행
- [ ] 첨부파일 복사 및 경로 업데이트
- [ ] 데이터 무결성 검증

> **👤 사용자 승인 필요**: 마이그레이션 완료 후 데이터 검증

---

## Phase 4: 백엔드 API 구현 (4-5일)

### 4.1 인증 시스템 구축

- [ ] `app/api/auth/[...nextauth]/route.ts` 생성
- [ ] Credentials Provider 설정
- [ ] 비밀번호 해싱 로직 구현 (bcrypt)
- [ ] 세션 관리 설정 (JWT)

### 4.2 게시판 API 엔드포인트

- [ ] `app/api/posts/route.ts` - 목록 조회 (GET), 작성 (POST)
  - **쿼리 파라미터**: `?type=NOTICE` 등으로 게시판 구분 구현
- [ ] `app/api/posts/[id]/route.ts` - 상세 조회 (GET), 수정 (PATCH), 삭제 (DELETE)
- [ ] `app/api/posts/[id]/comments/route.ts` - 댓글 CRUD
- [ ] `app/api/posts/[id]/like/route.ts` - 추천 기능
- [ ] `app/api/upload/route.ts` - 파일 업로드

### 4.3 권한 검증 미들웨어

- [ ] 로그인 여부 확인 로직 구현
- [ ] 작성자 본인 확인 로직 구현
- [ ] 정회원 전용 접근 제어 (회원게시판 등)
- [ ] 관리자 전용 쓰기 권한 제어 (공지, 서식 등)

---

## Phase 5: 프론트엔드 구현 (5-7일)

### 5.1 공통 컴포넌트

- [ ] `components/board/PostList.tsx` - 게시글 목록 (Type A)
- [ ] `components/board/GalleryList.tsx` - 갤러리 목록 (Type B)
- [ ] `components/board/PostDetail.tsx` - 게시글 상세
- [ ] `components/board/CommentSection.tsx` - 댓글 섹션
- [ ] `components/board/Pagination.tsx` - 페이지네이션
- [ ] `components/board/SearchBar.tsx` - 검색바

### 5.2 페이지 구성 (동적 라우팅)

- [ ] `app/board/[type]/page.tsx` - 통합 게시판 목록 (타입에 따라 List/Gallery 전환)
- [ ] `app/board/[type]/[id]/page.tsx` - 게시글 상세
- [ ] `app/board/[type]/write/page.tsx` - 글쓰기
- [ ] `app/board/[type]/edit/[id]/page.tsx` - 글 수정
- [ ] `app/board/exam/page.tsx` - 고시자료실 (탭 UI로 Dept/User 전환 구현)
- [ ] `app/login/page.tsx` - 로그인

### 5.3 React Query 설정

- [ ] `app/providers.tsx` 생성 및 QueryClientProvider 설정
- [ ] Custom hooks 작성 (usePosts, usePost, useComments 등)

### 5.4 스타일링

- [ ] 한국형 게시판 스타일 적용 (테이블 레이아웃)
- [ ] 갤러리형 그리드 레이아웃 적용
- [ ] 반응형 디자인 구현

> **👤 사용자 승인 필요**: UI/UX 디자인 최종 확인

---

## Phase 6: 보안 및 최적화 (2-3일)

### 6.1 보안 강화

- [ ] XSS 방지 - DOMPurify 또는 sanitize-html 적용
- [ ] CSRF 토큰 적용
- [ ] Rate limiting 설정 (next-rate-limit)
- [ ] 파일 업로드 검증 (타입, 크기, 확장자 제한)
- [ ] SQL Injection 방지 확인 (Prisma 기본 제공)

### 6.2 성능 최적화

- [ ] Next.js Image 컴포넌트 사용 (갤러리 썸네일 최적화)
- [ ] 데이터베이스 인덱스 추가 (boardType, createdAt 등)
- [ ] React Query 캐싱 전략 설정
- [ ] 동적 import로 번들 사이즈 최적화
- [ ] ISR 또는 SSR 전략 적용

### 6.3 SEO 최적화

- [ ] generateMetadata 함수로 동적 메타데이터 설정
- [ ] Open Graph 이미지 설정
- [ ] robots.txt 및 sitemap.xml 생성

---

## Phase 7: 테스트 (2-3일)

### 7.1 테스트 환경 구축

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 7.2 테스트 작성 및 실행

- [ ] 컴포넌트 단위 테스트
- [ ] API 엔드포인트 테스트
- [ ] 인증 플로우 테스트
- [ ] E2E 테스트 (Playwright 또는 Cypress)

### 7.3 수동 테스트

- [ ] 크로스 브라우저 테스트
- [ ] 모바일 반응형 테스트
- [ ] Lighthouse 성능 점수 확인

> **👤 사용자 승인 필요**: 테스트 통과 확인 및 버그 리포트

---

## Phase 8: 배포 및 운영 (1-2일)

### 8.1 배포 준비

```bash
# 프로덕션 빌드 테스트
npm run build
npm start
```

- [ ] 프로덕션 환경 변수 설정
- [ ] 데이터베이스 프로덕션 마이그레이션

### 8.2 배포 실행

```bash
# Vercel 배포
npm install -g vercel
vercel --prod
```

또는 다른 플랫폼:

- [ ] AWS (EC2, RDS, S3)
- [ ] DigitalOcean
- [ ] 자체 서버 (Docker, Nginx)

> **👤 사용자 승인 필요**: 배포 플랫폼 선택 및 배포 승인

### 8.3 모니터링 설정

```bash
# Sentry 설치 (선택사항)
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

- [ ] 에러 트래킹 설정
- [ ] 로깅 시스템 구축
- [ ] 성능 모니터링 활성화

---

## Phase 9: 사후 관리 (지속적)

### 9.1 데이터 검증 및 모니터링

- [ ] 마이그레이션된 데이터 완전성 재확인
- [ ] 사용자 피드백 수집
- [ ] 에러 로그 모니터링

### 9.2 문서화

- [ ] API 문서 작성 (Swagger 또는 README)
- [ ] 사용자 매뉴얼 작성
- [ ] 개발자 온보딩 가이드 작성

### 9.3 점진적 개선

- [ ] 사용자 요청 기능 백로그 관리
- [ ] 성능 개선 지속 적용
- [ ] 보안 패치 정기 업데이트

---

## 필수 기능 체크리스트

- [ ] 게시글 목록 조회 (페이지네이션, 타입별 필터링)
- [ ] 게시글 상세 조회 (조회수 자동 증가)
- [ ] 게시글 작성/수정/삭제
- [ ] 댓글 작성/수정/삭제
- [ ] 추천 기능
- [ ] 검색 기능
- [ ] 회원 로그인/로그아웃
- [ ] 권한 관리 (정회원 전용, 관리자 전용)
- [ ] 공지사항 상단 고정
- [ ] 첨부파일 업로드/다운로드
- [ ] **갤러리 뷰 (썸네일 그리드)**

## 선택 기능 체크리스트

- [ ] 답글 (대댓글) 기능
- [ ] 게시글 신고 기능
- [ ] 태그 시스템
- [ ] 북마크 기능
- [ ] 실시간 알림
- [ ] 관리자 전용 페이지

---

## 예상 일정 요약

| Phase | 소요 시간 | 사용자 승인 필요 |
|-------|----------|-----------------|
| Phase 1: 분석 및 설계 | 2-3일 | ✅ ERD, 요구사항, 기술스택 |
| Phase 2: 환경 구축 | 1일 | ❌ |
| Phase 3: DB 마이그레이션 | 2-3일 | ✅ 스키마, 데이터 검증 |
| Phase 4: 백엔드 API | 4-5일 | ❌ |
| Phase 5: 프론트엔드 | 5-7일 | ✅ UI/UX 디자인 |
| Phase 6: 보안/최적화 | 2-3일 | ❌ |
| Phase 7: 테스트 | 2-3일 | ✅ 테스트 결과 |
| Phase 8: 배포 | 1-2일 | ✅ 배포 승인 |
| Phase 9: 사후 관리 | 지속적 | ✅ 피드백 기반 |
| **총계** | **약 3-4주** | |

---

## 주요 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [NextAuth.js 공식 문서](https://next-auth.js.org/)
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [워드프레스 데이터베이스 구조](https://codex.wordpress.org/Database_Description)
