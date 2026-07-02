BR-001

Every account must complete Level 1 Verification before using Strus.

BR-002

A user may act as both Client and Professional.

BR-003

User role is determined per project, never globally.

BR-004

Verification Levels

Level 1 → Google OAuth or Email + OTP
Level 2 → Phone Verification
Level 3 → Identity Verification (KYC)
BR-005

Viewer activity never contributes to reputation.

Organization
BR-006

Every user automatically receives one Personal Organization.

BR-007

Organizations are of two types:

PERSONAL
PROFESSIONAL
BR-008

Projects always belong to an Organization.

BR-009

An Organization represents a business entity, not a collaboration workspace.

BR-010

Organization admins can view every project under that organization.

BR-011

Project participants are independent of Organization admins.

Projects
BR-012

Every project has exactly one Client.

BR-013

Projects may contain multiple Professionals.

BR-014

Projects may contain multiple Viewers.

BR-015

Professionals may participate in multiple projects simultaneously.

BR-016

Organizations may own multiple active projects simultaneously.

Draft Phase
BR-017

Before ACTIVE, every part of the contract is editable.

BR-018

Any contract modification creates a new contract version.

BR-019

Only affected participants enter Pending Review after modifications.

BR-020

Projects cannot become ACTIVE until all required participants accept the latest version.

BR-021

Client must explicitly start the project after all required acceptances.

Invitations
BR-022

Invitation records are immutable.

BR-023

Invitation states:

Pending
Accepted
Declined
Withdrawn
Expired
BR-024

Declined invitations cannot be reopened.

BR-025

Re-invitations create a new invitation.

BR-026

Re-invitation cooldown is configurable (default 24 hours).

BR-027

Re-invitations are prohibited after project activation.

Active Contract
BR-028

After ACTIVE, the contract becomes immutable.

BR-029

Changes after ACTIVE occur only through Amendments.

BR-030

Original agreements are never overwritten.

Amendments
BR-031

Every amendment stores approval history.

BR-032

Each approver records one immutable decision.

BR-033

Completed approvals cannot be modified.

BR-034

Approval requests disappear from the user's pending list after a decision.

Milestones
BR-035

Every project must contain at least one milestone.

BR-036

Every milestone must have a positive payment amount.

BR-037

The sum of milestone payments must equal the contract value.

BR-038

Milestones may execute in parallel.

BR-039

Professionals only view milestones assigned to them.

BR-040

Removing a professional before activation removes their milestone assignments.

Funding
BR-041

Contracts with one or two milestones require full funding before activation.

BR-042

Contracts with more than two milestones require rolling funding.

BR-043

Current and next milestone must always be funded.

BR-044

Projects pause if required funding is unavailable.

Submission
BR-045

Professionals submit one final submission per assignment.

BR-046

Partial submissions are not supported.

BR-047

A submission contains multiple Deliverables.

BR-048

Deliverables contain multiple Artifacts.

BR-049

Artifacts follow the Submission Template defined by the Contract Type.

BR-050

Cloudinary stores files.

BR-051

PostgreSQL stores only artifact metadata.

BR-052

Artifact metadata may use JSONB for provider-specific information.

BR-053

Files remain immutable after upload.

Review
BR-054

Clients cannot directly reject a submission while revisions remain.

BR-055

Revision count is defined by the contract.

BR-056

Every revision creates its own discussion thread.

BR-057

Revision requests reference specific deliverables.

Deadlines
BR-058

Only Clients may approve deadline extensions.

BR-059

Professionals may only request extensions.

BR-060

Approved extensions become Amendments.

BR-061

A 24-hour grace period exists after deadline expiry.

BR-062

Late submissions remain allowed.

BR-063

Late submissions affect milestone performance metrics.

Disputes
BR-064

Disputes place the project ON_HOLD.

BR-065

Payments stop during disputes.

BR-066

New milestones cannot begin during disputes.

BR-067

Dispute resolution determines reputation impact.

Reputation
BR-068

Client and Professional reputation are independent.

BR-069

Reputation is calculated from immutable performance records.

BR-070

Scores are recalculated rather than incrementally updated.

BR-071

Milestone performance contributes to project reputation.

BR-072

Project reputation contributes to overall user reputation.

Termination
BR-073

Projects may terminate before completion.

BR-074

Mutual termination requires approval from all required parties.

BR-075

Platform fees are calculated from the total contract value once ACTIVE.

BR-076

Remaining funds follow the settlement process.

Storage
BR-077

Artifacts remain available during the retention period.

BR-078

After retention expires, Cloudinary assets are deleted.

BR-079

Artifact metadata remains permanently.

BR-080

File hashes remain permanently.

Audit
BR-081

Business records are never physically deleted.

BR-082

Every significant business action generates an audit record.

BR-083

Timeline entries are immutable.

Real-Time
BR-084

Project state changes propagate through WebSockets.

BR-085

Notifications are generated for all major workflow events.

Missing Rules Before Database Design

I think we still need one final document:

Permission Matrix

Not general statements, but a complete matrix like:

Action	Owner	Admin	Client	Professional	Viewer
Create Project	✅	⚙️	❌	❌	❌
Edit Draft	✅	✅	✅	❌	❌
Start Project	❌	❌	✅	❌	❌
Submit Milestone	❌	❌	❌	✅	❌
Approve Milestone	❌	❌	✅	❌	❌
Raise Dispute	❌	❌	✅	✅	❌

T