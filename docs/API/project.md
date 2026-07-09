# Phase 1 — Module Overview

# Project Module

## Overview

The Project Module is responsible for managing the complete lifecycle of professional projects within a workspace.

A Project represents the existence of work being executed between professionals. It acts as the parent entity for the Agreement Module and future modules such as Milestones, Deliverables, Invoices, Payments, Activity Tracking, and Notifications.

The Project Module is intentionally independent of contractual information. It manages project identity, ownership, lifecycle, authorization, audit logging, Redis caching, pagination, searching, filtering, sorting, and soft deletion, while delegating all commercial and contractual information to the Agreement Module.

Every Project is associated with exactly one Agreement, which is created as part of the same database transaction.

---

# Objectives

* Allow workspace members to create professional projects.
* Maintain a clear separation between project lifecycle and contractual information.
* Allow Workspace Owners and Admins to view all projects within a workspace.
* Allow Members to view only the projects they have created.
* Restrict project modification to the project creator.
* Maintain a complete audit trail for every project operation.
* Support efficient retrieval using pagination, searching, filtering, and sorting.
* Improve read performance through Redis caching.
* Preserve historical data using soft deletion.
* Prepare transactional integration with the Agreement Module.

---

# Responsibilities

## Project Module Owns

* Project identity
* Workspace ownership
* Project ownership
* Project lifecycle
* Project visibility
* Authorization
* Audit logging
* Soft deletion

---

## Agreement Module Owns

* Budget
* Timeline
* Scope of work
* Deliverables
* Agreement participants
* Acceptance criteria
* Commercial terms

The Project Module never stores or manages contractual information.

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

Every project is created in the **DRAFT** state.

Project activation is controlled by the Agreement Module after the agreement has been successfully signed.

Manual activation is not supported.

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
* View audit history of projects they have access to.

---

## Validation

Business validation includes:

* Project title validation.
* Project description validation.
* Project status transition validation.

Contract-related validation is handled exclusively by the Agreement Module.

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

Audit records provide complete historical traceability throughout the lifecycle of a project.

---

# Project–Agreement Relationship

Each Project owns exactly one Agreement.

Relationship:

```text
Project (1)
      │
      │
      ▼
Agreement (1)
```

Business rules:

* A Project cannot exist without an Agreement.
* An Agreement cannot exist without a Project.
* Agreement creation is performed within the same database transaction as Project creation.

---

# Pagination, Search & Filtering

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
* Updated Date
* Project Title

Both ascending and descending ordering are supported.

---

# Redis Caching

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

# Soft Deletion

Projects are never permanently removed.

Deleting a project:

* Marks the project as deleted.
* Preserves audit history.
* Excludes the project from normal queries.
* Allows historical records to remain intact.

---

# Performance Optimizations

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

# Design Principles

The module follows the same architectural principles as the rest of the backend:

* Layered Architecture
* Repository Pattern
* Service Layer Pattern
* Transactional Business Logic
* Separation of Concerns
* Role-Based Access Control
* Cache-Aside Pattern
* Soft Delete Strategy
* Immutable Audit Trail
* Redis Read Caching
* Single Responsibility Principle

The Project Module is responsible only for project lifecycle management, while the Agreement Module is responsible for all contractual and commercial aspects of the engagement.


####################################################################################################################

# Phase 2 — System Architecture

## Architecture Overview

The Project Module follows the same layered architecture as every other module in the application.

Its responsibility is limited to managing project identity, ownership, lifecycle, authorization, audit logging, and retrieval.

The module intentionally does **not** manage contractual information. Instead, it is designed to integrate transactionally with the Agreement Module, which owns all commercial and contractual data.

Each layer has a single responsibility and communicates only with its adjacent layer, ensuring maintainability, scalability, and testability.

```text
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

All read operations follow the **Cache-Aside Pattern**.

```text
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

Every write operation executes inside a Prisma transaction.

Current implementation:

```text
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
Create / Update Project
   │
   ▼
Create Audit Log
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

---

## Future Project Creation Flow

The Project Module is already prepared for Agreement integration.

The final transactional flow will become:

```text
BEGIN TRANSACTION
        │
        ▼
Create Project
        │
        ▼
Create Draft Agreement
        │
        ▼
Create Agreement Participants
        │
        ▼
Create Project Audit
        │
        ▼
COMMIT
```

If any operation fails:

```text
ROLLBACK ENTIRE TRANSACTION
```

This guarantees that a Project and its Agreement are always created together.

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

* Parsing HTTP requests.
* DTO validation.
* Reading from Redis cache.
* Invoking services.
* Returning API responses.
* Populating Redis cache.

Controllers never communicate directly with the database.

---

## Services

Responsible for all business logic.

Responsibilities include:

* Project lifecycle management.
* Authorization orchestration.
* Business validation.
* Transaction orchestration.
* Audit log creation.
* Repository coordination.
* Preparing transactional hooks for Agreement creation.

Services never perform HTTP-related operations.

---

## Permission Service

Responsible for authorization.

Validates:

* Workspace membership.
* Project visibility.
* Project ownership.
* Update permissions.
* Delete permissions.
* Status update permissions.

Permission logic is centralized to avoid duplication.

---

## Validator Layer

Responsible for business validation.

Validation includes:

* Project title.
* Project description.
* Project status transitions.

Contractual validation is intentionally excluded and belongs to the Agreement Module.

---

## Repository Layer

Responsible only for persistence.

Responsibilities include:

* CRUD operations.
* Pagination.
* Searching.
* Filtering.
* Sorting.
* Soft deletion.
* Workspace membership lookup.

Repositories contain no business rules.

---

## Mapper Layer

Responsible for converting Prisma entities into API response objects.

Benefits include:

* Consistent API responses.
* Encapsulation of database models.
* Prevention of accidental exposure of internal fields.

---

## Redis Cache Layer

The Project Module caches frequently accessed read operations.

### Cached Resources

* Individual Projects
* Workspace Project Listings
* Project Audit Logs

---

### Cache Keys

```text
project:{projectId}

workspace:{workspaceId}:projects:{queryHash}

project:{projectId}:audits:{queryHash}
```

---

### Cache Strategy

The Project Module follows the **Cache-Aside Pattern**.

* Read Redis first.
* Query PostgreSQL on cache miss.
* Store response in Redis.
* Serve cached responses on subsequent requests.

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

The following operations execute inside a single transaction:

* Create Project
* Update Project
* Delete Project
* Update Project Status

Future versions will extend the Create Project transaction to include Agreement creation without changing the Project architecture.

---

# Architectural Boundaries

## Project Module Owns

* Project identity
* Project ownership
* Lifecycle
* Authorization
* Audit logging
* Soft deletion

---

## Agreement Module Owns

* Budget
* Timeline
* Scope
* Deliverables
* Participants
* Acceptance criteria
* Commercial terms

The Project Module never stores or validates contractual information.

---

# Design Principles

The Project Module adheres to:

* Layered Architecture
* Repository Pattern
* Service Layer Pattern
* Cache-Aside Pattern
* Transactional Consistency
* Separation of Concerns
* Single Responsibility Principle
* Role-Based Authorization
* Immutable Audit Logging
* Redis Read Caching
* Soft Delete Strategy

The architecture is intentionally designed so that future modules, beginning with the Agreement Module, can be integrated without requiring structural changes to the Project Module.

####################################################################################################################

# Phase 3 — Database Design

## Overview

The Project Module introduces two primary entities:

* Project
* Project Audit

A Project represents the existence of professional work within a workspace.

It is intentionally lightweight and stores only project identity, ownership, and lifecycle information.

Every Project owns exactly one Agreement, while every significant project operation generates an immutable audit record for complete traceability.

---

# Entity Relationship Diagram

```text id="3gbk42"
Workspace
    │
    │
    ▼
 Project
    │
    ├──────────────┐
    │              │
    ▼              ▼
Agreement     ProjectAudit
                  ▲
                  │
                  │
                 User
```

---

# Core Relationships

## Workspace → Project

Relationship

```text id="m7hk3j"
One Workspace
      │
      ▼
Many Projects
```

Every Project belongs to exactly one Workspace.

A Workspace may contain multiple Projects.

---

## User → Project

Relationship

```text id="vu1pwr"
One User
      │
      ▼
Many Projects
```

Every Project has exactly one creator.

A user may create multiple projects.

---

## Project → Agreement

Relationship

```text id="nprkvj"
Project (1)
      │
      ▼
Agreement (1)
```

Business Rules

* Every Project owns exactly one Agreement.
* Every Agreement belongs to exactly one Project.
* Agreement references Project using:

```text id="afn1m5"
Agreement.projectId (UNIQUE)
```

The Project table does **not** contain an `agreementId`.

Agreement creation occurs within the same database transaction as Project creation.

---

## Project → Project Audit

Relationship

```text id="gy41ci"
One Project
      │
      ▼
Many Audit Logs
```

Every significant project operation creates a new immutable audit record.

Audit history is never modified or deleted.

---

## User → Project Audit

Relationship

```text id="nq5qgs"
One User
      │
      ▼
Many Audit Logs
```

Each audit entry records the user responsible for performing the action.

---

# Project Table

| Column      | Type      | Description                  |
| ----------- | --------- | ---------------------------- |
| id          | UUID      | Primary Key                  |
| workspaceId | UUID      | Parent Workspace             |
| createdById | UUID      | Project Creator              |
| title       | String    | Project title                |
| description | String?   | Optional project description |
| status      | Enum      | Project lifecycle            |
| createdAt   | DateTime  | Creation timestamp           |
| updatedAt   | DateTime  | Last modification timestamp  |
| deletedAt   | DateTime? | Soft delete timestamp        |

The Project entity intentionally excludes all contractual information.

---

# Agreement Ownership

The following information is **not stored** in the Project table:

* Budget
* Timeline
* Expected Start Date
* Expected Completion Date
* Deliverables
* Scope of Work
* Acceptance Criteria
* Participants

These fields belong exclusively to the Agreement Module.

---

# Project Status Enum

```text id="m5b9wd"
DRAFT

ACTIVE

COMPLETED

MUTUALLY_TERMINATED

CANCELLED
```

Business Rules

* Every Project starts as `DRAFT`.
* Projects cannot be manually activated.
* Agreement signing is responsible for transitioning the Project to `ACTIVE`.
* Completed, Cancelled, and Mutually Terminated projects are terminal states.

---

# Project Audit Table

| Column    | Type     | Description                |
| --------- | -------- | -------------------------- |
| id        | UUID     | Primary Key                |
| projectId | UUID     | Related Project            |
| actorId   | UUID     | User performing the action |
| action    | Enum     | Audit action               |
| metadata  | JSON     | Additional metadata        |
| createdAt | DateTime | Audit timestamp            |

Audit records are immutable.

---

# Project Audit Actions

```text id="ddkhps"
CREATED

UPDATED

STATUS_CHANGED

DELETED
```

---

# Foreign Key Constraints

## Project

| Column      | References   | On Delete |
| ----------- | ------------ | --------- |
| workspaceId | Workspace.id | RESTRICT  |
| createdById | User.id      | RESTRICT  |

---

## Agreement

| Column    | References | On Delete                     |
| --------- | ---------- | ----------------------------- |
| projectId | Project.id | CASCADE (Unique Relationship) |

---

## Project Audit

| Column    | References | On Delete |
| --------- | ---------- | --------- |
| projectId | Project.id | CASCADE   |
| actorId   | User.id    | RESTRICT  |

---

# Database Indexes

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

Projects are never physically deleted.

Deletion updates only:

```text id="l4l8eg"
deletedAt = Current Timestamp
```

All repository queries automatically exclude deleted records.

```sql id="lk2jji"
WHERE deletedAt IS NULL
```

Benefits include:

* Historical preservation
* Complete audit history
* Future restoration capability
* Referential integrity

---

# Transactional Consistency

Project creation is designed for transactional expansion.

Current transaction:

```text id="9ptwte"
Create Project
      │
      ▼
Create Project Audit
```

Future transaction:

```text id="i9pxea"
Create Project
      │
      ▼
Create Agreement
      │
      ▼
Create Agreement Participants
      │
      ▼
Create Project Audit
```

The entire transaction succeeds or fails as a single atomic operation.

---

# Data Integrity Rules

The Project Module guarantees:

* Every Project belongs to a valid Workspace.
* Every Project has exactly one creator.
* Every Project owns exactly one Agreement.
* Every Agreement belongs to exactly one Project.
* Every audit record belongs to a valid Project.
* Every audit record records the acting user.
* Deleted Projects remain available for audit history.
* Invalid lifecycle transitions are rejected.
* Project updates and deletions are restricted to the Project creator.
* Workspace Owners and Admins can view all Projects.
* Workspace Members can view only Projects they created.
* Contractual information is never stored in the Project entity.

####################################################################################################################

# Phase 4 — Business Rules & Authorization

# Overview

The Project Module enforces business rules that govern project ownership, lifecycle, visibility, authorization, and transactional consistency.

A Project represents professional work only.

All contractual and commercial information belongs exclusively to the Agreement Module.

---

# Project Ownership

## Project Creator

Every project has exactly one creator.

The creator is recorded using:

```text
createdById
```

The creator remains unchanged throughout the lifetime of the project.

Project ownership cannot be transferred.

---

## Workspace Ownership

Every project belongs to exactly one workspace.

Relationship

```text
Workspace (1)
      │
      ▼
Project (N)
```

Projects cannot be moved between workspaces.

---

# Project Lifecycle

Supported lifecycle states:

```text
DRAFT

ACTIVE

COMPLETED

MUTUALLY_TERMINATED

CANCELLED
```

---

## Initial State

Every newly created project starts as:

```text
DRAFT
```

No other initial status is allowed.

---

## Lifecycle Rules

### DRAFT

A project has been created but work has not officially started.

Characteristics

* Project exists.
* Agreement is still being prepared or negotiated.
* No contractual obligations are active.
* Project information may still be updated.

---

### ACTIVE

A project becomes active only after its Agreement has been signed.

Manual activation is not permitted.

Future flow

```text
Agreement Signed
        │
        ▼
Project Status
        │
        ▼
ACTIVE
```

The Project Module is prepared for this integration.

---

### COMPLETED

Represents successful completion of the project.

No further status changes are allowed.

---

### MUTUALLY_TERMINATED

Represents termination by mutual agreement.

No further status changes are allowed.

---

### CANCELLED

Represents cancellation before work begins.

No further status changes are allowed.

---

# Allowed Status Transitions

```text
DRAFT
 ├────────► ACTIVE
 └────────► CANCELLED

ACTIVE
 ├────────► COMPLETED
 └────────► MUTUALLY_TERMINATED
```

---

# Invalid Status Transitions

The following transitions are rejected.

```text
ACTIVE
        │
        ▼
DRAFT

COMPLETED
        │
        ▼
Any Status

CANCELLED
        │
        ▼
Any Status

MUTUALLY_TERMINATED
        │
        ▼
Any Status

DRAFT
        │
        ▼
COMPLETED

DRAFT
        │
        ▼
MUTUALLY_TERMINATED
```

Rejected requests return a business validation error.

---

# Agreement Integration Rules

Every Project must own exactly one Agreement.

Relationship

```text
Project (1)
      │
      ▼
Agreement (1)
```

Business Rules

* Project cannot exist without an Agreement.
* Agreement cannot exist without a Project.
* Agreement references Project using a unique `projectId`.
* Project does not contain an `agreementId`.

Agreement creation will occur inside the same transaction as Project creation.

---

# Project Responsibilities

The Project Module owns only:

* Project identity
* Workspace ownership
* Project ownership
* Project lifecycle
* Authorization
* Audit history

---

# Agreement Responsibilities

The Agreement Module owns:

* Scope of work
* Budget
* Timeline
* Deliverables
* Participants
* Acceptance criteria
* Commercial terms

These responsibilities never overlap.

---

# Authorization Model

Authorization is enforced using the `ProjectPermissionService`.

---

## Workspace Owner

Permissions

* Create Project
* View all Projects
* View Project Details
* View Audit Logs

Project ownership is still respected.

Owners cannot edit or delete projects created by other users.

---

## Workspace Admin

Permissions

* Create Project
* View all Projects
* View Project Details
* View Audit Logs

Admins cannot edit or delete projects they did not create.

---

## Workspace Member

Permissions

* Create Project
* View own Projects
* View own Project Details
* Update own Projects
* Delete own Projects
* View Audit Logs for accessible Projects

---

# Project Creation Rules

Project creation requires:

* Authenticated user
* Valid workspace membership
* Valid project title
* Valid project description

Future transactional flow

```text
BEGIN TRANSACTION
        │
        ▼
Create Project
        │
        ▼
Create Draft Agreement
        │
        ▼
Create Agreement Participants
        │
        ▼
Create Project Audit
        │
        ▼
COMMIT
```

Failure of any step results in a complete rollback.

---

# Project Update Rules

Only the Project creator may update a project.

Editable fields

* Title
* Description

The following cannot be updated through the Project Module:

* Budget
* Timeline
* Scope
* Deliverables
* Participants
* Acceptance criteria

These belong to the Agreement Module.

---

# Project Deletion Rules

Deletion is implemented as a soft delete.

Deletion:

* Sets `deletedAt`
* Preserves audit history
* Preserves Agreement relationship
* Removes the project from active queries

Only the Project creator may delete a project.

---

# Project Visibility Rules

Workspace Owner

* Can view every project in the workspace.

Workspace Admin

* Can view every project in the workspace.

Workspace Member

* Can view only projects they created.

---

# Audit Logging Rules

Every significant operation generates an immutable audit entry.

Recorded events:

* Project Created
* Project Updated
* Project Status Changed
* Project Deleted

Each audit record stores:

* Project
* Actor
* Action
* Metadata
* Timestamp

Audit records cannot be modified or deleted.

---

# Business Validation Rules

Project title

* Required
* Trimmed before storage
* Must satisfy configured length constraints

Project description

* Optional
* Trimmed before storage
* Must satisfy configured maximum length

Project status

* Must follow allowed lifecycle transitions
* Invalid transitions are rejected

Contractual validation is intentionally excluded from the Project Module.

---

# Soft Delete Rules

Projects are never permanently removed.

Repository queries automatically exclude:

```sql
deletedAt IS NOT NULL
```

Historical data remains available for:

* Audit history
* Reporting
* Future restoration

---

# Business Principles

The Project Module follows these principles:

* A Project represents work, not a contract.
* Commercial information belongs exclusively to the Agreement Module.
* Authorization is centralized.
* Business validation is centralized.
* Audit history is immutable.
* Every write operation is transactional.
* Redis caching improves read performance.
* Soft deletion preserves historical integrity.
* Project and Agreement maintain a mandatory one-to-one relationship.

####################################################################################################################

# Phase 5 — REST API Specification

## Overview

The Project Module exposes RESTful APIs for managing projects, project lifecycle, and project audit history.

All endpoints require authentication using a valid JWT Access Token.

---

# Base URL

```text id="r2t81d"
/api/v1/project
```

---

# Authentication

Every request must include:

```text id="7c4z6e"
Authorization: Bearer <ACCESS_TOKEN>
```

Unauthenticated requests return:

```http id="hh8jhm"
401 Unauthorized
```

---

# Create Project

## Endpoint

```text id="rtn9oq"
POST /workspaces/:workspaceId/projects
```

## Description

Creates a new project inside the specified workspace.

The project is always created in the **DRAFT** state.

Agreement creation is prepared to occur within the same transaction in the Agreement Module.

---

## Authorization

Authenticated Workspace Member

---

## Path Parameters

| Parameter   | Type | Description          |
| ----------- | ---- | -------------------- |
| workspaceId | UUID | Workspace Identifier |

---

## Request Body

```json id="jlwmwr"
{
  "title": "Portfolio Website",
  "description": "Personal client project"
}
```

---

## Success Response

**201 Created**

```json id="m4wzms"
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "uuid",
    "workspaceId": "uuid",
    "createdById": "uuid",
    "title": "Portfolio Website",
    "description": "Personal client project",
    "status": "DRAFT",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

# Get Workspace Projects

## Endpoint

```text id="0d2wqs"
GET /workspaces/:workspaceId/projects
```

---

## Description

Returns paginated projects visible to the authenticated user.

Workspace Owners and Admins receive every project.

Workspace Members receive only projects they created.

---

## Authorization

Authenticated Workspace Member

---

## Query Parameters

| Parameter | Type   | Default   | Description                |
| --------- | ------ | --------- | -------------------------- |
| page      | Number | 1         | Page Number                |
| limit     | Number | 20        | Page Size                  |
| search    | String | —         | Search Title & Description |
| status    | Enum   | —         | Filter by Status           |
| sort      | Enum   | createdAt | Sort Field                 |
| order     | Enum   | desc      | asc / desc                 |

---

## Supported Sort Fields

```text id="5wzb4s"
createdAt

updatedAt

title

status
```

---

## Example

```text id="ayymnj"
GET /workspaces/{workspaceId}/projects?page=1&limit=20&status=ACTIVE&search=website&sort=createdAt&order=desc
```

---

## Success Response

```json id="v7gr1d"
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

```text id="6j07ea"
GET /projects/:projectId
```

---

## Description

Returns complete information for a single project.

---

## Authorization

Authenticated user with access to the project.

---

## Path Parameters

| Parameter | Type |
| --------- | ---- |
| projectId | UUID |

---

## Success Response

```json id="2zwj91"
{
  "success": true,
  "data": {
    "id": "...",
    "workspaceId": "...",
    "createdById": "...",
    "title": "...",
    "description": "...",
    "status": "ACTIVE"
  }
}
```

---

# Update Project

## Endpoint

```text id="8gtsv8"
PATCH /projects/:projectId
```

---

## Description

Updates editable project information.

Only project metadata can be modified.

Contractual information is managed by the Agreement Module.

---

## Authorization

Project Creator

---

## Request Body

```json id="w13jb2"
{
  "title": "Updated Project Title",
  "description": "Updated description"
}
```

---

## Success Response

```json id="ifz1pi"
{
  "success": true,
  "message": "Project updated successfully.",
  "data": {}
}
```

---

# Delete Project

## Endpoint

```text id="jlwm0g"
DELETE /projects/:projectId
```

---

## Description

Soft deletes a project.

Deleted projects are excluded from active queries while preserving historical records.

---

## Authorization

Project Creator

---

## Success Response

```json id="qyxwzo"
{
  "success": true,
  "message": "Project deleted successfully."
}
```

---

# Update Project Status

## Endpoint

```text id="klxg4g"
PATCH /projects/:projectId/status
```

---

## Description

Updates the lifecycle status of a project.

This endpoint exists for lifecycle management, but **ACTIVE** is intended to be set automatically after Agreement signing.

---

## Authorization

Project Creator

---

## Request Body

```json id="pq1qvg"
{
  "status": "COMPLETED"
}
```

---

## Allowed Statuses

```text id="ffjlwm"
DRAFT

ACTIVE

COMPLETED

MUTUALLY_TERMINATED

CANCELLED
```

---

## Lifecycle

```text id="tjqz2x"
DRAFT
 ├────► ACTIVE
 └────► CANCELLED

ACTIVE
 ├────► COMPLETED
 └────► MUTUALLY_TERMINATED
```

---

## Success Response

```json id="tqb8m5"
{
  "success": true,
  "message": "Project status updated successfully.",
  "data": {}
}
```

---

# Get Project Audit Logs

## Endpoint

```text id="4jlwmv"
GET /projects/:projectId/audits
```

---

## Description

Returns paginated audit history for a project.

---

## Authorization

Authenticated user with access to the project.

---

## Query Parameters

| Parameter | Type   | Default | Description            |
| --------- | ------ | ------- | ---------------------- |
| page      | Number | 1       | Page Number            |
| limit     | Number | 20      | Records Per Page       |
| action    | Enum   | —       | Filter by Audit Action |
| order     | Enum   | desc    | asc / desc             |

---

## Example

```text id="czhkgx"
GET /projects/{projectId}/audits?page=1&limit=20&action=UPDATED
```

---

## Success Response

```json id="jlwmgc"
{
  "success": true,
  "data": {
    "audits": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2,
      "hasNext": true
    }
  }
}
```

---

# API Permissions

| Endpoint                | Member              | Admin        | Owner        |
| ----------------------- | ------------------- | ------------ | ------------ |
| Create Project          | ✅                   | ✅            | ✅            |
| List Workspace Projects | Own Projects        | All Projects | All Projects |
| Get Project             | Accessible Projects | All Projects | All Projects |
| Update Project          | Creator Only        | Creator Only | Creator Only |
| Delete Project          | Creator Only        | Creator Only | Creator Only |
| Update Status           | Creator Only        | Creator Only | Creator Only |
| View Audit Logs         | Accessible Projects | All Projects | All Projects |

---

# Redis Cached Endpoints

The following endpoints are cached using Redis.

| Endpoint                              | Cache |
| ------------------------------------- | ----- |
| GET /projects/:projectId              | ✅     |
| GET /workspaces/:workspaceId/projects | ✅     |
| GET /projects/:projectId/audits       | ✅     |

Cache is automatically invalidated after:

* Project Creation
* Project Update
* Project Deletion
* Project Status Change

---

# HTTP Status Codes

| Status | Description           |
| ------ | --------------------- |
| 200    | Request Successful    |
| 201    | Resource Created      |
| 400    | Validation Error      |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Resource Not Found    |
| 409    | Conflict              |
| 500    | Internal Server Error |

---

# Future Agreement Integration

Project creation is designed for transactional expansion.

Future flow:

```text id="r3k8v5"
BEGIN TRANSACTION
        │
        ▼
Create Project
        │
        ▼
Create Draft Agreement
        │
        ▼
Create Agreement Participants
        │
        ▼
Create Project Audit
        │
        ▼
COMMIT
```

This guarantees that a Project and its Agreement are always created together as a single atomic operation.

####################################################################################################################

# Phase 6 — Caching, Pagination & Performance

# Overview

The Project Module is optimized for scalable read performance using Redis caching, server-side pagination, database-level searching, filtering, sorting, and transactional database operations.

These optimizations reduce PostgreSQL load, improve response times, and ensure consistent performance as the number of workspaces and projects grows.

---

# Redis Caching

The Project Module follows the **Cache-Aside Pattern**.

For every supported read endpoint:

```text id="x4z2jm"
Request
    │
    ▼
Check Redis
    │
    ├──────── Cache Hit ───────► Return Cached Response
    │
    └──────── Cache Miss
                 │
                 ▼
         Query PostgreSQL
                 │
                 ▼
        Store Result in Redis
                 │
                 ▼
          Return Response
```

This minimizes repeated database queries for frequently accessed data.

---

# Cached Resources

## Single Project

Endpoint

```text id="5nx2ci"
GET /projects/:projectId
```

Cache Key

```text id="3nkqpl"
project:{projectId}
```

Purpose

* Fast project retrieval.
* Reduce repeated database lookups.

---

## Workspace Project List

Endpoint

```text id="ldl8s3"
GET /workspaces/:workspaceId/projects
```

Cache Key

```text id="4bljcw"
workspace:{workspaceId}:projects:{queryHash}
```

The query hash uniquely represents:

* Page
* Limit
* Search
* Status
* Sort
* Order

Example

```text id="vsd2wa"
workspace:abc123:projects:{"page":1,"limit":20,"status":"ACTIVE","sort":"createdAt"}
```

Each unique query has its own cache entry.

---

## Project Audit Logs

Endpoint

```text id="6kjjvw"
GET /projects/:projectId/audits
```

Cache Key

```text id="j3mdji"
project:{projectId}:audits:{queryHash}
```

---

# Cache Expiration

All Project Module cache entries use:

```text id="2sdp1h"
TTL = 10 Minutes
```

Expired entries are automatically removed by Redis.

---

# Cache Invalidation Strategy

To maintain consistency between Redis and PostgreSQL, cache entries are invalidated immediately after successful write operations.

---

## Create Project

Invalidates

* Workspace Project List Cache

Reason

A newly created project changes the workspace listing.

---

## Update Project

Invalidates

* Single Project Cache
* Workspace Project List Cache
* Project Audit Cache

Reason

Project information and audit history have changed.

---

## Delete Project

Invalidates

* Single Project Cache
* Workspace Project List Cache
* Project Audit Cache

Reason

Deleted projects should no longer appear in active queries.

---

## Update Project Status

Invalidates

* Single Project Cache
* Workspace Project List Cache
* Project Audit Cache

Reason

Lifecycle changes affect both project data and audit history.

---

# Pagination

Workspace Project Listing and Project Audit Listing both support server-side pagination.

Supported Parameters

| Parameter | Description         |
| --------- | ------------------- |
| page      | Current page number |
| limit     | Records per page    |

Pagination is executed directly by PostgreSQL using:

* OFFSET
* LIMIT

This prevents loading unnecessary records into memory.

---

# Pagination Response

Every paginated endpoint returns:

```json id="gljlwm"
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 86,
    "totalPages": 5,
    "hasNext": true
  }
}
```

---

# Search

Workspace projects support case-insensitive searching.

Searchable Fields

* Project Title
* Project Description

Searching is executed directly by PostgreSQL.

---

# Filtering

Projects can be filtered using:

* Project Status

Audit logs can be filtered using:

* Audit Action

Filtering is performed entirely at the database level.

---

# Sorting

Supported Project Sort Fields

* Created Date
* Updated Date
* Project Title
* Project Status

Supported Ordering

* Ascending
* Descending

Sorting is performed by PostgreSQL.

---

# Soft Delete Performance

Projects are never physically removed.

Instead,

```text id="mejlwm"
deletedAt = Current Timestamp
```

Every repository query automatically excludes deleted records.

```sql id="jlwmux"
WHERE deletedAt IS NULL
```

Benefits

* Historical preservation
* Fast active queries
* Audit integrity
* Future recovery support

---

# Database Transactions

Every write operation executes inside a Prisma transaction.

Current transactional operations

* Create Project
* Update Project
* Delete Project
* Update Project Status

This guarantees

* Atomic writes
* Consistent audit logs
* Automatic rollback on failure
* Database integrity

---

# Future Transaction Expansion

The Project Module is prepared for Agreement integration.

Future project creation flow:

```text id="j4vhp1"
BEGIN TRANSACTION
        │
        ▼
Create Project
        │
        ▼
Create Draft Agreement
        │
        ▼
Create Agreement Participants
        │
        ▼
Create Project Audit
        │
        ▼
COMMIT
```

Any failure results in:

```text id="v7jlwm"
ROLLBACK
```

---

# Performance Optimizations

The Project Module includes:

* Redis Cache-Aside Pattern
* Automatic cache invalidation
* Server-side pagination
* Database-level searching
* Database-level filtering
* Database-level sorting
* Transactional database writes
* Immutable audit logging
* Soft delete strategy

---

# Scalability Considerations

The module is designed to scale efficiently by:

* Reducing database reads through Redis.
* Caching frequently accessed resources.
* Paginating large datasets.
* Executing search, filtering, and sorting within PostgreSQL.
* Invalidating only affected cache entries.
* Maintaining a lightweight Project entity by delegating contractual data to the Agreement Module.
* Preparing transactional integration with future modules without architectural changes.

The Project Module remains focused on project identity and lifecycle, enabling future modules such as Agreement, Milestones, Deliverables, Invoices, and Payments to scale independently while maintaining transactional consistency.

####################################################################################################################

# Phase 7 — Error Handling & Validation

# Overview

The Project Module follows a multi-layer validation strategy to ensure every request is authenticated, authorized, validated, and executed safely before any database changes occur.

Validation is performed at multiple layers to maintain data integrity, enforce business rules, and guarantee transactional consistency.

---

# Validation Flow

```text id="mk4c9p"
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
Audit Logging
      │
      ▼
Cache Invalidation
      │
      ▼
Success Response
```

Each validation layer must succeed before the next layer is executed.

---

# Authentication Validation

All Project Module endpoints require a valid JWT Access Token.

Authentication is performed before any controller logic executes.

If authentication fails:

* Request processing stops immediately.
* No business logic is executed.
* No database transaction begins.
* No cache operations occur.

Possible authentication failures include:

* Missing Access Token
* Invalid Token
* Expired Token

---

# DTO Validation

Incoming requests are validated using Zod schemas before reaching the service layer.

---

## Create Project

Validated fields:

* title
* description

Only these fields are accepted.

Project lifecycle and ownership are assigned internally.

---

## Update Project

Validated fields:

* title
* description

Only project metadata may be updated.

Contractual information is intentionally excluded.

---

## Update Project Status

Validated field:

* status

The supplied status must be a valid `ProjectStatus` enum value.

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

After DTO validation succeeds, business rules are enforced.

---

## Project Title

Rules

* Required during creation.
* Automatically trimmed.
* Must satisfy configured minimum length.
* Must satisfy configured maximum length.

---

## Project Description

Rules

* Optional.
* Automatically trimmed.
* Must satisfy configured maximum length.

---

## Project Lifecycle

Projects always begin as:

```text id="jlwm81"
DRAFT
```

Clients cannot choose the initial lifecycle state.

---

## Status Transition Validation

Only approved lifecycle transitions are accepted.

Allowed transitions

```text id="jlwm82"
DRAFT
 ├────────► ACTIVE
 └────────► CANCELLED

ACTIVE
 ├────────► COMPLETED
 └────────► MUTUALLY_TERMINATED
```

Rejected transitions include:

* ACTIVE → DRAFT
* COMPLETED → Any State
* CANCELLED → Any State
* MUTUALLY_TERMINATED → Any State
* DRAFT → COMPLETED
* DRAFT → MUTUALLY_TERMINATED

Projects in terminal states cannot transition further.

---

# Agreement Responsibility Validation

The Project Module intentionally rejects responsibility for contractual information.

The following are not validated by the Project Module:

* Budget
* Timeline
* Scope
* Deliverables
* Participants
* Acceptance Criteria
* Commercial Terms

These validations belong exclusively to the Agreement Module.

---

# Permission Validation

Authorization is centralized inside the `ProjectPermissionService`.

Permission validation includes:

* Workspace membership.
* Project visibility.
* Project ownership.
* Update permission.
* Delete permission.
* Status update permission.
* Audit log visibility.

Unauthorized requests are rejected before database access.

---

# Database Validation

Before write operations, the module verifies:

* Workspace exists.
* Project exists.
* Project has not been soft deleted.
* User has access.
* Foreign key integrity.

Invalid resources immediately terminate the request.

---

# Transaction Validation

Every write operation executes inside a Prisma transaction.

Current transactional operations:

* Create Project
* Update Project
* Delete Project
* Update Project Status

If any operation fails:

```text id="jlwm83"
ROLLBACK ENTIRE TRANSACTION
```

This prevents:

* Partial writes.
* Missing audit records.
* Inconsistent project state.
* Cache inconsistency.

---

# Future Transaction Expansion

The transaction is prepared for Agreement integration.

Future flow:

```text id="jlwm84"
BEGIN TRANSACTION
        │
        ▼
Create Project
        │
        ▼
Create Draft Agreement
        │
        ▼
Create Agreement Participants
        │
        ▼
Create Audit Record
        │
        ▼
COMMIT
```

If Agreement creation fails:

```text id="jlwm85"
ROLLBACK
```

The Project and Agreement will always remain consistent.

---

# Standard Error Response

Every failed request follows a consistent response format.

```json id="jlwm86"
{
  "success": false,
  "message": "Project not found.",
  "code": "PROJECT_NOT_FOUND"
}
```

---

# Common Error Codes

| HTTP Status | Error Code                        | Description                      |
| ----------- | --------------------------------- | -------------------------------- |
| 400         | INVALID_PROJECT_TITLE             | Invalid project title            |
| 400         | INVALID_PROJECT_DESCRIPTION       | Invalid project description      |
| 400         | INVALID_PROJECT_STATUS_TRANSITION | Invalid lifecycle transition     |
| 400         | PROJECT_NOT_EDITABLE              | Project cannot be modified       |
| 401         | UNAUTHORIZED                      | Authentication required          |
| 403         | INSUFFICIENT_PERMISSIONS          | Permission denied                |
| 404         | WORKSPACE_NOT_FOUND               | Workspace does not exist         |
| 404         | PROJECT_NOT_FOUND                 | Project does not exist           |
| 409         | PROJECT_ALREADY_DELETED           | Project has already been deleted |
| 500         | INTERNAL_SERVER_ERROR             | Unexpected server error          |

Replace these with the exact error code constants defined in the application's `ErrorCodes.ts` if they differ.

---

# Cache Consistency

Validation failures never modify Redis.

Redis cache invalidation occurs only after successful transactional commits.

This guarantees:

* No stale cache entries.
* No cache invalidation on failed requests.
* Cache always reflects committed database state.

---

# Audit Validation

Audit records are created only after successful business operations.

Failed validations do not create audit entries.

Every audit record contains:

* Project Identifier
* Actor Identifier
* Action
* Metadata
* Timestamp

Audit records are immutable and cannot be modified.

---

# Validation Principles

The Project Module follows these design principles:

* Authenticate before processing.
* Validate request data before business logic.
* Centralize business validation in validators.
* Centralize authorization in the permission service.
* Keep controllers free of business rules.
* Keep repositories free of validation logic.
* Execute all write operations transactionally.
* Maintain cache consistency through post-commit invalidation.
* Keep Project responsibilities independent of contractual concerns.
* Delegate all commercial validation to the Agreement Module.

This layered validation strategy ensures the Project Module remains secure, consistent, maintainable, and ready for seamless integration with the Agreement Module.

####################################################################################################################

# Phase 8 — Project Transfer

# Overview

The Project Transfer feature allows a project to be moved from a **Personal Workspace** to a **Team Workspace**.

This feature supports the common workflow where an individual initially manages a project privately and later transitions it into a collaborative team environment.

Project transfer is intentionally restricted to preserve ownership, audit integrity, and workspace isolation.

---

# Business Motivation

Typical workflow:

```text id="jlwm901"
Personal Workspace
        │
        ▼
Create Project
        │
        ▼
Discuss Requirements
        │
        ▼
Need Team Collaboration
        │
        ▼
Transfer Project
        │
        ▼
Team Workspace
```

This enables a seamless transition from individual planning to collaborative execution.

---

# Supported Transfer

Only the following transfer is permitted:

```text id="jlwm902"
Personal Workspace
        │
        ▼
Team Workspace
```

---

# Unsupported Transfers

The following transfers are rejected.

## Team → Team

```text id="jlwm903"
Team Workspace A
        │
        ▼
Team Workspace B
```

Reason

Projects belong to the organizational context in which they were created.

---

## Team → Personal

```text id="jlwm904"
Team Workspace
        │
        ▼
Personal Workspace
```

Reason

Once collaboration begins, ownership and permissions should remain within the team.

---

## Personal → Personal

```text id="jlwm905"
Personal Workspace A
        │
        ▼
Personal Workspace B
```

Reason

A user owns only one personal workspace.

---

# Business Rules

A project can be transferred only when **all** of the following conditions are satisfied:

* Source workspace is `PERSONAL`.
* Destination workspace is `TEAM`.
* Project status is `DRAFT`.
* User is the Project creator.
* User is a member of the destination workspace.
* Project has not been soft deleted.

If any condition fails, the transfer is rejected.

---

# Project Status Restriction

Only projects in the following state may be transferred:

```text id="jlwm906"
DRAFT
```

Projects in these states cannot be transferred:

```text id="jlwm907"
ACTIVE

COMPLETED

MUTUALLY_TERMINATED

CANCELLED
```

This guarantees that active execution never changes organizational context.

---

# Data Changes

Only a single field is modified during transfer.

```text id="jlwm908"
workspaceId
```

The following remain unchanged:

* Project ID
* Project Title
* Description
* Created By
* Status
* Created Date
* Updated Date

The project retains its complete identity.

---

# Audit Logging

Every transfer creates an immutable audit record.

Audit Action

```text id="jlwm909"
UPDATED
```

Metadata

```json id="jlwm910"
{
  "type": "PROJECT_TRANSFER",
  "fromWorkspaceId": "...",
  "toWorkspaceId": "..."
}
```

This preserves transfer history without introducing a new database enum.

---

# Transaction Flow

Project transfer executes inside a single database transaction.

```text id="’wini911"
BEGIN TRANSACTION
        │
        ▼
Validate Project
        │
        ▼
Validate Source Workspace
        │
        ▼
Validate Destination Workspace
        │
        ▼
Validate Destination Membership
        │
        ▼
Validate Project Status
        │
        ▼
Update Project.workspaceId
        │
        ▼
Create Audit Record
        │
        ▼
COMMIT
```

If any validation or database operation fails:

```text id="’wini912"
ROLLBACK
```

No partial updates are persisted.

---

# Authorization

Only the Project creator may transfer a project.

Additional requirements:

* Creator must belong to the destination Team Workspace.
* Destination workspace must be accessible.
* Project must satisfy all transfer rules.

---

# REST API

## Endpoint

```text id="’wini913"
PATCH /projects/:projectId/transfer
```

---

## Authentication

JWT Access Token required.

---

## Request Body

```json id="’wini914"
{
  "destinationWorkspaceId": "workspace-uuid"
}
```

---

## Success Response

```json id="’wini915"
{
  "success": true,
  "message": "Project transferred successfully.",
  "data": {
    "id": "...",
    "workspaceId": "...",
    "createdById": "...",
    "title": "...",
    "description": "...",
    "status": "DRAFT"
  }
}
```

---

# Redis Cache Invalidation

A successful transfer invalidates:

* Source Workspace Project List Cache
* Destination Workspace Project List Cache
* Single Project Cache
* Project Audit Cache

This ensures that subsequent reads reflect the new workspace immediately.

---

# Error Scenarios

| Scenario                                      | Result            |
| --------------------------------------------- | ----------------- |
| Source workspace is not Personal              | Transfer rejected |
| Destination workspace is not Team             | Transfer rejected |
| User is not a member of destination workspace | Transfer rejected |
| Project is not in DRAFT state                 | Transfer rejected |
| Project not found                             | Transfer rejected |
| Workspace not found                           | Transfer rejected |

---

# Future Compatibility

The transfer feature is fully compatible with the finalized architecture.

It preserves:

* Project identity
* Agreement relationship
* Audit history
* Redis caching
* Authorization model
* Transactional consistency

Since the Project and Agreement maintain a mandatory one-to-one relationship, the associated Agreement continues to belong to the Project after transfer without requiring changes to the relationship itself.

---

# Design Principles

The Project Transfer feature follows these principles:

* Only Personal → Team transfers are allowed.
* Projects remain immutable after execution begins.
* Workspace changes are fully transactional.
* Audit history is preserved.
* Cache consistency is maintained.
* No Prisma schema changes are required.
* Existing architecture, repositories, services, controllers, and authorization remain unchanged.
