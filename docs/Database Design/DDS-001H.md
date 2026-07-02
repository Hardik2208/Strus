1. Purpose

The client_reputations table stores the current calculated reputation of a user when acting as a Client.

This table is not the source of truth.

It is a denormalized snapshot generated from immutable performance_records.

Its purpose is to provide extremely fast reputation lookups without recalculating scores during every request.

The complete calculation history remains reproducible.

2. Responsibilities

The client_reputations table is responsible for:

Current client reputation score
Cached client metrics
Latest calculation reference
Reputation summary
Fast read access

The table is not responsible for:

Reputation calculation
Historical score changes
Performance events
Algorithm logic

Those belong to:

performance_records
reputation_calculations
reputation_history
3. Ownership

Domain

Identity

Aggregate

User

Each User owns exactly one Client Reputation.

The row is created together with the User.

4. Lifecycle
User Created
      │
      ▼
Client Reputation Created
      │
      ▼
Performance Records Generated
      │
      ▼
Background Score Calculation
      │
      ▼
Snapshot Updated

No manual updates are permitted.

Every update originates from the Reputation Engine.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
userId	UUID	No	—	Shared PK / FK
score	NUMERIC(5,2)	No	0.00	Current client score
completedProjects	INTEGER	No	0	Successfully completed projects
paymentDelays	INTEGER	No	0	Payment delay incidents
approvalDelays	INTEGER	No	0	Approval delay incidents
revisionAbuseCount	INTEGER	No	0	Excessive revision requests
disputesWon	INTEGER	No	0	Client dispute victories
disputesLost	INTEGER	No	0	Client dispute losses
lastCalculationId	UUID	Yes	NULL	FK → reputation_calculations
lastCalculatedAt	TIMESTAMPTZ	Yes	NULL	Last successful calculation
createdAt	TIMESTAMPTZ	No	NOW()	Record creation
updatedAt	TIMESTAMPTZ	No	NOW()	Last recalculation
6. Primary Key
PRIMARY KEY (userId)

Shared primary key.

Exactly one Client Reputation per User.

7. Foreign Keys
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE RESTRICT
FOREIGN KEY (lastCalculationId)
REFERENCES reputation_calculations(id)
ON UPDATE CASCADE
ON DELETE SET NULL

The calculation record may be archived independently while preserving the current snapshot.

8. Candidate Keys

Candidate key:

userId

No additional candidate keys exist.

9. Relationships
One-to-One
users
    │
    ▼
client_reputations
Many-to-One
reputation_calculations
          │
          ▼
client_reputations

Many reputation snapshots across time may reference different calculation runs, while each snapshot stores only the latest calculation reference.

10. Unique Constraints
PRIMARY KEY(userId)

No additional unique constraints.

11. Check Constraints
Score Range
score BETWEEN 0.00 AND 5.00
Non-negative Counters
completedProjects >= 0
paymentDelays >= 0
approvalDelays >= 0
revisionAbuseCount >= 0
disputesWon >= 0
disputesLost >= 0
12. Default Values
Column	Default
score	0.00
completedProjects	0
paymentDelays	0
approvalDelays	0
revisionAbuseCount	0
disputesWon	0
disputesLost	0
createdAt	NOW()
updatedAt	NOW()
13. Nullable Columns

Nullable fields:

lastCalculationId
lastCalculatedAt

These remain NULL until the first reputation calculation completes.

14. Delete Behaviour

Independent deletion is prohibited.

The reputation record exists for the lifetime of the User.

15. Update Behaviour

Only the Reputation Engine may update:

score
counters
lastCalculationId
lastCalculatedAt
updatedAt

Manual edits are prohibited.

16. Optimistic Locking

Not required.

Updates originate from a single reputation calculation workflow.

17. Audit Requirements

Audit events include:

Initial reputation creation
Reputation recalculated
Algorithm version changed
Manual administrative recalculation
Reputation correction following data repair

Score values themselves are historically tracked through reputation_history.

18. Index Strategy
Primary Index
PK(userId)
Secondary Index
(score)

Supports:

Leaderboards
Reputation filtering
Search ranking
Composite Index
(score, completedProjects)

Supports sorting users with similar scores by experience.

Secondary Index
(lastCalculatedAt)

Supports:

Stale reputation detection
Background recalculation jobs
19. Query Patterns
Load Client Reputation
SELECT *
FROM client_reputations
WHERE userId = ?
High Reputation Clients
SELECT userId, score
FROM client_reputations
WHERE score >= 4.5
ORDER BY score DESC
Reputation Recalculation Queue
SELECT userId
FROM client_reputations
WHERE lastCalculatedAt < ?
20. Expected Scale

Projected row count:

One row per user

Characteristics:

Extremely read-heavy
Very low write frequency
Updated asynchronously
21. Partitioning Strategy

Partitioning is not recommended.

The table remains compact and is accessed primarily by primary key.

22. Performance Considerations

This is a cache table.

The authoritative source of truth is:

performance_records
        │
        ▼
reputation_calculations
        │
        ▼
client_reputations

Denormalization is intentional and documented.

Without this table, every profile lookup would require expensive aggregation over potentially millions of immutable performance records.

23. Future Extensions

Potential future additions include:

Average payment delay duration
Average approval response time
Communication responsiveness
Project abandonment rate
Client percentile ranking
Reputation confidence score
Public reputation badge

These additions should remain derived metrics and must never replace immutable performance records.

24. Design Rationale

The client_reputations table is a denormalized read model optimized for fast reputation retrieval. It deliberately duplicates derived information from immutable performance_records to eliminate expensive runtime calculations while preserving full auditability through reputation_calculations and reputation_history. This design aligns with the Strus philosophy that reputation is calculated, never manually assigned, and allows the scoring algorithm to evolve without compromising historical correctness.