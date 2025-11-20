# Cursor Composer Guidelines

## Overview

This document provides high-level guidelines for AI agents working on this codebase. Follow these principles to maintain code quality, consistency, and architectural integrity.

## Core Principles

### SOLID Principles (MUST FOLLOW)

- **Single Responsibility**: Each class/method should have one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for their base types
- **Interface Segregation**: Many specific interfaces > one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

### Architectural Patterns

- **Creational**: Use Factory Method pattern instead of constructor overloading for clarity
- **Structural**: Use DTOs to decouple layers (never expose entities directly)
- **Behavioral**: Use Strategy pattern for varying algorithms

## Backend (Spring Boot) Guidelines

### Structure & Organization

- **Controllers**: Handle HTTP requests/responses only, delegate to services
- **Services**: Contain business logic, use repositories for data access
- **Repositories**: Handle database operations only
- **DTOs**: Always use DTOs for API boundaries, never expose entities directly

### Environment Variables

- **Required**: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` (set via `set_env.sh`)
- **Important**: Must source `set_env.sh` before running backend (e.g., `source set_env.sh && mvn spring-boot:run`)
- **Error Handling**: If environment variables are not set, the application will fail to start with clear error message
- **Configuration**: Database configuration is in `application.properties` - uses environment variables for security

### Code Quality

- **Lombok**: Use `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor` to reduce boilerplate
- **Comments**: Brief, explain WHY not WHAT. Inline comments use 1 space after code
- **Imports**: Always use import statements instead of fully qualified class names (e.g., use `Admin` not `com.acm.cinema_ebkg_system.model.Admin`)
- **Mappers/Factories**: Use dedicated Mapper classes for DTO creation (located in `mapper/` package at root level, not under `dto/`)
- **Nullability**: Nullable fields in DTOs are acceptable (Spring Boot convention)

### DTO Best Practices

- One DTO per use case (e.g., `UserUpdateRequest` vs `PasswordChangeRequest`)
- Use Factory Method pattern for complex DTO creation
- Mapper classes located in `mapper/` package at root level (e.g., `UserDtoFactory`)
- Never return entities directly - always wrap in DTOs
- Remove deprecated fields instead of keeping them

### Pagination Patterns

- **Use Spring Data's Pageable**: Always use `Pageable` and `Page<T>` for paginated queries in repositories
- **Pagination DTOs**: Create dedicated pagination response DTOs (e.g., `PaginatedMovieResponse`) that include:
  - List of items for current page
  - Current page number
  - Total pages
  - Total elements
  - Has next/previous flags
  - Page size
- **Repository Pattern**: Use `PageRequest.of(page, size)` in services to create `Pageable` instances
- **Default Page Size**: Use consistent page sizes (e.g., 8 items per page for movie listings)
- **Controller Parameters**: Accept `page` parameter with `@RequestParam(defaultValue = "0")` for 0-based pagination
- **Frontend Caching**: Cache paginated responses per page to avoid redundant API calls
- **Navigation**: Provide next/previous navigation and pagination dots for direct page access

### User DTOs Reference

**All User DTOs are necessary and serve different purposes:**

1. **`AuthResponse.UserDto`** (`dto/auth/AuthResponse.java`)

   - Inner class for authentication responses
   - Used in login, register, refresh token endpoints
   - Created via `UserDtoFactory` methods
   - **Fields**: `id`, `email`, `firstName`, `lastName`, `phoneNumber` (minimal for performance)
   - **Purpose**: Keep auth responses minimal - profile-specific data (profileImageLink, enrolledForPromotions) is in UserProfileDTO
   - **Rationale**: Auth responses are frequent (login, refresh) - don't send large profile images

2. **`UserProfileDTO`** (`dto/user/UserProfileDTO.java`)

   - Response DTO for GET `/api/user/profile`
   - Contains `UserDto` (via factory) + `AddressDTO` + `profileImageLink` + `enrolledForPromotions`
   - Used for displaying user profile page
   - **Fields**: 
     - `user: UserDto` (basic user info)
     - `homeAddress: AddressDTO` (address info)
     - `profileImageLink: String` (top-level, optional) - profile image URL
     - `enrolledForPromotions: Boolean` (top-level, optional) - promotions enrollment status
   - **Purpose**: Complete profile data - includes profile-specific fields not in auth responses
   - **Rationale**: Profile image can be large (100KB+ as base64) - only fetch when needed (profile page), not on every auth call

3. **`UserUpdateRequest`** (`dto/user/UserUpdateRequest.java`)

   - Request DTO for PUT `/api/user/info`
   - Contains profile update fields (name, phone, address, etc.)
   - Follows SRP: only handles profile updates

4. **`PasswordChangeRequest`** (`dto/user/PasswordChangeRequest.java`)
   - Request DTO for PUT `/api/user/change-password`
   - Contains password change fields
   - Follows SRP: only handles password changes

### DTO Design Principles

**Why profileImageLink and enrolledForPromotions are NOT in UserDto:**
- ✅ **Performance**: Auth responses (login, refresh) are frequent - don't send large profile images
- ✅ **SOLID Principles**: Separation of concerns - auth responses handle auth, profile responses handle profile data
- ✅ **Scalability**: Profile images can be large (100KB+ as base64) - sending them with every auth response is wasteful
- ✅ **Clear Separation**: Auth endpoints return minimal user data, profile endpoints return complete profile data
- ✅ **Frontend Flexibility**: Frontend can fetch profile data when needed (profile page), not on every auth call

**If needed in the future:**
- `enrolledForPromotions` (boolean) could be added to `UserDto` if frontend needs it immediately after login (minimal impact)
- `profileImageLink` should NEVER be added to `UserDto` (too large for frequent auth responses)

### Before Creating New Code

1. Check existing controllers, services, repositories for similar functionality
2. Identify redundancies and opportunities for consolidation
3. Ensure new code follows existing patterns
4. Verify no duplicate DTOs exist for same purpose

### Legacy Code & File Management

- **Check Usage Before Deletion**: Before deleting or modifying any file, verify:
  1. Search codebase for imports/references (use `grep` or codebase search)
  2. Check if used in frontend (API calls, imports)
  3. Check if used in backend (controllers, services, repositories)
  4. Document if legacy/unused before removal
- **Legacy Code Identification**: Look for:
  - Unused controllers/services (no frontend calls)
  - Deprecated DTOs (replaced by newer versions)
  - Duplicate functionality (old vs new implementation)
  - Dead code paths (commented out, TODO markers)
- **Refactoring Safety**: When removing legacy code:
  - Ensure replacement exists and works
  - Update all references before deletion
  - Consider deprecation warnings before removal

## Frontend (Next.js/React) Guidelines

### Component Organization

- **Common Components**: Reusable UI components (`components/common/`)
- **Specific Components**: Feature-specific components (`components/specific/`)
- **Contexts**: Global state management (`contexts/`)
- **Custom Hooks**: Reusable logic (`hooks/`)

### Code Quality

- **Decoupling**: Use Context API and custom hooks to avoid prop drilling
- **Facade Pattern**: Create facade layers for complex interactions (e.g., `usePaymentCards` hook)
- **Comments**: Comment complex logic and new concepts, avoid verbose explanations
- **No Spaghetti Code**: Keep components focused, extract logic to hooks/services
- **Component Size**: Max 200-300 lines, split if larger
- **State Management**: Max 5-7 useState hooks per component, extract to custom hook if more
- **Business Logic**: Extract API calls, data fetching, complex logic to custom hooks
- **Utilities**: Extract pure functions (formatting, validation) to `utils/` folder

### Component Best Practices

- **Single Responsibility**: Component should only handle UI rendering
- **Extract State**: If component has >5 useState hooks, create custom hook
- **Extract API Calls**: All fetch/API logic should be in hooks, not components
- **Extract Formatting**: Display formatting functions go in `utils/` folder
- **Facade Pattern**: Use custom hooks as facades for complex operations (API + state + error handling)

### Custom Hooks Guidelines

- **When to Create**: Extract when logic is reused OR component has >5 useState hooks
- **Naming**: Use `use` prefix (e.g., `usePaymentCards`, `useUserId`)
- **Facade Pattern**: Hook should encapsulate all related operations (fetch, create, update, delete)
- **Return Value**: Return object w/ state + functions (e.g., `{ data, loading, error, create, update, delete }`)
- **React-Specific Only**: Hooks MUST use React features (useState, useEffect, useContext, etc.)
- **Cannot Use in Non-React Contexts**: Hooks can only be called in components/other hooks (NOT in config files, services, tests)

### Utility Functions Guidelines

- **When to Create**: Pure functions or functions with minimal side effects that don't need React
- **Naming**: No `use` prefix (e.g., `getAuthToken`, `displayCardNumber`)
- **Pure Functions**: Same input → same output, no side effects (or minimal, controlled side effects)
- **No React Dependencies**: Utils should NOT use React hooks or React-specific features
- **Reusable Everywhere**: Utils can be used in components, hooks, services, config files, tests
- **Common Use Cases**: Formatting, validation, calculations, data transformations, API helpers
- **Hooks Can Use Utils**: Hooks can import and use utility functions (but utils cannot use hooks)

### Hooks vs Utils Decision Tree

**Use Utils (`utils/`) when:**
- ✅ Pure function (no side effects, predictable)
- ✅ No React dependencies (don't need hooks)
- ✅ Used in non-React contexts (config files, services, tests)
- ✅ Simple transformations (formatting, validation, calculations)
- ✅ Reusable logic that doesn't need React state

**Use Hooks (`hooks/useX.ts`) when:**
- ✅ Need React state (`useState`, `useReducer`)
- ✅ Need React lifecycle (`useEffect`, `useLayoutEffect`)
- ✅ Need React context (`useContext`)
- ✅ Need React features (memoization, refs, etc.)
- ✅ Component-specific logic (tied to component lifecycle)

**Example Pattern:**
```typescript
// ✅ GOOD: Hook uses utility
// utils/auth.ts
export function getAuthToken(): string | null { /* ... */ }

// hooks/useUser.ts
import { getAuthToken } from '@/utils/auth';
export function useUser() {
  const token = getAuthToken();  // Hook uses utility
  // ... React state management
}
```

### Auth Utilities (CRITICAL - NO DUPLICATION)

- **Centralized Auth**: Always use `utils/auth.ts` functions instead of duplicating token retrieval
- **Token Retrieval**: Use `getAuthToken()` instead of `localStorage.getItem('token') || sessionStorage.getItem('token')`
- **User ID Decoding**: Use `getUserIdFromToken()` (returns `number | null`) - handles SSR automatically
- **Null Handling**: Always use `null` for missing values, never `0` as a sentinel. Use nullish coalescing (`??`) not logical OR (`||`) when falling back
- **Before Adding Auth Logic**: 
  1. Check if `utils/auth.ts` already has the function
  2. Search codebase for duplicate token retrieval patterns (`grep` for `localStorage.getItem('token')`)
  3. Refactor existing code to use centralized utilities
  4. Never duplicate JWT decoding logic - always use `getUserIdFromToken()`
- **Common Patterns to Avoid**:
  - ❌ `const token = localStorage.getItem('token') || sessionStorage.getItem('token');` → ✅ `const token = getAuthToken();`
  - ❌ Manual JWT decoding in components/hooks → ✅ `getUserIdFromToken()` or `useUserId()` hook
  - ❌ Duplicate `getUserIdFromToken()` functions → ✅ Import from `utils/auth.ts`
  - ❌ `userId || getUserIdFromToken()` (breaks if userId is 0) → ✅ `userId ?? getUserIdFromToken()`
  - ❌ Returning `0` for missing userId → ✅ Return `null` and handle it properly

### Before Creating New Code

1. Check if existing components/hooks can be reused
2. Use Context API for shared state instead of prop drilling
3. Extract complex logic to custom hooks
4. Ensure proper separation of concerns
5. Check component size - split if >300 lines
6. Count useState hooks - extract to hook if >5

## Environment Variables

- Windows: Set via `set_env.ps1`
- Mac/Linux: Set via `set_env.sh`
- Never hardcode environment-specific values

## Commenting Standards

- **Brief**: One sentence explaining purpose or design decision
- **Non-verbose**: Avoid explaining obvious code
- **Design-focused**: Mention SOLID principles or patterns when relevant
- **Inline format**: `code  // Brief explanation (1 space after code)`
- **Abbreviations**: Use "w/" instead of "with", "&" instead of "and" to keep comments concise
- **Examples**: 
  - ✅ `// Fetch cards w/ error handling`
  - ✅ `// User data & preferences`
  - ❌ `// Fetch payment cards with error handling`
  - ❌ `// User data and preferences`

## File Management

- **No MD File Explosion**: Do not create multiple markdown files unless necessary
- **Documentation**: Update existing docs instead of creating new ones
- **Temporary Files**: Clean up analysis/temporary files after use

## Code Review Checklist

When reviewing or modifying code, ensure:

- [ ] Follows SOLID principles
- [ ] Uses appropriate design patterns
- [ ] No redundant code/DTOs
- [ ] Proper use of Lombok annotations
- [ ] Comments are brief and meaningful
- [ ] No entities exposed directly (use DTOs)
- [ ] Mapper/Factory methods in dedicated Mapper classes (located in `mapper/` package, not static methods in DTOs)
- [ ] Import statements used instead of fully qualified names
- [ ] Frontend uses proper component/hook structure
- [ ] Components are <300 lines (split if larger)
- [ ] Components have <7 useState hooks (extract to hook if more)
- [ ] API calls are in hooks, not components
- [ ] Formatting functions are in utils, not components
- [ ] Auth utilities centralized (no duplicate token retrieval/JWT decoding)
- [ ] Using `getAuthToken()` instead of manual `localStorage.getItem('token')`
- [ ] Using `getUserIdFromToken()` instead of manual JWT decoding
- [ ] Legacy/unused code identified and removed or documented
- [ ] File usage verified before deletion/modification
- [ ] **Dependency analysis completed** (see "Dependency & Breakage Analysis" section)
- [ ] **SSR/hydration edge cases considered**
- [ ] **Null handling verified** (no `0` sentinels, proper `null` checks)
- [ ] **Type signature changes verified** (backward compatibility checked)

## Dependency & Breakage Analysis (CRITICAL)

**Before modifying any code, you MUST:**

### 1. Trace All Usages
- Use `grep` to find all imports/usages of the function/component/hook
- Use codebase search to find indirect dependencies
- Check both frontend and backend if applicable
- Verify no other files import or depend on what you're changing

### 2. Analyze Type Signature Changes
- **Breaking changes**: Changing `function(x: number)` → `function(x: number | null)`
  - ✅ Backward compatible: `number` can be passed to `number | null`
  - ⚠️ Check all call sites handle `null` properly
- **Removing functions**: If removing `getUserIdFromTokenLegacy()`, verify no imports exist
- **Changing return types**: `number` → `number | null` requires all callers to handle `null`

### 3. Consider Edge Cases
- **SSR (Server-Side Rendering)**: 
  - `localStorage`/`sessionStorage` unavailable → functions return `null`
  - Client-side hydration may have different values → potential hydration mismatch
  - Verify components handle `null` gracefully during SSR
- **Null/undefined handling**:
  - API calls with `null` userId → URL becomes `/api/user/profile?userId=null` (verify backend handles this)
  - `useEffect` dependencies with `null` → may cause unnecessary re-renders
  - Conditional rendering with `null` → ensure UI doesn't break
- **Error states**:
  - Failed API calls → verify error handling doesn't crash
  - Missing tokens → verify graceful degradation
  - Network failures → verify user feedback

### 4. Verify Hook Dependencies
- **useEffect dependencies**: Changing `userId` type may affect dependency arrays
- **Hook return values**: Changing hook return types affects all consumers
- **Context providers**: Changing context values affects all consumers

### 5. Test Scenarios
- ✅ **Happy path**: Normal usage works
- ✅ **Null/undefined**: Functions handle missing values
- ✅ **SSR**: Server-side rendering doesn't crash
- ✅ **Hydration**: Client-side hydration matches server
- ✅ **Error states**: Failures are handled gracefully
- ✅ **Type safety**: TypeScript catches type mismatches

### 6. Document Potential Issues
- Add comments for non-obvious edge cases
- Document SSR considerations
- Note any breaking changes in function signatures

### Example Analysis Checklist

When changing `useUser(userId: number)` → `useUser(userId: number | null)`:

- [ ] Find all `useUser(` calls → ✅ Only in `profile/page.tsx`
- [ ] Check `getUserID()` return type → ✅ Returns `number | null`, compatible
- [ ] Verify SSR handling → ✅ `getUserIdFromToken()` returns `null` during SSR
- [ ] Check API call with `null` → ⚠️ URL becomes `?userId=null`, backend must handle
- [ ] Verify error handling → ✅ Hook returns `null` and sets error state
- [ ] Check `useEffect` dependencies → ✅ `[userId]` dependency handles `null` correctly
- [ ] Test hydration → ⚠️ May show error state briefly before client-side fetch

## Decision Making Process

1. **Analyze**: Review existing code patterns and structures
2. **Trace Dependencies**: Find all usages and potential breakage points (see "Dependency & Breakage Analysis")
3. **Argue**: Consider multiple approaches and their trade-offs
4. **Decide**: Choose solution that best fits SOLID principles and existing architecture
5. **Verify**: Check edge cases, SSR, null handling, error states
6. **Document**: Add brief comments explaining design decisions and edge cases

## Frontend SOLID Refactoring Checklist

**Before creating new components or hooks:**

1. **Component Size Check**:
   - Is component >300 lines? → Split into smaller components
   - Does component have >7 useState hooks? → Extract to custom hook

2. **State Management Check**:
   - Are API calls in component? → Move to custom hook
   - Is business logic in component? → Extract to hook or utility
   - Is token/auth logic repeated? → Use `getAuthToken()` from `utils/auth.ts` or `useUserId()` hook
   - Are you manually getting tokens? → Use `getAuthToken()` instead
   - Are you decoding JWT tokens? → Use `getUserIdFromToken()` from `utils/auth.ts`

3. **Facade Pattern Opportunities**:
   - Complex operations (API + state + errors)? → Create facade hook
   - Multiple related operations? → Group in single hook (e.g., `usePaymentCards`)

4. **Utility Extraction**:
   - Formatting functions? → Move to `utils/` folder
   - Validation logic? → Move to `utils/` folder
   - Pure functions (no side effects)? → Move to `utils/` folder

5. **Existing Hooks Check**:
   - Does similar hook already exist? → Reuse or extend
   - Is hook outdated? → Update before creating new one

## Frontend/Backend Compatibility Checks

**Before making changes that affect API contracts:**

1. **Verify Field Names Match**: 
   - Check frontend TypeScript interfaces match backend DTO field names
   - Verify enum serialization (Jackson serializes enums to string by default)
   - Ensure camelCase/snake_case consistency

2. **Test API Endpoints**:
   - Registration flow (uses PaymentCardDTO for requests)
   - Payment card CRUD operations (uses PaymentCardResponseDTO for responses)
   - Verify frontend can parse responses correctly

3. **Check Type Compatibility**:
   - Backend Long/Integer → Frontend number
   - Backend Boolean → Frontend boolean
   - Backend Enum → Frontend string (verify serialization)
   - Backend String → Frontend string

4. **Response DTO Changes**:
   - If changing response DTOs, verify frontend types are updated
   - Test that existing frontend code still works
   - Check for null/undefined handling

5. **Request DTO Changes**:
   - Verify frontend sends correct field names
   - Check optional vs required fields
   - Test with empty/null values

## Reference Documents

**Always refer to CURSOR_GUIDELINES.md** when:
- Making architectural decisions
- Creating new DTOs or services
- Refactoring existing code
- Removing or modifying files
- Implementing new features

This ensures consistency with established patterns and principles.
