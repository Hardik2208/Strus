Authentication Module
Purpose

Provides:

User Registration
Email Verification
Login
Session Management
Token Management
Password Management
Password Recovery
OAuth Authentication (Upcoming)
Authentication Architecture
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
Authentication Components
Component	Purpose
JWT Access Token	API Authentication
JWT Refresh Token	Session Renewal
Reset Token	Password Reset
Redis	Registration & Password Recovery Cache
PostgreSQL	Permanent User, Device & Session Storage
SMTP	Verification & Security Emails
Authentication Response Format
Success
{
  "success": true,
  "message": "...",
  "data": {}
}
Failure
{
  "success": false,
  "message": "...",
  "code": "ERROR_CODE"
}
Common Error Codes
Code	HTTP
INVALID_REQUEST	400
INVALID_TOKEN	400
TOKEN_EXPIRED	401
INVALID_CREDENTIALS	401
SESSION_REVOKED	401
USER_NOT_FOUND	404
SESSION_NOT_FOUND	404
EMAIL_ALREADY_EXISTS	409
RATE_LIMITED	429
INTERNAL_SERVER_ERROR	500
PASSWORD_NOT_SET    401
INVALID_GOOGLE_TOKEN    401
Authentication Headers

Protected APIs

Authorization: Bearer <access_token>

JSON APIs

Content-Type: application/json
Token Expiry
Token	Expiry
Access Token	15 Minutes
Refresh Token	30 Days
Registration OTP	1 Hour
Forgot Password OTP	10 Minutes
Reset Password Token	Configurable JWT
Registration APIs
POST /api/v1/auth/register
Purpose

Start account registration.

Stores registration session in Redis.

Sends verification OTP.

Authentication

No

Request
{
    "firstName": "Hardik",
    "lastName": "Raghuvanshi",
    "email": "user@example.com",
    "password": "Password@123"
}
Validation
Field	Rule
firstName	Required
lastName	Required
email	Valid Email
password	Password Policy
Success

HTTP

201 Created

Response

{
    "success": true,
    "message": "Verification code sent successfully."
}
Errors
Invalid Input
400 INVALID_REQUEST
Email Already Exists
409 EMAIL_ALREADY_EXISTS
Cooldown Active
429 RATE_LIMITED
Business Rules
Email converted to lowercase
Password hashed using bcrypt
OTP generated
OTP hashed
Registration session stored in Redis
Registration expiry initialized
Retry cooldown initialized
Verification email sent
Database Changes

None

Redis Changes

Creates Registration Session

Contains

Email
Password Hash
OTP Hash
Attempt Count
Resend Count
Expiry
Retry Timestamp
Emails

Verification OTP

Side Effects

None

POST /api/v1/auth/verify-email
Purpose

Verify registration OTP.

Creates permanent user.

Authentication

No

Request
{
    "email":"user@example.com",
    "otp":"123456"
}
Validation

OTP required

Email required

Success

HTTP

201 Created
{
    "success": true,
    "message":"Registration successful."
}
Errors
Invalid OTP
400 INVALID_TOKEN
OTP Expired
400 INVALID_TOKEN
Maximum Attempts
400 INVALID_TOKEN
Email Already Registered
409 EMAIL_ALREADY_EXISTS
Business Rules
Registration session loaded
OTP hash verified
Attempt count updated
Registration session deleted
User created
Profile created
Default verification level assigned
Database Changes

Creates

User
UserProfile
Redis Changes

Deletes Registration Session

Emails

None

POST /api/v1/auth/resend-otp
Purpose

Generate new registration OTP.

Authentication

No

Request
{
    "email":"user@example.com"
}
Success
200 OK
{
    "success":true,
    "message":"Verification code sent successfully."
}
Errors
Registration Session Expired
400 INVALID_TOKEN
Cooldown Active
429 RATE_LIMITED
Business Rules
Retry cooldown validated
New OTP generated
Previous OTP invalidated
Attempt counter reset
Resend counter incremented
Next retry timestamp updated
Database Changes

None

Redis Changes

Updates

OTP Hash
Attempt Count
Resend Count
Retry Timestamp
Emails

Verification OTP

Registration Flow
Register
    │
    ▼
Redis Session Created
    │
    ▼
OTP Email Sent
    │
    ▼
Verify Email
    │
    ▼
OTP Verified
    │
    ▼
User Created
    │
    ▼
Redis Session Deleted

#######################################################################

Login APIs
POST /api/v1/auth/login
Purpose

Authenticate user.

Create authenticated session.

Issue Access Token and Refresh Token.

Authentication

No

Request
{
    "email":"user@example.com",
    "password":"Password@123",
    "deviceIdentifier":"macbook-air",
    "deviceName":"MacBook Air",
    "platform":"MACOS",
    "browser":"Chrome",
    "operatingSystem":"macOS"
}
Validation
Field	Rule
email	Valid Email
password	Required
deviceIdentifier	Required
platform	Required
Success

HTTP

200 OK

Response

{
    "success":true,
    "message":"Login successful.",
    "data":{
        "accessToken":"...",
        "refreshToken":"...",
        "expiresIn":900
    }
}
Errors
Invalid Credentials

401 INVALID_CREDENTIALS

Password Not Set

401 PASSWORD_NOT_SET
Validation Failure
400 INVALID_REQUEST

Business Rules

Email normalized

User located

If user does not exist

→ INVALID_CREDENTIALS

If passwordHash is NULL

→ PASSWORD_NOT_SET

Password verified using bcrypt

Existing device reused

New device created if required

Device.lastSeenAt updated

New Session created

Access Token generated

Refresh Token generated

Refresh Token hashed before persistence

User.lastLoginAt updated



Accounts created using Google Sign-In do not initially have a password.

Email/password login returns

401 PASSWORD_NOT_SET

User must either

Continue with Google Sign-In

or

Use Forgot Password to create the first password.


POST /api/v1/auth/refresh-token
Purpose

Issue new Access Token.

Rotate Refresh Token.

Authentication

No

Uses Refresh Token.

Request
{
    "refreshToken":"..."
}
Success
200 OK
{
    "success":true,
    "message":"Token refreshed.",
    "data":{
        "accessToken":"...",
        "refreshToken":"...",
        "expiresIn":900
    }
}
Errors
Invalid Refresh Token
401 INVALID_TOKEN
Session Revoked
401 SESSION_REVOKED
Session Expired
401 INVALID_TOKEN
Business Rules
JWT verified
Refresh Token hashed
Session located
Stored hash matched
Session status verified
New Access Token issued
New Refresh Token issued
Refresh Token rotated
Session updated
Previous Refresh Token invalidated
Database Changes

Updates

refreshTokenHash
expiresAt
lastActivityAt
Redis

None

Emails

None

POST /api/v1/auth/logout
Purpose

Logout current session.

Authentication

Access Token

Request

None

Success
200 OK
{
    "success":true,
    "message":"Logged out successfully."
}
Errors
Session Revoked
401 SESSION_REVOKED
Invalid Token
401 INVALID_TOKEN
Business Rules
Current Session revoked
Access Token unusable
Refresh Token unusable
Database Changes

Updates

Session

status = REVOKED
revokedAt = NOW
POST /api/v1/auth/logout-all
Purpose

Logout every device.

Authentication

Access Token

Request

None

Success
200 OK
{
    "success":true,
    "message":"Logged out from all devices."
}
Errors
Invalid Token
401 INVALID_TOKEN
Session Revoked
401 SESSION_REVOKED
Business Rules
Every ACTIVE session revoked
Current session revoked
Every Refresh Token invalidated
Database Changes

Updates

All Sessions

status = REVOKED
revokedAt = NOW
GET /api/v1/auth/me
Purpose

Return authenticated user.

Authentication

Access Token

Request

None

Success
200 OK
{
    "success":true,
    "data":{
        "id":"...",
        "sessionId":"...",
        "deviceId":"...",
        "email":"user@example.com"
    }
}
Errors
Invalid Token
401 INVALID_TOKEN
Token Expired
401 TOKEN_EXPIRED
Session Revoked
401 SESSION_REVOKED
Business Rules

Authentication Middleware

Verify JWT
Verify Signature
Verify Expiry
Find Session
Session ACTIVE
Update lastActivityAt
Attach user to Request

Controller

Return authenticated identity
Database Changes

Updates

Session.lastActivityAt
Access Token

Purpose

Authenticate API Requests

Contains

userId
sessionId
deviceId
iat
exp

Lifetime

15 Minutes

Stored

Client Only
Refresh Token

Purpose

Issue new Access Token

Contains

userId
sessionId
deviceId
iat
exp

Lifetime

30 Days

Stored

Client
Database (SHA256 Hash)
Authentication Middleware

Every Protected API

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
Update lastActivityAt
        │
        ▼
Attach req.user
        │
        ▼
Continue
Login Flow
Client
    │
    ▼
POST Login
    │
    ▼
Password Verification
    │
    ▼
Device Lookup
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
Return Tokens
Refresh Flow
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
Logout Flow
Access Token
      │
      ▼
Authenticate
      │
      ▼
Find Session
      │
      ▼
REVOKED
      │
      ▼
Access Invalid
Refresh Invalid

This completes Part 2. The next part should document Session Management APIs (/sessions, logout one session, logout other sessions), including device metadata, session lifecycle, and revocation behavior.

Voice chat ended

#######################################################################

Session Management
Purpose

Allow authenticated users to:

View active sessions
Identify current device
Logout one device
Logout all other devices
Session Model

Each successful login creates a new Session.

Each Session belongs to:

One User
One Device

Relationship

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
Session States
Status	Description
ACTIVE	Session can authenticate requests
REVOKED	Session permanently invalid
GET /api/v1/auth/sessions
Purpose

Return all active sessions.

Authentication

Access Token

Request

None

Success

HTTP

200 OK

Response

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
Response Fields
Field	Description
id	Session ID
deviceIdentifier	Stable device identifier
deviceName	Friendly device name
platform	Device platform
browser	Browser name
operatingSystem	Operating System
createdAt	Session creation time
lastActivityAt	Last authenticated request
expiresAt	Refresh token expiry
isCurrent	Current authenticated session
Errors
Invalid Token
401 INVALID_TOKEN
Token Expired
401 TOKEN_EXPIRED
Session Revoked
401 SESSION_REVOKED
Business Rules
Only ACTIVE sessions returned
Sorted by lastActivityAt DESC
Current session identified
Device metadata included
Database

Read

Session
Device
Redis

None

Emails

None

DELETE /api/v1/auth/sessions/:sessionId
Purpose

Logout one specific session.

Authentication

Access Token

Request

Path Parameter

sessionId
Success

HTTP

200 OK
{
    "success": true,
    "message": "Session logged out successfully."
}
Errors
Invalid Token
401 INVALID_TOKEN
Token Expired
401 TOKEN_EXPIRED
Session Revoked
401 SESSION_REVOKED
Session Not Found
404 SESSION_NOT_FOUND
Business Rules
Session must belong to authenticated user
Session must be ACTIVE
Session status becomes REVOKED
revokedAt updated
Refresh Token invalidated
Access Token becomes unusable after next authenticated request
Database

Updates

Session.status

ACTIVE

↓

REVOKED
DELETE /api/v1/auth/sessions/others
Purpose

Logout every session except current session.

Authentication

Access Token

Request

None

Success

HTTP

200 OK
{
    "success": true,
    "message": "Logged out from all other devices."
}
Errors
Invalid Token
401 INVALID_TOKEN
Token Expired
401 TOKEN_EXPIRED
Session Revoked
401 SESSION_REVOKED
Business Rules
Current session preserved
Every other ACTIVE session revoked
Every other Refresh Token invalidated
Current Access Token remains valid
Database

Updates

All ACTIVE Sessions

WHERE

id != currentSessionId
Session Lifecycle
Login
   │
   ▼
Session Created
   │
   ▼
ACTIVE
   │
   │
Authenticated Request
   │
   ▼
lastActivityAt Updated
   │
   │
Logout
Logout Device
Logout Others
Logout All
Password Reset
   │
   ▼
REVOKED
Session Revocation

A revoked session:

Cannot refresh tokens
Cannot access protected APIs
Cannot become ACTIVE again
Requires new login
lastActivityAt

Updated on

Protected API request
Refresh Token

Not updated on

Login (initialized)
Logout
Password Reset
Device Information

Each session references one Device.

Stored fields

Field	Description
deviceIdentifier	Stable client identifier
deviceName	Friendly name
platform	WINDOWS / MACOS / IOS / ANDROID / LINUX
browser	Browser
operatingSystem	OS Version
lastSeenAt	Device last login
Session Security

Refresh Token

Stored hashed
Never stored plaintext

Access Token

Stateless JWT
Valid only while Session ACTIVE

Session Validation

Every protected request verifies

JWT Signature

↓

JWT Expiry

↓

Session Exists

↓

Session ACTIVE

↓

Continue
Session Ownership

Users may revoke only:

Their own sessions

Cannot revoke

Another user's session
Unknown session
Already revoked session
Session Effects Matrix
Action	Current Session	Other Sessions
Login	New Session	No Change
Logout	Revoked	No Change
Logout Device	Selected Session Revoked	No Change
Logout Others	Active	Revoked
Logout All	Revoked	Revoked
Change Password	Active	Revoked
Reset Password	Revoked	Revoked
Session Database Flow
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
Session Repository Responsibilities
Method	Purpose
create()	Create Session
findById()	Find Session
findActiveById()	Active Session Lookup
findByRefreshTokenHash()	Refresh Authentication
updateLastActivity()	Update Activity Timestamp
updateRefreshToken()	Refresh Rotation
revoke()	Logout Current Session
revokeSession()	Logout Specific Device
revokeOtherSessions()	Logout Other Devices
revokeAllSessions()	Logout Every Device
findActiveSessionsByUserId()	Active Session Listing

#######################################################################

Password Management
Purpose

Allow authenticated users to:

Change password
Secure account after compromise
Revoke old sessions
PATCH /api/v1/auth/password
Purpose

Change account password.

Current session remains active.

Every other session is revoked.

Security notification email sent.

Authentication

Access Token

Request
{
    "currentPassword":"Password@123",
    "newPassword":"Password@456"
}
Validation
Field	Rule
currentPassword	Required
newPassword	Password Policy
Success

HTTP

200 OK
{
    "success":true,
    "message":"Password changed successfully."
}
Errors
Invalid Token
401 INVALID_TOKEN
Token Expired
401 TOKEN_EXPIRED
Session Revoked
401 SESSION_REVOKED
User Not Found
404 USER_NOT_FOUND
Incorrect Current Password
401 INVALID_CREDENTIALS
Business Rules
User loaded
Current password verified
New password hashed
Password updated
Current session preserved
Every other ACTIVE session revoked
Password change email sent
Database Changes

Updates

User.passwordHash

Updates

Sessions

ACTIVE

↓

REVOKED

WHERE

id != currentSessionId
Redis

None

Emails

Password Changed Notification

Forgot Password
Purpose

Recover account without login.

Uses email verification.

Recovery Flow
Forgot Password
      │
      ▼
Generate OTP
      │
      ▼
Redis Session
      │
      ▼
Email OTP
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
Security Email
POST /api/v1/auth/forgot-password
Purpose

Generate password reset OTP.

Authentication

No

Request
{
    "email":"user@example.com"
}
Success
200 OK
{
    "success":true,
    "message":"If an account exists, a verification code has been sent."
}
Errors
Cooldown Active
429 RATE_LIMITED
Business Rules
Email normalized
User lookup
Email existence never disclosed
Existing Redis session reused
Cooldown validated
OTP generated
OTP hashed
Retry updated
Email sent
Database

None

Redis

Creates / Updates

email

otpHash

attempts

resendCount

expiresAt

nextRetryAt
Emails

Forgot Password OTP

Security

Always returns success even if user does not exist.

Prevents account enumeration.

POST /api/v1/auth/verify-forgot-password
Purpose

Verify OTP.

Issue temporary Reset Token.

Authentication

No

Request
{
    "email":"user@example.com",
    "otp":"123456"
}
Success
200 OK
{
    "success":true,
    "data":{
        "resetToken":"..."
    }
}
Errors
Invalid OTP
400 INVALID_TOKEN
OTP Expired
400 INVALID_TOKEN
Maximum Attempts
400 INVALID_TOKEN
Business Rules
Redis session loaded
OTP verified
Attempt count updated
Maximum attempts enforced
Reset JWT generated
Registration session preserved until reset completes
Database

None

Redis

Updates

attemptCount

Deletes

Session

only when attempts exceed limit
Emails

None

POST /api/v1/auth/reset-password
Purpose

Complete password reset.

Authentication

No

Uses Reset Token.

Request
{
    "resetToken":"...",
    "newPassword":"Password@789"
}
Success
200 OK
{
    "success":true,
    "message":"Password reset successfully."
}
Errors
Invalid Reset Token
400 INVALID_TOKEN
Expired Reset Token
401 TOKEN_EXPIRED
User Not Found
404 USER_NOT_FOUND
Business Rules
Reset JWT verified
User loaded

Password may already exist

OR

Password may be created for the first time.

Google Sign-In accounts become eligible for email/password login after password reset.
Password hashed
Password updated
All ACTIVE sessions revoked
Forgot password Redis session deleted
Password Reset email sent
Database Changes

Updates

User.passwordHash

Updates

Every ACTIVE Session

↓

REVOKED
Redis

Deletes

Forgot Password Session

Emails

Password Reset Successful

Forgot Password Cache

Stored Fields

Field	Purpose
email	Account
otpHash	SHA256 OTP
attempts	Failed Attempts
resendCount	Cooldown Calculation
nextRetryAt	Resend Control
expiresAt	Session Expiry
OTP Rules
Property	Value
Length	6 Digits
Hash Algorithm	SHA-256
Registration TTL	1 Hour
Forgot Password TTL	10 Minutes
Maximum Attempts	5
Storage	Redis Only
Retry Policy

Based on resend count.

Resend	Wait
1	1 Minute
2	2 Minutes
3	4 Minutes
4	8 Minutes
5	15 Minutes
6+	30 Minutes
Password Security

Passwords

bcrypt Hashed
Plaintext never stored

Reset Tokens

JWT
Short-lived
Single recovery flow

OTP

Random
SHA-256 Hashed
Redis only
| Action          | Password          | Current Session | Other Sessions | Email            |
| --------------- | ----------------- | --------------- | -------------- | ---------------- |
| Change Password | Updated           | Active          | Revoked        | Password Changed |
| Forgot Password | No Change         | No Change       | No Change      | OTP              |
| Verify OTP      | No Change         | No Change       | No Change      | None             |
| Reset Password  | Updated / Created | Revoked         | Revoked        | Password Reset   |

Password Repository Responsibilities
Method	Purpose
updatePassword()	Update bcrypt password hash
Forgot Password Cache Responsibilities
Method	Purpose
save()	Create recovery session
get()	Load recovery session
update()	Update OTP/session state
delete()	Remove recovery session
Password Email Responsibilities
Email	Trigger
Password Changed	Password changed while authenticated
Forgot Password OTP	Forgot password request
Password Reset Successful	Password reset completed
Password Recovery State Machine
Forgot Password
      │
      ▼
OTP Generated
      │
      ▼
Redis Session Created
      │
      ▼
OTP Verified
      │
      ▼
Reset JWT Issued
      │
      ▼
Password Updated
      │
      ▼
All Sessions Revoked
      │
      ▼
Redis Deleted
      │
      ▼
Security Email Sent


#######################################################################


Purpose

Allow users to authenticate using their Google account.

Supports:

First-time registration using Google.
Login using existing Google account.
Linking Google to an existing email/password account.
Creating a password later using Forgot Password.
Endpoint
POST /api/v1/auth/google

Authentication

No
Request
{
    "idToken":"GOOGLE_ID_TOKEN",
    "deviceIdentifier":"macbook-air",
    "deviceName":"MacBook Air",
    "platform":"MACOS",
    "browser":"Chrome",
    "operatingSystem":"macOS"
}
Success

HTTP

200 OK
{
    "success":true,
    "message":"Google login successful.",
    "data":{
        "accessToken":"...",
        "refreshToken":"...",
        "expiresIn":900
    }
}
Errors
Invalid Google Token

401 INVALID_GOOGLE_TOKEN

Validation Failure

400 INVALID_REQUEST
Business Rules
Google ID Token verified

Google Account searched

If linked account exists

↓

Create authenticated session

Otherwise

↓

Search existing email

If email exists

↓

Link Google account

↓

Create authenticated session

Otherwise

↓

Create User

Create UserProfile

Create OAuthAccount

Create authenticated session

Access Token generated

Refresh Token generated

Refresh Token hashed

User.lastLoginAt updated
Database Changes
Existing Google User

Creates

Session

Updates

Device.lastSeenAt

User.lastLoginAt
Existing Email User

Creates

OAuthAccount

Session

Updates

Device.lastSeenAt

User.lastLoginAt
New Google User

Creates

User

UserProfile

OAuthAccount

Session

Updates

Device.lastSeenAt

User.lastLoginAt
Redis
None
Emails
None
Account Linking Rules
Google account already linked

↓

Login existing account

Existing email/password account

↓

Link Google account

↓

Do NOT create duplicate User

Brand new Google account

↓

Create User

Create Profile

Create OAuthAccount
Google Account Password Policy
New Google accounts do not have a password.

Email/password login

↓

401 PASSWORD_NOT_SET

User must

Continue with Google

or

Use Forgot Password

↓

Create first password

↓

Email/password login becomes available.
Google Authentication Flow
Frontend

      │

Google Identity Services

      │

Google ID Token

      │

POST /auth/google

      │

Verify Google Token

      │

Existing OAuth Account?

      │

Yes ───────────────► Create Session

      │

No

      │

Find User By Email

      │

Exists?

      │

Yes ───────────────► Link Google

      │                     │

      │                     ▼

      │              Create Session

      │

No

      │

Create User

      │

Create Profile

      │

Create OAuthAccount

      │

Create Session

      │

Return Access Token

Return Refresh Token



##############################################

Google OAuth

Status: Backend Complete
Frontend Integration: Pending
End-to-End Testing: Pending