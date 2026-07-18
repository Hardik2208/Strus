# Phase 1 — Module Overview

# Professional Dashboard Module

## Purpose

The Professional Dashboard Module provides a centralized, read-optimized workspace for authenticated professionals immediately after signing in to Strus.

The module aggregates information from multiple business modules into lightweight dashboard widgets, allowing professionals to quickly understand their current work without navigating through multiple sections of the platform.

The Professional Dashboard follows a strictly read-only architecture. It never owns business entities and never performs business mutations.

---

# Objectives

- Provide professionals with a centralized workspace.
- Aggregate project information from multiple modules.
- Minimize frontend API requests.
- Improve dashboard performance using Redis.
- Keep business ownership inside source modules.
- Support independently scalable dashboard widgets.

---

# Responsibilities

The Professional Dashboard Module is responsible for:

- Dashboard overview aggregation.
- Active project summaries.
- Recent activity timeline.
- Dashboard quick actions.
- Redis-based widget caching.

---

# Out of Scope

The Professional Dashboard intentionally owns no business entities.

---

## Project Module

Responsible for:

- Project lifecycle
- Project creation
- Project updates
- Project ownership
- Project auditing

---

## Agreement Module

Responsible for:

- Agreement lifecycle
- Agreement participants
- Agreement invitations
- Agreement audit logs

**Any invitation-related functionality displayed on the Professional Dashboard follows the Agreement Module documentation.**

---

## Execution Module

Responsible for:

- Execution planning
- Milestones
- Deliverables
- Project assets
- Execution audit logs

---

The Professional Dashboard only consumes information exposed by these modules.

---

# Module Position

```text
Project
    │
    ▼
Agreement
    │
    ▼
Execution
    │
    ▼
Professional Dashboard
```

---

# High-Level Architecture

```text
Project
    │
Agreement
    │
Execution
    │
    ▼
Professional Dashboard Service
    │
    ▼
Dashboard Widgets
```

---

# Core Components

## Overview

Provides a high-level summary of the authenticated professional.

Current metrics include:

- Total Projects
- Active Projects
- Draft Projects
- Completed Projects

---

## Active Projects

Returns summarized information about projects currently assigned to the authenticated professional.

Current information includes:

- Project
- Workspace
- Client
- Current Milestone
- Progress
- Status

---

## Recent Activity

Provides a unified activity timeline.

Current sources include:

- Project Audit
- Agreement Audit

Activities are merged into a single chronological feed.

Supports configurable activity limits.

---

## Quick Actions

Provides navigation shortcuts to commonly used Professional Dashboard pages.

Current actions include:

- View Invitations
- Continue Latest Project
- Open Active Projects
- View Recent Activity

Invitation-related behaviour follows the Agreement Module documentation.

---

# Dashboard Philosophy

The Professional Dashboard never duplicates business APIs.

Project management remains inside the Project Module.

Agreement management remains inside the Agreement Module.

Execution management remains inside the Execution Module.

The Professional Dashboard only exposes lightweight aggregated dashboard widgets.

---

# Redis Integration

The Professional Dashboard follows the Cache-Aside pattern.

Cached widgets include:

- Overview
- Active Projects
- Recent Activity

Each widget maintains an independent Redis cache.

Redis is never treated as the source of truth.

---

# Design Principles

The Professional Dashboard follows the following principles:

- Read-only architecture.
- Dashboard owns no business entities.
- Business ownership remains inside source modules.
- Aggregation over duplication.
- Thin controllers.
- Service-layer orchestration.
- Repository-layer data retrieval.
- Independent widget architecture.
- Widget-level Redis caching.
- PostgreSQL as the source of truth.

---

# Current Scope

Current implementation includes:

- Professional Dashboard Overview
- Professional Active Projects
- Professional Recent Activity
- Professional Quick Actions
- Independent Redis caching

Future versions may introduce:

- Assigned Work Summary
- Upcoming Deadlines
- Performance Analytics
- Earnings Dashboard
- Execution Insights
- Notification Widgets

####################################################################################################################

# Phase 2 — System Architecture

# Professional Dashboard System Architecture

The Professional Dashboard Module provides a read-only aggregation layer that composes information from multiple business modules into lightweight dashboard widgets for authenticated professionals.

Unlike business modules, the Professional Dashboard never owns domain entities or performs business mutations. It retrieves information from existing modules, applies dashboard-specific aggregation, caches responses using Redis, and returns optimized read models.

The module follows the same layered architecture as the rest of the backend while remaining completely read-oriented.

---

# Architecture Overview

```text
              Professional Dashboard Request
                           │
                           ▼
             Authentication Middleware
                           │
                           ▼
          Professional Dashboard Controller
                           │
                           ▼
           Professional Dashboard Service
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Project Module    Agreement Module   Execution Module
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                   Repository Layer
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
         PostgreSQL              Redis Cache
               │                       │
               └───────────┬───────────┘
                           ▼
             Professional Dashboard Response
```

---

# Layer Responsibilities

## Controller Layer

Responsible for:

- Receiving HTTP requests
- Authentication
- Parsing query parameters
- Calling dashboard services
- Returning standardized API responses

Controllers never perform aggregation logic.

---

## Service Layer

Responsible for:

- Dashboard widget aggregation
- Cross-module coordination
- Redis cache management
- Dashboard response construction

Business ownership always remains inside the originating modules.

---

## Repository Layer

Repositories retrieve read-only information from PostgreSQL.

Responsible for:

- Dashboard queries
- Aggregate counts
- Active project retrieval
- Activity retrieval
- Optimized joins

Repositories never contain business logic.

---

# Request Lifecycle

Every Professional Dashboard request follows the Cache-Aside pattern.

```text
Professional
      │
      ▼
Authentication
      │
      ▼
Controller
      │
      ▼
Redis Cache
      │
 ┌────┴──────────────┐
 │                   │
 │ Cache Hit         │ Cache Miss
 │                   │
 ▼                   ▼
Response      Dashboard Service
                    │
                    ▼
             Repository Layer
                    │
                    ▼
               PostgreSQL
                    │
                    ▼
            Store in Redis
                    │
                    ▼
                Response
```

---

# Overview Widget Flow

```text
Professional
      │
      ▼
Dashboard Controller
      │
      ▼
Overview Service
      │
      ▼
Project Repository
      │
      ▼
Aggregate Project Counts
      │
      ▼
Redis Cache
      │
      ▼
Response
```

---

# Active Projects Widget Flow

```text
Professional
      │
      ▼
Dashboard Controller
      │
      ▼
Active Projects Service
      │
      ├───────────────┐
      │               │
      ▼               ▼
Project Repository   Agreement Repository
      │               │
      └───────┬───────┘
              ▼
Build Active Project Summary
              │
              ▼
Redis Cache
              │
              ▼
Response
```

Client information displayed within Active Projects is derived from the Agreement Module.

Any business rules regarding agreement participants or invitations follow the Agreement Module documentation.

---

# Recent Activity Widget Flow

```text
Professional
      │
      ▼
Dashboard Controller
      │
      ▼
Recent Activity Service
      │
      ▼
Project Audit Repository
Agreement Audit Repository
      │
      ▼
Merge Activities
      │
      ▼
Sort by Timestamp
      │
      ▼
Apply Activity Limit
      │
      ▼
Redis Cache
      │
      ▼
Response
```

---

# Quick Actions Widget Flow

```text
Professional
      │
      ▼
Dashboard Controller
      │
      ▼
Quick Actions Service
      │
      ▼
Build Navigation Actions
      │
      ▼
Redis Cache
      │
      ▼
Response
```

Quick Actions only provide navigation metadata.

Business operations remain within their respective modules.

Invitation-related navigation follows the Agreement Module documentation.

---

# Redis Cache Strategy

The Professional Dashboard follows the Cache-Aside pattern.

## Read Flow

```text
Redis
    │
Cache Hit
    │
    ▼
Response

Cache Miss
    │
    ▼
PostgreSQL
    │
    ▼
Redis
    │
    ▼
Response
```

---

## Write Flow

The Professional Dashboard owns no write operations.

Whenever source modules mutate data, they invalidate affected dashboard cache entries.

```text
Project / Agreement / Execution Update
                 │
                 ▼
Professional Dashboard Cache Invalidation
                 │
                 ▼
Next Read Repopulates Cache
```

Redis is never treated as the source of truth.

---

# Cache Keys

## Overview

```text
dashboard:professional:overview:{userId}
```

---

## Active Projects

```text
dashboard:professional:active-projects:{userId}
```

---

## Recent Activity

```text
dashboard:professional:recent-activity:{userId}:{activityLimit}
```

---

## Quick Actions

```text
dashboard:professional:quick-actions:{userId}
```

---

# Cache Invalidation

## Overview

Invalidate after:

- Project Created
- Project Updated
- Project Status Changed
- Project Deleted
- Milestone Created
- Milestone Updated
- Milestone Deleted
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

---

## Active Projects

Invalidate after:

- Project Status Changed
- Professional Assignment Updated
- Milestone Created
- Milestone Updated
- Milestone Deleted
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

Agreement-related invalidation follows the Agreement Module documentation.

---

## Recent Activity

Invalidate after:

- Project Audit Created
- Agreement Audit Created
- Execution Audit Created

---

## Quick Actions

Invalidate whenever underlying navigation data changes.

Invitation-related invalidation follows the Agreement Module documentation.

---

# Authentication Flow

Every Professional Dashboard endpoint requires authentication.

```text
Professional
      │
Access Token
      │
      ▼
Authentication Middleware
      │
      ▼
Professional Dashboard Controller
```

Dashboard APIs never expose data belonging to another professional.

---

# Performance Strategy

The Professional Dashboard is optimized for read-heavy workloads through:

- Widget-specific Redis caches
- Aggregate database queries
- Cache-Aside pattern
- Lightweight response models
- Independent widget retrieval

Each widget can be fetched independently without affecting other dashboard components.

---

# Design Principles

The Professional Dashboard follows the following architectural principles.

## Read-Only Module

The Professional Dashboard never mutates business entities.

---

## Aggregation Layer

The Professional Dashboard combines information from multiple modules into optimized dashboard response models.

---

## Widget Independence

Each widget operates independently with its own service, repository queries, Redis cache, and API endpoint.

---

## Thin Controllers

Controllers only coordinate requests and responses.

---

## Cache-Aside Pattern

Redis accelerates dashboard reads while PostgreSQL remains the source of truth.

---

## Module Isolation

The Professional Dashboard never duplicates APIs that belong to the Project, Agreement, or Execution modules.

Agreement invitations, participants, and related business rules always follow the Agreement Module documentation.

---

# Current Scope

The current architecture supports:

- Professional Dashboard Overview
- Professional Active Projects
- Professional Recent Activity
- Professional Quick Actions
- Widget-level Redis caching
- Cross-module aggregation

Future phases will introduce additional professional-focused widgets without requiring architectural redesign.

####################################################################################################################

# Phase 3 — Business Rules

# Professional Dashboard Business Rules

The Professional Dashboard defines how dashboard widgets aggregate and present information for authenticated professionals.

The Professional Dashboard is strictly read-only.

All business ownership remains within the respective source modules.

---

# Rule 1 — Read-Only Module

The Professional Dashboard never creates, updates, or deletes business entities.

All information originates from:

- Project Module
- Agreement Module
- Execution Module

Dashboard endpoints only aggregate existing information.

---

# Rule 2 — Authentication

Every Professional Dashboard endpoint requires authentication.

Rules

- User must provide a valid access token.
- Only authenticated professionals may access the dashboard.
- Dashboard responses are always scoped to the authenticated professional.

Anonymous access is never supported.

---

# Rule 3 — Professional Isolation

Dashboard responses are professional-specific.

Rules

- Professionals only receive information they are authorized to access.
- Project permissions are enforced.
- Agreement permissions are enforced.
- Execution permissions are enforced.

Dashboard aggregation never bypasses authorization.

---

# Rule 4 — Overview Widget

The Overview widget provides high-level statistics for the authenticated professional.

Current metrics include:

- Total Projects
- Active Projects
- Draft Projects
- Completed Projects

Rules

- Only projects where the authenticated user is an accepted professional are included.
- Soft deleted projects are excluded.
- Counts always reflect the latest committed database state.

---

# Rule 5 — Active Projects Widget

The Active Projects widget returns summarized information about projects currently assigned to the authenticated professional.

Current information includes:

- Project
- Workspace
- Client
- Current Milestone
- Progress
- Status

Rules

- Only ACTIVE projects are returned.
- The authenticated user must be an accepted professional participant.
- Client information is derived from the Agreement creator.
- Current milestone information is returned whenever available.
- Soft deleted projects are excluded.

Professional Dashboard never modifies project information.

---

# Rule 6 — Recent Activity Widget

The Recent Activity widget provides a unified activity timeline.

Current sources include:

- Project Audit
- Agreement Audit

Rules

- Activities are merged into a single feed.
- Results are ordered by newest first.
- Deleted project activities are excluded.
- Historical ordering is preserved.
- Activity limits are enforced.

---

# Rule 7 — Activity Limit

Recent Activity supports configurable limits.

Rules

- Default limit is applied when omitted.
- Invalid limits fall back to the default.
- Maximum limits are enforced to protect database performance.

---

# Rule 8 — Quick Actions Widget

Quick Actions provide navigation shortcuts for commonly used professional workflows.

Current actions include:

- View Invitations
- Continue Latest Project
- Active Projects
- Recent Activity

Rules

- Quick Actions never perform business operations.
- They only expose navigation metadata.
- Business operations remain inside their respective modules.

---

# Rule 9 — Project Ownership

Project lifecycle remains exclusively inside the Project Module.

The Professional Dashboard cannot:

- Create projects.
- Update projects.
- Delete projects.
- Change project status.

Dashboard only exposes project summaries.

---

# Rule 10 — Agreement Ownership

Agreement lifecycle remains exclusively inside the Agreement Module.

The Professional Dashboard cannot:

- Create agreements.
- Update agreements.
- Manage participants.
- Accept invitations.
- Decline invitations.
- Withdraw invitations.

Professional Dashboard only displays aggregated agreement information.

All invitation-related behaviour, participant management, visibility rules, and business logic follow the Agreement Module documentation.

The Professional Dashboard never redefines Agreement business rules.

---

# Rule 11 — Execution Ownership

Execution lifecycle remains exclusively inside the Execution Module.

The Professional Dashboard cannot:

- Create milestones.
- Update milestones.
- Submit deliverables.
- Approve submissions.
- Manage revisions.
- Manage extensions.

Dashboard only consumes execution summaries where applicable.

---

# Rule 12 — Aggregation Rules

Professional Dashboard widgets aggregate information from multiple modules.

Rules

- Aggregation never duplicates business ownership.
- Aggregation never modifies source records.
- Source modules remain the single source of truth.
- Dashboard response models remain lightweight.

---

# Rule 13 — Permission Enforcement

Dashboard never bypasses authorization.

Rules

- Every repository query is permission-aware.
- Unauthorized records are never returned.
- Cross-workspace data leakage is prohibited.
- Agreement visibility rules are respected.
- Execution visibility rules are respected.

---

# Rule 14 — Response Consistency

Dashboard widgets must always remain internally consistent.

Rules

- Overview counts must match underlying data.
- Active Projects must reflect the latest project status.
- Recent Activity ordering must remain chronological.
- Widget responses remain independent.

---

# Rule 15 — Cache Rules

Professional Dashboard follows the Cache-Aside pattern.

Cached widgets include:

- Overview
- Active Projects
- Recent Activity
- Quick Actions

Rules

- PostgreSQL remains the source of truth.
- Redis is used only for reads.
- Every widget maintains an independent cache.
- Cache entries are repopulated after cache misses.

---

# Rule 16 — Cache Invalidation

Professional Dashboard cache is invalidated whenever source modules mutate data.

Overview

Invalidate after:

- Project Created
- Project Updated
- Project Deleted
- Project Status Changed
- Milestone Created
- Milestone Updated
- Milestone Deleted
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

---

Active Projects

Invalidate after:

- Project Status Changed
- Professional Assignment Updated
- Milestone Updated
- Project Status Changed
- Professional Assignment Updated
- Milestone Created
- Milestone Updated
- Milestone Deleted
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

Agreement-related cache invalidation follows the Agreement Module documentation.

---

Recent Activity

Invalidate after:

- Project Audit Created
- Agreement Audit Created
- Execution Audit Created

---

Quick Actions

Invalidate whenever underlying navigation data changes.

Invitation-related cache invalidation follows the Agreement Module documentation.

---

# Rule 17 — Performance

The Professional Dashboard is optimized for read-heavy workloads.

Rules

- Widget-level Redis caching.
- Aggregate repository queries.
- Lightweight response models.
- Independent widget loading.
- Optimized database joins.

---

# Rule 18 — Future Extensibility

The Professional Dashboard is designed to support future widgets without redesign.

Future widgets may include:

- Upcoming Deadlines
- Assigned Work
- Execution Summary
- Earnings Summary
- Performance Analytics
- Notification Center

New widgets must remain independent of existing implementations.

---

# Rule 19 — Design Principles

The Professional Dashboard follows these principles:

- Read-only architecture.
- No business ownership.
- Aggregation over duplication.
- Permission-first access.
- Independent widget design.
- Cache-Aside pattern.
- PostgreSQL as the source of truth.
- Redis for read optimization.
- Thin controllers.
- Service-layer orchestration.
- Business ownership remains within the originating module.
- Agreement-related functionality always follows the Agreement Module documentation.

####################################################################################################################

# Phase 4 — API Documentation

# Professional Dashboard APIs

The Professional Dashboard exposes lightweight, read-only endpoints that provide dashboard widgets for authenticated professionals.

All endpoints require authentication.

---

# Authentication

Every Professional Dashboard API requires a valid access token.

```text
Authorization: Bearer <access_token>
```

---

# Content Type

```text
Content-Type: application/json
```

---

# Response Format

## Success

```json
{
    "success": true,
    "message": "...",
    "data": {}
}
```

---

## Failure

```json
{
    "success": false,
    "message": "...",
    "code": "ERROR_CODE"
}
```

---

# Common Error Codes

| Code | HTTP |
|------|------|
| INVALID_TOKEN | 401 |
| TOKEN_EXPIRED | 401 |
| SESSION_REVOKED | 401 |
| INSUFFICIENT_PERMISSIONS | 403 |
| INVALID_REQUEST | 400 |
| INTERNAL_SERVER_ERROR | 500 |

---

# GET /api/v1/dashboard/professional/overview

## Purpose

Returns a summarized overview of the authenticated professional.

---

## Authentication

Access Token

---

## Request

None

---

## Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "data": {
        "totalProjects": 18,
        "activeProjects": 6,
        "draftProjects": 9,
        "completedProjects": 3
    }
}
```

---

## Business Rules

- Returns data only for the authenticated professional.
- Only accepted professional assignments are included.
- Soft deleted projects are excluded.
- Response is cached using Redis.

---

## Database Changes

None

---

## Redis

Reads

```text
dashboard:professional:overview:{userId}
```

Cache Miss

- Query database
- Aggregate metrics
- Store response in Redis

---

## Socket Events

None

---

# GET /api/v1/dashboard/professional/active-projects

## Purpose

Returns active projects assigned to the authenticated professional.

---

## Authentication

Access Token

---

## Request

None

---

## Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "id": "project_uuid",
            "workspaceId": "workspace_uuid",
            "workspaceName": "Personal Workspace",
            "clientId": "client_uuid",
            "clientName": "John Doe",
            "currentMilestoneId": "milestone_uuid",
            "currentMilestoneName": "Initial Development",
            "progress": 45,
            "status": "ACTIVE"
        }
    ]
}
```

---

## Business Rules

- Returns only ACTIVE projects.
- Only projects where the authenticated user is an accepted professional are returned.
- Client information is derived from the Agreement Module.
- Milestone information is retrieved from the Execution Module.
- Agreement participant visibility follows the Agreement Module documentation.

---

## Database Changes

None

---

## Redis

Reads

```text
dashboard:professional:active-projects:{userId}
```

Cache Miss

- Query database
- Build active project summaries
- Store response

---

## Socket Events

None

---

# GET /api/v1/dashboard/professional/recent-activity

## Purpose

Returns the authenticated professional's recent dashboard activity.

---

## Authentication

Access Token

---

## Request

Supports optional query parameter.

```text
?activityLimit=10
```

---

## Query Parameters

| Parameter | Default | Description |
|----------|---------|-------------|
| activityLimit | 10 | Maximum number of activities returned |

---

## Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "id": "audit_uuid",
            "type": "PROJECT_CREATED",
            "title": "Website Development",
            "description": "Project created successfully.",
            "createdAt": "2026-07-18T18:20:00.000Z"
        },
        {
            "id": "audit_uuid",
            "type": "AGREEMENT_UPDATED",
            "title": "Agreement Updated",
            "description": "Budget updated.",
            "createdAt": "2026-07-18T17:40:00.000Z"
        }
    ]
}
```

---

## Business Rules

- Activities are merged from Project Audit and Agreement Audit.
- Ordered by newest first.
- Deleted project activities are excluded.
- Maximum activity limit is enforced.
- Response is cached.

Agreement audit behaviour follows the Agreement Module documentation.

---

## Database Changes

None

---

## Redis

Reads

```text
dashboard:professional:recent-activity:{userId}:{activityLimit}
```

Cache Miss

- Query audit repositories
- Merge activities
- Sort chronologically
- Store response

---

## Socket Events

None

---

# GET /api/v1/dashboard/professional/quick-actions

## Purpose

Returns navigation shortcuts for the authenticated professional.

---

## Authentication

Access Token

---

## Request

None

---

## Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "key": "VIEW_INVITATIONS",
            "label": "View Invitations",
            "route": "/dashboard/professional/invitations"
        },
        {
            "key": "CONTINUE_PROJECT",
            "label": "Continue Project",
            "route": "/dashboard/professional/projects"
        },
        {
            "key": "ACTIVE_PROJECTS",
            "label": "Active Projects",
            "route": "/dashboard/professional/projects"
        },
        {
            "key": "RECENT_ACTIVITY",
            "label": "Recent Activity",
            "route": "/dashboard/professional/activity"
        }
    ]
}
```

---

## Business Rules

- Quick Actions only provide frontend navigation metadata.
- No business operations are performed.
- Invitation-related navigation follows the Agreement Module documentation.

---

## Database Changes

None

---

## Redis

Reads

```text
dashboard:professional:quick-actions:{userId}
```

Cache Miss

- Build navigation actions
- Store response

---

## Socket Events

None

---

# Redis Cache

The Professional Dashboard maintains independent caches for every widget.

| Widget | Cache Key |
|---------|-----------|
| Overview | `dashboard:professional:overview:{userId}` |
| Active Projects | `dashboard:professional:active-projects:{userId}` |
| Recent Activity | `dashboard:professional:recent-activity:{userId}:{activityLimit}` |
| Quick Actions | `dashboard:professional:quick-actions:{userId}` |

---

# Cache Invalidation

## Overview

Invalidated after:

- Project Created
- Project Updated
- Project Status Changed
- Project Deleted
- Milestone Created
- Milestone Updated
- Milestone Deleted
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

---

## Active Projects

Invalidated after:

- Project Status Changed
- Professional Assignment Updated
- Milestone Updated

Agreement-related invalidation follows the Agreement Module documentation.

---

## Recent Activity

Invalidated after:

- Project Status Changed
- Professional Assignment Updated
- Milestone Created
- Milestone Updated
- Milestone Deleted
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

---

## Quick Actions

Invalidated whenever navigation data changes.



Invitation-related invalidation follows the Agreement Module documentation.

---

# Current Endpoints

| Method | Endpoint |
|---------|----------|
| GET | `/api/v1/dashboard/professional/overview` |
| GET | `/api/v1/dashboard/professional/active-projects` |
| GET | `/api/v1/dashboard/professional/recent-activity` |
| GET | `/api/v1/dashboard/professional/quick-actions` |

####################################################################################################################

# Phase 5 — Response Models

# Professional Dashboard Response Models

The Professional Dashboard exposes lightweight, read-optimized response models.

These models are intentionally independent of the underlying database entities and only include information required by dashboard widgets.

The Professional Dashboard never exposes complete Project, Agreement, or Execution entities.

---

# Dashboard Overview Response

Returned by:

```text
GET /api/v1/dashboard/professional/overview
```

---

## Response Model

```ts
interface ProfessionalDashboardOverviewResponse {
    totalProjects: number;
    activeProjects: number;
    draftProjects: number;
    completedProjects: number;
}
```

---

## Example Response

```json
{
    "success": true,
    "data": {
        "totalProjects": 18,
        "activeProjects": 6,
        "draftProjects": 9,
        "completedProjects": 3
    }
}
```

---

# Active Projects Response

Returned by:

```text
GET /api/v1/dashboard/professional/active-projects
```

---

## Response Model

```ts
interface ActiveProjectItem {
    id: string;
    workspaceId: string;
    workspaceName: string;

    clientId: string;
    clientName: string;

    currentMilestoneId: string | null;
    currentMilestoneName: string | null;

    progress: number;

    status: string;
}

type ActiveProjectsResponse = ActiveProjectItem[];
```

---

## Example Response

```json
{
    "success": true,
    "data": [
        {
            "id": "project_uuid",
            "workspaceId": "workspace_uuid",
            "workspaceName": "Personal Workspace",
            "clientId": "client_uuid",
            "clientName": "John Doe",
            "currentMilestoneId": "milestone_uuid",
            "currentMilestoneName": "Frontend Development",
            "progress": 45,
            "status": "ACTIVE"
        }
    ]
}
```

---

## Business Notes

- Client information is derived from the Agreement Module.
- Milestone information is derived from the Execution Module.
- Agreement participant visibility follows the Agreement Module documentation.

---

# Recent Activity Response

Returned by:

```text
GET /api/v1/dashboard/professional/recent-activity
```

---

## Response Model

```ts
interface ProfessionalRecentActivityItem {
    id: string;

    type: string;

    title: string;

    description: string;

    createdAt: string;
}

type ProfessionalRecentActivityResponse =
    ProfessionalRecentActivityItem[];
```

---

## Example Response

```json
{
    "success": true,
    "data": [
        {
            "id": "audit_uuid",
            "type": "PROJECT_CREATED",
            "title": "Website Development",
            "description": "Project created successfully.",
            "createdAt": "2026-07-18T18:20:00.000Z"
        },
        {
            "id": "audit_uuid",
            "type": "AGREEMENT_UPDATED",
            "title": "Agreement Updated",
            "description": "Budget updated.",
            "createdAt": "2026-07-18T17:40:00.000Z"
        }
    ]
}
```

Agreement-related activity follows the Agreement Module documentation.

---

# Quick Actions Response

Returned by:

```text
GET /api/v1/dashboard/professional/quick-actions
```

---

## Response Model

```ts
interface ProfessionalQuickAction {
    key: string;

    label: string;

    route: string;
}

type ProfessionalQuickActionsResponse =
    ProfessionalQuickAction[];
```

---

## Example Response

```json
{
    "success": true,
    "data": [
        {
            "key": "VIEW_INVITATIONS",
            "label": "View Invitations",
            "route": "/dashboard/professional/invitations"
        },
        {
            "key": "CONTINUE_PROJECT",
            "label": "Continue Project",
            "route": "/dashboard/professional/projects"
        },
        {
            "key": "ACTIVE_PROJECTS",
            "label": "Active Projects",
            "route": "/dashboard/professional/projects"
        },
        {
            "key": "RECENT_ACTIVITY",
            "label": "Recent Activity",
            "route": "/dashboard/professional/activity"
        }
    ]
}
```

Invitation-related navigation follows the Agreement Module documentation.

---

# Common Dashboard Response

Every Professional Dashboard endpoint follows the standard API response format.

## Success

```ts
interface SuccessResponse<T> {
    success: true;
    message?: string;
    data: T;
}
```

---

## Failure

```ts
interface ErrorResponse {
    success: false;
    message: string;
    code: string;
}
```

---

# Widget Summary

| Widget | Response Type |
|----------|---------------|
| Overview | ProfessionalDashboardOverviewResponse |
| Active Projects | ActiveProjectsResponse |
| Recent Activity | ProfessionalRecentActivityResponse |
| Quick Actions | ProfessionalQuickActionsResponse |

---

# Response Model Principles

Professional Dashboard response models follow these principles:

- Lightweight response objects.
- Independent of database entities.
- Optimized for frontend rendering.
- Read-only representations.
- No business ownership.
- No duplicated business logic.
- Agreement-derived information follows the Agreement Module documentation.
- Execution-derived information follows the Execution Module documentation.

---

# Future Response Models

The current response models are intentionally lightweight and designed for extension.

Future Professional Dashboard widgets may introduce additional response models, including:

- Upcoming Deadlines
- Assigned Work Summary
- Execution Summary
- Earnings Summary
- Performance Analytics
- Notification Summary

These additions can be introduced independently without affecting existing response models.

####################################################################################################################

# Phase 6 — Redis Caching Strategy

# Professional Dashboard Redis Caching

The Professional Dashboard is designed for read-heavy workloads.

To minimize database queries and improve dashboard response times, every dashboard widget follows the Cache-Aside pattern using Redis.

Redis is treated strictly as a read cache.

PostgreSQL always remains the source of truth.

---

# Cache Strategy

The Professional Dashboard follows the Cache-Aside pattern.

## Read Flow

```text
Professional Dashboard Request
              │
              ▼
         Redis Cache
              │
      ┌───────┴────────┐
      │                │
 Cache Hit        Cache Miss
      │                │
      ▼                ▼
 Return Response   PostgreSQL
                        │
                        ▼
              Aggregate Dashboard Data
                        │
                        ▼
                 Store in Redis
                        │
                        ▼
                 Return Response
```

---

## Write Flow

The Professional Dashboard owns no write operations.

Whenever source modules modify data, they invalidate the affected dashboard cache.

```text
Project / Agreement / Execution
        │
        ▼
Database Commit
        │
        ▼
Domain Cache Invalidation
        │
        ▼
Professional Dashboard Cache Invalidation
        │
        ▼
Next Read Repopulates Cache
```

Redis is never treated as the source of truth.

## Dashboard Cache Ownership

Professional Dashboard cache invalidation is owned by the source business modules.

Each domain cache class is responsible for invalidating every Professional Dashboard widget affected by mutations within its domain.

Current ownership:

- Project Cache
- Agreement Cache
- Milestone Cache
- Submission Cache
- Milestone Extension Cache

Professional Dashboard services never invalidate caches directly. Source modules invalidate dashboard caches only after successful database transactions.

---

# Cached Widgets

The Professional Dashboard maintains an independent cache for every widget.

| Widget | Cache Key |
|---------|-----------|
| Overview | `dashboard:professional:overview:{userId}` |
| Active Projects | `dashboard:professional:active-projects:{userId}` |
| Recent Activity | `dashboard:professional:recent-activity:{userId}:{activityLimit}` |
| Quick Actions | `dashboard:professional:quick-actions:{userId}` |

Each widget cache is completely independent.

---

# Cache Expiration

Professional Dashboard caches use a Time-To-Live (TTL) to prevent stale data.

| Widget | Recommended TTL |
|---------|-----------------|
| Overview | 5 Minutes |
| Active Projects | 2 Minutes |
| Recent Activity | 2 Minutes |

Cache expiration acts only as a fallback mechanism.

Primary consistency is maintained through explicit cache invalidation.

---

# Cache Invalidation

## Overview Cache

Invalidate after:

- Project Created
- Project Updated
- Project Deleted
- Project Status Changed
- Milestone Created
- Milestone Updated
- Milestone Deleted
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

Cache Key

```text
dashboard:professional:overview:{userId}
```

---

## Active Projects Cache

Invalidate after:

- Project Status Changed
- Professional Assignment Updated
- Milestone Created
- Milestone Updated
- Milestone Deleted
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

Agreement-related cache invalidation follows the Agreement Module documentation.

Cache Key

```text
dashboard:professional:active-projects:{userId}
```

---

## Recent Activity Cache

Invalidate after:

- Project Audit Created
- Agreement Audit Created
- Execution Audit Created

Agreement audit behaviour follows the Agreement Module documentation.

Cache Key

```text
dashboard:professional:recent-activity:{userId}:{activityLimit}
```

Since activities can be requested with different limits, all matching activity cache keys for the authenticated professional should be invalidated.

---

## Quick Actions Cache

Quick Actions are generated from static application configuration.

Since no database queries or expensive computations are performed, Redis caching is intentionally not used.

This avoids unnecessary Redis network calls while keeping the implementation lightweight.
---

# Cache Population

Professional Dashboard caches are populated lazily.

Rules

- Cache entries are created only after a cache miss.
- Empty responses are also cached.
- Cached responses must exactly match the API response model.
- Widgets populate independently.

No cache warming is performed.

---

# Cache Consistency

Professional Dashboard cache consistency follows these principles.

- PostgreSQL remains the source of truth.
- Redis never accepts direct client writes.
- Cache invalidation occurs only after successful database commits.
- Failed transactions never invalidate dashboard caches.
- Widget caches remain isolated from one another.

---

# Cache Isolation

Every widget owns its own Redis cache.

Benefits include:

- Independent invalidation.
- Smaller cache objects.
- Faster cache updates.
- Reduced Redis memory usage.
- Better scalability.
- Independent widget loading.

Updating one widget never invalidates unrelated widgets.

---

# Cache Failure Handling

Professional Dashboard functionality must remain available even if Redis becomes unavailable.

Rules

- Redis failures never fail dashboard requests.
- Data is retrieved directly from PostgreSQL.
- Responses continue normally.
- Redis errors are logged for monitoring.
- Dashboard behaviour remains unchanged.

Flow

```text
Redis Failure
      │
      ▼
Read PostgreSQL
      │
      ▼
Return Response
```

---

# Performance Benefits

Professional Dashboard Redis caching provides:

- Reduced database load.
- Faster dashboard response times.
- Independent widget retrieval.
- Lower latency.
- Improved scalability.
- Better frontend performance.

---

# Design Principles

The Professional Dashboard caching layer follows these principles:

- Cache-Aside pattern.
- PostgreSQL as the source of truth.
- Read-only Redis usage.
- Widget-level caching.
- Independent cache invalidation.
- Lazy cache population.
- Graceful Redis failure handling.
- Explicit cache invalidation after successful mutations.
- Agreement-related cache invalidation follows the Agreement Module documentation.
```

####################################################################################################################

# Phase 7 — Implementation Structure

# Professional Dashboard Implementation

This document describes the backend implementation structure of the Professional Dashboard Module.

The Professional Dashboard follows the same architectural conventions as every other module within Strus.

It is implemented as a read-only aggregation module with independent dashboard widgets.

---

# Directory Structure

```text
dashboard/
│
├── controllers/
│     └── professional-dashboard.controller.ts
│
├── services/
│     ├── professional-dashboard.service.ts
│     ├── overview.service.ts
│     ├── active-projects.service.ts
│     ├── recent-activity.service.ts
│     └── quick-actions.service.ts
│
├── repositories/
│     └── dashboard.repository.ts
│
├── dto/
│     ├── overview-response.dto.ts
│     ├── active-project.dto.ts
│     ├── recent-activity.dto.ts
│     └── quick-actions.dto.ts
│
├── routes/
│     └── professional-dashboard.routes.ts
│
├── validators/
│     └── dashboard.validator.ts
│
├── cache/
│     └── professional-dashboard.cache.ts
│
├── constants/
│     └── dashboard.constants.ts
│
├── types/
│     └── dashboard.types.ts
│
└── index.ts
```

---

# Module Responsibilities

## Controller

Responsible for:

- Receiving HTTP requests
- Authentication
- Request validation
- Calling services
- Returning standardized responses

Controllers never contain business logic.

---

## Services

Each widget owns its own service.

Current services include:

- Overview Service
- Active Projects Service
- Recent Activity Service
- Quick Actions Service

Responsibilities:

- Widget aggregation
- Repository orchestration
- Redis interaction
- Response model construction

Services never directly access HTTP objects.

---

## Repository

The Dashboard Repository provides optimized read queries.

Responsibilities:

- Aggregate queries
- Read-only joins
- Dashboard projections
- Activity retrieval
- Performance optimization

Repositories never contain business logic.

---

## DTOs

DTOs define response models returned by dashboard APIs.

Examples include:

- Overview Response
- Active Project Response
- Activity Response
- Quick Action Response

DTOs remain independent from Prisma entities.

---

## Validators

Responsible for validating:

- Query parameters
- Activity limits
- Pagination parameters
- Request formats

Business validation remains inside source modules.

---

## Cache Layer

Responsible for:

- Cache lookup
- Cache storage
- Cache invalidation helpers
- Cache key generation

Redis implementation details remain isolated inside the cache layer.

---

# Widget Independence

Each widget follows the same implementation pattern.

```text
Controller
      │
      ▼
Widget Service
      │
      ▼
Repository
      │
      ▼
Redis
      │
      ▼
Response
```

Widgets never depend on one another.

---

# Dependency Flow

Professional Dashboard depends on business modules.

```text
Project Module
        │
Agreement Module
        │
Execution Module
        │
        ▼
Professional Dashboard
```

Business modules never depend on the Professional Dashboard.

This prevents circular dependencies.

---

# Cross Module Communication

The Professional Dashboard retrieves information from:

## Project Module

Examples:

- Project counts
- Active projects
- Project status
- Project audit

---

## Agreement Module

Examples:

- Client information
- Agreement audit
- Invitation summaries

Invitation behaviour follows the Agreement Module documentation.

---

## Execution Module

Examples:

- Current milestone
- Progress
- Execution summary

Execution business rules follow the Execution Module documentation.

---

# Error Handling

The Professional Dashboard follows the global error handling strategy.

Controllers never swallow exceptions.

Rules:

- Repository errors propagate to services.
- Services propagate standardized errors.
- Global middleware formats responses.

---

# Logging

Dashboard operations should log:

- Unexpected failures
- Repository failures
- Redis failures
- Performance issues

Successful dashboard reads are not logged.

---

# Security

Every endpoint enforces:

- JWT Authentication
- Workspace authorization
- Professional ownership
- Permission validation

Dashboard queries never bypass source module permissions.

---

# Performance Guidelines

Implementation should prioritize:

- Aggregate queries
- Minimal joins
- Redis-first reads
- Lightweight DTOs
- Independent widget loading

Database queries should avoid N+1 query patterns.

---

# Extension Guidelines

Future widgets should follow the same implementation pattern.

Each new widget should include:

- Controller endpoint
- Service
- Repository query
- DTO
- Redis cache
- Cache invalidation strategy
- API documentation
- Response model

Existing widgets should never require modification when introducing new widgets.

---

# Coding Standards

The Professional Dashboard follows the project-wide backend standards.

- Thin Controllers
- Service Layer Architecture
- Repository Pattern
- DTO-based Responses
- Cache-Aside Pattern
- Dependency Injection
- Read-Only Aggregation
- Independent Widget Design

---

# Design Principles

The implementation adheres to the following principles:

- Read-only architecture.
- No business ownership.
- Widget independence.
- Aggregation over duplication.
- PostgreSQL as the source of truth.
- Redis for read optimization.
- Source modules remain authoritative.
- Agreement-related functionality follows the Agreement Module documentation.
- Execution-related functionality follows the Execution Module documentation.

####################################################################################################################
