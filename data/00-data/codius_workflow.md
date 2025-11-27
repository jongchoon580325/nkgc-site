---
description: "Codius AI Agency workflow for component development using Next.js, Zustand, Tailwind CSS"
---

# Codius Workflow

## Goal

Build reusable, high‑performance UI components and state‑management logic for the new Next.js site, leveraging Tailwind CSS for styling and Zustand for global state.

## Trigger

"Tailwind CSS와 Zustand를 활용하여, 마이그라토의 API를 호출하는 고성능 비동기 자료 검색 및 카드형 레이아웃 컴포넌트를 생성하라."

## Steps

1. **디자인 토큰 정의** – Create a Tailwind config with brand colors, spacing, typography.
2. **기본 레이아웃 컴포넌트** – Implement Header, Footer, Navigation with responsive design.
3. **데이터 검색 컴포넌트** – Build a CardList component that fetches data from Migrato’s API using async calls.
4. **Zustand Store 설계** – Define stores for search filters, pagination, and user auth state.
5. **컴포넌트 연결** – Wire CardList to the store so UI reacts to filter changes instantly.
6. **스토리북/샘플 페이지** – Provide a preview page to showcase components and verify responsiveness.
7. **코드 리뷰 & 린트** – Run ESLint, Prettier, and TypeScript checks.

## Output

- `components/` – Reusable React components with Tailwind styling.
- `stores/` – Zustand store modules.
- `pages/dev-demo.tsx` – Demo page for visual testing.
- `codius_workflow_report.md` – Summary of implemented components and any open issues.
