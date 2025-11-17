# SOLID Principles & Design Patterns: Deep Understanding

## Part 1: SOLID Principles Explained

### S - Single Responsibility Principle (SRP)

**Definition**: A class should have only one reason to change. Each class should have a single, well-defined purpose.

**Why It Matters:**
- If a class has multiple responsibilities, changes to one responsibility can break the other
- Hard to test (need to test multiple things)
- Hard to maintain (changes affect multiple concerns)

**Example - BAD (Violates SRP):**
```typescript
// This class does TOO MUCH
class MovieManager {
  fetchMovies() { /* API call */ }
  formatMovies() { /* formatting */ }
  cacheMovies() { /* caching */ }
  renderMovies() { /* UI rendering */ }
  handleErrors() { /* error handling */ }
}
// Problem: If API changes, formatting changes, or UI changes, 
//          this class needs to change for multiple reasons
```

**Example - GOOD (Follows SRP):**
```typescript
// Each class has ONE responsibility
class MovieClient {
  fetchMovies() { /* ONLY API calls */ }
}

class MovieFormatter {
  formatMovies() { /* ONLY formatting */ }
}

class MovieCache {
  cacheMovies() { /* ONLY caching */ }
}

class MovieComponent {
  renderMovies() { /* ONLY UI rendering */ }
}
// Now each class has ONE reason to change
```

**In Our System:**
- `MovieClient` (Facade): Only responsibility = provide API interface
- `useMovies` hook: Only responsibility = manage React state
- `MovieCard` (base): Only responsibility = render core movie info
- Each decorator: Only responsibility = add one specific behavior

---

### O - Open/Closed Principle (OCP)

**Definition**: Software entities should be open for extension but closed for modification. You should be able to add new functionality without changing existing code.

**Why It Matters:**
- Prevents breaking existing code when adding features
- Reduces risk of introducing bugs
- Makes code more stable and maintainable

**Example - BAD (Violates OCP):**
```typescript
// To add new movie type, must MODIFY this class
class MovieCard {
  render() {
    if (type === 'nowplaying') {
      // render with booking
    } else if (type === 'upcoming') {
      // render with coming soon
    } else if (type === 'admin') {
      // render with admin controls
    }
    // Problem: Adding new type requires MODIFYING this class
  }
}
```

**Example - GOOD (Follows OCP):**
```typescript
// Base class is CLOSED for modification
class MovieCard {
  render() {
    // Core rendering only - never changes
  }
}

// New functionality via EXTENSION (decorators)
function withBookingActions(Component) {
  // Adds booking - doesn't modify base
}

function withComingSoon(Component) {
  // Adds coming soon - doesn't modify base
}
// Adding new behavior = create new decorator, don't modify base
```

**In Our System:**
- **Facade**: Can add new methods to `MovieClient` without modifying existing ones
- **Decorator**: Can add new decorators without modifying base `MovieCard`
- **Protected Proxy**: Can add new access rules without modifying protected components

---

### L - Liskov Substitution Principle (LSP)

**Definition**: Objects of a superclass should be replaceable with objects of its subclasses without breaking the application. Subtypes must be substitutable for their base types.

**Why It Matters:**
- Ensures inheritance is used correctly
- Prevents unexpected behavior when substituting types
- Makes polymorphism safe

**Example - BAD (Violates LSP):**
```typescript
class Bird {
  fly() { /* all birds can fly */ }
}

class Penguin extends Bird {
  fly() { 
    throw new Error("Penguins can't fly!"); 
    // Problem: Penguin can't substitute Bird - breaks LSP
  }
}

function makeBirdFly(bird: Bird) {
  bird.fly(); // Crashes if bird is Penguin!
}
```

**Example - GOOD (Follows LSP):**
```typescript
class Bird {
  move() { /* generic movement */ }
}

class FlyingBird extends Bird {
  fly() { /* can fly */ }
}

class Penguin extends Bird {
  swim() { /* can swim */ }
}
// Both can substitute Bird for move(), but have specific behaviors
```

**In Our System:**
- **Decorator**: Decorated components maintain same interface as base (can substitute)
- **Protected Proxy**: Proxy implements same interface as real subject (can substitute)
- **Facade**: Not really applicable (not using inheritance)

**Note**: LSP is less relevant for our patterns since we're using composition (decorators wrap, don't inherit)

---

### I - Interface Segregation Principle (ISP)

**Definition**: Clients should not be forced to depend on interfaces they don't use. Many specific interfaces are better than one general-purpose interface.

**Why It Matters:**
- Prevents clients from depending on unused methods
- Reduces coupling
- Makes interfaces more focused and easier to understand

**Example - BAD (Violates ISP):**
```typescript
// One big interface - clients forced to depend on everything
interface MovieOperations {
  getMovies(): Movie[];
  getMovieDetails(id: number): Movie;
  createMovie(movie: Movie): void;
  updateMovie(id: number, movie: Movie): void;
  deleteMovie(id: number): void;
  processPayment(): void; // Why is this here?
  sendEmail(): void; // Why is this here?
}

// Client only needs to read movies, but forced to depend on all methods
class MovieBrowser {
  constructor(private movieOps: MovieOperations) {}
  // Forced to depend on create, update, delete, payment, email
}
```

**Example - GOOD (Follows ISP):**
```typescript
// Separate, focused interfaces
interface MovieReader {
  getMovies(): Movie[];
  getMovieDetails(id: number): Movie;
}

interface MovieWriter {
  createMovie(movie: Movie): void;
  updateMovie(id: number, movie: Movie): void;
  deleteMovie(id: number): void;
}

// Client only depends on what it needs
class MovieBrowser {
  constructor(private reader: MovieReader) {}
  // Only depends on reading methods
}
```

**In Our System:**
- **Facade**: Clients can use `MovieClient` for movie operations without depending on HTTP/API details
- **Decorator**: Clients can use base `MovieCard` for simple cases, or specific decorators for specific needs
- **Virtual Proxy**: Clients can use `MovieSummary` (lightweight) for browsing without full `Movie` data
- **Protected Proxy**: Clients don't need to know about proxy vs real subject

---

### D - Dependency Inversion Principle (DIP)

**Definition**: High-level modules should not depend on low-level modules; both should depend on abstractions. Depend on abstractions, not concretions.

**Why It Matters:**
- Reduces coupling between modules
- Makes code more flexible and testable
- Allows swapping implementations easily

**Example - BAD (Violates DIP):**
```typescript
// High-level depends on low-level (concrete)
class MovieComponent {
  constructor() {
    this.api = new AxiosClient(); // Depends on concrete Axios
    this.cache = new LocalStorageCache(); // Depends on concrete LocalStorage
  }
}
// Problem: Can't swap Axios for Fetch, or LocalStorage for IndexedDB
//          without modifying MovieComponent
```

**Example - GOOD (Follows DIP):**
```typescript
// Depend on abstractions (interfaces)
interface HttpClient {
  get(url: string): Promise<any>;
}

interface Cache {
  get(key: string): any;
  set(key: string, value: any): void;
}

class MovieComponent {
  constructor(
    private http: HttpClient, // Depends on abstraction
    private cache: Cache      // Depends on abstraction
  ) {}
}
// Can swap implementations without changing MovieComponent
```

**In Our System:**
- **Facade**: Components depend on `MovieClient` abstraction, not concrete API endpoints
- **Protected Proxy**: Clients depend on component interface, not proxy vs real subject
- **Decorator**: Components depend on `MovieCard` interface, not specific decorator implementation

---

## Part 2: Design Patterns Explained

### Facade Pattern

**What It Is:**
A simplified interface to a complex subsystem. Hides complexity behind a single, easy-to-use interface.

**Real-World Analogy:**
- **Without Facade**: You need to know how to: start car, check oil, check gas, adjust mirrors, fasten seatbelt, etc.
- **With Facade**: Just "drive()" - the car handles all the complexity

**Structure:**
```
Client → Facade → Complex Subsystem (multiple classes)
```

**When to Use:**
- When you have a complex subsystem with many classes
- When clients need a simple interface
- When you want to decouple clients from subsystem details

**In Our System:**
- **Problem**: Components directly calling API endpoints (complex: URL building, error handling, transformation)
- **Solution**: `MovieClient` facade provides simple methods: `getMovies()`, `searchMovies()`
- **Benefit**: Components don't need to know about endpoints, HTTP, error handling

---

### Decorator Pattern

**What It Is:**
Attaches additional responsibilities to an object dynamically. Wraps an object to add behavior without modifying it.

**Real-World Analogy:**
- **Base**: Plain coffee
- **Decorator 1**: Add milk → Latte
- **Decorator 2**: Add sugar → Sweet coffee
- **Decorator 3**: Add both → Sweet Latte
- Each decorator adds one thing, can combine them

**Structure:**
```
Base Component → Decorator wraps it → Adds behavior
```

**When to Use:**
- When you need to add behavior dynamically
- When you can't modify the base class (closed for modification)
- When you want to compose behaviors

**In Our System:**
- **Problem**: `MovieCard` needs different behaviors (booking, coming soon, admin) but modifying base breaks OCP
- **Solution**: Base `MovieCard` unchanged, decorators add behaviors
- **Benefit**: Can add new behaviors without touching base, can compose decorators

---

### Protected Proxy Pattern

**What It Is:**
Controls access to an object based on permissions. Intercepts requests and checks authorization before allowing access.

**Real-World Analogy:**
- **Real Subject**: Your house
- **Protected Proxy**: Security guard at the gate
- **Client**: Visitor
- Guard checks if visitor has permission before allowing access to house

**Structure:**
```
Client → Proxy (checks permissions) → Real Subject
```

**When to Use:**
- When you need to control access to resources
- When you want to add security without modifying the protected object
- When you need lazy loading or access control

**In Our System:**
- **Problem**: Need to protect routes/components based on user role
- **Solution**: Middleware/RouteProtection acts as proxy, checks auth before allowing access
- **Benefit**: Security logic separated from business logic, can protect any component

---

## Part 3: How SOLID Principles Relate to Our Patterns

### Facade Pattern + SOLID

**SRP (Single Responsibility):**
- ✅ **Before**: `useMovies` hook had multiple responsibilities (API calls, state, caching)
- ✅ **After**: `MovieClient` = API access only | `useMovies` = state only
- **How**: Facade separates API logic from React state management

**DIP (Dependency Inversion):**
- ✅ **Before**: Components depend on concrete API endpoints (`/api/movies/browse/now-playing`)
- ✅ **After**: Components depend on `MovieClient` abstraction
- **How**: Facade provides abstraction layer - can swap HTTP client without changing components

**OCP (Open/Closed):**
- ✅ **Before**: Adding new API operation requires modifying existing code
- ✅ **After**: Can add new methods to `MovieClient` without modifying existing ones
- **How**: Facade interface can be extended with new methods

**ISP (Interface Segregation):**
- ✅ Clients only depend on `MovieClient` methods they need
- ✅ Don't need to know about HTTP, endpoints, error handling
- **How**: Facade provides focused interface (movie operations only)

---

### Decorator Pattern + SOLID

**SRP (Single Responsibility):**
- ✅ **Before**: `MovieCard` handled all variants (booking, admin, coming soon)
- ✅ **After**: Base `MovieCard` = core rendering | Each decorator = one behavior
- **How**: Each decorator has single, well-defined responsibility

**OCP (Open/Closed):**
- ✅ **Before**: Adding new variant requires modifying base component
- ✅ **After**: Base closed for modification, open for extension via decorators
- **How**: Decorators extend behavior without modifying base

**ISP (Interface Segregation):**
- ✅ Clients can use base `MovieCard` for simple cases
- ✅ Clients can use specific decorators for specific needs
- ✅ Don't need to depend on all behaviors
- **How**: Each decorator provides focused interface

**LSP (Liskov Substitution):**
- ✅ Decorated components maintain same interface as base
- ✅ Can be used anywhere base component is expected
- **How**: Decorators wrap base, maintain same interface

---

### Protected Proxy Pattern + SOLID

**SRP (Single Responsibility):**
- ✅ **Before**: Components handle both business logic and security
- ✅ **After**: Proxy = access control only | Real subject = business logic only
- **How**: Proxy separates security concerns from business logic

**ISP (Interface Segregation):**
- ✅ Proxy implements same interface as real subject
- ✅ Clients don't need to know about proxy vs real subject
- ✅ Can swap implementations without client changes
- **How**: Proxy maintains same interface, client doesn't care which one

**DIP (Dependency Inversion):**
- ✅ Clients depend on component interface (abstraction)
- ✅ Proxy and real subject both implement same interface
- ✅ Can test with mock proxy
- **How**: Both proxy and real subject are implementations of same abstraction

---

## Part 4: Relationships Between Patterns and SOLID

### Common Themes

**1. Separation of Concerns (SRP)**
- All three patterns achieve SRP by separating responsibilities:
  - **Facade**: Separates API logic from business logic
  - **Decorator**: Separates base behavior from additional behaviors
  - **Protected Proxy**: Separates security from business logic

**2. Abstraction (DIP, ISP)**
- All three patterns use abstraction:
  - **Facade**: Abstracts complex subsystem behind simple interface
  - **Decorator**: Components depend on base interface, not specific decorators
  - **Protected Proxy**: Clients depend on interface, not proxy vs real subject

**3. Extensibility (OCP)**
- Facade and Decorator achieve OCP:
  - **Facade**: Can extend with new methods
  - **Decorator**: Can add new decorators without modifying base
  - **Protected Proxy**: Less about extension, more about access control

### Pattern Interactions

**Facade + Decorator:**
- Facade provides data → Decorator adds behavior to display
- Example: `MovieClient` (Facade) fetches data → `withBookingActions` (Decorator) adds booking UI

**Facade + Protected Proxy:**
- Protected Proxy controls access → Facade provides interface
- Example: Route protection (Proxy) → `MovieClient` (Facade) provides API access

**Decorator + Protected Proxy:**
- Protected Proxy controls access → Decorator adds behavior
- Example: Admin route protection (Proxy) → `withAdminControls` (Decorator) adds admin UI

---

## Part 5: Key Takeaways

### SOLID Principles Summary

1. **SRP**: One class, one responsibility
2. **OCP**: Open for extension, closed for modification
3. **LSP**: Subtypes must be substitutable
4. **ISP**: Clients shouldn't depend on unused interfaces
5. **DIP**: Depend on abstractions, not concretions

### Design Patterns Summary

1. **Facade**: Simplifies complex subsystem
2. **Decorator**: Adds behavior dynamically
3. **Protected Proxy**: Controls access to resources

### How They Work Together

- **Patterns help achieve SOLID principles**
- **SOLID principles guide pattern implementation**
- **Both aim for**: Maintainability, Flexibility, Testability, Reusability

### In Our System

- **Facade** achieves: SRP, DIP, OCP, ISP
- **Decorator** achieves: SRP, OCP, ISP, LSP
- **Protected Proxy** achieves: SRP, ISP, DIP

All patterns contribute to our design goals: Maintainability, Usability, Security, Reusability
