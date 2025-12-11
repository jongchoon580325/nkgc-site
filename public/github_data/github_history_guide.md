# GitHub History 문서 작성 가이드

## 📌 개요

`github_history` 문서는 프로젝트의 모든 커밋/푸시 기록을 시간순으로 관리하는 문서입니다.  
이 가이드를 따라 일관된 형식으로 기록하고, **원격 저장소와 동기화 상태**를 유지합니다.

---

## ⚠️ 핵심 원칙: 해시 동기화

> **원격 저장소의 커밋 해시 = 로컬 히스토리 문서의 해시**

### 반드시 지켜야 할 순서

```
1. git commit → 2. git push → 3. 푸시 성공 확인 → 4. 히스토리 문서 작성
```

| 순서 | 작업 | 확인 사항 |
|------|------|----------|
| 1 | `git commit` | 커밋 메시지 작성 완료 |
| 2 | `git push origin main` | 원격 전송 완료 |
| 3 | 푸시 성공 확인 | 에러 없이 완료 메시지 확인 |
| 4 | 히스토리 문서 작성 | 해시 일치 확인 |

### ❌ 잘못된 순서

```
커밋 → 히스토리 작성 → 푸시  ← 푸시 실패 시 해시 불일치 발생!
```

---

## 📝 기록 형식

### 항목 구조

```
[번호]. [날짜 시간] Commit: [해시]
   Title: [커밋 제목]
   Description: [상세 설명]
```

### 각 필드 설명

| 필드 | 형식 | 예시 |
|------|------|------|
| 번호 | 순차 증가 (최신이 가장 큼) | `38.` |
| 날짜/시간 | `[YYYY-MM-DD HH:MM]` | `[2025-12-10 20:48]` |
| 해시 | 7자리 단축 해시 | `9f61d0c` |
| Title | 커밋 메시지 첫 줄 | `feat: 회원관리 기능 추가` |
| Description | 변경 사항 요약 | 상세 설명 또는 Title과 동일 |

---

## 🔧 기록 절차 (Step-by-Step)

### Step 1: 커밋 실행

```bash
git add -A
git commit -m "feat: 기능 설명"
```

### Step 2: 원격 저장소 푸시

```bash
git push origin main
```

### Step 3: 푸시 성공 확인

성공 메시지 예시:

```
To https://github.com/username/repo.git
   이전해시..새해시  main -> main
```

### Step 4: 커밋 해시 확인

```bash
git log --oneline -1
```

출력 예시:

```
9f61d0c feat: 회원관리 기능 추가
```

### Step 5: github_history 문서 상단에 기록

```
38. [2025-12-10 20:48] Commit: 9f61d0c
   Title: feat: 회원관리 기능 추가
   Description: 회원관리 시스템 리팩토링 및 거부 회원 관리 기능 추가
```

---

## ✅ 올바른 기록 예시

```
38. [2025-12-10 20:48] Commit: 9f61d0c
   Title: feat: 회원관리 시스템 리팩토링 및 거부 회원 관리 기능 추가
   Description: 5단계 권한 체계 구현, 가입승인 관리 페이지 신규 생성

37. [2025-12-04 14:40] Commit: 5312db2
   Title: feat: Implement PDF Flip Viewer
   Description: feat: Implement PDF Flip Viewer
```

---

## ❌ 흔한 실수

| 실수 | 문제점 | 해결 방법 |
|------|--------|----------|
| 푸시 전 기록 | 푸시 실패 시 해시 변경됨 | 반드시 푸시 완료 후 기록 |
| 해시 오타 | 원격과 불일치 | `git log --oneline -1`로 복사 |
| 번호 중복 | 데이터 혼동 | 이전 번호 확인 후 +1 |
| 날짜 오류 | 이력 추적 어려움 | 커밋 시점 기준 기록 |

---

## 🔍 검증 방법

### 방법 1: GitHub 웹사이트 확인

1. GitHub 저장소 → Code 탭
2. 최신 커밋 해시 확인
3. 로컬 히스토리 문서와 대조

### 방법 2: CLI로 확인

```bash
# 로컬 최신 커밋
git log --oneline -1

# 원격 최신 커밋
git log origin/main --oneline -1
```

두 결과의 해시가 동일해야 합니다.

---

## 📋 커밋 메시지 컨벤션

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `feat` | 새 기능 추가 | `feat: 로그인 기능 구현` |
| `fix` | 버그 수정 | `fix: 로그인 오류 해결` |
| `chore` | 기타 작업 | `chore: 불필요한 파일 삭제` |
| `refactor` | 리팩토링 | `refactor: 코드 정리` |
| `docs` | 문서 작업 | `docs: README 업데이트` |
| `style` | 스타일 변경 | `style: 코드 포맷팅` |

---

## 📁 파일 위치

```
프로젝트 루트/
└── public/
    └── github_data/
        ├── github_history          ← 히스토리 문서
        └── github_history_guide.md ← 이 가이드 문서
```

---

*Last Updated: 2025-12-10*
