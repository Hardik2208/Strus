1. Purpose

The verifications table stores the current trust and verification state of a user.

Verification is independent of authentication.

A user may have a valid account while remaining partially verified.

The verification system provides a structured mechanism for progressively increasing trust without modifying the User entity.

This table stores only the current verification state.

Historical verification events belong in the Audit Domain.

2. Responsibilities

The verifications table is responsible for:

Email verification
Phone verification
Identity verification (KYC)
Current verification level
Verification timestamps
Verification provider references
Verification status

The table is not responsible for:

Authentication
Reputation
Organization membership
Payment history
Verification audit history
3. Ownership

Domain

Identity

Aggregate

User

The Verification entity cannot exist without a User.

One Verification record exists for every User.

4. Lifecycle
User Created
      │
      ▼
LEVEL_0
      │
      ▼
Email Verified
      │
      ▼
LEVEL_1
      │
      ▼
Phone Verified
      │
      ▼
LEVEL_2
      │
      ▼
Identity Verified
      │
      ▼
LEVEL_3

Verification is monotonic.

Users may move to higher levels.

Downgrades should occur only through administrative action.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
userId	UUID	No	—	Shared PK / FK
verificationLevel	VERIFICATION_LEVEL	No	LEVEL_0	Current trust level
emailVerified	BOOLEAN	No	FALSE	Email verification state
emailVerifiedAt	TIMESTAMPTZ	Yes	NULL	Email verification time
phoneVerified	BOOLEAN	No	FALSE	Phone verification state
phoneVerifiedAt	TIMESTAMPTZ	Yes	NULL	Phone verification time
phoneNumber	VARCHAR(20)	Yes	NULL	Verified phone number
identityVerified	BOOLEAN	No	FALSE	KYC verification state
identityVerifiedAt	TIMESTAMPTZ	Yes	NULL	Identity verification time
verificationProvider	VERIFICATION_PROVIDER	Yes	NULL	KYC provider
providerReferenceId	VARCHAR(255)	Yes	NULL	Provider verification ID
verificationStatus	VERIFICATION_STATUS	No	PENDING	Current verification workflow status
rejectionReason	TEXT	Yes	NULL	Last rejection reason
createdAt	TIMESTAMPTZ	No	NOW()	Record creation
updatedAt	TIMESTAMPTZ	No	NOW()	Last modification
6. Primary Key
PRIMARY KEY (userId)

Shared primary key.

Exactly one Verification record per User.

7. Foreign Key
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE RESTRICT

Verification cannot exist independently.

8. Candidate Keys

Candidate key:

userId

No other candidate keys exist.

9. Relationships
users
    │
    ▼
verifications

Strict one-to-one relationship.

10. Unique Constraints

Primary Key

PRIMARY KEY(userId)

Optional provider uniqueness (when present):

UNIQUE(verificationProvider, providerReferenceId)

This prevents duplicate provider verification records.

11. Check Constraints
Email Timestamp
emailVerified = FALSE
OR emailVerifiedAt IS NOT NULL
Phone Timestamp
phoneVerified = FALSE
OR phoneVerifiedAt IS NOT NULL
Identity Timestamp
identityVerified = FALSE
OR identityVerifiedAt IS NOT NULL
Verification Level Rules
LEVEL_1
requires emailVerified = TRUE
LEVEL_2
requires

emailVerified = TRUE
AND
phoneVerified = TRUE
LEVEL_3
requires

emailVerified = TRUE
AND
phoneVerified = TRUE
AND
identityVerified = TRUE

These should be enforced through CHECK constraints where practical and supplemented by service-layer validation for complex workflows.

Phone Number

If phoneVerified = TRUE

then

phoneNumber IS NOT NULL
12. Default Values
Column	Default
verificationLevel	LEVEL_0
emailVerified	FALSE
phoneVerified	FALSE
identityVerified	FALSE
verificationStatus	PENDING
createdAt	NOW()
updatedAt	NOW()
13. Nullable Columns

Nullable fields:

emailVerifiedAt
phoneVerifiedAt
phoneNumber
identityVerifiedAt
verificationProvider
providerReferenceId
rejectionReason

These become populated only as verification progresses.

14. Delete Behaviour

Independent deletion is prohibited.

Verification lifecycle is controlled by the User aggregate.

15. Update Behaviour

Allowed updates:

verificationLevel
emailVerified
phoneVerified
identityVerified
timestamps
verificationProvider
verificationStatus
rejectionReason
updatedAt

Immutable:

userId
createdAt
16. Optimistic Locking

Not required.

Verification updates are infrequent and typically serialized through verification workflows.

17. Audit Requirements

The following actions must generate immutable Audit Logs:

Email verified
Phone verified
Identity verification submitted
Identity verification approved
Identity verification rejected
Verification level changed
Verification manually overridden

Audit history is stored separately from the current verification state.

18. Index Strategy
Primary Index
PK(userId)
Secondary Index
(verificationLevel)

Supports:

Trust filtering
Marketplace visibility
Administrative reporting
(verificationStatus)

Supports:

Pending KYC queue
Failed verification review
Manual processing dashboards
Composite Index
(verificationStatus, verificationLevel)

Supports verification operations and analytics.

Partial Index
WHERE verificationStatus = 'PENDING'

Optimizes KYC processing queues.

19. Query Patterns
Load User Verification
SELECT *
FROM verifications
WHERE userId = ?
Pending Identity Verification
SELECT userId
FROM verifications
WHERE verificationStatus = 'PENDING'
Fully Verified Users
SELECT userId
FROM verifications
WHERE verificationLevel = 'LEVEL_3'
Rejected Verifications
SELECT userId, rejectionReason
FROM verifications
WHERE verificationStatus = 'REJECTED'
20. Expected Scale

Projected row count:

One row per user

Characteristics:

Read-heavy
Very low write frequency
Small row size
21. Partitioning Strategy

Partitioning is not recommended.

The table remains compact and is primarily accessed through userId.

22. Future Extensions

Potential future additions:

Address verification
Business verification
Organization verification linkage
Tax verification
Document expiry tracking
Periodic re-verification
Multiple identity providers

These should extend the verification process without changing the User aggregate.

23. Design Rationale

The verifications table isolates trust and identity verification from authentication, allowing the verification workflow to evolve independently of account management. Using a shared primary key enforces a strict one-to-one relationship with users, while separating current verification state from historical audit records keeps the table compact and optimized for frequent reads. This design supports progressive trust levels, future KYC providers, and enterprise verification requirements without coupling verification logic to authentication or business workflows.