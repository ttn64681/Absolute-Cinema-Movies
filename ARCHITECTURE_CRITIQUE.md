# Architecture & Design Critique Report
## Cinema E-Booking System

This document provides a comprehensive analysis of the backend and frontend codebase, identifying areas for improvement in terms of architecture, SOLID principles, design patterns, and code structure.

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Backend Analysis](#backend-analysis)
3. [Frontend Analysis](#frontend-analysis)
4. [Cross-Cutting Concerns](#cross-cutting-concerns)
5. [Recommended Improvements](#recommended-improvements)
6. [Design Patterns to Implement](#design-patterns-to-implement)

---

## Executive Summary

### Strengths
- ✅ Clear separation of concerns (Controller → Service → Repository)
- ✅ Use of DTOs for data transfer
- ✅ JWT-based authentication
- ✅ React Context API for state management
- ✅ TypeScript for type safety

### Critical Issues
- ❌ **No global exception handling** - Controllers catch exceptions manually
- ❌ **Inconsistent error responses** - Different error formats across endpoints
- ❌ **No validation layer** - Validation scattered across controllers/services
- ❌ **Tight coupling** - Services directly depend on repositories without abstraction
- ❌ **Missing abstraction layers** - No interfaces for services/repositories
- ❌ **Business logic in controllers** - Controllers contain too much logic
- ❌ **No API versioning** - All endpoints under `/api/`
- ❌ **Hardcoded values** - Magic strings and numbers throughout codebase
- ❌ **Inconsistent naming** - Mix of camelCase and snake_case

---

## Backend Analysis

### 1. Exception Handling & Error Management

#### Current State
**Location**: All Controllers (e.g., `AuthController.java`, `MovieController.java`)

**Issues**:
```java
// AuthController.java:158-162
catch (Exception e) {
    AuthResponse response = new AuthResponse(false, e.getMessage());
    return ResponseEntity.badRequest().body(response);
}
```

**Problems**:
- ❌ Generic `Exception` catching loses specific error types
- ❌ No standardized error response format
- ❌ Error messages exposed directly to clients (security risk)
- ❌ No logging of errors
- ❌ HTTP status codes not properly mapped to error types

**Recommendation**: Implement Global Exception Handler
```java
// Create: exception/GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("USER_NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage()));
    }
}
```

**Files to Create**:
- `exception/GlobalExceptionHandler.java`
- `exception/CustomException.java` (base class)
- `exception/UserNotFoundException.java`
- `exception/ValidationException.java`
- `exception/ResourceNotFoundException.java`
- `dto/ErrorResponse.java`

---

### 2. SOLID Principles Violations

#### Single Responsibility Principle (SRP)

**Violation 1: AuthController.java**
**Location**: `AuthController.java:78-163` (register method)

**Issue**: Controller handles:
- User entity creation
- Address creation
- Payment card creation
- Email service calls
- Token generation

**Current Code**:
```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
    // Creates User entity
    User user = new User();
    user.setEmail(request.getEmail());
    // ... 50+ lines of business logic
    // Creates addresses
    // Creates payment cards
    // Sends emails
}
```

**Fix**: Extract to RegistrationService
```java
@Service
public class RegistrationService {
    public AuthResponse registerUser(RegisterRequest request) {
        User user = userService.registerUser(/*...*/);
        addressService.createAddresses(user, request);
        paymentCardService.createPaymentCards(user, request);
        emailService.sendVerificationEmail(user);
        return buildAuthResponse(user);
    }
}
```

**Violation 2: UserService.java**
**Location**: `UserService.java:196-278` (updatePersonalInfo method)

**Issue**: Method handles:
- User profile updates
- Address updates/creation
- Email sending
- Promotion enrollment logic

**Fix**: Split into separate methods:
- `updateUserProfile()`
- `updateUserAddress()`
- `handlePromotionEnrollment()`

#### Open/Closed Principle (OCP)

**Violation: PaymentService.java**
**Location**: `PaymentService.java:88-132` (updatePaymentInfo)

**Issue**: Manual iteration and index tracking for payment info updates

**Current Code**:
```java
int counter = 0;
int index = -1;
for (PaymentInfo currentPaymentInfo : userPaymentInfos) {
    if (currentPaymentInfo.getPayment_info_id() == paymentInfoId) {
        updatedPaymentInfo = currentPaymentInfo;
        index = counter;
    }
    counter++;
}
```

**Fix**: Use Repository pattern with proper findById
```java
@Repository
public interface PaymentInfoRepository extends JpaRepository<PaymentInfo, Long> {
    Optional<PaymentInfo> findByIdAndUserId(Long paymentInfoId, Long userId);
}
```

#### Dependency Inversion Principle (DIP)

**Violation: All Services**
**Location**: All Service classes

**Issue**: Services depend on concrete Repository implementations, not interfaces

**Current Code**:
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository; // Concrete dependency
}
```

**Fix**: Create repository interfaces (already done) but ensure services depend on interfaces:
```java
@Service
public class UserService {
    private final UserRepository userRepository; // Interface dependency (good)
    
    public UserService(UserRepository userRepository) { // Constructor injection
        this.userRepository = userRepository;
    }
}
```

**Note**: Your code already uses interfaces, but some services use `@Autowired` field injection instead of constructor injection.

---

### 3. Design Patterns Missing

#### Strategy Pattern for Payment Processing

**Location**: `PaymentService.java`, `PaymentCardService.java`

**Issue**: Payment logic is hardcoded. Adding new payment methods requires modifying existing code.

**Recommendation**:
```java
// Create: payment/strategy/PaymentStrategy.java
public interface PaymentStrategy {
    PaymentResult processPayment(PaymentRequest request);
}

// Create: payment/strategy/CreditCardStrategy.java
@Component
public class CreditCardStrategy implements PaymentStrategy {
    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        // Credit card processing logic
    }
}

// Create: payment/strategy/PaymentContext.java
@Service
public class PaymentContext {
    private final Map<String, PaymentStrategy> strategies;
    
    public PaymentResult processPayment(String paymentType, PaymentRequest request) {
        PaymentStrategy strategy = strategies.get(paymentType);
        return strategy.processPayment(request);
    }
}
```

#### Factory Pattern for DTO Creation

**Current**: `UserDtoFactory.java` exists (good!)
**Issue**: Only one factory. Need factories for other DTOs.

**Recommendation**: Create DTO factory interface:
```java
public interface DtoFactory<T, R> {
    R create(T source);
}

@Component
public class MovieDtoFactory implements DtoFactory<Movie, MovieSummary> {
    @Override
    public MovieSummary create(Movie movie) {
        return MovieSummary.fromMovie(movie);
    }
}
```

#### Repository Pattern Enhancement

**Current**: Basic JPA repositories
**Issue**: Complex queries in repositories, business logic mixed with data access

**Recommendation**: Create custom repository implementations:
```java
public interface MovieRepositoryCustom {
    List<Movie> searchWithFilters(MovieSearchCriteria criteria);
}

@Repository
public class MovieRepositoryImpl implements MovieRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public List<Movie> searchWithFilters(MovieSearchCriteria criteria) {
        // Complex query logic
    }
}
```

#### Service Layer Abstraction

**Issue**: No service interfaces, making testing difficult

**Recommendation**:
```java
public interface UserService {
    User registerUser(User user);
    User authenticateUser(String email, String password);
}

@Service
public class UserServiceImpl implements UserService {
    // Implementation
}
```

---

### 4. Code Structure Issues

#### Inconsistent Naming Conventions

**Location**: Throughout codebase

**Issues**:
- `movie_id` (snake_case) vs `movieId` (camelCase)
- `UserService` vs `movieService` (inconsistent casing)
- `PaymentInfo` vs `payment_info_id`

**Recommendation**: Standardize on camelCase for Java, snake_case only for database columns.

#### Magic Strings and Numbers

**Location**: Multiple files

**Examples**:
- `AuthController.java:84` - `"UPCOMING"` hardcoded
- `UserService.java:80` - `user.getPaymentInfos().size() < 3` - magic number
- `SecurityConfig.java:47` - Hardcoded CORS origins

**Fix**: Create constants:
```java
public class MovieConstants {
    public static final String STATUS_UPCOMING = "UPCOMING";
    public static final String STATUS_NOW_PLAYING = "NOW_PLAYING";
}

public class PaymentConstants {
    public static final int MAX_PAYMENT_CARDS = 3;
}
```

#### Missing Validation

**Location**: Controllers

**Issue**: No `@Valid` annotations on request bodies

**Current**:
```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
    // No validation
}
```

**Fix**:
```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    // Validation happens automatically
}
```

And add validation annotations to DTOs:
```java
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
```

---

### 5. Security Issues

#### Hardcoded Credentials

**Location**: `application.properties:39-40`
```properties
spring.mail.username=${MAIL_USERNAME:acm.cinemas123@gmail.com}
spring.mail.password=${MAIL_PASSWORD:nvjouctuvtkpbpul}
```

**Issue**: Default credentials in source code
**Fix**: Remove defaults, require environment variables

#### JWT Secret in Properties

**Location**: `application.properties:11`
```properties
jwt.secret=${JWT_SECRET:pCBbMyt5xLPDQRkpi8MxBHLQTy+P/uaQmJIadJvzktY=}
```

**Issue**: Default secret key in source code
**Fix**: Remove default, require environment variable

#### Debug Statements

**Location**: Multiple service files
- `UserService.java:304-311` - Password logging
- `UserService.java:464-469` - Token logging

**Issue**: Sensitive information in logs
**Fix**: Remove or use proper logging levels

---

## Frontend Analysis

### 1. State Management

#### Context Overuse

**Location**: `contexts/` directory

**Issues**:
- Multiple contexts for related state (AuthContext, ProfileContext)
- No state management library (Redux/Zustand)
- Context re-renders entire tree on state changes

**Current Structure**:
```
AuthContext.tsx - Authentication state
ProfileContext.tsx - User profile state
FiltersContext.tsx - Movie filters
ToastContext.tsx - Toast notifications
RegistrationContext.tsx - Registration form state
```

**Recommendation**: 
- Consolidate related contexts (Auth + Profile)
- Consider Zustand for complex state
- Use React Query for server state (already implemented ✅)

#### Prop Drilling

**Location**: Component tree

**Issue**: Data passed through multiple component layers

**Fix**: Use React Query hooks at component level where needed

---

### 2. API Service Layer

#### Inconsistent API Calls

**Location**: `services/auth.ts`, `hooks/useMovies.ts`

**Issues**:
- Mix of `fetch` and `axios` (axios instance created but not used everywhere)
- No centralized error handling
- Duplicate API configuration

**Current**:
```typescript
// auth.ts uses fetch
const response = await fetch(`${API_BASE_URL}/auth/login`, {...});

// api.ts creates axios instance but it's not used
const api = axios.create({...});
```

**Fix**: Use axios instance everywhere:
```typescript
// services/api.ts
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

---

### 3. Component Architecture

#### Large Components

**Location**: Various component files

**Issue**: Components doing too much (rendering + logic + API calls)

**Recommendation**: Split into:
- **Container Components**: Handle logic and data fetching
- **Presentational Components**: Handle rendering only

#### Missing Error Boundaries

**Location**: `app/layout.tsx`

**Issue**: No error boundaries to catch React errors

**Fix**: Add error boundary:
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  // Error boundary implementation
}

// app/layout.tsx
<ErrorBoundary>
  <AuthProvider>
    {/* ... */}
  </AuthProvider>
</ErrorBoundary>
```

---

### 4. Type Safety

#### Missing Type Definitions

**Location**: Various files

**Issues**:
- `any` types used in some places
- Inconsistent type definitions between frontend and backend

**Recommendation**: 
- Generate TypeScript types from backend DTOs
- Use strict TypeScript configuration
- Remove all `any` types

---

## Cross-Cutting Concerns

### 1. Logging

**Backend**: No structured logging framework
- Uses `System.out.println()` for debugging
- No log levels (INFO, WARN, ERROR)
- No centralized logging configuration

**Recommendation**: Use SLF4J + Logback
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    public User registerUser(User user) {
        logger.info("Registering user with email: {}", user.getEmail());
        // ...
    }
}
```

### 2. Configuration Management

**Backend**: Properties file with hardcoded defaults
**Frontend**: Environment variables with fallbacks

**Recommendation**: 
- Use `@ConfigurationProperties` in Spring Boot
- Create configuration classes for different environments
- Validate configuration on startup

### 3. API Documentation

**Missing**: No API documentation (Swagger/OpenAPI)

**Recommendation**: Add SpringDoc OpenAPI
```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Cinema E-Booking API")
                .version("1.0.0"));
    }
}
```

---

## Recommended Improvements

### Priority 1: Critical (Do First)

1. **Global Exception Handler** - Standardize error responses
2. **Remove Hardcoded Secrets** - Security risk
3. **Add Input Validation** - Security and data integrity
4. **Remove Debug Logging** - Security risk
5. **Error Boundaries** - Frontend error handling

### Priority 2: High (Do Soon)

1. **Extract Business Logic from Controllers** - Better separation
2. **Service Interfaces** - Better testability
3. **Structured Logging** - Better debugging
4. **API Documentation** - Better developer experience
5. **Consolidate Contexts** - Better performance

### Priority 3: Medium (Nice to Have)

1. **Design Patterns** - Strategy, Factory enhancements
2. **Constants Classes** - Remove magic strings
3. **Type Generation** - Frontend type safety
4. **Component Refactoring** - Better component structure
5. **API Versioning** - Future-proofing

---

## Design Patterns to Implement

### 1. Strategy Pattern
**Where**: Payment processing
**Files**: `payment/strategy/` package

### 2. Factory Pattern (Enhancement)
**Where**: DTO creation
**Files**: `mapper/` package (expand existing)

### 3. Builder Pattern
**Where**: Complex object creation (User, Movie)
**Files**: `model/builder/` package

### 4. Repository Pattern (Enhancement)
**Where**: Custom queries
**Files**: `repository/impl/` package

### 5. Service Locator → Dependency Injection (Already using DI ✅)
**Status**: Already implemented correctly

### 6. Observer Pattern
**Where**: Event handling (email notifications, audit logs)
**Files**: `event/` package

---

## Specific Code Locations

### Backend

| File | Line | Issue | Severity |
|------|------|-------|-----------|
| `AuthController.java` | 78-163 | Business logic in controller | High |
| `UserService.java` | 196-278 | SRP violation | High |
| `PaymentService.java` | 88-132 | Manual iteration, OCP violation | Medium |
| `application.properties` | 11, 39-40 | Hardcoded secrets | Critical |
| `UserService.java` | 304-311 | Debug logging | Critical |
| `MovieController.java` | 211-234 | No validation | High |
| All Controllers | Various | Generic exception handling | High |

### Frontend

| File | Line | Issue | Severity |
|------|------|-------|-----------|
| `services/auth.ts` | 56-80 | Uses fetch instead of axios | Low |
| `contexts/AuthContext.tsx` | 34-136 | Complex logic in context | Medium |
| `app/layout.tsx` | 37-61 | No error boundary | High |
| `hooks/useMovies.ts` | 10-20 | Module-level cache | Medium |

---

## Conclusion

The codebase shows good foundational structure but needs improvements in:
1. **Error handling** - Critical for production
2. **Security** - Remove hardcoded secrets
3. **Separation of concerns** - Extract business logic
4. **Code organization** - Better patterns and abstractions
5. **Type safety** - Better TypeScript usage

Focus on Priority 1 items first, then gradually improve architecture with design patterns and better abstractions.
