# 🤖 Optimal AI Prompts for Building Integrated Media Management System

이 문서는 AI(예: ChatGPT, Claude, Copilot 등)에게 **"이 프로젝트를 위한 최적의 통합 미디어 관리 시스템(IMMS)을 구축해줘"**라고 명령할 때 사용할 수 있는 **최상의 프롬프트**입니다.

이 프롬프트는 개발자가 고려해야 할 **아키텍처, 성능 최적화, 확장성, UX/UI, 보안** 등 미세한 부분까지 모두 포괄하고 있어, AI가 단순한 코드가 아닌 **프로덕션 레벨의 솔루션**을 제시하도록 설계되었습니다.

---

## 🇺🇸 English Version (Best for Code Generation)

**Subject**: Architecture & Implementation Request for Next.js Integrated Media Management System

**Prompt:**

```markdown
Act as a **Senior Full-Stack Architect** specialized in **Next.js 14+ (App Router), Prisma, and TypeScript**.

I need you to design and implement a production-grade **Integrated Media Management System (IMMS)** for an existing web application. The current project uses a local filesystem for storage, which causes management and scalability issues.

### 1. Project Context
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (via Prisma ORM) - *Migrating to PostgreSQL later*
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (Session based)

### 2. Core Objectives
Build a centralized system to manage all digital assets (images, videos, PDFs) with the following capabilities:
1.  **Centralized Asset Database**: Track every file in a `FileAsset` table (original name, stored name, mime-type, size, usage context).
2.  **Storage Abstraction Layer**: Create a `StorageService` interface. Implement a `LocalStorageProvider` initially, but structure the code so it's trivial to swap with `S3Provider` or `CloudflareR2Provider` later without changing business logic.
3.  **Smart Upload Pipeline**:
    -   Validate file types (magic numbers, not just extensions).
    -   **Optimization**: Automatically resize/compress images using `sharp` before saving (Create thumbnails & web-optimized versions).
    -   **De-duplication**: (Optional) Check file hashes to prevent storing duplicate files.
4.  **Admin Dashboard (`/admin/media`)**:
    -   Grid/List view with infinite scroll or pagination.
    -   Filters (by type, date) and Search (by name).
    -   **Bulk Actions**: Select multiple files -> Delete / Move.
    -   **Preview Modal**: Detailed view with metadata.
5.  **Unified Uploader Component (`<MediaUploader />`)**:
    -   Tabs: [Upload New] | [Select from Library]
    -   Drag & Drop support.
    -   Progress bars for uploads.
    -   Should returns the `FileAsset` ID and URL to the parent form.

### 3. Technical Requirements & Constraints
-   **Clean Architecture**: Separate concerns (Service Layer for logic, API Routes for transport, Server Actions for mutations).
-   **Type Safety**: Use Zod for validation. Strict TypeScript everywhere.
-   **Performance**: Use Next.js `<Image>` component for rendering. Implement lazy loading for the media library grid.
-   **Security**: Ensure only authenticated admins can upload/delete. Prevent path traversal attacks.

### 4. Deliverables
Please provide:
1.  **Prisma Schema**: The `FileAsset` model.
2.  **Storage Interface**: The TypeScript interface and the `LocalFileSystem` implementation using `fs/promises`.
3.  **API Handler**: The generic upload route (`POST /api/media/upload`) handling multipart/form-data.
4.  **Frontend Component**: The `<MediaManager />` code using Tailwind CSS + React Dropzone.

Don't give me simple snippets. **Architect the solution** for long-term maintainability. Start by proposing the folder structure and the Prisma schema.
```

---

## 🇰🇷 Korean Version (For Clear Understanding)

**주제**: Next.js 통합 미디어 관리 시스템 아키텍처 및 구현 요청

**Prompt:**

```markdown
**Next.js 14+ (App Router), Prisma, TypeScript** 전문 **시니어 풀스택 아키텍트**로서 행동해 주세요.

현재 운영 중인 웹 애플리케이션을 위해 **프로덕션 레벨의 '통합 미디어 관리 시스템(IMMS)'**을 설계하고 구현해 주시기 바랍니다. 현재는 로컬 파일 시스템에 무작위로 파일을 저장하고 있어 관리와 확장에 어려움을 겪고 있습니다.

### 1. 프로젝트 컨텍스트
- **프레임워크**: Next.js 14 (App Router)
- **데이터베이스**: SQLite (Prisma ORM 사용)
- **스타일링**: Tailwind CSS
- **인증**: NextAuth.js (세션 기반)

### 2. 핵심 목표
모든 디지털 자산(이미지, 영상, 문서)을 통합 관리할 수 있는 시스템을 구축해야 합니다:
1.  **중앙화된 자산 데이터베이스**: 모든 파일을 `FileAsset` 테이블로 관리해야 합니다 (원본명, 저장명, MIME 타입, 파일 크기, 사용처 등 추적).
2.  **스토리지 추상화 계층 (Storage Abstraction)**: `StorageService` 인터페이스를 설계해 주세요. 초기에는 로컬 파일 시스템(`fs`)을 사용하지만, 추후 비즈니스 로직 수정 없이 AWS S3나 Cloudflare R2로 전환할 수 있도록 **어댑터 패턴**을 적용해야 합니다.
3.  **지능형 업로드 파이프라인**:
    -   **유효성 검사**: 단순 확장자가 아닌 파일 매직 넘버를 통한 검증.
    -   **이미지 최적화**: `sharp` 라이브러리를 사용하여 저장 전 리사이징 및 압축 자동화 (썸네일 및 웹 최적화 버전 생성).
    -   **중복 방지**: (선택 사항) 파일 해시를 확인하여 중복 저장을 방지하는 로직.
4.  **관리자 대시보드 (`/admin/media`)**:
    -   무한 스크롤 또는 페이지네이션이 적용된 그리드/리스트 뷰.
    -   필터(타입별, 날짜별) 및 검색 기능.
    -   **일괄 작업**: 다중 선택 -> 일괄 삭제 / 이동 기능.
    -   **미리보기 모달**: 상세 메타데이터 표시.
5.  **통합 업로더 컴포넌트 (`<MediaUploader />`)**:
    -   탭 구성: [새 파일 업로드] | [라이브러리에서 선택]
    -   드래그 앤 드롭 지원.
    -   업로드 진행률 표시 바.
    -   부모 폼에 `FileAsset` ID와 URL을 반환하는 구조.

### 3. 기술 요구사항 및 제약
-   **클린 아키텍처**: 관심사를 분리해 주세요 (로직은 Service Layer, 전송은 API Routes/Server Actions).
-   **타입 안전성**: Zod를 이용한 검증 및 엄격한 TypeScript 사용.
-   **성능**: 렌더링 시 Next.js `<Image>` 컴포넌트 활용. 미디어 라이브러리 목록의 지연 로딩(Lazy Loading) 구현.
-   **보안**: 인증된 관리자만 업로드/삭제 가능하도록 처리. 경로 탐색(Path Traversal) 공격 방지.

### 4. 결과물 요구사항
다음 내용을 포함하여 작성해 주세요:
1.  **Prisma Schema**: `FileAsset` 모델 설계.
2.  **Storage Interface**: TypeScript 인터페이스 및 `fs/promises`를 활용한 로컬 스토리지 구현체.
3.  **API Handler**: 멀티파트 데이터를 처리하는 범용 업로드 라우트 (`POST /api/media/upload`).
4.  **Frontend Component**: Tailwind CSS와 React Dropzone을 활용한 `<MediaManager />` 컴포넌트 코드.

단순한 코드 조각이 아닌, **장기적인 유지보수성을 고려한 아키텍처**를 제안해 주세요. 먼저 폴더 구조 구조와 Prisma 스키마 제안부터 시작해 주세요.
```

---

### 💡 Tip for Users

이 프롬프트를 AI에게 입력할 때, 한 번에 모든 코드를 생성하라고 하기보다는 **"Step-by-Step으로 진행하자. 먼저 1번 Prisma Schema와 아키텍처부터 설명해줘"**라고 끊어서 요청하면 훨씬 더 정교한 결과를 얻을 수 있습니다.
