####################################################################################################################
# Strus — Dispute, Negotiation & ActionRequest Module

## 1. Module Overview

The Dispute domain provides the formal escalation and resolution workflow for milestone-level execution conflicts.

The domain consists of three closely integrated but independently responsible components:

```text
Dispute
   │
   ├── Negotiation
   │
   └── ActionRequest
```

### Dispute

Owns formal dispute creation, classification, lifecycle, execution hold behavior, administrative resolution workflow, and dispute outcomes.

### Negotiation

Owns settlement negotiation between the Client and Professional before or during the applicable dispute workflow.

### ActionRequest

Provides generic two-party decision infrastructure that can be reused by domain modules. It does not understand the business meaning of the decisions it processes.

The three components must remain separate despite their integration.

---

# 2. Architectural Responsibility

## Dispute

Dispute is responsible for:

* Dispute creation.
* Dispute classification.
* Pre-submission disputes.
* Post-submission disputes.
* Dispute lifecycle.
* Milestone state transitions caused by disputes.
* Execution hold handling.
* Hold timestamp recording.
* Administrative review integration.
* Resolution proposal integration.
* Dispute audit records.
* Dispute notification events.
* Dispute retrieval.
* Dispute caching.

Dispute does not own generic ActionRequest persistence.

---

## Negotiation

Negotiation is responsible for:

* Settlement negotiation rules.
* Negotiation eligibility.
* Settlement proposal creation.
* Negotiation response.
* Negotiation deadlines.
* Negotiation expiration.
* Negotiation lifecycle.
* Negotiation audit integration.
* Negotiation notification events.

Negotiation uses ActionRequest infrastructure where a continuation decision is required but does not implement ActionRequest persistence itself.

---

## ActionRequest

ActionRequest is a generic reusable two-party decision mechanism.

It is intentionally independent of Negotiation and Dispute.

The owning domain determines:

* Why the request exists.
* When it should be created.
* Who participates.
* What the response means.
* What should happen after completion.

ActionRequest itself handles:

* Request persistence.
* Participant persistence.
* Participant authorization.
* Response recording.
* Duplicate response prevention.
* Deadline validation.
* Completion.
* Expiration.

ActionRequest does not modify milestone, project, negotiation, or dispute state.

---

# 3. Domain Relationship

```text
Execution
   │
   ├── Milestone
   │      │
   │      ├── Submission
   │      │
   │      ├── Revision
   │      │
   │      └── Dispute
   │
   └── Audit


Dispute
   │
   ├── Negotiation
   │
   └── ActionRequest


Negotiation
   │
   └── ActionRequestService


Dispute
   │
   └── ActionRequestService
```

The generic ActionRequest service is the integration point rather than a domain-specific child of either Dispute or Negotiation.

---

# 4. Dispute

## 4.1 Purpose

A Dispute represents formal escalation of a milestone-level disagreement when the normal execution workflow is no longer sufficient.

Disputes are associated with a particular milestone.

The system already possesses structured project information such as:

* Agreement.
* Milestone specification.
* Submission information.
* Revision history.
* Execution history.
* Project assets.
* Execution audit history.

The dispute therefore operates within the existing execution context rather than creating an independent project context.

---

# 4.2 Dispute Classification

Dispute creation is classified through:

```text
DisputeClassificationMiddleware
```

The dispute is classified as:

```text
PRE_SUBMISSION
```

or:

```text
POST_SUBMISSION
```

The classification determines the initial milestone state and creation workflow.

---

# 4.3 Dispute Creation

The primary creation flow is:

```text
createDispute()
      │
      ▼
DisputeClassificationMiddleware
      │
      ├───────────────┐
      ▼               ▼
PRE_SUBMISSION    POST_SUBMISSION
      │               │
      ▼               ▼
createPre...()    createPost...()
```

---

# 4.4 Pre-Submission Dispute

For a pre-submission dispute:

```text
Dispute
    → OPEN

Milestone
    → UNDER_DISPUTE
```

The execution hold timestamp is recorded.

An execution audit record is created.

The corresponding dispute creation event is published.

Audit action:

```text
PRE_SUBMISSION_DISPUTE_CREATED
```

---

# 4.5 Post-Submission Dispute

For a post-submission dispute:

```text
Dispute
    → OPEN

Milestone
    → NEGOTIATION
```

The execution hold timestamp is recorded.

An execution audit record is created.

Audit action:

```text
POST_SUBMISSION_DISPUTE_CREATED
```

---

# 4.6 Dispute Lifecycle

The implemented dispute lifecycle is:

```text
OPEN
  │
  ▼
UNDER_REVIEW
  │
  ▼
RESOLUTION_PROPOSED
  │
  ▼
RESOLVED
  │
  ▼
CLOSED
```

Each transition is controlled by the Dispute domain.

---

# 4.7 Administrative Review

Administration is responsible for reviewing disputes.

The Admin is not treated as an ActionRequest participant.

The administrative workflow is:

```text
Dispute
    │
    ▼
Admin Review
    │
    ▼
Resolution Proposed
    │
    ▼
ActionRequest
    │
    ▼
Client + Professional
    │
    ▼
Responses
    │
    ▼
ActionRequest Completed
    │
    ▼
Dispute interprets result
```

ActionRequest remains generic throughout this process.

---

# 4.8 Dispute Service

The Dispute service owns dispute business operations.

Implemented responsibilities include:

```text
getDispute()

getDisputes()

createDispute()

createPreSubmissionDispute()

createPostSubmissionDispute()
```

Future administrative operations use the same domain service rather than duplicating dispute state-transition logic.

---

# 4.9 Dispute Repository

The repository owns persistence operations for Dispute.

Repository responsibilities include:

* Dispute creation.
* Dispute retrieval.
* Dispute filtering.
* Dispute state persistence.
* Dispute updates.

The repository must not contain business decisions.

---

# 4.10 Dispute Helper Repository

Dispute-specific helper queries remain isolated from the main domain service and repository abstractions where required by the implementation.

---

# 4.11 Dispute Cache

Redis is used as a cache.

PostgreSQL remains the source of truth.

Dispute state-changing operations must invalidate affected cache entries.

No business decision may depend solely on cached dispute data.

---

# 4.12 Dispute Audit

Dispute creation integrates with Execution Audit.

Implemented creation audit actions include:

```text
PRE_SUBMISSION_DISPUTE_CREATED
POST_SUBMISSION_DISPUTE_CREATED
```

Audit records preserve:

* Project.
* Milestone.
* Actor.
* Action.
* Relevant metadata.

---

# 4.13 Dispute Events

The Dispute module publishes:

```text
DISPUTE_CREATED
DISPUTE_RESOLUTION_PROPOSED
DISPUTE_RESOLVED
DISPUTE_CLOSED
```

The Dispute module does not directly send notifications.

It publishes events to the shared Event/Notification infrastructure.

---

# 4.14 Dispute Notification Recipients

### DISPUTE_CREATED

Recipient:

* Opposite project participant.

Channels:

* Dashboard.
* Email.

### DISPUTE_RESOLUTION_PROPOSED

Recipients:

* Client.
* Professional.

Channels:

* Dashboard.
* Email.

### DISPUTE_RESOLVED

Recipients:

* Client.
* Professional.

Channels:

* Dashboard.
* Email.

### DISPUTE_CLOSED

Recipients:

* Client.
* Professional.

Channels:

* Dashboard.
* Email.

Socket delivery must only be documented where explicitly implemented.

---

# 5. Negotiation

## 5.1 Purpose

Negotiation provides a structured settlement mechanism around a milestone disagreement.

It allows the applicable participants to attempt resolution through a defined settlement proposal before the matter proceeds through the appropriate dispute workflow.

Negotiation is a domain concept and must not be confused with the generic ActionRequest mechanism.

---

# 5.2 Negotiation Eligibility

Negotiation eligibility is determined by the Negotiation domain.

The implementation considers:

* Milestone state.
* Revision-limit state.
* Latest rejected submission.
* Existing negotiations.
* Existing pending negotiation.

A milestone cannot create another negotiation while an applicable negotiation remains pending.

---

# 5.3 Negotiation Participants

The normal negotiation participants are:

```text
Client
Professional
```

The domain determines which participant initiates the negotiation and which participant responds according to the implemented milestone workflow.

---

# 5.4 Maximum Negotiations

The Negotiation domain enforces the configured maximum negotiation count for a milestone.

Negotiations are numbered sequentially within their milestone context.

The latest negotiation can be retrieved independently from historical negotiations.

---

# 5.5 Settlement Proposals

Negotiation supports settlement proposals including:

```text
0%
Partial Settlement
100%
```

The proposed amount is stored and interpreted by the Negotiation domain.

Negotiation owns the settlement proposal semantics.

---

# 5.6 Negotiation Lifecycle

```text
PENDING
   │
   ├── ACCEPTED
   │
   ├── DECLINED
   │
   └── EXPIRED
```

---

# 5.7 Negotiation Acceptance

When accepted:

```text
Negotiation
    → ACCEPTED

Professional response
    → completed

Continuation workflow
    → ActionRequest created
```

The continuation ActionRequest is created through:

```text
ActionRequestService.create()
```

Negotiation must not directly create ActionRequest database records.

Where acceptance and ActionRequest creation form one business operation, they must be handled transactionally.

---

# 5.8 Negotiation Decline

When declined:

```text
Negotiation
    → DECLINED
```

The professional response is completed.

The milestone moves into the appropriate dispute state.

No continuation ActionRequest is created from the declined negotiation.

---

# 5.9 Negotiation Expiration

Negotiations have a response deadline.

A pending negotiation remains:

```text
PENDING
```

until its deadline is reached.

The centralized Scheduler identifies expired negotiations.

The Scheduler does not directly update the negotiation.

Instead:

```text
Scheduler
    ↓
NegotiationExpirationJob
    ↓
NegotiationService.expireNegotiation()
```

The service performs the actual state transition.

Expiration results in:

```text
Negotiation
    → EXPIRED

Waiting/response state
    → expired

Milestone
    → appropriate dispute state

Execution Audit
    → created

NEGOTIATION_EXPIRED
    → published
```

---

# 5.10 Negotiation vs ActionRequest Expiration

These are separate workflows.

## Negotiation Expiration

The Negotiation service determines that the settlement negotiation has expired and applies the appropriate milestone/domain transition.

## ActionRequest Expiration

The ActionRequest service determines that a generic two-party request has expired.

Even when both workflows use a seven-day deadline, they must not be merged.

```text
Negotiation
    → NegotiationService.expireNegotiation()

ActionRequest
    → ActionRequestService.expire()
```

---

# 5.11 Negotiation Repository

Implemented repository operations include:

```text
create

findById

findDetails

findLatestByMilestone

findPendingByMilestone

findByNumber

findByMilestone

findExpiredNegotiations

update

accept

decline

expire
```

Repository methods perform persistence operations only.

---

# 5.12 Negotiation Service

The Negotiation service owns:

* Eligibility validation.
* Settlement proposal validation.
* Negotiation creation.
* Negotiation responses.
* Negotiation acceptance.
* Negotiation decline.
* Negotiation expiration.
* Milestone transition coordination.
* Execution Audit coordination.
* Event publishing.

---

# 5.13 Negotiation Notifications

The Negotiation module publishes:

```text
NEGOTIATION_CREATED
NEGOTIATION_ACCEPTED
NEGOTIATION_DECLINED
NEGOTIATION_EXPIRED
```

### Created

Recipient:

* Professional.

Channels:

* Dashboard.
* Email.
* Socket.

### Accepted

Recipient:

* Client.

Channels:

* Dashboard.
* Email.
* Socket.

### Declined

Recipient:

* Client.

Channels:

* Dashboard.
* Email.
* Socket.

### Expired

Recipients:

* Client.
* Professional.

Channels:

* Dashboard.
* Email.
* Socket.

Negotiation does not directly send notifications.

It publishes notification jobs through:

```text
NegotiationPublisher
```

---

# 6. ActionRequest

## 6.1 Purpose

ActionRequest is a generic two-party decision infrastructure.

It exists so domain modules do not have to repeatedly implement:

* Request persistence.
* Participant management.
* Response handling.
* Deadline handling.
* Completion.
* Expiration.

It is intentionally independent from both Negotiation and Dispute.

---

# 6.2 Generic Ownership Model

The domain module owns the meaning.

ActionRequest owns the mechanism.

```text
Negotiation
    │
    └── determines WHY request exists
            │
            ▼
ActionRequestService
    └── determines HOW request is stored/responded to

Dispute
    │
    └── determines WHY request exists
            │
            ▼
ActionRequestService
```

---

# 6.3 ActionRequest Lifecycle

```text
PENDING
   │
   ├── COMPLETED
   │
   └── EXPIRED
```

---

# 6.4 Participants

The normal request contains:

```text
Client
Professional
```

Participants are represented through:

```text
ActionRequestParticipant
```

The ActionRequest system validates participant identity before allowing responses.

---

# 6.5 ActionRequest Creation

Other modules call the generic service:

```text
ActionRequestService.create()
```

Examples:

```text
Negotiation
    ↓
ActionRequestService.create()

Dispute
    ↓
ActionRequestService.create()
```

No domain module should directly insert ActionRequest records.

---

# 6.6 ActionRequest Participant Repository

Implemented operations include:

```text
createMany

findByRequest

findParticipant

update
```

---

# 6.7 ActionRequest Repository

Implemented operations include:

```text
create

findById

findByNegotiation

findExpired

findExpiredByType

update

expire
```

---

# 6.8 Generic Response

The generic API is:

```http
POST /api/v1/action-requests/:actionRequestId/respond
```

The response flow is:

```text
Authenticated User
       ↓
Participant Validation
       ↓
Request Status Validation
       ↓
Deadline Validation
       ↓
Response Recorded
       ↓
Duplicate Response Protection
       ↓
Completion Check
       ↓
ActionRequest COMPLETED
```

---

# 6.9 ActionRequest Business Meaning

ActionRequest does not interpret responses.

For example, if a request contains:

```text
CONTINUE
TERMINATE
```

ActionRequest does not decide what these values mean.

It does not modify:

* Milestone state.
* Project state.
* Negotiation state.
* Dispute state.

The owning domain receives the completed request and interprets the result.

---

# 6.10 ActionRequest Expiration

The centralized Scheduler identifies pending requests whose deadlines have passed.

```text
Scheduler
    ↓
ActionRequestExpirationJob
    ↓
find expired ActionRequests
    ↓
ActionRequestService.expire()
    ↓
ActionRequest EXPIRED
```

Participant expiration handling is performed according to the implemented ActionRequest behavior.

The Scheduler does not directly mutate database records.

---

# 7. Shared Event / Notification Architecture

All three domains integrate with the shared Event infrastructure.

The architecture is:

```text
Business Service
      ↓
Publisher
      ↓
BullMQ Event Queue
      ↓
Event Worker
      ↓
Event Processor
      ↓
Notification Factory
      ↓
Recipient Resolver
      ↓
Dashboard / Email / Socket
```

Business modules do not directly:

* Send email.
* Emit Socket.IO events.
* Create dashboard notification records.
* Resolve notification recipients.

This separation keeps notification delivery asynchronous and independent from core business transactions.

---

# 8. Scheduler Architecture

There is one centralized Scheduler.

There are not separate schedulers inside:

* Negotiation.
* Dispute.
* ActionRequest.

The Scheduler answers:

> When should the job execute?

The domain service answers:

> What should happen?

The repository answers:

> How is it persisted?

Architecture:

```text
Central Scheduler
       │
       ├── Submission Auto Approval
       │
       ├── Negotiation Expiration
       │
       └── ActionRequest Expiration
```

Scheduler lifecycle:

```text
Scheduler.start()
Scheduler.stop()
```

The scheduler provides:

* Startup execution.
* Recurring execution.
* Duplicate-start protection.
* Graceful shutdown.
* Error logging.
* Failure isolation.

Jobs call application/domain services rather than directly manipulating database records.

---

# 9. Transaction Boundaries

Business-critical state transitions must remain transactional.

## Negotiation Acceptance

```text
BEGIN
    Negotiation ACCEPTED
    ActionRequest CREATED
    Execution Audit CREATED
COMMIT
```

Notification processing occurs asynchronously after the business operation.

---

## Negotiation Decline

```text
BEGIN
    Negotiation DECLINED
    Milestone transition
    Execution Audit
COMMIT
```

---

## Negotiation Expiration

```text
BEGIN
    Negotiation EXPIRED
    Milestone transition
    Execution Audit
COMMIT
```

---

## ActionRequest Creation

```text
BEGIN
    ActionRequest CREATED
    Participants CREATED
COMMIT
```

---

# 10. Cache Strategy

Redis is used as a cache.

It is never the source of truth.

```text
PostgreSQL
    ↓
Source of Truth

Redis
    ↓
Performance Cache
```

State-changing operations must invalidate affected cached records.

The system must remain correct if Redis is unavailable.

---

# 11. Execution Audit Integration

Execution Audit provides the persistent history of significant execution-domain actions.

The integrated modules create audit records for implemented state transitions, including:

### Negotiation

```text
Negotiation Created
Negotiation Accepted
Negotiation Declined
Negotiation Expired
```

### Dispute

```text
PRE_SUBMISSION_DISPUTE_CREATED
POST_SUBMISSION_DISPUTE_CREATED
```

Additional implemented execution transitions should use the same audit mechanism.

Audit records contain appropriate:

* Project.
* Milestone.
* Actor.
* Action.
* Metadata.

---

# 12. Authorization

Authentication is provided by the existing Authentication module.

The modules must never trust a user ID supplied by the client for authorization.

Authorization must validate the authenticated user's relationship to the relevant:

* Project.
* Milestone.
* Negotiation.
* ActionRequest.
* Dispute.

Important role boundaries include:

```text
Client
    → applicable client-side actions

Professional
    → applicable professional-side actions

Admin
    → dispute review/resolution operations where implemented
```

Admin is not an ActionRequest participant unless the owning domain explicitly defines such behavior; the implemented dispute workflow treats Admin as the reviewer and Client + Professional as the confirmation participants.

---

# 13. Complete Negotiation Flow

```text
Revision Limit Reached
        ↓
Latest Submission Rejected
        ↓
Client Creates Negotiation
        ↓
Negotiation PENDING
        ↓
Professional Responds
        │
        ├── ACCEPT
        │      ↓
        │  Negotiation ACCEPTED
        │      ↓
        │  ActionRequest Created
        │      ↓
        │  Client + Professional Respond
        │      ↓
        │  ActionRequest COMPLETED
        │      ↓
        │  Owning Domain Interprets Result
        │
        ├── DECLINE
        │      ↓
        │  Negotiation DECLINED
        │      ↓
        │  Milestone → appropriate dispute state
        │
        └── NO RESPONSE
               ↓
        Response Deadline
               ↓
        Central Scheduler
               ↓
        NegotiationService.expireNegotiation()
               ↓
        Negotiation EXPIRED
               ↓
        Milestone → appropriate dispute state
               ↓
        Execution Audit
               ↓
        Notification Event
```

---

# 14. Complete Dispute Flow

```text
Dispute Created
      ↓
Classification
      │
      ├── PRE_SUBMISSION
      │       ↓
      │   Dispute OPEN
      │       ↓
      │   Milestone UNDER_DISPUTE
      │
      └── POST_SUBMISSION
              ↓
          Dispute OPEN
              ↓
          Milestone NEGOTIATION

              ↓

        Administrative Review
              ↓
        UNDER_REVIEW
              ↓
        RESOLUTION_PROPOSED
              ↓
        ActionRequest (when required)
              ↓
        Client + Professional
              ↓
        Responses
              ↓
        ActionRequest COMPLETED
              ↓
        Dispute interprets result
              ↓
           RESOLVED
              ↓
            CLOSED
```

---

# 15. Complete ActionRequest Flow

```text
Owning Domain
      ↓
ActionRequestService.create()
      ↓
ActionRequest PENDING
      ↓
Client + Professional
      ↓
Responses
      ↓
Both Responded
      ↓
ActionRequest COMPLETED
```

Or:

```text
ActionRequest PENDING
      ↓
Deadline Reached
      ↓
Central Scheduler
      ↓
ActionRequestService.expire()
      ↓
ActionRequest EXPIRED
```

---

# 16. Complete Notification Flow

```text
Domain Service
      ↓
Publisher
      ↓
BullMQ
      ↓
Event Worker
      ↓
Event Processor
      ↓
Notification Factory
      ↓
Recipient Resolver
      ↓
Dashboard / Email / Socket
```

This architecture ensures:

* Business modules remain decoupled.
* Notification delivery is asynchronous.
* Delivery failures do not block the originating business operation.
* Recipient resolution is centralized.
* Additional delivery channels can be introduced without modifying domain logic.

---

# 17. Failure Handling

Business state transitions must not depend on successful notification delivery.

For example:

```text
Negotiation Accepted
        ↓
Database Transaction Commits
        ↓
Notification Job Published
        ↓
Worker Processing
        ↓
Email / Dashboard / Socket
```

If email or Socket.IO delivery fails, the Negotiation acceptance remains valid.

Likewise, a scheduler failure must not be treated as a direct database mutation mechanism.

The next scheduler execution can identify pending records whose deadlines have already passed and invoke the appropriate domain service.

---

# 18. Current Implementation Scope

### Negotiation

Implemented:

* Eligibility.
* Settlement proposals.
* Negotiation creation.
* Negotiation responses.
* Acceptance.
* Decline.
* Expiration.
* Repository operations.
* Audit integration.
* Notification publishing.
* Scheduler integration.
* ActionRequest integration.

### ActionRequest

Implemented:

* Generic request creation.
* Participant creation.
* Participant validation.
* Response handling.
* Duplicate response protection.
* Completion.
* Expiration.
* Repository operations.
* Generic REST response endpoint.
* Scheduler integration.

### Dispute

Implemented:

* Dispute creation.
* Classification.
* Pre-submission disputes.
* Post-submission disputes.
* Initial milestone transitions.
* Execution hold timestamp.
* Execution audit integration.
* Retrieval.
* Cache integration.
* Notification publishing.
* Administrative resolution integration points.
* ActionRequest integration.

### Deferred / Owned by Later Administration Work

The Administration module owns the operator-facing workflow for:

* Dispute queue.
* Case assignment.
* Investigation interface.
* Administrative review.
* Resolution proposal.
* Operator permissions.
* Administrative audit interface.

The financial consequences of dispute outcomes remain the responsibility of the future Payments module.

---

# 19. Design Principles

The combined system follows these principles:

1. **Dispute, Negotiation, and ActionRequest are separate domain concepts.**
2. **Negotiation owns settlement rules.**
3. **Dispute owns formal escalation and resolution.**
4. **ActionRequest owns generic two-party decision mechanics.**
5. **ActionRequest never interprets domain meaning.**
6. **Schedulers trigger domain services; they do not implement business rules.**
7. **Business services own state transitions.**
8. **Repositories own persistence only.**
9. **Notifications are asynchronous.**
10. **PostgreSQL remains the source of truth.**
11. **Redis remains a cache.**
12. **Execution Audit provides persistent execution history.**
13. **Administration provides the operator interface without duplicating dispute logic.**
14. **Payments remains a separate future bounded context.**

---

# 20. Final Architecture

```text
                         STRUS EXECUTION
                               │
              ┌────────────────┴────────────────┐
              │                                 │
        Negotiation                           Dispute
              │                                 │
              │                                 ├── Classification
              │                                 ├── Review
              │                                 ├── Resolution
              │                                 └── Closure
              │
              └────────────────┬────────────────┘
                               │
                               ▼
                        ActionRequest
                               │
                        Client + Professional
                               │
                               ▼
                           Response
                               │
                               ▼
                     Domain Interpretation


              BUSINESS EVENT INFRASTRUCTURE
                               │
              ┌────────────────┴────────────────┐
              │                                 │
        NegotiationPublisher              DisputePublisher
              │                                 │
              └────────────────┬────────────────┘
                               ▼
                            BullMQ
                               │
                               ▼
                         Event Worker
                               │
                               ▼
                      Event Processor
                               │
                               ▼
                     Notification Factory
                         │      │      │
                         ▼      ▼      ▼
                     Dashboard Email  Socket


                     CENTRAL SCHEDULER
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Submission       Negotiation       ActionRequest
        Auto Approval    Expiration        Expiration
```

This document is the single source of truth for the **Dispute + Negotiation + ActionRequest execution workflow**, while the shared Event/Notification and Scheduler infrastructure sections document their integration boundaries.

####################################################################################################################
