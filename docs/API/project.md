# Phase 1 — Module Overview

# Project Module

## Overview

The Project Module is responsible for managing the complete lifecycle of professional projects within a workspace.

A project represents a professional engagement created by a workspace member and acts as the parent entity for future modules such as Agreements, Milestones, Deliverables, Invoices, Payments, and Activity Tracking.

The module provides secure project creation, retrieval, updates, lifecycle management, soft deletion, audit logging, Redis caching, pagination, searching, filtering, and sorting while enforcing strict role-based access control.

---

# Objectives

* Allow workspace members to create professional projects.
* Allow Workspace Owners and Admins to view all projects within a workspace.
* Allow Members to view only the projects they have created.
* Restrict project modification to the project creator.
* Maintain a complete audit trail for every project operation.
* Support efficient retrieval using pagination, searching, filtering, and sorting.
* Improve read performance through Redis caching.
* Preserve historical data using soft deletion.

---

# Features

## Project Management

* Create Project
* View Workspace Projects
* View Project Details
* Update Project
* Soft Delete Project

---

## Project Lifecycle

Supported project states:

* DRAFT
* ACTIVE
* COMPLETED
* CANCELLED
* MUTUALLY_TERMINATED

Status transitions are validated to ensure only valid lifecycle changes are allowed.

---

## Permission Model

### Workspace Owner

* View all workspace projects.

---

### Workspace Admin

* View all workspace projects.

---

### Workspace Member

* Create new projects.
* View only projects created by themselves.
* Update only projects they created.
* Delete only projects they created.
* Change the status of only projects they created.

---

## Validation

Business validation includes:

* Project title validation.
* Project description validation.
* Estimated budget validation.
* Estimated duration validation.
* Expected start and completion date validation.
* Project status transition validation.

---

## Audit Logging

Every important project operation generates an immutable audit record.

Tracked events include:

* Project Created
* Project Updated
* Project Deleted
* Project Status Changed

Each audit entry stores:

* Actor
* Action
* Metadata
* Timestamp

---

## Pagination, Search & Filtering

Workspace project listing supports:

### Pagination

* Page
* Limit

### Searching

* Project title
* Project description

### Filtering

* Project status

### Sorting

* Created Date
* Updated Date (if enabled)
* Project Title
* Estimated Budget (if enabled)
* Expected Start Date
* Expected Completion Date

Both ascending and descending ordering are supported.

---

## Redis Caching

Frequently accessed read operations are cached to reduce database load.

Cached resources include:

* Single Project
* Workspace Project List
* Project Audit Logs

Cache invalidation occurs automatically after:

* Project Creation
* Project Update
* Project Deletion
* Project Status Change

---

## Soft Deletion

Projects are never permanently removed.

Deleting a project:

* Marks the project as deleted.
* Preserves audit history.
* Excludes the project from normal queries.
* Allows historical records to remain intact.

---

## Performance Optimizations

The Project Module includes:

* Redis caching for read endpoints.
* Automatic cache invalidation.
* Server-side pagination.
* Database-level searching.
* Database-level filtering.
* Database-level sorting.
* Transactional database operations.
* Soft deletion.
* Immutable audit logging.

---

## Design Principles

The module follows the same architectural principles as the rest of the backend:

* Layered Architecture
* Repository Pattern
* Service Layer Pattern
* Transactional Business Logic
* Separation of Concerns
* Role-Based Access Control
* Soft Delete Strategy
* Immutable Audit Trail
* Redis Read Caching

####################################################################################################################

# Phase 2 — System Architecture

## Architecture Overview

The Project Module follows the same layered architecture as every other module in the application.

Each layer has a single responsibility and communicates only with the adjacent layer, ensuring maintainability, scalability, and testability.

```
                HTTP Request
                     │
                     ▼
                Authentication
                     │
                     ▼
                  Routes
                     │
                     ▼
                Controller
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   Redis Cache             Project Service
                                 │
                                 ▼
                        Permission Service
                                 │
                                 ▼
                           Validator Layer
                                 │
                                 ▼
                          Repository Layer
                                 │
                                 ▼
                           PostgreSQL
                                 │
                                 ▼
                           API Response
```

---

# Request Lifecycle

## Read Operations

All read operations follow a **Cache-Aside** strategy.

```
Client
   │
   ▼
Controller
   │
   ▼
Redis Cache
   │
   ├──────── Cache Hit ─────────► Return Response
   │
   └──────── Cache Miss
                 │
                 ▼
            Service Layer
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
          Return Response
```

This minimizes unnecessary database queries while ensuring frequently accessed data is served with low latency.

---

## Write Operations

Create, Update, Delete, and Status Change operations always execute inside a database transaction.

```
Client
   │
   ▼
Controller
   │
   ▼
Database Transaction
   │
   ▼
Business Validation
   │
   ▼
Permission Validation
   │
   ▼
Database Update
   │
   ▼
Audit Log Creation
   │
   ▼
Commit Transaction
   │
   ▼
Redis Cache Invalidation
   │
   ▼
Return Response
```

Cache invalidation occurs **only after a successful transaction commit**, ensuring cache consistency.

---

# Layer Responsibilities

## Routes

Responsible for:

* Registering REST endpoints.
* Applying authentication middleware.
* Delegating requests to controllers.

Routes contain no business logic.

---

## Controllers

Responsible for:

* Parsing requests.
* DTO validation.
* Reading from Redis cache.
* Invoking services.
* Writing successful responses.
* Populating Redis cache.

Controllers never communicate directly with the database.

---

## Services

Responsible for all business logic.

Responsibilities include:

* Permission enforcement.
* Project lifecycle validation.
* Business rule validation.
* Transaction orchestration.
* Audit log creation.
* Repository coordination.

Services never perform HTTP-related operations.

---

## Permission Service

Responsible for enforcing authorization rules.

Validates:

* Workspace membership.
* Project visibility.
* Project ownership.
* Update permissions.
* Delete permissions.
* Status change permissions.

Centralizing authorization avoids duplicated permission logic across services.

---

## Validators

Responsible for validating business constraints.

Examples include:

* Project title validation.
* Description validation.
* Budget validation.
* Duration validation.
* Expected date validation.
* Status transition validation.

---

## Repository Layer

Responsible only for database access.

Operations include:

* CRUD operations.
* Pagination.
* Searching.
* Filtering.
* Sorting.
* Soft deletion.
* Membership lookup.

Repositories contain no business rules.

---

## Mapper Layer

Responsible for transforming Prisma entities into API response objects.

Benefits include:

* Preventing accidental exposure of internal fields.
* Consistent API responses.
* Decoupling database models from external contracts.

---

## Redis Cache Layer

The Project Module caches frequently accessed read operations.

### Cached Resources

* Individual Projects
* Workspace Project Listings
* Project Audit Logs

### Cache Keys

```
project:{projectId}

workspace:{workspaceId}:projects:{queryHash}

project:{projectId}:audits:{queryHash}
```

### Cache Strategy

The module follows the **Cache-Aside Pattern**.

* Check Redis first.
* Query PostgreSQL on cache miss.
* Store the response in Redis.
* Return the cached response on subsequent requests.

---

# Cache Invalidation Strategy

## Create Project

Invalidates:

* Workspace Project List Cache

---

## Update Project

Invalidates:

* Project Cache
* Workspace Project List Cache
* Project Audit Cache

---

## Delete Project

Invalidates:

* Project Cache
* Workspace Project List Cache
* Project Audit Cache

---

## Update Project Status

Invalidates:

* Project Cache
* Workspace Project List Cache
* Project Audit Cache

---

# Database Transactions

The following operations execute inside a single Prisma transaction:

* Create Project
* Update Project
* Delete Project
* Update Project Status

This guarantees:

* Atomic writes.
* Consistent audit logs.
* Rollback on failure.
* Data integrity.

---

# Design Principles

The Project Module adheres to the following principles:

* Layered Architecture
* Repository Pattern
* Service Layer Pattern
* Cache-Aside Pattern
* Transactional Consistency
* Soft Delete Strategy
* Immutable Audit Logging
* Role-Based Authorization
* Separation of Concerns
* Single Responsibility Principle

####################################################################################################################

# Phase 3 — Database Design

## Overview

The Project Module introduces two primary entities:

* Project
* Project Audit

Projects belong to a workspace and are created by a workspace member.

Every important project operation generates an immutable audit record, enabling complete traceability throughout the project lifecycle.

---

# Entity Relationship Diagram

```text
User
 │
 │ creates
 ▼
Project
 │
 │ belongs to
 ▼
Workspace

Project
 │
 │ has many
 ▼
ProjectAudit

User
 │
 │ performs
 ▼
ProjectAudit
```

---

# Database Relationships

## Workspace → Projects

Relationship

```
One Workspace
      │
      ▼
Many Projects
```

Every project belongs to exactly one workspace.

A workspace can contain multiple projects.

---

## User → Projects

Relationship

```
One User
      │
      ▼
Many Projects
```

A user can create multiple projects.

Each project has exactly one creator.

---

## Project → Project Audits

Relationship

```
One Project
      │
      ▼
Many Audit Logs
```

Every significant project action creates an audit record.

Audit records are immutable and permanently preserved.

---

## User → Project Audits

Relationship

```
One User
      │
      ▼
Many Audit Logs
```

Each audit stores the user responsible for the action.

---

# Project Table

| Column                 | Type      | Description                  |
| ---------------------- | --------- | ---------------------------- |
| id                     | UUID      | Primary Key                  |
| workspaceId            | UUID      | Parent workspace             |
| createdById            | UUID      | User who created the project |
| title                  | String    | Project title                |
| description            | String?   | Optional description         |
| status                 | Enum      | Current lifecycle state      |
| estimatedBudget        | Decimal?  | Optional estimated budget    |
| estimatedDuration      | Integer?  | Estimated duration (days)    |
| expectedStartDate      | DateTime? | Planned start date           |
| expectedCompletionDate | DateTime? | Planned completion date      |
| createdAt              | DateTime  | Creation timestamp           |
| updatedAt              | DateTime  | Last modification timestamp  |
| deletedAt              | DateTime? | Soft delete timestamp        |

---

# Project Status Enum

```text
DRAFT

ACTIVE

COMPLETED

CANCELLED

MUTUALLY_TERMINATED
```

---

# Project Audit Table

| Column    | Type     | Description                |
| --------- | -------- | -------------------------- |
| id        | UUID     | Primary Key                |
| projectId | UUID     | Related project            |
| actorId   | UUID     | User performing the action |
| action    | Enum     | Audit action               |
| metadata  | JSON     | Additional information     |
| createdAt | DateTime | Audit timestamp            |

---

# Project Audit Actions

```text
CREATED

UPDATED

DELETED

STATUS_CHANGED
```

---

# Foreign Key Constraints

## Project

| Column      | References   | On Delete |
| ----------- | ------------ | --------- |
| workspaceId | Workspace.id | RESTRICT  |
| createdById | User.id      | RESTRICT  |

---

## Project Audit

| Column    | References | On Delete |
| --------- | ---------- | --------- |
| projectId | Project.id | CASCADE   |
| actorId   | User.id    | RESTRICT  |

---

# Indexes

## Project

* Primary Key (id)
* Index (workspaceId)
* Index (createdById)
* Index (status)
* Index (deletedAt)
* Composite Index (workspaceId, deletedAt)
* Composite Index (workspaceId, status)

---

## Project Audit

* Primary Key (id)
* Index (projectId)
* Index (actorId)
* Index (action)
* Index (createdAt)

---

# Soft Delete Strategy

Projects are never physically removed.

Deletion updates only:

```text
deletedAt = Current Timestamp
```

Queries automatically exclude records where:

```sql
deletedAt IS NOT NULL
```

Benefits include:

* Audit preservation
* Historical reporting
* Future restoration capability
* Referential integrity

---

# Data Integrity Rules

The Project Module enforces the following constraints:

* Every project belongs to a valid workspace.
* Every project has exactly one creator.
* Every audit record belongs to a valid project.
* Every audit record records the acting user.
* Deleted projects remain available for audit history.
* Invalid status transitions are rejected.
* Project updates and deletions are restricted to the project creator.
* Workspace Owners and Admins can view all projects.
* Workspace Members can view only their own projects.

####################################################################################################################

# Phase 4 — Business Rules & Authorization

## Overview

The Project Module enforces strict business rules to ensure only authorized workspace members can create, view, modify, or manage projects.

Authorization is handled centrally through the `ProjectPermissionService`, preventing permission logic from being duplicated across controllers and services.

---

# Workspace Membership

Only users who are members of a workspace can access its projects.

If a user is not a member of the workspace:

* Project creation is denied.
* Project listing is denied.
* Project retrieval is denied.
* Project updates are denied.
* Project deletion is denied.
* Status updates are denied.
* Audit log access is denied.

---

# Project Creation

A project can only be created when:

* The workspace exists.
* The user is a member of the workspace.
* Project data passes validation.

Upon successful creation:

* The project is created with `DRAFT` status.
* The creator is recorded.
* An audit log is generated.
* Workspace project list cache is invalidated.

---

# Project Visibility

Project visibility depends on the user's workspace role.

## Workspace Owner

Can:

* View every project in the workspace.
* View project details.
* View project audit history.

Cannot:

* Edit projects created by other members.
* Delete projects created by other members.
* Change the status of projects created by other members.

---

## Workspace Admin

Can:

* View every project in the workspace.
* View project details.
* View project audit history.

Cannot:

* Edit projects created by other members.
* Delete projects created by other members.
* Change the status of projects created by other members.

---

## Workspace Member

Can:

* Create projects.
* View only projects they created.
* View details of their own projects.
* View audit history of their own projects.

Cannot:

* View projects created by other members.
* Modify projects created by others.
* Delete projects created by others.
* Change the status of projects created by others.

---

# Project Updates

A project can only be updated when:

* The project exists.
* The project is not soft deleted.
* The requesting user is the project creator.
* The project is in `DRAFT` status.

On success:

* Project information is updated.
* Audit log is created.
* Related caches are invalidated.

---

# Project Deletion

Projects use soft deletion.

Deletion is allowed only when:

* The project exists.
* The requesting user is the project creator.
* The project is still in `DRAFT` status.

Deletion:

* Sets `deletedAt`.
* Preserves historical data.
* Preserves audit history.
* Invalidates related caches.

---

# Project Status Changes

Only the project creator can change the project status.

Allowed transitions:

```text
DRAFT
 ├──► ACTIVE
 └──► CANCELLED

ACTIVE
 ├──► COMPLETED
 └──► MUTUALLY_TERMINATED
```

The following transitions are rejected:

* COMPLETED → Any Status
* CANCELLED → Any Status
* MUTUALLY_TERMINATED → Any Status
* ACTIVE → DRAFT
* DRAFT → COMPLETED
* DRAFT → MUTUALLY_TERMINATED

Every successful status change creates an audit record.

---

# Audit Logging

The following actions are automatically audited:

* Project Created
* Project Updated
* Project Deleted
* Project Status Changed

Each audit record stores:

* Project ID
* Actor ID
* Action
* Metadata
* Timestamp

Audit records are immutable and cannot be modified or deleted.

---

# Validation Rules

The module validates:

## Title

* Required
* Trimmed
* Length validation

---

## Description

* Optional
* Trimmed
* Maximum length validation

---

## Estimated Budget

* Optional
* Positive value only

---

## Estimated Duration

* Optional
* Positive integer

---

## Expected Dates

If both dates are provided:

* Completion date must be later than start date.

---

# Error Conditions

Requests are rejected when:

* Workspace does not exist.
* User is not a workspace member.
* Project does not exist.
* Project is soft deleted.
* User is not the project creator.
* Invalid project status transition.
* Invalid input data.
* Validation rules fail.

---

# Business Guarantees

The Project Module guarantees:

* Every project belongs to a valid workspace.
* Every project has a single creator.
* Only the creator can modify project data.
* Owners and Admins have read access to all workspace projects.
* Members have read access only to their own projects.
* Every write operation generates an audit log.
* Invalid lifecycle transitions are prevented.
* Soft deletion preserves historical information.
* Authorization rules are enforced consistently through the permission service.

####################################################################################################################

# Phase 5 — REST API Specification

## Overview

The Project Module exposes RESTful APIs for project management, project lifecycle management, and audit log retrieval.

All endpoints require authentication using a valid JWT access token.

```
Authorization: Bearer <ACCESS_TOKEN>
```

---

# Base URL

```
/api/v1/project
```

---

# Create Project

## Endpoint

```
POST /workspaces/:workspaceId/projects
```

### Description

Creates a new project inside the specified workspace.

### Authorization

Authenticated Workspace Member

### Path Parameters

| Parameter   | Type | Description          |
| ----------- | ---- | -------------------- |
| workspaceId | UUID | Workspace identifier |

### Request Body

```json
{
  "title": "Portfolio Website",
  "description": "Personal client project",
  "estimatedBudget": 50000,
  "estimatedDuration": 30,
  "expectedStartDate": "2026-07-10T00:00:00.000Z",
  "expectedCompletionDate": "2026-08-10T00:00:00.000Z"
}
```

### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "...",
    "workspaceId": "...",
    "createdById": "...",
    "title": "Portfolio Website",
    "description": "Personal client project",
    "status": "DRAFT"
  }
}
```

---

# Get Workspace Projects

## Endpoint

```
GET /workspaces/:workspaceId/projects
```

### Description

Returns paginated projects visible to the authenticated user.

### Authorization

Authenticated Workspace Member

### Query Parameters

| Parameter | Type   | Default   | Description                    |
| --------- | ------ | --------- | ------------------------------ |
| page      | Number | 1         | Page number                    |
| limit     | Number | 20        | Records per page               |
| search    | String | —         | Search by title or description |
| status    | Enum   | —         | Filter by project status       |
| sort      | Enum   | createdAt | Sort field                     |
| order     | Enum   | desc      | asc / desc                     |

### Example

```
GET /workspaces/{workspaceId}/projects?page=1&limit=20&status=ACTIVE&search=website&sort=createdAt&order=desc
```

### Success Response

```json
{
  "success": true,
  "data": {
    "projects": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 125,
      "totalPages": 7,
      "hasNext": true
    }
  }
}
```

---

# Get Project

## Endpoint

```
GET /projects/:projectId
```

### Description

Returns complete information for a single project.

### Authorization

Authenticated Workspace Member with project access.

### Path Parameters

| Parameter | Type |
| --------- | ---- |
| projectId | UUID |

### Success Response

```json
{
  "success": true,
  "data": {
    "...": "project details"
  }
}
```

---

# Update Project

## Endpoint

```
PATCH /projects/:projectId
```

### Description

Updates an existing project.

### Authorization

Project Creator

### Request Body

```json
{
  "title": "Updated Project",
  "estimatedBudget": 75000
}
```

### Success Response

```json
{
  "success": true,
  "message": "Project updated successfully.",
  "data": {}
}
```

---

# Delete Project

## Endpoint

```
DELETE /projects/:projectId
```

### Description

Soft deletes a project.

### Authorization

Project Creator

### Success Response

```json
{
  "success": true,
  "message": "Project deleted successfully."
}
```

---

# Update Project Status

## Endpoint

```
PATCH /projects/:projectId/status
```

### Description

Changes the lifecycle state of a project.

### Authorization

Project Creator

### Request Body

```json
{
  "status": "ACTIVE"
}
```

### Allowed Transitions

```
DRAFT
 ├──► ACTIVE
 └──► CANCELLED

ACTIVE
 ├──► COMPLETED
 └──► MUTUALLY_TERMINATED
```

### Success Response

```json
{
  "success": true,
  "message": "Project status updated successfully.",
  "data": {}
}
```

---

# Get Project Audit Logs

## Endpoint

```
GET /projects/:projectId/audits
```

### Description

Returns paginated audit history for a project.

### Authorization

Users with access to the project.

### Query Parameters

| Parameter | Type   | Default | Description            |
| --------- | ------ | ------- | ---------------------- |
| page      | Number | 1       | Page number            |
| limit     | Number | 20      | Records per page       |
| action    | Enum   | —       | Filter by audit action |
| order     | Enum   | desc    | asc / desc             |

### Example

```
GET /projects/{projectId}/audits?page=1&limit=20&action=UPDATED
```

### Success Response

```json
{
  "success": true,
  "data": {
    "audits": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true
    }
  }
}
```

---

# HTTP Status Codes

| Status | Meaning                           |
| ------ | --------------------------------- |
| 200    | Success                           |
| 201    | Resource Created                  |
| 400    | Validation or Business Rule Error |
| 401    | Authentication Required           |
| 403    | Permission Denied                 |
| 404    | Resource Not Found                |
| 409    | Conflict                          |
| 500    | Internal Server Error             |

---

# Caching

The following endpoints use Redis caching:

| Endpoint                              | Cache |
| ------------------------------------- | ----- |
| GET /projects/:projectId              | ✅     |
| GET /workspaces/:workspaceId/projects | ✅     |
| GET /projects/:projectId/audits       | ✅     |

Cache entries are automatically invalidated after:

* Project creation
* Project update
* Project deletion
* Project status change

---

# Pagination Format

Every paginated endpoint returns:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true
  }
}
```

####################################################################################################################

# Phase 6 — Caching, Pagination & Performance

## Overview

The Project Module is optimized for high read performance and scalability using Redis caching, server-side pagination, filtering, sorting, and transactional database operations.

These optimizations reduce database load, improve response times, and ensure consistent performance as the number of projects grows.

---

# Redis Caching

The module follows the **Cache-Aside Pattern**.

For every supported read endpoint:

1. Check Redis.
2. Return cached data if available.
3. Query PostgreSQL on cache miss.
4. Cache the database response.
5. Return the response.

---

# Cached Resources

## Single Project

Endpoint

```text
GET /projects/:projectId
```

Cache Key

```text
project:{projectId}
```

Purpose

* Reduce repeated database lookups.
* Improve project detail response time.

---

## Workspace Project Listing

Endpoint

```text
GET /workspaces/:workspaceId/projects
```

Cache Key

```text
workspace:{workspaceId}:projects:{queryHash}
```

The query hash uniquely identifies pagination, search, filtering, and sorting combinations.

Example

```text
workspace:abc123:projects:{"page":1,"limit":20,"status":"ACTIVE"}
```

---

## Project Audit Logs

Endpoint

```text
GET /projects/:projectId/audits
```

Cache Key

```text
project:{projectId}:audits:{queryHash}
```

---

# Cache Expiration

All cache entries use a Time-To-Live (TTL) of:

```text
10 Minutes
```

Expired entries are automatically removed by Redis.

---

# Cache Invalidation Strategy

To maintain consistency between Redis and PostgreSQL, cache entries are invalidated immediately after successful write operations.

## Create Project

Invalidated

* Workspace Project List Cache

---

## Update Project

Invalidated

* Project Cache
* Workspace Project List Cache
* Project Audit Cache

---

## Delete Project

Invalidated

* Project Cache
* Workspace Project List Cache
* Project Audit Cache

---

## Update Project Status

Invalidated

* Project Cache
* Workspace Project List Cache
* Project Audit Cache

---

# Pagination

Workspace project listing and audit log retrieval support server-side pagination.

Supported parameters

| Parameter | Description                |
| --------- | -------------------------- |
| page      | Current page number        |
| limit     | Number of records per page |

Pagination is implemented directly at the database layer using:

* OFFSET
* LIMIT

This prevents loading unnecessary records into memory.

---

# Search

Workspace projects support text-based searching.

Searchable fields

* Project Title
* Project Description

Search is executed directly by PostgreSQL using case-insensitive matching.

---

# Filtering

Projects can be filtered by:

* Project Status

Audit logs can be filtered by:

* Audit Action

Filtering is performed at the database level.

---

# Sorting

Supported project sort fields

* Created Date
* Updated Date
* Project Title
* Estimated Budget
* Expected Start Date
* Expected Completion Date

Supported ordering

* Ascending
* Descending

Sorting is executed by PostgreSQL.

---

# Soft Delete Performance

Deleted projects remain in the database but are excluded from normal queries.

Every repository query automatically filters:

```sql
deletedAt IS NULL
```

This preserves historical data while ensuring deleted records do not impact application behavior.

---

# Database Transactions

The following operations execute within a single Prisma transaction:

* Create Project
* Update Project
* Delete Project
* Update Project Status

This guarantees:

* Atomic writes
* Audit consistency
* Automatic rollback on failure
* Data integrity

---

# Performance Benefits

The implemented optimizations provide:

* Reduced PostgreSQL load through Redis caching.
* Lower response latency for frequently accessed resources.
* Efficient handling of large project datasets.
* Scalable project listing through server-side pagination.
* Optimized database queries using filtering and sorting.
* Consistent cache behavior through automatic invalidation.
* Reliable write operations through transactional consistency.

---

# Scalability Considerations

The Project Module is designed to scale with increasing workspace and project counts by:

* Caching read-heavy endpoints.
* Performing pagination at the database layer.
* Avoiding unnecessary data retrieval.
* Invalidating only affected cache entries.
* Separating business logic from persistence logic.
* Maintaining immutable audit records without impacting read performance.

####################################################################################################################

# Phase 7 — Error Handling & Validation

## Overview

The Project Module follows a layered validation strategy to ensure every request is authenticated, authorized, validated, and executed safely before any database changes occur.

Validation is performed in multiple stages to prevent invalid data from reaching the persistence layer.

---

# Validation Flow

```text
HTTP Request
      │
      ▼
Authentication
      │
      ▼
DTO Validation
      │
      ▼
Business Validation
      │
      ▼
Permission Validation
      │
      ▼
Database Transaction
      │
      ▼
Success Response
```

Each stage must complete successfully before the next stage begins.

---

# Authentication Validation

Every endpoint requires a valid JWT Access Token.

If authentication fails:

* Request execution stops immediately.
* No business logic is executed.
* No database operation is performed.

Possible responses:

* Unauthorized
* Invalid Token
* Expired Token

---

# DTO Validation

Incoming requests are validated using Zod schemas.

Validated fields include:

## Create Project

* title
* description
* estimatedBudget
* estimatedDuration
* expectedStartDate
* expectedCompletionDate

---

## Update Project

All project fields are optional, but any supplied value must pass validation.

---

## Update Project Status

Validated field:

* status

---

## List Projects

Validated query parameters:

* page
* limit
* search
* status
* sort
* order

---

## List Project Audits

Validated query parameters:

* page
* limit
* action
* order

---

# Business Validation

After DTO validation succeeds, additional business rules are enforced.

## Project Title

Rules:

* Required during creation.
* Trimmed before storage.
* Must satisfy application-defined length constraints.

---

## Description

Rules:

* Optional.
* Trimmed before storage.
* Must satisfy maximum length constraints.

---

## Estimated Budget

Rules:

* Optional.
* Must be greater than zero.

---

## Estimated Duration

Rules:

* Optional.
* Must be a positive integer.

---

## Expected Dates

Rules:

* Start date is optional.
* Completion date is optional.
* If both are supplied, completion date must be later than the start date.

---

## Project Status

Status transitions are validated before updates are allowed.

Allowed transitions:

```text
DRAFT
 ├──► ACTIVE
 └──► CANCELLED

ACTIVE
 ├──► COMPLETED
 └──► MUTUALLY_TERMINATED
```

Rejected transitions include:

* ACTIVE → DRAFT
* COMPLETED → Any Status
* CANCELLED → Any Status
* MUTUALLY_TERMINATED → Any Status
* DRAFT → COMPLETED
* DRAFT → MUTUALLY_TERMINATED

---

# Permission Validation

Permission checks are performed through the `ProjectPermissionService`.

Validation includes:

* Workspace membership.
* Project visibility.
* Project ownership.
* Update permissions.
* Delete permissions.
* Status update permissions.

Unauthorized requests are rejected before database access.

---

# Database Validation

Before write operations:

* Project existence is verified.
* Workspace existence is verified.
* Soft deleted projects are excluded.
* Foreign key relationships are validated.

---

# Transaction Validation

The following operations execute inside a single database transaction:

* Create Project
* Update Project
* Delete Project
* Update Project Status

If any step fails:

* Entire transaction is rolled back.
* No partial updates occur.
* No inconsistent audit records are created.

---

# Standard Error Response

Every failed request follows the same response structure.

```json
{
  "success": false,
  "message": "Project not found.",
  "code": "PROJECT_NOT_FOUND"
}
```

---

# Common Error Codes

| HTTP Status | Error Code                        | Description                  |
| ----------- | --------------------------------- | ---------------------------- |
| 400         | INVALID_PROJECT_TITLE             | Invalid project title        |
| 400         | INVALID_PROJECT_DESCRIPTION       | Invalid project description  |
| 400         | INVALID_ESTIMATED_BUDGET          | Invalid estimated budget     |
| 400         | INVALID_ESTIMATED_DURATION        | Invalid estimated duration   |
| 400         | INVALID_PROJECT_DATES             | Invalid expected dates       |
| 400         | INVALID_PROJECT_STATUS_TRANSITION | Invalid lifecycle transition |
| 400         | PROJECT_NOT_EDITABLE              | Project cannot be edited     |
| 401         | UNAUTHORIZED                      | Authentication required      |
| 403         | INSUFFICIENT_PERMISSIONS          | Permission denied            |
| 404         | WORKSPACE_NOT_FOUND               | Workspace not found          |
| 404         | PROJECT_NOT_FOUND                 | Project not found            |

> Replace the error code names above with the exact constants defined in your `ErrorCodes.ts` file if they differ.

---

# Validation Principles

The Project Module follows these principles:

* Validate as early as possible.
* Reject invalid input before business logic execution.
* Centralize business validation inside validators.
* Centralize authorization inside the permission service.
* Keep controllers free of validation logic.
* Keep repositories free of business rules.
* Ensure transactional consistency for every write operation.
* Return consistent error responses across all endpoints.
