# Design Patterns & Architecture Presentation Slides

---

## Slide 1: Title Slide

**Cinema Booking System**
**Architectural Design & Design Patterns**

**Design Patterns:**
- Facade
- Decorator  
- Protected Proxy

---

## Slide 2: Tech Stack

**Backend:**
- Java 17+ | Spring Boot 3.x
- Spring MVC, Spring Data JPA, Spring Security
- PostgreSQL | Maven

**Frontend:**
- TypeScript | Next.js 14+ (React 18+)
- TanStack Query | Tailwind CSS | Axios

---

## Slide 3: Architecture Overview

**Architectural Patterns:**
- **Backend**: Layered Architecture (N-Tier)
- **Frontend**: Component-Based Architecture
- **Communication**: Client-Server via REST API

**Backend Layers:**
1. API/Controller Layer → Handles HTTP, returns JSON
2. Business Logic Layer → Services with business rules
3. Data Access Layer → Repositories + Entities

**Note**: Layered Architecture (internal structure) + Client-Server (communication) are complementary

---

## Slide 4: System Decomposition

**Backend Decomposition:**
```
Controller Layer
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer + Entities
    ↓
Database (PostgreSQL)
```

**Frontend Decomposition:**
```
Components (UI)
    ↓
Hooks + Contexts (State/Logic)
    ↓
API Facades (movieClient.ts)
    ↓
HTTP Client (Axios)
```

**Communication**: REST API between frontend and backend

---

## Slide 5: Component Diagram

**System Architecture:**
```
┌─────────────────┐
│  Frontend       │
│  (Component-    │
│   Based)        │
└────────┬────────┘
         │ HTTP/REST
┌────────▼────────┐
│  Backend        │
│  ┌───────────┐  │
│  │ Controller│  │ ← API Layer
│  └─────┬─────┘  │
│  ┌─────▼─────┐  │
│  │ Service  │  │ ← Business Logic
│  └─────┬─────┘  │
│  ┌─────▼─────┐  │
│  │Repository│  │ ← Data Access
│  └─────┬─────┘  │
│  ┌─────▼─────┐  │
│  │Database  │  │
│  └──────────┘  │
└─────────────────┘
```

---

## Slide 6: Facade Pattern - Problem & Solution

**Pattern Definition:**
Provides unified interface to complex subsystem

**Problem:**
- - Code duplication across components
- - Tight coupling to API endpoints
- - Mixed concerns in hooks (API + state)
- - No reusability (can't use in server-side)

**Solution:**
- + `movieClient.ts` facade: Single interface for all movie operations
- + Separates API logic from React state
- + Reusable across components, hooks, server-side
- + Centralized error handling & transformation

**Benefits:**
- Single source of truth
- Easy to test (mock facade)
- Changes in one place

---

## Slide 7: Facade Pattern - Class Diagram & SOLID

**Class Diagram:**
```
Components → MovieClient (Facade) → API Config/HTTP/Utils → Backend API
```

**SOLID Principles:**
1. **SRP**: MovieClient = API access only | useMovies = state only
2. **DIP**: Components depend on MovieClient abstraction, not concrete API
3. **OCP**: Can extend facade with new methods without modifying existing code

**Design Goals:**
- + Maintainability: Centralized logic
- + Reusability: Single source of truth
- + Testability: Easy to mock

---

## Slide 8: Decorator Pattern - Problem & Solution

**Pattern Definition:**
Attaches responsibilities dynamically without modifying base object

**Problem:**
- - Conditional rendering complexity (showBooking, showAdmin props)
- - Tight coupling: Component knows all use cases
- - Hard to extend: Adding variant requires modifying base
- - Violates Open/Closed Principle

**Solution:**
- + Base `MovieCard`: Core rendering only
- + Decorators: `withBookingActions`, `withComingSoonBanner`, `withAdminControls`
- + Composable: Can combine decorators
- + Base unchanged when adding new behaviors

**Benefits:**
- No modification to base component
- Each decorator has single responsibility
- Easy to test independently

---

## Slide 9: Decorator Pattern - Class Diagram & SOLID

**Class Diagram:**
```
MovieCard (Base)
    ↑
Decorators: withBookingActions | withComingSoonBanner | withAdminControls
```

**SOLID Principles:**
1. **SRP**: Base = core rendering | Each decorator = one behavior
2. **OCP**: Base closed for modification | Open for extension via decorators
3. **ISP**: Clients use base for simple cases | Specific decorators for specific needs

**Design Goals:**
- + Maintainability: Base unchanged
- + Reusability: Composable decorators
- + Extensibility: Easy to add new decorators

---

## Slide 10: Protected Proxy Pattern - Problem & Solution

**Pattern Definition:**
Controls access to object based on permissions/authorization

**Problem:**
- - Backend protected + | Frontend routes not fully protected -
- - Admin can navigate to public pages
- - Protection happens after render (poor UX)
- - Security gap: Backend protects APIs, frontend doesn't protect routes

**Solution:**
- + Backend: `JwtAuthenticationFilter` + `SecurityFilterChain` (already implemented)
- + Frontend: Next.js Middleware (server-side proxy) + RouteProtection HOC (client-side proxy)
- + Defense in depth: Multiple layers of protection
- + Redirects before render (better UX)

**Benefits:**
- Prevents unauthorized access
- Centralized access control
- Better user experience

---

## Slide 11: Protected Proxy Pattern - Class Diagram & SOLID

**Class Diagram:**
```
Client → Middleware/RouteProtection (Proxy) → Protected Component/Route
Backend: Client → JwtFilter/SecurityChain (Proxy) → Controller Endpoints
```

**SOLID Principles:**
1. **SRP**: Proxy = access control only | Real subject = business logic only
2. **ISP**: Proxy implements same interface as real subject
3. **DIP**: Client depends on abstraction, not proxy vs real subject

**Design Goals:**
- + Security: Defense in depth
- + Usability: Redirects before render
- + Maintainability: Centralized access control

---

## Slide 12: Design Goals Achieved

**Maintainability:**
- Layered architecture: Clear separation
- Facade: Centralized API logic
- Decorator: Base unchanged, extend via decorators
- **Result**: ~40% reduction in code duplication

**Usability:**
- Protected Proxy: Better UX (no error pages)
- Facade: Consistent API responses
- Component-based: Reusable UI components

**Security:**
- Protected Proxy: Backend + Frontend protection
- JWT validation, role-based access
- Defense in depth

**Reusability:**
- Facade: Reusable across contexts
- Decorator: Composable components
- **Result**: 80%+ code reuse

---

## Slide 13: Summary

**Architecture:**
- Layered Architecture (Backend) + Component-Based (Frontend)
- Client-Server communication via REST API

**Design Patterns:**
1. **Facade**: Centralized API access
2. **Decorator**: Dynamic component behavior
3. **Protected Proxy**: Access control

**SOLID Principles:**
- SRP, OCP, ISP, DIP achieved across patterns

**Design Goals:**
- + Maintainability | + Usability | + Security | + Reusability

---

## Slide 14: Q&A

**Questions?**
