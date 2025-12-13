# Next.js-based Korean-style Board Management PRD

## Template & Pagination Extended

---

## 1. Background and Goals

This homepage adopts a **Korean-style Bulletin Board structure**. The board is not merely a content area but a **core module of the site's information structure**, designed from an operational perspective (Admin, Permissions, Policy).

### Goals

- Centralized management of boards via the **Board Management Menu** in the Admin Page
- Provide **sophisticated Permission/Policy models** per board unit
- Support **Template-based creation** for different board types (Notice, General, Gallery, etc.)
- Provide **Pagination and List Options** optimized for each board's traffic and content characteristics

---

## 2. Overall Architecture Overview

### 2.1 Recommended Stack (Operations/Scalability Standard)

- **Frontend**: Next.js (App Router recommended)
- **Auth**: NextAuth or Custom JWT + RBAC/Policy
- **DB**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod

### 2.2 Core Principles

- Board configuration and permissions are managed **Server-Centric** (Do not trust the client)
- Boards operate based on **Board ID**, not just URLs
- Design **Board Policies**, not just "Board Features"

---

## 3. Admin Page Structure

### 3.1 Admin Menu Tree

```
Admin
 ├─ Dashboard
 ├─ Board Management
 │   ├─ Board List
 │   ├─ Create Board (Template)
 │   ├─ Board Settings
 │   ├─ Permission Management
 │   └─ Operation Logs/Audit
 ├─ User Management
 └─ System Settings
```

---

## 4. Domain Model (Overview)

### 4.1 Core Entities

- **Board**
- **BoardTemplate**
- **BoardConfig** (Options/Settings)
- **Post**
- **Attachment/Media**
- **BoardPermission**
- **AuditLog**

---

## 5. Board Management Functional PRD

### 5.1 Board Creation and CRUD

#### 5.1.1 Board Basic Fields

| Field | Description |
|-------|-------------|
| `id` | Unique Board ID |
| `key` | Unique Key for URL/System (e.g., notice, free, gallery) |
| `name` | Board Name |
| `description` | Description |
| `templateId` | Applied Template |
| `isActive` | Usage Status (Soft Delete) |
| `createdAt` / `updatedAt` | Management Timestamps |

#### 5.1.2 CRUD Policies

- Deletion is essentially **Soft Delete** (Deactivation)
- Key changes affect URL/SEO/Links → Provide admin warnings and redirect policy options
- Board Duplication (including settings, permissions, UI options) is recommended

### 5.2 Board Creation Templates by Type (Requirements Reflected)

#### 5.2.1 Purpose of Introducing Templates

- Provide "Board Creation" not as a combination of settings but as **Verified Presets (Templates)**
- Allow operators to quickly add/expand boards with consistent policies

#### 5.2.2 Default Templates (Recommended)

##### (A) Notice/General (Text-centric)

- **List**: Title / Author / Date / Views / Pinned Notice
- **Write**: Editor (Basic), Attachments (Optional)
- **Comments**: Optional
- **Top Pinned Notice**: ON
- **Default Sort**: Newest

##### (B) Gallery/Media (Image-centric)

- **List**: Thumbnail Grid (Image/Video), Card Type
- **Upload**: Multi-file, Resizing/Optimization, Designated Representative Image
- **Sort**: Newest / Popular (Views/Likes) Options
- **Meta**: Date Taken / Tags / Categories (Optional)

##### (C) Q&A (Question/Answer)

- **Status**: Awaiting Answer / Answered
- **Permissions**: Question (USER), Answer (MODERATOR/ADMIN)
- **Post Type**: Question / Answer (Thread)
- **Notification**: Notify author upon answer registration (Optional)

##### (D) Repository (Download-centric)

- **Essential**: File Attachments
- **Classification**: Categories / Tags
- **Permissions**: Separate Download Permissions (Read vs. Download)

> **Note**: Templates are "Initial Value Sets"; detailed customization in BoardConfig must be possible after creation.

#### 5.2.3 Template Design Method

A Template is a "Snapshot" of UI/Policy.

**Upon Creation:**

1. Create Board
2. Clone the Template's `defaultConfig` to `BoardConfig`
3. Initialize Permission Defaults (Role Matrix)

### 5.3 Board Options (BoardConfig)

#### 5.3.1 Common Options

- Enable/Disable Comments
- Allow File Uploads
- Allow Anonymous Posting
- Editor Type (plain / markdown / richtext)
- Enable Tags/Categories
- Enable Pinned Notices
- Support Secret Posts

#### 5.3.2 List/Table Options (Requirements Reflected)

- **List Layout**: table / card / grid
- **Displayed Columns**: Toggle Author / Views / Comment Count / Category / Tags, etc.
- **Mobile Layout Rules**: Column abbreviation rules (e.g., Hide Author on mobile)

### 5.4 Pagination & List Count Options (Requirements Reflected)

#### 5.4.1 Why Optimization per Board is Needed

- **Notice/General**: Users are used to "Page Jumping" → Page-based is better for UX
- **Gallery/Feed**: Users prefer Infinite Scroll/Load More → Cursor-based is better for Performance/Consistency

#### 5.4.2 Pagination Strategies to Support (Select via BoardConfig)

##### (1) Page-based (offset/page)

- **UI**: 1, 2, 3... Page Navigation
- **Pros**: Familiar UX, direct jump to specific pages
- **Cons**: OFFSET cost may increase with large data sets

##### (2) Cursor/Keyset-based (Recommended for Large Scale/Feed Types)

- **UI**: Load More / Infinite Scroll / Prev·Next
- **Pros**: Better performance/consistency for large data
- **Requirement**: Sorting Criteria + Tie-breaker (id) Indexing Design

**Recommended Operation Policy:**

- **Default**: Page-based (Korean Board UX)
- **High Traffic or Gallery/Feed types**: Cursor-based

#### 5.4.3 Items Per Page Options

In `BoardConfig`:

```javascript
{
  defaultPageSize: 10,
  allowedPageSizes: [10, 20, 30, 50], // Configurable per board
  maxPageSize: 100 // Server forced limit
}
```

**Additional Policy:**

- Option to lower `pageSize` limit when Search/Filter is applied (Performance protection)

---

## 6. Permission System (Core)

### 6.1 Action Definitions

| Action Code | Meaning |
|-------------|---------|
| `BOARD_LIST` | View Board List |
| `BOARD_READ` | Read Post |
| `BOARD_WRITE` | Write Post |
| `BOARD_EDIT` | Edit Own Post |
| `BOARD_DELETE` | Delete Own Post |
| `BOARD_ADMIN` | Board Admin (Full Access) |

### 6.2 Role + User Hybrid Model

- **Basic**: Role-based Matrix
- **Exception**: User Override (Grant permissions to specific users for specific boards)

### 6.3 Context-Based Permissions

- Is Own Post?
- Is Notice Post?
- Time Limit after posting (e.g., Cannot edit after 24 hours)

---

## 7. Admin UI Requirements

### 7.1 Board List

- Board Name / Key / Template / Status
- Permission Summary (ROLE Matrix)
- Quick Settings (Active/Inactive, Default Pagination, PageSize)

### 7.2 Create Board (Template)

- Template Selection Card UI
- Preview per Template (Snapshots or summaries of List/Detail/Write screens)

**Immediately after creation:**

1. Set Basic Permissions (Role Matrix)
2. Set Basic Pagination/List Options

### 7.3 Board Settings

- Edit `BoardConfig` UI
- Provide "Revert to Default (Template Reset)" option

### 7.4 Permission Management

- Select Role/User
- Select Board
- Action Checkbox Matrix

---

## 8. Server/Operation Design Principles

- All permission verification is performed in **Server Action / Route Handler**
- **Common Utility**: `checkBoardPermission({ userId, boardId, action, context })`
- **Audit Log**: Record all Permission/Setting changes (Who/When/What)

---

## 9. For Visualization Packages

- Prisma ERD & Model Design
- Permission Check Middleware & Utility Code
- Admin UI Component Design (Template Card / Permission Matrix / List Option UI)

---

## Appendix 1: Prisma ERD & Model Design

### Purpose

Standard Prisma schema for operating Korean-style boards centered on Templates, Policies, and Permissions.

### Core Entities

- User / Role / UserRole
- Board / BoardTemplate / BoardConfig
- BoardPermission
- Post / Attachment
- AuditLog

### Design Principles

- Board ID Centric
- Soft Delete
- Support for both Cursor/Page Pagination
- Permissions managed as Data

---

## Appendix 2: Permission Check Middleware & Utility Code

### Purpose

Single entry point to enforce board permissions 100% on the server.

### Core Concepts

- Role-based Basic Permissions
- User Override
- `BOARD_ADMIN` Superior Permission
- Context-based Policy (Own post, Time limits, etc.)

### Standard Utility

```javascript
checkBoardPermission({ userId, boardId, action, context })
```

### Usage Locations

- Route Handler
- Server Action

---

## Appendix 3: Admin UI Component Design

### Purpose

Encourage admins to operate boards by Policy/Template units, not just setting combinations.

### Main Screens

- Board List
- Create Board (Select Template)
- Board Settings (BoardConfig)
- Permission Matrix

### Core Components

- `BoardTemplatePicker`
- `BoardCreateForm`
- `BoardConfigForm`
- `PermissionMatrix`

### UX Principles

- Two-step confirmation for dangerous actions
- Provide Template Reset
- Visualize Permission Summaries

---

---

## Appendix 4: Legacy Data Preservation Strategy (Crucial for Migration)

### Purpose

To limitlessly accept data from existing legacy boards (GNU Board, etc.) **without 100% loss**, the following fields and structures must be guaranteed.

### 1. ID & Reference Integrity (Legacy ID Support)

- **Issues**: Existing boards manage IDs independently per board (e.g., Notice #1, Free #1), but Prisma/Next.js uses a unique Global ID.
- **Solution**: Add `legacyId` field.
  - URL Routing: Support `/board/notice/123` -> Find `boardType='notice' AND legacyId=123`
  - Data Mapping: Maintain 1:1 matching with the existing DB `wr_id`.

### 2. Password & Secret Posts (Non-member Support)

- **Issues**: Legacy boards allow non-member posting/modification using passwords (`wr_password`).
- **Solution**:
  - Add `password` field to `Post` (Store separate BCrypt hash)
  - Add `isSecret` field (Lock status)

### 3. Extra Fields (wr_1 ~ wr_10)

- **Issues**: Legacy boards frequently store custom data (phone numbers, external links, etc.) in `wr_1` ... `wr_10`.
- **Solution**:
  - **Do not create columns `wr_1`...`wr_10`.**
  - Add `extraData` (JSON) field to store them freely.
  - Example: `{ "wr_1": "010-1234-5678", "externalLink": "..." }`

### 4. Hierarchical Reply Structure (Thread)

- **Issues**: Legacy assumes `wr_reply` (A, AA) string ordering.
- **Solution**:
  - Migrate to standard `parentId` (Adjacency List) structure.
  - Sort order logic implements `DFS` or `Recursive Query` at the application level.

### 5. Attachments Migration

- **Issues**: Physical paths of legacy files vs New naming convention.
- **Solution**:
  - `Attachment` model preserves `originalUrl` or `legacyPath`.
  - Allow physical files to remain in 'legacy' folders, or perform bulk migration.

---

## Document Information

- **Version**: Extended (Template & Pagination)
- **Last Updated**: 2024
- **Target Stack**: Next.js, PostgreSQL, Prisma
