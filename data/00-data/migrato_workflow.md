---
description: "Migrato AI Agency workflow for data migration and schema design"
---

# Migrato Workflow

## Goal

Migrate the existing K‑board MySQL database to a headless‑CMS / API‑ready schema while preserving data integrity and attachment paths.

## Trigger

"K-board DB를 분석, 첨부 파일 경로 일치성을 보장하며, Next.js API에 최적화된 JSON 스키마와 변환 스크립트를 작성 및 실행하라."

## Steps

1. **DB 분석** – Extract full schema, relationships, and attachment storage details from the current MySQL DB.
2. **스키마 설계** – Design a target JSON/Prisma schema suitable for the chosen headless CMS (e.g., Strapi, Directus) and generate migration plan.
3. **변환 스크립트 작성** – Write Python/Node scripts that:
   - Export data to intermediate JSON.
   - Rewrite attachment URLs to match the new storage layout.
   - Validate referential integrity.
4. **테스트 마이그레이션** – Run the script against a staging DB, compare row counts and checksum of files.
5. **데이터 검증** – Automated checks for missing records, orphaned files, and data type consistency.
6. **실제 마이그레이션** – Execute the script on production DB during a maintenance window.
7. **포스트‑마이그레이션 검증** – Run Optima’s validation workflow (access control, performance) to ensure success.

## Output

- `migrato_schema_spec.yaml` – Target schema definition.
- `migrato_migration_script.{py|js}` – Executable migration script.
- `migration_report.md` – Summary of migrated entities, issues, and verification results.
