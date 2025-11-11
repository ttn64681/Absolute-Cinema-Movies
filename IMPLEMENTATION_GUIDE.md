# Implementation Guide: Architecture Improvements
## Step-by-Step Code Examples

This guide provides concrete code examples for implementing the improvements identified in the architecture critique.

---

## 1. Global Exception Handler (Priority 1)

### Step 1: Create Base Exception Class

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/exception/CustomException.java`

```java
package com.acm.cinema_ebkg_system.exception;

public abstract class CustomException extends RuntimeException {
    private final String errorCode;
    
    protected CustomException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    protected CustomException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
```

### Step 2: Create Specific Exception Classes

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/exception/UserNotFoundException.java`

```java
package com.acm.cinema_ebkg_system.exception;

public class UserNotFoundException extends CustomException {
    public UserNotFoundException(String message) {
        super("USER_NOT_FOUND", message);
    }
    
    public UserNotFoundException(Long userId) {
        super("USER_NOT_FOUND", "User not found with ID: " + userId);
    }
}
```

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/exception/ValidationException.java`

```java
package com.acm.cinema_ebkg_system.exception;

import java.util.List;

public class ValidationException extends CustomException {
    private final List<String> validationErrors;
    
    public ValidationException(String message, List<String> validationErrors) {
        super("VALIDATION_ERROR", message);
        this.validationErrors = validationErrors;
    }
    
    public List<String> getValidationErrors() {
        return validationErrors;
    }
}
```

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/exception/ResourceNotFoundException.java`

```java
package com.acm.cinema_ebkg_system.exception;

public class ResourceNotFoundException extends CustomException {
    public ResourceNotFoundException(String resourceType, Long id) {
        super("RESOURCE_NOT_FOUND", 
              String.format("%s not found with ID: %d", resourceType, id));
    }
}
```

### Step 3: Create Error Response DTO

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/dto/ErrorResponse.java`

```java
package com.acm.cinema_ebkg_system.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ErrorResponse {
    private String errorCode;
    private String message;
    private LocalDateTime timestamp;
    private List<String> details;
    private String path;
    
    public ErrorResponse(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    
    public ErrorResponse(String errorCode, String message, List<String> details) {
        this.errorCode = errorCode;
        this.message = message;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and setters
    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public List<String> getDetails() { return details; }
    public void setDetails(List<String> details) { this.details = details; }
    
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}
```

### Step 4: Create Global Exception Handler

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/exception/GlobalExceptionHandler.java`

```java
package com.acm.cinema_ebkg_system.exception;

import com.acm.cinema_ebkg_system.dto.ErrorResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UserNotFoundException ex, WebRequest request) {
        logger.warn("User not found: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(ex.getErrorCode(), ex.getMessage());
        error.setPath(request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        logger.warn("Resource not found: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(ex.getErrorCode(), ex.getMessage());
        error.setPath(request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            ValidationException ex, WebRequest request) {
        logger.warn("Validation error: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            ex.getErrorCode(), 
            ex.getMessage(), 
            ex.getValidationErrors()
        );
        error.setPath(request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, WebRequest request) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        ErrorResponse error = new ErrorResponse(
            "VALIDATION_ERROR",
            "Request validation failed",
            errors
        );
        error.setPath(request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, WebRequest request) {
        List<String> errors = ex.getConstraintViolations()
            .stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.toList());
        
        ErrorResponse error = new ErrorResponse(
            "VALIDATION_ERROR",
            "Constraint validation failed",
            errors
        );
        error.setPath(request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, WebRequest request) {
        logger.warn("Authentication failed: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            "AUTHENTICATION_FAILED",
            "Invalid email or password"
        );
        error.setPath(request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        logger.warn("Illegal argument: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            "INVALID_ARGUMENT",
            ex.getMessage()
        );
        error.setPath(request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {
        logger.error("Unexpected error occurred", ex);
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred. Please try again later."
        );
        error.setPath(request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

### Step 5: Update Services to Throw Custom Exceptions

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/service/UserService.java`

**Replace**:
```java
public User getUserById(Long id) {
    return userRepository.findByIdWithAddresses(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
}
```

**With**:
```java
import com.acm.cinema_ebkg_system.exception.UserNotFoundException;

public User getUserById(Long id) {
    return userRepository.findByIdWithAddresses(id)
            .orElseThrow(() -> new UserNotFoundException(id));
}
```

**Replace**:
```java
public User authenticateUser(String email, String password) {
    Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);
    if (userOptional.isEmpty()) {
        throw new RuntimeException("User not found");
    }
    // ...
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }
}
```

**With**:
```java
import org.springframework.security.authentication.BadCredentialsException;

public User authenticateUser(String email, String password) {
    Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);
    if (userOptional.isEmpty()) {
        throw new BadCredentialsException("Invalid email or password");
    }
    // ...
    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new BadCredentialsException("Invalid email or password");
    }
}
```

### Step 6: Update Controllers to Remove Try-Catch

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/controller/AuthController.java`

**Replace**:
```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
    try {
        // ... registration logic
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        AuthResponse response = new AuthResponse(false, e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
}
```

**With**:
```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    // ... registration logic (exceptions handled by GlobalExceptionHandler)
    AuthResponse response = new AuthResponse(true, "Registration successful!");
    return ResponseEntity.ok(response);
}
```

---

## 2. Input Validation (Priority 1)

### Step 1: Add Validation Annotations to DTOs

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/dto/auth/RegisterRequest.java`

```java
package com.acm.cinema_ebkg_system.dto.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", 
             message = "Password must contain at least one uppercase letter, one lowercase letter, and one number")
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;
    
    @Pattern(regexp = "^[+]?[1-9][\\d]{0,15}$", 
             message = "Phone number must be valid")
    private String phoneNumber;
    
    private Boolean enrolledForPromotions;
    
    @Valid
    private List<PaymentCardDTO> paymentCards;
    
    // Getters and setters...
}
```

### Step 2: Add @Valid to Controller Methods

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/controller/AuthController.java`

```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    // Validation happens automatically before this method is called
    // ...
}
```

---

## 3. Extract Business Logic from Controllers (Priority 2)

### Step 1: Create RegistrationService

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/service/RegistrationService.java`

```java
package com.acm.cinema_ebkg_system.service;

import com.acm.cinema_ebkg_system.dto.auth.AuthResponse;
import com.acm.cinema_ebkg_system.dto.auth.RegisterRequest;
import com.acm.cinema_ebkg_system.mapper.UserDtoFactory;
import com.acm.cinema_ebkg_system.model.User;
import com.acm.cinema_ebkg_system.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistrationService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AddressService addressService;
    
    @Autowired
    private PaymentCardService paymentCardService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        // Step 1: Create and register user
        User user = createUserFromRequest(request);
        User savedUser = userService.registerUser(user);
        
        // Step 2: Create addresses
        if (request.getHomeAddress() != null && !request.getHomeAddress().trim().isEmpty()) {
            addressService.createHomeAddress(savedUser, request);
        }
        
        // Step 3: Create payment cards
        if (request.getPaymentCards() != null && !request.getPaymentCards().isEmpty()) {
            paymentCardService.createPaymentCards(savedUser, request.getPaymentCards());
        }
        
        // Step 4: Generate verification token and send email
        String verificationToken = userService.generateVerificationToken(savedUser);
        
        // Step 5: Send promotion enrollment email if applicable
        if (savedUser.isEnrolledForPromotions()) {
            emailService.sendPromotionEnrollmentEmail(
                savedUser.getEmail(), 
                savedUser.getFirstName()
            );
        }
        
        // Step 6: Build response
        return buildAuthResponse(savedUser, verificationToken);
    }
    
    private User createUserFromRequest(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        if (request.getEnrolledForPromotions() != null) {
            user.setEnrolledForPromotions(request.getEnrolledForPromotions());
        }
        return user;
    }
    
    private AuthResponse buildAuthResponse(User user, String verificationToken) {
        return new AuthResponse(
            true, 
            "Registration successful! Verification token: " + verificationToken
        );
    }
}
```

### Step 2: Update AuthController to Use RegistrationService

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/controller/AuthController.java`

```java
@Autowired
private RegistrationService registrationService;

@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    AuthResponse response = registrationService.registerUser(request);
    return ResponseEntity.ok(response);
}
```

---

## 4. Constants Classes (Priority 3)

### Step 1: Create Constants Classes

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/constants/MovieConstants.java`

```java
package com.acm.cinema_ebkg_system.constants;

public class MovieConstants {
    public static final String STATUS_NOW_PLAYING = "NOW_PLAYING";
    public static final String STATUS_UPCOMING = "UPCOMING";
    
    private MovieConstants() {
        // Utility class - prevent instantiation
    }
}
```

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/constants/PaymentConstants.java`

```java
package com.acm.cinema_ebkg_system.constants;

public class PaymentConstants {
    public static final int MAX_PAYMENT_CARDS = 3;
    
    private PaymentConstants() {
        // Utility class - prevent instantiation
    }
}
```

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/constants/SecurityConstants.java`

```java
package com.acm.cinema_ebkg_system.constants;

import java.util.Arrays;
import java.util.List;

public class SecurityConstants {
    public static final List<String> ALLOWED_ORIGINS = Arrays.asList(
        "http://localhost:3000",
        "http://localhost:3001"
    );
    
    public static final String[] PUBLIC_ENDPOINTS = {
        "/api/auth/**",
        "/api/admin/create",
        "/api/admin/login",
        "/api/movies/**"
    };
    
    private SecurityConstants() {
        // Utility class - prevent instantiation
    }
}
```

### Step 2: Use Constants in Code

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/controller/MovieController.java`

**Replace**:
```java
newMovie.setStatus("UPCOMING");
```

**With**:
```java
import com.acm.cinema_ebkg_system.constants.MovieConstants;

newMovie.setStatus(MovieConstants.STATUS_UPCOMING);
```

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/config/SecurityConfig.java`

**Replace**:
```java
configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
```

**With**:
```java
import com.acm.cinema_ebkg_system.constants.SecurityConstants;

configuration.setAllowedOrigins(SecurityConstants.ALLOWED_ORIGINS);
```

---

## 5. Remove Hardcoded Secrets (Priority 1)

### Step 1: Update application.properties

**File**: `backend/src/main/resources/application.properties`

**Replace**:
```properties
jwt.secret=${JWT_SECRET:pCBbMyt5xLPDQRkpi8MxBHLQTy+P/uaQmJIadJvzktY=}
spring.mail.username=${MAIL_USERNAME:acm.cinemas123@gmail.com}
spring.mail.password=${MAIL_PASSWORD:nvjouctuvtkpbpul}
```

**With**:
```properties
# These MUST be set via environment variables - no defaults
jwt.secret=${JWT_SECRET}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

### Step 2: Add Validation on Startup

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/config/ConfigurationValidator.java`

```java
package com.acm.cinema_ebkg_system.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ConfigurationValidator {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${spring.mail.username}")
    private String mailUsername;
    
    @Value("${spring.mail.password}")
    private String mailPassword;
    
    @PostConstruct
    public void validateConfiguration() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                "JWT_SECRET environment variable must be set"
            );
        }
        
        if (mailUsername == null || mailUsername.isBlank()) {
            throw new IllegalStateException(
                "MAIL_USERNAME environment variable must be set"
            );
        }
        
        if (mailPassword == null || mailPassword.isBlank()) {
            throw new IllegalStateException(
                "MAIL_PASSWORD environment variable must be set"
            );
        }
    }
}
```

---

## 6. Structured Logging (Priority 2)

### Step 1: Add SLF4J Dependency (Already in Spring Boot)

### Step 2: Update Services to Use Logger

**File**: `backend/src/main/java/com/acm/cinema_ebkg_system/service/UserService.java`

**Add at top of class**:
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    // Remove all System.out.println() calls
    
    // Replace with:
    public User registerUser(User user) {
        logger.info("Registering user with email: {}", user.getEmail());
        // ...
        logger.debug("User registered successfully with ID: {}", savedUser.getId());
    }
    
    public User authenticateUser(String email, String password) {
        logger.debug("Attempting authentication for email: {}", email);
        // ...
        logger.info("User authenticated successfully: {}", email);
    }
}
```

**Remove**:
```java
System.out.println("New password: " + newPassword);
System.out.println("New hashed password: " + hashedPassword);
```

---

## 7. Frontend: Centralized API Client (Priority 2)

### Step 1: Create Centralized API Client

**File**: `frontend/src/services/apiClient.ts`

```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error occurred');
          break;
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response received');
    } else {
      // Error setting up request
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Step 2: Update auth.ts to Use apiClient

**File**: `frontend/src/services/auth.ts`

```typescript
import apiClient from './apiClient';
import { AuthResponse, LoginRequest, RegisterRequest } from './types';

export const authAPI = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },
  
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  },
  
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    const response = await apiClient.post<AuthResponse>(
      `/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`
    );
    return response.data;
  },
  
  // ... other methods
};
```

---

## 8. Frontend: Error Boundary (Priority 1)

### Step 1: Create Error Boundary Component

**File**: `frontend/src/components/common/ErrorBoundary.tsx`

```typescript
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-8">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Step 2: Add Error Boundary to Layout

**File**: `frontend/src/app/layout.tsx`

```typescript
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              {/* ... rest of providers */}
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## Summary

This guide provides concrete implementations for the most critical improvements:

1. ✅ Global Exception Handler - Standardized error responses
2. ✅ Input Validation - Data integrity and security
3. ✅ Business Logic Extraction - Better separation of concerns
4. ✅ Constants Classes - Remove magic strings
5. ✅ Security Improvements - Remove hardcoded secrets
6. ✅ Structured Logging - Better debugging
7. ✅ Centralized API Client - Consistent error handling
8. ✅ Error Boundary - Frontend error handling

Start with Priority 1 items, then move to Priority 2 and 3 as time permits.
