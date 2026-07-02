1. Purpose

The performance_records table stores immutable performance events generated from completed business operations.

Every record represents a single measurable event that contributes to the evaluation of a user's behaviour within Strus.

Unlike reputation tables, which store cached scores, this table stores the factual historical events used to derive those scores.

This table is the canonical source of truth for the entire reputation system.

2. Responsibilities

The performance_records table is responsible for:

Historical performance events
Reputation evidence
Role-specific performance tracking
Reputation reproducibility
Auditability
Long-term analytics

The table is not responsible for:

Reputation calculation
Reputation snapshots
Reputation display
Business decisions
3. Ownership

Domain

Identity

Aggregate

User

Each Performance Record belongs to exactly one User.

Records are append-only.

They are never updated.

They are never deleted.

4. Lifecycle
Business Event
      │
      ▼
Performance Record Created
      │
      ▼
Immutable Storage
      │
      ▼
Used By Reputation Engine
      │
      ▼
Historical Analytics

Once created, a performance record becomes permanent.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
id	UUID	No	gen_random_uuid()	Primary Key
userId	UUID	No	—	FK → users
projectId	UUID	No	—	FK → projects
milestoneId	UUID	Yes	NULL	FK → milestones
role	PARTICIPANT_ROLE	No	—	CLIENT / PROFESSIONAL
eventType	PERFORMANCE_EVENT_TYPE	No	—	Event category
scoreImpact	NUMERIC(8,4)	No	0.0000	Raw algorithm contribution
metadata	JSONB	Yes	NULL	Supporting metrics
occurredAt	TIMESTAMPTZ	No	—	Business event timestamp
algorithmVersion	INTEGER	No	1	Algorithm version used when generated
createdAt	TIMESTAMPTZ	No	NOW()	Record creation
6. Primary Key
PRIMARY KEY (id)

Every performance event receives a globally unique identifier.

7. Foreign Keys
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE RESTRICT
FOREIGN KEY (projectId)
REFERENCES projects(id)
ON UPDATE CASCADE
ON DELETE RESTRICT
FOREIGN KEY (milestoneId)
REFERENCES milestones(id)
ON UPDATE CASCADE
ON DELETE SET NULL

Performance records survive even if milestone history is archived.

8. Candidate Keys

No natural candidate key exists.

The same user may legitimately generate multiple events of the same type within a project.

9. Relationships
Many-to-One
users
    │
    ▼
performance_records
Many-to-One
projects
    │
    ▼
performance_records
Many-to-One
milestones
    │
    ▼
performance_records
10. Unique Constraints

No business-level uniqueness constraints.

Multiple performance events of identical type may occur throughout a project lifecycle.

11. Check Constraints
Score Impact
scoreImpact BETWEEN -100.0000 AND 100.0000
Algorithm Version
algorithmVersion > 0
Timestamp
occurredAt <= NOW()

A performance event cannot occur in the future.

12. Default Values
Column	Default
id	gen_random_uuid()
scoreImpact	0.0000
algorithmVersion	1
createdAt	NOW()
13. Nullable Columns

Nullable fields:

milestoneId
metadata

Some performance events relate to an entire project rather than a specific milestone.

Metadata varies depending on the event type.

14. Delete Behaviour

Deletion is prohibited.

Performance Records are immutable historical facts.

Corrections are performed by creating compensating records rather than modifying or deleting existing ones.

15. Update Behaviour

Updates are prohibited.

The following columns are immutable after insertion:

userId
projectId
milestoneId
role
eventType
scoreImpact
metadata
occurredAt
algorithmVersion
createdAt
16. Optimistic Locking

Not applicable.

Rows are immutable.

17. Audit Requirements

Performance Records themselves serve as historical evidence.

Creation events should still be logged within the Audit subsystem to maintain traceability.

18. Index Strategy
Primary Index
PK(id)
Foreign Key Index
(userId)

Supports:

Reputation recalculation
User history
(projectId)

Supports:

Project analytics
(milestoneId)

Supports:

Milestone reporting
Composite Index
(userId, role)

Supports:

Client reputation calculation
Professional reputation calculation
Composite Index
(userId, role, occurredAt DESC)

Supports:

Recent performance history
Incremental recalculation
Composite Index
(eventType, occurredAt)

Supports:

Analytics
Reputation research
Fraud detection
GIN Index
(metadata)

Supports structured searches on variable event metadata without affecting relational design.

19. Query Patterns
Client Reputation Calculation
SELECT *
FROM performance_records
WHERE userId = ?
AND role = 'CLIENT'
ORDER BY occurredAt;
Professional Reputation Calculation
SELECT *
FROM performance_records
WHERE userId = ?
AND role = 'PROFESSIONAL'
ORDER BY occurredAt;
Project Performance Timeline
SELECT *
FROM performance_records
WHERE projectId = ?
ORDER BY occurredAt;
Event Analytics
SELECT eventType, COUNT(*)
FROM performance_records
GROUP BY eventType;
20. Expected Scale

Projected row count:

Billions of rows

Characteristics:

Append-only
Write-heavy
Read-heavy for analytics
Never updated
Never deleted

This is expected to become one of the largest tables in the platform.

21. Partitioning Strategy

Time-based partitioning is recommended.

Suggested strategy:

Partition Key

occurredAt

Monthly Partitions

Advantages:

Faster analytics
Efficient archival
Simplified maintenance
Smaller indexes
Better vacuum performance

Future migration to yearly partitions should remain possible.

22. Performance Considerations

This table is optimized for immutable writes.

Reputation calculations should never aggregate the full table during normal requests.

Instead:

performance_records
        │
        ▼
Reputation Engine
        │
        ▼
client_reputations

professional_reputations

The reputation tables serve as read models, while performance_records remains the authoritative event store.

23. Future Extensions

Potential future additions include:

Weighted performance categories
Reviewer confidence scores
ML-derived quality indicators
Organization-level performance
Skill-specific metrics
Domain-specific scoring dimensions
Historical algorithm replay support

These enhancements should preserve append-only semantics and never mutate historical events.

24. Design Rationale

The performance_records table is the immutable foundation of Strus' reputation system. Rather than storing opaque ratings, it captures objective performance events that can be replayed to reproduce any reputation score. This event-based design supports algorithm evolution, historical audits, fraud investigations, analytics, and future machine learning models without sacrificing correctness. By treating reputation as a derived read model rather than persisted truth, Strus gains both scalability and long-term flexibility while maintaining complete historical integrity.