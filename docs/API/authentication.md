# Authentication Module

## Purpose

Provides:

* User Registration
* Email Verification
* Login
* Session Management
* Token Management
* Password Management
* Password Recovery
* OAuth Authentication

The Authentication module is responsible for **identity and access management**.

It creates and manages **User** accounts, authentication sessions, devices, and tokens.

It **does not create or manage user profiles**. Profile creation and management belong to the User module.

---

# Authentication Architecture

```text
Client
   │
   ▼
Access Token (15 min)
   │
   ▼
Authentication Middleware
   │
   ▼
Session Validation
   │
   ▼
Protected APIs

Refresh Token (30 days)
   │
   ▼
Refresh API
   │
   ▼
New Access + Refresh Tokens
```

---

# Authentication Components

| Component         | Purpose                                  |
| ----------------- | ---------------------------------------- |
| JWT Access Token  | API Authentication                       |
| JWT Refresh Token | Session Renewal                          |
| Reset Token       | Password Reset                           |
| Redis             | Registration & Password Recovery Cache   |
| PostgreSQL        | Permanent User, Device & Session Storage |
| SMTP              | Verification & Security Emails           |

---

# Authentication Response Format

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

| Code                  | HTTP |
| --------------------- | ---- |
| INVALID_REQUEST       | 400  |
| INVALID_TOKEN         | 400  |
| TOKEN_EXPIRED         | 401  |
| INVALID_CREDENTIALS   | 401  |
| SESSION_REVOKED       | 401  |
| USER_NOT_FOUND        | 404  |
| SESSION_NOT_FOUND     | 404  |
| EMAIL_ALREADY_EXISTS  | 409  |
| RATE_LIMITED          | 429  |
| INTERNAL_SERVER_ERROR | 500  |
| PASSWORD_NOT_SET      | 401  |
| INVALID_GOOGLE_TOKEN  | 401  |

---

# Authentication Headers

### Protected APIs

```text
Authorization: Bearer <access_token>
```

### JSON APIs

```text
Content-Type: application/json
```

---

# Token Expiry

| Token                | Expiry           |
| -------------------- | ---------------- |
| Access Token         | 15 Minutes       |
| Refresh Token        | 30 Days          |
| Registration OTP     | 1 Hour           |
| Forgot Password OTP  | 10 Minutes       |
| Reset Password Token | Configurable JWT |

---

# Registration APIs

## POST /api/v1/auth/register

### Purpose

Start account registration.

Store a temporary registration session in Redis.

Generate and send an email verification OTP.

### Authentication

No

### Request

```json
{
    "email": "user@example.com",
    "password": "Password@123"
}
```

### Validation

| Field    | Rule            |
| -------- | --------------- |
| email    | Valid Email     |
| password | Password Policy |

### Success

**HTTP**

```text
201 Created
```

**Response**

```json
{
    "success": true,
    "message": "Verification code sent successfully."
}
```

### Errors

| Scenario             | Response                 |
| -------------------- | ------------------------ |
| Invalid Input        | 400 INVALID_REQUEST      |
| Email Already Exists | 409 EMAIL_ALREADY_EXISTS |
| Cooldown Active      | 429 RATE_LIMITED         |

### Business Rules

* Email normalized to lowercase.
* Password hashed using bcrypt.
* Registration OTP generated.
* OTP hashed before storage.
* Registration session stored in Redis.
* Registration expiry initialized.
* Retry cooldown initialized.
* Verification email sent.

### Database Changes

None

### Redis Changes

Creates Registration Session containing:

* Email
* Password Hash
* OTP Hash
* Attempt Count
* Resend Count
* Expiry
* Retry Timestamp

### Emails

Verification OTP

### Side Effects

None

---

# POST /api/v1/auth/verify-email

## Purpose

Verify the registration OTP.

Create the permanent user account.

Create an authenticated session.

Issue Access Token and Refresh Token.

### Authentication

No

### Request

```json
{
    "email": "user@example.com",
    "otp": "123456",
    "deviceIdentifier": "macbook-air",
    "deviceName": "MacBook Air",
    "platform": "MACOS",
    "browser": "Chrome",
    "operatingSystem": "macOS"
}
```

### Validation

| Field            | Rule     |
| ---------------- | -------- |
| email            | Required |
| otp              | Required |
| deviceIdentifier | Required |
| platform         | Required |

### Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "message": "Email verified successfully.",
    "data": {
        "accessToken": "...",
        "refreshToken": "...",
        "expiresIn": 900,
        "profileCompleted": false
    }
}
```

### Errors

| Scenario                  | Response                 |
| ------------------------- | ------------------------ |
| Invalid OTP               | 400 INVALID_TOKEN        |
| OTP Expired               | 400 INVALID_TOKEN        |
| Maximum Attempts Exceeded | 400 INVALID_TOKEN        |
| Email Already Registered  | 409 EMAIL_ALREADY_EXISTS |

### Business Rules

* Registration session loaded from Redis.
* OTP hash verified.
* Attempt count validated.
* Registration session deleted.
* Permanent User created.
* `profileCompleted` initialized to `false`.
* Device located or created.
* Authenticated session created.
* Access Token generated.
* Refresh Token generated.
* Refresh Token hashed before persistence.
* User `lastLoginAt` updated.

### Database Changes

Creates

* User
* Device (if required)
* Session

Initializes

* User.profileCompleted = false

Updates

* User.lastLoginAt

### Redis Changes

Deletes Registration Session.

### Emails

None

---

# POST /api/v1/auth/resend-otp

## Purpose

Generate a new registration OTP.

### Authentication

No

### Request

```json
{
    "email": "user@example.com"
}
```

### Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "message": "Verification code sent successfully."
}
```

### Errors

| Scenario                     | Response          |
| ---------------------------- | ----------------- |
| Registration Session Expired | 400 INVALID_TOKEN |
| Cooldown Active              | 429 RATE_LIMITED  |

### Business Rules

* Retry cooldown validated.
* New OTP generated.
* Previous OTP invalidated.
* Attempt counter reset.
* Resend counter incremented.
* Next retry timestamp updated.

### Database Changes

None

### Redis Changes

Updates

* OTP Hash
* Attempt Count
* Resend Count
* Retry Timestamp

### Emails

Verification OTP

---

# Registration Flow

```text
Register
    │
    ▼
Registration Session Created (Redis)
    │
    ▼
Verification OTP Sent
    │
    ▼
Verify Email
    │
    ▼
OTP Verified
    │
    ▼
Create User
(profileCompleted = false)
    │
    ▼
Create Device
    │
    ▼
Create Session
    │
    ▼
Generate Access Token
    │
    ▼
Generate Refresh Token
    │
    ▼
Delete Registration Session (Redis)
    │
    ▼
Return Authentication Response
```

#######################################################################
# Login APIs

## POST /api/v1/auth/login

### Purpose

Authenticate an existing user.

Create an authenticated session.

Issue Access Token and Refresh Token.

Return the current profile completion status.

### Authentication

No

### Request

```json
{
    "email": "user@example.com",
    "password": "Password@123",
    "deviceIdentifier": "macbook-air",
    "deviceName": "MacBook Air",
    "platform": "MACOS",
    "browser": "Chrome",
    "operatingSystem": "macOS"
}
```

### Validation

| Field            | Rule        |
| ---------------- | ----------- |
| email            | Valid Email |
| password         | Required    |
| deviceIdentifier | Required    |
| platform         | Required    |

### Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "message": "Login successful.",
    "data": {
        "accessToken": "...",
        "refreshToken": "...",
        "expiresIn": 900,
        "profileCompleted": false
    }
}
```

### Errors

| Scenario            | Response                |
| ------------------- | ----------------------- |
| Invalid Credentials | 401 INVALID_CREDENTIALS |
| Password Not Set    | 401 PASSWORD_NOT_SET    |
| Validation Failure  | 400 INVALID_REQUEST     |

### Business Rules

* Email normalized to lowercase.
* User located.
* If user does not exist → `INVALID_CREDENTIALS`.
* If `passwordHash` is `NULL` → `PASSWORD_NOT_SET`.
* Password verified using bcrypt.
* Existing device reused when available.
* New device created if required.
* `Device.lastSeenAt` updated.
* Authenticated session created.
* Access Token generated.
* Refresh Token generated.
* Refresh Token hashed before persistence.
* `User.lastLoginAt` updated.
* Current `profileCompleted` status returned in the authentication response.

---

## Google Account Password Policy

Accounts created using Google Sign-In do not initially have a password.

Email/password login returns

```text
401 PASSWORD_NOT_SET
```

The user must either:

* Continue with Google Sign-In

or

* Use Forgot Password to create the first password.

---

# POST /api/v1/auth/refresh-token

## Purpose

Issue a new Access Token.

Rotate the Refresh Token.

### Authentication

No

Uses Refresh Token.

### Request

```json
{
    "refreshToken": "..."
}
```

### Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "message": "Token refreshed successfully.",
    "data": {
        "accessToken": "...",
        "refreshToken": "...",
        "expiresIn": 900
    }
}
```

### Errors

| Scenario              | Response            |
| --------------------- | ------------------- |
| Invalid Refresh Token | 401 INVALID_TOKEN   |
| Session Revoked       | 401 SESSION_REVOKED |
| Session Expired       | 401 INVALID_TOKEN   |

### Business Rules

* Refresh JWT verified.
* Refresh Token hashed.
* Session located.
* Stored hash matched.
* Session status verified.
* New Access Token generated.
* New Refresh Token generated.
* Refresh Token rotated.
* Previous Refresh Token invalidated.
* Session updated.

### Database Changes

Updates

* Session.refreshTokenHash
* Session.expiresAt
* Session.lastActivityAt

### Redis

None

### Emails

None

---

# POST /api/v1/auth/logout

## Purpose

Logout the current authenticated session.

### Authentication

Access Token

### Request

```text
None
```

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Logged out successfully."
}
```

### Errors

| Scenario        | Response            |
| --------------- | ------------------- |
| Session Revoked | 401 SESSION_REVOKED |
| Invalid Token   | 401 INVALID_TOKEN   |

### Business Rules

* Current session revoked.
* Access Token becomes unusable.
* Refresh Token becomes unusable.

### Database Changes

Updates

Session

```text
status = REVOKED
revokedAt = NOW()
```

---

# POST /api/v1/auth/logout-all

## Purpose

Logout every authenticated session belonging to the current user.

### Authentication

Access Token

### Request

```text
None
```

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Logged out from all devices."
}
```

### Errors

| Scenario        | Response            |
| --------------- | ------------------- |
| Invalid Token   | 401 INVALID_TOKEN   |
| Session Revoked | 401 SESSION_REVOKED |

### Business Rules

* Every ACTIVE session revoked.
* Current session revoked.
* Every Refresh Token invalidated.

### Database Changes

Updates

All Sessions

```text
status = REVOKED
revokedAt = NOW()
```

---

# GET /api/v1/auth/me

## Purpose

Return the currently authenticated user identity.

### Authentication

Access Token

### Request

```text
None
```

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
        "sessionId": "...",
        "deviceId": "...",
        "email": "user@example.com",
        "profileCompleted": false
    }
}
```

### Errors

| Scenario        | Response            |
| --------------- | ------------------- |
| Invalid Token   | 401 INVALID_TOKEN   |
| Token Expired   | 401 TOKEN_EXPIRED   |
| Session Revoked | 401 SESSION_REVOKED |

### Business Rules

#### Authentication Middleware

* Verify JWT signature.
* Verify JWT expiry.
* Find authenticated session.
* Verify session is ACTIVE.
* Load authenticated user.
* Update `Session.lastActivityAt`.
* Attach authenticated user to `req.user`.

Attached fields:

* id
* email
* sessionId
* deviceId
* profileCompleted

#### Controller

Return the authenticated identity.

### Database Changes

Updates

* Session.lastActivityAt

---

# Access Token

## Purpose

Authenticate protected API requests.

### Contains

* userId
* sessionId
* deviceId
* iat
* exp

### Lifetime

15 Minutes

### Stored

Client Only

---

# Refresh Token

## Purpose

Issue new Access Tokens.

Rotate authenticated sessions.

### Contains

* userId
* sessionId
* deviceId
* iat
* exp

### Lifetime

30 Days

### Stored

* Client
* Database (SHA-256 Hash)

---

# Authentication Middleware

Every Protected API

```text
Authorization Header
        │
        ▼
Verify JWT
        │
        ▼
Expired?
        │
   Yes ─────► TOKEN_EXPIRED
        │
        ▼
Invalid?
        │
   Yes ─────► INVALID_TOKEN
        │
        ▼
Find Session
        │
        ▼
Session Exists?
        │
   No ─────► SESSION_REVOKED
        │
        ▼
ACTIVE?
        │
   No ─────► SESSION_REVOKED
        │
        ▼
Load User
        │
        ▼
User ACTIVE?
        │
   No ─────► FORBIDDEN
        │
        ▼
Update lastActivityAt
        │
        ▼
Attach req.user
(id, email, sessionId,
deviceId, profileCompleted)
        │
        ▼
Continue Request
```

---

# Login Flow

```text
Client
    │
    ▼
POST Login
    │
    ▼
Normalize Email
    │
    ▼
Verify Password
    │
    ▼
Find / Create Device
    │
    ▼
Create Session
    │
    ▼
Generate Access Token
    │
    ▼
Generate Refresh Token
    │
    ▼
Hash Refresh Token
    │
    ▼
Persist Session
    │
    ▼
Read profileCompleted
    │
    ▼
Return Authentication Response
```

---

# Refresh Flow

```text
Refresh Token
      │
      ▼
Verify JWT
      │
      ▼
Hash Token
      │
      ▼
Find Session
      │
      ▼
Session ACTIVE
      │
      ▼
Rotate Refresh Token
      │
      ▼
Generate New Access Token
      │
      ▼
Update Database
      │
      ▼
Return New Tokens
```

---

# Logout Flow

```text
Access Token
      │
      ▼
Authenticate
      │
      ▼
Find Session
      │
      ▼
Revoke Session
      │
      ▼
Access Token Invalid
      │
      ▼
Refresh Token Invalid
```

#######################################################################
# Session Management

## Purpose

Allow authenticated users to:

* View active sessions.
* Identify the current device.
* Logout one device.
* Logout all other devices.

---

# Session Model

Each successful authentication creates a new Session.

Each Session belongs to:

* One User
* One Device

Relationship

```text
User
 │
 ├── Device (MacBook)
 │      │
 │      ├── Session
 │      ├── Session
 │
 ├── Device (iPhone)
 │      │
 │      ├── Session
 │
 ├── Device (Windows)
        │
        ├── Session
```

---

# Session States

| Status  | Description                               |
| ------- | ----------------------------------------- |
| ACTIVE  | Session can authenticate requests.        |
| REVOKED | Session has been permanently invalidated. |

---

# GET /api/v1/auth/sessions

## Purpose

Return every ACTIVE session belonging to the authenticated user.

### Authentication

Access Token

### Request

None

### Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "...",
        "deviceIdentifier": "macbook-air",
        "deviceName": "MacBook Air",
        "platform": "MACOS",
        "browser": "Chrome",
        "operatingSystem": "macOS",
        "createdAt": "...",
        "lastActivityAt": "...",
        "expiresAt": "...",
        "isCurrent": true
      }
    ]
  }
}
```

### Response Fields

| Field            | Description                                 |
| ---------------- | ------------------------------------------- |
| id               | Session ID                                  |
| deviceIdentifier | Stable device identifier                    |
| deviceName       | Friendly device name                        |
| platform         | Device platform                             |
| browser          | Browser name                                |
| operatingSystem  | Operating System                            |
| createdAt        | Session creation timestamp                  |
| lastActivityAt   | Last authenticated request                  |
| expiresAt        | Refresh Token expiry                        |
| isCurrent        | Indicates the current authenticated session |

### Errors

| Scenario        | Response            |
| --------------- | ------------------- |
| Invalid Token   | 401 INVALID_TOKEN   |
| Token Expired   | 401 TOKEN_EXPIRED   |
| Session Revoked | 401 SESSION_REVOKED |

### Business Rules

* Only ACTIVE sessions are returned.
* Sessions are sorted by `lastActivityAt DESC`.
* Current authenticated session identified.
* Device metadata included.

### Database

Read

* Session
* Device

### Redis

None

### Emails

None

---

# DELETE /api/v1/auth/sessions/:sessionId

## Purpose

Logout one specific authenticated session.

### Authentication

Access Token

### Request

Path Parameter

```text
sessionId
```

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Session logged out successfully."
}
```

### Errors

| Scenario          | Response              |
| ----------------- | --------------------- |
| Invalid Token     | 401 INVALID_TOKEN     |
| Token Expired     | 401 TOKEN_EXPIRED     |
| Session Revoked   | 401 SESSION_REVOKED   |
| Session Not Found | 404 SESSION_NOT_FOUND |

### Business Rules

* Session must belong to the authenticated user.
* Session must be ACTIVE.
* Session status becomes REVOKED.
* `revokedAt` updated.
* Refresh Token invalidated.
* Access Token becomes unusable on the next authenticated request.

### Database

Updates

```text
Session.status

ACTIVE

↓

REVOKED
```

---

# DELETE /api/v1/auth/sessions/others

## Purpose

Logout every authenticated session except the current session.

### Authentication

Access Token

### Request

None

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Logged out from all other devices."
}
```

### Errors

| Scenario        | Response            |
| --------------- | ------------------- |
| Invalid Token   | 401 INVALID_TOKEN   |
| Token Expired   | 401 TOKEN_EXPIRED   |
| Session Revoked | 401 SESSION_REVOKED |

### Business Rules

* Current session preserved.
* Every other ACTIVE session revoked.
* Every other Refresh Token invalidated.
* Current Access Token remains valid.

### Database

Updates

All ACTIVE Sessions

```text
WHERE id != currentSessionId
```

---

# Session Lifecycle

```text
Login
   │
   ▼
Session Created
   │
   ▼
ACTIVE
   │
   ▼
Authenticated Requests
   │
   ▼
lastActivityAt Updated
   │
   ▼
Logout
Logout Device
Logout Others
Logout All
Password Reset
   │
   ▼
REVOKED
   │
   ▼
Requires New Login
```

---

# Session Revocation

A revoked session:

* Cannot authenticate protected APIs.
* Cannot refresh tokens.
* Cannot become ACTIVE again.
* Requires a new login.

---

# lastActivityAt

Updated on:

* Protected API requests.
* Refresh Token rotation.

Not updated on:

* Login (initialized during session creation).
* Logout.
* Password Reset.

---

# Device Information

Each session references exactly one Device.

| Field            | Description                             |
| ---------------- | --------------------------------------- |
| deviceIdentifier | Stable client identifier                |
| deviceName       | Friendly device name                    |
| platform         | WINDOWS / MACOS / IOS / ANDROID / LINUX |
| browser          | Browser name                            |
| operatingSystem  | Operating System                        |
| lastSeenAt       | Last successful login                   |

---

# Session Security

### Refresh Token

* Stored as a SHA-256 hash.
* Never stored in plaintext.

### Access Token

* Stateless JWT.
* Valid only while the associated session is ACTIVE.

---

# Session Validation

Every protected request performs:

```text
Verify JWT Signature
        │
        ▼
Verify JWT Expiry
        │
        ▼
Find Session
        │
        ▼
Session Exists
        │
        ▼
Session ACTIVE
        │
        ▼
Load User
        │
        ▼
User ACTIVE
        │
        ▼
Continue Request
```

---

# Session Ownership

Users may revoke only:

* Their own sessions.

Users cannot revoke:

* Another user's session.
* Unknown sessions.
* Already revoked sessions.

---

# Session Effects Matrix

| Action          | Current Session          | Other Sessions |
| --------------- | ------------------------ | -------------- |
| Login           | New Session              | No Change      |
| Logout          | Revoked                  | No Change      |
| Logout Device   | Selected Session Revoked | No Change      |
| Logout Others   | Active                   | Revoked        |
| Logout All      | Revoked                  | Revoked        |
| Change Password | Active                   | Revoked        |
| Reset Password  | Revoked                  | Revoked        |

---

# Session Database Flow

```text
Login
   │
   ▼
Create Session
   │
   ▼
ACTIVE
   │
   ▼
Protected API
   │
   ▼
Update lastActivityAt
   │
   ▼
Logout / Password Reset
   │
   ▼
REVOKED
```

---

# Session Repository Responsibilities

| Method                       | Purpose                   |
| ---------------------------- | ------------------------- |
| create()                     | Create Session            |
| findById()                   | Find Session              |
| findActiveById()             | Active Session Lookup     |
| findByRefreshTokenHash()     | Refresh Authentication    |
| updateLastActivity()         | Update Activity Timestamp |
| updateRefreshToken()         | Refresh Token Rotation    |
| revoke()                     | Logout Current Session    |
| revokeSession()              | Logout Specific Device    |
| revokeOtherSessions()        | Logout Other Devices      |
| revokeAllSessions()          | Logout Every Device       |
| findActiveSessionsByUserId() | Active Session Listing    |

#######################################################################
# Password Management

## Purpose

Allow authenticated users to:

* Change their password.
* Recover account access.
* Secure an account after compromise.
* Revoke compromised sessions.

---

# PATCH /api/v1/auth/password

## Purpose

Change the authenticated user's password.

The current session remains active.

Every other authenticated session is revoked.

A security notification email is sent.

### Authentication

Access Token

### Request

```json
{
    "currentPassword": "Password@123",
    "newPassword": "Password@456"
}
```

### Validation

| Field           | Rule            |
| --------------- | --------------- |
| currentPassword | Required        |
| newPassword     | Password Policy |

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Password changed successfully."
}
```

### Errors

| Scenario                   | Response                |
| -------------------------- | ----------------------- |
| Invalid Token              | 401 INVALID_TOKEN       |
| Token Expired              | 401 TOKEN_EXPIRED       |
| Session Revoked            | 401 SESSION_REVOKED     |
| User Not Found             | 404 USER_NOT_FOUND      |
| Incorrect Current Password | 401 INVALID_CREDENTIALS |

### Business Rules

* Authenticated user loaded.
* Current password verified using bcrypt.
* New password hashed using bcrypt.
* Password updated.
* Current session preserved.
* Every other ACTIVE session revoked.
* Password change notification email sent.

### Database Changes

Updates

* User.passwordHash

Updates

All ACTIVE Sessions

```text
ACTIVE

↓

REVOKED

WHERE id != currentSessionId
```

### Redis

None

### Emails

Password Changed Notification

---

# Forgot Password

## Purpose

Recover an account without authentication using email verification.

---

# Password Recovery Flow

```text
Forgot Password
      │
      ▼
Generate OTP
      │
      ▼
Create Redis Session
      │
      ▼
Send OTP Email
      │
      ▼
Verify OTP
      │
      ▼
Issue Reset Token
      │
      ▼
Reset Password
      │
      ▼
Delete Redis Session
      │
      ▼
Revoke All Sessions
      │
      ▼
Send Security Email
```

---

# POST /api/v1/auth/forgot-password

## Purpose

Generate a password recovery OTP.

### Authentication

No

### Request

```json
{
    "email": "user@example.com"
}
```

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "If an account exists, a verification code has been sent."
}
```

### Errors

| Scenario        | Response         |
| --------------- | ---------------- |
| Cooldown Active | 429 RATE_LIMITED |

### Business Rules

* Email normalized.
* User lookup performed.
* Email existence never disclosed.
* Existing Redis recovery session reused when available.
* Retry cooldown validated.
* New OTP generated.
* OTP hashed.
* Recovery session updated.
* Verification email sent.

### Database

None

### Redis

Creates or Updates

* email
* otpHash
* attempts
* resendCount
* expiresAt
* nextRetryAt

### Emails

Forgot Password OTP

### Security

Always returns success regardless of whether the account exists.

Prevents account enumeration.

---

# POST /api/v1/auth/verify-forgot-password

## Purpose

Verify the recovery OTP.

Issue a temporary Reset Token.

### Authentication

No

### Request

```json
{
    "email": "user@example.com",
    "otp": "123456"
}
```

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "data": {
        "resetToken": "..."
    }
}
```

### Errors

| Scenario                  | Response          |
| ------------------------- | ----------------- |
| Invalid OTP               | 400 INVALID_TOKEN |
| OTP Expired               | 400 INVALID_TOKEN |
| Maximum Attempts Exceeded | 400 INVALID_TOKEN |

### Business Rules

* Recovery session loaded from Redis.
* OTP verified.
* Failed attempt counter updated.
* Maximum attempts enforced.
* Reset JWT generated.
* Recovery session preserved until password reset completes.

### Database

None

### Redis

Updates

* attempts

Deletes

* Recovery Session (only after maximum attempts are exceeded)

### Emails

None

---

# POST /api/v1/auth/reset-password

## Purpose

Complete password recovery.

### Authentication

No

Uses Reset Token.

### Request

```json
{
    "resetToken": "...",
    "newPassword": "Password@789"
}
```

### Success

**HTTP**

```text
200 OK
```

```json
{
    "success": true,
    "message": "Password reset successfully."
}
```

### Errors

| Scenario            | Response           |
| ------------------- | ------------------ |
| Invalid Reset Token | 400 INVALID_TOKEN  |
| Expired Reset Token | 401 TOKEN_EXPIRED  |
| User Not Found      | 404 USER_NOT_FOUND |

### Business Rules

* Reset JWT verified.
* User loaded.
* Password may already exist or be created for the first time.
* Google Sign-In accounts become eligible for email/password login after password creation.
* Password hashed using bcrypt.
* Password updated.
* Every ACTIVE session revoked.
* Forgot Password Redis session deleted.
* Password Reset confirmation email sent.

### Database Changes

Updates

* User.passwordHash

Updates

All ACTIVE Sessions

```text
ACTIVE

↓

REVOKED
```

### Redis

Deletes

* Forgot Password Recovery Session

### Emails

Password Reset Successful

---

# Forgot Password Cache

## Stored Fields

| Field       | Purpose                 |
| ----------- | ----------------------- |
| email       | Account                 |
| otpHash     | SHA-256 OTP             |
| attempts    | Failed Attempts         |
| resendCount | Cooldown Calculation    |
| nextRetryAt | Resend Control          |
| expiresAt   | Recovery Session Expiry |

---

# OTP Rules

| Property            | Value      |
| ------------------- | ---------- |
| Length              | 6 Digits   |
| Hash Algorithm      | SHA-256    |
| Registration TTL    | 1 Hour     |
| Forgot Password TTL | 10 Minutes |
| Maximum Attempts    | 5          |
| Storage             | Redis Only |

---

# Retry Policy

| Resend | Wait       |
| ------ | ---------- |
| 1      | 1 Minute   |
| 2      | 2 Minutes  |
| 3      | 4 Minutes  |
| 4      | 8 Minutes  |
| 5      | 15 Minutes |
| 6+     | 30 Minutes |

---

# Password Security

### Passwords

* bcrypt hashed.
* Plaintext never stored.

### Reset Tokens

* JWT.
* Short-lived.
* Single recovery flow.

### OTP

* Cryptographically random.
* SHA-256 hashed.
* Stored only in Redis.

---

# Password Operations Matrix

| Action          | Password          | Current Session | Other Sessions | Email                     |
| --------------- | ----------------- | --------------- | -------------- | ------------------------- |
| Change Password | Updated           | Active          | Revoked        | Password Changed          |
| Forgot Password | No Change         | No Change       | No Change      | Forgot Password OTP       |
| Verify OTP      | No Change         | No Change       | No Change      | None                      |
| Reset Password  | Updated / Created | Revoked         | Revoked        | Password Reset Successful |

---

# Password Repository Responsibilities

| Method           | Purpose                     |
| ---------------- | --------------------------- |
| updatePassword() | Update bcrypt password hash |

---

# Forgot Password Cache Responsibilities

| Method   | Purpose                 |
| -------- | ----------------------- |
| save()   | Create recovery session |
| get()    | Load recovery session   |
| update() | Update recovery state   |
| delete() | Delete recovery session |

---

# Password Email Responsibilities

| Email                     | Trigger                       |
| ------------------------- | ----------------------------- |
| Password Changed          | Authenticated password change |
| Forgot Password OTP       | Forgot password request       |
| Password Reset Successful | Password recovery completed   |

---

# Password Recovery State Machine

```text
Forgot Password
      │
      ▼
OTP Generated
      │
      ▼
Recovery Session Created
      │
      ▼
OTP Verified
      │
      ▼
Reset Token Issued
      │
      ▼
Password Updated
      │
      ▼
All Sessions Revoked
      │
      ▼
Recovery Session Deleted
      │
      ▼
Security Email Sent
```

#######################################################################
# Google OAuth Authentication

## Purpose

Allow users to authenticate using their Google account.

Supports:

* First-time registration using Google.
* Login using an existing Google account.
* Linking Google to an existing email/password account.
* Creating a password later using Forgot Password.

Authentication creates **only the User account**.

User profile creation is handled separately by the User module after authentication.

---

# Endpoint

## POST /api/v1/auth/google

### Authentication

No

### Request

```json
{
    "idToken": "GOOGLE_ID_TOKEN",
    "deviceIdentifier": "macbook-air",
    "deviceName": "MacBook Air",
    "platform": "MACOS",
    "browser": "Chrome",
    "operatingSystem": "macOS"
}
```

---

## Success

**HTTP**

```text
200 OK
```

**Response**

```json
{
    "success": true,
    "message": "Google login successful.",
    "data": {
        "accessToken": "...",
        "refreshToken": "...",
        "expiresIn": 900,
        "profileCompleted": false
    }
}
```

---

## Errors

| Scenario             | Response                 |
| -------------------- | ------------------------ |
| Invalid Google Token | 401 INVALID_GOOGLE_TOKEN |
| Validation Failure   | 400 INVALID_REQUEST      |

---

# Business Rules

* Google ID Token verified.
* Google account searched.

If a linked Google account exists

↓

* Create authenticated session.

Otherwise

↓

Search existing email.

If email exists

↓

* Link Google account.
* Create authenticated session.

Otherwise

↓

* Create User.
* Initialize `profileCompleted = false`.
* Create OAuthAccount.
* Create authenticated session.

Finally

* Access Token generated.
* Refresh Token generated.
* Refresh Token hashed before persistence.
* User.lastLoginAt updated.

---

# Database Changes

## Existing Google User

Creates

* Session

Updates

* Device.lastSeenAt
* User.lastLoginAt

---

## Existing Email User

Creates

* OAuthAccount
* Session

Updates

* Device.lastSeenAt
* User.lastLoginAt

---

## New Google User

Creates

* User
* OAuthAccount
* Session

Initializes

* User.profileCompleted = false

Updates

* Device.lastSeenAt
* User.lastLoginAt

---

# Redis

None

---

# Emails

None

---

# Account Linking Rules

Google account already linked

↓

Login existing account.

---

Existing email/password account

↓

Link Google account.

↓

Do **not** create a duplicate User.

---

Brand new Google account

↓

Create User.

↓

Initialize `profileCompleted = false`.

↓

Create OAuthAccount.

↓

Create authenticated session.

---

# Google Account Password Policy

New Google accounts do not initially have a password.

Attempting email/password login returns

```text
401 PASSWORD_NOT_SET
```

The user must either:

* Continue using Google Sign-In.

or

* Use Forgot Password to create the first password.

After creating a password, email/password login becomes available.

---

# Google Authentication Flow

```text
Frontend
      │
      ▼
Google Identity Services
      │
      ▼
Google ID Token
      │
      ▼
POST /api/v1/auth/google
      │
      ▼
Verify Google Token
      │
      ▼
Existing OAuth Account?
      │
 Yes ─────────────────────────► Create Session
      │
      ▼
 No
      │
      ▼
Find User By Email
      │
      ▼
User Exists?
      │
 Yes ─────────────────────────► Link Google Account
      │                             │
      │                             ▼
      │                      Create Session
      │
      ▼
 No
      │
      ▼
Create User
(profileCompleted = false)
      │
      ▼
Create OAuthAccount
      │
      ▼
Create Session
      │
      ▼
Generate Access Token
      │
      ▼
Generate Refresh Token
      │
      ▼
Return Authentication Response
```

---

# Authentication Response

For both existing and newly created Google accounts:

```json
{
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "profileCompleted": false
}
```

For existing users who have already completed onboarding:

```json
{
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "profileCompleted": true
}
```

The frontend should use `profileCompleted` to determine whether the user should be redirected to the onboarding flow or directly to the application dashboard.

---

# Google OAuth Status

| Component              | Status     |
| ---------------------- | ---------- |
| Backend Implementation | ✅ Complete |
| Frontend Integration   | Pending    |
| End-to-End Testing     | Pending    |
