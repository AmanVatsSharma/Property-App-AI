# Module: area

**Short:** Persisted Area (locality/city) entities with assessed scores for region/livability; get-or-create and LLM-based or external assessment.

**Purpose:** Store locations and areas with livability, connectivity, schools, safety, price trend, and amenities summary. Used by agent tools **get_neighbourhood_score**, **assess_region**, and **score_property** to resolve a property's locality and reuse or create assessed region data.

**Files:**
- area.module.ts — Nest module
- entities/area.entity.ts — Area entity (locality, city, normalized keys, scores, lastAssessedAt)
- repository/area.repository.ts — findByLocalityAndCity, create, update
- services/area.service.ts — getOrCreate(locality, city, { assessIfMissing })
- services/area-assessor.service.ts — LLM-based assessment (structured output), TTL, needsAssessment; uses **AreaDataProvider** when implemented (AREA_PROVIDER), else LLM or fallback scores
- controllers/neighbourhood.controller.ts — REST GET /api/v1/neighbourhood (public)
- dtos/neighbourhood-query.dto.ts — Query DTO for locality, city
- prompts/area-assess.prompt.ts — Prompt for locality assessment JSON
- providers/area-data-provider.interface.ts — **AreaDataProvider** interface and **AreaData** type for pluggable external area data (e.g. AREA_PROVIDER=mapbox when implemented)

**Dependencies:** TypeORM (Area entity), LoggerModule, ConfigService; agent config (AGENT_CONFIG_KEYS) for provider and API keys.

**APIs:**
- **GET /api/v1/neighbourhood** (public, no auth): Query params `locality` (required), `city` (optional). Returns area scores: locality, city, livabilityScore, connectivityScore, schoolsScore, safetyScore, priceTrendPctAnnual, amenitiesSummary, lastAssessedAt. Calls AreaService.getOrCreate(locality, city, { assessIfMissing: true }); triggers assessment if area is missing or stale.

**Flow:** **Agent tool** calls **AreaService.getOrCreate**(locality, city, { assessIfMissing: true }) → find or create **Area** → if missing/stale, **AreaAssessorService.assess**(area) (LLM or external **AreaDataProvider** when implemented) → persist scores and **lastAssessedAt** → return **Area**. When LLM keys are unset or LLM fails, **AreaAssessorService** uses fixed fallback scores (see Fallback scores below).

**Env vars:**
- AREA_ASSESSMENT_TTL_DAYS — re-assess only if older than this (default 30)
- AREA_PROVIDER — `none` (LLM only) or `mapbox` (when implemented)
- OPENAI_API_KEY / ANTHROPIC_API_KEY — when set, LLM is used for assessment; when missing or when LLM fails, fallback scores are used (see below).

**MVP/deploy:** Area metadata only; no mock listing data. Set OPENAI_API_KEY or ANTHROPIC_API_KEY for LLM-based assessment; fallback scores when unset or on LLM failure.

**Fallback scores (no mock listing data):** When `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY` for anthropic provider) is not set, when the LLM invocation fails, or when the LLM response is missing or unparseable, `AreaAssessorService` uses a fixed fallback result: livability 75, connectivity 70, schools 70, safety 75, price trend 8% annual, and a generic amenities summary. This is backend-only (area metadata); it does not create fake property listings. For production, set an LLM provider to get real locality assessments. Optionally label or filter areas in the UI when `dataSource` or assessment method indicates fallback.

**Change-log:**
- 2026-03-15: Added HTTP API GET /api/v1/neighbourhood (NeighbourhoodController, NeighbourhoodQueryDto); public route for web app; returns locality, city, scores, priceTrendPctAnnual, amenitiesSummary, lastAssessedAt.
- 2026-03-15: MVP readiness: fallback scores (when LLM missing/fails) documented; no mock listing data.
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2025-03-13: Added area module: entity, migration, repository, AreaService.getOrCreate, AreaAssessorService (LLM-based assessment with TTL), area-assess prompt, AreaDataProvider interface. Agent tools get_neighbourhood_score, score_property, and new assess_region use AreaService; score_property persists aiScore/aiTip using area + property. docs/EXTERNAL_DATA_SOURCES.md for external data options.
- 2025-03-13: Documented fallback scores when LLM keys missing or LLM fails (no mock listing data; area metadata only).
