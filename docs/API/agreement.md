# Phase 1 — Agreement Module Overview

# Agreement Module

## Purpose

The Agreement Module defines the contractual foundation of every project before execution begins. It captures the commercial scope of work, manages professional onboarding through invitations, records all agreement activities, and ensures that project execution cannot begin until the agreement process is completed.

The module serves as the bridge between project planning and project execution.

---

# Responsibilities

The Agreement Module is responsible for:

- Creating the project agreement.
- Maintaining contractual information.
- Managing professional invitations.
- Managing agreement participants.
- Recording every agreement activity.
- Enforcing agreement business rules.
- Updating project setup progress.
- Publishing real-time agreement events.
- Maintaining cache consistency.

---

# Scope

The module covers the complete pre-execution workflow.

Included:

- Agreement creation
- Agreement updates
- Professional invitations
- Invitation acceptance
- Invitation decline
- Invitation withdrawal
- Professional removal
- Agreement participant management
- Agreement audit logs
- Redis caching
- Socket.IO notifications

Not Included:

- Milestones
- Deliverables
- Payments
- Escrow
- Work submissions
- Revisions
- Disputes
- Project execution
- Time tracking

Those belong to their respective modules.

---

# Module Position

```
Workspace
    │
    ▼
Project (Draft)
    │
    ▼
Agreement
    │
    ▼
Professional Invitations
    │
    ▼
Professional Assignment
    │
    ▼
Project Ready For Execution
```

---

# High-Level Architecture

```
Project
   │
   │ 1 : 1
   ▼
Agreement
   │
   ├──────────────┐
   │              │
   ▼              ▼
Participants     Audit Logs
```

---

# Core Components

## Agreement

Represents the commercial definition of a project.

Stores:

- Title
- Description
- Scope
- Out of Scope
- Budget
- Expected Duration
- Creator
- Last Updated By

Each project owns exactly one agreement.

---

## Agreement Participant

Represents every user associated with an agreement.

A participant may be:

- Contractor
- Professional

Professionals always enter through the invitation workflow.

---

## Agreement Invitation

Invitation management is built directly into Agreement Participants.

Supported states:

- Pending
- Accepted
- Declined
- Withdrawn

Every invitation maintains its own lifecycle.

---

## Agreement Audit

Maintains a complete immutable history of agreement activities.

Every important operation creates an audit entry.

Examples include:

- Agreement Created
- Agreement Updated
- Professional Invited
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn
- Professional Removed

---

# Project Relationship

```
Workspace
     │
     ▼
 Project
     │
     │ owns exactly one
     ▼
 Agreement
```

Project execution depends on Agreement completion.

---

# Participant Relationship

```
Agreement
      │
      ├──────────────┐
      │              │
      ▼              ▼
 Contractor     Professionals
```

Only one contractor exists.

Multiple professionals may participate.

---

# Agreement Lifecycle

```
Project Created
        │
        ▼
Agreement Created
        │
        ▼
Professionals Invited
        │
        ▼
Invitations Resolved
        │
        ▼
Professionals Assigned
        │
        ▼
Project Ready
```

---

# Design Principles

The Agreement Module follows the following principles:

- One Project owns exactly one Agreement.
- Agreement cannot exist without a Project.
- Professionals never join directly.
- Every professional must be invited.
- Every important action is audited.
- Business rules are enforced inside the service layer.
- Controllers remain thin.
- Repository layer owns persistence.
- Redis is used for read optimization.
- Socket.IO provides real-time synchronization.

---

# Redis Integration

Caching is used for:

- Agreement Details
- Participant Lists
- Agreement Audit Logs

Caches are automatically invalidated after every write operation.

---

# Real-Time Events

The module publishes Socket.IO events for agreement activity.

Current events include:

- Agreement Created
- Agreement Updated
- Invitation Created
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn
- Professional Removed

---

# Security

Every operation passes through permission validation.

Permission enforcement includes:

- Agreement ownership
- Workspace membership
- Invitation ownership
- Contractor-only operations
- Professional-only operations

No database operation bypasses permission validation.

---

# Module Goals

The Agreement Module guarantees that:

- Every project has a contractual definition.
- Every professional joins through an invitation.
- Every agreement action is traceable.
- Every state transition follows business rules.
- Every important event is available in real time.
- Every agreement remains synchronized across connected clients.


####################################################################################################################

# Phase 2 — Business Rules

# Agreement Business Rules

This document defines every business rule enforced by the Agreement Module.

All rules are enforced inside the service layer before any database mutation occurs.

---

# 1. Agreement Ownership

Every project owns exactly one agreement.

Rules:

- A project cannot exist with multiple agreements.
- An agreement cannot exist without a project.
- Agreement ownership cannot be transferred independently.
- Deleting a project deletes its agreement.

Relationship

```
Project (1)
      │
      │
      ▼
Agreement (1)
```

---

# 2. Agreement Creation

An agreement may only be created for an existing project.

Rules

- Project must exist.
- Agreement must not already exist.
- Creator must have permission to edit the project.
- Agreement is created only while the project is in Draft.

---

# 3. Agreement Updates

Agreement editing is restricted.

Rules

- Only the contractor may edit.
- Agreement must exist.
- Project must remain editable.
- Every successful update creates an audit log.
- Cache is invalidated after every update.
- Real-time event is published after every update.

---

# 4. Agreement Fields

Editable fields include:

- Title
- Description
- Scope
- Out Of Scope
- Budget
- Expected Duration

System managed fields:

- Created By
- Last Updated By
- Created At
- Updated At

These fields cannot be modified directly.

---

# 5. Contractor Rules

Each agreement has exactly one contractor.

Rules

- Contractor is inherited from the project.
- Contractor cannot remove themselves.
- Contractor cannot invite themselves.
- Contractor manages all invitations.
- Contractor controls agreement modifications.

---

# 6. Professional Rules

Professionals always enter through invitations.

Rules

- Professionals cannot self join.
- Professionals cannot invite other users.
- Professionals cannot edit agreements.
- Professionals may only accept or decline their own invitations.

---

# 7. Invitation Creation Rules

Only the contractor may invite professionals.

Rules

- Agreement must exist.
- Project must remain editable.
- User cannot invite themselves.
- Duplicate pending invitations are prohibited.
- Accepted professionals cannot be invited again.
- Cooldown rule must be satisfied.

---

# 8. Invitation Lifecycle

Every invitation follows the same lifecycle.

```
PENDING
   │
   ├───────────────┐
   ▼               ▼
ACCEPTED      DECLINED
   │
   ▼
ACTIVE PARTICIPANT
```

The contractor may also withdraw a pending invitation.

```
PENDING
    │
    ▼
WITHDRAWN
```

Terminal states

- Accepted
- Declined
- Withdrawn

A processed invitation cannot be processed again.

---

# 9. Invitation Acceptance Rules

Rules

- Only the invited professional may accept.
- Invitation must still be pending.
- Acceptance records:
    - Responded At
    - Joined At
- Audit entry is created.
- Cache is invalidated.
- Project setup stage may advance.

---

# 10. Invitation Decline Rules

Rules

- Only the invited professional may decline.
- Invitation must remain pending.
- Responded At is recorded.
- Joined At remains null.
- Audit entry is created.
- Cache is invalidated.

---

# 11. Invitation Withdrawal Rules

Only the contractor may withdraw invitations.

Rules

- Invitation must remain pending.
- Processed invitations cannot be withdrawn.
- Withdrawal records Responded At.
- Audit entry is created.
- Cache is invalidated.

---

# 12. Professional Removal Rules

Professionals may be removed only after joining.

Rules

- Pending invitations cannot be removed.
- Pending invitations must be withdrawn instead.
- Only the contractor may remove professionals.
- Removal creates an audit log.
- Cache is invalidated.
- Project setup stage may move backwards.

---

# 13. Cooldown Rule

Professionals cannot be spammed with invitations.

Rule

If a professional declines an invitation,

they cannot receive another invitation for

3 days.

```
Declined
     │
     │ 3 Days
     ▼
Invitation Allowed
```

Withdrawn invitations do not trigger the cooldown.

Accepted invitations do not trigger the cooldown.

---

# 14. Duplicate Invitation Rules

A professional cannot have:

- Multiple pending invitations
- Multiple accepted records

Historical invitations remain stored.

---

# 15. Project Setup Stage Rules

Agreement creation updates the setup stage.

```
PROJECT_CREATED
        │
        ▼
AGREEMENT_COMPLETED
```

Accepting the first professional

```
AGREEMENT_COMPLETED
        │
        ▼
PROFESSIONALS_ASSIGNED
```

Removing the final professional

```
PROFESSIONALS_ASSIGNED
        │
        ▼
AGREEMENT_COMPLETED
```

---

# 16. Project Activation Rule

A project cannot become Active while invitation processing remains incomplete.

Activation requirements

- Agreement exists.
- No pending invitations remain.
- Every invitation is either:
    - Accepted
    - Declined
    - Withdrawn
- At least one professional has accepted (if the project requires professionals).

Only after these conditions are satisfied may the project transition from Draft to Active.

---

# 17. Audit Rules

Every important operation creates an immutable audit entry.

Audited operations include

- Agreement Created
- Agreement Updated
- Professional Invited
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn
- Professional Removed

Audit records cannot be modified.

Audit records cannot be deleted.

---

# 18. Cache Rules

Redis cache is maintained for

- Agreement
- Participant List
- Agreement Audits

Every write operation invalidates affected cache entries.

Read operations always attempt cache retrieval first.

---

# 19. Real-Time Rules

Socket.IO events are emitted after successful transactions.

Events include

- Agreement Created
- Agreement Updated
- Invitation Created
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn
- Professional Removed

Events are emitted only after successful database commits.

---

# 20. Permission Rules

Only Contractors may

- Create agreements
- Update agreements
- Invite professionals
- Withdraw invitations
- Remove professionals

Only Professionals may

- Accept invitations
- Decline invitations

Everyone with agreement access may

- View agreement
- View participants
- View audit history

Unauthorized operations are rejected before any database modification occurs.

####################################################################################################################

# Phase 3 — Database Design

# Agreement Database Design

The Agreement Module introduces three primary entities.

- Agreement
- Agreement Participant
- Agreement Audit

These entities together define the contractual layer of every project.

---

# Entity Relationship Diagram

```
Workspace
    │
    ▼
Project
    │
    │ 1 : 1
    ▼
Agreement
    │
    ├──────────────────────────┐
    │                          │
    ▼                          ▼
AgreementParticipant     AgreementAudit
    │
    ▼
User
```

---

# Agreement Table

Represents the contractual definition of a project.

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary Key |
| projectId | UUID | No | Unique Project Reference |
| title | String | No | Agreement title |
| description | Text | Yes | Agreement description |
| scope | Text | Yes | Included work |
| outOfScope | Text | Yes | Excluded work |
| budget | Decimal | No | Total agreement budget |
| expectedDuration | Integer | No | Expected duration in days |
| createdById | UUID | No | Agreement creator |
| lastUpdatedById | UUID | No | Last editor |
| createdAt | DateTime | No | Creation timestamp |
| updatedAt | DateTime | No | Last update timestamp |

---

## Constraints

- One Project owns exactly one Agreement.
- projectId is UNIQUE.
- Agreement cannot exist without a Project.
- Budget must be greater than zero.
- Expected duration must be greater than zero.

---

## Relationships

```
Agreement
    │
    ├──── Project
    │
    ├──── Created By User
    │
    ├──── Updated By User
    │
    ├──── Participants
    │
    └──── Audit Logs
```

---

# Agreement Participant Table

Represents every participant associated with an agreement.

A participant may represent

- Contractor
- Professional

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary Key |
| agreementId | UUID | No | Parent Agreement |
| userId | UUID | No | Participant |
| role | Enum | No | Contractor / Professional |
| invitationStatus | Enum | No | Invitation State |
| invitedAt | DateTime | No | Invitation timestamp |
| respondedAt | DateTime | Yes | Acceptance / Decline time |
| joinedAt | DateTime | Yes | Join timestamp |
| createdAt | DateTime | No | Record creation |
| updatedAt | DateTime | No | Record update |

---

# Invitation Status Enum

```
PENDING

ACCEPTED

DECLINED

WITHDRAWN
```

---

# Participant Role Enum

```
CONTRACTOR

PROFESSIONAL
```

---

# Constraints

- Every participant belongs to one agreement.
- Every participant references one user.
- Multiple invitation history is allowed.
- Only one pending invitation may exist.
- Only one accepted participant record may exist.
- Historical invitations remain immutable.

---

# Agreement Audit Table

Stores every significant agreement activity.

Audit history is immutable.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary Key |
| agreementId | UUID | No | Parent Agreement |
| actorId | UUID | No | User performing action |
| action | Enum | No | Audit Action |
| metadata | JSON | Yes | Action payload |
| createdAt | DateTime | No | Audit timestamp |

---

# Agreement Audit Actions

```
CREATED

UPDATED

PROFESSIONAL_INVITED

INVITATION_ACCEPTED

INVITATION_DECLINED

INVITATION_WITHDRAWN

PROFESSIONAL_REMOVED
```

---

# Foreign Key Relationships

```
Agreement.projectId
        │
        ▼
Project.id
```

```
Agreement.createdById
        │
        ▼
User.id
```

```
Agreement.lastUpdatedById
        │
        ▼
User.id
```

```
AgreementParticipant.agreementId
            │
            ▼
Agreement.id
```

```
AgreementParticipant.userId
            │
            ▼
User.id
```

```
AgreementAudit.agreementId
          │
          ▼
Agreement.id
```

```
AgreementAudit.actorId
        │
        ▼
User.id
```

---

# Cascade Behaviour

## Project Deleted

```
Project
    │
    ▼
Agreement Deleted
    │
    ├──────────────┐
    ▼              ▼
Participants   Audit Logs
Deleted        Deleted
```

---

## User Deleted

User records are never physically removed.

Soft deletion preserves

- Agreements
- Participants
- Audit History

---

# Database Indexes

## Agreement

```
PRIMARY KEY (id)

UNIQUE(projectId)

INDEX(createdById)

INDEX(lastUpdatedById)
```

---

## Agreement Participant

```
PRIMARY KEY(id)

INDEX(agreementId)

INDEX(userId)

INDEX(invitationStatus)

INDEX(role)

INDEX(invitedAt)
```

---

## Agreement Audit

```
PRIMARY KEY(id)

INDEX(agreementId)

INDEX(actorId)

INDEX(action)

INDEX(createdAt)
```

---

# Query Patterns

Frequently executed queries include

## Agreement

- Find by Project
- Update Agreement
- Load Agreement with Participants

---

## Participants

- Get Participants
- Pending Invitation
- Accepted Professionals
- Latest Invitation
- Count Accepted Professionals
- User Invitations

---

## Audit

- Agreement Timeline
- Action Filtering
- Pagination
- Chronological Ordering

---

# Redis Cache Keys

```
agreement:{projectId}
```

```
agreement:participants:{agreementId}
```

```
agreement:audits:{agreementId}:{queryHash}
```

---

# Cache Invalidation

Agreement Updated

```
Agreement Cache

Agreement Audit Cache
```

Invitation Created

```
Participant Cache

Audit Cache
```

Invitation Accepted

```
Participant Cache

Agreement Cache

Audit Cache
```

Invitation Declined

```
Participant Cache

Agreement Cache

Audit Cache
```

Invitation Withdrawn

```
Participant Cache

Agreement Cache

Audit Cache
```

Professional Removed

```
Participant Cache

Agreement Cache

Audit Cache
```

---

# Data Integrity Rules

The database enforces

- One Agreement per Project.
- Valid participant roles.
- Valid invitation states.
- Immutable audit history.
- Referential integrity through foreign keys.
- Soft deletion compatibility.
- Historical invitation preservation.
- Transactional consistency across agreement operations.

####################################################################################################################

# Phase 4 — API Documentation

# Agreement API Reference

The Agreement Module exposes APIs for agreement management, participant management, invitation workflow, and audit history.

All APIs require authentication.

---

# Base Route

```
/api/v1/agreement
```

---

# Authentication

Every endpoint requires

```
Authorization: Bearer <Access Token>
```

---

# Agreement APIs

---

# Create Agreement

Creates the agreement for a project.

## Endpoint

```
POST /projects/:projectId/agreement
```

---

## Authorization

Authenticated User

---

## Permissions

- Project Owner
- Workspace Owner
- Workspace Admin (if permitted)

---

## Request Body

```json
{
    "title": "Backend Development Agreement",
    "description": "Agreement for backend implementation.",
    "scope": "Build backend APIs",
    "outOfScope": "Frontend Development",
    "budget": 25000,
    "expectedDuration": 30
}
```

---

## Success Response

```json
{
    "success": true,
    "message": "Agreement created successfully.",
    "data": {}
}
```

---

## Business Flow

```
Validate Project
        │
Check Permissions
        │
Agreement Exists?
        │
Create Agreement
        │
Create Contractor Participant
        │
Create Audit
        │
Update Project Setup Stage
        │
Invalidate Cache
        │
Emit Socket Event
        │
Return Agreement
```

---

## Cache Invalidated

```
agreement:{projectId}
```

---

## Audit Created

```
CREATED
```

---

## Socket Event

```
agreement:created
```

---

# Get Agreement

Returns agreement details.

## Endpoint

```
GET /projects/:projectId/agreement
```

---

## Success Response

```json
{
    "success": true,
    "data": {}
}
```

---

## Cache

```
agreement:{projectId}
```

Read-through Redis cache.

---

# Update Agreement

Updates agreement details.

## Endpoint

```
PATCH /projects/:projectId/agreement
```

---

## Request Body

```json
{
    "title": "Updated Agreement",
    "budget": 35000,
    "expectedDuration": 45
}
```

---

## Success Response

```json
{
    "success": true,
    "message": "Agreement updated successfully.",
    "data": {}
}
```

---

## Business Flow

```
Validate Project
        │
Check Permissions
        │
Load Agreement
        │
Update Agreement
        │
Create Audit
        │
Invalidate Cache
        │
Emit Socket Event
```

---

## Cache Invalidated

```
agreement:{projectId}
```

```
agreement:audits:{agreementId}:*
```

---

## Audit

```
UPDATED
```

---

## Socket Event

```
agreement:updated
```

---

# Participant APIs

---

# Get Participants

Returns every participant.

## Endpoint

```
GET /projects/:projectId/agreement/participants
```

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

```
agreement:participants:{agreementId}
```

---

# Invite Professional

Creates a new invitation.

## Endpoint

```
POST /projects/:projectId/agreement/participants
```

---

## Request

```json
{
    "userId": "uuid"
}
```

---

## Success Response

```json
{
    "success": true,
    "message": "Professional invited successfully.",
    "data": {}
}
```

---

## Business Flow

```
Validate Project
        │
Load Agreement
        │
Permission Check
        │
Cooldown Check
        │
Duplicate Check
        │
Create Invitation
        │
Create Audit
        │
Invalidate Cache
        │
Emit Socket Event
```

---

## Cache Invalidated

```
agreement:participants:{agreementId}
```

```
agreement:audits:{agreementId}:*
```

---

## Audit

```
PROFESSIONAL_INVITED
```

---

## Socket Event

```
agreement:invitation:created
```

Target

```
user:{professionalId}
```

---

# Accept Invitation

Accepts an invitation.

## Endpoint

```
PATCH /projects/:projectId/agreement/participants/:participantId
```

---

## Request

```json
{
    "status": "ACCEPTED"
}
```

---

## Success Response

```json
{
    "success": true,
    "message": "Invitation updated successfully.",
    "data": {}
}
```

---

## Business Flow

```
Load Invitation
        │
Validate Owner
        │
Update Status
        │
Set JoinedAt
        │
Create Audit
        │
Update Project Setup Stage
        │
Invalidate Cache
        │
Join Project Room
        │
Emit Socket Event
```

---

## Audit

```
INVITATION_ACCEPTED
```

---

## Socket Event

```
agreement:invitation:accepted
```

---

# Decline Invitation

## Endpoint

```
PATCH /projects/:projectId/agreement/participants/:participantId
```

---

## Request

```json
{
    "status": "DECLINED"
}
```

---

## Business Flow

```
Load Invitation
        │
Validate User
        │
Update Status
        │
Create Audit
        │
Invalidate Cache
        │
Emit Socket Event
```

---

## Audit

```
INVITATION_DECLINED
```

---

## Socket Event

```
agreement:invitation:declined
```

---

# Withdraw Invitation

Withdraws a pending invitation.

## Endpoint

```
PATCH /projects/:projectId/agreement/participants/:participantId/withdraw
```

---

## Success Response

```json
{
    "success": true,
    "message": "Invitation withdrawn successfully.",
    "data": {}
}
```

---

## Business Flow

```
Load Invitation
        │
Permission Check
        │
Validate Pending
        │
Withdraw Invitation
        │
Create Audit
        │
Invalidate Cache
        │
Emit Socket Event
```

---

## Audit

```
INVITATION_WITHDRAWN
```

---

## Socket Event

```
agreement:invitation:withdrawn
```

Target

```
user:{professionalId}
```

---

# Remove Professional

Removes an accepted professional.

## Endpoint

```
DELETE /projects/:projectId/agreement/participants/:participantId
```

---

## Success Response

```json
{
    "success": true,
    "message": "Professional removed successfully."
}
```

---

## Business Flow

```
Load Participant
        │
Permission Check
        │
Remove Participant
        │
Create Audit
        │
Update Project Setup Stage
        │
Invalidate Cache
        │
Leave Project Room
        │
Emit Socket Event
```

---

## Audit

```
PROFESSIONAL_REMOVED
```

---

## Socket Event

```
agreement:participant:removed
```

---

# Audit APIs

---

# Get Agreement Audits

Returns paginated audit history.

## Endpoint

```
GET /projects/:projectId/agreement/audits
```

---

## Query Parameters

| Parameter | Description |
|------------|-------------|
| page | Page Number |
| limit | Page Size |
| order | asc / desc |
| action | Audit Filter |

---

## Example

```
GET /projects/:projectId/agreement/audits?page=1&limit=20
```

---

## Success Response

```json
{
    "success": true,
    "data": {
        "audits": [],
        "pagination": {}
    }
}
```

---

## Cache

```
agreement:audits:{agreementId}:{queryHash}
```

---

# Common Error Responses

| Status | Meaning |
|---------|----------|
| 400 | Validation Failed |
| 401 | Unauthorized |
| 403 | Permission Denied |
| 404 | Agreement Not Found |
| 404 | Participant Not Found |
| 409 | Duplicate Invitation |
| 409 | Cooldown Active |
| 409 | Agreement Already Exists |
| 422 | Invalid Invitation State |
| 500 | Internal Server Error |

####################################################################################################################

# Phase 5 — Agreement Lifecycle

# Agreement Lifecycle

The Agreement Module controls the complete pre-execution lifecycle of a project.

It ensures that project execution cannot begin until the contractual setup has been completed.

---

# High-Level Lifecycle

```
Project Created
        │
        ▼
Agreement Created
        │
        ▼
Professionals Invited
        │
        ▼
Invitation Resolution
        │
        ▼
Professionals Assigned
        │
        ▼
Project Ready
        │
        ▼
Project Activated
```

---

# Lifecycle Stages

## Stage 1

### Project Created

Project exists.

Agreement does not exist.

```
Project

Status
DRAFT

Setup Stage
PROJECT_CREATED
```

Allowed Operations

- Create Agreement
- Edit Project
- Delete Project

Not Allowed

- Invite Professionals
- Activate Project

---

## Stage 2

### Agreement Created

Agreement has been created.

Contractor participant is automatically added.

```
Project

Status
DRAFT

Setup Stage
AGREEMENT_COMPLETED
```

Allowed Operations

- Update Agreement
- Invite Professionals
- View Agreement
- View Audit History

Not Allowed

- Activate Project (until invitation rules are satisfied)

---

## Stage 3

### Professionals Invited

One or more professionals have pending invitations.

```
Agreement
      │
      ├──── Pending
      ├──── Pending
      └──── Pending
```

Project remains

```
Status
DRAFT
```

Allowed Operations

- Invite More Professionals
- Withdraw Invitation
- Accept Invitation
- Decline Invitation

Not Allowed

- Activate Project

---

## Stage 4

### Invitation Resolution

Every invitation eventually reaches a terminal state.

```
PENDING
    │
    ├───────────────┐
    ▼               ▼
ACCEPTED      DECLINED
    │
    ▼
ACTIVE
```

or

```
PENDING
    │
    ▼
WITHDRAWN
```

Terminal States

- Accepted
- Declined
- Withdrawn

Pending invitations prevent project activation.

---

## Stage 5

### Professionals Assigned

Once at least one professional accepts,

the setup stage advances.

```
PROJECT_CREATED
        │
        ▼
AGREEMENT_COMPLETED
        │
        ▼
PROFESSIONALS_ASSIGNED
```

Project still remains

```
Status

DRAFT
```

---

## Stage 6

### Project Ready

Project becomes ready only after

- Agreement exists.
- No pending invitations remain.
- Invitation processing has completed.
- Required professionals have accepted.

```
Agreement
      │
      ├──── Accepted
      ├──── Declined
      └──── Withdrawn
```

No pending invitations remain.

---

## Stage 7

### Project Activated

Project moves into execution.

```
Status

ACTIVE
```

Agreement editing is no longer permitted.

Professional onboarding is complete.

Execution modules become available.

---

# Invitation Lifecycle

```
                Invite
                   │
                   ▼
              PENDING
         ┌─────┼──────┐
         │     │      │
         ▼     ▼      ▼
 ACCEPTED DECLINED WITHDRAWN
```

Accepted

- Joined At populated
- Responded At populated

Declined

- Responded At populated

Withdrawn

- Responded At populated

---

# Participant Lifecycle

```
Invited
   │
   ▼
Pending
   │
   ├─────────────┐
   ▼             ▼
Accepted     Declined
   │
   ▼
Assigned
   │
   ▼
Removed
```

---

# Agreement Lifecycle

```
Agreement Created
        │
        ▼
Agreement Updated
        │
        ▼
Professional Invitations
        │
        ▼
Invitation Resolution
        │
        ▼
Agreement Locked
```

Agreement remains associated with the project throughout its lifetime.

---

# Project Setup Stage Transitions

## Project Creation

```
PROJECT_CREATED
```

↓

Agreement Created

```
AGREEMENT_COMPLETED
```

↓

First Professional Accepted

```
PROFESSIONALS_ASSIGNED
```

↓

Final Professional Removed

```
AGREEMENT_COMPLETED
```

---

# Activation Rules

Project activation requires all of the following conditions.

## Agreement Exists

```
YES
```

---

## No Pending Invitations

```
Pending = 0
```

---

## Invitation Processing Complete

Every invitation must be

- Accepted
- Declined
- Withdrawn

---

## Professional Requirement

If professionals are required,

at least one professional must have accepted.

---

# State Transition Matrix

| Current State | Action | Next State |
|---------------|--------|------------|
| PROJECT_CREATED | Create Agreement | AGREEMENT_COMPLETED |
| AGREEMENT_COMPLETED | Invite Professional | AGREEMENT_COMPLETED |
| AGREEMENT_COMPLETED | Accept Invitation | PROFESSIONALS_ASSIGNED |
| PROFESSIONALS_ASSIGNED | Remove Last Professional | AGREEMENT_COMPLETED |
| AGREEMENT_COMPLETED | Activate Project | ACTIVE *(Only if activation rules pass)* |
| PROFESSIONALS_ASSIGNED | Activate Project | ACTIVE *(Only if activation rules pass)* |

---

# Lifecycle Rollback

The Agreement Module supports backward transitions when required.

Examples

```
Professional Removed
        │
        ▼
Setup Stage

PROFESSIONALS_ASSIGNED

↓

AGREEMENT_COMPLETED
```

The project may become ineligible for activation again until the required setup conditions are restored.

---

# Lifecycle Guarantees

The Agreement Module guarantees that

- Every project owns exactly one agreement.
- Every professional joins through an invitation.
- Every invitation reaches a terminal state.
- Every important action is audited.
- Every setup transition is deterministic.
- Project execution cannot begin until agreement setup is complete.
- Agreement history remains permanently traceable.
```

####################################################################################################################

# Phase 6 — Authorization & Permission Matrix

# Agreement Permission Model

The Agreement Module follows a role-based authorization model.

Every request is authenticated before permission validation begins.

Permission checks are enforced inside the service layer before any business logic or database operation.

---

# System Roles

The Agreement Module recognizes two primary participant roles.

```
Contractor

Professional
```

Workspace-level permissions are validated before agreement-level permissions.

---

# Contractor Permissions

The contractor owns the agreement.

The contractor is responsible for

- Agreement creation
- Agreement modification
- Professional onboarding
- Invitation management
- Participant management

---

## Contractor Capabilities

| Action | Allowed |
|----------|----------|
| View Agreement | ✅ |
| Update Agreement | ✅ |
| View Participants | ✅ |
| Invite Professional | ✅ |
| Withdraw Invitation | ✅ |
| Remove Professional | ✅ |
| View Audit History | ✅ |
| Activate Project | ✅ *(If lifecycle rules pass)* |

---

# Professional Permissions

Professionals participate only after invitation.

Professionals cannot modify contractual information.

---

## Professional Capabilities

| Action | Allowed |
|----------|----------|
| View Agreement | ✅ *(after invitation)* |
| View Participants | ✅ |
| View Audit History | ✅ |
| Accept Invitation | ✅ |
| Decline Invitation | ✅ |
| Update Agreement | ❌ |
| Invite Professionals | ❌ |
| Withdraw Invitations | ❌ |
| Remove Participants | ❌ |
| Activate Project | ❌ |

---

# Workspace Owner

Workspace Owners inherit complete authority over projects inside the workspace.

Capabilities include

- View Agreement
- Update Agreement
- Invite Professionals
- Remove Professionals
- Withdraw Invitations
- View Audit History

Subject to workspace-level access control.

---

# Workspace Admin

Workspace Admins may perform agreement operations only if permitted by workspace policies.

Their permissions are validated before agreement permissions.

---

# Authentication Flow

```
Incoming Request
        │
        ▼
Authenticate User
        │
        ▼
Validate Workspace Access
        │
        ▼
Validate Project Access
        │
        ▼
Validate Agreement Access
        │
        ▼
Execute Business Logic
```

---

# Agreement Access Rules

A user may access an agreement only if

- They own the project.
- They belong to the workspace.
- They are an invited participant.
- They are an accepted participant.
- They are a workspace administrator with sufficient privileges.

Otherwise

```
403 Forbidden
```

is returned.

---

# Invitation Permission Rules

## Invite Professional

Allowed

- Contractor

Denied

- Professional

---

## Accept Invitation

Allowed

- Invited Professional

Denied

- Contractor
- Other Professionals

---

## Decline Invitation

Allowed

- Invited Professional

Denied

- Contractor
- Other Professionals

---

## Withdraw Invitation

Allowed

- Contractor

Denied

- Professional

---

## Remove Professional

Allowed

- Contractor

Denied

- Professional

---

# Agreement Update Rules

Agreement updates require

- Existing agreement
- Edit permissions
- Editable project state

Otherwise the request is rejected.

---

# Audit Permissions

Every authorized participant may view audit history.

Audit records are read-only.

No user may

- Edit Audit Logs
- Delete Audit Logs

---

# Project Activation Permissions

Project activation requires

- Contractor privileges
- Lifecycle completion
- Agreement completion
- Invitation completion

If any requirement fails,

activation is rejected.

---

# Permission Matrix

| Operation | Contractor | Professional | Workspace Owner | Workspace Admin* |
|------------|------------|--------------|-----------------|------------------|
| View Agreement | ✅ | ✅ | ✅ | ✅ |
| Update Agreement | ✅ | ❌ | ✅ | ✅* |
| View Participants | ✅ | ✅ | ✅ | ✅ |
| Invite Professional | ✅ | ❌ | ✅ | ✅* |
| Accept Invitation | ❌ | ✅ *(Self)* | ❌ | ❌ |
| Decline Invitation | ❌ | ✅ *(Self)* | ❌ | ❌ |
| Withdraw Invitation | ✅ | ❌ | ✅ | ✅* |
| Remove Professional | ✅ | ❌ | ✅ | ✅* |
| View Audit History | ✅ | ✅ | ✅ | ✅ |
| Activate Project | ✅ | ❌ | ✅ | ✅* |

\* Subject to workspace-level authorization rules.

---

# Permission Validation Order

Every protected operation follows the same validation sequence.

```
Authentication
        │
        ▼
Workspace Membership
        │
        ▼
Project Access
        │
        ▼
Agreement Access
        │
        ▼
Role Validation
        │
        ▼
Business Rule Validation
        │
        ▼
Database Operation
```

---

# Security Guarantees

The Agreement Module guarantees that

- Every request is authenticated.
- Every operation is authorized.
- Users cannot operate outside their workspace.
- Professionals cannot modify contractual information.
- Contractors retain ownership over agreement management.
- Audit history cannot be modified.
- Authorization is enforced before database mutations.
- Permission checks remain centralized within the service layer.
```

####################################################################################################################

# Phase 7 — Redis Caching Strategy

# Agreement Cache Architecture

The Agreement Module uses Redis to reduce database load and improve response times for frequently accessed resources.

Caching follows a cache-aside strategy.

```
Client
   │
   ▼
Redis
   │
Cache Miss
   │
   ▼
Database
   │
   ▼
Redis Update
   │
   ▼
Client
```

---

# Cache Strategy

The Agreement Module caches

- Agreement Details
- Participant Lists
- Agreement Audit Logs

Write operations never update cache directly.

Instead, affected cache entries are invalidated after successful database transactions.

---

# Cache Flow

## Read Request

```
Incoming Request
        │
        ▼
Generate Cache Key
        │
        ▼
Redis Lookup
        │
   ┌────┴────┐
   │         │
Hit        Miss
   │         │
   ▼         ▼
Return    Database
Cache       Query
              │
              ▼
        Store in Redis
              │
              ▼
        Return Response
```

---

## Write Request

```
Incoming Request
        │
        ▼
Database Transaction
        │
        ▼
Commit Successful
        │
        ▼
Invalidate Cache
        │
        ▼
Return Response
```

---

# Cache Keys

---

## Agreement Details

```
agreement:{projectId}
```

Example

```
agreement:d73fd91b-624b-49da-9306-29c7953f5fcc
```

Stores

- Agreement
- Project
- Participants
- User Profiles

---

## Agreement Participants

```
agreement:participants:{agreementId}
```

Example

```
agreement:participants:3e7bbcb6-cb80-4f0b-984a-99ec5c8a3801
```

Stores

- Contractor
- Professionals
- Invitation Status
- User Profile

---

## Agreement Audit Logs

```
agreement:audits:{agreementId}:{queryHash}
```

Example

```
agreement:audits:3e7bbcb6-cb80-4f0b-984a-99ec5c8a3801:83ae90
```

Stores

- Paginated Audit History
- Filtering Results
- Pagination Metadata

---

# Cache TTL

| Cache | TTL |
|---------|-----|
| Agreement | 15 Minutes |
| Participants | 10 Minutes |
| Audit History | 10 Minutes |

Audit logs are immutable once created, making them excellent candidates for caching.

---

# Cache Invalidation

## Agreement Created

Invalidate

```
agreement:{projectId}
```

---

## Agreement Updated

Invalidate

```
agreement:{projectId}
```

```
agreement:audits:{agreementId}:*
```

---

## Professional Invited

Invalidate

```
agreement:participants:{agreementId}
```

```
agreement:{projectId}
```

```
agreement:audits:{agreementId}:*
```

---

## Invitation Accepted

Invalidate

```
agreement:participants:{agreementId}
```

```
agreement:{projectId}
```

```
agreement:audits:{agreementId}:*
```

---

## Invitation Declined

Invalidate

```
agreement:participants:{agreementId}
```

```
agreement:{projectId}
```

```
agreement:audits:{agreementId}:*
```

---

## Invitation Withdrawn

Invalidate

```
agreement:participants:{agreementId}
```

```
agreement:{projectId}
```

```
agreement:audits:{agreementId}:*
```

---

## Professional Removed

Invalidate

```
agreement:participants:{agreementId}
```

```
agreement:{projectId}
```

```
agreement:audits:{agreementId}:*
```

---

# Cache Responsibility

## Agreement Cache

Responsible for

- Agreement retrieval
- Project agreement lookup
- Complete agreement view

---

## Participant Cache

Responsible for

- Participant listing
- Invitation status
- Contractor information
- Professional information

---

## Audit Cache

Responsible for

- Timeline history
- Pagination
- Filtering
- Audit queries

---

# Cache Consistency

The Agreement Module guarantees

- Cache is never written before a successful database transaction.
- Cache invalidation occurs only after transaction commit.
- Failed transactions never invalidate cache.
- Cache is lazily rebuilt on the next read request.

---

# Cache Read Priority

```
Redis
   │
Hit
   │
Return

Miss
   │
Database
   │
Redis Update
   │
Return
```

---

# Cache Write Policy

The module follows

```
Cache Aside Pattern
```

Meaning

- Reads populate cache.
- Writes invalidate cache.
- Reads after invalidation rebuild cache automatically.

---

# Cache Benefits

The caching strategy provides

- Reduced database load.
- Faster agreement retrieval.
- Faster participant listing.
- Faster audit history retrieval.
- Consistent cache invalidation.
- Improved scalability under concurrent access.

---

# Cache Guarantees

The Agreement Module guarantees that

- Frequently accessed agreement data is served from Redis whenever available.
- Cache invalidation is automatic after successful write operations.
- No stale data is intentionally served after cache invalidation.
- Database remains the single source of truth.
- Redis acts solely as a performance optimization layer.

####################################################################################################################

# Phase 8 — Real-Time Communication (Socket.IO)

# Agreement Real-Time Architecture

The Agreement Module uses Socket.IO to synchronize agreement activities across connected clients in real time.

Events are emitted only after successful database transactions.

No Socket.IO event is emitted when a transaction fails.

---

# Real-Time Flow

```
Client Request
       │
       ▼
Service Layer
       │
       ▼
Database Transaction
       │
Commit Successful
       │
       ▼
Cache Invalidation
       │
       ▼
Socket.IO Event
       │
       ▼
Connected Clients
```

---

# Socket Rooms

The Agreement Module uses two types of rooms.

## User Room

Every authenticated user automatically joins

```
user:{userId}
```

Example

```
user:bd2f55ec-2276-4c12-a0ae-e90f7e60b4a7
```

User rooms are used for

- Agreement invitations
- Invitation withdrawal
- Participant removal
- Personal notifications

---

## Project Room

Users become members of a project room after joining the project.

```
project:{projectId}
```

Example

```
project:d73fd91b-624b-49da-9306-29c7953f5fcc
```

Project rooms are used for

- Agreement updates
- Project-wide agreement changes
- Collaborative synchronization

---

# Connection Flow

```
Socket Connected
        │
        ▼
Authenticate User
        │
        ▼
Join User Room
        │
        ▼
Load User Workspaces
        │
        ▼
Join Workspace Rooms
```

Accepted professionals additionally join

```
project:{projectId}
```

when their invitation is accepted.

---

# Event Lifecycle

```
Database Transaction
        │
Success
        │
        ▼
Invalidate Cache
        │
        ▼
Emit Socket Event
```

No event is emitted when

- Validation fails
- Permission checks fail
- Transaction rolls back

---

# Agreement Events

---

## agreement:created

Triggered when

- Agreement is created

Room

```
project:{projectId}
```

Payload

```json
{
    "agreementId": "...",
    "projectId": "..."
}
```

---

## agreement:updated

Triggered when

- Agreement information changes

Room

```
project:{projectId}
```

Payload

```json
{
    "agreementId": "...",
    "projectId": "..."
}
```

---

# Invitation Events

---

## agreement:invitation:created

Triggered when

- Contractor invites a professional

Target

```
user:{professionalId}
```

Payload

```json
{
    "participantId": "...",
    "agreementId": "...",
    "projectId": "...",
    "userId": "...",
    "invitedBy": "...",
    "invitedAt": "..."
}
```

---

## agreement:invitation:accepted

Triggered when

- Professional accepts invitation

Target

```
user:{contractorId}
```

Payload

```json
{
    "participantId": "...",
    "agreementId": "...",
    "projectId": "...",
    "userId": "...",
    "acceptedAt": "..."
}
```

Additional Action

```
Join

project:{projectId}
```

---

## agreement:invitation:declined

Triggered when

- Professional declines invitation

Target

```
user:{contractorId}
```

Payload

```json
{
    "participantId": "...",
    "agreementId": "...",
    "projectId": "...",
    "userId": "...",
    "declinedAt": "..."
}
```

---

## agreement:invitation:withdrawn

Triggered when

- Contractor withdraws invitation

Target

```
user:{professionalId}
```

Payload

```json
{
    "participantId": "...",
    "agreementId": "...",
    "projectId": "...",
    "userId": "...",
    "withdrawnBy": "..."
}
```

---

## agreement:participant:removed

Triggered when

- Contractor removes a professional

Target

```
user:{professionalId}
```

Payload

```json
{
    "participantId": "...",
    "agreementId": "...",
    "projectId": "...",
    "userId": "...",
    "removedBy": "..."
}
```

Additional Action

```
Leave

project:{projectId}
```

---

# Event Summary

| Event | Trigger | Target |
|--------|----------|---------|
| agreement:created | Agreement Created | project:{projectId} |
| agreement:updated | Agreement Updated | project:{projectId} |
| agreement:invitation:created | Professional Invited | user:{professionalId} |
| agreement:invitation:accepted | Invitation Accepted | user:{contractorId} |
| agreement:invitation:declined | Invitation Declined | user:{contractorId} |
| agreement:invitation:withdrawn | Invitation Withdrawn | user:{professionalId} |
| agreement:participant:removed | Professional Removed | user:{professionalId} |

---

# Room Membership Lifecycle

```
Socket Connected
        │
        ▼
Join User Room
        │
        ▼
Invitation Received
        │
        ▼
Invitation Accepted
        │
        ▼
Join Project Room
        │
        ▼
Participant Removed
        │
        ▼
Leave Project Room
```

---

# Delivery Guarantees

The Agreement Module guarantees

- Events are emitted only after successful database commits.
- No event is emitted for failed transactions.
- User-specific events are delivered through user rooms.
- Project-wide events are delivered through project rooms.
- Room membership changes automatically reflect participant lifecycle events.
- Socket.IO complements Redis caching and does not replace the database as the source of truth.

####################################################################################################################

# Phase 9 — Audit Logging

# Agreement Audit Logging

The Agreement Module maintains a complete immutable history of every significant agreement operation.

Audit logs provide accountability, traceability, debugging support, and historical insight into agreement changes.

Every audit entry is permanently stored once created.

---

# Purpose

The audit system records

- Agreement creation
- Agreement updates
- Professional invitations
- Invitation responses
- Invitation withdrawals
- Professional removals

Audit history represents the complete chronological timeline of an agreement.

---

# Architecture

```
Agreement Operation
        │
        ▼
Business Rule Validation
        │
        ▼
Database Transaction
        │
        ▼
Agreement Audit Created
        │
        ▼
Commit Transaction
        │
        ▼
Redis Cache Invalidated
```

Audit creation occurs inside the same database transaction.

If the transaction rolls back,

the audit record is never created.

---

# Audit Entity

Each audit record contains

| Field | Description |
|---------|-------------|
| id | Audit Identifier |
| agreementId | Parent Agreement |
| actorId | User performing action |
| action | Audit Action |
| metadata | Additional contextual information |
| createdAt | Event timestamp |

---

# Audit Actions

The Agreement Module currently records the following actions.

---

## CREATED

Triggered when

- Agreement is created.

Metadata

```json
{
    "projectId": "...",
    "title": "Backend Development Agreement"
}
```

---

## UPDATED

Triggered when

- Agreement information changes.

Metadata may include

```json
{
    "title": "...",
    "budget": 30000,
    "expectedDuration": 45
}
```

Only modified fields are stored.

---

## PROFESSIONAL_INVITED

Triggered when

- Contractor invites a professional.

Metadata

```json
{
    "userId": "...",
    "role": "PROFESSIONAL"
}
```

---

## INVITATION_ACCEPTED

Triggered when

- Professional accepts the invitation.

Metadata

```json
{
    "userId": "...",
    "joinedAt": "..."
}
```

---

## INVITATION_DECLINED

Triggered when

- Professional declines the invitation.

Metadata

```json
{
    "userId": "...",
    "respondedAt": "..."
}
```

---

## INVITATION_WITHDRAWN

Triggered when

- Contractor withdraws an invitation.

Metadata

```json
{
    "userId": "...",
    "withdrawnBy": "..."
}
```

---

## PROFESSIONAL_REMOVED

Triggered when

- Contractor removes an accepted professional.

Metadata

```json
{
    "userId": "...",
    "removedBy": "..."
}
```

---

# Audit Timeline

Example

```
Agreement Created
        │
        ▼
Agreement Updated
        │
        ▼
Professional Invited
        │
        ▼
Invitation Accepted
        │
        ▼
Professional Removed
```

Every event appears in chronological order.

---

# Metadata

Metadata stores operation-specific information.

Examples

Agreement Update

```json
{
    "budget": 35000
}
```

Invitation

```json
{
    "userId": "..."
}
```

Professional Removal

```json
{
    "userId": "...",
    "removedBy": "..."
}
```

Metadata is stored as JSON.

---

# Ordering

Audit history is ordered by

```
createdAt
```

Supported ordering

```
ASC
```

or

```
DESC
```

Pagination is supported.

---

# Filtering

Audit history supports filtering by

```
Action
```

Examples

```
CREATED
```

```
UPDATED
```

```
PROFESSIONAL_INVITED
```

```
INVITATION_ACCEPTED
```

---

# Audit Visibility

Audit history is visible to

- Contractor
- Accepted Professionals
- Authorized Workspace Members

Unauthorized users cannot access audit records.

---

# Immutability

Audit records cannot be

- Updated
- Deleted
- Reordered

Historical records remain permanently preserved.

---

# Transaction Guarantees

Every audit record is created inside the same transaction as the associated business operation.

```
Business Operation
        │
        ▼
Create Audit
        │
        ▼
Commit
```

If the transaction fails,

```
Business Operation
        │
Rollback
        │
No Audit Created
```

This guarantees consistency between agreement state and audit history.

---

# Redis Integration

Audit history uses Redis caching.

Cache Key

```
agreement:audits:{agreementId}:{queryHash}
```

Cache is invalidated after

- Agreement Created
- Agreement Updated
- Professional Invited
- Invitation Accepted
- Invitation Declined
- Invitation Withdrawn
- Professional Removed

---

# Audit API

```
GET /projects/:projectId/agreement/audits
```

Supports

- Pagination
- Ordering
- Action Filtering

---

# Audit Guarantees

The Agreement Module guarantees that

- Every important agreement operation creates an audit record.
- Audit records are immutable.
- Audit creation is transactional.
- Audit history remains chronologically ordered.
- Metadata preserves contextual information for every event.
- Redis caching optimizes audit retrieval while maintaining database consistency.

####################################################################################################################

# Phase 10 — Testing Guide

# Agreement Module Testing Guide

This document describes the complete testing workflow for the Agreement Module.

The objective is to verify

- Agreement creation
- Agreement updates
- Professional invitations
- Invitation responses
- Invitation withdrawal
- Participant removal
- Audit logging
- Project setup progression
- Redis cache invalidation
- Socket event emission

---

# Prerequisites

Before testing ensure

- PostgreSQL is running.
- Redis is running.
- Backend server is running.
- Authentication module is functional.
- Workspace module is functional.
- Project module is functional.
- At least two verified users exist.

Example

```
Contractor

professional01@example.com
```

```
Professional

professional02@example.com
```

---

# Test Flow

```
Login
    │
    ▼
Create Project
    │
    ▼
Create Agreement
    │
    ▼
Invite Professional
    │
    ▼
Professional Login
    │
    ▼
Accept / Decline
    │
    ▼
Withdraw / Remove
    │
    ▼
Audit Verification
    │
    ▼
Project Setup Verification
```

---

# Test Case 1

## Create Agreement

### Expected

- Agreement created.
- Contractor participant created.
- Audit created.
- Setup stage becomes

```
AGREEMENT_COMPLETED
```

---

# Test Case 2

## Fetch Agreement

Verify

- Agreement details
- Budget
- Scope
- Duration
- Participants

---

# Test Case 3

## Update Agreement

Verify

- Agreement updates.
- Updated timestamp changes.
- Audit entry created.
- Redis cache invalidated.
- Socket event emitted.

---

# Test Case 4

## Invite Professional

Verify

- Invitation created.
- Invitation status

```
PENDING
```

- Audit entry created.
- Professional receives realtime event.

---

# Test Case 5

## Duplicate Invitation

Invite same professional again.

Expected

```
409 Conflict
```

No duplicate invitation created.

---

# Test Case 6

## Accept Invitation

Login as invited professional.

Accept invitation.

Verify

- Invitation status

```
ACCEPTED
```

- JoinedAt populated.
- RespondedAt populated.
- Audit created.
- Professional joins project room.
- Contractor receives socket event.

---

# Test Case 7

## Decline Invitation

Login as invited professional.

Decline invitation.

Verify

```
DECLINED
```

Verify

- RespondedAt populated.
- JoinedAt remains null.
- Audit created.
- Contractor receives realtime notification.

---

# Test Case 8

## Withdraw Invitation

Login as contractor.

Withdraw pending invitation.

Verify

```
WITHDRAWN
```

Verify

- Audit created.
- Professional receives realtime notification.

---

# Test Case 9

## Remove Professional

Contractor removes accepted professional.

Verify

- Participant removed.
- Audit created.
- Professional leaves project room.
- Professional receives socket event.

---

# Test Case 10

## Audit History

Retrieve

```
GET /agreement/audits
```

Verify

Chronological order

```
CREATED

UPDATED

PROFESSIONAL_INVITED

INVITATION_ACCEPTED

PROFESSIONAL_REMOVED
```

---

# Test Case 11

## Redis Cache

Call

```
GET Agreement
```

twice.

Verify

First request

```
Database
```

Second request

```
Redis
```

---

# Test Case 12

## Cache Invalidation

Perform

- Update Agreement
- Invite Professional
- Accept Invitation

Verify

Redis keys are removed.

Next read should rebuild cache.

---

# Test Case 13

## Unauthorized Access

Attempt

- Update agreement as professional.
- Invite professional as professional.
- Remove participant as professional.

Expected

```
403 Forbidden
```

---

# Test Case 14

## Invalid Invitation

Accept already accepted invitation.

Expected

```
422 Unprocessable Entity
```

---

# Test Case 15

## Cooldown Rule

Decline invitation.

Immediately invite again.

Expected

```
409 Conflict
```

Cooldown active.

---

# Test Case 16

## Setup Stage Progression

Verify

```
Project Created
```

↓

```
PROJECT_CREATED
```

↓

Agreement Created

```
AGREEMENT_COMPLETED
```

↓

First Professional Accepted

```
PROFESSIONALS_ASSIGNED
```

↓

Last Professional Removed

```
AGREEMENT_COMPLETED
```

---

# Test Case 17

## Project Activation

Attempt activation while

- Pending invitations exist.

Expected

Activation rejected.

After

- No pending invitations remain.
- Agreement completed.
- Required professionals accepted.

Expected

```
ACTIVE
```

---

# Test Case 18

## Socket.IO

Verify events

| Event | Expected Recipient |
|---------|-------------------|
| agreement:created | Project Room |
| agreement:updated | Project Room |
| agreement:invitation:created | Invited Professional |
| agreement:invitation:accepted | Contractor |
| agreement:invitation:declined | Contractor |
| agreement:invitation:withdrawn | Professional |
| agreement:participant:removed | Removed Professional |

---

# Expected Database State

Agreement

```
1 Record
```

Contractor

```
1 Participant
```

Professionals

```
N Participants
```

Audit

```
Every operation logged
```

---

# Expected Redis State

Agreement

```
Cached
```

Participants

```
Cached
```

Audits

```
Cached
```

Modified resources should be automatically invalidated after successful write operations.

---

# Acceptance Criteria

The Agreement Module is considered production-ready when

- All APIs return expected responses.
- Business rules are enforced.
- Permission validation succeeds.
- Audit logs are generated correctly.
- Redis cache behaves as expected.
- Socket events are emitted successfully.
- Project setup stage transitions correctly.
- No pending invitation allows project activation.
- All automated and manual test cases pass successfully.

####################################################################################################################