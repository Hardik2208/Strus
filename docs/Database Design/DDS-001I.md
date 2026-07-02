1. Purpose

The professional_reputations table stores the current calculated reputation of a user when acting as a Professional.

Like client_reputations, this table is not the source of truth.

It is a denormalized snapshot generated from immutable performance_records to support low-latency profile loading, participant evaluation, invitation workflows, and project discovery.

Professional reputation measures execution quality, reliability, and contractual behavior while acting as a Professional.

2. Responsibilities

The professional_reputations table is responsible for:

Current professional reputation score
Cached execution metrics
Latest reputation calculation reference
Fast reputation retrieval

The table is not responsible for:

Score calculation
Historical score evolution
Performance event generation
Reputation algorithms

Those belong to:

performance_records
reputation_calculations
reputation_history
3. Ownership

Domain

Identity

Aggregate

User

Each User owns exactly one Professional Reputation.

The record is created when the User is created, regardless of whether they have yet worked as a Professional.

4. Lifecycle
User Created
      │
      ▼
Professional Reputation Created
      │
      ▼
Performance Records Generated
      │
      ▼
Background Reputation Calculation
      │
      ▼
Snapshot Updated

The table is updated only by the Reputation Engine.

Manual score changes are prohibited.

5. Table Definition
Column	PostgreSQL Type	Nullable	Default	Description
userId	UUID	No	—	Shared PK / FK
score	NUMERIC(5,2)	No	0.00	Current professional score
completedProjects	INTEGER	No	0	Successfully completed projects
completionRate	NUMERIC(5,2)	No	0.00	Percentage of completed work
lateMilestones	INTEGER	No	0	Late milestone count
averageRevisionCount	NUMERIC(6,2)	No	0.00	Average revisions per milestone
averageApprovalTimeHours	NUMERIC(8,2)	No	0.00	Average contractor approval time
disputesWon	INTEGER	No	0	Professional dispute victories
disputesLost	INTEGER	No	0	Professional dispute losses
lastCalculationId	UUID	Yes	NULL	FK → reputation_calculations
lastCalculatedAt	TIMESTAMPTZ	Yes	NULL	Last successful calculation
createdAt	TIMESTAMPTZ	No	NOW()	Record creation
updatedAt	TIMESTAMPTZ	No	NOW()	Last recalculation
6. Primary Key
PRIMARY KEY (userId)

Shared primary key.

Exactly one Professional Reputation exists for each User.

7. Foreign Keys
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE
ON DELETE RESTRICT
FOREIGN KEY (lastCalculationId)
REFERENCES reputation_calculations(id)
ON UPDATE CASCADE
ON DELETE SET NULL

The current snapshot references the calculation that produced it.

8. Candidate Keys

Candidate key:

userId

No additional candidate keys.

9. Relationships
One-to-One
users
    │
    ▼
professional_reputations
Many-to-One
reputation_calculations
           │
           ▼
professional_reputations

Each recalculation produces a new calculation record while the reputation snapshot stores only the latest successful calculation.

10. Unique Constraints
PRIMARY KEY(userId)

No further unique constraints are required.

11. Check Constraints
Score
score BETWEEN 0.00 AND 5.00
Completion Rate
completionRate BETWEEN 0.00 AND 100.00
Average Revision Count
averageRevisionCount >= 0
Average Approval Time
averageApprovalTimeHours >= 0
Counters
completedProjects >= 0
lateMilestones >= 0
disputesWon >= 0
disputesLost >= 0
12. Default Values
Column	Default
score	0.00
completedProjects	0
completionRate	0.00
lateMilestones	0
averageRevisionCount	0.00
averageApprovalTimeHours	0.00
disputesWon	0
disputesLost	0
createdAt	NOW()
updatedAt	NOW()
13. Nullable Columns

Nullable fields:

lastCalculationId
lastCalculatedAt

These remain NULL until the user's first reputation calculation.

14. Delete Behaviour

Professional reputation cannot be deleted independently.

The record exists for the lifetime of the User.

15. Update Behaviour

Only the Reputation Engine may update:

score
cached metrics
lastCalculationId
lastCalculatedAt
updatedAt

Application services must never modify reputation values directly.

16. Optimistic Locking

Not required.

Reputation updates are serialized by the background calculation workflow.

17. Audit Requirements

Generate Audit Logs for:

Initial reputation creation
Reputation recalculated
Algorithm version migration
Administrative recalculation
Data repair recalculation

Historical score changes are recorded through reputation_history.

18. Index Strategy
Primary Index
PK(userId)
Secondary Index
(score)

Supports:

Professional search
Ranking
Recommendation
Invitation workflows
Composite Index
(score, completedProjects)

Supports ordering equally scored professionals by experience.

Secondary Index
(lastCalculatedAt)

Supports stale-reputation detection.

19. Query Patterns
Load Professional Reputation
SELECT *
FROM professional_reputations
WHERE userId = ?
Top Professionals
SELECT userId, score
FROM professional_reputations
WHERE score >= 4.5
ORDER BY score DESC
Recalculation Queue
SELECT userId
FROM professional_reputations
WHERE lastCalculatedAt < ?
20. Expected Scale

Projected row count:

One row per user

Characteristics:

Extremely read-heavy
Very low write frequency
Cached read model
21. Partitioning Strategy

Partitioning is not recommended.

The table remains compact and is primarily accessed through userId.

22. Performance Considerations

This table is intentionally denormalized.

The authoritative pipeline is:

performance_records
        │
        ▼
reputation_calculations
        │
        ▼
professional_reputations

This avoids expensive aggregation during every project invitation, professional search, or profile lookup while preserving complete historical reproducibility.

23. Future Extensions

Potential future additions include:

On-time delivery rate
Average milestone completion time
Average response time
Quality consistency score
Professional percentile ranking
Reputation confidence score
Verified skill badges
Domain-specific execution metrics

These additions should remain derived values computed from immutable performance records.

24. Design Rationale

The professional_reputations table provides a high-performance read model for evaluating professionals without recalculating scores from historical performance data. By separating client and professional reputation into distinct entities, Strus accurately reflects role-specific trust while maintaining a single user identity. This design supports scalable search, invitations, and profile rendering, while preserving the architectural principle that reputation is calculated, never manually assigned, and that immutable performance_records remain the canonical source of truth.