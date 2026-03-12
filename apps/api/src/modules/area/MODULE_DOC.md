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

**Change-log:**
- 2025-03-13: Added area module: entity, migration, repository, AreaService.getOrCreate, AreaAssessorService (LLM-based assessment with TTL), area-assess prompt, AreaDataProvider interface. Agent tools get_neighbourhood_score, score_property, and new assess_region use AreaService; score_property persists aiScore/aiTip using area + property. docs/EXTERNAL_DATA_SOURCES.md for external data options.
