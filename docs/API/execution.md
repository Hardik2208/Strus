# Phase 1 — Module Overview

# Execution Module

## Purpose

The Execution Module is responsible for managing the complete execution lifecycle of a project after the agreement has been finalized.

It transforms a signed agreement into an executable work plan by defining milestones, assigning work to professionals, managing execution assets, tracking milestone progress, and maintaining a complete audit trail throughout project execution.

The module serves as the operational layer between contractual planning and actual project delivery.

---

# Objectives

- Convert an approved project into an executable plan.
- Organize work using professional-specific milestones.
- Support independent execution for multiple professionals.
- Track milestone progress throughout execution.
- Manage project assets shared with professionals.
- Enforce execution permissions.
- Maintain immutable execution history.
- Improve read performance using Redis caching.
- Support future execution features without architectural redesign.

---

# Responsibilities

The Execution Module is responsible for:

- Execution planning
- Milestone management
- Professional assignment
- Milestone scheduling
- Project asset management
- Asset visibility management
- Execution permissions
- Execution audit logging
- Cache management

---

# Out of Scope

The following responsibilities intentionally belong to other modules.

## Workspace Module

Responsible for:

- Workspaces
- Workspace Members
- Workspace Roles
- Workspace Invitations

---

## Project Module

Responsible for:

- Project creation
- Project lifecycle
- Project ownership
- Project status
- Project visibility

---

## Agreement Module

Responsible for:

- Commercial agreement
- Scope of work
- Budget
- Participants
- Professional invitations
- Contractual information

---

## Submission Module

Responsible for:

- Work submissions
- Submission reviews
- Revision requests
- Approval workflow

---

## Payment Module

Responsible for:

- Escrow
- Milestone payments
- Refunds
- Invoices
- Payouts

---

## Dispute Module

Responsible for:

- Disputes
- Resolution workflow
- Arbitration
- Settlement

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
      ├───────────────┐
      │               │
      ▼               ▼
 Milestones      Project Assets
      │
      ▼
Work Submission
```

The Execution Module begins only after the Agreement Module has completed project planning.

---

# Execution Lifecycle

```text
Agreement Completed
        │
        ▼
Professionals Assigned
        │
        ▼
Execution Plan Created
        │
        ▼
Milestones Created
        │
        ▼
Project Assets Uploaded
        │
        ▼
Project Ready To Start
        │
        ▼
Project Activated
        │
        ▼
Milestone Execution
        │
        ▼
Project Completion
```

---

# High-Level Architecture

```text
Project
    │
    ▼
Execution
    │
    ├─────────────────────┐
    │                     │
    ▼                     ▼
Milestones          Project Assets
    │                     │
    ▼                     ▼
Execution Audit     Asset Visibility
```

---

# Core Components

## Execution Plan

Represents the executable work structure of a project.

The execution plan organizes project work into milestones assigned to individual professionals.

It defines:

- Work distribution
- Professional assignments
- Milestone sequencing
- Execution readiness

---

## Milestones

Milestones represent individual units of work assigned to professionals.

Each milestone belongs to exactly one professional and progresses independently throughout execution.

Milestones store:

- Assigned professional
- Execution order
- Allocated days
- Extension days
- Payment allocation
- Revision policy
- Current status
- Execution timestamps

---

## Project Assets

Project Assets represent files and resources shared by the client during execution.

Assets may include:

- Design files
- Documents
- Images
- Videos
- Source material
- Reference files
- Technical specifications

Every asset may contain multiple uploaded files.

---

## Asset Visibility

Every project asset defines which professionals are allowed to access it.

Visibility is managed independently for each asset.

This allows different professionals to receive only the files relevant to their responsibilities.

---

## Execution Audit

The Execution Module maintains an immutable audit history for important execution activities.

Examples include:

- Execution Plan Created
- Execution Plan Updated
- Milestones Created
- Milestones Updated
- Project Asset Uploaded
- Files Added
- Project Asset Deleted

Audit history provides complete traceability throughout project execution.

---

# Project Relationship

```text
Project
    │
    │ 1 : N
    ▼
Milestones
```

A project owns multiple milestones.

---

# Agreement Relationship

```text
Agreement
      │
      ▼
Execution
```

Execution cannot begin until agreement preparation has been completed.

The Agreement Module determines who participates in execution.

The Execution Module determines how work is performed.

---

# Milestone Lifecycle

```text
NOT_STARTED
      │
      ▼
IN_PROGRESS
      │
      ▼
COMPLETED
```

Each professional progresses through their own milestone sequence independently.

Completion of one professional's milestone does not automatically complete milestones assigned to another professional.

---

# Project Asset Lifecycle

```text
Client Uploads Asset
        │
        ▼
Visibility Assigned
        │
        ▼
Professionals Access Asset
        │
        ▼
Additional Files Added
        │
        ▼
Soft Deleted
```

Files remain associated with the asset until the asset is removed.

---

# Permission Model

## Client

Responsible for:

- Create execution plan
- Update execution plan
- Create milestones
- Update milestones
- Upload project assets
- Add asset files
- Delete project assets
- View all project assets

---

## Professional

Responsible for:

- View assigned milestones
- View accessible project assets

Professionals cannot:

- Upload assets
- Modify milestones
- Delete assets

---

# Redis Integration

Redis is used to optimize frequently accessed execution resources.

Cached resources include:

- Execution plans
- Project milestones
- Project assets

Cache is automatically invalidated whenever execution data changes.

---

# Design Principles

The Execution Module follows the following principles:

- Agreement defines **who** performs the work.
- Execution defines **how** the work is performed.
- Every milestone belongs to exactly one professional.
- Professionals execute work independently.
- Project assets are visibility controlled.
- Business rules remain inside the service layer.
- Controllers remain thin.
- Repository layer owns persistence.
- Redis follows the Cache-Aside pattern.
- Audit history is immutable.
- Soft deletion preserves historical execution data.

---

# Current Scope

The current implementation includes:

- Execution planning
- Milestone creation
- Milestone updates
- Milestone progression
- Project asset uploads
- Multiple asset files
- Asset visibility management
- Professional-specific asset retrieval
- Execution audit logging
- Redis caching
- Permission enforcement

Advanced execution capabilities such as milestone extensions, submission workflows, revisions, payments, and disputes are intentionally documented in their respective future modules.

####################################################################################################################

# Phase 2 — System Architecture

# Execution System Architecture

The Execution Module is responsible for orchestrating project execution after project planning has been completed.

It provides a structured execution layer built around milestones, project assets, execution permissions, and audit logging while remaining independent from agreement management, submissions, and payments.

The module follows a layered architecture that separates business logic, persistence, validation, caching, and file storage.

---

# Architecture Overview

```text
                Project Module
                      │
                      ▼
              Execution Controller
                      │
                      ▼
             Execution Service Layer
                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
 Permission      Business Rules     Validation
                      │
                      ▼
             Repository Layer
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
 PostgreSQL       Redis Cache     Cloudinary
                      │
                      ▼
              Execution Response
```

---

# Layer Responsibilities

## Controller Layer

Responsible for:

- Receiving HTTP requests
- Authentication
- Request parsing
- DTO validation
- Calling services
- Returning standardized responses

Controllers never contain business rules.

---

## Service Layer

The Service Layer is the heart of the Execution Module.

Responsible for:

- Execution planning
- Milestone management
- Project asset management
- Permission enforcement
- Transaction management
- Cache invalidation
- Audit creation
- Cloudinary coordination

Every business rule is implemented here.

---

## Repository Layer

Repositories provide access to PostgreSQL.

Responsible for:

- CRUD operations
- Query optimization
- Relationship loading
- Pagination
- Soft deletion
- Database transactions

Repositories never contain business logic.

---

## Validation Layer

Responsible for validating:

- Execution plan requests
- Milestone requests
- Project assets
- Uploaded files
- Participant visibility
- Business constraints

Validation occurs before entering business logic.

---

# Request Lifecycle

Every request follows the same lifecycle.

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
DTO Validation
    │
    ▼
Permission Validation
    │
    ▼
Business Rules
    │
    ▼
Repository
    │
    ▼
Database
    │
    ▼
Redis Invalidation
    │
    ▼
Audit Creation
    │
    ▼
Response
```

---

# Execution Plan Creation Flow

```text
Client
    │
    ▼
Validate Request
    │
    ▼
Validate Project Stage
    │
    ▼
Validate Participants
    │
    ▼
Create Milestones
    │
    ▼
Update Project Stage
    │
    ▼
Create Audit
    │
    ▼
Invalidate Cache
    │
    ▼
Response
```

Execution planning is performed inside a database transaction.

---

# Milestone Update Flow

```text
Client
    │
    ▼
Permission Check
    │
    ▼
Validate Milestone
    │
    ▼
Update Milestone
    │
    ▼
Audit
    │
    ▼
Cache Invalidation
    │
    ▼
Response
```

---

# Project Asset Upload Flow

```text
Client
    │
Multipart Request
    │
    ▼
File Validation
    │
    ▼
Permission Check
    │
    ▼
Cloudinary Upload
    │
    ▼
Create Asset
    │
    ▼
Create Asset Files
    │
    ▼
Create Visibility
    │
    ▼
Execution Audit
    │
    ▼
Redis Invalidation
    │
    ▼
Response
```

All database operations execute inside a single transaction.

If the transaction fails, uploaded Cloudinary files are deleted to prevent orphaned resources.

---

# Project Asset Retrieval Flow

```text
Client
    │
    ▼
Permission Check
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
PostgreSQL
    │
    ▼
Store Cache
    │
    ▼
Response
```

Professionals receive only assets explicitly shared with them.

Clients receive every asset belonging to the project.

---

# Permission Flow

```text
Authenticated User
        │
        ▼
Execution Permission Service
        │
        ▼
Workspace Validation
        │
        ▼
Project Validation
        │
        ▼
Agreement Participation
        │
        ▼
Execution Operation
```

Permission checks occur before any business logic is executed.

---

# Database Transactions

Mutating operations execute inside Prisma transactions.

Examples include:

- Create execution plan
- Update execution plan
- Upload project assets
- Add asset files
- Delete project assets

This guarantees atomic execution.

---

# Redis Cache Strategy

Execution uses the Cache-Aside pattern.

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

```text
PostgreSQL
      │
      ▼
Redis Invalidation
      │
      ▼
Next Read Repopulates Cache
```

Redis is never treated as the source of truth.

---

# Cloudinary Integration

Project assets are stored outside PostgreSQL.

```text
Client
      │
      ▼
Cloudinary
      │
      ▼
Metadata
      │
      ▼
PostgreSQL
```

Only metadata is persisted:

- URL
- Public ID
- MIME Type
- File Extension
- File Size
- Original Filename

Binary files never enter the database.

---

# Audit Architecture

Every significant execution mutation creates an immutable audit record.

Examples include:

- Execution plan created
- Execution plan updated
- Project asset uploaded
- Asset files added
- Asset deleted

Audit records are append-only and are never modified after creation.

---

# Error Handling

Execution services throw standardized application errors.

Validation failures immediately terminate request processing.

Transactions automatically roll back on failure.

Cloudinary uploads are cleaned up whenever a transaction fails after successful uploads.

---

# Design Principles

The Execution Module follows the following architectural principles.

## Thin Controllers

Controllers only coordinate requests and responses.

---

## Rich Services

Business rules are centralized inside the service layer.

---

## Repository Isolation

Repositories only communicate with PostgreSQL.

---

## Cache-Aside Pattern

Redis is used only as a read cache.

---

## Atomic Transactions

Every mutating operation is fully transactional.

---

## Immutable Audits

Execution history cannot be modified.

---

## External File Storage

Project assets are stored in Cloudinary.

Only metadata is persisted in PostgreSQL.

---

## Permission-First Design

Every operation validates authorization before executing business logic.

---

# Current Scope

The current architecture supports:

- Execution planning
- Milestone management
- Project asset management
- Asset visibility
- Execution permissions
- Audit logging
- Redis caching
- Cloudinary integration
- Transaction management

Advanced execution scheduling and deadline extension mechanisms will be documented in future phases.

####################################################################################################################

# Phase 3 — Business Rules

# Execution Business Rules

The Execution Module defines how work is planned, organized, and executed after the project has been prepared.

Every rule in this module is deterministic and enforced by the service layer.

Execution does not manage contracts, payments, or commercial negotiations.

---

# Execution Plan Rules

## Rule 1

Every project can have only one execution plan.

Execution planning is performed only once for a project.

Subsequent modifications update the existing execution plan.

---

## Rule 2

Execution planning is available only after professionals have been assigned.

Projects without assigned professionals cannot create milestones.

---

## Rule 3

Every milestone must belong to exactly one assigned professional.

Milestones cannot exist without an agreement participant.

---

## Rule 4

Execution planning is performed inside a database transaction.

If any milestone fails validation, the complete execution plan creation is rolled back.

---

## Rule 5

Creating or updating an execution plan advances the project setup lifecycle.

---

# Milestone Rules

## Rule 1

Every milestone belongs to exactly one project.

---

## Rule 2

Every milestone belongs to exactly one agreement participant.

---

## Rule 3

Every milestone has a sequential order within a professional.

Example

```text
Professional A

Milestone 1

Milestone 2

Milestone 3
```

Another professional maintains an independent sequence.

---

## Rule 4

Milestone order must be unique for each professional.

Duplicate ordering is rejected.

---

## Rule 5

Every milestone defines:

- Allocated days
- Payment allocation
- Revision limit

These values are mandatory during execution planning.

---

## Rule 6

Allocated days must be greater than zero.

---

## Rule 7

Payment allocation cannot be negative.

---

## Rule 8

Revision limit cannot be negative.

---

# Milestone Status Rules

A milestone always exists in one of the following states.

```text
NOT_STARTED

↓

IN_PROGRESS

↓

SUBMITTED

↓

COMPLETED
```

Status transitions are strictly controlled.

---

## NOT_STARTED

Initial milestone state.

The professional cannot submit work.

---

## IN_PROGRESS

The milestone is currently being executed.

Submissions are allowed.

---

## SUBMITTED

Work has been submitted.

The milestone is waiting for review.

No additional submissions are allowed until review completes.

---

## COMPLETED

The milestone has been approved.

Completed milestones become immutable.

---

# Milestone Progression Rules

## Rule 1

The first milestone for every professional starts automatically when project execution begins.

---

## Rule 2

Approving a milestone automatically starts the next milestone belonging to the same professional.

---

## Rule 3

Professionals execute milestones independently.

One professional completing work does not affect milestones assigned to another professional.

---

## Rule 4

If no additional milestone exists, nothing is started.

---

## Rule 5

When every milestone reaches COMPLETED, the project automatically moves to COMPLETED.

---

# Project Asset Rules

## Rule 1

Only the project creator may upload project assets.

Professionals have read-only access.

---

## Rule 2

Every project asset belongs to exactly one project.

---

## Rule 3

Every project asset may contain one or more files.

---

## Rule 4

Every uploaded file is stored in Cloudinary.

Only metadata is persisted inside PostgreSQL.

---

## Rule 5

Every project asset explicitly defines which professionals may access it.

Visibility is configured during creation.

---

## Rule 6

The same professional may be granted access to any number of project assets.

Visibility is managed independently for every asset.

---

## Rule 7

Professionals only receive assets that are explicitly shared with them.

They cannot access hidden assets.

---

## Rule 8

Clients always receive every project asset.

---

## Rule 9

Project assets are soft deleted.

Historical audit information remains available.

---

## Rule 10

Multiple files may be added to an existing asset.

---

# File Upload Rules

## Rule 1

Only supported MIME types are accepted.

---

## Rule 2

Maximum file size is enforced.

---

## Rule 3

Duplicate filenames within the same upload request are rejected.

---

## Rule 4

Maximum upload count is enforced.

---

## Rule 5

If database persistence fails after Cloudinary upload, uploaded files are automatically deleted.

No orphaned files remain in Cloudinary.

---

# Permission Rules

## Client

Allowed to:

- Create execution plan
- Update execution plan
- Upload project assets
- Add asset files
- Delete project assets
- View all project assets

---

## Professional

Allowed to:

- View assigned milestones
- View shared project assets

Professionals cannot:

- Modify milestones
- Upload assets
- Delete assets
- Change visibility

---

# Validation Rules

Execution validation verifies:

- Project exists
- Project stage
- Assigned professionals
- Milestone ownership
- Milestone ordering
- Positive allocated days
- Positive payment allocation
- Valid revision limits
- Valid participant visibility
- Supported file types

Invalid requests are rejected before business logic executes.

---

# Audit Rules

The following operations create immutable execution audit records.

- Execution plan created
- Execution plan updated
- Project asset created
- Asset files added
- Project asset deleted

Audit records cannot be modified or deleted.

---

# Cache Rules

Execution cache is invalidated whenever:

- Execution plan changes
- Milestones change
- Project assets change
- Asset visibility changes
- Files are added
- Assets are deleted

Subsequent reads repopulate Redis using the Cache-Aside strategy.

---

# Transaction Rules

The following operations execute inside database transactions.

- Create execution plan
- Update execution plan
- Upload project assets
- Add files
- Delete assets

Every transaction is atomic.

Partial execution is never committed.

---

# Security Rules

The Execution Module enforces:

- Authentication
- Workspace membership validation
- Project access validation
- Agreement participant validation
- Resource ownership validation
- Asset visibility validation
- Server-side file validation
- Soft deletion
- Immutable audit history

---

# Current Scope

The current implementation includes:

- Execution plan creation
- Execution plan updates
- Milestone management
- Automatic milestone progression
- Automatic project completion
- Project asset uploads
- Multi-file assets
- Asset visibility management
- Professional-specific asset retrieval
- Execution permissions
- Audit logging
- Redis caching
- Cloudinary integration
- Transactional execution

Milestone deadline extensions and additional execution scheduling enhancements will be introduced in a future phase.

# Milestone Extension Rules

## Rule 1

Extensions may only increase the execution duration of a milestone.

---

## Rule 2

Multiple extensions are cumulative.

---

## Rule 3

Original allocated days are never modified.

---

## Rule 4

Every extension creates an immutable extension record.

---

## Rule 5

Every extension generates an execution audit entry.

---

## Rule 6

Submission deadlines are calculated using

allocatedDays + extensionDays.

---

## Rule 7

Extensions cannot be edited or deleted.

####################################################################################################################

# Phase 4 — Database Design

# Execution Database Design

The Execution Module stores all execution-specific data required after project planning has been completed.

It separates execution planning, project assets, visibility management, and audit history into independent entities, allowing each concern to evolve without affecting the others.

---

# Entity Relationship

```text
Project
│
├──────────────────────────────┐
│                              │
▼                              ▼
Milestone                 ProjectAsset
│                              │
│                              ├──────────────┐
│                              │              │
▼                              ▼              ▼
MilestoneDeliverable   ProjectAssetFile   ProjectAssetVisibility
│
├──────────────────────────────┐
│                              │
▼                              ▼
MilestoneRequirement   MilestoneAcceptanceCriteria

Project
│
▼
ExecutionAudit
```

---

# Milestone

Represents an individual unit of execution assigned to a professional.

Every milestone belongs to one project and one agreement participant.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Milestone identifier |
| projectId | Parent project |
| agreementParticipantId | Assigned professional |
| order | Execution order |
| allocatedDays | Planned duration |
| paymentAllocation | Milestone payment |
| revisionLimit | Maximum revisions |
| revisionCount | Current revision count |
| status | Current execution status |
| startedAt | Execution start |
| submittedAt | Submission timestamp |
| completedAt | Completion timestamp |
| createdById | Creator |
| updatedById | Last updater |
| createdAt | Creation timestamp |
| updatedAt | Last update |
| deletedAt | Soft delete timestamp |
| extensionDays | Total additional execution days |
---

# Milestone Deliverable

Represents expected deliverables for a milestone.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Deliverable identifier |
| milestoneId | Parent milestone |
| title | Deliverable title |
| description | Deliverable description |
| order | Display order |
| createdAt | Creation timestamp |

---

# Milestone Requirement

Represents execution requirements.

Examples:

- Technology stack
- Browser support
- API version
- Coding standard

---

## Fields

| Field | Description |
|--------|-------------|
| id | Requirement identifier |
| milestoneId | Parent milestone |
| description | Requirement |
| order | Display order |
| createdAt | Creation timestamp |

---

# Milestone Acceptance Criteria

Represents measurable completion conditions.

Examples:

- Unit tests pass
- Mobile responsive
- API documentation completed

---

## Fields

| Field | Description |
|--------|-------------|
| id | Acceptance criteria identifier |
| milestoneId | Parent milestone |
| description | Completion condition |
| order | Display order |
| createdAt | Creation timestamp |

---

# Project Asset

Represents a logical execution resource.

A project asset groups one or more uploaded files under a single execution resource.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Asset identifier |
| projectId | Parent project |
| createdById | Client |
| createdAt | Creation timestamp |
| updatedAt | Last update |
| deletedAt | Soft delete timestamp |

---

# Project Asset File

Stores uploaded file metadata.

Actual binary files are stored in Cloudinary.

---

## Fields

| Field | Description |
|--------|-------------|
| id | File identifier |
| projectAssetId | Parent asset |
| publicId | Cloudinary identifier |
| url | File URL |
| originalName | Original filename |
| mimeType | MIME type |
| extension | File extension |
| size | File size |
| uploadedAt | Upload timestamp |

---

# Project Asset Visibility

Controls professional access to project assets.

Each record grants one professional access to one asset.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Visibility identifier |
| projectId | Parent project |
| projectAssetId | Asset |
| agreementParticipantId | Allowed professional |

---

# Execution Audit

Maintains immutable execution history.

Every significant execution operation creates one audit record.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Audit identifier |
| projectId | Parent project |
| actorId | User performing action |
| action | Audit action |
| metadata | Additional information |
| createdAt | Timestamp |

---

# Milestone Extension

Represents every approved extension granted to a milestone.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Extension identifier |
| milestoneId | Parent milestone |
| daysAdded | Additional execution days |
| reason | Extension justification |
| approvedById | User granting extension |
| createdAt | Approval timestamp |


# Relationships

```text
Project

Milestone

├── 1:N MilestoneExtension

├── 1:N Deliverables

├── 1:N Requirements

└── 1:N Acceptance Criteria
```

---

```text
Milestone

├── 1:N Deliverables

├── 1:N Requirements

└── 1:N Acceptance Criteria
```

---

```text
Project Asset

├── 1:N Files

└── 1:N Visibility
```

---

```text
Agreement Participant

└── 1:N Milestones
```

---

# Soft Delete Strategy

The following entities support soft deletion.

- Milestone
- Project Asset

Historical execution data remains available.

The following entities are permanently retained.

- Execution Audit
- Asset Files
- Asset Visibility
- Deliverables
- Requirements
- Acceptance Criteria

---

# Index Strategy

Indexes exist for frequently queried fields.

## Milestones

- projectId
- agreementParticipantId
- status
- order

---

## Project Assets

- projectId
- createdById

---

## Asset Files

- projectAssetId

---

## Asset Visibility

- projectAssetId
- agreementParticipantId

---

## Execution Audit

- projectId
- actorId
- createdAt

---

# Cache Keys

Execution uses Redis for read-heavy resources.

| Resource | Cache Key |
|----------|-----------|
| Execution Plan | execution:plan:{projectId} |
| Milestones | execution:milestones:{projectId} |
| Project Assets | execution:assets:{projectId} |

---

# Transaction Boundaries

The following operations execute atomically.

## Execution Plan

Creates

- Milestones
- Deliverables
- Requirements
- Acceptance Criteria
- Execution Audit

---

## Project Asset Upload

Creates

- Project Asset
- Asset Files
- Asset Visibility
- Execution Audit

---

## Add Asset Files

Creates

- Asset Files
- Execution Audit

---

## Delete Asset

Updates

- Project Asset (Soft Delete)

Creates

- Execution Audit

---

# Storage Architecture

```text
PostgreSQL

│

├── Milestones

├── Deliverables

├── Requirements

├── Acceptance Criteria

├── Project Assets

├── Asset Visibility

└── Execution Audit
```

```text
Cloudinary

│

└── Project Asset Files
```

Redis stores cached execution data only.

---

# Design Decisions

## Separate Asset Files

A project asset may contain multiple uploaded files.

Separating files from assets allows incremental uploads without modifying the asset itself.

---

## Visibility Table

Visibility is normalized into a dedicated table.

This enables:

- Many professionals per asset
- Unlimited assets per professional
- Efficient permission checks

---

## Immutable Audit

Execution history is append-only.

Historical records are never modified.

---

## Metadata Storage

Only file metadata is stored in PostgreSQL.

Binary content remains in Cloudinary.

---

# Current Scope

The current database implementation includes:

- Milestones
- Deliverables
- Requirements
- Acceptance Criteria
- Project Assets
- Project Asset Files
- Project Asset Visibility
- Execution Audit

Milestone deadline extensions will be documented in a future database phase.

####################################################################################################################

# Phase 5 — API Documentation

# Execution API Documentation

The Execution Module exposes APIs responsible for execution planning, milestone management, project asset management, and execution visibility.

All APIs require authenticated users.

Permission checks are enforced before business logic executes.

---

# Authentication

Every endpoint requires a valid JWT access token.

```http
Authorization: Bearer <access_token>
```

---

# Base URL

```text
/api/v1/execution
```

---

# Execution Plan APIs

---

# Create Execution Plan

Creates the execution plan for a project.

---

## Endpoint

```http
POST /projects/:projectId/execution-plan
```

---

## Permissions

Only the project creator may perform this operation.

---

## Request Body

```json
{
  "milestones": [
    {
      "agreementParticipantId": "...",
      "order": 1,
      "allocatedDays": 10,
      "paymentAllocation": 25000,
      "revisionLimit": 2,
      "deliverables": [],
      "requirements": [],
      "acceptanceCriteria": []
    }
  ]
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Execution plan created successfully."
}
```

---

## Business Rules

- Project must exist.
- Professionals must already be assigned.
- Project must be editable.
- Every milestone requires an assigned participant.
- Milestone order must be valid.
- Entire operation executes inside one transaction.

---

## Cache

Invalidates

```text
execution:plan:{projectId}
execution:milestones:{projectId}
```

---

# Update Execution Plan

Updates an existing execution plan.

---

## Endpoint

```http
PUT /projects/:projectId/execution-plan
```

---

## Permissions

Project creator only.

---

## Request Body

Same as creation.

---

## Success Response

```json
{
  "success": true,
  "message": "Execution plan updated successfully."
}
```

---

## Business Rules

- Existing milestones are replaced.
- Validation occurs before persistence.
- Operation is transactional.

---

## Cache

Invalidates

```text
execution:plan:{projectId}
execution:milestones:{projectId}
```

---

# Get Execution Plan

Returns every milestone belonging to a project.

---

## Endpoint

```http
GET /projects/:projectId/execution-plan
```

---

## Permissions

- Client
- Assigned professionals

---

## Success Response

```json
{
  "success": true,
  "data": []
}
```

---

## Cache

Reads

```text
execution:plan:{projectId}
```

---

# Project Asset APIs

---

# Create Project Asset

Creates a project asset and uploads files.

---

## Endpoint

```http
POST /projects/:projectId/assets
```

---

## Permissions

Project creator only.

---

## Request

Multipart Form Data

```text
files
visibleToParticipants[]
```

---

## Success Response

```json
{
  "success": true,
  "message": "Project asset created successfully."
}
```

---

## Business Rules

- Minimum one file.
- Maximum configured upload count.
- Every selected participant must belong to the agreement.
- Files upload to Cloudinary.
- Metadata stored in PostgreSQL.
- Visibility created for every selected participant.
- Transaction rollback deletes uploaded Cloudinary files.

---

## Cache

Invalidates

```text
execution:assets:{projectId}
```

---

# List Project Assets

Returns project assets.

Clients receive all assets.

Professionals receive only assets shared with them.

---

## Endpoint

```http
GET /projects/:projectId/assets
```

---

## Permissions

- Project creator
- Assigned professionals

---

## Success Response

```json
{
  "success": true,
  "data": []
}
```

---

## Business Rules

Client:

- View every asset.

Professional:

- View only permitted assets.

---

## Cache

Reads

```text
execution:assets:{projectId}
```

---

# Get Project Asset

Returns one project asset.

---

## Endpoint

```http
GET /projects/:projectId/assets/:assetId
```

---

## Permissions

- Project creator
- Authorized professional

---

## Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## Business Rules

Professionals must have explicit visibility.

---

## Cache

Reads

```text
execution:assets:{projectId}
```

---

# Add Asset Files

Uploads additional files to an existing asset.

---

## Endpoint

```http
POST /projects/:projectId/assets/:assetId/files
```

---

## Permissions

Project creator only.

---

## Request

Multipart Form Data

```text
files
```

---

## Success Response

```json
{
  "success": true,
  "message": "Files added successfully."
}
```

---

## Business Rules

- Existing asset must exist.
- Files upload to Cloudinary.
- Metadata stored in PostgreSQL.
- Existing visibility remains unchanged.

---

## Cache

Invalidates

```text
execution:assets:{projectId}
```

---

# Delete Project Asset

Soft deletes a project asset.

---

## Endpoint

```http
DELETE /projects/:projectId/assets/:assetId
```

---

## Permissions

Project creator only.

---

## Success Response

```json
{
  "success": true,
  "message": "Project asset deleted successfully."
}
```

---

## Business Rules

- Soft delete only.
- Files remain in storage until cleanup.
- Audit record created.

---

## Cache

Invalidates

```text
execution:assets:{projectId}
```

---

# Common Error Responses

| HTTP | Code | Description |
|------|------|-------------|
|400|INVALID_PROJECT_SETUP_STAGE|Invalid execution stage|
|400|INVALID_PROJECT_ASSET|Invalid asset request|
|400|DUPLICATE_PROJECT_ASSET_FILE|Duplicate uploaded file|
|400|DUPLICATE_PROJECT_ASSET_PARTICIPANT|Duplicate participant supplied|
|400|INVALID_MILESTONE|Invalid milestone|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Permission denied|
|404|PROJECT_NOT_FOUND|Project not found|
|404|MILESTONE_NOT_FOUND|Milestone not found|
|404|PROJECT_ASSET_NOT_FOUND|Asset not found|

---

# Transaction Summary

| API | Transaction |
|------|-------------|
|Create Execution Plan|✅|
|Update Execution Plan|✅|
|Create Project Asset|✅|
|Add Asset Files|✅|
|Delete Project Asset|✅|

---

# Cache Summary

| API | Cache Action |
|------|--------------|
|Get Execution Plan|Read|
|Create Execution Plan|Invalidate|
|Update Execution Plan|Invalidate|
|List Assets|Read|
|Get Asset|Read|
|Create Asset|Invalidate|
|Add Files|Invalidate|
|Delete Asset|Invalidate|
Grant Milestone Extension | Invalidate

---

# Security Summary

The Execution API enforces:

- JWT Authentication
- Workspace membership validation
- Agreement participant validation
- Project ownership validation
- Asset visibility validation
- Cloudinary file validation
- Transactional persistence
- Immutable execution auditing

---

# Current API Coverage

The current Execution Module exposes APIs for:

- Execution plan creation
- Execution plan updates
- Execution plan retrieval
- Project asset creation
- Project asset listing
- Project asset retrieval
- Additional file uploads
- Project asset deletion


# Grant Milestone Extension

## Endpoint

POST /projects/:projectId/milestone-extensions

---

## Permissions

Project creator only.

---

## Request

{
    "milestoneId": "...",
    "daysAdded": 3,
    "reason": "Additional implementation required."
}

---

## Success

{
    "success": true,
    "message": "Milestone extension granted successfully."
}

---

## Business Rules

- Milestone must belong to the project.
- Days must be positive.
- Reason is required.
- Extension days are cumulative.
- Audit is created.
- Execution cache is invalidated.


Future phases will introduce APIs for milestone deadline extensions and advanced execution scheduling.

####################################################################################################################

# Phase 6 — Redis Caching Strategy

# Execution Caching Architecture

The Execution Module uses Redis to reduce database load for frequently accessed execution resources.

Redis is never treated as the source of truth.

PostgreSQL always remains authoritative.

The module follows the **Cache-Aside Pattern**.

---

# Cache-Aside Flow

```text
                Client
                   │
                   ▼
             Execution Service
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
   Redis Cache          PostgreSQL
         │                   ▲
         │ Cache Miss        │
         └──────────►────────┘
                   │
                   ▼
            Store In Cache
                   │
                   ▼
                Response
```

---

# Cached Resources

The Execution Module currently caches three primary resources.

| Resource | Cache Key |
|----------|-----------|
| Execution Plan | execution:plan:{projectId} |
| Milestones | execution:milestones:{projectId} |
| Project Assets | execution:assets:{projectId} |

---

# Execution Plan Cache

## Cache Key

```text
execution:plan:{projectId}
```

---

## Cached Data

Entire execution plan including:

- Milestones
- Deliverables
- Requirements
- Acceptance Criteria

---

## Cache Population

Occurs when

```text
GET /execution-plan
```

is called.

---

## Cache Invalidation

Occurs after

- Create Execution Plan
- Update Execution Plan

---

# Milestone Cache

## Cache Key

```text
execution:milestones:{projectId}
```

---

## Cached Data

Project milestones including

- Status
- Assigned professional
- Allocated days
- Payment allocation
- Revision information

---

## Cache Population

Occurs when milestone information is requested.

---

## Cache Invalidation

Occurs whenever milestone information changes.

Examples

Execution plan creation
Execution plan update
Milestone completion
Revision count updates
Milestone status changes
Milestone extensions

---

# Project Asset Cache

## Cache Key

```text
execution:assets:{projectId}
```

---

## Cached Data

Project assets

Including

- Asset metadata
- Uploaded files
- Visibility information

---

## Cache Population

Occurs during

```text
GET /assets
```

and

```text
GET /assets/:assetId
```

---

## Cache Invalidation

Occurs after

- Asset creation
- File upload
- Asset deletion
- Visibility updates

---

# Read Flow

```text
Client
   │
   ▼
Redis Lookup
   │
   ├──────────────► Cache Hit
   │                   │
   │                   ▼
   │              Return Response
   │
   ▼
Cache Miss
   │
   ▼
PostgreSQL
   │
   ▼
Redis Store
   │
   ▼
Response
```

---

# Write Flow

```text
Database Transaction
        │
        ▼
Successful Commit
        │
        ▼
Redis Invalidation
        │
        ▼
Next Read Repopulates Cache
```

---

# Cache Lifetime

Execution data remains cached until

- Explicit invalidation
- Redis expiration
- Redis eviction

The application never assumes cached data is permanently available.

---

# Serialization

Redis stores JSON serialized objects.

```text
Object

↓

JSON

↓

Redis

↓

JSON

↓

Object
```

---

# Cache Consistency

Execution uses **Write Through Invalidation**.

This guarantees

```text
Database

↓

Success

↓

Invalidate Cache

↓

Future Read

↓

Fresh Data
```

The cache is never updated directly after mutations.

It is always rebuilt from PostgreSQL.

---

# Failure Strategy

If Redis becomes unavailable

```text
Client

↓

Database

↓

Response
```

Execution continues normally.

Caching is treated strictly as a performance optimization.

---

# Cache Scope

Each cache entry is isolated by project.

Example

```text
execution:plan:project-A

execution:plan:project-B

execution:assets:project-A

execution:assets:project-B
```

Projects never share cached execution data.

---

# Why Cache Execution

Execution resources are heavily read during project delivery.

Examples

- Professionals loading milestones
- Clients viewing execution plans
- Asset retrieval
- Dashboard refreshes

Caching significantly reduces repetitive PostgreSQL queries.

---

# Cache Invalidation Summary

| Operation | Cache Invalidated |
|-----------|------------------|
|Create Execution Plan|execution:plan, execution:milestones|
|Update Execution Plan|execution:plan, execution:milestones|
|Create Project Asset|execution:assets|
|Add Asset Files|execution:assets|
|Delete Project Asset|execution:assets|

---

# Design Principles

The caching architecture follows these principles.

## PostgreSQL First

Redis never replaces PostgreSQL.

---

## Cache Aside

Data is cached only after successful reads.

---

## Explicit Invalidation

Every write invalidates affected cache entries.

---

## Project Isolation

Each project maintains independent cache entries.

---

## No Business Logic

Redis stores cached data only.

Business rules always execute in the service layer.

---

## Transparent Failure

Execution continues even if Redis is unavailable.

---

# Current Cache Coverage

The Execution Module currently caches:

- Execution plans
- Milestones
- Project assets

Future phases will extend cache invalidation to milestone deadline extensions and additional execution scheduling features.

####################################################################################################################

# Phase 7 — Execution Workflows

# Execution Workflows

This phase documents the complete runtime behavior of the Execution Module.

It explains how execution progresses from project planning to successful project completion, how project assets are managed, and how the system coordinates caching, permissions, transactions, and audit logging.

---

# Overall Execution Lifecycle

```text
Project Created
        │
        ▼
Agreement Finalized
        │
        ▼
Professionals Assigned
        │
        ▼
Execution Plan Created
        │
        ▼
Milestones Generated
        │
        ▼
Project Assets Uploaded
        │
        ▼
Project Ready To Start
        │
        ▼
Project Activated
        │
        ▼
First Milestones Start
        │
        ▼
Professional Execution
        │
        ▼
Milestone Submission
        │
        ▼
Milestone Approval
        │
        ▼
Next Milestone Starts
        │
        ▼
All Milestones Completed
        │
        ▼
Project Completed
```

Execution begins only after project planning has been completed.

---

# Execution Plan Creation Workflow

```text
Client
   │
   ▼
Create Execution Plan
   │
   ▼
Validate Project
   │
   ▼
Validate Project Stage
   │
   ▼
Validate Agreement Participants
   │
   ▼
Validate Milestones
   │
   ▼
Begin Database Transaction
   │
   ▼
Create Milestones
   │
   ▼
Create Deliverables
   │
   ▼
Create Requirements
   │
   ▼
Create Acceptance Criteria
   │
   ▼
Update Project Stage
   │
   ▼
Create Execution Audit
   │
   ▼
Commit Transaction
   │
   ▼
Invalidate Redis
   │
   ▼
Success Response
```

---

# Execution Plan Update Workflow

```text
Client
   │
   ▼
Update Execution Plan
   │
   ▼
Permission Validation
   │
   ▼
Business Validation
   │
   ▼
Begin Transaction
   │
   ▼
Soft Delete Previous Plan
   │
   ▼
Create Updated Milestones
   │
   ▼
Create Updated Deliverables
   │
   ▼
Create Updated Requirements
   │
   ▼
Create Updated Acceptance Criteria
   │
   ▼
Execution Audit
   │
   ▼
Commit
   │
   ▼
Invalidate Cache
```

---

# Project Activation Workflow

```text
Project Activated
        │
        ▼
Locate Every First Milestone
        │
        ▼
Change Status
NOT_STARTED
        │
        ▼
IN_PROGRESS
        │
        ▼
Set StartedAt
        │
        ▼
Execution Begins
```

Every professional begins execution independently.

---

# Milestone Lifecycle

```text
NOT_STARTED
      │
      ▼
IN_PROGRESS
      │
      ▼
SUBMITTED
      │
      ▼
COMPLETED
```

Each milestone progresses independently.

---

# Milestone Completion Workflow

```text
Professional
      │
      ▼
Submit Work
      │
      ▼
Submission Approved
      │
      ▼
Mark Milestone Completed
      │
      ▼
Set CompletedAt
      │
      ▼
Search Next Milestone
      │
      ▼
Exists?
   │         │
  No        Yes
   │         │
   ▼         ▼
 Finish   Start Next
            │
            ▼
     Status = IN_PROGRESS
            │
            ▼
      Set StartedAt
```

---

# Project Completion Workflow

```text
Milestone Completed
        │
        ▼
Check Remaining Milestones
        │
        ▼
Incomplete?
    │         │
   Yes        No
    │         │
    ▼         ▼
 Continue   Mark Project
             COMPLETED
```

The project completes only after every milestone reaches the completed state.

---

# Project Asset Upload Workflow

```text
Client
   │
Multipart Request
   │
   ▼
Validate Files
   │
   ▼
Validate Participants
   │
   ▼
Upload Files
to Cloudinary
   │
   ▼
Begin Transaction
   │
   ▼
Create Asset
   │
   ▼
Create File Records
   │
   ▼
Create Visibility Records
   │
   ▼
Execution Audit
   │
   ▼
Commit
   │
   ▼
Invalidate Cache
   │
   ▼
Response
```

---

# Asset Retrieval Workflow

## Client

```text
Client
   │
   ▼
Permission Check
   │
   ▼
Redis Lookup
   │
Cache Miss
   │
   ▼
Database
   │
   ▼
Cache
   │
   ▼
Return Every Asset
```

---

## Professional

```text
Professional
      │
      ▼
Permission Check
      │
      ▼
Find Agreement Participant
      │
      ▼
Retrieve Visible Assets Only
      │
      ▼
Redis Cache
      │
      ▼
Response
```

Professionals never receive hidden assets.

---

# Asset File Upload Workflow

```text
Client
   │
   ▼
Select Existing Asset
   │
   ▼
Upload New Files
   │
   ▼
Cloudinary
   │
   ▼
Store Metadata
   │
   ▼
Execution Audit
   │
   ▼
Invalidate Cache
```

Existing visibility remains unchanged.

---

# Asset Deletion Workflow

```text
Client
   │
   ▼
Permission Validation
   │
   ▼
Soft Delete Asset
   │
   ▼
Execution Audit
   │
   ▼
Invalidate Cache
   │
   ▼
Response
```

Historical records remain available.

---

Grant Extension
      │
      ▼
Validate Request
      │
      ▼
Validate Milestone
      │
      ▼
Create Extension Record
      │
      ▼
Increment Extension Days
      │
      ▼
Create Audit
      │
      ▼
Invalidate Cache
      │
      ▼
Response

# Permission Workflow

```text
Authenticated User
        │
        ▼
Workspace Validation
        │
        ▼
Project Validation
        │
        ▼
Operation
        │
        ▼
Client?
   │          │
  Yes        No
   │          │
   ▼          ▼
 Full     Agreement
Access   Participant?
              │
         Yes      No
          │        │
          ▼        ▼
 Limited  Access
 Access   Denied
```

---

# Cache Read Workflow

```text
Client
   │
   ▼
Redis Lookup
   │
Hit?──────────────No
 │                 │
 ▼                 ▼
Return         PostgreSQL
Cache             │
                  ▼
             Store Cache
                  │
                  ▼
               Response
```

---

# Cache Write Workflow

```text
Execution Operation
        │
        ▼
Database Commit
        │
        ▼
Invalidate Cache
        │
        ▼
Next Read
        │
        ▼
Fresh Database Data
```

---

# Database Transaction Workflow

```text
Begin Transaction
        │
        ▼
Validate Request
        │
        ▼
Persist Database Changes
        │
        ▼
Audit Creation
        │
        ▼
Success?
   │           │
  Yes          No
   │           │
   ▼           ▼
Commit      Rollback
   │
   ▼
Invalidate Cache
```

---

# Cloudinary Upload Workflow

```text
Receive Files
      │
      ▼
Validate Files
      │
      ▼
Upload To Cloudinary
      │
      ▼
Database Transaction
      │
      ▼
Transaction Failed?
      │
  Yes        No
   │          │
   ▼          ▼
Delete      Keep
Uploads    Uploads
```

This guarantees that orphaned Cloudinary files are never left behind after a failed database transaction.

---

# Execution Audit Workflow

```text
Execution Operation
        │
        ▼
Business Logic
        │
        ▼
Database Update
        │
        ▼
Create Audit Record
        │
        ▼
Commit Transaction
```

Every significant execution operation generates an immutable audit record.

---

# Complete Execution Sequence

```text
Project Ready
      │
      ▼
Execution Plan Created
      │
      ▼
Milestones Generated
      │
      ▼
Assets Uploaded
      │
      ▼
Project Activated
      │
      ▼
First Milestones Started
      │
      ▼
Professional Executes Work
      │
      ▼
Submission Approved
      │
      ▼
Next Milestone Starts
      │
      ▼
Repeat
      │
      ▼
Every Milestone Completed
      │
      ▼
Project Completed
```

---

# Workflow Design Principles

The Execution Module follows these workflow principles:

- Execution begins only after project planning is complete.
- Every milestone belongs to one professional.
- Professionals progress independently.
- Project assets are permission-controlled.
- All mutations execute inside transactions.
- Redis follows the Cache-Aside pattern.
- Cloudinary stores binary files.
- PostgreSQL stores metadata.
- Audit history is immutable.
- Permission checks always occur before business logic.
- Cache invalidation occurs only after successful database commits.

---

# Current Workflow Coverage

The current implementation documents workflows for:

- Execution plan creation
- Execution plan updates
- Project activation
- Milestone progression
- Automatic project completion
- Project asset uploads
- Asset retrieval
- Asset file uploads
- Asset deletion
- Permission validation
- Redis caching
- Database transactions
- Cloudinary integration
- Execution auditing

Future workflow phases will extend this documentation with milestone deadline extensions and advanced execution scheduling.

####################################################################################################################

# Phase 8 — Milestone Extensions

# Milestone Extensions

## Overview

The Milestone Extension system allows the execution duration of an individual milestone to be increased without modifying its original allocation.

Instead of changing the planned duration, every approved extension is stored as an immutable record while the milestone maintains the cumulative number of additional execution days.

Extensions become part of the milestone execution lifecycle and are automatically considered when determining submission deadlines.

---

# Objectives

- Extend milestone execution time without modifying the original allocation.
- Maintain complete historical records of every granted extension.
- Support multiple extensions for the same milestone.
- Automatically calculate effective submission deadlines.
- Determine submission timing (ON_TIME or LATE) using cumulative extensions.
- Maintain immutable execution history.
- Invalidate execution caches after every extension.

---

# Architecture

```text
Project
    │
    ▼
Milestone
    │
    ├──────────────┐
    │              │
    ▼              ▼
extensionDays   MilestoneExtension
                    │
                    ├── daysAdded
                    ├── reason
                    ├── approvedBy
                    └── createdAt
```

---

# Purpose

Milestone extensions solve situations where additional execution time must be granted without changing the original milestone commitment.

Instead of modifying allocated days, the system stores extensions separately and calculates the effective deadline dynamically.

This preserves both the original execution plan and the complete extension history.

---

# Milestone Extension Model

Every approved extension creates a permanent database record.

Each record represents one approval event.

---

## Stored Information

| Field | Description |
|--------|-------------|
| milestoneId | Parent milestone |
| daysAdded | Additional execution days |
| reason | Business justification |
| approvedById | User granting the extension |
| createdAt | Approval timestamp |

---

# Milestone State

The milestone stores only the cumulative extension.

Example

```text
Allocated Days = 10

Extension #1 = +2

Extension #2 = +3

extensionDays = 5
```

The original allocation never changes.

```text
allocatedDays = 10

extensionDays = 5

Effective Duration = 15 Days
```

---

# Extension Workflow

```text
Client
    │
    ▼
Validate Request
    │
    ▼
Permission Validation
    │
    ▼
Validate Milestone
    │
    ▼
Create Extension Record
    │
    ▼
Increment Milestone Extension Days
    │
    ▼
Create Execution Audit
    │
    ▼
Invalidate Redis Cache
    │
    ▼
Return Response
```

---

# Effective Deadline Calculation

Milestones never store a permanent deadline.

Instead, the deadline is calculated whenever required.

```text
Effective Deadline

=

startedAt

+

allocatedDays

+

extensionDays
```

Example

```text
startedAt

=

1 July

allocatedDays

=

10

extensionDays

=

5

Effective Deadline

=

16 July
```

This guarantees that every newly approved extension immediately affects future submission validation.

---

# Submission Timing

During milestone submission the system calculates the effective deadline.

```text
Submission Request
        │
        ▼
Calculate Effective Deadline
        │
        ▼
Compare submittedAt
        │
        ├───────────────┐
        │               │
        ▼               ▼
Before Deadline    After Deadline
        │               │
        ▼               ▼
    ON_TIME          LATE
```

The resulting timing is permanently stored with the submission.

---

# Multiple Extensions

Extensions are cumulative.

```text
Original

10 Days

↓

+2 Days

↓

12 Days

↓

+3 Days

↓

15 Days

↓

+5 Days

↓

20 Days
```

Every approval creates a separate extension record.

Historical extensions are never modified.

---

# Execution Audit

Every granted extension generates an immutable execution audit.

Audit Action

```text
EXTENSION_GRANTED
```

Audit Metadata

```json
{
    "daysAdded": 2,
    "totalExtensionDays": 5,
    "reason": "Additional backend integration required."
}
```

The audit captures:

- Extension granted
- Additional days
- Current cumulative extension
- Business justification
- Actor
- Timestamp

---

# Validation Rules

## Extension Days

- Must be greater than zero.
- Negative values are rejected.
- Zero is rejected.

---

## Reason

- Required.
- Automatically trimmed.
- Minimum length validated.
- Maximum length validated.

---

## Milestone Validation

The milestone must exist.

---

## Project Validation

The milestone must belong to the requested project.

---

## Permission Validation

Only authorized project participants may grant milestone extensions.

---

# Cache Strategy

Successful extension approval invalidates:

- Execution Plan Cache
- Milestone Cache

The next read automatically reloads fresh milestone information from PostgreSQL.

---

# Database Design

## Milestone

Stores only the cumulative extension.

```text
extensionDays
```

---

## MilestoneExtension

Stores every approved extension.

```text
id

milestoneId

daysAdded

reason

approvedById

createdAt
```

---

# Business Rules

- Original allocated days never change.
- Extensions only increase execution time.
- Extensions are cumulative.
- Every extension creates an immutable history record.
- Every extension creates an execution audit.
- Effective deadlines are calculated dynamically.
- Submission timing is determined using the calculated deadline.
- Extensions cannot be edited.
- Extensions cannot be deleted.
- Audit history is immutable.
- Redis cache is invalidated after every successful extension.

---

# Completed Components

## Models

- Milestone
- MilestoneExtension

---

## DTOs

- CreateMilestoneExtensionDto

---

## Validators

- Extension days validation
- Reason validation
- Project validation
- Permission validation

---

## Repository

- MilestoneExtensionRepository

---

## Service

- MilestoneExtensionService

---

## Controller

- MilestoneExtensionController

---

## Routes

```http
POST /projects/:projectId/milestone-extensions
```

---

## Audit

```text
EXTENSION_GRANTED
```

---

## Cache

- Execution Plan Cache
- Milestone Cache

---

# Design Principles

The Milestone Extension system follows the following principles:

- Original execution plans remain immutable.
- Extensions are additive rather than modifying planned duration.
- Deadlines are calculated instead of stored.
- Historical extension records are permanent.
- Business rules remain inside the service layer.
- Audit history is append-only.
- Redis follows the Cache-Aside pattern.
- PostgreSQL remains the source of truth.

---

# Phase Summary

The Milestone Extension system introduces a dedicated mechanism for extending milestone execution without modifying the original execution plan. Every extension is permanently recorded, automatically contributes to the milestone's cumulative execution duration, participates in dynamic deadline calculation, influences submission timing validation, generates immutable audit records, and maintains cache consistency through automatic Redis invalidation. This design preserves execution history while providing a flexible and scalable extension workflow.