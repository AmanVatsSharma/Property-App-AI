# Module: area

**Short:** Persisted Area (locality/city) entities with assessed scores for region/livability; get-or-create and LLM-based or external assessment.

**Purpose:** Store locations and areas with livability, connectivity, schools, safety, price trend, and amenities summary. Used by agent tools get_neighbourhood_score, assess_region, and score_property to resolve a property's locality and reuse or create assessed region data.

**Files:**
- area.module.ts — Nest module
- entities/area.entity.ts — Area entity (locality, city, normalized keys, scores, lastAssessedAt)
- repository/area.repository.ts — findByLocalityAndCity, create, update
- services/area.service.ts — getOrCreate(locality, city, { assessIfMissing })
- services/area-assessor.service.ts — LLM-based assessment (structured output), TTL, needsAssessment
- prompts/area-assess.prompt.ts — Prompt for locality assessment JSON
- providers/area-data-provider.interface.ts — Optional external provider interface

**Flow:** Agent tool calls AreaService.getOrCreate(locality, city, { assessIfMissing: true }) → find or create Area → if missing/stale, AreaAssessorService.assess(area) (LLM or external) → persist scores and lastAssessedAt → return Area.

**Env vars:**
- AREA_ASSESSMENT_TTL_DAYS — re-assess only if older than this (default 30)
- AREA_PROVIDER — `none` (LLM only) or `mapbox` (when implemented)
- OPENAI_API_KEY / ANTHROPIC_API_KEY — when set, LLM is used for assessment; when missing or when LLM fails, fallback scores are used (see below).

**Fallback scores (no mock listing data):** When `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY` for anthropic provider) is not set, or when the LLM invocation fails, `AreaAssessorService` uses a fixed fallback result: livability 75, connectivity 70, schools 70, safety 75, price trend 8% annual, and a generic amenities summary. This is backend-only (area metadata); it does not create fake property listings. For production, set an LLM provider to get real locality assessments. Optionally label or filter areas in the UI when `dataSource` or assessment method indicates fallback.

**Change-log:**
- 2025-03-13: Added area module: entity, migration, repository, AreaService.getOrCreate, AreaAssessorService (LLM-based assessment with TTL), area-assess prompt, AreaDataProvider interface. Agent tools get_neighbourhood_score, score_property, and new assess_region use AreaService; score_property persists aiScore/aiTip using area + property. docs/EXTERNAL_DATA_SOURCES.md for external data options.
- 2025-03-13: Documented fallback scores when LLM keys missing or LLM fails (no mock listing data; area metadata only).
