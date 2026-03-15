# API Test Result Summary

**Date:** 2025-03-14  
**Scope:** API unit tests + API e2e tests (from repo root).

---

## 1. API Unit Tests

**Command:** `npx nx run api:test` (from repo root).

### Result: **Partial pass** (5 passed, 2 failed)

| Suite | Result | Notes |
|-------|--------|--------|
| `auth.service.spec.ts` | ✅ PASS | Auth OTP verify, role assignment (admin/broker) |
| `property.service.spec.ts` | ✅ PASS | PropertyService CRUD, free/paid listing, errors |
| `admin.resolver.spec.ts` | ✅ PASS | setUserRole (admin-only) |
| `roles.guard.spec.ts` | ✅ PASS | Role-based access |
| `agent-rate-limit.guard.spec.ts` | ✅ PASS | Agent rate limiting |
| `agent-tools.spec.ts` | ❌ FAIL | Suite failed to run (see below) |
| `agent-orchestrator.spec.ts` | ❌ FAIL | Suite failed to run (see below) |

**Total:** 7 suites, **26 tests passed** (all tests in the 5 passing suites), 2 suites did not run.

### Failure cause (agent specs)

Both agent specs fail at **load time** (no assertion failures). Jest hits ESM in `node_modules` and throws:

- **Error:** `SyntaxError: Cannot use import statement outside a module`
- **Trigger:** Imports such as `@langchain/core/tools`, `@langchain/openai` pull in code that uses `p-retry` (ESM). Jest’s default config does not transform these packages.
- **Location:** `node_modules/p-retry/index.js` (and transitive LangChain deps).

**No test mocks were changed**; the failures are due to Jest/Node ESM handling of dependencies.

---

## 2. API E2E Tests

**Command:** `npx nx run api-e2e:e2e` (from repo root).

### Result: **Did not run**

**Error:** Jest could not parse the TypeScript config file:

```text
Jest: 'ts-node' is required for the TypeScript configuration files.
Cannot find package 'ts-node' imported from ... jest-config/build/readConfigFileAndSetRootDir.js
```

- **Config:** `apps/api-e2e/jest.config.ts` is TypeScript; Nx/Jest use `ts-node` to load it.
- **Cause:** `ts-node` is not installed in the repo (not in `package.json`).
- **Note:** The e2e target has `dependsOn: ["api:build", "api:serve"]`; build was run from cache and serve was started before the e2e target failed during Jest config parsing.

---

## 3. Coverage (unit tests only, agent specs excluded)

**Command:** `npx nx run api:test --coverage --testPathIgnorePatterns=agent`

| Area | Stmts | Branch | Funcs | Lines | Notes |
|------|-------|--------|-------|-------|--------|
| **All files** | 15.67% | 13.8% | 6.25% | 15.01% | Many modules untested |
| **Property** | | | | | |
| `property.service.ts` | 90.38% | 76.92% | 85.71% | 90% | Good |
| `property.repository.ts` | 16.66% | 5.26% | 0% | 12.5% | Low |
| `property.resolver.ts` | 0% | 0% | 0% | 0% | Not tested |
| **Auth** | | | | | |
| `auth.service.ts` | 78.57% | 66.66% | 80% | 76.31% | Good |
| `otp.service.ts` | 22.22% | 33.33% | 0% | 20.68% | Low |
| `auth.resolver.ts` | 0% | 0% | 0% | 0% | Not tested |
| **Admin** | | | | | |
| `admin.resolver.ts` | 68.96% | 76% | 20% | 66.66% | Tested |
| **Guards / common** | | | | | |
| `roles.guard.ts` | 95.65% | 90.9% | 100% | 95% | Good |
| `auth.guard.ts` | 0% | 0% | 0% | 0% | Not tested |
| `http-exception.filter.ts` | 0% | 0% | 0% | 0% | Not tested |

Critical paths **property** and **auth** have solid **service** coverage; **resolvers** and **auth.guard** are uncovered at the unit level.

---

## 4. Flakiness

- **Unit:** No flakiness observed in the 5 passing suites (single run).
- **E2E:** Not run; no flakiness data.
- **Nx:** One message was shown: “Nx detected a flaky task: api:build” — may be environmental/cache; build completed from cache in this run.

---

## 5. Coverage Gaps (critical paths)

- **Property:** `PropertyResolver` has no unit tests (create/update/delete/findOne/findAll via GraphQL).
- **Auth:** `AuthResolver` has no unit tests (sendOtp, verifyOtp); `AuthGuard` untested.
- **Admin:** Resolver covered; no additional critical gaps noted for admin.

---

## 6. Suggested Test Additions (1–2 focused)

1. **PropertyResolver unit tests** (`property.resolver.spec.ts`)  
   - Test that `createProperty` / `updateProperty` / `property` / `properties` call `PropertyService` with correct args and return or throw as expected (mocking `PropertyService` and request context).  
   - Covers the main GraphQL property API surface.

2. **AuthResolver unit tests** (`auth.resolver.spec.ts`)  
   - Test that `sendOtp` and `verifyOtp` delegate to `AuthService` with correct inputs and return the DTOs (mocking `AuthService`).  
   - Ensures the auth GraphQL API is wired correctly.

Optional later: **AuthGuard** unit test (inject mock JwtService/ConfigService, assert 401 when token missing/invalid and 200 when valid).

---

## 7. Summary Table

| Item | Status |
|------|--------|
| API unit tests (all) | 5 passed, 2 failed (agent: ESM parse error) |
| API unit tests (excluding agent) | 4 suites, 23 tests passed |
| API e2e tests | Not run (ts-node missing for jest.config.ts) |
| Critical path unit coverage | Property/Auth services good; resolvers and AuthGuard missing |
| Test mocks | Unchanged |

---

## 8. Recommended Next Steps

1. **Fix agent unit tests:** Add `transformIgnorePatterns` (and if needed `moduleNameMapper`) in `apps/api/jest.config.js` so that `p-retry` and/or `@langchain/*` are transformed, or mock LangChain at the boundary in the agent specs so Jest does not load ESM-only deps.
2. **Enable e2e:** Add `ts-node` as a dev dependency and re-run `npx nx run api-e2e:e2e`, or convert `apps/api-e2e/jest.config.ts` to `jest.config.js` so Jest can load it without ts-node.
3. **Improve critical-path coverage:** Add the suggested `property.resolver.spec.ts` and `auth.resolver.spec.ts` unit tests.
