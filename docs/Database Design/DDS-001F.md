1. Purpose

The sessions table represents authenticated login sessions for users within Strus.

Each session corresponds to one successful authentication on a specific device.

Sessions enable:

Refresh token management
Session revocation
Device-specific logout
Security auditing
Concurrent logins
Account activity tracking

A user may maintain multiple simultaneous sessions across multiple devices.

The session is the authoritative representation of an authenticated login state.

2. Responsibilities

The sessions table is responsible for:

Refresh token lifecycle
Session expiration
Session revocation
Last activity tracking
Device association
Authentication auditing

The table is not responsible for:

Password validation
OAuth linkage
Device metadata
Authorization
User profile
Business permissions
3. Ownership

Domain

Identity

Aggregate

User

Each session belongs to exactly one User.

Each session is associated with exactly one Device.

A User may own multiple active sessions.

4. Lifecycle
Authentication Successful
          │
          ▼
     Session Created
          │
          ▼
     Active Session
      ┌────┴────┐
      ▼         ▼
Token Refresh  Activity Update
      │         │
      └────┬────┘
           ▼
      Session Revoked
           │
           ▼
        Expired

Sessions are operational records.

Expired sessions may be cleaned up by background jobs after a configurable retention period.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
id	UUID	No	gen_random_uuid()	Primary Key
userId	UUID	No	—	FK → users
deviceId	UUID	No	—	FK → devices
refreshTokenHash	TEXT	No	—	Hashed refresh token
status	SESSION_STATUS	No	ACTIVE	Session lifecycle
issuedAt	TIMESTAMPTZ	No	NOW()	Authentication time
expiresAt	TIMESTAMPTZ	No	—	Refresh token expiry
lastActivityAt	TIMESTAMPTZ	No	NOW()	Last authenticated request
revokedAt	TIMESTAMPTZ	Yes	NULL	Revocation timestamp
revokedReason	SESSION_REVOCATION_REASON	Yes	NULL	Revocation reason
ipAddress	INET	Yes	NULL	Login IP
userAgent	TEXT	Yes	NULL	Browser / application
createdAt	TIMESTAMPTZ	No	NOW()	Creation timestamp
updatedAt	TIMESTAMPTZ	No	NOW()	Last update
6. Primary Key
PRIMARY KEY (id)

UUID prevents predictable session identifiers.

7. Foreign Keys
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE RESTRICT
FOREIGN KEY (deviceId)
REFERENCES devices(id)
ON UPDATE CASCADE
ON DELETE RESTRICT

Sessions cannot exist without both a User and a Device.

8. Candidate Keys

Candidate Keys:

id

Refresh tokens are rotated over time and therefore are not candidate keys.

9. Relationships
Many-to-One
users
    │
    ▼
sessions
Many-to-One
devices
    │
    ▼
sessions
10. Unique Constraints

No business-level unique constraints exist.

A single device may have multiple historical sessions.

A user may maintain multiple concurrent sessions.

11. Check Constraints
Expiration
expiresAt > issuedAt
Revocation
revokedAt IS NULL
OR revokedAt >= issuedAt
Activity
lastActivityAt >= issuedAt
Revocation Reason

If:

status = REVOKED

Then:

revokedReason IS NOT NULL
12. Default Values
Column	Default
id	gen_random_uuid()
status	ACTIVE
issuedAt	NOW()
lastActivityAt	NOW()
createdAt	NOW()
updatedAt	NOW()
13. Nullable Columns

Nullable fields:

revokedAt
revokedReason
ipAddress
userAgent

All other fields are mandatory.

14. Delete Behaviour

Sessions may be physically deleted after:

expiration
configurable retention period
completed audit retention

Unlike business entities, sessions are operational data.

15. Update Behaviour

Editable:

status
lastActivityAt
revokedAt
revokedReason
updatedAt

Immutable:

id
userId
deviceId
issuedAt
refreshTokenHash

Refresh token rotation creates a new session rather than mutating the existing authentication artifact.

16. Optimistic Locking

Not required.

Session updates are lightweight and naturally serialized by the authentication service.

17. Audit Requirements

Generate Audit Logs for:

Session created
Session refreshed
Session revoked
Session expired
Logout
Forced logout by administrator
Password reset invalidating sessions
18. Index Strategy
Primary Index
PK(id)
Foreign Key Index
(userId)

Supports:

"Show active sessions"
(deviceId)

Supports:

Device management
Device logout
Composite Index
(userId, status)

Supports:

Active session listing
Logout all devices
Composite Index
(status, expiresAt)

Supports:

Background cleanup jobs
Expired session deletion
Partial Index
WHERE status='ACTIVE'

Optimizes active-session lookups.

19. Query Patterns
Authenticate Refresh Token
SELECT *
FROM sessions
WHERE id = ?
AND status = 'ACTIVE'
User Sessions
SELECT *
FROM sessions
WHERE userId = ?
AND status = 'ACTIVE'
Device Logout
SELECT *
FROM sessions
WHERE deviceId = ?
Cleanup Job
SELECT id
FROM sessions
WHERE expiresAt <= NOW()
20. Expected Scale

Projected row count:

Hundreds of millions of rows over platform lifetime

Characteristics:

Extremely high write volume
High read volume
Operational data
Short-lived records
21. Partitioning Strategy

Future partitioning by issuedAt (monthly or quarterly) should be considered once session volume justifies it.

Expired partitions can then be archived or dropped efficiently without affecting active sessions.

22. Security Considerations

The following security rules are mandatory:

Store only hashed refresh tokens.
Never persist plaintext refresh tokens.
Refresh token hashes must use a modern password hashing algorithm (e.g., Argon2id or bcrypt with appropriate cost).
Session identifiers must be cryptographically random UUIDs.
ipAddress and userAgent are sensitive operational data and should only be accessible to authentication and security services.
23. Future Extensions

Potential future additions include:

MFA challenge state
Risk score
Geolocation metadata
Impossible travel detection
Trusted session flag
Enterprise device compliance
Session labels (e.g., "MacBook Pro", "Pixel 9")
24. Design Rationale

The sessions table models authenticated login state independently of both users and devices. By separating session lifecycle from authentication credentials, Strus gains fine-grained session revocation, concurrent login support, security auditing, and scalable refresh-token management. Treating sessions as operational records also enables efficient cleanup and future partitioning without compromising the integrity of long-lived business data.