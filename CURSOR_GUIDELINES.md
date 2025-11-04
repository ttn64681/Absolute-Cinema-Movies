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

### User DTOs Reference

**All User DTOs are necessary and serve different purposes:**

1. **`AuthResponse.UserDto`** (`dto/auth/AuthResponse.java`)

   - Inner class for authentication responses
   - Used in login, register, refresh token endpoints
   - Created via `UserDtoFactory` methods

2. **`UserProfileDTO`** (`dto/user/UserProfileDTO.java`)

   - Response DTO for GET `/api/user/profile`
   - Contains `UserDto` (via factory) + `AddressDTO`
   - Used for displaying user profile page

3. **`UserUpdateRequest`** (`dto/user/UserUpdateRequest.java`)

   - Request DTO for PUT `/api/user/info`
   - Contains profile update fields (name, phone, address, etc.)
   - Follows SRP: only handles profile updates

4. **`PasswordChangeRequest`** (`dto/user/PasswordChangeRequest.java`)
   - Request DTO for PUT `/api/user/change-password`
   - Contains password change fields
   - Follows SRP: only handles password changes

### Before Creating New Code

1. Check existing controllers, services, repositories for similar functionality
2. Identify redundancies and opportunities for consolidation
3. Ensure new code follows existing patterns
4. Verify no duplicate DTOs exist for same purpose

## Frontend (Next.js/React) Guidelines

### Component Organization

- **Common Components**: Reusable UI components (`components/common/`)
- **Specific Components**: Feature-specific components (`components/specific/`)
- **Contexts**: Global state management (`contexts/`)
- **Custom Hooks**: Reusable logic (`hooks/`)

### Code Quality

- **Decoupling**: Use Context API and custom hooks to avoid prop drilling
- **Facade Pattern**: Create facade layers for complex interactions
- **Comments**: Comment complex logic and new concepts, avoid verbose explanations
- **No Spaghetti Code**: Keep components focused, extract logic to hooks/services

### Before Creating New Code

1. Check if existing components/hooks can be reused
2. Use Context API for shared state instead of prop drilling
3. Extract complex logic to custom hooks
4. Ensure proper separation of concerns

## Environment Variables

- Windows: Set via `set_env.ps1`
- Mac/Linux: Set via `set_env.sh`
- Never hardcode environment-specific values

## Commenting Standards

- **Brief**: One sentence explaining purpose or design decision
- **Non-verbose**: Avoid explaining obvious code
- **Design-focused**: Mention SOLID principles or patterns when relevant
- **Inline format**: `code  // Brief explanation (1 space after code)`

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

## Decision Making Process

1. **Analyze**: Review existing code patterns and structures
2. **Argue**: Consider multiple approaches and their trade-offs
3. **Decide**: Choose solution that best fits SOLID principles and existing architecture
4. **Document**: Add brief comments explaining design decisions
