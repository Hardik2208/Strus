# Phase 1 — Module Overview

# Execution Module

## Purpose

The Execution Module is responsible for managing the complete execution lifecycle of a project after the agreement has been finalized.

It transforms a signed agreement into an executable work plan, coordinates milestone execution, manages project resources, tracks work submissions, handles review workflows, supports milestone deadline extensions, maintains immutable execution history, and generates execution notifications throughout the delivery lifecycle.

The module serves as the operational layer between contractual planning and successful project completion.

---

# Objectives

The Execution Module is designed to:

- Convert signed agreements into executable work plans.
- Organize project work into professional-specific milestones.
- Coordinate independent execution across multiple professionals.
- Track milestone progress throughout execution.
- Manage project assets and visibility.
- Handle work submissions and review workflows.
- Support milestone deadline extensions.
- Automatically progress milestone execution.
- Automatically complete projects when execution finishes.
- Generate execution notifications.
- Maintain immutable execution history.
- Improve performance through Redis caching.
- Provide a scalable execution architecture without requiring future redesign.

---

# Responsibilities

The Execution Module is responsible for:

- Execution planning
- Milestone management
- Milestone progression
- Professional assignment validation
- Project asset management
- Asset visibility management
- Work submissions
- Submission reviews
- Revision requests
- Milestone deadline extensions
- Automatic milestone progression
- Automatic project completion
- Execution notifications
- Execution permissions
- Execution audit logging
- Redis cache management
- Socket event broadcasting

---

# Out of Scope

The following responsibilities intentionally belong to other bounded contexts.

## Workspace Module

Responsible for:

- Workspace management
- Workspace membership
- Workspace roles
- Workspace invitations

---

## Project Module

Responsible for:

- Project creation
- Project lifecycle
- Project ownership
- Project visibility
- Project cancellation

---

## Agreement Module

Responsible for:

- Commercial agreements
- Project participants
- Scope of work
- Budget
- Professional invitations
- Contract negotiation
- Agreement approval

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

- Payment disputes
- Contract disputes
- Resolution workflows
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
      ├──────────────────────────────┐
      │                              │
      ▼                              ▼
Execution Plan                 Project Assets
      │
      ▼
Milestones
      │
      ▼
Submissions
      │
      ▼
Reviews
      │
      ▼
Revisions
      │
      ▼
Completion
```

Execution begins only after an agreement has been finalized.

---

# Execution Lifecycle

```text
Agreement Signed
        │
        ▼
Execution Plan Created
        │
        ▼
Milestones Generated
        │
        ▼
Project Assets Shared
        │
        ▼
Project Activated
        │
        ▼
Milestone Started
        │
        ▼
Submission Created
        │
        ▼
Review
   ┌───────────────┐
   │               │
   ▼               ▼
Revision      Approved
   │               │
   ▼               ▼
Resubmit    Milestone Completed
                    │
                    ▼
        Next Milestone Started
                    │
                    ▼
     Every Milestone Completed
                    │
                    ▼
          Project Completed
```

---

# High-Level Architecture

```text
Agreement
      │
      ▼
Execution
      │
      ├──────────────────────────────────────────────┐
      │                                              │
      ▼                                              ▼
Execution Plan                                 Project Assets
      │                                              │
      ▼                                              ▼
Milestones                                  Asset Visibility
      │
      ▼
Submissions
      │
      ▼
Submission Reviews
      │
      ▼
Revision Requests
      │
      ▼
Milestone Extensions
      │
      ▼
Execution Notifications
      │
      ▼
Execution Audit
```

---

# Core Components

## Execution Plan

Represents the executable work structure of a project.

The execution plan organizes work into milestones assigned to individual professionals and defines how project execution will proceed.

---

## Milestones

Milestones represent individual units of work assigned to professionals.

Each milestone executes independently and maintains its own lifecycle, revision policy, payment allocation, execution duration, submission history, and completion status.

---

## Project Assets

Project Assets represent resources shared with professionals during execution.

Each asset may contain multiple uploaded files while independently controlling professional visibility.

---

## Work Submissions

Professionals submit completed milestone work through structured submissions.

Each submission records execution timing, uploaded attachments, submission history, and review status.

---

## Submission Reviews

Clients review submitted work by either approving the submission or requesting revisions.

Submission reviews directly control milestone progression.

---

## Revision Requests

Revision requests allow clients to return submitted work for further modifications while enforcing milestone revision limits.

---

## Milestone Extensions

Milestone extensions allow additional execution time without modifying the original milestone allocation.

Every approved extension becomes part of the milestone execution history.

---

## Execution Notifications

Execution generates notifications whenever significant execution events occur.

Examples include:

- Execution plan created
- Execution plan updated
- Project asset shared
- Submission received
- Revision requested
- Milestone completed
- Next milestone started
- Milestone extension granted

Notifications are delivered through the platform's event infrastructure.

---

## Execution Audit

Every significant execution activity creates an immutable audit record.

Audit history provides complete traceability throughout project execution.

---

# Permission Model

## Client

Responsible for:

- Create execution plans
- Update execution plans
- Manage milestones
- Upload project assets
- Manage asset visibility
- Review submissions
- Request revisions
- Grant milestone extensions
- View all execution resources

---

## Professional

Responsible for:

- View assigned milestones
- Access shared project assets
- Submit milestone work
- View revision requests
- Continue execution after revisions

Professionals cannot:

- Modify execution plans
- Upload project assets
- Review submissions
- Grant extensions
- Change asset visibility

---

# Redis Integration

Redis is used to optimize frequently accessed execution resources.

The Execution Module caches:

- Execution plans
- Milestones
- Project assets
- Submissions
- Pending reviews

Redis follows the Cache-Aside pattern and is never treated as the source of truth.

---

# Design Principles

The Execution Module follows the following principles:

- Agreements define **who** performs the work.
- Execution defines **how** the work is performed.
- Every milestone belongs to exactly one professional.
- Professionals execute milestones independently.
- Work progresses through controlled milestone transitions.
- Submission reviews control milestone progression.
- Original execution plans remain immutable.
- Deadline extensions are additive.
- Business rules reside in the service layer.
- Controllers remain thin.
- Repositories own persistence.
- Redis follows the Cache-Aside pattern.
- Audit history is immutable.
- Notifications are published only after successful transaction commits.
- PostgreSQL remains the source of truth.

---

# Current Scope

The current implementation includes:

- Execution planning
- Milestone management
- Automatic milestone progression
- Automatic project completion
- Project asset management
- Asset visibility management
- Work submissions
- Submission reviews
- Revision requests
- Milestone extensions
- Execution notifications
- Redis caching
- Socket events
- Permission enforcement
- Immutable execution auditing
- Transactional execution

####################################################################################################################

# Phase 2 — System Architecture

# Execution System Architecture

The Execution Module orchestrates the complete execution lifecycle of a project after an agreement has been finalized.

It provides a layered architecture that separates HTTP handling, business logic, persistence, caching, event publishing, notifications, and real-time communication into independent components.

The architecture emphasizes transactional consistency, clear separation of concerns, scalability, and maintainability.

---

# Architecture Overview

```text
                    Client
                      │
                      ▼
            Authentication Middleware
                      │
                      ▼
                 Controller Layer
                      │
                      ▼
                Validation Layer
                      │
                      ▼
                 Service Layer
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
 Business Rules  Permission   Transactions
                      │
                      ▼
               Repository Layer
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   PostgreSQL      Redis      Cloudinary
                      │
                      ▼
              Transaction Commit
                      │
                      ▼
            Execution Publisher
                      │
                      ▼
                  BullMQ Queue
                      │
                      ▼
               Event Processor
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
 Notification   Socket Events   Dashboard
```

---

# Layer Responsibilities

## Controller Layer

Responsible for:

- Receiving HTTP requests
- Authentication
- Request validation
- Calling application services
- Publishing execution events after successful transactions
- Returning standardized API responses

Controllers never contain business rules.

---

## Validation Layer

Responsible for validating:

- Request DTOs
- File uploads
- Project identifiers
- Milestone identifiers
- Submission requests
- Extension requests
- Asset visibility
- Pagination parameters

Validation occurs before business logic executes.

---

## Service Layer

The Service Layer contains every business rule implemented by the Execution Module.

Responsible for:

- Execution planning
- Milestone management
- Submission workflow
- Submission review
- Revision handling
- Milestone extensions
- Project asset management
- Automatic milestone progression
- Automatic project completion
- Permission enforcement
- Cache invalidation
- Audit generation
- Transaction management

Every business rule belongs here.

---

## Repository Layer

Repositories communicate directly with PostgreSQL.

Responsible for:

- CRUD operations
- Optimized queries
- Relationship loading
- Cursor pagination
- Soft deletion
- Transaction participation

Repositories never contain business logic.

---

## Cache Layer

Redis is used only as a read cache.

Responsible for caching:

- Execution plans
- Milestones
- Project assets
- Submissions
- Pending reviews

Redis is never treated as the source of truth.

---

## Event Publishing Layer

Execution Publishers are responsible for publishing execution events after successful database commits.

Events include:

- Execution Plan Created
- Execution Plan Updated
- Project Asset Shared
- Submission Created
- Revision Requested
- Milestone Completed
- Milestone Started
- Milestone Extension Granted

Publishers never execute inside database transactions.

---

## Notification Layer

Execution notifications are processed asynchronously.

Responsible for:

- Resolving recipients
- Building notification payloads
- Persisting notifications
- Triggering socket delivery

Notifications are generated only after successful transaction commits.

---

## Socket Layer

Responsible for broadcasting execution events to connected users.

Examples include:

- New submissions
- Revision requests
- Milestone completion
- Milestone progression
- New notifications

Socket communication never modifies business data.

---

# Request Lifecycle

Every execution request follows the same lifecycle.

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
Validation
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
Database Transaction
    │
    ▼
Commit
    │
    ▼
Cache Invalidation
    │
    ▼
Execution Publisher
    │
    ▼
BullMQ
    │
    ▼
Event Processor
    │
    ▼
Notification Creation
    │
    ▼
Socket Broadcast
    │
    ▼
Response
```

---

# Transaction Architecture

Every mutating operation executes inside a Prisma transaction.

Examples include:

- Create execution plan
- Update execution plan
- Create submission
- Approve submission
- Request revision
- Grant milestone extension
- Upload project assets
- Add project asset files
- Delete project assets

Transactions guarantee atomic execution.

If any operation fails, all database changes are rolled back.

---

# Event Architecture

Execution events are published only after successful transaction commits.

```text
Database Transaction
        │
        ▼
Successful Commit
        │
        ▼
Execution Publisher
        │
        ▼
BullMQ
        │
        ▼
Event Processor
        │
        ▼
Notification Factory
        │
        ▼
Recipient Resolver
        │
        ▼
Notification Service
        │
        ▼
Socket Broadcast
```

This guarantees that notifications are never generated for rolled-back transactions.

---

# Cache Strategy

Execution follows the Cache-Aside Pattern.

## Read Flow

```text
Redis
   │
Hit?
 │      │
Yes     No
 │       │
 ▼       ▼
Return PostgreSQL
         │
         ▼
   Populate Cache
         │
         ▼
      Response
```

---

## Write Flow

```text
Transaction
      │
      ▼
Commit
      │
      ▼
Invalidate Cache
      │
      ▼
Publish Event
      │
      ▼
Future Read
      │
      ▼
Fresh Cache
```

Redis is always rebuilt from PostgreSQL.

---

# Notification Flow

```text
Execution Event
        │
        ▼
Execution Publisher
        │
        ▼
BullMQ Queue
        │
        ▼
Execution Event Processor
        │
        ▼
Notification Factory
        │
        ▼
Recipient Resolution
        │
        ▼
Notification Persistence
        │
        ▼
Socket Delivery
```

Notifications execute asynchronously and never block API responses.

---

# File Storage

Project assets are stored externally.

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

Only metadata is stored in PostgreSQL.

Binary files remain in Cloudinary.

---

# Audit Architecture

Every significant execution mutation creates an immutable audit record.

Examples include:

- Execution plan created
- Execution plan updated
- Submission created
- Submission approved
- Revision requested
- Milestone extension granted
- Project asset uploaded
- Asset deleted

Audit records are append-only.

---

# Error Handling

Execution services throw standardized application errors.

Validation failures immediately terminate request processing.

Transactions automatically roll back on failure.

Uploaded Cloudinary files are cleaned up whenever database persistence fails after upload.

Notifications are never published for failed transactions.

---

# Design Principles

The Execution Module follows these architectural principles.

## Thin Controllers

Controllers coordinate requests and responses only.

---

## Rich Services

Business rules remain centralized inside services.

---

## Repository Isolation

Repositories communicate only with PostgreSQL.

---

## Atomic Transactions

Every mutating operation is fully transactional.

---

## Event-Driven Notifications

Notifications are published only after successful commits.

---

## Cache-Aside Pattern

Redis improves read performance without becoming the source of truth.

---

## External File Storage

Binary files remain outside PostgreSQL.

---

## Immutable Audits

Execution history cannot be modified.

---

## Permission-First Design

Authorization is validated before any business logic executes.

---

# Current Scope

The current architecture supports:

- Execution planning
- Milestone management
- Submission workflow
- Submission review
- Revision handling
- Milestone extensions
- Project asset management
- Redis caching
- Cloudinary integration
- BullMQ event publishing
- Notification generation
- Socket broadcasting
- Immutable audit logging
- Transaction management

####################################################################################################################


# Phase 3 — Business Rules

# Execution Business Rules

The Execution Module governs how project work is planned, executed, reviewed, revised, and completed after an agreement has been finalized.

Every rule documented in this phase is enforced by the service layer.

Execution is responsible for operational project delivery and does not manage commercial agreements, payments, or disputes.

---

# Execution Plan Rules

## Rule 1

Every project can have exactly one execution plan.

Execution planning is performed once and may subsequently be updated while the project remains in an editable setup stage.

---

## Rule 2

Execution planning is available only after the agreement has been signed and project participants have been finalized.

---

## Rule 3

Every milestone must belong to exactly one assigned professional.

Milestones cannot exist without a valid agreement participant.

---

## Rule 4

Execution plan creation and updates execute inside a single database transaction.

If any milestone fails validation, the complete operation is rolled back.

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

Milestones are ordered independently for each professional.

Each professional maintains their own execution sequence.

---

## Rule 4

Milestone order must be unique for each professional.

Duplicate ordering is rejected.

---

## Rule 5

Every milestone must define:

- Allocated days
- Payment allocation
- Revision limit

These values are mandatory.

---

## Rule 6

Allocated days must be greater than zero.

---

## Rule 7

Payment allocation cannot be negative.

---

## Rule 8

Revision limits cannot be negative.

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

The milestone has not begun.

Work submissions are not allowed.

---

## IN_PROGRESS

The milestone is actively being executed.

Submissions are permitted.

---

## SUBMITTED

The professional has submitted work.

Additional submissions are blocked until review completes.

---

## COMPLETED

The milestone has been approved.

Completed milestones become immutable.

---

# Milestone Progression Rules

## Rule 1

The first milestone for every professional automatically starts when project execution begins.

---

## Rule 2

Approving a milestone automatically starts the next milestone belonging to the same professional.

---

## Rule 3

Professionals execute milestones independently.

Completing one professional's milestone never affects another professional's execution sequence.

---

## Rule 4

If no additional milestone exists for a professional, no new milestone is started.

---

## Rule 5

When every milestone reaches COMPLETED, the project is automatically marked as completed.

---

# Submission Rules

## Rule 1

Only the professional assigned to a milestone may submit work.

---

## Rule 2

Submissions are allowed only while the milestone is IN_PROGRESS.

---

## Rule 3

Each submission belongs to exactly one milestone.

---

## Rule 4

Each submission records its submission timestamp.

---

## Rule 5

Submission timing is determined by comparing the submission timestamp against the calculated milestone deadline.

---

## Rule 6

Submission timing is permanently stored.

Submission timing never changes after creation.

---

## Rule 7

Submitting work changes the milestone status to SUBMITTED.

---

# Submission Review Rules

## Rule 1

Only the project client may review submitted work.

---

## Rule 2

A submission may be:

- Approved
- Returned for revision

No additional review outcomes exist.

---

## Rule 3

Approving a submission permanently completes the milestone.

---

## Rule 4

Completed milestones cannot return to previous states.

---

# Revision Rules

## Rule 1

Revision requests may only be created while reviewing a submitted milestone.

---

## Rule 2

Every revision increments the milestone revision count.

---

## Rule 3

Revision requests cannot exceed the milestone revision limit.

---

## Rule 4

After a revision request, the milestone returns to the IN_PROGRESS state.

---

## Rule 5

Professionals must submit a new submission after every revision request.

---

# Milestone Extension Rules

## Rule 1

Extensions only increase milestone execution duration.

---

## Rule 2

Original allocated days are never modified.

---

## Rule 3

Extensions are cumulative.

---

## Rule 4

Every approved extension creates an immutable extension record.

---

## Rule 5

Effective milestone deadlines are calculated dynamically.

---

## Rule 6

Extensions cannot be edited or deleted.

---

# Project Asset Rules

## Rule 1

Only the project client may upload project assets.

---

## Rule 2

Every project asset belongs to exactly one project.

---

## Rule 3

Every project asset may contain one or more uploaded files.

---

## Rule 4

Every uploaded file is stored externally.

Only metadata is stored in PostgreSQL.

---

## Rule 5

Asset visibility is configured independently for every project asset.

---

## Rule 6

Professionals only receive assets explicitly shared with them.

---

## Rule 7

Clients always receive every project asset.

---

## Rule 8

Project assets are soft deleted.

Historical execution information remains available.

---

# Notification Rules

## Rule 1

Notifications are generated only after successful transaction commits.

---

## Rule 2

Failed transactions never generate notifications.

---

## Rule 3

Execution notifications are delivered asynchronously.

---

## Rule 4

Notification recipients are determined according to the execution event.

---

## Rule 5

Execution notifications never modify business data.

---

# Audit Rules

Every significant execution operation creates an immutable execution audit.

Examples include:

- Execution plan created
- Execution plan updated
- Submission created
- Submission approved
- Revision requested
- Milestone extension granted
- Project asset uploaded
- Project asset deleted

Audit records cannot be modified or deleted.

---

# Cache Rules

Execution caches are invalidated whenever:

- Execution plans change
- Milestones change
- Submissions change
- Pending reviews change
- Project assets change
- Asset visibility changes
- Milestone extensions are granted

Redis always reloads data from PostgreSQL.

---

# Transaction Rules

The following operations execute inside database transactions.

- Create execution plan
- Update execution plan
- Create submission
- Approve submission
- Request revision
- Grant milestone extension
- Create project asset
- Upload project asset files
- Delete project asset

Every transaction is atomic.

Partial execution is never committed.

---

# Permission Rules

## Client

Allowed to:

- Manage execution plans
- Review submissions
- Request revisions
- Grant milestone extensions
- Manage project assets
- View all execution resources

---

## Professional

Allowed to:

- View assigned milestones
- Access shared assets
- Submit work
- View revision requests

Professionals cannot:

- Modify execution plans
- Review submissions
- Grant extensions
- Manage project assets

---

# Security Rules

The Execution Module enforces:

- Authentication
- Workspace membership validation
- Agreement participation validation
- Resource ownership validation
- Asset visibility validation
- Server-side file validation
- Immutable audit history
- Soft deletion

---

# Current Scope

The current implementation includes:

- Execution planning
- Milestone management
- Automatic milestone progression
- Automatic project completion
- Work submissions
- Submission reviews
- Revision requests
- Milestone extensions
- Project asset management
- Asset visibility
- Execution notifications
- Redis caching
- Socket broadcasting
- Immutable audit logging
- Transactional execution

####################################################################################################################

# Phase 4 — Database Design

# Execution Database Design

The Execution Module persists every execution-specific resource required to plan, execute, review, revise, and complete project work.

The database design separates planning, execution, submissions, project assets, visibility management, milestone extensions, and audit history into independent entities while maintaining clear relationships between them.

This design supports transactional consistency, scalability, and future extensibility.

---

# Entity Relationship

```text
Project
│
├──────────────────────────────────────────────┐
│                                              │
▼                                              ▼
Milestone                                 ProjectAsset
│                                              │
│                                              ├──────────────┐
│                                              │              │
▼                                              ▼              ▼
MilestoneSubmission                  ProjectAssetFile   ProjectAssetVisibility
│
├──────────────┐
│              │
▼              ▼
SubmissionAttachment
MilestoneExtension

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
| order | Professional milestone order |
| title | Milestone title |
| description | Milestone description |
| allocatedDays | Original execution duration |
| extensionDays | Total granted extension days |
| paymentAllocation | Allocated payment |
| revisionLimit | Maximum revisions |
| revisionCount | Current revisions |
| status | Execution status |
| startedAt | Execution start |
| completedAt | Completion timestamp |
| createdById | Creator |
| updatedById | Last updater |
| createdAt | Creation timestamp |
| updatedAt | Last modification |
| deletedAt | Soft delete timestamp |

---

# Milestone Submission

Represents a professional's work submission for a milestone.

Each submission belongs to exactly one milestone.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Submission identifier |
| milestoneId | Parent milestone |
| submittedById | Professional |
| comment | Submission notes |
| timing | ON_TIME or LATE |
| submittedAt | Submission timestamp |
| createdAt | Creation timestamp |

---

# Submission Attachment

Stores uploaded submission file metadata.

Binary files remain in Cloudinary.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Attachment identifier |
| submissionId | Parent submission |
| publicId | Cloudinary identifier |
| url | File URL |
| originalName | Original filename |
| mimeType | MIME type |
| extension | File extension |
| size | File size |
| uploadedAt | Upload timestamp |

---

# Milestone Extension

Represents every approved extension granted to a milestone.

Each extension permanently records one approval.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Extension identifier |
| milestoneId | Parent milestone |
| daysAdded | Additional execution days |
| reason | Business justification |
| approvedById | Client granting extension |
| createdAt | Approval timestamp |

---

# Project Asset

Represents a logical execution resource shared with professionals.

A project asset groups one or more uploaded files.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Asset identifier |
| projectId | Parent project |
| title | Asset title |
| description | Asset description |
| createdById | Client |
| createdAt | Creation timestamp |
| updatedAt | Last update |
| deletedAt | Soft delete timestamp |

---

# Project Asset File

Stores uploaded asset metadata.

Actual binary files remain in Cloudinary.

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

Each record grants one professional access to one project asset.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Visibility identifier |
| projectId | Parent project |
| projectAssetId | Parent asset |
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
| action | Audit event |
| metadata | Additional information |
| createdAt | Event timestamp |

---

# Relationships

```text
Project

├── 1:N Milestones

├── 1:N Project Assets

└── 1:N Execution Audits
```

---

```text
Milestone

├── 1:N Milestone Submissions

└── 1:N Milestone Extensions
```

---

```text
Milestone Submission

└── 1:N Submission Attachments
```

---

```text
Project Asset

├── 1:N Asset Files

└── 1:N Asset Visibility
```

---

```text
Agreement Participant

├── 1:N Milestones

└── 1:N Project Asset Visibility
```

---

# Soft Delete Strategy

The following entities support soft deletion.

- Milestone
- Project Asset

Historical execution information remains available.

The following entities are permanently retained.

- Milestone Submission
- Submission Attachment
- Milestone Extension
- Project Asset File
- Project Asset Visibility
- Execution Audit

---

# Index Strategy

Indexes exist on frequently queried fields.

## Milestone

- projectId
- agreementParticipantId
- status
- order

---

## Submission

- milestoneId
- submittedById
- submittedAt

---

## Submission Attachment

- submissionId

---

## Milestone Extension

- milestoneId

---

## Project Asset

- projectId
- createdById

---

## Project Asset File

- projectAssetId

---

## Project Asset Visibility

- projectAssetId
- agreementParticipantId

---

## Execution Audit

- projectId
- actorId
- createdAt

---

# Cache Keys

The Execution Module caches read-heavy resources.

| Resource | Cache Key |
|----------|-----------|
| Execution Plan | execution:plan:{projectId} |
| Milestones | execution:milestones:{projectId} |
| Project Assets | execution:assets:{projectId} |
| Submission | execution:submission:{submissionId} |
| Pending Reviews | execution:pending-reviews:{projectId} |

---

# Transaction Boundaries

The following operations execute atomically.

## Execution Plan

Creates

- Milestones
- Audit records

---

## Submission

Creates

- Submission
- Attachments
- Audit

---

## Submission Approval

Updates

- Submission
- Milestone
- Next milestone

Creates

- Audit

---

## Revision Request

Updates

- Submission
- Milestone

Creates

- Audit

---

## Milestone Extension

Creates

- Extension
- Audit

Updates

- Milestone extension days

---

## Project Asset Upload

Creates

- Project Asset
- Asset Files
- Visibility
- Audit

---

## Project Asset Deletion

Updates

- Project Asset (Soft Delete)

Creates

- Audit

---

# Storage Architecture

```text
PostgreSQL

│

├── Milestones

├── Milestone Submissions

├── Submission Attachments

├── Milestone Extensions

├── Project Assets

├── Project Asset Files

├── Project Asset Visibility

└── Execution Audit
```

```text
Cloudinary

│

├── Submission Attachments

└── Project Asset Files
```

Redis stores cached execution data only.

---

# Design Decisions

## Separate Submission Attachments

Submission files are stored independently from submissions.

This allows:

- Multiple attachments
- Independent file validation
- Efficient storage

---

## Separate Asset Visibility

Visibility is normalized into a dedicated table.

This supports:

- Multiple professionals per asset
- Unlimited assets per professional
- Efficient permission validation

---

## Immutable Audit

Execution history is append-only.

Historical records are never modified.

---

## Metadata Storage

Only metadata is persisted in PostgreSQL.

Binary content remains in Cloudinary.

---

# Current Scope

The current implementation includes:

- Milestones
- Milestone Submissions
- Submission Attachments
- Milestone Extensions
- Project Assets
- Project Asset Files
- Project Asset Visibility
- Execution Audit
- Redis caching
- Cloudinary integration

####################################################################################################################

# Phase 5 — API Documentation

# Execution API Documentation

The Execution Module exposes REST APIs responsible for planning, executing, reviewing, and completing project work.

All APIs require authenticated users.

Permission checks are enforced before any business logic executes.

Every mutating API executes inside a database transaction where applicable and generates execution audit records.

Notifications are published only after successful transaction commits.

---

# Authentication

Every endpoint requires a valid JWT Access Token.

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

The Execution Plan APIs are responsible for transforming an approved project into an executable work plan.

Execution planning defines milestone structure, professional assignments, execution order, revision policies, and payment allocations.

Only the project client may manage execution plans.

---

# Create Execution Plan

Creates the initial execution plan for a project.

---

## Endpoint

```http
POST /projects/:projectId/execution-plan
```

---

## Authentication

Required

---

## Permissions

Project Client only.

---

## Path Parameters

| Parameter | Description |
|------------|-------------|
| projectId | Target project identifier |

---

## Request Body

```json
{
  "milestones": [
    {
      "agreementParticipantId": "...",
      "title": "Backend Development",
      "description": "Develop authentication module",
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
- Agreement must be finalized.
- Project participants must already exist.
- Every milestone must belong to an assigned professional.
- Milestone order must be unique for each professional.
- Every milestone requires allocated days.
- Every milestone requires payment allocation.
- Every milestone requires revision limit.
- Entire operation executes inside a single transaction.

---

## Validation Rules

Validates:

- Project identifier
- Agreement participant identifiers
- Milestone ordering
- Positive allocated days
- Non-negative payment allocation
- Non-negative revision limits

---

## Database Changes

Creates:

- Milestones
- Deliverables
- Requirements
- Acceptance Criteria
- Execution Audit

Updates:

- Project setup stage

---

## Cache Operations

Invalidates

```text
execution:plan:{projectId}

execution:milestones:{projectId}
```

---

## Audit Events

Creates

```text
EXECUTION_PLAN_CREATED
```

---

## Notification Events

Publishes

```text
Execution Plan Created
```

Notification is generated only after the database transaction commits successfully.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|INVALID_PROJECT_SETUP_STAGE|Execution planning not allowed|
|400|INVALID_MILESTONE|Milestone validation failed|
|400|DUPLICATE_MILESTONE_ORDER|Duplicate milestone ordering|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only project client may create execution plans|
|404|PROJECT_NOT_FOUND|Project does not exist|

---

# Update Execution Plan

Updates an existing execution plan.

The previous execution structure is replaced with the newly supplied execution plan.

---

## Endpoint

```http
PUT /projects/:projectId/execution-plan
```

---

## Authentication

Required

---

## Permissions

Project Client only.

---

## Path Parameters

| Parameter | Description |
|------------|-------------|
| projectId | Target project identifier |

---

## Request Body

Same structure as Create Execution Plan.

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

- Project must exist.
- Execution plan must already exist.
- Existing milestones are replaced.
- Validation completes before persistence.
- Entire operation executes inside a transaction.

---

## Validation Rules

Validates:

- Project identifier
- Milestone ordering
- Agreement participant assignments
- Positive allocated days
- Revision limits
- Payment allocation

---

## Database Changes

Updates:

- Milestones
- Deliverables
- Requirements
- Acceptance Criteria

Creates:

- Execution Audit

---

## Cache Operations

Invalidates

```text
execution:plan:{projectId}

execution:milestones:{projectId}
```

---

## Audit Events

Creates

```text
EXECUTION_PLAN_UPDATED
```

---

## Notification Events

Publishes

```text
Execution Plan Updated
```

Notification is generated only after the transaction commits successfully.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|INVALID_EXECUTION_PLAN|Execution plan cannot be updated|
|400|INVALID_MILESTONE|Milestone validation failed|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only project client may update execution plans|
|404|PROJECT_NOT_FOUND|Project does not exist|

---

# Get Execution Plan

Returns the complete execution plan belonging to a project.

Clients receive the complete execution plan.

Professionals receive only milestones assigned to them.

---

## Endpoint

```http
GET /projects/:projectId/execution-plan
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Assigned Professionals

---

## Path Parameters

| Parameter | Description |
|------------|-------------|
| projectId | Target project identifier |

---

## Success Response

```json
{
  "success": true,
  "data": {
    "milestones": []
  }
}
```

---

## Business Rules

- Clients receive every milestone.
- Professionals receive only milestones assigned to them.
- Soft-deleted milestones are excluded.

---

## Validation Rules

Validates:

- Project identifier
- Workspace membership
- Agreement participation

---

## Database Changes

None.

Read-only operation.

---

## Cache Operations

Reads

```text
execution:plan:{projectId}
```

On cache miss:

- Load from PostgreSQL.
- Populate Redis.
- Return response.

---

## Audit Events

None.

---

## Notification Events

None.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|User cannot access execution plan|
|404|PROJECT_NOT_FOUND|Project does not exist|

---

# Execution Plan API Summary

| Endpoint | Method | Permission |
|-----------|--------|------------|
|/projects/:projectId/execution-plan|POST|Project Client|
|/projects/:projectId/execution-plan|PUT|Project Client|
|/projects/:projectId/execution-plan|GET|Project Client / Assigned Professional|

# Milestone APIs

The Milestone APIs allow project participants to retrieve milestone information throughout project execution.

Milestone creation and modification are performed through the Execution Plan APIs.

Professionals can only access milestones assigned to them.

Project clients can access every milestone belonging to the project.

---

# List Project Milestones

Returns every accessible milestone belonging to a project.

Project clients receive all milestones.

Professionals receive only milestones assigned to them.

---

## Endpoint

```http
GET /projects/:projectId/milestones
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Assigned Professionals

---

## Path Parameters

| Parameter | Description |
|------------|-------------|
| projectId | Target project identifier |

---

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter milestones by status |
| cursor | string | No | Cursor for pagination |
| limit | number | No | Number of records per request |

---

## Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": "...",
            "title": "Backend Development",
            "status": "IN_PROGRESS"
        }
    ],
    "pagination": {
        "nextCursor": "..."
    }
}
```

---

## Business Rules

- Project must exist.
- Soft deleted milestones are excluded.
- Clients receive every milestone.
- Professionals receive only assigned milestones.
- Results are ordered by milestone sequence.

---

## Validation Rules

Validates:

- Project identifier
- Workspace membership
- Agreement participation
- Pagination parameters

---

## Database Changes

None.

Read-only operation.

---

## Cache Operations

Reads

```text
execution:milestones:{projectId}
```

On cache miss:

- Load milestones from PostgreSQL.
- Populate Redis.
- Return response.

---

## Audit Events

None.

---

## Notification Events

None.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Access denied|
|404|PROJECT_NOT_FOUND|Project not found|

---

# Get Milestone

Returns detailed information for a single milestone.

---

## Endpoint

```http
GET /projects/:projectId/milestones/:milestoneId
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Assigned Professional

---

## Path Parameters

| Parameter | Description |
|------------|-------------|
| projectId | Target project identifier |
| milestoneId | Target milestone identifier |

---

## Success Response

```json
{
    "success": true,
    "data": {
        "id": "...",
        "title": "Backend Development",
        "description": "...",
        "status": "IN_PROGRESS",
        "allocatedDays": 10,
        "extensionDays": 2,
        "revisionLimit": 2,
        "revisionCount": 1,
        "paymentAllocation": 25000,
        "startedAt": "...",
        "completedAt": null
    }
}
```

---

## Business Rules

- Milestone must belong to the specified project.
- Clients may access every milestone.
- Professionals may access only milestones assigned to them.
- Soft deleted milestones cannot be retrieved.

---

## Validation Rules

Validates:

- Project identifier
- Milestone identifier
- Workspace membership
- Agreement participation

---

## Database Changes

None.

Read-only operation.

---

## Cache Operations

Reads

```text
execution:milestones:{projectId}
```

If unavailable:

- Load from PostgreSQL.
- Store in Redis.
- Return response.

---

## Audit Events

None.

---

## Notification Events

None.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Access denied|
|404|PROJECT_NOT_FOUND|Project not found|
|404|MILESTONE_NOT_FOUND|Milestone not found|

---

# Milestone API Summary

| Endpoint | Method | Permission |
|-----------|--------|------------|
|/projects/:projectId/milestones|GET|Project Client / Assigned Professional|
|/projects/:projectId/milestones/:milestoneId|GET|Project Client / Assigned Professional|


# Submission APIs

The Submission APIs manage the complete work submission lifecycle during project execution.

Professionals submit completed milestone work through these APIs, while project clients review submissions by either approving the work or requesting revisions.

Submission APIs directly control milestone progression and project completion.

---

# Create Submission

Creates a new work submission for a milestone.

Only the professional assigned to the milestone may perform this operation.

---

## Endpoint

```http
POST /projects/:projectId/milestones/:milestoneId/submissions
```

---

## Authentication

Required

---

## Permissions

Assigned Professional only.

---

## Path Parameters

| Parameter | Description |
|------------|-------------|
| projectId | Target project identifier |
| milestoneId | Target milestone identifier |

---

## Request Body

Multipart Form Data

```text
comment

attachments[]
```

---

## Success Response

```json
{
    "success": true,
    "message": "Submission created successfully."
}
```

---

## Business Rules

- Milestone must exist.
- Milestone must belong to the specified project.
- User must be assigned to the milestone.
- Milestone must be IN_PROGRESS.
- Submission timing is calculated automatically.
- Milestone status changes to SUBMITTED.
- Entire operation executes inside a transaction.

---

## Validation Rules

Validates:

- Project identifier
- Milestone identifier
- Assigned professional
- Milestone status
- Uploaded files

---

## Database Changes

Creates:

- Milestone Submission
- Submission Attachments
- Execution Audit

Updates:

- Milestone Status
- Submission Timestamp

---

## Cache Operations

Invalidates

```text
execution:submission:{submissionId}

execution:milestones:{projectId}

execution:pending-reviews:{projectId}
```

---

## Audit Events

Creates

```text
SUBMISSION_CREATED
```

---

## Notification Events

Publishes

```text
Submission Created
```

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|INVALID_MILESTONE_STATUS|Submission not allowed|
|400|INVALID_SUBMISSION|Submission validation failed|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only assigned professional may submit|
|404|PROJECT_NOT_FOUND|Project not found|
|404|MILESTONE_NOT_FOUND|Milestone not found|

---

# List Milestone Submissions

Returns every submission created for a milestone.

Clients receive all submissions.

Professionals receive only their own submissions.

---

## Endpoint

```http
GET /projects/:projectId/milestones/:milestoneId/submissions
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Assigned Professional

---

## Query Parameters

| Parameter | Description |
|------------|-------------|
| cursor | Cursor pagination |
| limit | Maximum results |

---

## Success Response

```json
{
    "success": true,
    "data": [],
    "pagination": {}
}
```

---

## Business Rules

- Soft deleted submissions are excluded.
- Results are ordered newest first.
- Cursor pagination is used.

---

## Database Changes

None.

---

## Cache Operations

Reads

```text
execution:submission:{milestoneId}
```

---

## Audit Events

None.

---

## Notification Events

None.

---

# Get Submission

Returns a specific submission.

---

## Endpoint

```http
GET /projects/:projectId/submissions/:submissionId
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Submission Owner

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

- Submission must belong to the requested project.
- Professionals may access only their own submissions.
- Clients may access every submission.

---

## Database Changes

None.

---

## Cache Operations

Reads

```text
execution:submission:{submissionId}
```

---

## Audit Events

None.

---

## Notification Events

None.

---

# Approve Submission

Approves submitted work and completes the milestone.

If another milestone exists for the same professional, it automatically begins execution.

---

## Endpoint

```http
POST /projects/:projectId/submissions/:submissionId/approve
```

---

## Authentication

Required

---

## Permissions

Project Client only.

---

## Success Response

```json
{
    "success": true,
    "message": "Submission approved successfully."
}
```

---

## Business Rules

- Submission must be pending review.
- Milestone becomes COMPLETED.
- Completion timestamp is recorded.
- Next milestone automatically starts.
- Project automatically completes when every milestone is completed.
- Entire operation executes inside one transaction.

---

## Database Changes

Updates:

- Submission
- Milestone
- Next Milestone
- Project Status (when applicable)

Creates:

- Execution Audit

---

## Cache Operations

Invalidates

```text
execution:submission:{submissionId}

execution:milestones:{projectId}

execution:pending-reviews:{projectId}
```

---

## Audit Events

Creates

```text
SUBMISSION_APPROVED
```

---

## Notification Events

Publishes

```text
Milestone Completed

Milestone Started
```

Milestone Started is published only when another milestone exists.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|INVALID_SUBMISSION|Submission cannot be approved|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only project client may approve|
|404|SUBMISSION_NOT_FOUND|Submission not found|

---

# Request Revision

Requests modifications to submitted work.

The milestone returns to the IN_PROGRESS state.

---

## Endpoint

```http
POST /projects/:projectId/submissions/:submissionId/revision
```

---

## Authentication

Required

---

## Permissions

Project Client only.

---

## Request Body

```json
{
    "comment": "Please improve API validation."
}
```

---

## Success Response

```json
{
    "success": true,
    "message": "Revision requested successfully."
}
```

---

## Business Rules

- Submission must be pending review.
- Revision limit must not be exceeded.
- Revision count increases.
- Milestone returns to IN_PROGRESS.
- Professional must submit new work.

---

## Database Changes

Updates:

- Submission
- Milestone

Creates:

- Revision Record
- Execution Audit

---

## Cache Operations

Invalidates

```text
execution:submission:{submissionId}

execution:milestones:{projectId}

execution:pending-reviews:{projectId}
```

---

## Audit Events

Creates

```text
REVISION_REQUESTED
```

---

## Notification Events

Publishes

```text
Revision Requested
```

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|REVISION_LIMIT_REACHED|Revision limit exceeded|
|400|INVALID_SUBMISSION|Submission cannot be revised|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only project client may request revision|

---

# Get Pending Reviews

Returns every submission currently awaiting client review.

---

## Endpoint

```http
GET /projects/:projectId/pending-reviews
```

---

## Authentication

Required

---

## Permissions

Project Client only.

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

- Only submissions awaiting review are returned.
- Results are ordered by submission time.
- Cursor pagination is supported.

---

## Database Changes

None.

---

## Cache Operations

Reads

```text
execution:pending-reviews:{projectId}
```

---

## Audit Events

None.

---

## Notification Events

None.

---

# Submission API Summary

| Endpoint | Method | Permission |
|-----------|--------|------------|
|/projects/:projectId/milestones/:milestoneId/submissions|POST|Assigned Professional|
|/projects/:projectId/milestones/:milestoneId/submissions|GET|Project Client / Assigned Professional|
|/projects/:projectId/submissions/:submissionId|GET|Project Client / Submission Owner|
|/projects/:projectId/submissions/:submissionId/approve|POST|Project Client|
|/projects/:projectId/submissions/:submissionId/revision|POST|Project Client|
|/projects/:projectId/pending-reviews|GET|Project Client|

# Milestone Extension APIs

The Milestone Extension APIs manage deadline extension requests during project execution.

Extensions provide a structured mechanism for professionals to request additional execution time while preserving accountability and maintaining a complete audit history.

An extension request follows the approval workflow below.

```text
Professional Requests Extension
                │
                ▼
      Extension Request Created
                │
                ▼
      Client Reviews Request
          │             │
          ▼             ▼
      Approved       Rejected
          │
          ▼
 Milestone Deadline Updated
```

Every extension request is immutable after a decision has been made.

---

# Request Milestone Extension

Creates a new extension request for a milestone.

Only the professional assigned to the milestone may request an extension.

---

## Endpoint

```http
POST /projects/:projectId/milestones/:milestoneId/extensions
```

---

## Authentication

Required

---

## Permissions

Assigned Professional only.

---

## Path Parameters

| Parameter | Description |
|------------|-------------|
| projectId | Target project |
| milestoneId | Target milestone |

---

## Request Body

```json
{
    "requestedDays": 3,
    "reason": "Additional API integrations require more implementation time."
}
```

---

## Success Response

```json
{
    "success": true,
    "message": "Extension request submitted successfully."
}
```

---

## Business Rules

- Milestone must exist.
- User must be assigned to the milestone.
- Milestone must not be completed.
- Requested extension days must be greater than zero.
- A new extension request is created with PENDING status.
- No milestone deadline is modified until the request is approved.

---

## Validation Rules

Validates:

- Project identifier
- Milestone identifier
- Assigned professional
- Requested days
- Reason length

---

## Database Changes

Creates:

- Milestone Extension Request
- Execution Audit

---

## Cache Operations

Invalidates

```text
execution:milestones:{projectId}
```

---

## Audit Events

Creates

```text
EXTENSION_REQUEST_CREATED
```

---

## Notification Events

Publishes

```text
Extension Request Created
```

Notification is published after transaction commit.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|INVALID_EXTENSION_REQUEST|Extension request is invalid|
|400|MILESTONE_COMPLETED|Completed milestones cannot request extensions|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only assigned professional may request|
|404|PROJECT_NOT_FOUND|Project not found|
|404|MILESTONE_NOT_FOUND|Milestone not found|

---

# Review Extension Request

Approves or rejects an extension request.

Only the project client may perform this operation.

---

## Endpoint

```http
PATCH /projects/:projectId/extensions/:extensionRequestId
```

---

## Authentication

Required

---

## Permissions

Project Client only.

---

## Request Body

```json
{
    "decision": "APPROVED",
    "comment": "Approved due to additional integration work."
}
```

Possible decisions:

- APPROVED
- REJECTED

---

## Success Response

```json
{
    "success": true,
    "message": "Extension request reviewed successfully."
}
```

---

## Business Rules

- Request must exist.
- Request must be pending.
- Only the project client may review.
- Approved requests increase the milestone deadline.
- Rejected requests leave the deadline unchanged.
- Reviewed requests become immutable.
- Entire operation executes inside one transaction.

---

## Validation Rules

Validates:

- Extension request identifier
- Request status
- Decision value

---

## Database Changes

Updates:

- Extension Request Status
- Milestone Extension Days (Approval only)

Creates:

- Execution Audit

---

## Cache Operations

Invalidates

```text
execution:milestones:{projectId}
```

---

## Audit Events

Creates

```text
EXTENSION_GRANTED

or

EXTENSION_REJECTED
```

---

## Notification Events

Publishes

```text
Extension Granted

or

Extension Rejected
```

Notifications are published after transaction commit.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|INVALID_REQUEST_STATUS|Request already reviewed|
|400|INVALID_DECISION|Invalid review decision|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only project client may review|
|404|EXTENSION_REQUEST_NOT_FOUND|Request not found|

---

# List Extension Requests

Returns extension requests for a project.

Clients receive every request.

Professionals receive only requests related to their milestones.

---

## Endpoint

```http
GET /projects/:projectId/extensions
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Assigned Professionals

---

## Query Parameters

| Parameter | Description |
|-----------|-------------|
| status | Filter by PENDING, APPROVED, REJECTED |
| cursor | Cursor pagination |
| limit | Maximum records |

---

## Success Response

```json
{
    "success": true,
    "data": [],
    "pagination": {}
}
```

---

## Business Rules

- Clients receive every extension request.
- Professionals receive only their own requests.
- Results are ordered by creation date.
- Cursor pagination is used.

---

## Database Changes

None.

Read-only operation.

---

## Cache Operations

Reads

```text
execution:extensions:{projectId}
```

---

## Audit Events

None.

---

## Notification Events

None.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Access denied|
|404|PROJECT_NOT_FOUND|Project not found|

---

# Milestone Extension API Summary

| Endpoint | Method | Permission |
|-----------|--------|------------|
|/projects/:projectId/milestones/:milestoneId/extensions|POST|Assigned Professional|
|/projects/:projectId/extensions/:extensionRequestId|PATCH|Project Client|
|/projects/:projectId/extensions|GET|Project Client / Assigned Professional|

# Project Asset APIs

The Project Asset APIs manage project resources required during execution.

Project assets include documents, design files, reference materials, source archives, images, videos, and other resources required by professionals.

Only the project client may create, update, or delete project assets.

Professionals may only access assets explicitly shared with them.

Files are stored in Cloudinary while PostgreSQL stores only metadata.

---

# Create Project Asset

Creates a new project asset.

The asset may contain one or more uploaded files.

---

## Endpoint

```http
POST /projects/:projectId/assets
```

---

## Authentication

Required

---

## Permissions

Project Client only.

---

## Request

Multipart Form Data

```text
title

description

visibility

files[]
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

- Project must exist.
- Only project client may upload assets.
- At least one file is required.
- Asset visibility determines which professionals can access the files.
- Files are uploaded to Cloudinary.
- Metadata is stored inside PostgreSQL.
- Entire operation executes inside one transaction.

---

## Validation Rules

Validates:

- Title
- Description
- Uploaded files
- Allowed MIME types
- Maximum file size
- Visibility configuration

---

## Database Changes

Creates

- Project Asset
- Project Asset Files
- Project Asset Visibility
- Execution Audit

---

## Cache Operations

Invalidates

```text
execution:assets:{projectId}
```

---

## Audit Events

Creates

```text
PROJECT_ASSET_CREATED
```

---

## Notification Events

Publishes

```text
Project Asset Shared
```

Notification is published after transaction commit.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|INVALID_FILE|Unsupported file|
|400|FILE_TOO_LARGE|File exceeds limit|
|400|INVALID_VISIBILITY|Visibility configuration invalid|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only project client may upload assets|
|404|PROJECT_NOT_FOUND|Project not found|

---

# List Project Assets

Returns every asset accessible to the authenticated user.

Clients receive every project asset.

Professionals receive only assets shared with them.

---

## Endpoint

```http
GET /projects/:projectId/assets
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Assigned Professionals

---

## Query Parameters

| Parameter | Description |
|------------|-------------|
| cursor | Cursor pagination |
| limit | Maximum records |

---

## Success Response

```json
{
    "success": true,
    "data": [],
    "pagination": {}
}
```

---

## Business Rules

- Clients receive every asset.
- Professionals receive only authorized assets.
- Soft deleted assets are excluded.
- Cursor pagination is used.

---

## Database Changes

None.

---

## Cache Operations

Reads

```text
execution:assets:{projectId}
```

On cache miss

- Load from PostgreSQL.
- Store inside Redis.
- Return response.

---

## Audit Events

None.

---

## Notification Events

None.

---

# Get Project Asset

Returns detailed information for one project asset.

---

## Endpoint

```http
GET /projects/:projectId/assets/:assetId
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Authorized Professional

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

- Asset must belong to project.
- Professionals may only access explicitly shared assets.
- Soft deleted assets cannot be accessed.

---

## Database Changes

None.

---

## Cache Operations

Reads

```text
execution:assets:{projectId}
```

---

## Audit Events

None.

---

## Notification Events

None.

---

# Upload Additional Files

Uploads additional files to an existing project asset.

---

## Endpoint

```http
POST /projects/:projectId/assets/:assetId/files
```

---

## Authentication

Required

---

## Permissions

Project Client only.

---

## Request

Multipart Form Data

```text
files[]
```

---

## Success Response

```json
{
    "success": true,
    "message": "Files uploaded successfully."
}
```

---

## Business Rules

- Asset must exist.
- Asset must not be deleted.
- Files are uploaded to Cloudinary.
- Metadata is persisted in PostgreSQL.

---

## Validation Rules

Validates

- Uploaded files
- MIME type
- Extension
- File size

---

## Database Changes

Creates

- Project Asset Files

Creates

- Execution Audit

---

## Cache Operations

Invalidates

```text
execution:assets:{projectId}
```

---

## Audit Events

Creates

```text
PROJECT_ASSET_UPDATED
```

---

## Notification Events

Publishes

```text
Project Asset Updated
```

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|400|INVALID_FILE|Unsupported file|
|400|FILE_TOO_LARGE|File exceeds limit|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only project client may upload files|
|404|ASSET_NOT_FOUND|Asset not found|

---

# Delete Project Asset

Soft deletes a project asset.

Uploaded files remain stored for audit purposes.

---

## Endpoint

```http
DELETE /projects/:projectId/assets/:assetId
```

---

## Authentication

Required

---

## Permissions

Project Client only.

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

- Asset must exist.
- Asset is soft deleted.
- Historical execution records remain unchanged.
- Physical files are retained.

---

## Database Changes

Updates

- Project Asset

Creates

- Execution Audit

---

## Cache Operations

Invalidates

```text
execution:assets:{projectId}
```

---

## Audit Events

Creates

```text
PROJECT_ASSET_DELETED
```

---

## Notification Events

Publishes

```text
Project Asset Deleted
```

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Only project client may delete assets|
|404|ASSET_NOT_FOUND|Asset not found|

---

# Download Project Asset File

Downloads a project asset file.

Access is verified before a signed Cloudinary URL is generated.

---

## Endpoint

```http
GET /projects/:projectId/assets/files/:fileId/download
```

---

## Authentication

Required

---

## Permissions

- Project Client
- Authorized Professional

---

## Success Response

Returns a secure download URL.

---

## Business Rules

- File must belong to requested asset.
- User must have visibility permission.
- Download URLs are generated dynamically.
- Permanent public URLs are never exposed.

---

## Database Changes

None.

---

## Cache Operations

None.

---

## Audit Events

Optional

```text
PROJECT_ASSET_DOWNLOADED
```

---

## Notification Events

None.

---

## Error Responses

| HTTP | Error Code | Description |
|------|------------|-------------|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Access denied|
|404|FILE_NOT_FOUND|File not found|

---

# Project Asset API Summary

| Endpoint | Method | Permission |
|-----------|--------|------------|
|/projects/:projectId/assets|POST|Project Client|
|/projects/:projectId/assets|GET|Project Client / Assigned Professional|
|/projects/:projectId/assets/:assetId|GET|Project Client / Authorized Professional|
|/projects/:projectId/assets/:assetId/files|POST|Project Client|
|/projects/:projectId/assets/:assetId|DELETE|Project Client|
|/projects/:projectId/assets/files/:fileId/download|GET|Project Client / Authorized Professional|

# Execution API Reference

This section summarizes the common API behavior across the Execution Module.

All endpoints follow consistent response formats, HTTP status codes, authentication rules, transaction handling, caching strategies, notification publishing, and audit logging.

---

# Standard Success Response

All successful API responses follow a common structure.

```json
{
    "success": true,
    "message": "Operation completed successfully.",
    "data": {}
}
```

For paginated resources:

```json
{
    "success": true,
    "data": [],
    "pagination": {
        "nextCursor": "...",
        "hasNext": true
    }
}
```

---

# Standard Error Response

All error responses follow a unified format.

```json
{
    "success": false,
    "message": "Validation failed.",
    "error": {
        "code": "INVALID_REQUEST",
        "details": []
    }
}
```

---

# Authentication

Every endpoint requires a valid JWT Access Token.

```http
Authorization: Bearer <access_token>
```

Authentication is verified before authorization and business validation.

---

# Authorization Model

Execution APIs enforce role-based permissions.

| Role | Permissions |
|------|-------------|
| Project Client | Full execution management |
| Assigned Professional | Assigned milestones, submissions, extension requests, shared assets |
| Workspace Owner | No elevated execution permissions |
| Workspace Admin | No elevated execution permissions |

Execution permissions are derived from project participation rather than workspace hierarchy.

---

# HTTP Status Codes

| Status | Meaning |
|---------|----------|
|200|Request completed successfully|
|201|Resource created successfully|
|204|Resource deleted successfully|
|400|Validation failed|
|401|Authentication required|
|403|Permission denied|
|404|Resource not found|
|409|Business rule conflict|
|422|Invalid business state|
|500|Internal server error|

---

# Common Error Codes

## Authentication

| Code | Description |
|------|-------------|
|UNAUTHORIZED|Authentication required|
|INVALID_TOKEN|Invalid access token|
|TOKEN_EXPIRED|Access token expired|

---

## Authorization

| Code | Description |
|------|-------------|
|INSUFFICIENT_PERMISSIONS|Operation not permitted|
|PROJECT_ACCESS_DENIED|User is not a project participant|
|MILESTONE_ACCESS_DENIED|User cannot access milestone|
|ASSET_ACCESS_DENIED|User cannot access project asset|

---

## Project

| Code | Description |
|------|-------------|
|PROJECT_NOT_FOUND|Project does not exist|
|PROJECT_COMPLETED|Project already completed|
|INVALID_PROJECT_STAGE|Project is not in a valid execution stage|

---

## Milestone

| Code | Description |
|------|-------------|
|MILESTONE_NOT_FOUND|Milestone not found|
|INVALID_MILESTONE_STATUS|Milestone state invalid|
|MILESTONE_ALREADY_COMPLETED|Milestone already completed|

---

## Submission

| Code | Description |
|------|-------------|
|SUBMISSION_NOT_FOUND|Submission not found|
|INVALID_SUBMISSION|Submission validation failed|
|REVISION_LIMIT_REACHED|Maximum revisions exceeded|

---

## Extensions

| Code | Description |
|------|-------------|
|EXTENSION_REQUEST_NOT_FOUND|Extension request not found|
|INVALID_EXTENSION_REQUEST|Invalid extension request|
|REQUEST_ALREADY_REVIEWED|Extension request already reviewed|

---

## Assets

| Code | Description |
|------|-------------|
|ASSET_NOT_FOUND|Project asset not found|
|FILE_NOT_FOUND|File not found|
|INVALID_FILE|Unsupported file type|
|FILE_TOO_LARGE|Maximum upload size exceeded|

---

# Transaction Summary

The following operations execute inside Prisma database transactions.

| API | Transaction |
|------|-------------|
|Create Execution Plan|✓|
|Update Execution Plan|✓|
|Create Submission|✓|
|Approve Submission|✓|
|Request Revision|✓|
|Create Extension Request|✓|
|Review Extension Request|✓|
|Create Project Asset|✓|
|Upload Asset Files|✓|
|Delete Project Asset|✓|

Read operations never execute inside transactions.

---

# Redis Cache Summary

| Cache | Purpose |
|---------|----------|
|execution:plan:{projectId}|Execution plan|
|execution:milestones:{projectId}|Project milestones|
|execution:submission:{submissionId}|Submission details|
|execution:pending-reviews:{projectId}|Pending client reviews|
|execution:assets:{projectId}|Project assets|
|execution:extensions:{projectId}|Extension requests|

Cache follows the Cache-Aside pattern.

PostgreSQL always remains the source of truth.

---

# Cache Invalidation Summary

| Operation | Invalidated Cache |
|------------|-------------------|
|Create Execution Plan|Execution Plan, Milestones|
|Update Execution Plan|Execution Plan, Milestones|
|Create Submission|Submissions, Milestones, Pending Reviews|
|Approve Submission|Submissions, Milestones, Pending Reviews|
|Request Revision|Submissions, Milestones, Pending Reviews|
|Create Extension Request|Milestones, Extensions|
|Review Extension Request|Milestones, Extensions|
|Create Project Asset|Project Assets|
|Upload Asset Files|Project Assets|
|Delete Project Asset|Project Assets|

---

# Notification Summary

Notifications are published only after successful transaction commits through BullMQ.

| Event | Recipients |
|---------|------------|
|Execution Plan Created|Client, Assigned Professionals|
|Execution Plan Updated|Client, Assigned Professionals|
|Submission Created|Project Client|
|Submission Approved|Assigned Professional|
|Revision Requested|Assigned Professional|
|Milestone Completed|Assigned Professional, Client|
|Milestone Started|Assigned Professional|
|Extension Request Created|Project Client|
|Extension Granted|Assigned Professional|
|Extension Rejected|Assigned Professional|
|Project Asset Shared|Authorized Professionals|
|Project Asset Updated|Authorized Professionals|
|Project Asset Deleted|Authorized Professionals|

---

# Audit Summary

Every mutating operation creates an immutable execution audit record.

| Operation | Audit Event |
|------------|-------------|
|Create Execution Plan|EXECUTION_PLAN_CREATED|
|Update Execution Plan|EXECUTION_PLAN_UPDATED|
|Create Submission|SUBMISSION_CREATED|
|Approve Submission|SUBMISSION_APPROVED|
|Request Revision|REVISION_REQUESTED|
|Create Extension Request|EXTENSION_REQUEST_CREATED|
|Grant Extension|EXTENSION_GRANTED|
|Reject Extension|EXTENSION_REJECTED|
|Create Asset|PROJECT_ASSET_CREATED|
|Update Asset|PROJECT_ASSET_UPDATED|
|Delete Asset|PROJECT_ASSET_DELETED|

Audit records cannot be modified or deleted.

---

# API Permission Matrix

| API Group | Client | Professional |
|------------|:------:|:------------:|
|Execution Plans|✓|View Assigned|
|Milestones|✓|Assigned Only|
|Submissions|Review|Create & View Own|
|Revision Requests|✓|View|
|Extension Requests|Review|Create|
|Project Assets|Full Access|Shared Only|

Workspace Owners and Workspace Admins do not receive elevated execution permissions.

Permissions are determined exclusively by project participation.

---

# Design Principles

The Execution API follows the following architectural principles:

- RESTful endpoint design
- JWT-based authentication
- Role-based authorization
- Transactional consistency
- Event-driven notifications
- Cache-aside strategy
- Immutable audit history
- Cursor-based pagination
- Thin controllers
- Rich service layer
- Repository isolation
- Asynchronous event publishing

---

# Phase Summary

The Execution Module exposes secure, transactional, and scalable APIs for project execution.

Every write operation guarantees:

- Atomic database transactions
- Automatic cache invalidation
- Immutable audit logging
- Asynchronous notification publishing
- Strict business rule enforcement
- Role-based authorization

This API design ensures consistency, reliability, and scalability while maintaining a clear separation between business logic, persistence, caching, and event processing.

####################################################################################################################

# Phase 6 — Redis Caching Strategy

# Redis Caching Strategy

The Execution Module uses Redis as a high-performance caching layer to reduce database load, improve response times, and support large-scale project execution.

Redis is **never used as the source of truth**.

PostgreSQL remains the authoritative data store for all execution data.

The Execution Module follows the **Cache-Aside** caching pattern.

---

# Objectives

The Redis layer is designed to achieve the following goals.

- Reduce PostgreSQL read load
- Improve API response times
- Minimize repeated execution queries
- Support high read throughput
- Maintain cache consistency
- Scale horizontally

---

# Cache Architecture

```text
                Client
                   │
                   ▼
            Execution API
                   │
          Cache Lookup (Redis)
             │             │
      Cache Hit         Cache Miss
             │             │
             ▼             ▼
      Return Data     PostgreSQL
                           │
                           ▼
                    Store in Redis
                           │
                           ▼
                     Return Response
```

Redis acts as a temporary read cache.

PostgreSQL always remains the primary datastore.

---

# Cache Pattern

The Execution Module uses the **Cache-Aside Pattern**.

### Read Flow

```text
Client Request

        │

        ▼

Redis Lookup

   │          │

Hit         Miss

 │            │

 ▼            ▼

Return     PostgreSQL

              │

              ▼

        Store in Redis

              │

              ▼

        Return Response
```

---

### Write Flow

```text
Database Transaction

        │

        ▼

Commit Successful

        │

        ▼

Invalidate Cache

        │

        ▼

Publish Events

        │

        ▼

Future Reads Repopulate Cache
```

Cache is never updated directly.

Every write operation invalidates affected cache entries.

---

# Cached Resources

The following execution resources are cached.

| Resource | Cache Key |
|-----------|-----------|
| Execution Plan | execution:plan:{projectId} |
| Milestones | execution:milestones:{projectId} |
| Submission | execution:submission:{submissionId} |
| Pending Reviews | execution:pending-reviews:{projectId} |
| Project Assets | execution:assets:{projectId} |
| Extension Requests | execution:extensions:{projectId} |

---

# Execution Plan Cache

## Cache Key

```text
execution:plan:{projectId}
```

### Cached Data

- Execution plan
- Milestones
- Deliverables
- Requirements
- Acceptance criteria

### Invalidated When

- Execution plan created
- Execution plan updated

---

# Milestone Cache

## Cache Key

```text
execution:milestones:{projectId}
```

### Cached Data

- Milestone list
- Milestone status
- Assigned professional
- Deadlines
- Progress

### Invalidated When

- Submission created
- Submission approved
- Revision requested
- Extension approved
- Execution plan updated

---

# Submission Cache

## Cache Key

```text
execution:submission:{submissionId}
```

### Cached Data

- Submission details
- Attachments
- Timing information
- Review status

### Invalidated When

- Submission created
- Submission approved
- Revision requested

---

# Pending Review Cache

## Cache Key

```text
execution:pending-reviews:{projectId}
```

### Cached Data

Pending submissions awaiting review.

### Invalidated When

- Submission created
- Submission approved
- Revision requested

---

# Project Asset Cache

## Cache Key

```text
execution:assets:{projectId}
```

### Cached Data

- Assets
- Visibility
- File metadata

### Invalidated When

- Asset created
- Asset updated
- Asset deleted
- Asset visibility updated

---

# Extension Cache

## Cache Key

```text
execution:extensions:{projectId}
```

### Cached Data

- Pending requests
- Approved requests
- Rejected requests

### Invalidated When

- Extension requested
- Extension approved
- Extension rejected

---

# Cache Expiration

Execution caches use a Time-To-Live (TTL) to prevent stale data from persisting indefinitely.

| Cache | Recommended TTL |
|---------|-----------------|
| Execution Plan | 30 Minutes |
| Milestones | 15 Minutes |
| Submission | 30 Minutes |
| Pending Reviews | 5 Minutes |
| Project Assets | 30 Minutes |
| Extension Requests | 10 Minutes |

Cache entries may expire naturally or be invalidated immediately after write operations.

---

# Cache Invalidation Strategy

Every write operation follows the same invalidation sequence.

```text
Database Transaction

        │

        ▼

Commit

        │

        ▼

Invalidate Redis Keys

        │

        ▼

Publish Notification Event
```

Cache invalidation never occurs before the transaction commits successfully.

---

# Cache Consistency

Execution follows an **Eventual Consistency** model for cached data.

Consistency is guaranteed by the following rules.

- PostgreSQL is the source of truth.
- Cache is invalidated after successful commits.
- Cache is repopulated on subsequent reads.
- Failed transactions never invalidate cache.
- Failed transactions never publish events.

---

# Cache Warm-Up

The Execution Module does not proactively preload cache.

Cache entries are populated lazily.

```text
First Request

        │

        ▼

Database Read

        │

        ▼

Redis Population

        │

        ▼

Subsequent Requests

        │

        ▼

Redis
```

This approach minimizes unnecessary memory consumption.

---

# Cache Miss Strategy

If Redis does not contain the requested resource:

1. Read from PostgreSQL.
2. Serialize the response.
3. Store in Redis.
4. Return to the client.

Cache misses are transparent to clients.

---

# Cache Failure Strategy

Redis is treated as an optional optimization.

If Redis becomes unavailable:

- APIs continue functioning.
- PostgreSQL serves all requests.
- No business operations fail.
- Notifications continue normally.

Execution correctness never depends on Redis availability.

---

# Cache Serialization

Cached objects are serialized as JSON.

Example

```json
{
    "id": "...",
    "status": "IN_PROGRESS",
    "revisionCount": 1
}
```

Redis stores complete API-ready objects to minimize processing during cache hits.

---

# Cache Security

Redis never stores:

- JWT tokens
- Authentication credentials
- Passwords
- Cloudinary secrets
- Internal service credentials

Only execution data intended for authenticated retrieval is cached.

---

# Monitoring

Redis metrics should be monitored continuously.

Recommended metrics include:

- Cache hit ratio
- Cache miss ratio
- Memory utilization
- Evictions
- Latency
- Connected clients
- Expired keys

These metrics help maintain optimal cache performance.

---

# Best Practices

The Execution Module follows these Redis best practices.

- Cache only read-heavy resources.
- Never cache mutable business transactions.
- Invalidate after successful commits.
- Use descriptive cache keys.
- Keep cache payloads small.
- Avoid duplicate cache entries.
- Never treat Redis as persistent storage.
- Allow PostgreSQL to remain authoritative.

---

# Current Scope

Redis is currently used for:

- Execution plans
- Milestone lists
- Submission details
- Pending reviews
- Project assets
- Extension requests

The caching strategy provides low-latency reads while maintaining strong consistency guarantees through transactional invalidation and lazy cache population.

####################################################################################################################

# Phase 7 — Execution Workflows

# Execution Workflows

The Execution Module follows a structured workflow that governs every stage of project execution after an agreement has been finalized.

Each workflow ensures:

- Atomic database operations
- Strict business rule enforcement
- Cache consistency
- Immutable audit history
- Asynchronous notification delivery
- Role-based authorization

This phase documents the complete lifecycle of execution activities from planning to project completion.

---

# Workflow Overview

```text
Agreement Signed
        │
        ▼
Execution Plan Created
        │
        ▼
Milestones Created
        │
        ▼
First Milestones Started
        │
        ▼
Project Assets Shared
        │
        ▼
Professional Executes Work
        │
        ▼
Submission Created
        │
        ▼
Client Reviews Submission
        │
    ┌───┴───────────┐
    ▼               ▼
Approved       Revision Requested
    │               │
    ▼               ▼
Milestone      Back to
Completed      In Progress
    │
    ▼
Next Milestone Started
    │
    ▼
All Milestones Completed
    │
    ▼
Project Completed
```

---

# Workflow 1 — Create Execution Plan

## Purpose

Creates the complete execution roadmap for a project after the agreement has been signed.

---

## Participants

- Project Client
- Execution Service
- PostgreSQL
- Redis
- BullMQ
- Notification Service

---

## Workflow

```text
Client

 │

 ▼

Create Execution Plan Request

 │

 ▼

Authentication

 │

 ▼

Authorization

 │

 ▼

Validate Agreement

 │

 ▼

Validate Participants

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

Create Audit Record

 │

 ▼

Commit Transaction

 │

 ▼

Invalidate Cache

 │

 ▼

Publish Event

 │

 ▼

Execution Plan Created Notification

 │

 ▼

Success Response
```

---

## Result

Creates the complete execution plan for the project.

---

# Workflow 2 — Project Asset Sharing

## Purpose

Allows the project client to share execution resources with selected professionals.

---

## Participants

- Project Client
- Cloudinary
- PostgreSQL
- Redis
- Notification Service

---

## Workflow

```text
Client

 │

 ▼

Upload Files

 │

 ▼

Validate Files

 │

 ▼

Upload To Cloudinary

 │

 ▼

Begin Transaction

 │

 ▼

Create Project Asset

 │

 ▼

Store File Metadata

 │

 ▼

Create Visibility Records

 │

 ▼

Create Audit

 │

 ▼

Commit

 │

 ▼

Invalidate Cache

 │

 ▼

Publish Notification

 │

 ▼

Response
```

---

## Result

Authorized professionals receive access to project resources.

---

# Workflow 3 — Submit Work

## Purpose

Allows professionals to submit completed milestone work.

---

## Participants

- Professional
- Execution Service
- Cloudinary
- PostgreSQL
- Redis
- Notification Service

---

## Workflow

```text
Professional

 │

 ▼

Create Submission

 │

 ▼

Validate Milestone

 │

 ▼

Validate Assignment

 │

 ▼

Upload Attachments

 │

 ▼

Calculate Submission Timing

 │

 ▼

Begin Transaction

 │

 ▼

Create Submission

 │

 ▼

Store Attachments

 │

 ▼

Update Milestone Status

 │

 ▼

Create Audit

 │

 ▼

Commit

 │

 ▼

Invalidate Cache

 │

 ▼

Publish Submission Created

 │

 ▼

Response
```

---

## Result

Milestone enters the SUBMITTED state.

Client receives a notification.

---

# Workflow 4 — Approve Submission

## Purpose

Allows the client to approve submitted work.

---

## Participants

- Client
- Execution Service
- PostgreSQL
- Redis
- Notification Service

---

## Workflow

```text
Client

 │

 ▼

Approve Submission

 │

 ▼

Validate Submission

 │

 ▼

Begin Transaction

 │

 ▼

Complete Milestone

 │

 ▼

Find Next Milestone

 │

 ▼

Start Next Milestone

 │

 ▼

Check Project Completion

 │

 ▼

Update Project Status

 │

 ▼

Create Audit

 │

 ▼

Commit

 │

 ▼

Invalidate Cache

 │

 ▼

Publish Notifications

 │

 ▼

Response
```

---

## Result

Current milestone is completed.

Next milestone begins automatically.

Project completes automatically if every milestone has been approved.

---

# Workflow 5 — Request Revision

## Purpose

Allows the client to request changes to submitted work.

---

## Participants

- Client
- Execution Service
- PostgreSQL
- Notification Service

---

## Workflow

```text
Client

 │

 ▼

Review Submission

 │

 ▼

Validate Revision Limit

 │

 ▼

Begin Transaction

 │

 ▼

Increment Revision Count

 │

 ▼

Return Milestone To

IN_PROGRESS

 │

 ▼

Create Audit

 │

 ▼

Commit

 │

 ▼

Invalidate Cache

 │

 ▼

Publish Revision Notification

 │

 ▼

Response
```

---

## Result

Professional resumes work on the same milestone.

---

# Workflow 6 — Request Milestone Extension

## Purpose

Allows professionals to request additional execution time.

---

## Participants

- Professional
- PostgreSQL
- Notification Service

---

## Workflow

```text
Professional

 │

 ▼

Request Extension

 │

 ▼

Validate Milestone

 │

 ▼

Validate Assignment

 │

 ▼

Begin Transaction

 │

 ▼

Create Extension Request

 │

 ▼

Create Audit

 │

 ▼

Commit

 │

 ▼

Publish Notification

 │

 ▼

Response
```

---

## Result

Client receives an extension request.

Milestone deadline remains unchanged until review.

---

# Workflow 7 — Review Extension Request

## Purpose

Allows the client to approve or reject extension requests.

---

## Participants

- Client
- PostgreSQL
- Redis
- Notification Service

---

## Workflow

```text
Client

 │

 ▼

Review Extension

 │

 ▼

Validate Request

 │

 ▼

Begin Transaction

 │

 ▼

Approve / Reject

 │

 ▼

Update Deadline

(Approval Only)

 │

 ▼

Create Audit

 │

 ▼

Commit

 │

 ▼

Invalidate Cache

 │

 ▼

Publish Notification

 │

 ▼

Response
```

---

## Result

Approved requests extend milestone deadlines.

Rejected requests preserve existing deadlines.

---

# Workflow 8 — Automatic Milestone Progression

## Purpose

Automatically advances execution without manual intervention.

---

## Workflow

```text
Milestone Approved

        │

        ▼

Find Next Milestone

        │

   Exists?

    │       │

   Yes      No

    │       │

    ▼       ▼

Start      Check

Next       Remaining

Milestone  Milestones

            │

            ▼

      All Completed?

         │      │

        Yes     No

         │

         ▼

Complete Project
```

---

## Result

Execution progresses automatically until the project finishes.

---

# Workflow 9 — Notification Processing

## Purpose

Delivers notifications asynchronously after successful transactions.

---

## Workflow

```text
Transaction

 │

 ▼

Commit

 │

 ▼

Execution Publisher

 │

 ▼

BullMQ Queue

 │

 ▼

Event Processor

 │

 ▼

Notification Factory

 │

 ▼

Recipient Resolver

 │

 ▼

Notification Service

 │

 ▼

Socket Gateway

 │

 ▼

Connected Users
```

---

## Result

Notifications never delay API responses.

---

# Workflow 10 — Cache Lifecycle

## Purpose

Maintains cache consistency across the Execution Module.

---

## Read Workflow

```text
API Request

 │

 ▼

Redis Lookup

 │

 ├──────────────┐

 │              │

 ▼              ▼

Hit           Miss

 │              │

 ▼              ▼

Response   PostgreSQL

               │

               ▼

        Populate Cache

               │

               ▼

          Response
```

---

## Write Workflow

```text
Database Transaction

        │

        ▼

Commit

        │

        ▼

Invalidate Cache

        │

        ▼

Publish Events

        │

        ▼

Future Reads

        │

        ▼

Cache Repopulated
```

---

# Workflow Guarantees

Every execution workflow guarantees:

- JWT authentication before execution
- Role-based authorization
- Business rule validation
- Atomic database transactions
- Immutable audit logging
- Redis cache invalidation after commit
- Asynchronous notification publishing
- PostgreSQL as the source of truth
- Automatic rollback on failure

---

# Failure Handling

If any workflow fails before the transaction commits:

- Database changes are rolled back.
- Redis cache remains unchanged.
- Notifications are not published.
- Audit records are not created.
- API returns an appropriate error response.

This ensures that the Execution Module never enters a partially completed state.

---

# Current Workflow Coverage

The current implementation supports the following workflows:

- Execution plan creation
- Execution plan updates
- Project asset sharing
- Work submission
- Submission review
- Revision requests
- Extension request lifecycle
- Automatic milestone progression
- Automatic project completion
- Redis cache lifecycle
- Notification processing
- Audit generation

These workflows collectively define the complete operational lifecycle of project execution within the Strus platform.

####################################################################################################################

# Phase 8 — Security, Authorization & Validation

# Security, Authorization & Validation

The Execution Module enforces multiple security layers to ensure that project execution remains secure, auditable, and isolated between participants.

Security is enforced before business logic execution and applies consistently across every API.

The module follows a **Defense-in-Depth** approach where every request passes through multiple validation stages before accessing execution resources.

---

# Security Architecture

```text
Client Request
        │
        ▼
JWT Authentication
        │
        ▼
Token Validation
        │
        ▼
Workspace Membership Validation
        │
        ▼
Project Participation Validation
        │
        ▼
Role Authorization
        │
        ▼
Resource Ownership Validation
        │
        ▼
Business Rule Validation
        │
        ▼
Database Transaction
        │
        ▼
Commit
```

Every layer must succeed before the request proceeds.

---

# Authentication

Every Execution API requires an authenticated user.

Authentication is performed using JWT Access Tokens.

```http
Authorization: Bearer <access_token>
```

Unauthenticated requests are rejected before reaching the controller.

---

# Authentication Flow

```text
Request

    │

    ▼

Extract JWT

    │

    ▼

Verify Signature

    │

    ▼

Validate Expiration

    │

    ▼

Load User

    │

    ▼

Authentication Successful
```

Failed authentication immediately returns **401 Unauthorized**.

---

# Authorization Model

Execution authorization is based on **project participation**, not workspace hierarchy.

Workspace Owners and Workspace Admins do not automatically receive execution permissions.

Execution permissions are determined exclusively by the project agreement.

---

# Client Permissions

Project Clients can:

- Create execution plans
- Update execution plans
- View all milestones
- Review submissions
- Request revisions
- Approve extension requests
- Reject extension requests
- Manage project assets
- View every execution resource

Clients cannot:

- Submit milestone work
- Request milestone extensions on behalf of professionals

---

# Professional Permissions

Assigned Professionals can:

- View assigned milestones
- Submit work
- View their submissions
- Request milestone extensions
- Access shared project assets
- View revision requests

Professionals cannot:

- Create execution plans
- Modify execution plans
- Review submissions
- Approve submissions
- Manage project assets
- Review extension requests

---

# Workspace Permissions

Workspace roles do not override execution permissions.

Examples:

Workspace Owner

×

Cannot approve submissions.

Workspace Admin

×

Cannot create execution plans.

Workspace Member

×

Cannot review work unless they are the project client.

Execution authorization always follows project participation.

---

# Project Membership Validation

Every request validates project membership.

```text
User

        │

        ▼

Workspace Member?

        │

       Yes

        │

        ▼

Project Participant?

        │

     Yes     No

      │       │

      ▼       ▼

 Continue   Reject
```

Users who are not project participants cannot access execution resources.

---

# Resource Ownership Validation

The Execution Module validates ownership before allowing resource access.

Examples include:

Submission

Only the submitting professional and project client may access it.

Milestone

Only the assigned professional and project client may access it.

Project Asset

Only users included in the visibility list may access it.

Extension Request

Only the requesting professional and project client may access it.

Ownership is verified before business logic execution.

---

# File Upload Security

Execution uploads are treated as untrusted input.

Every uploaded file undergoes validation before storage.

---

## File Validation

Every uploaded file validates:

- MIME type
- Extension
- File size
- File name
- Upload count

Files failing validation are rejected.

---

## Allowed File Types

Examples include:

- PDF
- DOC
- DOCX
- XLSX
- PPTX
- PNG
- JPEG
- ZIP

Executable files are rejected.

---

## File Size Limits

Every uploaded file must remain within the configured upload limit.

Oversized uploads are rejected before reaching Cloudinary.

---

## Filename Security

Uploaded filenames are sanitized.

Server-generated identifiers replace client filenames for storage.

Original filenames are stored only as metadata.

---

## Cloudinary Security

Only metadata is stored inside PostgreSQL.

Cloudinary stores binary content.

Public identifiers are never trusted as authorization.

Downloads always validate permissions before generating access URLs.

---

# Input Validation

Every request validates:

- UUID identifiers
- Required fields
- Enum values
- Numeric ranges
- String lengths
- Array limits
- Pagination parameters

Validation occurs before business rule execution.

---

# Business Rule Validation

Business validation ensures that execution rules remain consistent.

Examples include:

- Agreement signed
- Milestone exists
- Milestone status
- Revision limit
- Assignment ownership
- Extension request state

Requests violating business rules return validation errors.

---

# Transaction Safety

Every mutating operation executes inside a Prisma transaction.

```text
Begin Transaction

        │

        ▼

Business Logic

        │

        ▼

Database Changes

        │

        ▼

Commit

        │

        ▼

Invalidate Cache

        │

        ▼

Publish Notifications
```

Failures automatically roll back every database change.

---

# Audit Security

Every mutating operation creates an immutable execution audit.

Audit records include:

- Actor
- Action
- Timestamp
- Metadata

Audit history cannot be modified or deleted.

---

# Soft Delete Protection

Resources supporting soft deletion remain protected.

Deleted resources:

- Cannot be updated.
- Cannot be restored through Execution APIs.
- Are excluded from normal queries.

Historical references remain intact.

---

# Cache Security

Redis never stores:

- Passwords
- JWT tokens
- Authentication secrets
- Cloudinary credentials
- Internal configuration

Only cacheable execution data is stored.

Redis remains an optimization layer.

---

# Notification Security

Notifications are generated only after successful commits.

Failed transactions never produce notifications.

Notification recipients are resolved dynamically based on project permissions.

Unauthorized users never receive execution notifications.

---

# API Rate Limiting

Execution APIs should apply rate limits to prevent abuse.

Recommended limits:

| Endpoint Category | Recommendation |
|-------------------|---------------:|
| Read APIs | 300 requests/minute |
| Submission APIs | 30 requests/minute |
| Asset Upload APIs | 20 requests/minute |
| Extension Requests | 10 requests/hour |
| Execution Plan Updates | 10 requests/hour |

Rate limits protect execution services without affecting normal collaboration.

---

# Error Information

Security responses never expose:

- Database structure
- Internal identifiers
- Stack traces
- SQL queries
- Service credentials

Responses return only the information necessary for clients to recover.

---

# Logging

Security-relevant events should be logged.

Examples include:

- Authentication failures
- Authorization failures
- Invalid uploads
- Failed validation
- Transaction failures
- Unexpected exceptions

Sensitive information must never be written to logs.

---

# Security Principles

The Execution Module follows these principles:

- Authentication before authorization
- Least privilege access
- Project-scoped permissions
- Resource ownership validation
- Immutable audit history
- Secure file handling
- Atomic transactions
- Defense in depth
- Fail-safe defaults
- PostgreSQL as the source of truth

---

# Security Guarantees

The Execution Module guarantees:

- Every request is authenticated.
- Every resource access is authorized.
- Every upload is validated.
- Every mutation is transactional.
- Every audit record is immutable.
- Every notification respects permissions.
- Every cache entry is non-authoritative.
- Every business rule is enforced before persistence.

These guarantees ensure that project execution remains secure, consistent, and auditable while supporting large-scale collaboration across the Strus platform.

####################################################################################################################

# Phase 9 — Performance, Scalability & Reliability

# Performance, Scalability & Reliability

The Execution Module is designed to support thousands of concurrent projects, millions of execution records, and high-frequency collaboration while maintaining predictable performance and data consistency.

The architecture separates business logic, persistence, caching, asynchronous processing, and notifications to eliminate bottlenecks and maximize horizontal scalability.

---

# Design Objectives

The Execution Module is designed to achieve the following objectives.

- Low API latency
- High read throughput
- Horizontal scalability
- Strong transactional consistency
- Asynchronous event processing
- Efficient database utilization
- Minimal memory footprint
- Fault tolerance
- High availability

---

# High-Level Architecture

```text
                    Client
                       │
                       ▼
               Load Balancer
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
 Execution API Instance        Execution API Instance
        │                             │
        └──────────────┬──────────────┘
                       ▼
                   PostgreSQL
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Redis       Cloudinary       BullMQ
                       │
                       ▼
             Notification Processor
```

Every component can scale independently.

---

# Stateless API Design

Execution services are completely stateless.

No user session data is stored in application memory.

Every request contains all information required for processing.

Benefits include:

- Horizontal scaling
- Zero sticky sessions
- Container orchestration support
- Automatic failover
- Rolling deployments

---

# Horizontal Scalability

The Execution Module supports multiple API instances simultaneously.

```text
              Load Balancer

                    │

      ┌─────────────┼─────────────┐

      ▼             ▼             ▼

 Instance 1    Instance 2    Instance 3

      │             │             │

      └─────────────┼─────────────┘

                    ▼

             Shared Database
```

Requests may be processed by any instance.

---

# Database Performance

PostgreSQL remains the primary datastore.

Performance is achieved through:

- Proper indexing
- Cursor pagination
- Optimized joins
- Transaction batching
- Selective column retrieval
- Normalized relationships

The database is never bypassed for write operations.

---

# Cursor Pagination

Large datasets use cursor-based pagination.

Examples include:

- Milestones
- Submissions
- Assets
- Extension requests
- Audit records

Cursor pagination provides:

- Stable ordering
- Constant query performance
- Efficient large dataset traversal

Offset pagination is intentionally avoided.

---

# Redis Performance

Redis handles frequently accessed read-heavy resources.

Benefits include:

- Reduced database reads
- Faster response times
- Lower database CPU usage
- Reduced query latency

Redis is never used for transactional writes.

---

# Asynchronous Processing

Execution notifications are processed asynchronously.

```text
API Request

      │

      ▼

Database Commit

      │

      ▼

BullMQ Queue

      │

      ▼

Notification Worker

      │

      ▼

Socket Delivery
```

API responses never wait for notification delivery.

---

# Database Transactions

Every write operation executes inside a single Prisma transaction.

Transactions guarantee:

- Atomicity
- Consistency
- Isolation
- Durability

Partial execution is impossible.

---

# Connection Pooling

Database connections are reused through pooling.

Benefits include:

- Lower connection overhead
- Reduced latency
- Better throughput
- Stable resource utilization

Connection exhaustion is prevented through configured pool limits.

---

# File Storage Performance

Binary files are stored in Cloudinary.

PostgreSQL stores only metadata.

Benefits include:

- Smaller database size
- Faster backups
- Reduced I/O
- CDN delivery
- Independent storage scaling

---

# Event Processing Performance

BullMQ decouples notification generation from business operations.

Benefits include:

- Faster API responses
- Independent worker scaling
- Retry support
- Queue monitoring
- Failure isolation

---

# Memory Efficiency

The Execution Module minimizes memory consumption.

Strategies include:

- Stateless services
- Lazy loading
- Cursor pagination
- External file storage
- Redis cache expiration
- No long-lived in-memory objects

---

# Read Performance

Typical read workflow:

```text
Client

   │

   ▼

Redis Lookup

   │

Hit?──────────────No

 │                 │

 ▼                 ▼

Return        PostgreSQL

                    │

                    ▼

             Populate Cache

                    │

                    ▼

                 Response
```

Most repeated reads avoid database access.

---

# Write Performance

Typical write workflow:

```text
Validate Request

        │

        ▼

Database Transaction

        │

        ▼

Commit

        │

        ▼

Cache Invalidation

        │

        ▼

Queue Notification

        │

        ▼

Response
```

Write operations prioritize consistency over cache freshness.

---

# Reliability

The Execution Module guarantees:

- Atomic database commits
- Automatic rollback
- Immutable audit history
- Idempotent cache invalidation
- Reliable notification delivery
- Permission validation
- Consistent business rules

---

# Failure Recovery

If an operation fails:

- Transaction rolls back
- Cache remains unchanged
- Notification is not published
- Audit record is discarded
- Error is returned to the client

No partial state is persisted.

---

# Fault Isolation

Subsystem failures remain isolated.

## Redis Failure

Effects:

- Cache unavailable
- Database serves requests
- APIs continue functioning

---

## BullMQ Failure

Effects:

- Business operations continue
- Notifications are delayed
- Data remains consistent

---

## Cloudinary Failure

Effects:

- Asset upload fails
- Transaction rolls back
- Existing assets remain accessible

---

## Database Failure

Effects:

- Write operations fail
- No partial data is committed
- Error returned to client

---

# Monitoring

Production deployments should monitor:

## API

- Request latency
- Throughput
- Error rate
- Success rate

---

## Database

- Query latency
- Active connections
- Slow queries
- Lock contention

---

## Redis

- Cache hit ratio
- Cache miss ratio
- Memory usage
- Evictions

---

## BullMQ

- Queue depth
- Processing latency
- Retry count
- Failed jobs

---

## Cloudinary

- Upload latency
- Upload failures
- Storage utilization

---

# Scalability Characteristics

| Component | Scaling Strategy |
|------------|------------------|
| API | Horizontal |
| PostgreSQL | Vertical / Read Replicas |
| Redis | Replication / Cluster |
| BullMQ Workers | Horizontal |
| Cloudinary | Managed Service |

Each subsystem can scale independently based on workload.

---

# Performance Best Practices

The Execution Module follows these practices:

- Thin controllers
- Rich service layer
- Repository isolation
- Transactional writes
- Cache-aside strategy
- Cursor pagination
- Immutable audit history
- Asynchronous notifications
- External binary storage
- Stateless application servers

---

# Production Readiness

The current implementation is production-ready and supports:

- Horizontal API scaling
- High-volume execution workflows
- Large project datasets
- Efficient read caching
- Reliable asynchronous notifications
- Transactional consistency
- Fault-tolerant execution
- Independent infrastructure scaling

These architectural decisions ensure that the Execution Module remains performant, scalable, and reliable as the Strus platform grows from individual projects to enterprise-scale collaborative workloads.

####################################################################################################################

# Phase 10 — Module Summary & Future Enhancements

# Module Summary

The Execution Module is the operational core of the Strus platform.

It transforms a signed agreement into an executable project by managing planning, milestone execution, work submissions, reviews, revisions, deadline extensions, project resources, notifications, caching, and audit history.

The module serves as the bridge between contractual agreements and successful project delivery.

Unlike the Agreement Module, which defines **what** must be delivered, the Execution Module governs **how** work is performed until project completion.

---

# Module Responsibilities

The Execution Module is responsible for:

- Execution planning
- Milestone management
- Milestone progression
- Professional assignments
- Work submissions
- Submission reviews
- Revision management
- Milestone extension workflow
- Project asset management
- Asset visibility
- Redis caching
- Cloudinary integration
- Execution notifications
- Socket broadcasting
- Immutable execution audit logging

The module intentionally excludes responsibilities belonging to other bounded contexts.

---

# Responsibilities Outside This Module

The following concerns belong to other modules.

### Authentication Module

- User authentication
- JWT management
- Sessions
- Password management

---

### Workspace Module

- Workspace lifecycle
- Workspace membership
- Roles
- Invitations

---

### Project Module

- Project creation
- Project lifecycle
- Client-professional matching
- Project discovery

---

### Agreement Module

- Contract generation
- Digital signatures
- Commercial terms
- Legal acceptance

---

### Payment Module

- Escrow
- Milestone payments
- Refunds
- Invoicing

---

### Dispute Module

- Dispute creation
- Evidence collection
- Resolution workflow

---

# Module Architecture

The Execution Module follows a layered architecture.

```text
Controller

        │

        ▼

Validation

        │

        ▼

Service Layer

        │

        ▼

Repository Layer

        │

        ▼

PostgreSQL
```

Supporting services:

```text
Redis

Cloudinary

BullMQ

Notification Service

Socket Gateway
```

Each layer has a single responsibility.

---

# Architectural Principles

The implementation follows the following principles.

### Single Responsibility

Every component performs one responsibility.

---

### Separation of Concerns

Business logic is isolated from:

- Controllers
- Persistence
- Notifications
- Caching
- External services

---

### Transactional Consistency

Business operations execute atomically.

Partial updates are impossible.

---

### Event-Driven Architecture

Notifications are completely asynchronous.

Business operations never depend on notification delivery.

---

### Cache-Aside Strategy

Redis improves read performance while PostgreSQL remains the source of truth.

---

### Immutable Audit History

Execution history is append-only.

Historical information cannot be modified.

---

### Stateless Services

Application servers remain stateless.

Horizontal scaling is supported without sticky sessions.

---

# Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | BullMQ |
| File Storage | Cloudinary |
| Authentication | JWT |
| Real-Time | Socket.IO |

---

# Module Capabilities

The current implementation supports:

## Planning

- Execution plans
- Professional assignments
- Milestone sequencing
- Deliverables
- Requirements
- Acceptance criteria

---

## Execution

- Automatic milestone progression
- Independent professional workflows
- Status management

---

## Collaboration

- Project assets
- Controlled visibility
- Secure file sharing

---

## Reviews

- Work submissions
- Client approval
- Revision requests
- Revision limits

---

## Timeline Management

- Extension requests
- Client approval workflow
- Automatic deadline recalculation

---

## Infrastructure

- Redis caching
- BullMQ notifications
- Cloudinary storage
- Socket broadcasting

---

## Observability

- Immutable audit logs
- Transaction history
- Event publishing

---

# Module Guarantees

The Execution Module guarantees:

- Authenticated requests
- Project-scoped authorization
- Transactional consistency
- Automatic rollback
- Immutable audit history
- Event-driven notifications
- Redis cache consistency
- Secure file uploads
- Soft delete protection
- Reliable milestone progression

---

# Extension Points

The current architecture allows future capabilities without redesigning the module.

Potential extensions include:

### Time Tracking

Track active work duration for milestones.

---

### Work Logs

Daily progress updates from professionals.

---

### Milestone Templates

Reusable execution templates across projects.

---

### Dependency Graphs

Support milestone dependencies and parallel execution visualization.

---

### Recurring Deliverables

Automatically generate recurring execution tasks.

---

### Calendar Integration

Sync milestone deadlines with external calendars.

---

### AI Progress Insights

Generate execution summaries and identify delivery risks using AI.

---

### Analytics Dashboard

Execution metrics such as:

- Average completion time
- Revision frequency
- Deadline adherence
- Professional productivity
- Client review turnaround

---

### Advanced Notifications

Support:

- Email
- Push notifications
- SMS
- Webhooks

---

# Design Decisions

Several architectural decisions intentionally prioritize scalability and maintainability.

## PostgreSQL as Source of Truth

Redis never owns business data.

---

## External File Storage

Binary files are stored outside the relational database.

---

## Queue-Based Notifications

Notification delivery never blocks business operations.

---

## Cache Invalidation

Caches are invalidated after successful transactions rather than updated directly.

---

## Cursor Pagination

Large datasets use cursor pagination instead of offset pagination.

---

## Immutable Audits

Historical execution records cannot be altered.

---

## Role Isolation

Execution permissions depend on project participation rather than workspace hierarchy.

---

# Production Readiness

The Execution Module is designed for production deployments.

It supports:

- High concurrency
- Horizontal application scaling
- Independent worker scaling
- Efficient database access
- Read-heavy optimization
- Reliable event processing
- Secure file management
- Fault-tolerant architecture

---

# Future Improvements

The following enhancements can be introduced without modifying the existing architecture.

- SLA monitoring
- Automatic reminder scheduling
- Milestone dependency visualization
- Execution forecasting
- AI-generated execution plans
- Intelligent workload balancing
- Bulk milestone operations
- Advanced search
- Execution reporting
- Real-time analytics
- Custom notification preferences
- Organization-level execution insights

These features integrate naturally into the existing layered architecture.

---

# Conclusion

The Execution Module provides a complete execution management system for collaborative professional work on Strus.

It bridges the gap between contractual agreements and successful project delivery through structured planning, controlled execution, secure collaboration, and automated workflow progression.

By combining transactional consistency, asynchronous event processing, Redis caching, immutable audit history, secure file management, and role-based authorization, the module delivers a scalable and maintainable foundation capable of supporting projects ranging from individual engagements to enterprise-scale collaborative environments.

The architecture emphasizes correctness, performance, extensibility, and operational reliability, ensuring that future capabilities can be introduced without compromising existing functionality or architectural integrity.

####################################################################################################################

# Phase 10 — Email Notification System

# Email Notification System

The Execution Module integrates with **Brevo** to deliver transactional emails for important execution lifecycle events.

Emails complement in-app notifications and real-time socket events by ensuring participants remain informed even when they are offline.

Email delivery is fully asynchronous and never blocks API responses.

---

# Objectives

The email notification system is designed to:

- Notify participants of important execution events
- Improve project communication
- Reduce missed project updates
- Keep offline users informed
- Deliver reliable transactional emails
- Decouple email delivery from business operations

---

# Architecture

```text
Business Service

        │

        ▼

Database Transaction

        │

        ▼

Transaction Commit

        │

        ▼

Execution / Project Publisher

        │

        ▼

BullMQ Queue

        │

        ▼

Notification Processor

        │

        ▼

Notification Factory

        │

        ▼

Email Service

        │

        ▼

Brevo API

        │

        ▼

Recipient Inbox
```

Emails are only generated after successful database commits.

---

# Email Delivery Principles

The Execution Module follows the following principles.

- Emails are asynchronous.
- Emails never block API responses.
- Emails are sent only after successful commits.
- Failed transactions never send emails.
- Email generation is event-driven.
- Business services never communicate directly with Brevo.

---

# Email Provider

The Execution Module uses **Brevo** as the transactional email provider.

Brevo is responsible for:

- Email delivery
- SMTP/API communication
- Delivery tracking
- Retry handling
- Bounce management

The application communicates with Brevo through a dedicated Email Service.

---

# Email Events

The following execution events generate transactional emails.

| Event | Recipient |
|--------|-----------|
| Project Activated | Client + All Professionals |
| Submission Under Review | Client |
| Project Completed | Client + All Professionals |

---

# Project Activated Email

## Trigger

Project status changes from **DRAFT** to **ACTIVE**.

---

## Publisher

```text
ProjectPublisher.publishProjectActivated()
```

---

## Recipients

- Client
- All agreement participants (Professionals)

---

## Purpose

Inform every participant that execution has officially started.

---

## Email Contents

The email contains:

- Project name
- Workspace name
- Activation confirmation
- Execution start information
- Link to the project

---

# Submission Under Review Email

## Trigger

A professional submits work for a milestone.

---

## Publisher

```text
ExecutionPublisher.publishSubmissionCreated()
```

---

## Recipient

- Project Client

---

## Purpose

Notify the client that submitted work is awaiting review.

---

## Email Contents

The email includes:

- Project name
- Milestone name
- Professional name
- Submission timestamp
- Review request
- Link to review the submission

---

# Project Completed Email

## Trigger

The final milestone is approved and the project status becomes **COMPLETED**.

---

## Publisher

```text
ProjectPublisher.publishProjectCompleted()
```

---

## Recipients

- Client
- All agreement participants (Professionals)

---

## Purpose

Thank participants for successfully completing the project.

---

## Email Contents

The email contains:

- Project name
- Completion confirmation
- Appreciation message
- Completion date
- Link to project summary

---

# Email Processing Flow

```text
Business Transaction

        │

        ▼

Commit Successful

        │

        ▼

Publish Event

        │

        ▼

BullMQ Queue

        │

        ▼

Notification Processor

        │

        ▼

Notification Factory

        │

        ▼

Email Service

        │

        ▼

Brevo

        │

        ▼

Recipient
```

---

# Email Reliability

The notification system guarantees:

- No email before transaction commit.
- Failed transactions never send emails.
- Email failures do not affect business operations.
- Notification jobs can be retried independently.
- Email delivery is isolated from execution workflows.

---

# Failure Handling

If Brevo is temporarily unavailable:

- Business transaction remains committed.
- Notification job fails independently.
- BullMQ retry policy handles delivery.
- Users continue using the platform normally.

Execution correctness is never affected by email delivery.

---

# Security

Emails never expose confidential information.

Emails do not contain:

- JWT tokens
- Internal database identifiers
- Sensitive project metadata
- File storage URLs
- Internal API endpoints

Recipients must authenticate before accessing protected resources linked from emails.

---

# Notification Channels

Execution events are delivered through multiple communication channels.

| Event | In-App | Socket | Email |
|--------|:------:|:------:|:-----:|
| Project Activated | ✓ | ✓ | ✓ |
| Submission Created | ✓ | ✓ | ✓ |
| Submission Approved | ✓ | ✓ | — |
| Revision Requested | ✓ | ✓ | — |
| Extension Requested | ✓ | ✓ | — |
| Extension Approved | ✓ | ✓ | — |
| Extension Rejected | ✓ | ✓ | — |
| Project Asset Shared | ✓ | ✓ | — |
| Project Completed | ✓ | ✓ | ✓ |

---

# Design Principles

The email notification system follows these principles.

- Event-driven architecture
- Asynchronous delivery
- Loose coupling
- Reliable processing
- Transactional integrity
- Separation of concerns
- Provider abstraction
- Scalable infrastructure

---

# Current Scope

The current implementation supports three transactional email notifications.

- Project Activated
- Submission Under Review
- Project Completed

These emails provide timely communication during the most important execution lifecycle events while maintaining high performance through asynchronous processing and Brevo integration.

####################################################################################################################

# Phase 14 — Negotiation & Dispute Notification System

## Overview

This phase extends the Strus Event System to support the complete notification lifecycle for the Negotiation and Dispute modules.

The implementation follows the same event-driven architecture used throughout the platform, ensuring that business modules remain completely independent from notification delivery mechanisms.

Instead of directly creating dashboard activities, sending emails, or emitting socket events, business modules simply publish notification jobs. The Event module then processes these jobs asynchronously, resolves recipients, persists dashboard events, dispatches emails, and supports future notification channels.

This design keeps the business layer clean while allowing new delivery mechanisms to be introduced without modifying existing modules.

---

# Architecture

```text
Negotiation / Dispute Module
            │
            ▼
      Event Publisher
            │
            ▼
     BullMQ Event Queue
            │
            ▼
       Event Worker
            │
            ▼
     Event Processor
            │
            ▼
 Notification Factory
            │
            ▼
   Recipient Resolver
            │
            ▼
      Event Service
            │
            ├────────► Dashboard Events
            │
            ├────────► Email Dispatcher
            │
            └────────► Future Notification Channels
```

---

# Negotiation Notifications

The Negotiation module supports notifications for the complete negotiation lifecycle.

## Negotiation Created

Triggered whenever a client creates a negotiation request for a milestone.

### Recipients

- Assigned Professional

### Notifications Generated

- Dashboard Activity
- Email Notification
- Real-Time Socket Notification

### Purpose

Notifies the assigned professional that the client has requested a settlement change and a response is required before the negotiation deadline.

---

## Negotiation Accepted

Triggered when the professional accepts the negotiation request.

### Recipients

- Client

### Notifications Generated

- Dashboard Activity
- Email Notification
- Real-Time Socket Notification

### Purpose

Informs the client that the proposed settlement has been accepted and the updated milestone terms are now effective.

---

## Negotiation Declined

Triggered when the professional declines the negotiation request.

### Recipients

- Client

### Notifications Generated

- Dashboard Activity
- Email Notification
- Real-Time Socket Notification

### Purpose

Notifies the client that the proposed settlement has been rejected.

---

## Negotiation Expired

Triggered automatically when the negotiation response deadline expires.

### Recipients

- Client

### Notifications Generated

- Dashboard Activity
- Email Notification
- Real-Time Socket Notification

### Purpose

Informs the client that the negotiation expired because no response was received before the deadline.

---

# Dispute Notifications

The Dispute module supports notifications throughout the dispute lifecycle.

## Dispute Created

Triggered whenever either participant escalates a milestone into a dispute.

### Recipients

- Opposite Project Participant

### Notifications Generated

- Dashboard Activity
- Email Notification

### Purpose

Immediately informs the other participant that the milestone has entered the dispute process.

---

## Resolution Proposed

Triggered when a dispute resolution proposal is submitted.

### Recipients

- Client
- Professional

### Notifications Generated

- Dashboard Activity
- Email Notification

### Purpose

Notifies both participants that a proposed resolution is available for review.

---

## Dispute Resolved

Triggered after the dispute reaches a successful resolution.

### Recipients

- Client
- Professional

### Notifications Generated

- Dashboard Activity
- Email Notification

### Purpose

Informs both participants that the dispute has been successfully resolved and work may continue.

---

## Dispute Closed

Triggered after the dispute lifecycle officially ends.

### Recipients

- Client
- Professional

### Notifications Generated

- Dashboard Activity
- Email Notification

### Purpose

Marks the official completion of the dispute process.

---

# Recipient Resolution

Recipient resolution is completely isolated from the business layer.

Dedicated recipient resolvers determine who should receive notifications based on the current state of the negotiation or dispute.

### Negotiation Recipient Resolver

Supports:

- Negotiation Created
- Negotiation Accepted
- Negotiation Declined
- Negotiation Expired

### Dispute Recipient Resolver

Supports:

- Dispute Created
- Resolution Proposed
- Dispute Resolved
- Dispute Closed

This approach prevents controllers and services from containing notification-specific recipient logic.

---

# Notification Factories

Dedicated notification factories convert notification jobs into user-facing dashboard activities.

## NegotiationNotificationFactory

Supports:

- Negotiation Created
- Negotiation Accepted
- Negotiation Declined
- Negotiation Expired

Responsibilities:

- Resolve recipients
- Generate event metadata
- Create dashboard events
- Trigger email delivery

---

## DisputeNotificationFactory

Supports:

- Dispute Created
- Resolution Proposed
- Dispute Resolved
- Dispute Closed

Responsibilities:

- Resolve recipients
- Generate event metadata
- Create dashboard events
- Trigger email delivery

---

# Dashboard Activities

Every supported negotiation and dispute event automatically generates dashboard activities.

Dashboard activities are:

- Persisted in the Event table
- Linked through EventRecipient
- Cursor paginated
- Available through Client Dashboard APIs
- Available through Professional Dashboard APIs

---

# Email Notifications

Negotiation and dispute notifications include dedicated email templates tailored to the specific action being performed.

## Negotiation Emails

- Negotiation Created
- Negotiation Accepted
- Negotiation Declined
- Negotiation Expired

## Dispute Emails

- Dispute Created
- Resolution Proposed
- Dispute Resolved
- Dispute Closed

Each email includes relevant project and milestone context together with action-specific messaging for the recipient.

---

# Real-Time Notifications

Negotiation events support real-time communication using Socket.IO.

Supported socket events include:

- Negotiation Created
- Negotiation Accepted
- Negotiation Declined
- Negotiation Expired

Socket notifications complement dashboard activities and email delivery by providing immediate in-application updates to connected users.

Dispute notifications currently rely on dashboard activities and email notifications.

---

# Queue-Based Processing

Negotiation and dispute notifications are processed asynchronously using BullMQ.

```text
Business Module
      │
      ▼
Event Publisher
      │
      ▼
 BullMQ Queue
      │
      ▼
 Event Worker
      │
      ▼
Event Processor
      │
      ▼
Notification Factory
      │
      ▼
 Recipient Resolver
      │
      ▼
  Event Service
      │
      ├────────► Dashboard Activity
      ├────────► Email Notification
      └────────► Future Notification Channels
```

This asynchronous architecture ensures that notification processing never delays business transactions while maintaining reliable event delivery.

---

# Separation of Responsibilities

## Business Modules

Responsible for:

- Publishing notification jobs
- Triggering domain events

Not responsible for:

- Recipient resolution
- Dashboard event creation
- Email generation
- Notification persistence
- Notification delivery

---

## Event Module

Responsible for:

- Processing notification jobs
- Recipient resolution
- Dashboard activity creation
- Email dispatch
- Notification persistence
- Notification orchestration

The Event module acts as the centralized notification infrastructure for the entire platform, enabling additional delivery mechanisms such as push notifications, webhooks, and mobile notifications to be introduced in the future without requiring changes to business modules.

####################################################################################################################