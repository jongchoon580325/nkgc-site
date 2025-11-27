---
description: "Coordinator (Master Agency) workflow for overseeing AI Agencies"
---

# Coordinator Workflow

## Goal

Provide project‑level coordination, communication, and risk management across the three specialized AI Agencies (Migrato, Codius, Optima) to ensure smooth hand‑offs, schedule adherence, and quality delivery.

## Trigger

"전체 워크플로를 관리하고, 사용자 요구사항을 각 전문 Agency에 전달 및 변환하며, 산출물을 승인하고 다음 단계로의 전환 시점을 결정하고 지시하라."

## Responsibilities

1. **요구사항 수집 & 정제** – Gather stakeholder requirements, translate them into clear technical specifications, and distribute to the relevant Agency.
2. **스케줄링 & 마일스톤 관리** – Maintain a project timeline, track milestones, and adjust plans when dependencies shift.
3. **핸드오프 조율** – Review deliverables from one Agency, provide feedback, and formally hand‑off to the next Agency.
4. **리스크 모니터링** – Identify blockers, assess impact, and initiate mitigation actions (e.g., re‑allocate resources, adjust scope).
5. **품질 검증 승인** – Perform a high‑level review of Optima’s validation reports and give final sign‑off before deployment.
6. **배포 및 운영 지시** – Coordinate the final deployment step with Codius and communicate launch status to stakeholders.

## Steps

| 단계 | 주요 활동 | 담당 | 산출물 |
| :--- | :--- | :--- | :--- |
| **1. 요구사항 정의** | 이해관계자 인터뷰, 요구사항 문서화 | Coordinator | `requirements.md` |
| **2. IA/UX 가이드 승인** | 아이아나가 만든 IA/UX 가이드 검토 및 승인 | Coordinator | `ui_guide_approved.md` |
| **3. DB 스키마 설계 승인** | 마이그라토가 제안한 스키마 검토, API 계약서 승인 | Coordinator | `api_schema_spec.yaml` |
| **4. 상태 모델 승인** | 코디우스가 만든 Zustand Store 설계 검토 | Coordinator | `zustand_store_diagram.md` |
| **5. 데이터 마이그레이션 검증** | 마이그라토가 완료한 데이터 이관 결과 1차 검증 | Coordinator | `migration_report.md` |
| **6. 개발 완료 보고** | 코디우스가 구현한 컴포넌트와 API 기능 리스트 제공 | Coordinator | `dev_deliverables.md` |
| **7. 품질·성능 검증** | 옵티마가 수행한 접근 권한·성능·접근성 테스트 결과 검토, 최종 승인 | Coordinator | `optima_verification_report.md` |
| **8. 최종 배포 승인** | 배포 계획 검토, Vercel/CI‑CD 파이프라인 설정 확인 | Coordinator | `deployment_plan.md` |
| **9. 운영 모니터링** | 런칭 후 성능 및 오류 모니터링 지표 정의, 주간 보고 체계 수립 | Coordinator | `ops_monitoring_guidelines.md` |

## Output

- `coordinator_workflow_report.md` – Summary of each step, decisions made, and sign‑off timestamps.
- Updated project roadmap reflecting any schedule adjustments.

## Communication Channels

- **Slack / Teams** – Daily stand‑up updates.
- **Confluence / Notion** – Central repository for specifications and reports.
- **GitHub Projects** – Issue board tracking each Agency’s tickets and hand‑off status.
