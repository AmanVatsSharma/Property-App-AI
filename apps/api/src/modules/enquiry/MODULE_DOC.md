# Module: enquiry

**Short:** Property enquiries (buyer messages to listing owner).

**Purpose:** Signed-in users can send a message about a listing; owner and admin can view received enquiries; sender can view sent enquiries.

**Files:**
- `enquiry.module.ts` — Nest module; imports PropertyModule, UserModule.
- `entities/enquiry.entity.ts` — Enquiry (id, propertyId, fromUserId, ownerUserId, message, phone, status, createdAt, updatedAt).
- `dtos/create-enquiry.input.ts` — CreateEnquiryInput (propertyId, message, phone optional).
- `repository/enquiry.repository.ts` — findById, findByPropertyId, findByOwnerUserId, findByFromUserId, create, updateStatus.
- `services/enquiry.service.ts` — send(fromUserId, input), myReceived(ownerUserId), mySent(fromUserId).
- `resolvers/enquiry.resolver.ts` — sendEnquiry(input), myReceivedEnquiries, mySentEnquiries; auth required.

**APIs (GraphQL):**
- **Mutation `sendEnquiry(input)`** — Create enquiry; sets ownerUserId from property. Auth required.
- **Query `myReceivedEnquiries`** — Enquiries on my listings. Auth required.
- **Query `mySentEnquiries`** — Enquiries I sent. Auth required.

**Change-log:**
- 2026-03-18: Initial module (migration CreateEnquiry, entity, repository, service, resolver).
