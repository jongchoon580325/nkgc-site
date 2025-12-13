# 🖼️ 통합 미디어 관리 시스템 (IMMS) PRD

## 1. 개요 및 배경

현재 프로젝트는 `public/uploads/YYYY/MM` 경로에 로컬 파일 시스템을 이용하여 이미지와 파일을 저장하고 있습니다. 이 방식은 초기 개발 단계에서는 빠르고 간편하지만, 운영 환경(특히 웹 호스팅 또는 클라우드 환경)으로 전환 시 다음과 같은 심각한 문제를 야기합니다.

### 🚩 현재의 문제점 (Pain Points)

1. **관리 불가능한 파일 시스템**: 업로드된 파일이 무작위 UUID로 이름이 변경되어 저장되므로, 관리자가 FTP나 터미널 접속 없이는 어떤 파일이 어디에 있는지 식별할 수 없습니다.
2. **고아 파일(Orphan Files) 누적**: 게시글을 삭제하거나 이미지를 교체해도, 기존 원본 파일은 서버에 그대로 남아 용량을 잠식합니다. (Garbage Collection 부재)
3. **재사용 불가**: 이미 업로드한 "노회 로고"나 "행사 배너"를 다른 글에서 다시 쓰고 싶어도, URL을 알 수 없어 **중복 업로드**를 하게 됩니다.
4. **확장성 한계**: 로컬 파일 시스템(`fs`)에 의존하는 코드는 AWS S3, Cloudflare R2 같은 오브젝트 스토리지로 이전하기 어렵습니다.

### 🎯 목표 (Goals)

1. **중앙화된 자산 관리**: 모든 업로드 파일을 데이터베이스(`FileAsset`)로 관리하여 검색, 정렬, 필터링이 가능하게 합니다.
2. **관리자 UI 제공**: `/admin/media` (가칭) 페이지를 통해 시각적으로 파일을 확인하고 삭제/관리할 수 있어야 합니다.
3. **재사용성 증대**: 업로드 시 "기존 라이브러리에서 선택" 기능을 제공하여 중복 업로드를 방지합니다.
4. **스토리지 추상화**: 로컬 저장소뿐만 아니라 향후 클라우드 스토리지로의 확장을 고려한 설계를 적용합니다.

---

## 2. 데이터베이스 설계 (Schema)

모든 파일 자산을 추적하기 위해 `FileAsset` 모델을 신설합니다.

```prisma
// prisma/schema.prisma

model FileAsset {
  id          String   @id @default(uuid())
  
  // 파일 메타데이터
  originalName String   @map("original_name") // 사용자가 올린 원본 파일명 (예: "2024_수련회.jpg")
  storedName   String   @map("stored_name")   // 서버에 저장된 파일명 (예: "abc-123.jpg")
  
  // 경로 및 접근
  path         String   // 물리적 저장 경로 (예: "2025/12/")
  url          String   // 웹 접근 URL (예: "/uploads/2025/12/abc-123.jpg")
  
  // 파일 속성
  mimeType     String   @map("mime_type")     // 예: "image/jpeg", "application/pdf"
  size         Int      // 파일 크기 (bytes)
  width        Int?     // 이미지인 경우 너비
  height       Int?     // 이미지인 경우 높이
  
  // 관리 정보
  uploadedBy   Int?     @map("uploaded_by")   // 업로더 (User ID)
  uploadedAt   DateTime @default(now()) @map("uploaded_at")
  
  // 사용 처 (선택적, 고아 파일 추적용)
  isSystem     Boolean  @default(false) @map("is_system") // 시스템 필수 파일 여부
  
  @@map("file_assets")
  @@index([uploadedAt])
  @@index([mimeType])
}
```

---

## 3. 기능 명세 (Feature Specifications)

### A. 미디어 라이브러리 관리 페이지 (`/admin/media`)

관리자 전용의 파일 탐색기 페이지입니다.

- **View Modes**: 그리드 뷰 (이미지 미리보기 중심) / 리스트 뷰 (파일 세부 정보 중심)
- **Filters**: 이미지 / 동영상 / 문서 / 전체
- **Search**: 원본 파일명으로 검색
- **Operations**:
  - **삭제**: 파일 삭제 시 DB 레코드와 **실제 물리 파일**을 동시에 삭제 (가장 중요)
  - **상세 정보**: URL 복사, 파일 크기 확인, 미리보기

### B. 통합 업로드 컴포넌트 (`MediaUploader`)

기존의 단순 `<input type="file">`을 대체하는 React 컴포넌트입니다.

- **Tabs**:
    1. **📤 업로드**: 드래그앤드롭으로 새 파일 업로드
    2. **📂 라이브러리**: 기존에 업로드된 파일 중 검색/선택
- **Preview**: 선택된 파일의 썸네일 즉시 표시
- **Selection**: 파일 선택 시 해당 파일의 URL과 ID를 부모 컴포넌트에 전달

### C. API 개선 (`/api/files`)

- `POST /api/files/upload`: 파일 업로드 및 `FileAsset` 생성
- `GET /api/files`: 페이징 처리된 파일 목록 조회
- `DELETE /api/files`: 파일 삭제 (물리 파일 삭제 포함)

---

## 4. 구현 로드맵 (Task Breakdown)

### Phase 1: 인프라 구축

- [ ] `FileAsset` Prisma 모델 추가 및 마이그레이션 (`prisma client push`)
- [ ] `StorageService` 유틸리티 구현 (파일 저장/삭제 인터페이스 정의 및 Local 구현체)
- [ ] 통합 업로드 API 구현 (`/api/files/upload`)

### Phase 2: 관리자 페이지 구현

- [ ] `/admin/media/page.tsx`: 미디어 라이브러리 UI 구현
- [ ] `/api/files/route.ts`: 파일 목록 조회(GET) 및 삭제(DELETE) 구현
- [ ] 이미지 미리보기 및 메타데이터 표시 기능 구현

### Phase 3: 기존 데이터 마이그레이션 (중요)

- [ ] 마이그레이션 스크립트 작성: `public/uploads` 폴더를 순회하며 DB에 없는 파일을 `FileAsset`으로 등록
  - 복구 전략: 원본 파일명이 소실된 경우, 저장된 파일명을 원본 이름으로 사용.

### Phase 4: 시스템 전반 적용

- [ ] `MediaUploader` 컴포넌트 개발: 업로드 및 라이브러리 선택 탭 구현
- [ ] 기존 업로드 포인트 교체:
  - 현직임원관리 (`/admin/officers`)
  - 갤러리/게시판 (`/board/...`)
  - 배너/팝업 관리 등

---

## 5. 시니어 개발자 제언 (Recommendations)

1. **점진적 적용 (Incremental Adoption)**: 시스템 전체를 한 번에 뜯어고치는 것은 위험합니다. **Phase 1 & Phase 2**를 먼저 진행하여 "관리 도구"를 확보한 후, **Phase 4**를 통해 각 페이지를 하나씩 새로운 업로더로 교체해 나가는 전략을 추천합니다.
2. **이미지 최적화 (Optimization)**: 사용자가 고해상도(10MB+) 이미지를 그대로 업로드하면 트래픽 낭비가 심합니다. 업로드 시점에서 `sharp` 라이브러리를 사용해 웹용 사이즈(예: 최대 1920px)로 리사이징하고 압축하여 저장하는 파이프라인을 구축하면 장기적인 운영 비용을 절감할 수 있습니다.
3. **보안 (Security)**: 업로드 파일의 확장자 검증뿐만 아니라, 실제 파일의 매직 넘버(Magic Number)를 확인하여 악성 스크립트 업로드를 방지해야 합니다.
