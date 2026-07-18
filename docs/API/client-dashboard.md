# Phase 1 — Module Overview

# Dashboard Module

## Purpose

The Dashboard Module provides a centralized, read-optimized view of the most important information required by authenticated users immediately after logging into Strus.

Unlike business modules, the Dashboard Module does not own or manage domain entities. Instead, it aggregates information from existing modules such as Workspace, Project, Agreement, and future modules into lightweight dashboard widgets optimized for fast retrieval.

The module is intentionally designed around dashboard-specific read models while keeping ownership of business logic inside their respective modules.

---

# Objectives

- Provide a fast dashboard experience.
- Aggregate data from multiple modules.
- Reduce frontend API calls.
- Improve dashboard performance using Redis.
- Keep business ownership inside source modules.
- Support future dashboard widgets without architectural redesign.

---

# Responsibilities

The Dashboard Module is responsible for:

- Dashboard overview aggregation.
- Dashboard attention widgets.
- Dashboard activity timeline.
- Dashboard Redis caching.

---

# Out of Scope

The Dashboard Module intentionally does not own business entities.

## Workspace Module

Responsible for:

- Workspace management
- Workspace members
- Workspace invitations
- Workspace listing

---

## Project Module

Responsible for:

- Project lifecycle
- Project management
- Project ownership
- Project auditing

---

## Agreement Module

Responsible for:

- Agreements
- Participants
- Invitations
- Agreement audit logs

---

## Execution Module

Responsible for:

- Execution planning
- Milestones
- Project assets
- Execution audit logs

The Dashboard Module only consumes information from these modules.

---

# Module Position

```text
Workspace
      │
      ▼
Project
      │
      ▼
Agreement
      │
      ▼
Execution
      │
      ▼
Dashboard
```

---

# High-Level Architecture

```text
Workspace
      │
Project
      │
Agreement
      │
Execution
      │
      ▼
Dashboard Service
      │
      ▼
Dashboard Widgets
```

---

# Core Components

## Overview

Provides a high-level summary of the authenticated client.

Current metrics include:

- Total Workspaces
- Total Projects
- Active Projects
- Draft Projects
- Completed Projects
- Requires Attention Count

---

## Requires Attention

Returns actionable items requiring immediate user attention.

Current implementation:

- Pending Agreement Invitations

Future implementations may include:

- Pending milestone approvals
- Pending revision requests
- Pending disputes
- Pending payments

---

## Recent Activity

Provides a unified activity timeline.

Current sources:

- Project Audit
- Agreement Audit

Activities are merged into a single chronological feed.

Supports configurable activity limits.

---

# Dashboard Philosophy

The Dashboard Module never duplicates APIs that already exist in other modules.

Examples:

Workspace listing remains inside the Workspace Module.

Project management remains inside the Project Module.

Agreement management remains inside the Agreement Module.

Dashboard endpoints only expose aggregated dashboard widgets.

---

# Redis Integration

The Dashboard Module follows the Cache-Aside pattern.

Cached widgets include:

- Dashboard Overview
- Dashboard Requires Attention
- Dashboard Recent Activity

Each widget maintains an independent Redis cache.

Redis is never treated as the source of truth.

---

# Design Principles

The Dashboard Module follows the following principles:

- Dashboard owns no business entities.
- Dashboard only aggregates existing module data.
- Business rules remain inside source modules.
- Controllers remain thin.
- Service layer performs aggregation.
- Repository layer retrieves data.
- Redis follows Cache-Aside.
- Widget caches remain independent.

---

# Current Scope

Current implementation includes:

- Client Dashboard Overview
- Client Requires Attention
- Client Recent Activity
- Independent Redis caching

Future versions will introduce:

- Professional Dashboard
- Organization Dashboard
- Analytics widgets
- Notification widgets
- Execution widgets
- Payment widgets

####################################################################################################################

# Phase 2 — System Architecture

# Dashboard System Architecture

The Dashboard Module provides a read-only aggregation layer that composes information from multiple business modules into lightweight dashboard widgets.

Unlike business modules, the Dashboard Module never owns domain entities or performs business mutations. It retrieves data from existing modules, applies dashboard-specific aggregation, caches the results using Redis, and returns optimized responses for the frontend.

The module follows the same layered architecture as the rest of the backend while remaining completely read-oriented.

---

# Architecture Overview

```text
                 Dashboard Request
                        │
                        ▼
              Dashboard Controller
                        │
                        ▼
               Dashboard Service
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
   Workspace       Project         Agreement
     Module         Module           Module
                        │
                        ▼
                Repository Layer
                        │
        ┌───────────────┼───────────────┐
        │                               │
        ▼                               ▼
   PostgreSQL                      Redis Cache
        │                               │
        └───────────────┬───────────────┘
                        ▼
               Dashboard Response
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

The Service Layer orchestrates dashboard widgets.

Responsible for:

- Dashboard aggregation
- Cross-module coordination
- Widget generation
- Redis cache invalidation
- Dashboard response construction

Business ownership always remains inside the source modules.

---

## Repository Layer

Repositories retrieve read-only data from PostgreSQL.

Responsible for:

- Dashboard queries
- Aggregate counts
- Activity retrieval
- Optimized joins
- Pagination

Repositories never contain business logic.

---

# Request Lifecycle

Every dashboard request follows the Cache-Aside pattern.

```text
Client
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
Cache Hit
    │
    ▼
Response

Cache Miss
    │
    ▼
Dashboard Service
    │
    ▼
Repositories
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
Client
    │
    ▼
Dashboard Controller
    │
    ▼
Overview Service
    │
    ▼
Workspace Repository
Project Repository
Agreement Repository
    │
    ▼
Aggregate Metrics
    │
    ▼
Redis Cache
    │
    ▼
Response
```

---

# Requires Attention Flow

```text
Client
    │
    ▼
Dashboard Controller
    │
    ▼
Attention Service
    │
    ▼
Agreement Repository
    │
    ▼
Pending Invitations
    │
    ▼
Redis Cache
    │
    ▼
Response
```

Future implementations may additionally query:

- Execution
- Payments
- Disputes

---

# Recent Activity Flow

```text
Client
    │
    ▼
Dashboard Controller
    │
    ▼
Activity Service
    │
    ▼
Project Audit Repository
Agreement Audit Repository
    │
    ▼
Merge Activities
    │
    ▼
Sort By Timestamp
    │
    ▼
Apply Limit
    │
    ▼
Redis Cache
    │
    ▼
Response
```

---

# Redis Cache Strategy

The Dashboard Module follows the Cache-Aside pattern.

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

Dashboard owns no write operations.

Whenever source modules mutate data, they invalidate affected dashboard cache entries.

```text
Workspace / Project / Agreement Update
                │
                ▼
      Dashboard Cache Invalidation
                │
                ▼
      Next Read Repopulates Cache
```

Redis is never treated as the source of truth.

---

# Cache Keys

## Overview

```text
dashboard:client:overview:{userId}
```

---

## Requires Attention

```text
dashboard:client:requires-attention:{userId}
```

---

## Recent Activity

```text
dashboard:client:recent-activity:{userId}:{limit}
```

---

# Cache Invalidation

## Overview

Invalidate after:

- Workspace Created
- Workspace Deleted
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

## Requires Attention

Invalidate after:

- Agreement Invitation Created
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn

---

## Recent Activity

Invalidate after:

- Agreement Invitation Created
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

---

# Authentication Flow

Every dashboard endpoint requires authentication.

```text
Client
    │
Access Token
    │
    ▼
Authentication Middleware
    │
    ▼
Dashboard Controller
```

Dashboard APIs never expose data belonging to another authenticated user.

---

# Performance Strategy

The Dashboard Module is optimized for read-heavy workloads through:

- Widget-specific Redis caches
- Aggregate database queries
- Cache-Aside pattern
- Lightweight response models
- Independent widget retrieval

Each widget can be fetched independently without affecting other dashboard components.

---

# Design Principles

The Dashboard Module follows the following architectural principles.

## Read-Only Module

Dashboard never mutates business entities.

---

## Aggregation Layer

Dashboard combines information from multiple modules into a single response model.

---

## Widget Independence

Each widget operates independently with its own service, repository queries, and Redis cache.

---

## Thin Controllers

Controllers only coordinate requests and responses.

---

## Cache-Aside Pattern

Redis accelerates dashboard reads while PostgreSQL remains the source of truth.

---

## Module Isolation

Dashboard never duplicates APIs that already belong to Workspace, Project, Agreement, or Execution modules.

---

# Current Scope

The current architecture supports:

- Client Overview
- Client Requires Attention
- Client Recent Activity
- Widget-level Redis caching
- Cross-module aggregation

Future phases will extend the architecture with Professional Dashboard, analytics widgets, notification widgets, execution summaries, and payment insights without requiring structural redesign.

####################################################################################################################

# Phase 3 — Business Rules

# Dashboard Business Rules

The Dashboard Module defines how dashboard widgets aggregate and present information from multiple business modules.

The Dashboard Module is strictly read-only.

All business mutations continue to be handled by their respective source modules.

---

# Rule 1 — Read-Only Module

The Dashboard Module never creates, updates, or deletes business entities.

All data originates from:

- Workspace Module
- Project Module
- Agreement Module
- Future modules

Dashboard endpoints only aggregate existing information.

---

# Rule 2 — Authentication

Every dashboard endpoint requires authentication.

Rules

- User must have a valid access token.
- Only authenticated users may access dashboard data.
- Dashboard data is always scoped to the authenticated user.

No dashboard endpoint supports anonymous access.

---

# Rule 3 — User Isolation

Dashboard responses are user-specific.

Rules

- Users only receive information they are authorized to access.
- Workspace permissions are respected.
- Project visibility rules are respected.
- Agreement permissions are respected.

Dashboard aggregation never bypasses permission validation.

---

# Rule 4 — Overview Widget

The Overview widget provides high-level statistics for the authenticated user.

Current metrics include:

- Total Workspaces
- Total Projects
- Active Projects
- Draft Projects
- Completed Projects
- Requires Attention Count

Rules

- Soft deleted projects are excluded.
- Soft deleted workspaces are excluded.
- Counts always reflect the latest committed database state.

---

# Rule 5 — Requires Attention Widget

The Requires Attention widget returns actionable items requiring immediate user action.

Current implementation includes:

- Pending Agreement Invitations

Rules

- Completed actions are excluded.
- Resolved invitations are excluded.
- Results are ordered by creation time.

Future implementations may additionally include:

- Pending milestone approvals
- Revision requests
- Disputes
- Payments

---

# Rule 6 — Recent Activity Widget

The Recent Activity widget returns a unified activity timeline.

Current sources include:

- Project Audit
- Agreement Audit

Rules

- Activities are merged into a single feed.
- Results are ordered by newest first.
- Deleted project activities are excluded.
- Activity limits are enforced.
- Historical ordering is preserved.

---

# Rule 7 — Activity Limit

Recent Activity supports configurable limits.

Rules

- Default limit is applied when omitted.
- Invalid limits fall back to the default.
- Maximum limit is enforced to prevent excessive queries.

---

# Rule 8 — Aggregation Rules

Dashboard widgets aggregate information from multiple modules.

Rules

- Aggregation never duplicates source data.
- Aggregation never modifies source records.
- Source modules remain the single source of truth.

---

# Rule 9 — Workspace Ownership

The Dashboard Module never exposes workspace information that already belongs to the Workspace Module.

Rules

- Workspace listing remains inside the Workspace Module.
- Workspace management remains inside the Workspace Module.
- Dashboard only exposes aggregate workspace counts.

---

# Rule 10 — Project Ownership

Project lifecycle remains exclusively inside the Project Module.

Rules

- Dashboard cannot update project status.
- Dashboard cannot delete projects.
- Dashboard cannot create projects.
- Dashboard only exposes project summaries.

---

# Rule 11 — Agreement Ownership

Agreement management remains inside the Agreement Module.

Rules

- Dashboard cannot manage invitations.
- Dashboard cannot update agreements.
- Dashboard only displays agreement-derived summaries.

---

# Rule 12 — Cache Rules

Dashboard follows the Cache-Aside pattern.

Cached widgets include:

- Overview
- Requires Attention
- Recent Activity

Rules

- Redis is used only for reads.
- PostgreSQL remains the source of truth.
- Every cache entry is independent.
- Cache is repopulated after cache misses.

---

# Rule 13 — Cache Invalidation

Dashboard cache is invalidated whenever source modules mutate data.

Overview cache is invalidated after:

- Workspace Created
- Workspace Deleted
- Project Created
- Project Updated
- Project Deleted
- Project Status Changed


Requires Attention cache is invalidated after:

- Invitation Created
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn

Recent Activity cache is invalidated after:

- Project Audit Created
- Agreement Audit Created
- Execution Audit Created

---

# Rule 14 — Permission Enforcement

Dashboard never bypasses authorization.

Rules

- Every repository query is permission-aware.
- Unauthorized records are never included.
- Cross-workspace data leakage is prohibited.

---

# Rule 15 — Response Consistency

Dashboard widgets must always remain internally consistent.

Rules

- Widget counts must match underlying data.
- Recent Activity ordering must remain chronological.
- Requires Attention count must equal the number of returned pending items.

---

# Rule 16 — Performance

Dashboard is optimized for read-heavy workloads.

Rules

- Widgets are independently cached.
- Aggregation queries should be optimized.
- Database joins should be minimized.
- Widgets may be loaded independently by the frontend.

---

# Rule 17 — Future Extensibility

The Dashboard Module is designed to support future widgets without redesign.

Examples include:

- Professional Dashboard
- Execution Summary
- Payment Summary
- Notification Center
- Analytics
- Calendar
- Deadlines

New widgets must remain independent of existing widget implementations.

---

# Rule 18 — Design Principles

The Dashboard Module follows these principles:

- Read-only architecture.
- No business ownership.
- Aggregation over duplication.
- Permission-first access.
- Independent widget design.
- Cache-Aside pattern.
- PostgreSQL as the source of truth.
- Redis for read optimization.
- Thin controllers.
- Service-layer aggregation.

####################################################################################################################
# Phase 4 — API Documentation

# Dashboard APIs

The Dashboard Module exposes lightweight, read-only endpoints that provide dashboard widgets for authenticated users.

All endpoints require authentication.

---

# Authentication

Every Dashboard API requires a valid access token.

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

# GET /api/v1/dashboard/client/client-dashboard/overview

## Purpose

Returns a summarized overview of the authenticated client's workspace.

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
        "totalWorkspaces": 5,
        "totalProjects": 9,
        "activeProjects": 2,
        "draftProjects": 6,
        "completedProjects": 1,
        "requiresAttentionCount": 0
    }
}
```

---

## Business Rules

- Returns data only for the authenticated user.
- Soft deleted records are excluded.
- Overview statistics are aggregated across accessible workspaces.
- Response is cached using Redis.

---

## Database Changes

None

---

## Redis

Reads

```text
dashboard:client:overview:{userId}
```

Cache Miss

- Query database
- Aggregate metrics
- Store response in Redis

---

## Socket Events

None

---

# GET /api/v1/dashboard/client/client-dashboard/requires-attention

## Purpose

Returns dashboard items requiring immediate user attention.

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
            "id": "...",
            "type": "AGREEMENT_INVITATION",
            "title": "Agreement Invitation",
            "description": "Pending agreement invitation.",
            "createdAt": "2026-07-18T10:00:00.000Z"
        }
    ]
}
```

If no pending actions exist:

```json
{
    "success": true,
    "data": []
}
```

---

## Business Rules

- Only pending actions are returned.
- Completed or resolved actions are excluded.
- Results are ordered by newest first.
- Response is cached.

---

## Database Changes

None

---

## Redis

Reads

```text
dashboard:client:requires-attention:{userId}
```

Cache Miss

- Query database
- Store response

---

## Socket Events

None

---

# GET /api/v1/dashboard/client/client-dashboard/recent-activity

## Purpose

Returns the authenticated client's recent dashboard activity.

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

```json
{
    "success": true,
    "data": [
        {
            "id": "...",
            "type": "PROJECT_CREATED",
            "title": "Execution Testing Project",
            "description": "Project created.",
            "createdAt": "2026-07-18T18:10:00.000Z"
        },
        {
            "id": "...",
            "type": "AGREEMENT_UPDATED",
            "title": "Agreement Updated",
            "description": "Budget updated.",
            "createdAt": "2026-07-18T17:45:00.000Z"
        }
    ]
}
```

---

## Business Rules

- Activities are merged from multiple modules.
- Ordered by newest first.
- Deleted project activities are excluded.
- Maximum activity limit is enforced.
- Response is cached.

---

## Database Changes

None

---

## Redis

Reads

```text
dashboard:client:recent-activity:{userId}:{activityLimit}
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

# Redis Cache

The Dashboard Module maintains independent caches for every widget.

| Widget | Cache Key |
|---------|-----------|
| Overview | `dashboard:client:overview:{userId}` |
| Requires Attention | `dashboard:client:requires-attention:{userId}` |
| Recent Activity | `dashboard:client:recent-activity:{userId}:{activityLimit}` |

---

# Cache Invalidation

## Overview

Invalidated after:

- Workspace Created
- Workspace Deleted
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

## Requires Attention

Invalidated after:

- Agreement Invitation Created
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn

---

## Recent Activity

Invalidate after:

- Agreement Invitation Created
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

---

# Current Endpoints

| Method | Endpoint |
|---------|----------|
| GET | `/api/v1/dashboard/client/client-dashboard/overview` |
| GET | `/api/v1/dashboard/client/client-dashboard/requires-attention` |
| GET | `/api/v1/dashboard/client/client-dashboard/recent-activity` |

####################################################################################################################

# Phase 5 — Response Models

# Dashboard Response Models

The Dashboard Module exposes lightweight, read-optimized response models.

These models are intentionally independent of the underlying database entities and only include information required by dashboard widgets.

---

# Dashboard Overview Response

Returned by:

```text
GET /api/v1/dashboard/client/client-dashboard/overview
```

## Response Model

```ts
interface DashboardOverviewResponse {
    totalWorkspaces: number;
    totalProjects: number;
    activeProjects: number;
    draftProjects: number;
    completedProjects: number;
    requiresAttentionCount: number;
}
```

---

## Example Response

```json
{
    "success": true,
    "data": {
        "totalWorkspaces": 3,
        "totalProjects": 12,
        "activeProjects": 5,
        "draftProjects": 4,
        "completedProjects": 3,
        "requiresAttentionCount": 2
    }
}
```

---

# Requires Attention Response

Returned by:

```text
GET /api/v1/dashboard/client/client-dashboard/requires-attention
```

---

## Response Model

```ts
interface RequiresAttentionItem {
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
}

type RequiresAttentionResponse = RequiresAttentionItem[];
```

---

## Example Response

```json
{
    "success": true,
    "data": [
        {
            "id": "agreement_uuid",
            "type": "AGREEMENT_INVITATION",
            "title": "Agreement Invitation",
            "description": "Pending agreement invitation requires your response.",
            "createdAt": "2026-07-18T09:30:00.000Z"
        }
    ]
}
```

---

## Empty Response

```json
{
    "success": true,
    "data": []
}
```

---

# Recent Activity Response

Returned by:

```text
GET /api/v1/dashboard/client/client-dashboard/recent-activity
```

---

## Response Model

```ts
interface RecentActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
}

type RecentActivityResponse = RecentActivityItem[];
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
            "title": "Execution Testing Project",
            "description": "Project created successfully.",
            "createdAt": "2026-07-18T18:20:00.000Z"
        },
        {
            "id": "audit_uuid",
            "type": "AGREEMENT_UPDATED",
            "title": "Agreement Updated",
            "description": "Agreement budget updated.",
            "createdAt": "2026-07-18T17:40:00.000Z"
        }
    ]
}
```

---

# Common Dashboard Response

Every dashboard endpoint follows the standard API response format.

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
| Overview | DashboardOverviewResponse |
| Requires Attention | RequiresAttentionResponse |
| Recent Activity | RecentActivityResponse |

---

# Future Response Models

The current response models are intentionally lightweight and designed for extension.

Future dashboard widgets may introduce additional response models, including:

- Professional Dashboard Summary
- Execution Summary
- Payment Summary
- Notification Summary
- Calendar Summary
- Analytics Summary

These additions can be introduced independently without affecting the existing dashboard response models.

####################################################################################################################

# Phase 6 — Redis Caching Strategy

# Dashboard Redis Caching

The Dashboard Module is designed for read-heavy workloads.

To minimize database queries and improve dashboard response times, every dashboard widget follows the Cache-Aside pattern using Redis.

Redis is treated strictly as a read cache.

PostgreSQL always remains the source of truth.

---

# Cache Strategy

Dashboard caching follows the Cache-Aside pattern.

## Read Flow

```text
Dashboard Request
        │
        ▼
Redis Cache
        │
        ├──────── Cache Hit ─────────► Return Response
        │
        └──────── Cache Miss
                     │
                     ▼
             PostgreSQL
                     │
                     ▼
              Aggregate Data
                     │
                     ▼
              Store in Redis
                     │
                     ▼
               Return Response
```

---

## Write Flow

The Dashboard Module owns no write operations.

Whenever a source module mutates data, it invalidates the affected dashboard cache.

```text
Workspace / Project / Agreement / Execution
                    │
                    ▼
            Database Commit
                    │
                    ▼
       Domain Cache Invalidation
                    │
                    ▼
      Dashboard Cache Invalidation
                    │
                    ▼
        Next Read Repopulates Cache
                    │
                    ▼
        Next Read Repopulates Cache
```

## Dashboard Cache Ownership

Dashboard cache invalidation is owned by the source business modules.

Each domain cache class is responsible for invalidating all dashboard widgets affected by mutations within its domain.

Current ownership:

- Workspace Cache
- Project Cache
- Agreement Cache
- Milestone Cache
- Submission Cache
- Milestone Extension Cache

Dashboard services never invalidate caches directly. Source modules invalidate dashboard caches only after successful database transactions.

---

# Cached Resources

The Dashboard Module maintains an independent cache for every widget.

| Widget | Cache Key |
|---------|-----------|
| Overview | `dashboard:client:overview:{userId}` |
| Requires Attention | `dashboard:client:requires-attention:{userId}` |
| Recent Activity | `dashboard:client:recent-activity:{userId}:{activityLimit}` |

Each widget cache is completely independent.

---

# Cache Expiration

Dashboard caches use a Time-To-Live (TTL) to prevent stale data.

| Widget | Recommended TTL |
|---------|-----------------|
| Overview | 5 Minutes |
| Requires Attention | 2 Minutes |
| Recent Activity | 2 Minutes |

Cache expiration serves as a fallback mechanism.

Primary consistency is maintained through explicit cache invalidation.

---

# Cache Invalidation

## Overview Cache

Invalidate after:

- Workspace Created
- Workspace Deleted
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

Cache Key

```text
dashboard:client:overview:{userId}
```

---

## Requires Attention Cache

Invalidate after:

- Agreement Invitation Created
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn
- Submission Created
- Submission Approved
- Revision Requested
- Submission Auto Approved
- Milestone Extension Created

Cache Key

```text
dashboard:client:requires-attention:{userId}
```

---

## Recent Activity Cache

Invalidate after:

- Project Audit Created
- Agreement Audit Created
- Execution Audit Created

Cache Key

```text
dashboard:client:recent-activity:{userId}:{activityLimit}
```

Since activity feeds can be requested with different limits, all matching activity cache keys for the user should be invalidated.

---

# Cache Population

Dashboard caches are populated lazily.

Rules:

- Cache entries are created only after a cache miss.
- Empty responses are also cached.
- Cached responses must exactly match the API response model.

No cache warming is performed.

---

# Cache Consistency

Dashboard cache consistency follows these principles.

- PostgreSQL is always the source of truth.
- Redis never accepts direct writes from clients.
- Cache invalidation occurs only after successful database transactions.
- Failed transactions never invalidate cache.

---

# Cache Isolation

Each dashboard widget maintains its own cache.

Benefits include:

- Independent invalidation
- Smaller cache objects
- Faster cache updates
- Reduced memory usage
- Better scalability

Updating one widget never invalidates the others unless required.

---

# Cache Failure Handling

Dashboard functionality must remain available even if Redis becomes unavailable.

Rules

- Cache failures must never fail the request.
- On Redis failure, data is retrieved directly from PostgreSQL.
- Responses continue normally.
- Redis errors are logged for monitoring.

---

# Performance Benefits

Dashboard Redis caching provides:

- Reduced database load
- Faster dashboard response times
- Independent widget retrieval
- Improved scalability
- Lower latency
- Better user experience

---

# Design Principles

The Dashboard caching layer follows these principles:

- Cache-Aside pattern
- PostgreSQL as source of truth
- Read-only Redis usage
- Widget-level caching
- Independent cache invalidation
- Lazy cache population
- Graceful Redis failure handling
- Explicit cache invalidation after successful mutations

####################################################################################################################

# Phase 7 — Error Handling

# Dashboard Error Handling

The Dashboard Module follows the application's standardized error handling strategy.

All errors are returned using a consistent response format.

Sensitive implementation details are never exposed to clients.

---

# Error Response Format

```json
{
    "success": false,
    "message": "Human readable error message.",
    "code": "ERROR_CODE"
}
```

---

# Standard Error Codes

| Error Code | HTTP Status | Description |
|------------|------------|-------------|
| INVALID_TOKEN | 401 | Access token is invalid. |
| TOKEN_EXPIRED | 401 | Access token has expired. |
| SESSION_REVOKED | 401 | User session has been revoked. |
| UNAUTHORIZED | 401 | Authentication required. |
| FORBIDDEN | 403 | User lacks required permissions. |
| INVALID_REQUEST | 400 | Request validation failed. |
| RESOURCE_NOT_FOUND | 404 | Requested resource not found. |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error. |

---

# Authentication Errors

## Missing Access Token

**HTTP**

```text
401 Unauthorized
```

**Response**

```json
{
    "success": false,
    "message": "Authentication required.",
    "code": "UNAUTHORIZED"
}
```

---

## Invalid Access Token

**HTTP**

```text
401 Unauthorized
```

```json
{
    "success": false,
    "message": "Invalid access token.",
    "code": "INVALID_TOKEN"
}
```

---

## Expired Access Token

**HTTP**

```text
401 Unauthorized
```

```json
{
    "success": false,
    "message": "Access token has expired.",
    "code": "TOKEN_EXPIRED"
}
```

---

## Revoked Session

**HTTP**

```text
401 Unauthorized
```

```json
{
    "success": false,
    "message": "Session has expired.",
    "code": "SESSION_REVOKED"
}
```

---

# Authorization Errors

Dashboard endpoints only return data accessible to the authenticated user.

If authorization fails:

**HTTP**

```text
403 Forbidden
```

```json
{
    "success": false,
    "message": "You do not have permission to access this resource.",
    "code": "FORBIDDEN"
}
```

---

# Validation Errors

Invalid query parameters should return validation errors.

Example:

```text
GET /recent-activity?activityLimit=-5
```

Response

```json
{
    "success": false,
    "message": "Invalid activity limit.",
    "code": "INVALID_REQUEST"
}
```

---

# Resource Errors

Dashboard endpoints aggregate existing resources.

If referenced resources are unavailable:

**HTTP**

```text
404 Not Found
```

```json
{
    "success": false,
    "message": "Requested resource not found.",
    "code": "RESOURCE_NOT_FOUND"
}
```

---

# Internal Server Errors

Unexpected exceptions should never expose implementation details.

**HTTP**

```text
500 Internal Server Error
```

```json
{
    "success": false,
    "message": "An unexpected error occurred.",
    "code": "INTERNAL_SERVER_ERROR"
}
```

---

# Redis Errors

Redis is used only as a cache.

If Redis becomes unavailable:

- Dashboard requests continue normally.
- Data is retrieved from PostgreSQL.
- Cache errors are logged.
- Clients never receive Redis-specific errors.

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

# Database Errors

If database operations fail:

- Transaction is aborted.
- Error is logged.
- Standard server error is returned.
- No partial response is sent.

---

# Logging Strategy

All unexpected errors should be logged.

Logs should include:

- Timestamp
- User ID (if available)
- Endpoint
- HTTP Method
- Error Code
- Stack Trace (server only)

Sensitive information such as access tokens, passwords, and internal SQL queries must never be logged.

---

# Error Handling Principles

The Dashboard Module follows these principles:

- Consistent error response format.
- Authentication before authorization.
- No sensitive information exposed.
- PostgreSQL remains the source of truth.
- Redis failures never break dashboard functionality.
- Validation errors return meaningful messages.
- Unexpected exceptions are logged.
- Standardized HTTP status codes across all endpoints.

####################################################################################################################