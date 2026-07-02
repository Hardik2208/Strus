1. Purpose

The devices table stores trusted physical or logical devices associated with a user account.

A device represents the environment from which a user accesses Strus, such as:

Desktop browser
Mobile browser
Native mobile application
Tablet
Desktop application (future)

Unlike sessions, devices persist across multiple logins and provide a stable identity for authentication, security, and user experience.

The table allows users to manage trusted devices independently of active sessions.

2. Responsibilities

The devices table is responsible for:

Device registration
Device identification
Device trust state
Device metadata
Device lifecycle
Device-level security

The table is not responsible for:

Authentication
Session lifecycle
Refresh tokens
Authorization
User profile
Business permissions
3. Ownership

Domain

Identity

Aggregate

User

Each device belongs to exactly one User.

A User may own multiple devices.

A Device may own multiple Sessions.

4. Lifecycle
First Login
     │
     ▼
Device Registered
     │
     ▼
Trusted Device
     │
     ▼
Multiple Sessions
     │
     ▼
Device Revoked
     │
     ▼
Archived / Deleted

Device registration survives session expiration.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
id	UUID	No	gen_random_uuid()	Primary Key
userId	UUID	No	—	FK → users
deviceIdentifier	VARCHAR(255)	No	—	Stable client-generated identifier
deviceName	VARCHAR(100)	Yes	NULL	User-assigned label
deviceType	DEVICE_TYPE	No	—	Desktop, Mobile, Tablet, etc.
platform	VARCHAR(50)	Yes	NULL	Windows, macOS, Linux, Android, iOS
browser	VARCHAR(50)	Yes	NULL	Chrome, Safari, Firefox, etc.
operatingSystemVersion	VARCHAR(50)	Yes	NULL	OS version
browserVersion	VARCHAR(50)	Yes	NULL	Browser version
trusted	BOOLEAN	No	FALSE	Trusted device flag
lastSeenAt	TIMESTAMPTZ	No	NOW()	Last activity
revokedAt	TIMESTAMPTZ	Yes	NULL	Device revocation
createdAt	TIMESTAMPTZ	No	NOW()	Creation timestamp
updatedAt	TIMESTAMPTZ	No	NOW()	Last update
6. Primary Key
PRIMARY KEY (id)

UUID ensures globally unique device identifiers.

7. Foreign Key
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE RESTRICT

Devices cannot exist without a User.

8. Candidate Keys

Candidate Keys:

id

(userId, deviceIdentifier)

The same device identifier should not be registered twice for the same user.

9. Relationships
Many-to-One
users
    │
    ▼
devices
One-to-Many
devices
    │
    ▼
sessions
10. Unique Constraints
UNIQUE(userId, deviceIdentifier)

This prevents duplicate registration of the same physical device for a single user while allowing different users to register their own devices independently.

11. Check Constraints
Device Identifier
deviceIdentifier <> ''
Revocation
revokedAt IS NULL
OR revokedAt >= createdAt
Activity
lastSeenAt >= createdAt
12. Default Values
Column	Default
id	gen_random_uuid()
trusted	FALSE
lastSeenAt	NOW()
createdAt	NOW()
updatedAt	NOW()
13. Nullable Columns

Nullable fields:

deviceName
platform
browser
operatingSystemVersion
browserVersion
revokedAt

Device fingerprint information depends on the client platform and may not always be available.

14. Delete Behaviour

Devices may be physically deleted after:

explicit user removal
long-term inactivity
account deletion

Before deletion:

All active sessions must be revoked.
Audit records must remain intact.
15. Update Behaviour

Editable:

deviceName
trusted
lastSeenAt
revokedAt
platform
browser
operatingSystemVersion
browserVersion
updatedAt

Immutable:

id
userId
deviceIdentifier
createdAt
16. Optimistic Locking

Not required.

Device metadata changes infrequently and is managed by authentication services.

17. Audit Requirements

Generate Audit Logs for:

Device registered
Device renamed
Device trusted
Device revoked
Device removed
First login from new device
Suspicious device detection
18. Index Strategy
Primary Index
PK(id)
Foreign Key Index
(userId)

Supports:

User device management
Security dashboard
Unique Index
(userId, deviceIdentifier)

Supports:

Duplicate prevention
Device recognition
Secondary Index
(lastSeenAt)

Supports:

Cleanup jobs
Inactive device detection
Composite Index
(userId, trusted)

Supports:

Trusted device listing
MFA bypass decisions
Partial Index
WHERE trusted = TRUE

Optimizes trusted-device lookups for authentication.

19. Query Patterns
Load User Devices
SELECT *
FROM devices
WHERE userId = ?
Find Existing Device
SELECT *
FROM devices
WHERE userId = ?
AND deviceIdentifier = ?
Trusted Devices
SELECT *
FROM devices
WHERE userId = ?
AND trusted = TRUE
Inactive Devices
SELECT id
FROM devices
WHERE lastSeenAt < NOW() - INTERVAL '180 days'
20. Expected Scale

Projected row count:

3–10 devices per user on average
Tens of millions of rows

Characteristics:

Read-heavy
Low write frequency
Medium retention
21. Partitioning Strategy

Partitioning is not recommended.

Device records remain relatively small and are almost always queried by userId.

22. Security Considerations

Device identifiers must:

Be cryptographically random where generated by the client.
Never expose internal database IDs.
Not rely solely on browser fingerprinting for identity.
Be revocable independently of sessions.

The trusted flag must never bypass authentication by itself; it should only reduce friction within approved authentication flows.

23. Future Extensions

Potential future additions include:

Push notification token
Device public key (passkeys/WebAuthn)
Biometric capability
Hardware security status
Device risk score
Enterprise compliance state
Last known location (coarse)

These extensions should enhance device trust without changing the relationship between users, devices, and sessions.

24. Design Rationale

The devices table models persistent client environments separately from authentication sessions, allowing Strus to distinguish where a user accesses the platform from when they authenticate. This separation enables trusted-device management, session-independent security controls, better user visibility into account activity, and future support for passkeys, biometric authentication, and enterprise device policies without redesigning the identity model.