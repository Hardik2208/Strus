1. Purpose

The Identity Domain defines every permanent identity that exists within Strus.

Unlike authentication systems that only manage login credentials, the Identity Domain manages the complete lifecycle of a platform user, including authentication, verification, profile information, sessions, devices, OAuth providers, and long-term reputation.

A user remains the same individual regardless of whether they act as a Client, Contractor, Professional, Organization Administrator, or Viewer.

Identity is permanent.

Business roles are contextual and emerge through participation in projects rather than through separate accounts. This design follows the finalized Canonical Domain Model.

2. Scope

This specification covers the following database tables:

Table	Purpose
users	Permanent platform identity
user_profiles	Public profile information
verifications	Trust and verification status
oauth_accounts	Linked authentication providers
sessions	Active login sessions
devices	Registered user devices
client_reputations	Cached client reputation snapshot
professional_reputations	Cached professional reputation snapshot
performance_records	Immutable reputation source records

Only these tables belong to the Identity Domain.

3. Aggregate Root

The Identity Domain contains a single aggregate.

User
│
├── UserProfile
├── Verification
├── OAuthAccount
├── Session
├── Device
├── ClientReputation
├── ProfessionalReputation
└── PerformanceRecord

The aggregate root is User.

All modifications to child entities must occur through services that own the User aggregate.

No external aggregate may directly modify child entities.

4. Domain Responsibilities

The Identity Domain is responsible for:

Permanent user identity
Authentication identity
Verification state
OAuth provider linkage
Session lifecycle
Device management
User profile management
Role-independent identity
Client reputation
Professional reputation
Performance history

The Identity Domain is not responsible for:

Project participation
Organization membership
Project permissions
Financial data
Contracts
Milestones
Notifications
Conversations

Those responsibilities belong to their respective aggregates.

5. Database Design Principles

The Identity Domain follows these implementation principles:

Every user has exactly one permanent identity.
Authentication data is separated from profile data.
Verification is separated from authentication.
Reputation is derived rather than manually edited.
Performance history is immutable.
Sessions and devices represent different concepts.
Every table has a single responsibility.
Every relationship is enforced through foreign keys where possible.
All timestamps use UTC (TIMESTAMPTZ).
UUIDs are used for every primary key.
6. Entity Lifecycle
User
PENDING_EMAIL_VERIFICATION
            │
            ▼
         ACTIVE
            │
     ┌──────┴──────┐
     ▼             ▼
SUSPENDED     DEACTIVATED
                    │
                    ▼
                DELETED

Users are soft deleted.

Historical references must remain valid indefinitely.

Verification

Verification progresses independently of authentication.

LEVEL_0
    │
    ▼
LEVEL_1
    │
    ▼
LEVEL_2
    │
    ▼
LEVEL_3

Future verification levels must be additive and must not require schema redesign.

Reputation

Reputation is never edited manually.

Business Event
      │
      ▼
Performance Record
      │
      ▼
Score Calculation
      │
      ▼
Client Reputation
Professional Reputation

The reputation tables are derived snapshots.

performance_records remain the immutable source of truth.

7. Aggregate Relationships
User
 │
 ├──────1────── UserProfile
 │
 ├──────1────── Verification
 │
 ├──────N────── OAuthAccount
 │
 ├──────N────── Session
 │
 ├──────N────── Device
 │
 ├──────1────── ClientReputation
 │
 ├──────1────── ProfessionalReputation
 │
 └──────N────── PerformanceRecord

These relationships are mandatory and enforced through the database schema.

8. Domain-Level Constraints

The following constraints apply across the entire Identity Domain:

One email address may belong to only one user.
One user may own multiple OAuth accounts.
One OAuth account belongs to exactly one user.
One user may maintain multiple active sessions.
One device may generate multiple sessions.
Every user has exactly one verification record.
Every user has exactly one client reputation record.
Every user has exactly one professional reputation record.
Performance records are append-only and immutable.
Reputation values are recalculated from performance records rather than updated incrementally.
9. Expected Scale

The Identity Domain must support:

Tens of millions of users.
Hundreds of millions of login sessions.
Hundreds of millions of devices.
Billions of performance records over the platform lifetime.

The schema must therefore prioritize:

Efficient primary-key lookups.
Optimized authentication queries.
Minimal row size for the users table.
Separation of mutable and immutable data.
Future partitioning readiness for performance_records.
10. Database Design Decisions

The following implementation decisions are considered frozen:

users stores only identity and authentication information.
user_profiles stores all public profile information.
verifications stores trust state separately from authentication.
oauth_accounts supports multiple authentication providers per user.
sessions represent login instances.
devices represent physical or logical devices independent of sessions.
Two independent reputation tables (client_reputations and professional_reputations) are maintained as cached snapshots.
performance_records are immutable and form the canonical source for all reputation calculations.
11. Implementation Order

The Identity Domain will be specified in the following sequence:

users
user_profiles
verifications
oauth_accounts
sessions
devices
client_reputations
professional_reputations
performance_records

Each table will include:

Purpose
Ownership
Lifecycle
Column definitions
PostgreSQL data types
Primary and foreign keys
Candidate keys
Constraints
Default values
Relationships
Delete and update behavior
Index strategy
Query patterns
Scaling considerations
Future extensibility
Summary

The Identity Domain establishes the permanent identity model for Strus. It separates authentication, verification, profile management, device management, session management, and reputation into focused entities while maintaining the User aggregate as the single consistency boundary. This design minimizes coupling, preserves auditability, supports large-scale growth, and provides a stable foundation for every other domain in the platform.