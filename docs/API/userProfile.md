# User Domain Overview

## Purpose

The User Domain is responsible for managing the permanent identity of every individual using Strus.

It serves as the central source of truth for all user-specific information after authentication has been completed.

The domain separates authentication concerns from profile management, ensuring that credentials, security, and identity remain independent from public user information.

This separation allows the authentication system to evolve independently without affecting user-facing profile data while keeping the overall architecture modular and maintainable.

---

# Responsibilities

The User Domain is responsible for:

- User profile creation
- User profile retrieval
- User profile updates
- Username management
- Username availability checks
- Avatar management
- Public profile identity
- Profile caching
- Profile validation

---

# Out of Scope

The following responsibilities intentionally belong to other domains.

## Authentication Domain

Responsible for:

- User registration
- Login
- Logout
- Refresh tokens
- Password reset
- Email verification
- Sessions
- Devices
- JWT generation
- OAuth

The User Domain never manages credentials or authentication tokens.

---

## Organization Domain

Responsible for:

- Organizations
- Memberships
- Roles
- Invitations

---

## Project Domain

Responsible for:

- Projects
- Tasks
- Milestones
- Deliverables

---

## Verification Domain

Responsible for:

- Identity verification
- KYC
- Government documents
- Business verification

The User Domain only stores the current verification level.

The verification process itself belongs to the Verification Domain.

---

# Domain Goals

The User Domain has been designed around the following goals.

## Separation of Concerns

Authentication data and profile data are stored independently.

This keeps authentication lightweight while allowing profile information to evolve without affecting security.

---

## Fast Reads

User profiles are one of the most frequently accessed resources across the platform.

Examples include:

- Dashboard
- Sidebar
- Chat
- Comments
- Activity feed
- Project members
- Search
- Mentions

Profile retrieval is therefore optimized for low latency using Redis caching.

---

## Strong Consistency

Every profile mutation immediately updates PostgreSQL.

Redis is treated purely as a read cache.

The database always remains the source of truth.

---

## Extensibility

The domain is intentionally designed to support future features without schema redesign.

Examples include:

- Display names
- Profile badges
- Skills
- Languages
- Social links
- Profile visibility
- Preferences
- Notification settings
- Public profile pages

---

## Scalability

The architecture is designed to scale from a small deployment to millions of users.

Key design decisions include:

- UUID primary keys
- Separate profile table
- Indexed usernames
- Redis profile caching
- Independent avatar storage
- Stateless API layer

---

# Domain Architecture

```
                    Authentication Domain
                            │
                Creates authenticated user
                            │
                            ▼
                    User Domain
      ┌──────────────────────────────────────┐
      │                                      │
      │  User Profile                        │
      │  Username                            │
      │  Avatar                              │
      │  Public Identity                     │
      │                                      │
      └──────────────────────────────────────┘
                            │
                            ▼
                 Organization Domain
                            │
                            ▼
                    Project Domain
```

---

# Storage Architecture

The User Domain stores data across three independent systems.

## PostgreSQL

Persistent storage.

Stores:

- Profile information
- Username
- Avatar metadata
- Country
- Timezone

Acts as the source of truth.

---

## Redis

Read cache.

Caches:

- User profile
- Username availability

Used only to accelerate read-heavy operations.

Cache is invalidated after every profile mutation.

---

## Cloudinary

Object storage.

Stores:

- User avatars

Only the following metadata is stored inside PostgreSQL:

- avatarUrl
- avatarPublicId

The actual binary image never enters the database.

---

# Request Flow

## Profile Retrieval

```
Client

    │

    ▼

Redis

    │

Cache Hit
    │
    ▼
Return Profile

Cache Miss
    │
    ▼

PostgreSQL

    │

Store in Redis

    │

Return Response
```

---

## Avatar Upload

```
Client

    │

Multipart Request

    │

Backend

    │

Validation

    │

Cloudinary

    │

Returns URL

    │

PostgreSQL

    │

Redis Invalidation

    │

Response
```

---

# Core Design Principles

## Lowercase Usernames

All usernames are normalized to lowercase before persistence.

Reasons:

- Eliminates duplicate identities caused by casing.
- Simplifies searching.
- Enables efficient indexing.
- Provides deterministic comparisons.

---

## Public Identity

Every user has exactly one permanent public identity consisting of:

- Username
- Avatar
- First name
- Last name

This identity is reused throughout the platform.

---

## Stateless APIs

The User Domain stores no session state.

Every authenticated request relies entirely on JWT authentication provided by the Authentication Domain.

---

## Cache-Aside Pattern

Redis follows a Cache-Aside strategy.

Read flow:

```
Redis

↓

Database

↓

Redis

↓

Client
```

Write flow:

```
Database

↓

Redis Invalidation
```

This guarantees consistency while maintaining high read performance.

---

# Security Considerations

The User Domain enforces:

- Authentication before profile access.
- Username uniqueness.
- Reserved username protection.
- Prohibited username filtering.
- Avatar MIME validation.
- Avatar size validation.
- Server-side Cloudinary uploads.
- UUID-based resource ownership.
- Profile ownership validation.

---

# Future Extensions

The current design intentionally leaves room for additional features including:

- User preferences
- Notification settings
- Public profile pages
- Skills
- Experience
- Portfolio
- Availability status
- Profile visibility
- Profile analytics
- Verification badges
- Social links
- Resume management
- Multiple avatars
- Cover images

These additions can be implemented without modifying the existing architecture.

---

# Current Scope

The current implementation includes:

- Profile creation
- Profile retrieval
- Profile updates
- Username availability
- Username updates
- Avatar upload
- Avatar replacement
- Avatar deletion
- Redis caching
- Cloudinary integration

Verification workflows, user preferences, and advanced profile features are intentionally deferred to future domains.



###############################################################################################################

# Profile Management

## Purpose

The Profile Management component is responsible for managing a user's public identity after authentication.

Authentication only proves who the user is.

The profile defines how the user appears throughout the Strus platform.

Every authenticated user owns exactly one profile.

A profile is mandatory before accessing the rest of the platform.

---

# Responsibilities

Profile Management is responsible for:

- Profile creation
- Profile retrieval
- Profile updates
- Profile completion tracking
- Country information
- Timezone information
- Public identity information
- Redis profile caching

It is **not** responsible for:

- Authentication
- Password management
- Email verification
- Username availability
- Avatar uploads
- Verification workflows

Those belong to their respective domains.

---

# Profile Lifecycle

```
User Registration
        │
        ▼
Email Verification
        │
        ▼
Login
        │
        ▼
Profile Completed?

      No ─────────────► Create Profile
        │
       Yes
        │
        ▼
Platform Access
```

---

# Profile Creation

A profile is created exactly once.

Once created:

- The associated user is marked as `profileCompleted = true`.
- Future creation requests are rejected.
- All subsequent modifications must use the Update Profile API.

---

# Required Fields

The following fields are mandatory during profile creation.

| Field | Required |
|---------|----------|
| Username | Yes |
| First Name | Yes |
| Last Name | Yes |
| Country Code | Yes |
| Timezone | Yes |

---

# Optional Fields

| Field | Required |
|---------|----------|
| Bio | No |
| Avatar | No |

The avatar is uploaded separately using the Avatar Management API.

---

# Profile Completion

A profile is considered complete once the required information has been successfully persisted.

The Authentication Domain updates:

```
profileCompleted = true
```

This flag allows the frontend to redirect newly authenticated users to profile creation only once.

---

# Database Model

```
User
│
│ 1
│
▼
UserProfile
```

One user owns exactly one profile.

The profile is stored in a separate table to isolate authentication data from public identity information.

---

# Profile Fields

| Field | Description |
|--------|-------------|
| id | Profile identifier |
| userId | User reference |
| username | Public identifier |
| firstName | First name |
| lastName | Last name |
| bio | Short biography |
| avatarUrl | Avatar URL |
| avatarPublicId | Cloudinary identifier |
| countryCode | ISO country code |
| timezone | IANA timezone |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

---

# Profile Retrieval

Authenticated users can retrieve their own profile.

The response contains:

- Account information
- Verification level
- Public profile
- Avatar
- Country
- Timezone

Authentication is performed using the JWT access token.

---

# Profile Update

The update endpoint allows modification of:

- First Name
- Last Name
- Bio
- Country Code
- Timezone

The following fields are intentionally immutable.

- Username
- Email
- Verification Level
- Avatar

These are managed by dedicated APIs.

---

# Validation Rules

## First Name

- Required
- Trimmed before storage
- Cannot be empty

---

## Last Name

- Required
- Trimmed before storage
- Cannot be empty

---

## Bio

- Optional
- Trimmed before storage
- May be null

---

## Country Code

Must be a valid ISO-3166 Alpha-2 country code.

Example:

```
IN
US
GB
DE
```

---

## Timezone

Must be a valid IANA timezone.

Example:

```
Asia/Kolkata

Europe/London

America/New_York
```

---

# Redis Caching

User profiles are cached because profile retrieval is one of the highest-frequency operations within the platform.

Examples include:

- Sidebar
- Dashboard
- Chat
- Comments
- Project members
- Activity feed

---

# Cache Strategy

Read:

```
Redis

↓

Database

↓

Redis

↓

Client
```

Write:

```
Database

↓

Invalidate Cache
```

---

# Cache Key

```
user:profile:{userId}
```

Example:

```
user:profile:8cf36bac-fd69-45d6-bd04-05e344dec499
```

---

# Cache TTL

```
30 Minutes
```

The TTL balances performance with data freshness while ensuring stale profile data naturally expires even if explicit invalidation is missed.

---

# Cache Invalidation

The profile cache is invalidated whenever:

- Profile is updated
- Username changes
- Avatar changes
- Avatar is deleted

The next read automatically repopulates the cache using the Cache-Aside strategy.

---

# Error Handling

Possible errors include:

| Error | Description |
|---------|-------------|
| PROFILE_NOT_FOUND | Profile does not exist |
| PROFILE_ALREADY_COMPLETED | Profile already created |
| INVALID_COUNTRY_CODE | Invalid country code |
| INVALID_TIMEZONE | Invalid timezone |
| VALIDATION_ERROR | Invalid request payload |

---

# API Endpoints

## Create Profile

```
POST /api/v1/users/me/profile
```

Creates the user's profile.

---

## Get Profile

```
GET /api/v1/users/me
```

Returns the authenticated user's complete profile.

---

## Update Profile

```
PATCH /api/v1/users/me
```

Updates mutable profile fields.

---

# Design Decisions

## Separate Profile Table

Authentication and profile data are intentionally separated to maintain clear domain boundaries and allow each to evolve independently.

---

## Immutable Username

Usernames are treated as unique public identifiers and therefore managed by a dedicated API with additional validation and caching.

---

## Separate Avatar Management

Avatar uploads require file validation, Cloudinary integration, and cache invalidation. Keeping them separate simplifies profile updates and isolates file-handling logic.

---

## Redis Cache

Profile reads significantly outnumber profile writes. Caching profile data in Redis reduces database load and improves response times across the platform.

---

# Current Scope

Implemented features:

- Profile creation
- Profile retrieval
- Profile updates
- Profile completion tracking
- Country validation
- Timezone validation
- Redis caching
- Cache invalidation

Username management, avatar management, and verification are documented separately.

###############################################################################################################


# Profile Management

## Purpose

The Profile Management component is responsible for managing a user's public identity after authentication.

Authentication only proves who the user is.

The profile defines how the user appears throughout the Strus platform.

Every authenticated user owns exactly one profile.

A profile is mandatory before accessing the rest of the platform.

---

# Responsibilities

Profile Management is responsible for:

- Profile creation
- Profile retrieval
- Profile updates
- Profile completion tracking
- Country information
- Timezone information
- Public identity information
- Redis profile caching

It is **not** responsible for:

- Authentication
- Password management
- Email verification
- Username availability
- Avatar uploads
- Verification workflows

Those belong to their respective domains.

---

# Profile Lifecycle

```
User Registration
        │
        ▼
Email Verification
        │
        ▼
Login
        │
        ▼
Profile Completed?

      No ─────────────► Create Profile
        │
       Yes
        │
        ▼
Platform Access
```

---

# Profile Creation

A profile is created exactly once.

Once created:

- The associated user is marked as `profileCompleted = true`.
- Future creation requests are rejected.
- All subsequent modifications must use the Update Profile API.

---

# Required Fields

The following fields are mandatory during profile creation.

| Field | Required |
|---------|----------|
| Username | Yes |
| First Name | Yes |
| Last Name | Yes |
| Country Code | Yes |
| Timezone | Yes |

---

# Optional Fields

| Field | Required |
|---------|----------|
| Bio | No |
| Avatar | No |

The avatar is uploaded separately using the Avatar Management API.

---

# Profile Completion

A profile is considered complete once the required information has been successfully persisted.

The Authentication Domain updates:

```
profileCompleted = true
```

This flag allows the frontend to redirect newly authenticated users to profile creation only once.

---

# Database Model

```
User
│
│ 1
│
▼
UserProfile
```

One user owns exactly one profile.

The profile is stored in a separate table to isolate authentication data from public identity information.

---

# Profile Fields

| Field | Description |
|--------|-------------|
| id | Profile identifier |
| userId | User reference |
| username | Public identifier |
| firstName | First name |
| lastName | Last name |
| bio | Short biography |
| avatarUrl | Avatar URL |
| avatarPublicId | Cloudinary identifier |
| countryCode | ISO country code |
| timezone | IANA timezone |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

---

# Profile Retrieval

Authenticated users can retrieve their own profile.

The response contains:

- Account information
- Verification level
- Public profile
- Avatar
- Country
- Timezone

Authentication is performed using the JWT access token.

---

# Profile Update

The update endpoint allows modification of:

- First Name
- Last Name
- Bio
- Country Code
- Timezone

The following fields are intentionally immutable.

- Username
- Email
- Verification Level
- Avatar

These are managed by dedicated APIs.

---

# Validation Rules

## First Name

- Required
- Trimmed before storage
- Cannot be empty

---

## Last Name

- Required
- Trimmed before storage
- Cannot be empty

---

## Bio

- Optional
- Trimmed before storage
- May be null

---

## Country Code

Must be a valid ISO-3166 Alpha-2 country code.

Example:

```
IN
US
GB
DE
```

---

## Timezone

Must be a valid IANA timezone.

Example:

```
Asia/Kolkata

Europe/London

America/New_York
```

---

# Redis Caching

User profiles are cached because profile retrieval is one of the highest-frequency operations within the platform.

Examples include:

- Sidebar
- Dashboard
- Chat
- Comments
- Project members
- Activity feed

---

# Cache Strategy

Read:

```
Redis

↓

Database

↓

Redis

↓

Client
```

Write:

```
Database

↓

Invalidate Cache
```

---

# Cache Key

```
user:profile:{userId}
```

Example:

```
user:profile:8cf36bac-fd69-45d6-bd04-05e344dec499
```

---

# Cache TTL

```
30 Minutes
```

The TTL balances performance with data freshness while ensuring stale profile data naturally expires even if explicit invalidation is missed.

---

# Cache Invalidation

The profile cache is invalidated whenever:

- Profile is updated
- Username changes
- Avatar changes
- Avatar is deleted

The next read automatically repopulates the cache using the Cache-Aside strategy.

---

# Error Handling

Possible errors include:

| Error | Description |
|---------|-------------|
| PROFILE_NOT_FOUND | Profile does not exist |
| PROFILE_ALREADY_COMPLETED | Profile already created |
| INVALID_COUNTRY_CODE | Invalid country code |
| INVALID_TIMEZONE | Invalid timezone |
| VALIDATION_ERROR | Invalid request payload |

---

# API Endpoints

## Create Profile

```
POST /api/v1/users/me/profile
```

Creates the user's profile.

---

## Get Profile

```
GET /api/v1/users/me
```

Returns the authenticated user's complete profile.

---

## Update Profile

```
PATCH /api/v1/users/me
```

Updates mutable profile fields.

---

# Design Decisions

## Separate Profile Table

Authentication and profile data are intentionally separated to maintain clear domain boundaries and allow each to evolve independently.

---

## Immutable Username

Usernames are treated as unique public identifiers and therefore managed by a dedicated API with additional validation and caching.

---

## Separate Avatar Management

Avatar uploads require file validation, Cloudinary integration, and cache invalidation. Keeping them separate simplifies profile updates and isolates file-handling logic.

---

## Redis Cache

Profile reads significantly outnumber profile writes. Caching profile data in Redis reduces database load and improves response times across the platform.

---

# Current Scope

Implemented features:

- Profile creation
- Profile retrieval
- Profile updates
- Profile completion tracking
- Country validation
- Timezone validation
- Redis caching
- Cache invalidation

Username management, avatar management, and verification are documented separately.

###############################################################################################################

# Avatar Management

## Purpose

The Avatar Management component is responsible for managing user profile images within Strus.

Unlike other profile fields, avatars are binary assets that require dedicated storage, validation, lifecycle management, and CDN delivery.

The backend owns the complete upload lifecycle while Cloudinary acts as the underlying object storage provider.

---

# Responsibilities

Avatar Management is responsible for:

- Avatar uploads
- Avatar replacement
- Avatar deletion
- Image validation
- Cloudinary integration
- Avatar metadata persistence
- Redis cache invalidation

It is **not** responsible for:

- Profile information
- Username management
- Authentication
- Authorization

---

# Why a Separate Avatar API?

Avatar uploads differ fundamentally from standard profile updates.

Unlike JSON payloads, avatar uploads involve:

- Binary file handling
- Multipart requests
- File validation
- Cloud storage
- CDN delivery
- Cache invalidation

Separating avatar management keeps profile updates lightweight while isolating all file-handling logic.

---

# Storage Architecture

Avatar storage is split across two independent systems.

## Cloudinary

Responsible for:

- Binary image storage
- Image delivery
- Global CDN
- Image optimization
- Public asset hosting

Cloudinary stores the actual image.

---

## PostgreSQL

Stores only metadata.

The database persists:

- avatarUrl
- avatarPublicId

The binary image is never stored inside PostgreSQL.

---

# Upload Architecture

```
Client

      │

multipart/form-data

      │

      ▼

Express

      │

Multer

      │

Memory Buffer

      │

Validation

      │

Cloudinary

      │

Returns URL + Public ID

      │

PostgreSQL

      │

Redis Invalidation

      │

Response
```

---

# Why Backend Uploads?

The frontend never uploads directly to Cloudinary.

Instead:

```
Frontend

↓

Backend

↓

Cloudinary
```

This architecture provides:

- Centralized validation
- Backend ownership
- Simplified frontend
- Better security
- Provider abstraction
- Easier future migrations

The frontend simply sends the selected image.

The backend handles everything else.

---

# Upload Flow

```
Receive Multipart Request

↓

Validate Image

↓

Fetch Existing Profile

↓

Delete Previous Avatar

↓

Upload New Image

↓

Store Metadata

↓

Invalidate Cache

↓

Return Response
```

---

# Avatar Replacement

Every user owns exactly one avatar.

When a new avatar is uploaded:

1. Existing Cloudinary asset is deleted.
2. New image is uploaded.
3. PostgreSQL metadata is updated.
4. Redis cache is invalidated.

This guarantees that only one active avatar exists per user.

---

# Avatar Deletion

Deleting an avatar performs:

```
Delete Cloudinary Asset

↓

Set avatarUrl = NULL

↓

Set avatarPublicId = NULL

↓

Invalidate Redis

↓

Return Success
```

---

# Validation Rules

## Maximum File Size

```
2 MB
```

This reduces:

- Upload latency
- Bandwidth usage
- Storage costs

while remaining sufficient for profile images.

---

## Allowed Formats

Supported MIME types:

```
image/jpeg

image/png

image/webp
```

Other file types are rejected before upload.

---

## Maximum Files

Only one avatar may be uploaded per request.

---

# Cloudinary Folder Structure

Assets are stored using a deterministic folder structure.

```
strus/

└── users/

    └── avatars/
```

Each avatar uses the user's UUID as its public identifier.

Example:

```
strus/users/avatars/8cf36bac-fd69-45d6-bd04-05e344dec499
```

Using deterministic public IDs enables clean replacements without generating duplicate assets.

---

# Public ID Strategy

Instead of random filenames, every avatar uses:

```
publicId = userId
```

Benefits:

- One avatar per user
- Predictable asset location
- Easy deletion
- Simplified replacements

---

# Cache Management

Avatar updates affect cached profile data.

Therefore every avatar mutation invalidates:

```
user:profile:{userId}
```

The next profile request automatically repopulates Redis.

---

# Error Handling

Possible errors include:

| Error | Description |
|--------|-------------|
| AVATAR_NOT_FOUND | Avatar does not exist |
| INVALID_FILE_TYPE | Unsupported file format |
| FILE_TOO_LARGE | File exceeds size limit |
| AVATAR_UPLOAD_FAILED | Upload failed |

---

# API Endpoints

## Upload Avatar

```
POST /api/v1/users/me/avatar
```

Uploads or replaces the authenticated user's avatar.

---

## Delete Avatar

```
DELETE /api/v1/users/me/avatar
```

Removes the authenticated user's avatar.

---

# Security Considerations

Every upload undergoes server-side validation.

The backend validates:

- Authentication
- File type
- File size
- Upload ownership
- Profile existence

The frontend cannot bypass these checks.

---

# Performance Considerations

The implementation is optimized for performance.

Key design choices include:

- Multer memory storage
- Direct stream upload to Cloudinary
- No temporary disk writes
- Redis cache invalidation
- CDN-based image delivery

This minimizes latency while avoiding unnecessary filesystem operations.

---

# Future Extensions

The current architecture supports future enhancements without redesign.

Potential additions include:

- Automatic image compression
- Thumbnail generation
- Multiple avatar sizes
- Image cropping
- Profile cover images
- Animated avatars
- Organization logos
- Workspace icons

The same storage layer can also be reused for:

- Project attachments
- Contracts
- Invoices
- Chat media
- Verification documents

---

# Current Scope

Implemented features:

- Avatar upload
- Avatar replacement
- Avatar deletion
- Multipart handling
- Cloudinary integration
- Metadata persistence
- Redis cache invalidation
- Server-side validation
- Deterministic public IDs

###############################################################################################################