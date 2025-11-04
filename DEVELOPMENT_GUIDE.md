# Cinema E-Booking System - Developer Reference

## Table of Contents

1. [API Reference](#api-reference)
2. [Data Models](#data-models)
3. [Frontend Components](#frontend-components)
4. [Custom Hooks](#custom-hooks)
5. [Contexts](#contexts---global-state-management)
6. [React Query & useRef Patterns](#react-query--useref-patterns)
7. [Performance Patterns](#performance-patterns)
8. [Development Patterns](#development-patterns)

---

## API Reference

### Authentication Endpoints

#### `POST /api/auth/register`

**Returns**: `AuthResponse` - `{ success: boolean, message: string, token?: string, refreshToken?: string, user?: UserDto }`
**Called by**: Registration form submission
**Consumed by**: `AuthContext.login()`

#### `POST /api/auth/login`

**Returns**: `AuthResponse` - `{ success: boolean, message: string, token: string, refreshToken: string, user: UserDto }`
**Called by**: Login form submission
**Consumed by**: `AuthContext.login()`

#### `POST /api/auth/refresh`

**Returns**: `AuthResponse` - `{ success: boolean, message: string, token: string, refreshToken: string, user: UserDto }`
**Query Params**: `refreshToken` - Valid refresh token
**Called by**: App startup, protected route access
**Consumed by**: `AuthContext.checkAuthStatus()`

#### `POST /api/auth/verify-email`

**Returns**: `AuthResponse` - `{ success: boolean, message: string, token: string, refreshToken: string, user: UserDto }`
**Query Params**: `token` - Email verification token
**Called by**: Email verification link click
**Consumed by**: Email verification page

#### `POST /api/auth/resend-verification`

**Returns**: `AuthResponse` - `{ success: boolean, message: string }`
**Query Params**: `email` - User's email address
**Called by**: Resend verification button
**Consumed by**: Resend verification page

#### `POST /api/auth/forgot-password`

**Returns**: `AuthResponse` - `{ success: boolean, message: string }`
**Query Params**: `email` - User's email address
**Called by**: Forgot password form submission
**Consumed by**: Forgot password page

#### `POST /api/auth/reset-password`

**Returns**: `AuthResponse` - `{ success: boolean, message: string }`
**Body**: `ResetPasswordRequest` - `{ token: string, newPassword: string }`
**Called by**: Reset password form submission
**Consumed by**: Reset password page

#### `POST /api/auth/check-email`

**Returns**: `AuthResponse` - `{ success: boolean, message: string }`
**Query Params**: `email` - Email address to check
**Called by**: Email availability check during registration
**Consumed by**: Registration form validation

#### `POST /api/auth/logout`

**Returns**: `AuthResponse` - `{ success: boolean, message: string }`
**Called by**: Logout button click
**Consumed by**: `AuthContext.logout()`

### Movie Endpoints

#### `GET /api/movies/now-playing`

**Returns**: `BackendMovie[]` - Currently showing movies
**Called by**: Homepage load, "Now Playing" tab
**Consumed by**: `useMovies('nowplaying')`

#### `GET /api/movies/upcoming`

**Returns**: `BackendMovie[]` - Upcoming releases
**Called by**: "Upcoming" tab click
**Consumed by**: `useMovies('upcoming')`

#### `GET /api/movies/genres`

**Returns**: `string[]` - Available genres
**Called by**: Filter popup open
**Consumed by**: `useGenres()`

#### `GET /api/movies/search-now-playing`

**Returns**: `BackendMovie[]` - Filtered now-playing movies
**Query Params**: `title`, `genres`, `month`, `day`, `year`
**Called by**: Search form submission
**Consumed by**: `useMovieSearch()`

#### `GET /api/movies/{movieId}`

**Returns**: `BackendMovie` - Single movie details
**Called by**: Movie detail popup open
**Consumed by**: `SelectedMovie` component

#### `GET /api/movies/{movieId}/dates`

**Returns**: `ShowDate[]` - Available show dates
**Called by**: Date selection in movie popup
**Consumed by**: React Query in `SelectedMovie`

#### `GET /api/movies/{movieId}/times`

**Returns**: `ShowTime[]` - Showtimes for selected date
**Query Params**: `date` - Selected show date
**Called by**: Time selection after date selection
**Consumed by**: React Query with `movie.movie_id` + `selectedDate` dependencies

### User Endpoints

#### `GET /api/user/info`

**Parameters**: `userId` (query param)
**Returns**: `User` - Current user's information
**Called by**: User profile page
**Consumed by**: User profile component

#### `GET /api/user/profile`

**Parameters**: `userId` (query param)
**Returns**: `UserProfileDTO` - `{ user: UserDto, homeAddress: AddressDTO | null }`
**Called by**: User profile page
**Consumed by**: Frontend user profile display
**Note**: Returns DTOs (not entities) for security - excludes password hash

#### `PUT /api/user/info`

**Parameters**: `userId` (query param), `UserUpdateRequest` (request body)
**Request Body**: `UserUpdateRequest` - `{ firstName?, lastName?, phoneNumber?, enrolledForPromotions?, profileImageLink?, homeStreet?, homeCity?, homeState?, homeZip?, homeCountry? }`
**Returns**: `User` - Updated user entity
**Called by**: Edit profile page
**Used for**: Updating user profile information (name, phone, address, etc.)
**Note**: All fields optional - only provided fields will be updated

#### `PUT /api/user/change-password`

**Parameters**: `userId` (query param), `PasswordChangeRequest` (request body)
**Request Body**: `PasswordChangeRequest` - `{ currentPassword: string, newPassword: string }`
**Returns**: `User` - Updated user entity
**Called by**: Change password page
**Used for**: Changing password when user knows current password

#### `GET /api/users/`

**Returns**: `User[]` - All users (admin only)
**Called by**: Admin user management page
**Consumed by**: Admin dashboard

#### `GET /api/users/{userId}`

**Returns**: `User` - User details
**Called by**: User profile page
**Consumed by**: User profile component

#### `PUT /api/users/{userId}/info`

**Parameters**: `userId` (path param), `UserUpdateRequest` (request body)
**Request Body**: Same as `PUT /api/user/info`
**Returns**: `User` - Updated user entity
**Called by**: Admin user management (admin updating user profiles)

#### `PUT /api/users/{userId}/forgot-password`

**Parameters**: `userId` (path param), `PasswordChangeRequest` (request body)
**Request Body**: `PasswordChangeRequest` - `{ newPassword: string }` (currentPassword can be null)
**Returns**: `User` - Updated user entity
**Called by**: Password reset flow
**Used for**: Resetting forgotten password (doesn't require current password)

#### `PUT /api/users/{userId}/change-password`

**Parameters**: `userId` (path param), `PasswordChangeRequest` (request body)
**Request Body**: Same as `PUT /api/user/change-password`
**Returns**: `User` - Updated user entity
**Called by**: Admin or user changing password

---

## Data Models

### Backend Entities

#### `Movie.java`

**Fields**: `movie_id`, `title`, `status`, `genres`, `rating`, `release_date`, `synopsis`, `trailer_link`, `poster_link`, `cast_names`, `directors`, `producers`
**Used by**: Movie endpoints, frontend movie displays
**Relationships**: One-to-many with `ShowDate`

#### `User.java`

**Fields**: `user_id`, `email`, `password_hash`, `first_name`, `last_name`, `phone_number`, `address`, `state`, `country`, `created_at`
**Used by**: Authentication endpoints, user management
**Security**: Password BCrypt hashed

#### `ShowDate.java`

**Fields**: `date_id`, `movie_id`, `show_date`
**Used by**: Movie showtime selection
**Relationships**: Many-to-one with `Movie`, one-to-many with `ShowTime`

#### `ShowTime.java`

**Fields**: `time_id`, `date_id`, `show_time`
**Used by**: Showtime selection after date selection
**Relationships**: Many-to-one with `ShowDate`

### DTOs

#### `AuthResponse`

**Returns**: `{ success: boolean, message: string, token?: string, refreshToken?: string, user?: UserDto }`
**Used by**: All authentication endpoints
**Consumed by**: `AuthContext` for token storage and user state

**UserDto Structure**:

- `id`: Long - User's unique identifier
- `email`: String - User's email address
- `firstName`: String - User's first name
- `lastName`: String - User's last name
- `phoneNumber`: String - User's phone number (optional)
- `address`: String - User's street address (optional)
- `state`: String - User's state/province (optional)
- `country`: String - User's country (optional)

**Note**: `UserDto` is a pure data container with a single constructor. Creation is handled by `UserDtoFactory` (located in `mapper/` package) using Factory Method pattern:

- `UserDtoFactory.fromUser(user)` - Creates UserDto from User entity (basic info, no address)
- `UserDtoFactory.fromUserWithAddress(user, address)` - Creates UserDto with address information
- `UserDtoFactory.fromAdmin(admin)` - Creates UserDto from Admin entity (uses "Admin" as default names)

This eliminates constructor overloading ambiguity and encapsulates creation logic.

#### `LoginRequest`

**Fields**: `email`, `password`, `rememberMe` (optional)
**Validation**: Email format, password min 8 chars
**Used by**: Login endpoint

#### `RegisterRequest`

**Fields**: `email`, `password`, `firstName`, `lastName`, `phoneNumber`, `enrolledForPromotions`, `homeAddress`, `homeCity`, `homeState`, `homeZip`, `homeCountry`, `paymentCards[]`
**Used by**: Registration endpoint
**Payment Cards**: Optional array of `{ cardNumber, cardholderName, cardType, expirationDate, billingStreet, billingCity, billingState, billingZip, isDefault }`

#### `ResetPasswordRequest`

**Fields**: `token`, `newPassword`
**Used by**: Reset password endpoint

#### `UserUpdateRequest`

**Fields**: `firstName?`, `lastName?`, `phoneNumber?`, `enrolledForPromotions?`, `profileImageLink?`, `homeStreet?`, `homeCity?`, `homeState?`, `homeZip?`, `homeCountry?`
**Used by**: `PUT /api/user/info`, `PUT /api/users/{userId}/info`
**Purpose**: Update user profile information (name, phone, address, preferences)
**Note**: All fields optional - follows Single Responsibility Principle (only handles profile updates, not password changes)

#### `PasswordChangeRequest`

**Fields**: `currentPassword?`, `newPassword`
**Used by**: `PUT /api/user/change-password`, `PUT /api/users/{userId}/change-password`, `PUT /api/users/{userId}/forgot-password`
**Purpose**: Change or reset user password
**Note**: `currentPassword` is required for password change, optional (null) for password reset. Follows Single Responsibility Principle (only handles password changes, not profile updates)

#### `UserProfileDTO`

**Fields**: `user: UserDto`, `homeAddress: AddressDTO | null`
**Used by**: `GET /api/user/profile`
**Purpose**: Return user profile with address information
**Note**: Returns DTOs (not entities) for security. Uses `UserDto` from `AuthResponse` for consistency, created via `UserDtoFactory.fromUser(user)`

**AddressDTO Structure**:

- `id`: Long - Address ID
- `street`: String - Street address
- `city`: String - City
- `state`: String - State/province
- `zip`: String - ZIP/postal code
- `country`: String - Country

---

## Frontend Components

### Common Components

#### `MovieCard` - Individual Movie Display

**What it does**: Shows a single movie with poster, title, genres, and rating
**Props**:

- `movie`: Movie data object
- `onSelect`: Function to call when user clicks on the movie

**What you see**: Movie poster, title, genre tags, rating badge
**What happens when clicked**: Calls `onSelect(movie)` which opens the `SelectedMovie` popup
**Used by**: Movie grids on homepage and search results

**Smart features**: Uses `useMemo` to split comma-separated genres into individual tags

#### `SelectedMovie` - Movie Detail Popup

**What it does**: Shows detailed movie info in a popup with showtimes and booking
**Props**:

- `movie`: Movie data object or null
- `onClose`: Function to close the popup

**What you see**:

- Movie poster and basic info
- YouTube trailer
- Available show dates and times
- Cast and crew info
- Book button

**How it gets showtimes**: Uses React Query to fetch dates and times from the API
**Used by**: Opens when you click on a `MovieCard`

#### `NavBar` - Main Navigation

**What it does**: Shows the main navigation bar at the top of every page
**Props**: None (gets data from `AuthContext` and `FiltersContext`)

**What changes based on login**:

- **Not logged in**: Shows "Join" button
- **Logged in**: Shows user's name and dropdown menu with logout option

**Features**:

- Search bar with search button
- Filter button that opens global FiltersPopUp (calls `setIsFiltersOpen(true)`)
- Responsive navigation links
- User menu dropdown when authenticated

**Used by**: Every page (added in root layout)
**Gets data from**:

- `AuthContext` (user info, login status)
- `FiltersContext` (filter popup state, selected filters)
  **Uses Hook**: `useAuth()` for authentication, `useFilters()` for filter state

#### `AuthFormContainer`

**Props**: `{ children: ReactNode }`
**Returns**: JSX - Wrapper with glassmorphism styling and responsive centering
**Used by**: `login/page.tsx`, `register/page.tsx`, `forgot-pwd/page.tsx`
**Styling**: Dark theme with backdrop blur, accounts for navbar height

#### `AuthInput`

**Props**: `{ id, label, type, value, onChange, placeholder?, error?, required?, disabled? }`
**Returns**: JSX - Standardized input field with error handling
**Used by**: All authentication forms (`AuthFormContainer` children)
**Features**: Error display, consistent styling, accessibility support

#### `AuthButton`

**Props**: `{ type, onClick?, disabled?, loading?, variant?, children }`
**Returns**: JSX - Standardized button with loading states
**Used by**: All authentication forms
**Variants**: `primary` (default), `secondary`, `transparent`

### Specific Components

#### `MovieTabsSection`

**Props**: None (uses `useMovies`)
**Returns**: JSX - Now Playing/Upcoming tabs with smooth transitions
**Used by**: Homepage (`page.tsx`)
**Uses Hook**: `useMovies(activeTab)` for data fetching and loading states
**State**: Manages active tab switching between 'nowplaying' and 'upcoming'

#### `FiltersPopUp`

**Props**: `{ isClosed: boolean, setIsClosed: (closed: boolean) => void }`
**Returns**: JSX - Genre checkboxes, date picker, apply filters button
**Used by**: Rendered globally via `FiltersContext.createPortal` into `document.body`
**Uses from Context**: `FiltersContext` - `selectedGenres`, `selectedDate`, `setSelectedGenres()`, `setSelectedDate()`
**Uses Hook**: `useGenres()` for genre options
**Calls**:

- `FiltersContext.setSelectedGenres()` - Updates selected genres
- `FiltersContext.setSelectedDate()` - Updates date filter
- `setIsClosed(true)` - Closes the popup when filters applied
  **Features**: Full-screen blur overlay (z-[999]), popup on top (z-[1000])

#### `CinemaLayout`

**Props**: `{ seats: Seat[], onSeatSelect: (seatId) => void }`
**Returns**: JSX - Seat grid with available/selected/occupied states
**Used by**: Booking flow (`booking/(seats)/page.tsx`)
**Uses Hook**: `useSeats()` for seat selection state management
**Calls**: `onSeatSelect(seatId)` when seat clicked, `useSeats.toggleSeat()` for state updates

#### `HeroPromoSection` - Animated Promo Carousel

**What it does**: Displays rotating promotional offers with animated transitions
**Props**: None
**Returns**: JSX - Animated carousel with hero promotions
**Used by**: Homepage (`app/(public)/page.tsx`)
**Uses Hook**: Local state with `useState` for carousel index
**Uses Library**: `framer-motion` for slide animations
**Features**:

- Auto-advances every 5 seconds via `setInterval`
- Left/right arrow buttons for manual navigation
- Carousel indicators for direct slide selection
- Animated slide transitions with blur effects
- Content animations synced with slides
  **Data Source**: `heroPromotions` array from `constants/movieData.ts`
  **API Integration**: Ready for dynamic `GET /api/promotions/hero` endpoint

---

## Custom Hooks

### `useMovies(activeTab)` - Movie Data Hook

**What it does**: Fetches and caches movie data for "Now Playing" or "Upcoming" tabs
**Parameters**: `activeTab` - Either 'nowplaying' or 'upcoming'
**Returns**:

- `movies`: Array of movie objects
- `isLoadingMovies`: True while loading, false when done
- `refetchMovies`: Function to manually refresh the data

**Smart caching**:

- Stores data in memory for 5 minutes
- If you switch tabs and come back within 5 minutes, shows cached data instantly
- Only makes API call if cache is expired or empty

**Used by**: `MovieTabsSection` on the homepage
**API calls**: `GET /api/movies/now-playing` or `GET /api/movies/upcoming`

### `useGenres()` - Genre List Hook

**What it does**: Fetches the list of available movie genres (Action, Comedy, Drama, etc.)
**Parameters**: None
**Returns**:

- `genres`: Array of genre strings
- `isLoadingGenres`: Loading state
- `refetchGenres`: Function to refresh genres

**Why it's simple**: Genres don't change often, so it fetches once and keeps the data
**Used by**: `FiltersPopUp` component for genre checkboxes
**API call**: `GET /api/movies/genres`

### `useMovieSearch()` - Search Results Hook

**What it does**: Searches for movies based on URL parameters (title, genres, date)
**Parameters**: None (automatically reads from URL)
**Returns**:

- `nowPlayingMovies`: Search results for current movies
- `upcomingMovies`: Search results for upcoming movies

**How it works**: When URL changes (user searches), it automatically fetches new results
**Used by**: Movies page to display search results
**API calls**: `GET /api/movies/search-now-playing` and `GET /api/movies/search-upcoming`

### `useSearchLogic()` - Search Input Hook

**What it does**: Handles search input and prevents duplicate searches
**Parameters**: None
**Returns**:

- `searchQuery`: Current search text
- `setSearchQuery`: Function to update search text
- `handleSearch`: Function to perform search
- `handleKeyPress`: Function for Enter key handling

**Smart features**:

- Reads filter settings from `FiltersContext` (genres, dates, isFiltersOpen, setIsFiltersOpen)
- Prevents duplicate searches using `useRef`
- Updates URL when search is performed
- Builds query string from title, genres, and date filters

**Used by**: Movies page search bar (`MoviesSearchSection`)
**Calls**: `useFilters()` to get global filter state from FiltersContext

### `useSeats()` - Seat Selection Hook

**What it does**: Manages which seats are selected in the cinema layout
**Parameters**: None
**Returns**:

- `selectedSeats`: Array of selected seat IDs
- `toggleSeat`: Function to select/deselect a seat
- `clearSelection`: Function to clear all selections

**Used by**: Seat selection page in booking flow
**State**: Local state only (no API calls)

---

## Contexts - Global State Management

**What are Contexts?**: React Contexts are like global variables that any component can access. Instead of passing data down through many component layers, you can access it directly.

### `AuthContext` - User Authentication

**What it does**: Manages user login state across the entire app
**Provides**:

- `user`: Current logged-in user info (name, email, etc.) or null if not logged in
- `isAuthenticated`: Simple true/false - is someone logged in?
- `isLoading`: True while checking if user is logged in (on app startup)
- `login()`: Function to log in a user
- `logout()`: Function to log out a user
- `checkAuthStatus()`: Function to check if user is still logged in

**How login works**:

1. User enters email/password
2. Calls `authAPI.login()` to send credentials to backend
3. Backend returns JWT token and user info
4. Stores token in browser storage (localStorage or sessionStorage)
5. Updates `user` and `isAuthenticated` state

**Used by**:

- `NavBar`: Shows "Join" button OR user menu based on login status
- `UserMenu`: Shows user name and logout option
- Protected routes: Redirects to login if not authenticated

### `RegistrationContext` - Multi-Step Registration

**What it does**: Manages data across the 3-step registration process
**Provides**:

- `currentStep`: Which step user is on (1, 2, or 3)
- `formData`: All the data collected so far
- `setFormData()`: Function to update form data
- `nextStep()`: Move to next step
- `prevStep()`: Go back to previous step
- `resetForm()`: Start over

**The 3 steps**:

1. **Step 1**: Email, password, confirm password
2. **Step 2**: First name, last name, phone number
3. **Step 3**: Payment info (optional - can be skipped)

**Used by**: All registration pages to share data between steps

### `FiltersContext` - Movie Search Filters

**What it does**: Stores selected filters for movie search AND manages global filter popup state
**Provides**:

- `selectedGenres`: Set of selected genres (Action, Comedy, etc.)
- `setSelectedGenres()`: Function to update selected genres
- `selectedDate`: Object with month, day, year for date filtering
- `setSelectedDate()`: Function to update selected date
- `isFiltersOpen`: Boolean - whether the global filter popup is open
- `setIsFiltersOpen(open)`: Function to open/close the global filter popup
- `resetFilters()`: Function to clear all filters

**How it works**:

1. User clicks filter button → calls `setIsFiltersOpen(true)`
2. FiltersPopUp is rendered globally via `createPortal` into `document.body`
3. User selects genres/dates → stored in context
4. When user searches, `useSearchLogic()` reads these filters
5. Search API call includes the selected filters

**Architecture**:

- Uses `createPortal` to render FiltersPopUp globally
- Popup state managed in context (not local component state)
- Single popup instance shared across entire app
- Full-screen blur overlay when open

**Used by**:

- `FiltersPopUp`: Reads and sets the filter values
- `NavBar`: Calls `setIsFiltersOpen(true)` to open popup
- `MoviesSearchSection`: Calls `setIsFiltersOpen(true)` to open popup
- `useSearchLogic()`: Reads filter values for search

---

## React Query & useRef Patterns

### React Query (`useQuery`) - What is it?

**Simple Explanation**: React Query is like a smart cache for API calls. Instead of manually managing loading states and caching, it handles everything automatically.

**What it does**:

- **Caches data**: If you fetch the same data twice, it returns cached version instead of making another API call
- **Background updates**: Keeps data fresh by refetching in the background
- **Loading states**: Automatically provides loading, error, and success states
- **Deduplication**: If multiple components request the same data, it only makes one API call

**Setup**: Already configured in the app with 5-minute cache duration and 3 retry attempts

#### Movie Dates Query - Real Example

**Where it's used**: `SelectedMovie.tsx` (when you click on a movie card)
**What it does**: Fetches available show dates for a specific movie
**Query Key**: `['movie-dates', movie.movie_id]` - This is like a unique ID for this specific query
**API Call**: `GET /api/movies/{movieId}/dates`
**What you get back**:

- `data`: Array of available dates
- `isLoading`: True while fetching, false when done
- `error`: Error message if something went wrong
  **Smart behavior**: Only fetches when a movie is actually selected (not on empty state)

#### Movie Showtimes Query - Real Example

**Where it's used**: `SelectedMovieShowtimes.tsx` (after you pick a date)
**What it does**: Fetches available showtimes for the selected date
**Query Key**: `['movie-times', movie.movie_id, currentDate]` - Changes when date changes
**API Call**: `GET /api/movies/{movieId}/times?date=YYYY-MM-DD`
**What you get back**: Array of available showtimes for that date
**Smart behavior**: Only fetches when both movie AND date are selected

### useRef Patterns - What is it?

**Simple Explanation**: `useRef` is like a box that remembers a value between renders, but doesn't cause the component to re-render when the value changes.

**When to use it**:

- Store values that need to persist but don't affect the UI
- Prevent duplicate actions
- Store references to DOM elements or timers

#### Duplicate Request Prevention - Real Example

**Problem**: User clicks search button multiple times quickly → Multiple API calls
**Solution**: Store the last search in `useRef` and skip if it's the same
**Code**: `const lastSearchRef = useRef<string>('')`
**How it works**:

1. User searches for "action movies"
2. `lastSearchRef.current = "action movies"`
3. User clicks search again for "action movies"
4. Check: Is "action movies" === lastSearchRef.current? Yes → Skip API call
5. User searches for "comedy movies"
6. Check: Is "comedy movies" === lastSearchRef.current? No → Make API call

#### Component State Persistence - Real Example

**Problem**: Component needs to remember a timer or interval between renders
**Solution**: Store timer ID in `useRef`
**Code**: `const timeoutRef = useRef<NodeJS.Timeout>()`
**How it works**:

1. Set a timer: `timeoutRef.current = setTimeout(...)`
2. Component re-renders (timer ID is preserved)
3. Clean up timer: `clearTimeout(timeoutRef.current)`

---

## Performance Patterns

### Context Optimizations

#### AuthContext Memoization

```typescript
// CACHES: Function reference - persists across AuthProvider re-renders
// CHANGES: Never (empty deps) - BUT recreates if AuthProvider unmounts/remounts
// WITHOUT useCallback: New reference every re-render → useMemo recreates context → all auth consumers re-render
// WHY MATTERS: Prevents context recreation cascade
const checkAuthStatus = useCallback(() => {
  /* ... */
}, []);

// CACHES: Context value object - persists across AuthProvider re-renders
// CHANGES: When user, isLoading, or function references change - BUT recreates if AuthProvider unmounts/remounts
// WITHOUT useMemo: New object every re-render → all auth consumers re-render (NavBar, protected routes, etc.)
// WHY MATTERS: Prevents cascading re-renders across entire auth component tree
const contextValue = useMemo(
  () => ({
    /* ... */
  }),
  [user, isLoading, login, logout, checkAuthStatus]
);
```

### FiltersContext Memoization

```typescript
// CACHES: resetFilters function reference - persists across FiltersProvider re-renders
// CHANGES: Never (empty deps) - BUT recreates if FiltersProvider unmounts/remounts
// WHY MATTERS: Prevents function recreation on every re-render
const resetFilters = useCallback(() => {
  setSelectedGenres(new Set());
  setSelectedDate({ month: "", day: "", year: "" });
}, []);

// CACHES: Context value object - persists across FiltersProvider re-renders
// CHANGES: When selectedGenres, selectedDate, isFiltersOpen, or resetFilters change
// WITHOUT useMemo: New object every re-render → all filter consumers re-render
// WHY MATTERS: Prevents cascading re-renders across entire filter component tree
const contextValue = useMemo(
  () => ({
    selectedGenres,
    setSelectedGenres,
    selectedDate,
    setSelectedDate,
    isFiltersOpen,
    setIsFiltersOpen,
    resetFilters,
  }),
  [selectedGenres, selectedDate, isFiltersOpen, resetFilters]
);
```

### Component Optimizations

#### MovieCard Memoization

```typescript
// CACHES: Genres array - persists across MovieCard re-renders
// CHANGES: Never (movie.genres is static) - BUT recreates if MovieCard unmounts/remounts or movie prop changes
// WITHOUT useMemo: Array recreated on every re-render (hover, click, parent changes)
// WHY MATTERS: Minimal - string split is fast, mostly unnecessary optimization
const genresArray = useMemo(() => movie.genres.split(", "), [movie.genres]);
```

### Hook Optimizations

#### useMovies Hook Memoization

```typescript
// CACHES: fetchMovies function reference - persists across useMovies hook re-runs
// CHANGES: When activeTab changes (user switches tabs) - BUT recreates if useMovies hook unmounts/remounts
// WITHOUT useCallback: New reference every re-render → useEffect runs on every Home component re-render → unnecessary API calls
// WHY MATTERS: Prevents unnecessary API calls and useEffect re-runs
const fetchMovies = useCallback(async () => {
  /* ... */
}, [activeTab]);
```

---

## Development Patterns

### React Query Integration

**Setup**: 5-minute staleTime, 10-minute gcTime, 3 retries
**Usage**: Movie dates/times with dependency-based enabling
**Benefits**: Automatic caching, background refetching, deduplication

### Search Duplicate Prevention

**Pattern**: `useRef` to track last search string
**Implementation**: Skip `router.push` if identical query string
**Used by**: `useSearchLogic` for search functionality

### Error Handling

**API Pattern**: Try/catch with HTTP status checking
**Component Pattern**: Error boundaries for React error catching
**User Experience**: Graceful fallbacks with error messages

### CORS Configuration

**Location**: `SecurityConfig.java`
**Setup**: Allows localhost:3000-3002, all methods, credentials enabled
**Purpose**: Handle pre-flight OPTIONS requests before authentication

---

This reference provides specific, concise information about API usage, component behavior, hook functionality, and performance patterns without verbose explanations.
