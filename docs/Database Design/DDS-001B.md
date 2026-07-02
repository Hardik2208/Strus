1. Purpose

The users table represents the permanent identity of every individual registered on Strus.

A row in this table represents one human identity that persists for the lifetime of the platform, regardless of the business roles performed by that individual.

The table intentionally stores only authentication and identity-level information.

It must not contain:

Profile information
Reputation
Organization membership
Project participation
Financial information
Business metrics

Those responsibilities belong to separate tables within the User aggregate.

2. Responsibilities

The users table is responsible for:

Permanent identity
Login identity
Authentication credentials
Global account status
Verification level cache
Account lifecycle
Audit timestamps

The table is not responsible for:

Personal profile
Verification history
OAuth provider information
Sessions
Devices
Reputation
Performance history
3. Ownership

Domain

Identity

Aggregate

User

Aggregate Root

Yes

No other aggregate owns or modifies this table directly.

All mutations occur through User services.

4. Lifecycle
Account Created
        │
        ▼
PENDING_EMAIL_VERIFICATION
        │
        ▼
ACTIVE
   ┌────┴────┐
   ▼         ▼
SUSPENDED  DEACTIVATED
                 │
                 ▼
              DELETED

Deletion is always soft deletion.

User records are never physically removed because they are referenced throughout the platform.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
id	UUID	No	gen_random_uuid()	Primary identifier
email	CITEXT	No	—	Unique login email
passwordHash	TEXT	Yes	NULL	Password hash (NULL for OAuth-only users)
status	USER_STATUS	No	PENDING_EMAIL_VERIFICATION	Account lifecycle
verificationLevel	VERIFICATION_LEVEL	No	LEVEL_0	Cached verification level
isEmailVerified	BOOLEAN	No	FALSE	Cached verification state
lastLoginAt	TIMESTAMPTZ	Yes	NULL	Last successful authentication
createdAt	TIMESTAMPTZ	No	NOW()	Record creation
updatedAt	TIMESTAMPTZ	No	NOW()	Last modification
deletedAt	TIMESTAMPTZ	Yes	NULL	Soft deletion timestamp
6. Primary Key
PRIMARY KEY (id)

UUID is mandatory.

Sequential identifiers are prohibited.

Reason:

Distributed systems
No ID enumeration
Easier sharding
Improved API security
7. Candidate Keys

The following candidate key exists:

email

Every email uniquely identifies a platform account.

8. Foreign Keys

None.

users is the aggregate root.

Other tables reference users.

9. Relationships
One-to-One
users
    │
    ├── user_profiles
    ├── verifications
    ├── client_reputations
    └── professional_reputations
One-to-Many
users
    │
    ├── oauth_accounts
    ├── sessions
    ├── devices
    ├── performance_records
    ├── notifications
    ├── audit_logs
    └── ...

The User table becomes the most highly referenced table in the entire platform.

10. Unique Constraints
UNIQUE (email)

Email uniqueness is enforced at the database level.

Because CITEXT is used, these values are identical:

hardik@gmail.com

Hardik@gmail.com

HARDIK@gmail.com
11. Check Constraints
Email
email <> ''
Verification Consistency
NOT (
    verificationLevel = 'LEVEL_1'
    AND isEmailVerified = FALSE
)
Timestamp Integrity
deletedAt IS NULL
OR deletedAt >= createdAt
12. Default Values
Column	Default
id	gen_random_uuid()
status	PENDING_EMAIL_VERIFICATION
verificationLevel	LEVEL_0
isEmailVerified	FALSE
createdAt	NOW()
updatedAt	NOW()
13. Nullable Columns
Column	Reason
passwordHash	OAuth-only users
lastLoginAt	User may never have logged in
deletedAt	Active accounts

No other column should be nullable.

14. Delete Behaviour

Physical deletion is prohibited.

Application deletion performs:

deletedAt = NOW()

status = DELETED

Historical references remain valid.

15. Update Behaviour

Allowed updates:

passwordHash
status
verificationLevel
isEmailVerified
lastLoginAt
updatedAt

Forbidden updates:

id
createdAt
16. Optimistic Locking

Not required.

Concurrent updates are limited to authentication-related fields.

Future introduction of a version column remains possible if authentication workflows require it.

17. Audit Requirements

The following actions generate audit records:

User created
Email verified
Password changed
Account suspended
Account reactivated
Account deactivated
User deleted
Verification level changed

Audit logs remain immutable.

18. Index Strategy
Primary Index
PK(id)
Unique Index
UNIQUE(email)
Secondary Indexes
(status)

Supports:

Admin dashboards
Moderation
Suspended account queries
(verificationLevel)

Supports:

Verification queues
Trust analytics
Composite Index
(status, verificationLevel)

Supports:

Active users awaiting verification
Administrative filtering
Partial Index
WHERE deletedAt IS NULL

Optimizes queries for active accounts.

19. Query Patterns

The most common access patterns are:

Authentication
SELECT *
FROM users
WHERE email = ?
Load Authenticated User
SELECT *
FROM users
WHERE id = ?
Verification Queue
SELECT id, email
FROM users
WHERE status = 'ACTIVE'
AND verificationLevel = 'LEVEL_0'
Administrative Search
SELECT id, email, status
FROM users
WHERE status = ?
20. Expected Scale

Projected row count:

10M+ users

Characteristics:

Small row size
High read frequency
Moderate write frequency
Authentication-critical

This table should remain cache-friendly and HOT-update friendly.

21. Partitioning Strategy

Partitioning is not recommended.

Primary-key lookups dominate access patterns.

A single global users table remains efficient at expected scale.

22. Future Extensions

Potential future additions include:

Multi-factor authentication flags
Password rotation metadata
Account recovery metadata
Risk score cache
Account lockout information

These additions should remain identity-focused and must not introduce business-domain concerns.

23. Design Rationale

The users table is intentionally minimal. It stores only identity and authentication information, leaving profile data, verification details, sessions, devices, and reputation to dedicated tables within the User aggregate. This minimizes row width, reduces write contention, improves cache locality, and preserves clear separation of concerns. As the most frequently referenced table in Strus, its design prioritizes stability, lookup performance, and long-term maintainability over convenience.