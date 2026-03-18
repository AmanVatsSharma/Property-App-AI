# Module: broker

**Short:** Broker verification flow — user requests broker status; admin approves or rejects.

**Purpose:** A user can request broker verification via `requestBrokerVerification`. The request is stored with status `pending`. An admin uses `reviewBrokerRequest` to approve (which sets the user's role to BROKER) or reject (with optional note). Until approved, the user remains in `user` role.

**Files:**
- `broker.module.ts` — Nest module; TypeOrmModule.forFeature([BrokerRequest]), UserModule; JsonScalar, repository, service, resolver.
- `entities/broker-request.entity.ts` — BrokerRequest (id, userId, status, documents, adminNote, reviewedAt, reviewedByUserId, createdAt, updatedAt).
- `repository/broker-request.repository.ts` — findByUserId, findById, create, updateStatus.
- `services/broker-request.service.ts` — requestBrokerVerification, approveBrokerRequest, rejectBrokerRequest.
- `dtos/request-broker-verification.input.ts` — Optional documents. `dtos/review-broker-request.input.ts` — requestId, action (approve|reject), adminNote optional.
- `resolvers/broker-request.resolver.ts` — requestBrokerVerification (auth), reviewBrokerRequest (AdminGuard).

**APIs (GraphQL):**
- **Mutation `requestBrokerVerification(input?)`** — Creates or returns existing pending request. Auth required. Throws if already broker or already approved.
- **Mutation `reviewBrokerRequest(input)`** — Admin only. input: requestId, action ('approve'|'reject'), adminNote?. Approve calls UserService.setRole(userId, BROKER).

**Change-log:**
- 2026-03-18: Initial module (migration CreateBrokerRequest, entity, repository, service, resolver).
