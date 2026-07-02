DDS-001E — Table Specification: oauth_accounts

Version: 1.0

Status: Draft

Owner: Database Architecture

Domain: Identity

Aggregate: User

Entity: OAuthAccount

1. Purpose

The oauth_accounts table stores every external authentication provider linked to a user account.

Authentication providers are independent of the User entity.

A user may authenticate using multiple providers while maintaining a single permanent platform identity.

Examples:

Google
Microsoft
GitHub
Apple
Enterprise SSO

The table stores only provider identity.

It never stores application authorization or business roles.

2. Responsibilities

The oauth_accounts table is responsible for:

OAuth provider linkage
Provider user identifiers
Account linking
OAuth token metadata
Token expiry
Provider synchronization

The table is not responsible for:

User authentication status
Sessions
Permissions
Business roles
User profile
3. Ownership

Domain

Identity

Aggregate

User

The OAuthAccount entity belongs to exactly one User.

One User may own multiple OAuth accounts.

4. Lifecycle
User Created
      │
      ▼
OAuth Account Linked
      │
      ▼
Provider Synchronization
      │
      ▼
Provider Unlinked

Removing an OAuth provider never deletes the User.

Only the authentication method disappears.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
id	UUID	No	gen_random_uuid()	Primary Key
userId	UUID	No	—	FK → users
provider	OAUTH_PROVIDER	No	—	Authentication provider
providerUserId	VARCHAR(255)	No	—	Provider account identifier
providerEmail	CITEXT	Yes	NULL	Email returned by provider
accessToken	TEXT	Yes	NULL	Encrypted access token
refreshToken	TEXT	Yes	NULL	Encrypted refresh token
tokenExpiresAt	TIMESTAMPTZ	Yes	NULL	Token expiration
providerMetadata	JSONB	Yes	NULL	Provider-specific metadata
linkedAt	TIMESTAMPTZ	No	NOW()	Initial linkage
lastSyncedAt	TIMESTAMPTZ	Yes	NULL	Last synchronization
createdAt	TIMESTAMPTZ	No	NOW()	Creation timestamp
updatedAt	TIMESTAMPTZ	No	NOW()	Last modification
6. Primary Key
PRIMARY KEY (id)

UUID is used because OAuth accounts may be independently referenced by audit logs and administrative tooling.

7. Foreign Key
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE RESTRICT

A User owns OAuth accounts.

OAuth accounts cannot exist independently.

8. Candidate Keys

Candidate Keys:

(provider, providerUserId)

id

Every provider guarantees a unique identifier for its users.

9. Relationships
Many-to-One
users
    │
    ▼
oauth_accounts

One User

↓

Many OAuth Accounts

10. Unique Constraints
Provider Identity
UNIQUE(provider, providerUserId)

Prevents linking the same Google account to multiple Strus users.

Optional Email Constraint

No uniqueness constraint should exist on providerEmail.

Reason:

Providers may return changed emails.
Different providers may expose different emails.
Email ownership belongs to users.email, not OAuth providers.
11. Check Constraints
Provider User ID
providerUserId <> ''
Expiration
tokenExpiresAt IS NULL
OR tokenExpiresAt >= linkedAt
Refresh Token

If refreshToken exists

then

accessToken IS NOT NULL
12. Default Values
Column	Default
id	gen_random_uuid()
linkedAt	NOW()
createdAt	NOW()
updatedAt	NOW()
13. Nullable Columns

Nullable fields:

providerEmail
accessToken
refreshToken
tokenExpiresAt
providerMetadata
lastSyncedAt

Providers expose different capabilities.

The schema remains provider-agnostic.

14. Delete Behaviour

OAuth accounts may be removed independently.

Deleting an OAuth account:

does not delete the User
does not invalidate existing sessions
removes only that authentication provider
15. Update Behaviour

Editable:

accessToken
refreshToken
tokenExpiresAt
providerMetadata
lastSyncedAt
updatedAt

Immutable:

id
provider
providerUserId
linkedAt

Changing provider identity requires creating a new OAuth account.

16. Optimistic Locking

Not required.

Token refresh operations are infrequent and can be serialized by the authentication service.

17. Audit Requirements

Audit events include:

OAuth account linked
OAuth account removed
Provider synchronization
Token refresh failure
Provider account changed
Authentication provider switched

All events generate immutable Audit Logs.

18. Index Strategy
Primary Index
PK(id)
Foreign Key Index
(userId)

Supports:

Loading all authentication providers for a user
Unique Index
(provider, providerUserId)

Supports:

OAuth login
Account linking
Duplicate prevention
Secondary Index
(provider)

Supports:

Provider analytics
Administrative reporting
Partial Index
WHERE tokenExpiresAt IS NOT NULL

Supports scheduled token refresh jobs.

19. Query Patterns
OAuth Login
SELECT *
FROM oauth_accounts
WHERE provider = ?
AND providerUserId = ?
Load Linked Providers
SELECT *
FROM oauth_accounts
WHERE userId = ?
Expired Tokens
SELECT id
FROM oauth_accounts
WHERE tokenExpiresAt <= NOW()
Google Synchronization
SELECT *
FROM oauth_accounts
WHERE provider = 'GOOGLE'
20. Expected Scale

Projected row count:

Approximately 1–3 OAuth accounts per user
Tens of millions of rows

Characteristics:

Read-heavy
Low write frequency
Small row size
21. Partitioning Strategy

Partitioning is not recommended.

The table is compact and primarily accessed through indexed lookups.

22. Security Considerations

The following columns contain sensitive credentials:

accessToken
refreshToken

Requirements:

Encrypt at rest.
Never expose through APIs.
Never include in logs.
Restrict database access to authentication services.
Rotate tokens when providers require reauthorization.

Provider metadata stored in JSONB must exclude secrets unless absolutely necessary.

23. Future Extensions

Potential future additions:

Enterprise SAML integration
OpenID Connect support
SCIM provisioning
Provider avatar synchronization
Provider organization membership
Account merge workflows
Automatic provider unlink policies

These additions should extend authentication capabilities without altering the User aggregate.

24. Design Rationale

The oauth_accounts table isolates third-party authentication from the core users table, allowing Strus to support multiple authentication providers per user while maintaining a single permanent identity. The composite uniqueness of (provider, providerUserId) guarantees that an external account can only be linked once, while sensitive token data remains isolated from business entities. This design supports future authentication providers and enterprise identity systems without requiring schema changes to the core identity model.