1. Purpose

The user_profiles table stores all public and editable information associated with a user.

Unlike the users table, which represents platform identity and authentication, user_profiles represents how a user appears throughout the platform.

This separation keeps authentication data isolated from presentation data, reduces row width in the users table, and allows profile updates without affecting authentication workloads.

A profile exists for every user and has a strict one-to-one relationship with the users table.

2. Responsibilities

The user_profiles table is responsible for:

Public identity
Display name
Personal information
Avatar
Biography
Localization preferences

The table is not responsible for:

Authentication
Passwords
Verification
Reputation
Organization membership
Project participation
Business metrics
3. Ownership

Domain

Identity

Aggregate

User

Owner

User

The profile cannot exist independently.

Creating a User automatically creates its corresponding profile.

Deleting a User soft-deletes the User but does not remove the profile.

4. Lifecycle
User Created
      │
      ▼
Profile Created
      │
      ▼
Editable Throughout Lifetime
      │
      ▼
User Soft Deleted

The profile is never versioned.

Only the latest representation is stored.

Historical profile changes are captured through Audit Logs rather than profile versioning.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
userId	UUID	No	—	Shared Primary Key / FK
firstName	VARCHAR(100)	No	—	Legal first name
lastName	VARCHAR(100)	No	—	Legal last name
displayName	VARCHAR(150)	No	—	Public display name
username	CITEXT	Yes	NULL	Optional public username
avatarUrl	TEXT	Yes	NULL	Public avatar URL
bio	TEXT	Yes	NULL	User biography
countryCode	CHAR(2)	Yes	NULL	ISO-3166 country code
timezone	VARCHAR(64)	No	'UTC'	Preferred timezone
preferredLanguage	VARCHAR(10)	No	'en'	ISO language code
preferredCurrency	CHAR(3)	No	'USD'	ISO-4217 currency
createdAt	TIMESTAMPTZ	No	NOW()	Creation timestamp
updatedAt	TIMESTAMPTZ	No	NOW()	Last update
6. Primary Key
PRIMARY KEY (userId)

The table uses a shared primary key.

The primary key is simultaneously the foreign key to users.

This guarantees exactly one profile per user.

7. Foreign Key
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE RESTRICT

The User aggregate controls lifecycle.

Profiles cannot outlive their User.

8. Candidate Keys

Candidate keys:

userId

username (when present)
9. Relationships
One-to-One
users
    │
    ▼
user_profiles

No other entity references user_profiles.

All business references continue to point to users.

10. Unique Constraints
Shared PK
PRIMARY KEY(userId)
Username
UNIQUE(username)

Because the column is nullable:

Unlimited NULL values allowed
Every non-null username must be globally unique
11. Check Constraints
Display Name
char_length(displayName) BETWEEN 2 AND 150
First Name
char_length(firstName) > 0
Last Name
char_length(lastName) > 0
Country Code
countryCode IS NULL
OR char_length(countryCode)=2
Preferred Currency
char_length(preferredCurrency)=3
Preferred Language
char_length(preferredLanguage)>=2
12. Default Values
Column	Default
timezone	UTC
preferredLanguage	en
preferredCurrency	USD
createdAt	NOW()
updatedAt	NOW()
13. Nullable Columns

Nullable fields:

username
avatarUrl
bio
countryCode

Everything else is mandatory.

14. Delete Behaviour

No independent deletion.

The User aggregate owns lifecycle.

Profile deletion only occurs through User deletion.

15. Update Behaviour

Editable:

firstName
lastName
displayName
username
avatarUrl
bio
countryCode
timezone
preferredLanguage
preferredCurrency

Immutable:

userId
createdAt
16. Optimistic Locking

Not required.

Profile updates are infrequent.

updatedAt provides sufficient change tracking.

17. Audit Requirements

Audit events include:

Profile created
Display name updated
Username changed
Avatar updated
Biography updated
Localization updated

Audit records are written to the Infrastructure Domain.

18. Index Strategy
Primary Index
PK(userId)
Unique Index
UNIQUE(username)
Secondary Index
(displayName)

Supports:

User search
Mention autocomplete
Organization invitations
Composite Index

Not required.

Expected query patterns are simple.

Partial Index
WHERE username IS NOT NULL

Optimizes username lookups while avoiding indexing NULL values.

Future Search Index

A PostgreSQL GIN full-text index may later be introduced over:

displayName

bio

to support user discovery without redesigning the schema.

19. Query Patterns

Most common queries:

Load User Profile
SELECT *
FROM user_profiles
WHERE userId = ?
Find by Username
SELECT userId
FROM user_profiles
WHERE username = ?
User Search
SELECT userId, displayName, avatarUrl
FROM user_profiles
WHERE displayName ILIKE ?
LIMIT 20
Organization Invite Search
SELECT userId, displayName, username
FROM user_profiles
WHERE displayName ILIKE ?
20. Expected Scale

Projected row count:

One row per user
Approximately equal to users

Characteristics:

Read-heavy
Low write frequency
Small-to-medium row size
21. Partitioning Strategy

Partitioning is not recommended.

The table remains relatively compact and is almost always accessed by primary key.

22. Future Extensions

Potential future additions include:

Pronouns
Portfolio headline
Personal website
Social links
Profile visibility settings
AI-generated public summary

These additions must remain presentation-focused and must not introduce authentication or business-domain concerns.

23. Design Rationale

The user_profiles table intentionally separates presentation data from authentication data. This keeps the users table compact and optimized for authentication while allowing profile information to evolve independently. The shared primary key enforces a strict one-to-one relationship, and the schema remains focused on user-facing identity without leaking business responsibilities into the presentation layer. This design scales cleanly as Strus grows while preserving clear aggregate ownership and separation of concerns.