# Workspace Module

## Purpose

Provides collaborative workspace management.

Supports:

* Personal Workspace
* Team Workspace
* Workspace Membership
* Workspace Invitations
* Role Based Access Control (RBAC)
* Ownership Management
* Workspace Activity Audit
* Redis Caching
* Real-time Workspace Events

The Workspace module is responsible for managing collaboration boundaries within Strus.

Every authenticated user owns exactly one Personal Workspace that is automatically created during profile creation.

Users may additionally create any number of Team Workspaces for collaboration.

The Workspace module does **not** manage projects, sprints, tasks, documents, or chats. Those belong to their respective modules.

---

# Workspace Architecture

```text
Authenticated User
        │
        ▼
Workspace Service
        │
        ▼
Permission Validation
        │
        ▼
Business Rules
        │
        ├──────────────► Redis Cache
        │
        ├──────────────► PostgreSQL
        │
        ├──────────────► Audit Logs
        │
        └──────────────► Socket.IO Events
```

---

# Workspace Components

| Component | Purpose |
|----------|---------|
| Workspace | Collaboration boundary |
| Workspace Member | User membership and role |
| Workspace Invitation | Invitation workflow |
| Workspace Audit | Immutable activity history |
| Redis | Workspace, Member & Invitation cache |
| Socket.IO | Real-time workspace synchronization |
| PostgreSQL | Permanent workspace storage |

---

# Workspace Types

| Type | Description |
|------|-------------|
| PERSONAL | Automatically created for every user. Private workspace. Members cannot be added. Ownership cannot be transferred. |
| TEAM | Collaborative workspace supporting invitations, multiple members, RBAC and ownership transfer. |

---

# Workspace Roles

| Role | Permissions |
|------|-------------|
| OWNER | Full administrative control including transfer ownership, remove members, update workspace, invite members and delete workspace. |
| ADMIN | Can manage members according to business rules except ownership operations. |
| MEMBER | Standard collaborative access with no administrative privileges. |

---

# Workspace Response Format

## Success

```json
{
    "success": true,
    "message": "...",
    "data": {}
}
```

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
| WORKSPACE_NOT_FOUND | 404 |
| MEMBER_NOT_FOUND | 404 |
| INVITATION_NOT_FOUND | 404 |
| USER_NOT_FOUND | 404 |
| WORKSPACE_ALREADY_EXISTS | 409 |
| INVITATION_ALREADY_EXISTS | 409 |
| PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED | 403 |
| INSUFFICIENT_PERMISSIONS | 403 |
| INVALID_OPERATION | 400 |
| INVALID_REQUEST | 400 |
| INVALID_TOKEN | 401 |
| TOKEN_EXPIRED | 401 |
| SESSION_REVOKED | 401 |
| INTERNAL_SERVER_ERROR | 500 |

---

# Authentication

Every Workspace API requires authentication unless explicitly stated otherwise.

```

Authorization: Bearer <access_token>
```

---

# Content Type

```
Content-Type: application/json
```

---

# Workspace Cache

Redis maintains multiple cache layers to reduce database reads.

| Cache | Key |
|------|-----|
| Workspace List | workspace:list:{userId} |
| Workspace Details | workspace:{workspaceId}:{userId} |
| Workspace Members | workspace:members:{workspaceId} |
| Workspace Invitations | workspace:invitations:{workspaceId} |

Cache invalidation occurs automatically whenever workspace metadata, members or invitations change.

---

# Real-Time Events

Workspace mutations publish Socket.IO events.

| Event | Trigger |
|-------|----------|
| WORKSPACE_CREATED | Team workspace created |
| WORKSPACE_UPDATED | Workspace updated |
| WORKSPACE_DELETED | Workspace deleted |
| MEMBER_INVITED | Invitation created |
| MEMBER_JOINED | Invitation accepted |
| MEMBER_LEFT | User leaves workspace |
| MEMBER_REMOVED | Member removed |
| MEMBER_ROLE_UPDATED | Member role changed |
| INVITATION_CANCELLED | Invitation cancelled |
| INVITATION_DECLINED | Invitation declined |
| OWNERSHIP_TRANSFERRED | Workspace ownership transferred |

Users automatically join:

```
user:{userId}
```

Workspace members automatically join:

```
workspace:{workspaceId}
```

allowing targeted real-time event delivery.

---

# Workspace Business Rules

1. Every user owns exactly one Personal Workspace.

2. Personal Workspaces are created automatically during profile creation.

3. Members cannot be invited to Personal Workspaces.

4. Personal Workspace ownership cannot be transferred.

5. Personal Workspace members cannot be removed because only the owner exists.

6. Every Team Workspace has exactly one OWNER.

7. Ownership transfer demotes the previous OWNER to ADMIN.

8. Invitation expiration is enforced.

9. Duplicate pending invitations are not allowed.

10. Only workspace members may access workspace resources.

11. Role based authorization is enforced for every mutating operation.

12. Every mutating operation generates an immutable audit record.

13. Every successful mutation invalidates the affected Redis cache.

14. Every successful mutation emits the corresponding Socket.IO event.

####################################################################################################

#######################################################################
# Workspace APIs

## POST /api/v1/workspaces

### Purpose

Create a new Team Workspace.

Only authenticated users may create Team Workspaces.

Personal Workspaces are automatically created during profile creation and cannot be created through this endpoint.

---

### Authentication

Access Token

---

### Request

```json
{
    "name": "Backend Team",
    "description": "Workspace for backend engineering."
}
```

---

### Validation

| Field | Rule |
|--------|------|
| name | Required, trimmed, 3-100 characters |
| description | Optional, maximum 500 characters |

---

### Success

**HTTP**

```text
201 Created
```

**Response**

```json
{
    "success": true,
    "message": "Workspace created successfully.",
    "data": {
        "id": "workspace_uuid",
        "name": "Backend Team",
        "description": "Workspace for backend engineering.",
        "workspaceType": "TEAM",
        "ownerId": "user_uuid",
        "createdAt": "2026-07-05T17:00:00.000Z"
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Invalid Request | 400 INVALID_REQUEST |
| Invalid Token | 401 INVALID_TOKEN |
| Session Revoked | 401 SESSION_REVOKED |

---

### Business Rules

* Only authenticated users may create workspaces.
* Every workspace is created as a **TEAM** workspace.
* Creator automatically becomes the **OWNER**.
* Creator is automatically inserted into Workspace Members.
* Workspace owner is stored in `Workspace.ownerId`.
* Initial audit log is created.
* Redis workspace cache is invalidated.
* Workspace creation event is emitted through Socket.IO.

---

### Database Changes

Creates

**Workspace**

```text
id
name
description
workspaceType = TEAM
ownerId
createdAt
updatedAt
```

Creates

**WorkspaceMember**

```text
workspaceId
userId
role = OWNER
joinedAt
```

Creates

**WorkspaceAudit**

```text
action = WORKSPACE_CREATED
actorId
workspaceId
metadata
```

---

### Redis

Deletes

```
workspace:list:{ownerId}
```

---

### Socket Events

Emits

```
WORKSPACE_CREATED
```

Payload

```json
{
    "workspaceId": "...",
    "ownerId": "..."
}
```

---

## GET /api/v1/workspaces

### Purpose

Return every workspace accessible to the authenticated user.

Includes both:

* Personal Workspace
* Team Workspaces

Only workspaces where the user is an active member are returned.

---

### Authentication

Access Token

---

### Request

```text
?page=1&limit=10
```

---

### Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| page | 1 | Current page |
| limit | 10 | Records per page |

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "data": {
        "workspaces": [
            {
                "id": "...",
                "name": "Personal",
                "workspaceType": "PERSONAL",
                "role": "OWNER"
            },
            {
                "id": "...",
                "name": "Backend Team",
                "workspaceType": "TEAM",
                "role": "ADMIN"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 2,
            "totalPages": 1,
            "hasNext": false
        }
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Invalid Token | 401 INVALID_TOKEN |
| Session Revoked | 401 SESSION_REVOKED |

---

### Business Rules

* Only active memberships are returned.
* User role inside each workspace is included.
* Personal workspace is included.
* Results are paginated.
* Response is cached in Redis.

---

### Database Changes

None

---

### Redis

Reads

```
workspace:list:{userId}
```

Cache miss:

* Query database.
* Populate Redis.

---

### Socket Events

None

---

## GET /api/v1/workspaces/:workspaceId

### Purpose

Return complete details of a single workspace.

Only accessible by workspace members.

---

### Authentication

Access Token

---

### Request

None

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "data": {
        "id": "...",
        "name": "Backend Team",
        "description": "...",
        "workspaceType": "TEAM",
        "ownerId": "...",
        "createdAt": "...",
        "updatedAt": "..."
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Invalid Token | 401 INVALID_TOKEN |

---

### Business Rules

* Caller must be an active workspace member.
* Personal and Team workspaces are both supported.
* Response is cached.
* No audit record is created.

---

### Database Changes

None

---

### Redis

Reads

```
workspace:{workspaceId}:{userId}
```

Cache miss:

* Query database.
* Populate cache.

---

### Socket Events

None

####################################################################################################

#######################################################################
# Workspace Management APIs

## PATCH /api/v1/workspaces/:workspaceId

### Purpose

Update an existing Team Workspace.

Only the workspace OWNER can update workspace metadata.

Personal Workspaces cannot be updated using this endpoint.

---

### Authentication

Access Token

---

### Request

```json
{
    "name": "Platform Engineering",
    "description": "Core platform engineering workspace."
}
```

---

### Validation

| Field | Rule |
|--------|------|
| name | Optional, 3–100 characters |
| description | Optional, maximum 500 characters |

At least one field must be provided.

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Workspace updated successfully.",
    "data": {
        "id": "workspace_uuid",
        "name": "Platform Engineering",
        "description": "Core platform engineering workspace.",
        "updatedAt": "2026-07-05T18:40:12.000Z"
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Personal Workspace | 403 PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED |
| Not Workspace Owner | 403 INSUFFICIENT_PERMISSIONS |
| Invalid Request | 400 INVALID_REQUEST |

---

### Business Rules

* Only OWNER may update workspace metadata.
* Personal Workspace metadata cannot be modified.
* Workspace slug remains unchanged.
* Audit log is created.
* Workspace cache is invalidated.
* Connected members receive a Socket.IO event.

---

### Database Changes

Updates

**Workspace**

```text
name
description
updatedAt
```

Creates

**WorkspaceAudit**

```text
action = WORKSPACE_UPDATED
actorId
workspaceId
metadata
```

---

### Redis

Invalidates

```
workspace:list:{ownerId}

workspace:{workspaceId}:*
```

---

### Socket Events

Emits

```
WORKSPACE_UPDATED
```

Payload

```json
{
    "workspaceId":"...",
    "name":"Platform Engineering"
}
```

---

## DELETE /api/v1/workspaces/:workspaceId

### Purpose

Delete an existing Team Workspace.

Deleting a workspace permanently removes all associated members and invitations.

Personal Workspaces cannot be deleted.

---

### Authentication

Access Token

---

### Request

None

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Workspace deleted successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Personal Workspace | 403 PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED |
| Not Workspace Owner | 403 INSUFFICIENT_PERMISSIONS |

---

### Business Rules

* Only OWNER may delete a workspace.
* Personal Workspace cannot be deleted.
* Members lose access immediately.
* Invitations are removed.
* Audit log is created.
* Cache is invalidated.
* Socket.IO deletion event is broadcast.

---

### Database Changes

Deletes

```text
Workspace
WorkspaceMember
WorkspaceInvitation
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:list:{memberId}

workspace:{workspaceId}:*

workspace:members:{workspaceId}

workspace:invitations:{workspaceId}
```

---

### Socket Events

Emits

```
WORKSPACE_DELETED
```

Payload

```json
{
    "workspaceId":"..."
}
```

---

## POST /api/v1/workspaces/:workspaceId/leave

### Purpose

Leave a Team Workspace.

Allows a member to voluntarily remove themselves from a workspace.

---

### Authentication

Access Token

---

### Request

None

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Left workspace successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Owner Leaving | 400 INVALID_OPERATION |
| Personal Workspace | 403 PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED |
| User Not Member | 404 MEMBER_NOT_FOUND |

---

### Business Rules

* OWNER cannot leave without transferring ownership first.
* Personal Workspace cannot be left.
* Member record is removed.
* Audit record is created.
* Cache is invalidated.
* Socket.IO event notifies remaining members.

---

### Database Changes

Deletes

```text
WorkspaceMember
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:list:{userId}

workspace:members:{workspaceId}
```

---

### Socket Events

Emits

```
MEMBER_LEFT
```

Payload

```json
{
    "workspaceId":"...",
    "userId":"..."
}
```

---

## PATCH /api/v1/workspaces/:workspaceId/transfer-ownership

### Purpose

Transfer workspace ownership to another member.

Ownership can only be transferred by the current OWNER.

---

### Authentication

Access Token

---

### Request

```json
{
    "newOwnerId":"member_uuid"
}
```

---

### Validation

| Field | Rule |
|--------|------|
| newOwnerId | Required UUID |

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Workspace ownership transferred successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Member Not Found | 404 MEMBER_NOT_FOUND |
| Personal Workspace | 403 PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED |
| Not Owner | 403 INSUFFICIENT_PERMISSIONS |
| Already Owner | 400 INVALID_OPERATION |

---

### Business Rules

* Only current OWNER may transfer ownership.
* Target user must already be a workspace member.
* Previous OWNER becomes ADMIN.
* New member becomes OWNER.
* Workspace.ownerId is updated.
* Audit log is recorded.
* Redis cache is invalidated.
* Socket.IO event is emitted.

---

### Database Changes

Updates

```text
Workspace.ownerId

WorkspaceMember.role (Old Owner → ADMIN)

WorkspaceMember.role (New Owner → OWNER)
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:list:{oldOwner}

workspace:list:{newOwner}

workspace:members:{workspaceId}
```

---

### Socket Events

Emits

```
OWNERSHIP_TRANSFERRED
```

Payload

```json
{
    "workspaceId":"...",
    "previousOwnerId":"...",
    "newOwnerId":"..."
}
```

####################################################################################################

# Workspace Member APIs

## GET /api/v1/workspaces/:workspaceId/members

### Purpose

Retrieve all members of a workspace with pagination.

Only workspace members can access the member list.

---

### Authentication

Access Token

---

### Query Parameters

| Parameter | Required | Default |
|-----------|----------|----------|
| page | No | 1 |
| limit | No | 10 |

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "data": {
        "members": [
            {
                "id": "user_uuid",
                "username": "hardik2208",
                "firstName": "Hardik",
                "lastName": "Raghuvanshi",
                "avatarUrl": null,
                "role": "OWNER",
                "joinedAt": "2026-07-05T17:00:00.000Z"
            },
            {
                "id": "user_uuid",
                "username": "workspaceuser1",
                "firstName": "Workspace",
                "lastName": "User",
                "avatarUrl": null,
                "role": "MEMBER",
                "joinedAt": "2026-07-05T17:10:00.000Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 2,
            "totalPages": 1,
            "hasNext": false
        }
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| User Not Member | 403 INSUFFICIENT_PERMISSIONS |

---

### Business Rules

* Only workspace members can view the member list.
* Supports pagination.
* Results are ordered by join date.
* Cached using Redis.

---

### Database Operations

Reads

```text
WorkspaceMember

UserProfile
```

---

### Redis

Reads

```
workspace:members:{workspaceId}
```

Writes

```
workspace:members:{workspaceId}
```

---

### Socket Events

None

---

## PATCH /api/v1/workspaces/:workspaceId/members/:memberId

### Purpose

Update the role of a workspace member.

Only the OWNER can change member roles.

---

### Authentication

Access Token

---

### Request

```json
{
    "role": "ADMIN"
}
```

---

### Validation

| Field | Rule |
|--------|------|
| role | Required (ADMIN or MEMBER) |

OWNER role cannot be assigned using this endpoint.

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Member role updated successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Member Not Found | 404 MEMBER_NOT_FOUND |
| Not Workspace Owner | 403 INSUFFICIENT_PERMISSIONS |
| Cannot Modify Owner | 400 INVALID_OPERATION |
| Invalid Role | 400 INVALID_REQUEST |

---

### Business Rules

* Only OWNER can modify roles.
* OWNER role cannot be granted here.
* OWNER role transfer must use Transfer Ownership API.
* Role changes are audited.
* Member cache is invalidated.
* Socket.IO notification is broadcast.

---

### Database Changes

Updates

```text
WorkspaceMember.role
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:members:{workspaceId}
```

---

### Socket Events

Emits

```
MEMBER_ROLE_UPDATED
```

Payload

```json
{
    "workspaceId":"...",
    "memberId":"...",
    "role":"ADMIN"
}
```

---

## DELETE /api/v1/workspaces/:workspaceId/members/:memberId

### Purpose

Remove a member from a workspace.

Only the OWNER can remove members.

---

### Authentication

Access Token

---

### Request

None

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Member removed successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Member Not Found | 404 MEMBER_NOT_FOUND |
| Not Workspace Owner | 403 INSUFFICIENT_PERMISSIONS |
| Cannot Remove Owner | 400 INVALID_OPERATION |

---

### Business Rules

* Only OWNER can remove members.
* OWNER cannot remove themselves.
* OWNER cannot be removed through this endpoint.
* Member is immediately removed from workspace.
* Audit log is created.
* Redis cache is invalidated.
* Socket.IO notification is broadcast.

---

### Database Changes

Deletes

```text
WorkspaceMember
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:members:{workspaceId}

workspace:list:{memberId}
```

---

### Socket Events

Emits

```
MEMBER_REMOVED
```

Payload

```json
{
    "workspaceId":"...",
    "memberId":"..."
}
```

#######################################################################
# Workspace Member APIs

## GET /api/v1/workspaces/:workspaceId/members

### Purpose

Retrieve all members of a workspace with pagination.

Only workspace members can access the member list.

---

### Authentication

Access Token

---

### Query Parameters

| Parameter | Required | Default |
|-----------|----------|----------|
| page | No | 1 |
| limit | No | 10 |

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "data": {
        "members": [
            {
                "id": "user_uuid",
                "username": "hardik2208",
                "firstName": "Hardik",
                "lastName": "Raghuvanshi",
                "avatarUrl": null,
                "role": "OWNER",
                "joinedAt": "2026-07-05T17:00:00.000Z"
            },
            {
                "id": "user_uuid",
                "username": "workspaceuser1",
                "firstName": "Workspace",
                "lastName": "User",
                "avatarUrl": null,
                "role": "MEMBER",
                "joinedAt": "2026-07-05T17:10:00.000Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 2,
            "totalPages": 1,
            "hasNext": false
        }
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| User Not Member | 403 INSUFFICIENT_PERMISSIONS |

---

### Business Rules

* Only workspace members can view the member list.
* Supports pagination.
* Results are ordered by join date.
* Cached using Redis.

---

### Database Operations

Reads

```text
WorkspaceMember

UserProfile
```

---

### Redis

Reads

```
workspace:members:{workspaceId}
```

Writes

```
workspace:members:{workspaceId}
```

---

### Socket Events

None

---

## PATCH /api/v1/workspaces/:workspaceId/members/:memberId

### Purpose

Update the role of a workspace member.

Only the OWNER can change member roles.

---

### Authentication

Access Token

---

### Request

```json
{
    "role": "ADMIN"
}
```

---

### Validation

| Field | Rule |
|--------|------|
| role | Required (ADMIN or MEMBER) |

OWNER role cannot be assigned using this endpoint.

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Member role updated successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Member Not Found | 404 MEMBER_NOT_FOUND |
| Not Workspace Owner | 403 INSUFFICIENT_PERMISSIONS |
| Cannot Modify Owner | 400 INVALID_OPERATION |
| Invalid Role | 400 INVALID_REQUEST |

---

### Business Rules

* Only OWNER can modify roles.
* OWNER role cannot be granted here.
* OWNER role transfer must use Transfer Ownership API.
* Role changes are audited.
* Member cache is invalidated.
* Socket.IO notification is broadcast.

---

### Database Changes

Updates

```text
WorkspaceMember.role
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:members:{workspaceId}
```

---

### Socket Events

Emits

```
MEMBER_ROLE_UPDATED
```

Payload

```json
{
    "workspaceId":"...",
    "memberId":"...",
    "role":"ADMIN"
}
```

---

## DELETE /api/v1/workspaces/:workspaceId/members/:memberId

### Purpose

Remove a member from a workspace.

Only the OWNER can remove members.

---

### Authentication

Access Token

---

### Request

None

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Member removed successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Member Not Found | 404 MEMBER_NOT_FOUND |
| Not Workspace Owner | 403 INSUFFICIENT_PERMISSIONS |
| Cannot Remove Owner | 400 INVALID_OPERATION |

---

### Business Rules

* Only OWNER can remove members.
* OWNER cannot remove themselves.
* OWNER cannot be removed through this endpoint.
* Member is immediately removed from workspace.
* Audit log is created.
* Redis cache is invalidated.
* Socket.IO notification is broadcast.

---

### Database Changes

Deletes

```text
WorkspaceMember
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:members:{workspaceId}

workspace:list:{memberId}
```

---

### Socket Events

Emits

```
MEMBER_REMOVED
```

Payload

```json
{
    "workspaceId":"...",
    "memberId":"..."
}
```

#######################################################################
# Workspace Invitation APIs

## POST /api/v1/workspaces/:workspaceId/invitations

### Purpose

Invite an existing user to join a workspace.

Only the workspace OWNER can invite users.

---

### Authentication

Access Token

---

### Request

```json
{
    "identifier": "workspaceuser1"
}
```

`identifier` may be either:

- Username
- Email

---

### Validation

| Field | Rule |
|--------|------|
| identifier | Required |

---

### Success

**HTTP**

```text
201 Created
```

```json
{
    "success": true,
    "message": "Invitation created successfully.",
    "data": {
        "id": "invitation_uuid",
        "invitedUserId": "user_uuid",
        "invitedBy": {
            "id": "owner_uuid",
            "username": "hardik2208",
            "firstName": "Hardik",
            "lastName": "Raghuvanshi",
            "avatarUrl": null
        },
        "status": "PENDING",
        "expiresAt": "2026-07-12T18:00:00.000Z",
        "createdAt": "2026-07-05T18:00:00.000Z"
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| User Not Found | 404 USER_NOT_FOUND |
| Already Member | 409 MEMBER_ALREADY_EXISTS |
| Pending Invitation Exists | 409 INVITATION_ALREADY_EXISTS |
| Personal Workspace | 403 PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED |
| Not Owner | 403 INSUFFICIENT_PERMISSIONS |

---

### Business Rules

* Only OWNER can invite users.
* Invitations cannot be created for personal workspaces.
* User must already exist.
* Duplicate pending invitations are prevented.
* Existing members cannot be invited again.
* Invitation expires automatically after configured expiry period.
* Audit entry is created.
* Invitation cache is invalidated.
* Socket notification sent to invited user.

---

### Database Changes

Creates

```text
WorkspaceInvitation
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:invitations:{workspaceId}
```

---

### Socket Events

Emits

```
INVITATION_CREATED
```

Payload

```json
{
    "workspaceId":"...",
    "invitationId":"...",
    "invitedUserId":"..."
}
```

---

## GET /api/v1/workspaces/:workspaceId/invitations

### Purpose

Retrieve all pending workspace invitations.

Only workspace OWNER can view invitations.

---

### Authentication

Access Token

---

### Query Parameters

| Parameter | Required | Default |
|-----------|----------|----------|
| page | No | 1 |
| limit | No | 10 |

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "data": {
        "invitations": [
            {
                "id": "invitation_uuid",
                "invitedUserId": "user_uuid",
                "invitedBy": {
                    "id": "owner_uuid",
                    "username": "hardik2208",
                    "firstName": "Hardik",
                    "lastName": "Raghuvanshi",
                    "avatarUrl": null
                },
                "status": "PENDING",
                "expiresAt": "2026-07-12T18:00:00.000Z",
                "createdAt": "2026-07-05T18:00:00.000Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 1,
            "totalPages": 1,
            "hasNext": false
        }
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Not Owner | 403 INSUFFICIENT_PERMISSIONS |

---

### Business Rules

* Only OWNER can view invitations.
* Supports pagination.
* Returns pending invitations.
* Cached using Redis.

---

### Database Operations

Reads

```text
WorkspaceInvitation

UserProfile
```

---

### Redis

Reads

```
workspace:invitations:{workspaceId}
```

Writes

```
workspace:invitations:{workspaceId}
```

---

### Socket Events

None

---

## DELETE /api/v1/workspaces/:workspaceId/invitations/:invitationId

### Purpose

Cancel a pending invitation.

Only OWNER can cancel invitations.

---

### Authentication

Access Token

---

### Request

None

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Invitation cancelled successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Invitation Not Found | 404 INVITATION_NOT_FOUND |
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| Not Owner | 403 INSUFFICIENT_PERMISSIONS |
| Invitation Already Accepted | 400 INVALID_OPERATION |

---

### Business Rules

* Only pending invitations may be cancelled.
* Invitation record is removed.
* Audit log is created.
* Redis cache invalidated.
* Socket notification emitted.

---

### Database Changes

Deletes

```text
WorkspaceInvitation
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:invitations:{workspaceId}
```

---

### Socket Events

Emits

```
INVITATION_CANCELLED
```

Payload

```json
{
    "workspaceId":"...",
    "invitationId":"..."
}
```

---

## POST /api/v1/workspaces/invitations/:invitationId/accept

### Purpose

Accept a workspace invitation.

Authenticated user joins the workspace.

---

### Authentication

Access Token

---

### Request

None

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Invitation accepted successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Invitation Not Found | 404 INVITATION_NOT_FOUND |
| Invitation Expired | 400 INVITATION_EXPIRED |
| Invitation Already Processed | 400 INVALID_OPERATION |
| Unauthorized Invitation | 403 INSUFFICIENT_PERMISSIONS |

---

### Business Rules

* Only invited user may accept.
* User becomes workspace MEMBER.
* Invitation status updated.
* Workspace membership created.
* Audit entry created.
* Member cache invalidated.
* Invitation cache invalidated.
* User automatically joins workspace Socket.IO room.

---

### Database Changes

Updates

```text
WorkspaceInvitation.status
```

Creates

```text
WorkspaceMember
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:list:{userId}

workspace:members:{workspaceId}

workspace:invitations:{workspaceId}
```

---

### Socket Events

Emits

```
MEMBER_JOINED
```

Payload

```json
{
    "workspaceId":"...",
    "userId":"..."
}
```

---

## POST /api/v1/workspaces/invitations/:invitationId/decline

### Purpose

Decline a workspace invitation.

---

### Authentication

Access Token

---

### Request

None

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Invitation declined successfully."
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Invitation Not Found | 404 INVITATION_NOT_FOUND |
| Invitation Already Processed | 400 INVALID_OPERATION |
| Unauthorized Invitation | 403 INSUFFICIENT_PERMISSIONS |

---

### Business Rules

* Only invited user may decline.
* Invitation status updated to DECLINED.
* Workspace membership is not created.
* Audit entry created.
* Invitation cache invalidated.

---

### Database Changes

Updates

```text
WorkspaceInvitation.status
```

Creates

```text
WorkspaceAudit
```

---

### Redis

Invalidates

```
workspace:invitations:{workspaceId}
```

---

### Socket Events

Emits

```
INVITATION_DECLINED
```

Payload

```json
{
    "workspaceId":"...",
    "invitationId":"..."
}
```

#######################################################################

#######################################################################
# Workspace Audit Module

## Overview

The Workspace Audit module provides an immutable history of every important action performed inside a workspace.

It exists to provide accountability, traceability, debugging support, and future activity feed generation.

Every significant workspace operation automatically generates an audit record inside the same database transaction.

This guarantees that no successful operation can occur without being recorded.

---

# Responsibilities

The module records activities related to

- Workspace creation
- Workspace updates
- Ownership transfer
- Member invitations
- Invitation acceptance
- Invitation rejection
- Invitation cancellation
- Member joins
- Member removal
- Member role updates
- User leaving workspace

Future modules such as Projects, Tasks, Sprints, Documents and Comments will also write to the Workspace Audit system.

---

# Design Goals

The audit system is designed to provide

- Complete activity history
- Immutable records
- Actor tracking
- Entity tracking
- Metadata storage
- Timeline generation
- Debugging support
- Compliance support

Audit entries are append-only.

Existing audit records are never updated or deleted.

---

# Database Table

```text
workspace_audits
```

Stores

- Actor
- Workspace
- Action
- Entity
- Metadata
- Timestamp

---

# Audit Record Structure

Each audit entry contains

| Field | Description |
|---------|-------------|
| id | Audit record identifier |
| workspaceId | Workspace where activity occurred |
| actorId | User performing the action |
| action | Audit action enum |
| entityId | Target entity |
| metadata | Additional contextual information |
| createdAt | Event timestamp |

---

# Audit Flow

Every workspace operation follows

```
Validate Request

↓

Permission Check

↓

Execute Database Changes

↓

Insert Audit Record

↓

Commit Transaction

↓

Invalidate Redis

↓

Emit Socket Event
```

Audit creation always occurs inside the database transaction.

If transaction rollback occurs, the audit record is also rolled back.

---

# Audit Actions

Current supported actions include

```
WORKSPACE_CREATED

WORKSPACE_UPDATED

WORKSPACE_DELETED

MEMBER_INVITED

INVITATION_ACCEPTED

INVITATION_DECLINED

INVITATION_CANCELLED

MEMBER_JOINED

MEMBER_LEFT

MEMBER_REMOVED

MEMBER_ROLE_UPDATED

OWNERSHIP_TRANSFERRED
```

Future actions can be added without modifying the audit architecture.

---

# Metadata

Each audit record stores operation-specific metadata.

Example

Workspace Created

```json
{
    "workspaceType": "TEAM"
}
```

Member Role Updated

```json
{
    "previousRole": "MEMBER",
    "newRole": "ADMIN"
}
```

Ownership Transfer

```json
{
    "previousOwnerId": "...",
    "newOwnerId": "..."
}
```

Invitation Created

```json
{
    "invitedUserId": "...",
    "expiresAt": "..."
}
```

Metadata is stored as JSON for flexibility.

---

# Why JSON Metadata?

Instead of creating dozens of nullable columns,

the audit system stores contextual information inside a JSON column.

Advantages

- Flexible
- Extensible
- Schema independent
- Backward compatible
- Supports future modules

---

# Repository

The WorkspaceAuditRepository is responsible for

- Creating audit records
- Reading activity history
- Pagination
- Filtering

Repositories contain no business logic.

---

# Service Integration

The WorkspaceService never directly writes to the database.

Instead,

```
WorkspaceService

↓

WorkspaceAuditRepository.create()

↓

workspace_audits
```

This keeps audit creation centralized.

---

# Transaction Safety

Audit creation always occurs inside

```
Prisma Transaction
```

Example

```
Update Workspace

↓

Update Members

↓

Insert Audit

↓

Commit
```

If any operation fails,

the audit entry is also rolled back.

This guarantees consistency.

---

# Future Activity Feed

The audit table is designed to become the source of

```
Workspace Activity Feed
```

Future APIs can simply query

```
workspace_audits
```

to generate

```
Today

Yesterday

Last Week

Older
```

activity timelines.

No additional database design will be required.

---

# Performance

Audit writes are lightweight

- Single insert
- Indexed by workspaceId
- Indexed by createdAt
- Immutable data
- No update queries

Reading activity history supports pagination to efficiently handle large workspaces.

---

# Engineering Decisions

The Workspace Audit module follows

- Immutable Event Logging
- Append-only Storage
- Transactional Consistency
- JSON Metadata
- Repository Pattern
- Separation of Concerns
- Future Event Feed Compatibility
- Scalable Timeline Design


#######################################################################
# Workspace Audit APIs

## GET /api/v1/workspaces/:workspaceId/audit

### Purpose

Retrieve the complete audit history for a workspace.

The endpoint returns a paginated chronological timeline of all significant workspace activities including workspace management, member management, invitations, ownership changes, and other audited events.

Only workspace members can access the audit history.

---

### Authentication

Access Token

---

### Query Parameters

| Parameter | Required | Default | Description |
|-----------|----------|----------|-------------|
| page | No | 1 | Page number |
| limit | No | 20 | Number of records per page |

---

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "data": {
        "logs": [
            {
                "id": "audit_uuid",
                "action": "WORKSPACE_CREATED",
                "actor": {
                    "id": "user_uuid",
                    "username": "hardik2208",
                    "firstName": "Hardik",
                    "lastName": "Raghuvanshi",
                    "avatarUrl": null
                },
                "entityId": "workspace_uuid",
                "metadata": {
                    "workspaceType": "TEAM"
                },
                "createdAt": "2026-07-05T18:00:00.000Z"
            },
            {
                "id": "audit_uuid",
                "action": "MEMBER_INVITED",
                "actor": {
                    "id": "user_uuid",
                    "username": "hardik2208",
                    "firstName": "Hardik",
                    "lastName": "Raghuvanshi",
                    "avatarUrl": null
                },
                "entityId": "user_uuid",
                "metadata": {
                    "invitedUserId": "user_uuid"
                },
                "createdAt": "2026-07-05T18:15:00.000Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 37,
            "totalPages": 2,
            "hasNext": true
        }
    }
}
```

---

### Errors

| Scenario | Response |
|----------|----------|
| Workspace Not Found | 404 WORKSPACE_NOT_FOUND |
| User Not Member | 403 INSUFFICIENT_PERMISSIONS |
| Invalid Pagination | 400 VALIDATION_ERROR |

---

### Business Rules

* Only workspace members can access audit history.
* Personal and Team workspaces both maintain audit logs.
* Results are ordered by newest activity first.
* Supports pagination.
* Audit records are immutable.
* Historical records cannot be modified or deleted.
* Metadata returned depends on the audit action.

---

### Audit Actions Returned

Possible actions include

```text
WORKSPACE_CREATED

WORKSPACE_UPDATED

WORKSPACE_DELETED

MEMBER_INVITED

INVITATION_ACCEPTED

INVITATION_DECLINED

INVITATION_CANCELLED

MEMBER_JOINED

MEMBER_LEFT

MEMBER_REMOVED

MEMBER_ROLE_UPDATED

OWNERSHIP_TRANSFERRED
```

---

### Metadata Examples

Workspace Created

```json
{
    "workspaceType": "TEAM"
}
```

Member Role Updated

```json
{
    "previousRole": "MEMBER",
    "newRole": "ADMIN"
}
```

Ownership Transferred

```json
{
    "previousOwnerId": "old_owner_uuid",
    "newOwnerId": "new_owner_uuid"
}
```

Invitation Created

```json
{
    "invitedUserId": "user_uuid",
    "expiresAt": "2026-07-12T18:00:00.000Z"
}
```

---

### Database Operations

Reads

```text
WorkspaceAudit

UserProfile
```

No database modifications occur.

---

### Redis

Current implementation

```text
No Redis caching.
```

Audit logs are fetched directly from the database to ensure the latest activity is always returned.

---

### Socket.IO

None

Audit history is read-only and does not emit real-time events.

---

### Performance

* Results are paginated.
* Ordered by `createdAt DESC`.
* Indexed by `workspaceId`.
* Indexed by `createdAt`.
* Optimized for timeline rendering.

---

### Engineering Notes

The audit endpoint serves as the primary source for:

* Workspace activity timeline
* Future notification center
* Administrative investigations
* Debugging workspace events
* Compliance and accountability tracking

All audit records are created transactionally alongside the corresponding workspace operation, ensuring that every successful state change has a matching immutable audit record.