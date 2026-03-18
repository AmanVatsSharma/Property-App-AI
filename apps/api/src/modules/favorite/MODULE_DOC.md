# Module: favorite

**Short:** User saved properties (favorites).

**Purpose:** Allow signed-in users to save/unsave properties and list their saved favorites. Toggle is idempotent (save if not saved, unsave if already saved).

**Files:**
- `favorite.module.ts` — Nest module; registers entity, repository, service, resolver; imports PropertyModule.
- `entities/favorite.entity.ts` — Favorite entity (id, userId, propertyId, property relation, createdAt).
- `repository/favorite.repository.ts` — findByUserAndProperty, findAllByUser, create, delete.
- `services/favorite.service.ts` — toggle, myFavorites, isFavorited.
- `dtos/toggle-favorite-result.dto.ts` — ToggleFavoriteResult (saved: boolean).
- `resolvers/favorite.resolver.ts` — toggleFavorite(propertyId), myFavorites; both require auth.

**APIs (GraphQL):**
- **Mutation `toggleFavorite(propertyId)`** — Toggle save state; returns { saved: boolean }. Auth required.
- **Query `myFavorites`** — List current user's saved favorites (with property). Auth required.

**Change-log:**
- 2026-03-18: Initial module (migration CreateFavorite, entity, repository, service, resolver).
