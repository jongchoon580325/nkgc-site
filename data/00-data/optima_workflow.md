---
description: "Optima AI Agency workflow for quality assurance and optimization"
---

# Optima Workflow

## Goal

Ensure the migrated content meets web accessibility standards, performance targets, and correct access permissions for church members.

## Trigger

"자료실의 회원별 접근 권한 시나리오 및 Core Web Vitals 최적화(LCP, FID) 테스트 스크립트를 자동 생성하고 검증하라."

## Steps

1. **접근 권한 시나리오 정의** – List all member roles (pastor, elder, evangelist, general) and the resources they may access.
2. **테스트 스크립트 자동 생성** – Generate Cypress/Playwright scripts that log in as each role and verify allowed/denied pages.
3. **Core Web Vitals 측정** – Use Lighthouse CI to run performance audits on key pages (home, 자료실, officer pages).
4. **성능 최적화** – Apply code‑splitting, image optimization, CDN caching, and adjust Tailwind purge settings to hit LCP < 2.5 s, FID < 100 ms.
5. **접근성 검증** – Run axe‑core checks for WCAG 2.1 AA compliance on all public pages.
6. **보고서 작성** – Produce `optima_verification_report.md` summarizing permission test results, performance metrics, and accessibility findings.
7. **피드백 루프** – If any failures, create issue tickets for Codius to address and re‑run the validation.

## Output

- `optima_access_tests.{cypress|playwright}` – Automated role‑based access test suite.
- `optima_lighthouse_report.html` – Performance audit results.
- `optima_accessibility_report.md` – Accessibility audit summary.
- `optima_verification_report.md` – Consolidated verification documentation.
