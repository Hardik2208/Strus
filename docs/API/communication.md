# Phase 1 — Module Overview

# Communication Module

## Purpose

The Communication Module provides the centralized messaging infrastructure for collaborative project execution within Strus.

It enables real-time communication between workspace members and project participants through automatically managed conversations, while maintaining message history, read status, attachments, auditability, and scalable message retrieval.

Unlike traditional chat platforms, the Communication Module is tightly integrated with the Strus domain model. Conversations are automatically created from existing business entities rather than manually by users.

The module serves as the collaboration layer that connects workspaces and projects throughout their lifecycle.

---

# Objectives

- Enable real-time collaboration between project participants.
- Provide a dedicated conversation for every workspace and project.
- Maintain complete message history.
- Support secure file attachments.
- Track message read status.
- Ensure scalable message retrieval using cursor-based pagination.
- Improve read performance using Redis caching.
- Synchronize communication through Socket.IO.
- Support millions of messages without architectural redesign.

---

# Responsibilities

The Communication Module is responsible for:

- Workspace conversations
- Project conversations
- Conversation participant management
- Message creation
- Message updates
- Message deletion
- Reply messages
- File attachments
- Read receipts
- Read state tracking
- Cursor-based pagination
- Redis cache management
- Socket.IO synchronization

---

# Out of Scope

The following responsibilities intentionally belong to other modules.

## Workspace Module

Responsible for:

- Workspace creation
- Workspace membership
- Workspace invitations
- Workspace roles
- Workspace lifecycle

---

## Project Module

Responsible for:

- Project creation
- Project lifecycle
- Project ownership
- Project participants

---

## Agreement Module

Responsible for:

- Commercial agreements
- Professional invitations
- Contractual information
- Agreement participants

---

## Execution Module

Responsible for:

- Milestones
- Execution planning
- Project assets
- Deliverables
- Requirements

---

## Payment Module

Responsible for:

- Escrow
- Milestone payments
- Refunds
- Payouts

---

## Dispute Module

Responsible for:

- Dispute conversations
- Evidence
- Arbitration
- Resolution workflow

---

# Module Position

```text
Workspace
      │
      ▼
Workspace Conversation
      │
      ▼
Workspace Messages

──────────────────────────────────

Project
      │
      ▼
Project Conversation
      │
      ▼
Project Messages
      │
      ├──────────────┐
      │              │
      ▼              ▼
Attachments    Read Receipts
```

The Communication Module operates independently of business workflows while remaining tightly integrated with Workspace and Project ownership.

---

# Communication Lifecycle

```text
Workspace Created
        │
        ▼
Workspace Conversation Created
        │
        ▼
Members Join Workspace
        │
        ▼
Conversation Membership Updated
        │
        ▼
Messages Exchanged
        │
        ▼
Attachments Shared
        │
        ▼
Read Status Updated
```

---

```text
Project Created
        │
        ▼
Project Conversation Created
        │
        ▼
Participants Assigned
        │
        ▼
Conversation Membership Updated
        │
        ▼
Project Communication
        │
        ▼
Project Completed
```

---

# High-Level Architecture

```text
Workspace / Project
         │
         ▼
Conversation
         │
         ├────────────────────────────┐
         │                            │
         ▼                            ▼
Participants                     Messages
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                        ▼                           ▼
                 Attachments                  Read Receipts
```

---

# Core Components

## Conversation

A Conversation represents the communication channel associated with either a Workspace or a Project.

Conversations are system-managed entities.

Users cannot manually create, rename, or delete conversations.

Every conversation belongs to exactly one parent resource.

Conversation stores:

- Conversation type
- Parent workspace or project
- Creation metadata
- Message sequencing

---

## Conversation Participant

Represents every user who belongs to a conversation.

Membership is automatically synchronized from the owning resource.

Workspace conversations inherit Workspace members.

Project conversations inherit Project participants.

Participants maintain:

- Last read sequence
- Last read timestamp
- Join information

---

## Messages

Messages represent the primary communication unit.

Each message belongs to exactly one conversation and one sender.

Messages support:

- Plain text content
- Replies
- Attachments
- Edit history
- Soft deletion
- Read tracking

Every message receives a monotonically increasing sequence number within its conversation to support efficient pagination and read-state computation.

---

## Message Attachments

Attachments represent files shared within conversations.

Files are uploaded to Cloudinary while only metadata is stored in PostgreSQL.

Supported attachment types include:

- Images
- Documents
- PDFs
- Archives
- Other approved file formats

Attachment metadata includes:

- Original filename
- MIME type
- File size
- Cloudinary URL
- Public ID

---

## Read Receipts

Read receipts record how far each participant has read within a conversation.

Instead of storing read information for every message individually, each participant stores the highest message sequence they have read.

Read receipts provide:

- Reader identity
- Read timestamp
- Efficient unread count calculation
- Minimal storage overhead

---

# Conversation Model

The Communication Module supports exactly two conversation types.

## Workspace Conversation

Every Workspace owns exactly one Workspace Conversation.

```text
Workspace

1

↓

Workspace Conversation
```

All workspace members automatically participate.

---

## Project Conversation

Every Project owns exactly one Project Conversation.

```text
Project

1

↓

Project Conversation
```

Only project participants may access project conversations.

---

# Message Lifecycle

```text
Message Created
        │
        ▼
Message Delivered
        │
        ▼
Message Read
        │
        ▼
Message Edited
        │
        ▼
Message Deleted
```

Deleted messages remain historically preserved through soft deletion while respecting application visibility rules.

---

# Attachment Lifecycle

```text
File Selected
      │
      ▼
Validation
      │
      ▼
Cloudinary Upload
      │
      ▼
Attachment Metadata Stored
      │
      ▼
Message Created
      │
      ▼
Message Retrieved
```

If the database transaction fails after upload, uploaded files are automatically removed from Cloudinary to prevent orphaned resources.

---

# Permission Model

## Workspace Conversations

Workspace members may:

- View messages
- Send messages
- Reply
- Edit their own messages
- Delete their own messages
- Mark conversations as read

Workspace administrators and owners may additionally moderate messages according to workspace policies.

---

## Project Conversations

Project participants may:

- View messages
- Send messages
- Reply
- Edit their own messages
- Delete their own messages
- Mark conversations as read

Conversation membership is inherited directly from the project.

---

# Redis Integration

Redis is used to optimize frequently accessed communication resources.

Cached resources include:

- Conversation details
- Message pages
- Read states

Cache entries are automatically invalidated whenever communication data changes.

Redis is never treated as the source of truth.

---

# Socket.IO Integration

The Communication Module synchronizes conversations in real time using Socket.IO.

Events include:

- Message created
- Message updated
- Message deleted
- Conversation read

Events are emitted only after successful database transactions.

---

# Design Principles

The Communication Module follows the following principles:

- Every Workspace owns exactly one conversation.
- Every Project owns exactly one conversation.
- Conversation membership is automatically synchronized.
- Messages are immutable except for controlled edits.
- Message history is preserved through soft deletion.
- Read tracking is sequence-based rather than message-based.
- Cursor pagination supports large conversations efficiently.
- Controllers remain thin.
- Business rules remain inside the service layer.
- Repository layer owns persistence.
- Redis follows the Cache-Aside pattern.
- Socket.IO provides real-time synchronization.
- PostgreSQL remains the source of truth.

---

# Current Scope

The current implementation includes:

- Workspace conversations
- Project conversations
- Automatic participant synchronization
- Message creation
- Message retrieval
- Cursor-based pagination
- Reply messages
- Message editing
- Message deletion
- File attachments
- Read receipts
- Conversation read tracking
- Redis caching
- Socket.IO synchronization
- Cloudinary integration
- Permission enforcement

Future phases may extend the Communication Module with additional collaboration capabilities while preserving the existing architecture.


####################################################################################################################


# Phase 2 — System Architecture

# Communication System Architecture

The Communication Module is responsible for orchestrating all real-time and persistent communication within Strus.

It provides a structured messaging layer built around conversations, participants, messages, attachments, read receipts, caching, and real-time synchronization while remaining independent from project planning, agreements, execution, and payments.

The module follows a layered architecture that separates business logic, persistence, validation, caching, file storage, and event broadcasting.

---

# Architecture Overview

```text
               Workspace / Project
                       │
                       ▼
          Communication Controller
                       │
                       ▼
         Communication Service Layer
                       │
      ┌────────────────┼──────────────────┐
      │                │                  │
      ▼                ▼                  ▼
 Permission      Business Rules      Validation
                       │
                       ▼
              Repository Layer
      ┌────────────────┼────────────────────┐
      │                │                    │
      ▼                ▼                    ▼
 PostgreSQL       Redis Cache         Cloudinary
                       │
                       ▼
                 Socket.IO Events
                       │
                       ▼
                Connected Clients
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

The Service Layer is the heart of the Communication Module.

Responsible for:

- Conversation retrieval
- Message creation
- Message updates
- Message deletion
- Reply handling
- Read state management
- Attachment coordination
- Permission validation
- Transaction management
- Cache invalidation
- Socket event emission

Every business rule is implemented here.

---

## Repository Layer

Repositories provide access to PostgreSQL.

Responsible for:

- CRUD operations
- Relationship loading
- Cursor pagination
- Soft deletion
- Read receipt queries
- Conversation membership
- Database transactions

Repositories never contain business logic.

---

## Validation Layer

Responsible for validating:

- Message content
- Attachments
- Conversation access
- Cursor pagination
- Read sequence updates
- UUID parameters
- File uploads

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
Socket Event
    │
    ▼
Response
```

---

# Conversation Retrieval Flow

```text
Client
    │
    ▼
Validate User
    │
    ▼
Validate Membership
    │
    ▼
Redis Lookup
    │
 ┌──┴──┐
 │     │
Hit   Miss
 │     │
 ▼     ▼
Return Database
Cache     │
          ▼
     Store Cache
          │
          ▼
      Response
```

Conversation membership is validated before any data is returned.

---

# Message Creation Flow

```text
Client
    │
Multipart Request
    │
    ▼
Validate Message
    │
    ▼
Validate Conversation
    │
    ▼
Validate Membership
    │
    ▼
Validate Attachments
    │
    ▼
Upload Files
to Cloudinary
    │
    ▼
Begin Database Transaction
    │
    ▼
Generate Message Sequence
    │
    ▼
Create Message
    │
    ▼
Create Attachments
    │
    ▼
Commit Transaction
    │
    ▼
Invalidate Cache
    │
    ▼
Emit Socket Event
    │
    ▼
Response
```

If the transaction fails after successful uploads, Cloudinary resources are automatically removed.

---

# Message Retrieval Flow

```text
Client
    │
    ▼
Permission Check
    │
    ▼
Redis Lookup
    │
 ┌──┴──┐
 │     │
Hit   Miss
 │     │
 ▼     ▼
Return Database
Cache     │
          ▼
Cursor Pagination
          │
          ▼
Store Cache
          │
          ▼
Response
```

Messages are retrieved using cursor-based pagination.

Offset pagination is intentionally not used.

---

# Message Update Flow

```text
Client
    │
    ▼
Permission Check
    │
    ▼
Load Message
    │
    ▼
Validate Ownership
    │
    ▼
Update Message
    │
    ▼
Mark As Edited
    │
    ▼
Commit Transaction
    │
    ▼
Invalidate Cache
    │
    ▼
Emit Socket Event
    │
    ▼
Response
```

Only editable messages may be modified.

---

# Message Deletion Flow

```text
Client
    │
    ▼
Permission Check
    │
    ▼
Load Message
    │
    ▼
Validate Ownership
    │
    ▼
Soft Delete Message
    │
    ▼
Commit Transaction
    │
    ▼
Invalidate Cache
    │
    ▼
Emit Socket Event
    │
    ▼
Response
```

Messages are soft deleted to preserve conversation history.

---

# Conversation Read Flow

```text
Client
    │
    ▼
Validate Membership
    │
    ▼
Load Participant
    │
    ▼
Update Last Read Sequence
    │
    ▼
Update Last Read Timestamp
    │
    ▼
Commit Transaction
    │
    ▼
Invalidate Cache
    │
    ▼
Emit Read Event
    │
    ▼
Response
```

Read status is tracked at the conversation level.

---

# Read Receipt Retrieval Flow

```text
Client
    │
    ▼
Permission Check
    │
    ▼
Load Message
    │
    ▼
Load Conversation Participants
    │
    ▼
Filter Participants
(lastReadSequence ≥ messageSequence)
    │
    ▼
Build Read Receipt Response
    │
    ▼
Response
```

Read receipts are calculated dynamically using stored participant read states.

---

# Attachment Upload Flow

```text
Client
    │
Multipart Request
    │
    ▼
Validate Files
    │
    ▼
Upload To Cloudinary
    │
    ▼
Store Metadata
    │
    ▼
Create Message Attachment
    │
    ▼
Commit Transaction
    │
    ▼
Invalidate Cache
    │
    ▼
Response
```

Only attachment metadata is stored inside PostgreSQL.

---

# Permission Flow

```text
Authenticated User
        │
        ▼
Conversation Permission Service
        │
        ▼
Workspace Validation
        │
        ▼
Project Validation
        │
        ▼
Conversation Membership
        │
        ▼
Requested Operation
```

Permission validation occurs before any business logic.

---

# Database Transactions

Mutating operations execute inside Prisma transactions.

Examples include:

- Send message
- Edit message
- Delete message
- Upload attachments
- Update read state

This guarantees atomic execution.

---

# Redis Cache Strategy

The Communication Module follows the Cache-Aside pattern.

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

Redis is never treated as the source of truth.

---

# Cloudinary Integration

Conversation attachments are stored outside PostgreSQL.

```text
Client
      │
      ▼
Cloudinary
      │
      ▼
Attachment Metadata
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

Binary files are never stored in PostgreSQL.

---

# Socket.IO Architecture

Every successful communication mutation emits a Socket.IO event.

Examples include:

- Message created
- Message updated
- Message deleted
- Conversation read

Events are emitted only after successful database commits.

Clients subscribed to the corresponding conversation room receive updates immediately.

---

# Error Handling

Communication services throw standardized application errors.

Validation failures terminate request processing immediately.

Transactions automatically roll back on failure.

Cloudinary uploads are cleaned up whenever a database transaction fails after successful uploads.

---

# Design Principles

The Communication Module follows the following architectural principles.

## Thin Controllers

Controllers only coordinate requests and responses.

---

## Rich Services

Business rules are centralized inside the service layer.

---

## Repository Isolation

Repositories communicate only with PostgreSQL.

---

## Cache-Aside Pattern

Redis serves only as a read cache.

---

## Atomic Transactions

Every mutating operation is fully transactional.

---

## Sequence-Based Read Tracking

Conversation read state is maintained using message sequence numbers instead of per-message read records.

---

## External File Storage

Attachments are stored in Cloudinary.

Only metadata is persisted inside PostgreSQL.

---

## Permission-First Design

Every operation validates authorization before executing business logic.

---

## Real-Time Synchronization

Socket.IO complements database persistence by synchronizing successful changes across connected clients.

---

# Current Scope

The current architecture supports:

- Workspace conversations
- Project conversations
- Automatic participant synchronization
- Message creation
- Message retrieval
- Cursor pagination
- Message editing
- Message deletion
- Replies
- Read receipts
- Conversation read tracking
- Attachment uploads
- Redis caching
- Cloudinary integration
- Socket.IO synchronization
- Transaction management
- Permission enforcement

Future phases may extend the Communication Module with additional collaboration capabilities while preserving the existing architecture.


####################################################################################################################

# Phase 3 — Business Rules

# Communication Business Rules

The Communication Module defines how conversations, participants, messages, attachments, and read states behave throughout the lifetime of a workspace or project.

Every rule is deterministic and enforced inside the service layer.

The Communication Module is responsible only for communication and collaboration.

It does not manage project ownership, workspace membership, agreements, execution planning, payments, or disputes.

---

# Conversation Rules

## Rule 1

Every Workspace owns exactly one Workspace Conversation.

The conversation is created automatically when the workspace is created.

Users cannot manually create additional workspace conversations.

---

## Rule 2

Every Project owns exactly one Project Conversation.

The conversation is automatically created during project creation.

Users cannot manually create project conversations.

---

## Rule 3

A conversation always belongs to exactly one parent resource.

A conversation may belong to either:

- Workspace

or

- Project

A conversation can never belong to both simultaneously.

---

## Rule 4

Conversation ownership cannot be transferred.

Changing the owner of a workspace or project does not create a new conversation.

The existing conversation remains associated with the parent resource.

---

## Rule 5

Conversations cannot be manually deleted.

Conversation lifecycle is managed automatically by the owning Workspace or Project.

---

# Conversation Participant Rules

## Rule 1

Conversation participants are synchronized automatically.

Workspace conversations inherit workspace membership.

Project conversations inherit project participants.

---

## Rule 2

Users cannot manually join conversations.

Membership is always inherited from the parent resource.

---

## Rule 3

Users cannot manually leave conversations.

Leaving a conversation occurs only when the user is removed from the associated Workspace or Project.

---

## Rule 4

Each participant stores only one read state per conversation.

Read state consists of:

- lastReadSequence
- lastReadAt

---

## Rule 5

Every participant may exist only once within a conversation.

Duplicate participant records are prohibited.

---

# Message Rules

## Rule 1

Every message belongs to exactly one conversation.

Messages cannot exist independently.

---

## Rule 2

Every message belongs to exactly one sender.

Anonymous messages are not permitted.

---

## Rule 3

Every message receives a unique sequence number within its conversation.

Sequence numbers are strictly increasing.

Example

```text
Conversation

Message 1

Sequence = 1

↓

Message 2

Sequence = 2

↓

Message 3

Sequence = 3
```

Sequence numbers are never reused.

---

## Rule 4

Message ordering is determined exclusively by sequence number.

Timestamp ordering is not used.

---

## Rule 5

Message content may be empty only when attachments exist.

A message containing neither content nor attachments is rejected.

---

## Rule 6

Replies always reference another message within the same conversation.

Replying across conversations is prohibited.

---

## Rule 7

Reply targets must exist.

Replies to deleted or nonexistent messages are rejected.

---

## Rule 8

Messages are soft deleted.

Soft deletion preserves:

- Message sequence
- Conversation ordering
- Historical integrity

Deleted messages remain unavailable for editing.

---

## Rule 9

Deleted messages preserve reply chains.

Existing replies continue referencing the deleted message.

---

## Rule 10

Editing a message updates:

- Content
- editedAt

The original sender never changes.

---

## Rule 11

Only editable messages may be updated.

Deleted messages cannot be edited.

---

# Attachment Rules

## Rule 1

Attachments belong to exactly one message.

---

## Rule 2

Only supported MIME types are accepted.

Unsupported files are rejected before upload.

---

## Rule 3

Maximum attachment size is enforced.

Oversized uploads are rejected.

---

## Rule 4

Maximum attachment count per message is enforced.

Additional files beyond the configured limit are rejected.

---

## Rule 5

All uploaded files are stored in Cloudinary.

Only metadata is persisted inside PostgreSQL.

---

## Rule 6

If database persistence fails after successful uploads, uploaded Cloudinary files are automatically deleted.

No orphaned files remain.

---

## Rule 7

Deleting a message does not immediately remove attachment metadata.

Historical consistency is preserved.

---

# Read Receipt Rules

## Rule 1

Read tracking is conversation-based.

The system stores only the highest sequence read by each participant.

---

## Rule 2

Read receipts are calculated dynamically.

Individual read records are not stored for every message.

---

## Rule 3

Marking a conversation as read updates:

- lastReadSequence
- lastReadAt

---

## Rule 4

A participant cannot decrease their read sequence.

Only forward progression is allowed.

---

## Rule 5

A message is considered read when

```text
participant.lastReadSequence

>=

message.sequence
```

---

## Rule 6

Unread message count is calculated using message sequence numbers.

The system never scans every message individually.

---

# Pagination Rules

## Rule 1

Conversation messages use cursor-based pagination.

Offset pagination is not supported.

---

## Rule 2

Messages are returned in descending sequence order.

Newest messages appear first.

---

## Rule 3

The cursor always references the last message returned.

---

## Rule 4

Pagination remains stable regardless of concurrent message creation.

---

# Permission Rules

## Workspace Conversations

Workspace members may

- View messages
- Send messages
- Reply
- Edit their own messages
- Delete their own messages
- Mark conversation as read

Workspace owners and administrators may additionally moderate messages according to workspace policy.

---

## Project Conversations

Project participants may

- View messages
- Send messages
- Reply
- Edit their own messages
- Delete their own messages
- Mark conversation as read

Conversation access is inherited directly from project participation.

---

## Ownership Rules

Users may edit only their own messages.

Users may delete only their own messages unless elevated moderation privileges exist.

---

# Validation Rules

Communication validation verifies:

- Conversation exists
- Conversation membership
- Valid UUIDs
- Message ownership
- Reply target
- Message content
- Attachment limits
- Supported MIME types
- Cursor validity
- Read sequence progression

Invalid requests are rejected before business logic executes.

---

# Cache Rules

Redis cache is invalidated whenever:

- Conversation changes
- Message created
- Message updated
- Message deleted
- Attachment added
- Read state updated

Subsequent reads rebuild Redis using the Cache-Aside pattern.

---

# Socket Rules

Every successful communication mutation emits a Socket.IO event.

Examples include:

- Message created
- Message updated
- Message deleted
- Conversation read

Events are emitted only after successful database commits.

Failed transactions never emit socket events.

---

# Transaction Rules

The following operations execute inside database transactions.

- Send message
- Upload attachments
- Edit message
- Delete message
- Update read state

Every transaction is atomic.

Partial execution is never committed.

---

# Security Rules

The Communication Module enforces:

- Authentication
- Workspace membership validation
- Project participant validation
- Conversation authorization
- Message ownership validation
- Server-side attachment validation
- Cloudinary cleanup
- Soft deletion
- Immutable message sequencing

---

# Current Scope

The current implementation includes:

- Automatic conversation creation
- Automatic participant synchronization
- Message creation
- Replies
- Message editing
- Message deletion
- Cursor pagination
- Attachment uploads
- Read receipts
- Conversation read tracking
- Permission enforcement
- Redis caching
- Cloudinary integration
- Socket.IO synchronization
- Transactional execution

Future phases may introduce additional collaboration capabilities while preserving the existing conversation architecture.

####################################################################################################################

# Phase 4 — Database Design

# Communication Database Design

The Communication Module stores all conversation-related data required for collaboration within workspaces and projects.

The database is designed to support large-scale messaging by separating conversations, participants, messages, attachments, and read states into independent entities.

This normalization minimizes duplication while allowing efficient querying, pagination, caching, and future feature expansion.

---

# Entity Relationship Diagram

```text
Workspace
     │
     ▼
Conversation
     │
     ├───────────────────────────────┐
     │                               │
     ▼                               ▼
ConversationParticipant          Message
                                      │
                                      ├──────────────┐
                                      │              │
                                      ▼              ▼
                             MessageAttachment   Reply Message
```

Project conversations follow the same structure.

```text
Project
    │
    ▼
Conversation
```

---

# Conversation

Represents the communication channel associated with a Workspace or Project.

Exactly one conversation exists for every Workspace and every Project.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Conversation identifier |
| type | Workspace or Project |
| workspaceId | Parent workspace (nullable) |
| projectId | Parent project (nullable) |
| nextMessageSequence | Next available message sequence |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

---

## Constraints

- Conversation belongs to exactly one parent resource.
- Workspace conversations have a unique workspaceId.
- Project conversations have a unique projectId.
- Conversation type determines the owning resource.
- nextMessageSequence is monotonically increasing.

---

## Relationships

```text
Conversation
      │
      ├──── Workspace
      │
      ├──── Project
      │
      ├──── Participants
      │
      └──── Messages
```

---

# Conversation Participant

Represents a user's membership within a conversation.

Participants are automatically synchronized from Workspace or Project membership.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Participant identifier |
| conversationId | Parent conversation |
| userId | Participant |
| lastReadSequence | Highest sequence read |
| lastReadAt | Read timestamp |
| joinedAt | Joined conversation |
| createdAt | Creation timestamp |
| updatedAt | Last update |

---

## Constraints

- One participant record per user per conversation.
- Membership is automatically managed.
- lastReadSequence cannot decrease.
- Participant must belong to the owning Workspace or Project.

---

## Relationships

```text
ConversationParticipant

      │

      ├──── Conversation

      └──── User
```

---

# Message

Represents an individual communication item.

Every message belongs to one conversation.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Message identifier |
| conversationId | Parent conversation |
| senderId | Message sender |
| replyToId | Parent reply message |
| sequence | Conversation sequence |
| content | Message body |
| editedAt | Last edit timestamp |
| deletedAt | Soft delete timestamp |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

---

## Constraints

- Every message belongs to one conversation.
- Every message belongs to one sender.
- Sequence is unique per conversation.
- Reply message must belong to the same conversation.
- Deleted messages cannot be edited.

---

## Relationships

```text
Conversation

      │

      ▼

Message

      │

      ├──── Sender

      ├──── Reply Message

      └──── Attachments
```

---

# Message Attachment

Stores attachment metadata.

Binary files are stored in Cloudinary.

---

## Fields

| Field | Description |
|--------|-------------|
| id | Attachment identifier |
| messageId | Parent message |
| publicId | Cloudinary identifier |
| url | File URL |
| originalName | Original filename |
| mimeType | MIME type |
| extension | File extension |
| size | File size |
| uploadedAt | Upload timestamp |

---

## Constraints

- Attachment belongs to one message.
- Cloudinary Public ID is unique.
- Only metadata is stored in PostgreSQL.

---

## Relationships

```text
Message

    │

    ▼

MessageAttachment
```

---

# Reply Relationship

Replies are represented using a self-referencing relationship.

```text
Message

    │

    ├───────────────┐

    ▼               ▼

Reply          Reply

                    ▼

                 Reply
```

Replies never span conversations.

---

# Read Tracking

Read state is maintained by ConversationParticipant.

No separate ReadReceipt table exists.

```text
ConversationParticipant

lastReadSequence

lastReadAt
```

Read receipts are calculated dynamically.

---

# Foreign Key Relationships

Conversation → Workspace

```text
Conversation.workspaceId

        │

        ▼

Workspace.id
```

---

Conversation → Project

```text
Conversation.projectId

        │

        ▼

Project.id
```

---

ConversationParticipant → Conversation

```text
ConversationParticipant.conversationId

                │

                ▼

Conversation.id
```

---

ConversationParticipant → User

```text
ConversationParticipant.userId

            │

            ▼

User.id
```

---

Message → Conversation

```text
Message.conversationId

        │

        ▼

Conversation.id
```

---

Message → User

```text
Message.senderId

        │

        ▼

User.id
```

---

Message → Message

```text
Message.replyToId

        │

        ▼

Message.id
```

---

MessageAttachment → Message

```text
MessageAttachment.messageId

              │

              ▼

Message.id
```

---

# Cascade Behaviour

## Workspace Deleted

```text
Workspace

     │

     ▼

Conversation Deleted

     │

     ├───────────────┐

     ▼               ▼

Participants     Messages

                     │

                     ▼

               Attachments
```

---

## Project Deleted

```text
Project

    │

    ▼

Conversation Deleted

    │

    ▼

Messages Deleted
```

---

## User Deleted

Users are never physically deleted.

Soft deletion preserves:

- Messages
- Conversation membership
- Read history

Historical conversations remain intact.

---

# Database Indexes

## Conversation

```text
PRIMARY KEY(id)

UNIQUE(workspaceId)

UNIQUE(projectId)

INDEX(type)
```

---

## Conversation Participant

```text
PRIMARY KEY(id)

UNIQUE(conversationId,userId)

INDEX(userId)

INDEX(lastReadSequence)
```

---

## Message

```text
PRIMARY KEY(id)

INDEX(conversationId)

UNIQUE(conversationId,sequence)

INDEX(senderId)

INDEX(replyToId)

INDEX(createdAt)
```

---

## Message Attachment

```text
PRIMARY KEY(id)

INDEX(messageId)

UNIQUE(publicId)
```

---

# Query Patterns

Frequently executed queries include

## Conversation

- Find Workspace Conversation
- Find Project Conversation
- Load Conversation Participants

---

## Messages

- Send Message
- List Messages
- Cursor Pagination
- Get Message
- Reply Lookup

---

## Attachments

- Message Attachments
- Attachment Metadata
- Cloudinary Cleanup

---

## Read Receipts

- Conversation Read State
- Read Receipt Calculation
- Unread Count

---

# Redis Cache Keys

```text
communication:conversation:{conversationId}
```

```text
communication:messages:{conversationId}:{cursor}:{limit}
```

```text
communication:read:{conversationId}
```

---

# Cache Invalidation

Message Created

```text
Conversation Cache

Messages Cache

Read Cache
```

---

Message Updated

```text
Messages Cache
```

---

Message Deleted

```text
Messages Cache

Conversation Cache
```

---

Read Updated

```text
Read Cache

Conversation Cache
```

---

Attachment Uploaded

```text
Messages Cache
```

---

# Data Integrity Rules

The database guarantees:

- One Workspace Conversation per Workspace.
- One Project Conversation per Project.
- One participant record per user per conversation.
- Unique message sequence numbers.
- Reply messages remain within the same conversation.
- Read state progresses only forward.
- Message ordering is deterministic.
- Soft deletion preserves history.
- Attachment metadata remains synchronized with Cloudinary.
- PostgreSQL remains the source of truth.
```

####################################################################################################################

# Phase 5 — API Documentation

# Communication API Documentation

The Communication Module exposes APIs responsible for conversation retrieval, message management, attachment handling, read tracking, and read receipt retrieval.

All endpoints require authenticated users.

Conversation membership is validated before every operation.

---

# Authentication

Every endpoint requires a valid JWT access token.

```http
Authorization: Bearer <access_token>
```

---

# Base URL

```text
/api/v1/communication
```

---

# Conversation APIs

---

# Get Workspace Conversation

Returns the communication channel belonging to a workspace.

---

## Endpoint

```http
GET /workspaces/:workspaceId/conversation
```

---

## Permissions

Workspace members only.

---

## Success Response

```json
{
    "success": true,
    "data": {
        "id": "...",
        "type": "WORKSPACE"
    }
}
```

---

## Business Rules

- Workspace must exist.
- User must belong to the workspace.
- Conversation is created automatically.
- Conversation cannot be manually created.

---

## Cache

Reads

```text
communication:conversation:{conversationId}
```

---

# Get Project Conversation

Returns the communication channel belonging to a project.

---

## Endpoint

```http
GET /projects/:projectId/conversation
```

---

## Permissions

Project participants only.

---

## Success Response

```json
{
    "success": true,
    "data": {
        "id": "...",
        "type": "PROJECT"
    }
}
```

---

## Business Rules

- Project must exist.
- User must belong to the project.
- Conversation is created automatically.

---

## Cache

Reads

```text
communication:conversation:{conversationId}
```

---

# Message APIs

---

# Send Message

Creates a new conversation message.

---

## Endpoint

```http
POST /conversations/:conversationId/messages
```

---

## Permissions

Conversation participants only.

---

## Request

Multipart Form Data

```text
content

replyToId (optional)

attachments[]
```

---

## Success Response

```json
{
    "success": true,
    "message": "Message sent successfully.",
    "data": {}
}
```

---

## Business Rules

- Conversation must exist.
- User must belong to the conversation.
- Message must contain content or attachments.
- Reply target must belong to the same conversation.
- Attachments upload to Cloudinary.
- Message sequence generated automatically.
- Entire operation executes inside one transaction.

---

## Cache

Invalidates

```text
communication:messages:{conversationId}:*
communication:conversation:{conversationId}
communication:read:{conversationId}
```

---

## Socket Event

```text
message:created
```

---

# Get Conversation Messages

Returns paginated conversation messages.

---

## Endpoint

```http
GET /conversations/:conversationId/messages
```

---

## Permissions

Conversation participants only.

---

## Query Parameters

| Parameter | Description |
|-----------|-------------|
| cursor | Pagination cursor |
| limit | Page size |

---

## Example

```http
GET /conversations/:conversationId/messages?cursor=125&limit=25
```

---

## Success Response

```json
{
    "success": true,
    "data": {
        "messages": [],
        "nextCursor": 101,
        "hasMore": true
    }
}
```

---

## Business Rules

- Cursor pagination only.
- Messages ordered by descending sequence.
- Membership validated.

---

## Cache

Reads

```text
communication:messages:{conversationId}:{cursor}:{limit}
```

---

# Get Message

Returns a single message.

---

## Endpoint

```http
GET /messages/:messageId
```

---

## Permissions

Conversation participants only.

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

- Message must exist.
- User must belong to the conversation.

---

# Update Message

Updates an existing message.

---

## Endpoint

```http
PATCH /messages/:messageId
```

---

## Permissions

Message owner only.

---

## Request

```json
{
    "content": "Updated message."
}
```

---

## Success Response

```json
{
    "success": true,
    "message": "Message updated successfully."
}
```

---

## Business Rules

- Message must exist.
- Sender must own the message.
- Deleted messages cannot be edited.
- editedAt updated automatically.

---

## Cache

Invalidates

```text
communication:messages:{conversationId}:*
```

---

## Socket Event

```text
message:updated
```

---

# Delete Message

Soft deletes a message.

---

## Endpoint

```http
DELETE /messages/:messageId
```

---

## Permissions

Message owner.

Workspace or Project moderators may additionally delete messages according to moderation rules.

---

## Success Response

```json
{
    "success": true,
    "message": "Message deleted successfully."
}
```

---

## Business Rules

- Soft delete only.
- Message ordering preserved.
- Replies remain intact.

---

## Cache

Invalidates

```text
communication:messages:{conversationId}:*
communication:conversation:{conversationId}
```

---

## Socket Event

```text
message:deleted
```

---

# Read APIs

---

# Mark Conversation As Read

Updates the participant's read state.

---

## Endpoint

```http
PATCH /conversations/:conversationId/read
```

---

## Permissions

Conversation participants only.

---

## Request

```json
{
    "lastReadSequence": 125
}
```

---

## Success Response

```json
{
    "success": true,
    "message": "Conversation marked as read successfully."
}
```

---

## Business Rules

- Sequence cannot decrease.
- Participant must belong to conversation.
- lastReadAt updated automatically.

---

## Cache

Invalidates

```text
communication:read:{conversationId}
communication:conversation:{conversationId}
```

---

## Socket Event

```text
conversation:read
```

---

# Get Read Receipts

Returns every participant who has read a message.

---

## Endpoint

```http
GET /messages/:messageId/read-receipts
```

---

## Permissions

Conversation participants only.

---

## Success Response

```json
{
    "success": true,
    "data": [
        {
            "id": "...",
            "firstName": "John",
            "lastName": "Doe",
            "username": "johndoe",
            "avatarUrl": "...",
            "readAt": "2026-07-25T12:30:00Z"
        }
    ]
}
```

---

## Business Rules

- Read receipts calculated dynamically.
- Only participants with

```text
lastReadSequence >= message.sequence
```

are returned.

---

# Attachment Handling

Attachments are uploaded together with message creation.

No separate upload endpoint exists.

---

## Supported Files

Examples

- Images
- PDF
- DOCX
- ZIP
- Other approved MIME types

---

## Business Rules

- Uploaded to Cloudinary.
- Metadata stored in PostgreSQL.
- Invalid uploads rejected before persistence.
- Failed transactions automatically clean Cloudinary uploads.

---

# Common Error Responses

| HTTP | Code | Description |
|------|------|-------------|
|400|INVALID_MESSAGE|Invalid message|
|400|INVALID_ATTACHMENT|Unsupported attachment|
|400|INVALID_CURSOR|Invalid pagination cursor|
|400|INVALID_READ_SEQUENCE|Read sequence invalid|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT_PERMISSIONS|Conversation access denied|
|404|CONVERSATION_NOT_FOUND|Conversation not found|
|404|MESSAGE_NOT_FOUND|Message not found|
|409|MESSAGE_ALREADY_DELETED|Message already deleted|
|422|INVALID_REPLY_TARGET|Reply target invalid|

---

# Transaction Summary

| API | Transaction |
|------|-------------|
|Send Message|✅|
|Update Message|✅|
|Delete Message|✅|
|Mark Conversation Read|✅|

---

# Cache Summary

| API | Cache Action |
|------|--------------|
|Get Workspace Conversation|Read|
|Get Project Conversation|Read|
|Get Messages|Read|
|Send Message|Invalidate|
|Update Message|Invalidate|
|Delete Message|Invalidate|
|Mark Conversation Read|Invalidate|
|Get Read Receipts|Read|

---

# Security Summary

The Communication API enforces:

- JWT authentication
- Workspace membership validation
- Project participant validation
- Conversation authorization
- Message ownership validation
- Server-side attachment validation
- Cursor-based pagination
- Transactional persistence
- Cloudinary cleanup
- Redis cache consistency

---

# Current API Coverage

The current Communication Module exposes APIs for:

- Workspace conversation retrieval
- Project conversation retrieval
- Message creation
- Message retrieval
- Cursor pagination
- Message updates
- Message deletion
- Reply messages
- Attachment uploads
- Conversation read tracking
- Read receipt retrieval
- Permission validation
- Redis caching
- Socket.IO synchronization

####################################################################################################################

# Phase 6 — Authorization & Permission Matrix

# Communication Permission Model

The Communication Module follows a role-based authorization model inherited from the Workspace and Project modules.

Every request is authenticated before permission validation begins.

Permission checks are enforced inside the service layer before any business logic or database operation.

Communication never maintains its own independent permission system.

Conversation access is always inherited from the owning Workspace or Project.

---

# System Roles

The Communication Module recognizes permissions inherited from the parent resource.

Workspace Conversations

```text
Workspace Owner

Workspace Admin

Workspace Member
```

Project Conversations

```text
Client

Professional
```

Authorization always begins with validating access to the parent resource.

---

# Workspace Conversation Permissions

Workspace conversations are collaborative discussions shared by every workspace member.

---

## Workspace Owner

Workspace Owners have complete communication privileges.

Capabilities include:

- View conversation
- View messages
- Send messages
- Reply to messages
- Edit own messages
- Delete own messages
- Delete administrator messages
- View read receipts
- Mark conversation as read

---

## Workspace Admin

Workspace Administrators may actively participate in communication.

Capabilities include:

- View conversation
- View messages
- Send messages
- Reply
- Edit own messages
- Delete own messages
- View read receipts
- Mark conversation as read

Workspace administrators cannot delete messages belonging to the Workspace Owner.

---

## Workspace Member

Workspace Members participate normally.

Capabilities include:

- View conversation
- View messages
- Send messages
- Reply
- Edit own messages
- Delete own messages
- View read receipts
- Mark conversation as read

Members cannot moderate messages belonging to other users.

---

# Project Conversation Permissions

Project conversations are limited to project participants.

---

## Client

The Client owns the project conversation.

Capabilities include:

- View conversation
- View messages
- Send messages
- Reply
- Edit own messages
- Delete own messages
- Delete professional messages
- View read receipts
- Mark conversation as read

---

## Professional

Professionals collaborate during project execution.

Capabilities include:

- View conversation
- View messages
- Send messages
- Reply
- Edit own messages
- Delete own messages
- View read receipts
- Mark conversation as read

Professionals cannot delete messages belonging to the Client.

---

# Authentication Flow

```text
Incoming Request
        │
        ▼
Authenticate User
        │
        ▼
Validate JWT
        │
        ▼
Validate Session
        │
        ▼
Load Conversation
        │
        ▼
Validate Membership
        │
        ▼
Execute Business Logic
```

Authentication occurs before authorization.

---

# Conversation Access Rules

A user may access a conversation only if:

Workspace Conversation

- User belongs to the workspace.

Project Conversation

- User participates in the project.

Otherwise

```text
403 Forbidden
```

is returned.

---

# Message Creation Permissions

Allowed

Workspace Conversation

- Owner
- Admin
- Member

Project Conversation

- Client
- Professional

Denied

- Non-members
- Removed participants

---

# Message Editing Permissions

Only the original sender may edit a message.

Requirements

- Message exists.
- Message is not deleted.
- User is the original sender.
- User still belongs to the conversation.

Otherwise

```text
403 Forbidden
```

---

# Message Deletion Permissions

Users may always delete their own messages.

Additional moderation rules apply.

---

## Workspace Conversation

Workspace Owner

May delete

- Own messages
- Administrator messages
- Member messages

Workspace Admin

May delete

- Own messages
- Member messages

Cannot delete

- Workspace Owner messages

Workspace Member

May delete

- Own messages only

---

## Project Conversation

Client

May delete

- Own messages
- Professional messages

Professional

May delete

- Own messages only

Cannot delete

- Client messages

---

# Reply Permissions

Replying follows the same permission model as sending messages.

Requirements

- Conversation access.
- Reply target exists.
- Reply target belongs to the same conversation.

Cross-conversation replies are rejected.

---

# Attachment Permissions

Only conversation participants may upload attachments.

Attachments are uploaded only during message creation.

Users cannot attach files to existing messages.

---

# Read Permissions

Conversation participants may:

- Mark conversation as read.
- View read receipts.

Read status cannot be updated for conversations the user does not belong to.

---

# Read Receipt Permissions

Read receipts are visible only to conversation participants.

Non-members cannot determine who has viewed conversation messages.

---

# Conversation Visibility

Workspace Conversations

Visible only to workspace members.

---

Project Conversations

Visible only to project participants.

Conversation identifiers alone never grant access.

Membership validation always occurs.

---

# Soft Deleted Messages

Deleted messages remain part of conversation history.

Only authorized conversation members may view deleted message placeholders.

Deleted message content cannot be restored through public APIs.

---

# Permission Matrix

| Operation | Workspace Owner | Workspace Admin | Workspace Member | Client | Professional |
|------------|-----------------|-----------------|------------------|--------|--------------|
| View Conversation | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Messages | ✅ | ✅ | ✅ | ✅ | ✅ |
| Send Message | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reply | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Message | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete Own Message | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete Other Messages | ✅* | ✅* | ❌ | ✅* | ❌ |
| Upload Attachments | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Read Receipts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark Conversation Read | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Subject to moderation rules defined above.

---

# Permission Validation Order

Every protected operation follows the same validation sequence.

```text
Authentication
        │
        ▼
JWT Validation
        │
        ▼
Session Validation
        │
        ▼
Conversation Lookup
        │
        ▼
Membership Validation
        │
        ▼
Ownership Validation
        │
        ▼
Business Rule Validation
        │
        ▼
Database Operation
```

Authorization always occurs before database mutations.

---

# Security Guarantees

The Communication Module guarantees that:

- Every request is authenticated.
- Every operation is authorized.
- Conversation membership is validated before data access.
- Users cannot access conversations outside their Workspace or Project.
- Only message owners may edit messages.
- Moderation privileges are inherited from the parent resource.
- Read receipts remain private to conversation participants.
- Authorization is enforced before every database mutation.
- Permission checks remain centralized inside the service layer.
- PostgreSQL remains the source of truth while Redis acts only as a performance optimization layer.

####################################################################################################################

# Phase 7 — Redis Caching Strategy

# Communication Caching Architecture

The Communication Module is designed to support high-throughput, low-latency messaging while minimizing unnecessary database queries.

Although PostgreSQL remains the single source of truth, Redis is used as a distributed cache to reduce read latency, improve scalability, and decrease database load.

The module follows the **Cache-Aside Pattern**, ensuring cached data is always derived from PostgreSQL and never becomes the authoritative data source.

---

# Caching Objectives

The Redis layer is responsible for:

- Reducing database reads
- Improving message retrieval latency
- Accelerating conversation loading
- Caching paginated message history
- Caching conversation metadata
- Reducing repetitive permission lookups
- Supporting horizontal application scaling
- Maintaining cache consistency through automatic invalidation

Redis is **never** used for permanent storage.

---

# High-Level Cache Architecture

```text
                Client
                   │
                   ▼
          Communication Service
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
      Redis Cache     PostgreSQL
          │                 │
          └────────┬────────┘
                   ▼
                Response
```

---

# Cache-Aside Pattern

The Communication Module implements the Cache-Aside Pattern.

### Read Flow

```text
Client
    │
    ▼
Redis Lookup
    │
 ┌──┴──┐
 │     │
Hit   Miss
 │     │
 ▼     ▼
Return PostgreSQL
Data      │
          ▼
      Store in Redis
          │
          ▼
      Return Response
```

---

### Write Flow

```text
Client
    │
    ▼
Database Transaction
    │
    ▼
Commit Successful
    │
    ▼
Invalidate Redis
    │
    ▼
Next Read Reloads Cache
```

Redis is updated **only through cache invalidation**, never by directly modifying cached values.

---

# Cached Resources

The Communication Module caches only frequently accessed, relatively stable data.

The following resources are cached:

- Conversation metadata
- Paginated message lists
- Read state information

Highly dynamic operations such as message creation always write directly to PostgreSQL.

---

# Conversation Cache

Conversation metadata changes infrequently.

Caching conversation information prevents repeated database lookups.

---

## Cache Key

```text
communication:conversation:{conversationId}
```

---

## Cached Data

Conversation cache may contain:

- Conversation ID
- Conversation type
- Workspace ID
- Project ID
- Participant count
- Latest message sequence
- Created timestamp

---

## Read Flow

```text
Conversation Request

        │

        ▼

Redis Lookup

        │

   Cache Hit?

     │     │

    Yes    No

     │     │

     ▼     ▼

 Response PostgreSQL

              │

              ▼

       Store in Redis

              │

              ▼

          Response
```

---

# Message Cache

Messages are the most frequently accessed communication resource.

Only paginated message pages are cached.

Entire conversations are never cached.

---

## Cache Key

```text
communication:messages:{conversationId}:{cursor}:{limit}
```

Example

```text
communication:messages:abc123:250:25
```

This represents

Conversation

↓

Messages before sequence 250

↓

25 messages

---

## Cached Data

Each page contains

- Messages
- Sender information
- Reply metadata
- Attachment metadata
- Pagination cursor
- hasMore indicator

---

## Pagination Strategy

Each cursor page is cached independently.

```text
Conversation

        │

        ▼

Cursor 500

        │

        ▼

Cursor 475

        │

        ▼

Cursor 450
```

This prevents rebuilding large message histories.

---

# Read State Cache

Read state changes frequently but is also queried frequently.

Caching minimizes repeated participant lookups.

---

## Cache Key

```text
communication:read:{conversationId}
```

---

## Cached Data

Read cache contains

- Participant IDs
- Last read sequence
- Last read timestamp

Read receipts are still calculated dynamically.

---

# Cache Expiration

Redis entries use a configurable Time-To-Live (TTL).

Typical cache lifetimes:

| Resource | Suggested TTL |
|----------|---------------|
| Conversation | 30 minutes |
| Messages | 10 minutes |
| Read State | 5 minutes |

TTL values balance freshness with database load.

---

# Cache Population

Caches are populated lazily.

No cache entry is created during write operations.

Instead:

```text
First Request

        │

        ▼

Database

        │

        ▼

Redis

        │

        ▼

Response
```

Future requests are served directly from Redis.

---

# Cache Invalidation

Cache invalidation occurs immediately after a successful database transaction.

No cache is invalidated before transaction commit.

---

## Message Created

Invalidates

```text
communication:messages:{conversationId}:*

communication:conversation:{conversationId}

communication:read:{conversationId}
```

Reason

- New pagination
- Updated latest message
- Updated unread counts

---

## Message Updated

Invalidates

```text
communication:messages:{conversationId}:*
```

Reason

Updated content affects cached pages.

---

## Message Deleted

Invalidates

```text
communication:messages:{conversationId}:*

communication:conversation:{conversationId}
```

Reason

Deleted placeholders appear inside message history.

---

## Read State Updated

Invalidates

```text
communication:read:{conversationId}

communication:conversation:{conversationId}
```

Reason

Unread counts and read indicators change.

---

## Attachment Uploaded

Invalidates

```text
communication:messages:{conversationId}:*
```

Reason

Attachment metadata changes message payload.

---

# Cache Failure Handling

Redis is treated as an optimization layer.

If Redis becomes unavailable:

```text
Redis Failure

      │

      ▼

Fallback

      │

      ▼

PostgreSQL

      │

      ▼

Response
```

Communication functionality continues without interruption.

No request fails solely because Redis is unavailable.

---

# Consistency Model

The Communication Module follows an **eventually consistent cache**.

Consistency rules:

- PostgreSQL is always correct.
- Redis may temporarily contain stale data.
- Cache invalidation occurs immediately after commits.
- Stale entries expire automatically through TTL.

---

# Horizontal Scaling

Redis enables multiple application servers to share the same cache.

```text
           Load Balancer

          /      |      \

Server A  Server B  Server C

      \      |      /

          Redis Cluster

               │

               ▼

          PostgreSQL
```

All application instances observe the same cached state.

---

# Cache Design Principles

The Communication Module follows these caching principles:

- PostgreSQL is the source of truth.
- Redis stores only derived data.
- Cache entries are rebuilt on demand.
- Writes never depend on Redis.
- Cache invalidation occurs only after successful commits.
- Cached pages are independent.
- Entire conversations are never cached.
- TTL prevents indefinitely stale data.
- Redis failures never impact correctness.

---

# Performance Benefits

The caching strategy provides:

- Faster conversation loading
- Reduced database read load
- Lower message retrieval latency
- Improved scalability
- Better horizontal scaling support
- Efficient cursor-based pagination
- Lower infrastructure cost under high traffic
- Consistent performance for large conversations

---

# Current Cache Coverage

The Communication Module currently caches:

- Workspace conversations
- Project conversations
- Paginated message history
- Conversation metadata
- Read state information

Future versions may introduce additional cached resources while maintaining the Cache-Aside architecture and PostgreSQL as the single source of truth.

####################################################################################################################

# Phase 8 — Real-Time Communication (Socket.IO Architecture)

# Real-Time Communication

The Communication Module provides real-time message synchronization using Socket.IO.

While PostgreSQL remains the source of truth for all communication data, Socket.IO ensures that connected clients receive updates immediately after successful database transactions.

The real-time layer is responsible only for delivering events.

It never performs business logic or persists application data.

---

# Architecture Overview

```text
                Client A
                   │
                   │
             Socket.IO Client
                   │
                   ▼
            Socket.IO Gateway
                   │
                   ▼
        Communication Service Layer
                   │
                   ▼
             PostgreSQL Commit
                   │
                   ▼
            Redis Cache Invalidation
                   │
                   ▼
             Socket Event Emit
                   │
      ┌────────────┴────────────┐
      ▼                         ▼
Client B                   Client C
```

---

# Design Principles

The Socket.IO layer follows these principles:

- PostgreSQL is always the source of truth.
- Socket events are emitted only after successful transactions.
- Failed database operations never produce events.
- Clients always receive committed data.
- Socket.IO is responsible for synchronization, not persistence.

---

# Connection Lifecycle

```text
Client Connects
        │
        ▼
JWT Authentication
        │
        ▼
User Validation
        │
        ▼
Join Conversation Rooms
        │
        ▼
Receive Events
        │
        ▼
Disconnect
```

---

# Authentication

Every socket connection must provide a valid JWT.

Connections with invalid or expired tokens are rejected.

Before joining any room the server validates:

- User identity
- Active session
- Workspace membership
- Project participation

---

# Room Structure

Clients subscribe only to conversations they belong to.

Workspace conversations

```text
workspace:{workspaceId}
```

Example

```text
workspace:3f2e6b9c
```

---

Project conversations

```text
project:{projectId}
```

Example

```text
project:92ab4c51
```

A user may belong to multiple rooms simultaneously.

---

# Event Flow

Every communication mutation follows the same sequence.

```text
HTTP Request
      │
      ▼
Business Validation
      │
      ▼
Database Transaction
      │
      ▼
Commit Successful
      │
      ▼
Redis Cache Invalidation
      │
      ▼
Socket Event
      │
      ▼
Connected Clients
```

---

# Server Events

The Communication Module emits the following events.

---

## message:created

Emitted after a new message is successfully persisted.

Payload includes:

- Conversation ID
- Message ID
- Sender
- Sequence
- Content
- Attachments
- Created timestamp

---

## message:updated

Emitted after a message is edited.

Payload includes:

- Message ID
- Updated content
- Edited timestamp

---

## message:deleted

Emitted after a message is soft deleted.

Payload includes:

- Message ID
- Deleted timestamp

Clients replace the original content with the deleted message placeholder.

---

## conversation:read

Emitted after a participant updates their read state.

Payload includes:

- Conversation ID
- User ID
- Last read sequence
- Read timestamp

Clients update unread indicators without reloading the conversation.

---

# Room Broadcasting

Messages are broadcast only to the relevant conversation room.

```text
Message Created

        │

        ▼

Conversation Room

        │

 ┌──────┼──────┐

 ▼      ▼      ▼

User A User B User C
```

Users outside the room never receive the event.

---

# Delivery Guarantees

The Communication Module provides:

- Ordered event emission after commit.
- No events for failed transactions.
- Database-first consistency.
- Room-scoped broadcasts.

If a client is temporarily disconnected, missed events can be recovered by fetching conversation history through the REST API.

---

# Error Handling

Socket errors do not affect database consistency.

Examples include:

- Failed event delivery
- Network interruptions
- Client disconnects
- Temporary connectivity loss

All communication data remains safely stored in PostgreSQL.

---

# Security

The Socket.IO layer enforces:

- JWT authentication
- Conversation membership validation
- Room isolation
- Server-side authorization
- Event scoping

Clients cannot subscribe to arbitrary conversation rooms.

---

# Performance Considerations

The real-time architecture is designed for high concurrency.

Key characteristics:

- Lightweight event payloads
- Room-based broadcasting
- No duplicate event emission
- Minimal database interaction
- Redis cache invalidation before notification
- Horizontal scalability across multiple application servers

---

# Event Summary

| Event | Trigger | Broadcast To |
|--------|---------|--------------|
| message:created | Message created | Conversation room |
| message:updated | Message edited | Conversation room |
| message:deleted | Message deleted | Conversation room |
| conversation:read | Read state updated | Conversation room |

---

# Current Scope

The current Socket.IO implementation supports:

- Secure client connections
- JWT authentication
- Automatic room subscription
- Real-time message creation
- Real-time message updates
- Real-time message deletion
- Real-time read-state synchronization
- Room-scoped broadcasting
- Transaction-safe event emission

Future versions may introduce additional collaboration events while preserving the existing event-driven architecture.

####################################################################################################################

# Phase 9 — Testing Guide

# Communication Module Testing Guide

This guide describes the procedures for validating the Communication Module.

It covers functional testing, authorization testing, attachment handling, pagination, Redis caching, Socket.IO synchronization, and error scenarios.

The objective is to verify that every communication feature behaves correctly under normal and exceptional conditions.

---

# Prerequisites

Before testing, ensure the following services are running.

- PostgreSQL
- Redis
- Cloudinary
- Socket.IO Server
- Communication Service
- Authentication Service

Verify that the application starts without errors.

---

# Test Environment

Recommended Environment

| Component | Status |
|-----------|--------|
| PostgreSQL | Running |
| Redis | Running |
| Cloudinary | Configured |
| Backend API | Running |
| Socket.IO | Running |
| Postman | Installed |

---

# Test Data

Create the following entities before testing.

## Users

- Workspace Owner
- Workspace Admin
- Workspace Member
- Client
- Professional
- Unauthorized User

---

## Workspace

Create one workspace.

Assign

- Owner
- Admin
- Member

---

## Project

Create one project inside the workspace.

Assign

- Client
- Professional

---

## Conversations

Verify that the system automatically creates:

- Workspace Conversation
- Project Conversation

No manual conversation creation should be required.

---

# Authentication Tests

## Valid JWT

### Expected Result

- Request succeeds.

---

## Missing JWT

### Expected Result

```http
401 Unauthorized
```

---

## Expired JWT

### Expected Result

```http
401 Unauthorized
```

---

## Invalid JWT

### Expected Result

```http
401 Unauthorized
```

---

# Conversation Tests

## Retrieve Workspace Conversation

### Steps

1. Authenticate as workspace member.
2. Request workspace conversation.

### Expected Result

- Conversation returned.
- Correct conversation type.
- Membership validated.

---

## Retrieve Project Conversation

### Steps

1. Authenticate as project participant.
2. Request project conversation.

### Expected Result

- Project conversation returned.

---

## Unauthorized Conversation Access

### Steps

Authenticate as unrelated user.

Attempt to retrieve conversation.

### Expected Result

```http
403 Forbidden
```

---

# Message Tests

## Send Message

### Steps

Send a text message.

### Expected Result

- Message stored.
- Sequence generated.
- Socket event emitted.
- Cache invalidated.

---

## Send Reply

### Steps

Reply to an existing message.

### Expected Result

- Reply created.
- Parent message linked.
- Same conversation enforced.

---

## Empty Message

### Steps

Send

- No content
- No attachment

### Expected Result

```http
400 Bad Request
```

---

## Edit Own Message

### Steps

Edit previously sent message.

### Expected Result

- Content updated.
- editedAt populated.
- Socket event emitted.

---

## Edit Another User's Message

### Expected Result

```http
403 Forbidden
```

---

## Delete Own Message

### Steps

Delete previously sent message.

### Expected Result

- Soft delete.
- Placeholder visible.
- Replies preserved.

---

## Delete Another User's Message

Verify moderation rules.

Expected behavior should follow the permission matrix.

---

# Attachment Tests

## Upload Valid Attachment

### Steps

Upload supported file.

### Expected Result

- File uploaded to Cloudinary.
- Metadata stored.
- Message created.

---

## Unsupported MIME Type

### Expected Result

```http
400 Bad Request
```

---

## Oversized File

### Expected Result

```http
400 Bad Request
```

---

## Upload Failure Rollback

Force database transaction failure.

### Expected Result

- Uploaded Cloudinary files deleted.
- No orphaned resources.
- No database records created.

---

# Pagination Tests

## Initial Page

Retrieve first page.

### Verify

- Correct number of messages.
- Descending sequence order.
- Cursor returned.

---

## Next Page

Retrieve second page using cursor.

### Verify

- No duplicate messages.
- Stable ordering.

---

## Invalid Cursor

### Expected Result

```http
400 Bad Request
```

---

# Read State Tests

## Mark Conversation Read

### Steps

Update read sequence.

### Expected Result

- lastReadSequence updated.
- lastReadAt updated.
- Socket event emitted.

---

## Decreasing Read Sequence

Attempt to submit an older sequence.

### Expected Result

```http
400 Bad Request
```

---

# Read Receipt Tests

## Retrieve Read Receipts

### Verify

- Only participants returned.
- Read timestamp present.
- Correct user information returned.

---

## Unauthorized Read Receipt Access

### Expected Result

```http
403 Forbidden
```

---

# Permission Tests

Verify every permission defined in the Permission Matrix.

Test

- Owner
- Admin
- Member
- Client
- Professional
- Unauthorized User

Confirm access matches the documented authorization rules.

---

# Redis Cache Tests

## Conversation Cache

### Steps

Retrieve conversation twice.

### Expected Result

First request

- PostgreSQL queried.

Second request

- Redis hit.

---

## Message Cache

Retrieve same page twice.

### Expected Result

Second request served from Redis.

---

## Cache Invalidation

Create message.

### Verify

- Cached message pages removed.
- Conversation cache invalidated.
- Read cache invalidated.

---

# Socket.IO Tests

## Message Created

Connect two clients.

Client A sends message.

### Verify

Client B immediately receives

```text
message:created
```

---

## Message Updated

Edit message.

### Verify

All connected participants receive

```text
message:updated
```

---

## Message Deleted

Delete message.

### Verify

Clients receive

```text
message:deleted
```

---

## Read Event

Mark conversation read.

### Verify

Other participants receive

```text
conversation:read
```

---

# Transaction Tests

## Database Failure

Force transaction rollback.

### Verify

- No message persisted.
- No attachment metadata.
- No socket event.
- Redis unchanged.

---

# Performance Tests

## Large Conversation

Populate conversation with thousands of messages.

Verify

- Stable pagination.
- Low response time.
- Correct ordering.

---

## Concurrent Messaging

Simulate multiple users sending messages simultaneously.

Verify

- Unique sequence numbers.
- No duplicate messages.
- Correct ordering.

---

## Large Attachment Upload

Upload maximum allowed attachment size.

Verify

- Successful upload.
- Acceptable response time.
- Metadata persisted correctly.

---

# Error Handling Tests

Validate responses for:

- Invalid UUID
- Missing conversation
- Missing message
- Unauthorized access
- Invalid reply target
- Invalid attachment
- Invalid cursor
- Invalid read sequence

Every error should return the correct HTTP status code and standardized response format.

---

# Acceptance Checklist

The Communication Module is considered production-ready when all of the following pass successfully.

| Test | Status |
|------|--------|
| Authentication | ✅ |
| Workspace Conversation | ✅ |
| Project Conversation | ✅ |
| Message Creation | ✅ |
| Reply Messages | ✅ |
| Message Editing | ✅ |
| Message Deletion | ✅ |
| Cursor Pagination | ✅ |
| Attachment Upload | ✅ |
| Read Tracking | ✅ |
| Read Receipts | ✅ |
| Permission Validation | ✅ |
| Redis Caching | ✅ |
| Socket.IO Events | ✅ |
| Transaction Rollback | ✅ |
| Performance Testing | ✅ |
| Error Handling | ✅ |

---

# Completion Criteria

The Communication Module is considered fully validated when:

- All API endpoints behave according to specification.
- Authorization rules match the documented permission model.
- Conversations are automatically managed by the Workspace and Project modules.
- Message history remains consistent after edits and deletions.
- Cursor pagination is stable under concurrent activity.
- Attachments are uploaded securely and cleaned up on rollback.
- Redis cache remains consistent with PostgreSQL.
- Socket.IO broadcasts only committed changes.
- Database transactions maintain data integrity.
- All functional, security, and performance tests pass successfully.

Successful completion of this guide indicates that the Communication Module is ready for integration with the remaining Strus platform modules and production deployment.

####################################################################################################################
